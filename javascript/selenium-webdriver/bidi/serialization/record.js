// Licensed to the Software Freedom Conservancy (SFC) under one
// or more contributor license agreements.  See the NOTICE file
// distributed with this work for additional information
// regarding copyright ownership.  The SFC licenses this file
// to you under the Apache License, Version 2.0 (the
// "License"); you may not use this file except in compliance
// with the License.  You may obtain a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing,
// software distributed under the License is distributed on an
// "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
// KIND, either express or implied.  See the License for the
// specific language governing permissions and limitations
// under the License.

const { register, resolve } = require('./registry')

class ValidationError extends Error {}

// Validates a *present* value against a resolved type node. This check is
// identical for outbound and inbound — a structurally wrong value is always
// an error, whether it's being sent or received. Only presence (required)
// and extras (undeclared properties) differ by direction, handled separately
// in the constructor and fromWire() below.
// `direction` only affects how a nested ref-to-record/union is itself validated.
function validateValue(typeNode, value, path, direction) {
  if (value === null) {
    if (typeNode.nullable) return
    throw new ValidationError(`${path}: null is not allowed`)
  }

  if (typeNode.primitive !== undefined) {
    const expected = { string: 'string', integer: 'number', number: 'number', boolean: 'boolean' }[typeNode.primitive]
    if (expected && typeof value !== expected) {
      throw new ValidationError(`${path}: expected ${typeNode.primitive}, got ${typeof value}`)
    }
    // `number` admits any JSON number; `integer` rejects a fractional value
    // (5.7) while still accepting one written 5.0 (Number.isInteger(5.0) is true).
    if (typeNode.primitive === 'integer' && !Number.isInteger(value)) {
      throw new ValidationError(`${path}: expected an integer, got ${value}`)
    }
    return
  }

  if (typeNode.const !== undefined) {
    if (value !== typeNode.const) {
      throw new ValidationError(
        `${path}: expected constant ${JSON.stringify(typeNode.const)}, got ${JSON.stringify(value)}`,
      )
    }
    return
  }

  if (typeNode.enum !== undefined) {
    if (!typeNode.enum.includes(value)) {
      throw new ValidationError(
        `${path}: "${value}" is not a valid value; expected one of: ${typeNode.enum.join(', ')}`,
      )
    }
    return
  }

  if (typeNode.list !== undefined) {
    if (!Array.isArray(value)) {
      throw new ValidationError(`${path}: expected a list, got ${typeof value}`)
    }
    value.forEach((item, i) => validateValue(typeNode.list, item, `${path}[${i}]`, direction))
    return
  }

  if (typeNode.map !== undefined) {
    if (typeof value !== 'object' || Array.isArray(value) || value === null) {
      throw new ValidationError(`${path}: expected an object, got ${typeof value}`)
    }
    for (const [key, entry] of Object.entries(value)) {
      validateValue(typeNode.map, entry, `${path}.${key}`, direction)
    }
    return
  }

  if (typeNode.ref !== undefined) {
    const referenced = resolve(typeNode.ref)
    if (referenced === undefined) return // not yet registered — best-effort, skip deep validation

    if (referenced.kind === 'enum') {
      if (!referenced.includes(value)) {
        throw new ValidationError(
          `${path}: "${value}" is not a valid ${typeNode.ref} value; expected one of: ${referenced.values.join(', ')}`,
        )
      }
      return
    }

    if (referenced.kind === 'record') {
      if (value instanceof referenced.RecordClass) return // already validated
      if (typeof value !== 'object' || Array.isArray(value) || value === null) {
        throw new ValidationError(`${path}: expected an object, got ${typeof value}`)
      }
      // Recurse through the same-direction path so a nested field gets the
      // same tolerance (inbound) or strictness (outbound) as its parent.
      if (direction === 'inbound') {
        referenced.RecordClass.fromWire(value)
      } else {
        new referenced.RecordClass(value)
      }
      return
    }

    if (referenced.kind === 'union') {
      if (direction === 'inbound') {
        referenced.fromWire(value)
      } else {
        referenced.build(value)
      }
      return
    }

    if (referenced.kind === 'alias') {
      validateValue(referenced.type, value, path, direction)
      return
    }

    return
  }

  if (typeNode.union !== undefined) {
    const errors = []
    for (const variant of typeNode.union) {
      try {
        validateValue(variant, value, path, direction)
        return
      } catch (err) {
        errors.push(err.message)
      }
    }
    throw new ValidationError(`${path}: value did not match any variant (${errors.join('; ')})`)
  }
}

/**
 * @param {string} name Schema type name, e.g. 'network.AddInterceptParameters'.
 * @param {Array<{name: string, wire: string, required: boolean, type: object}>} fields
 * @param {{extensible?: boolean}} [options]
 */
function defineRecord(name, fields, options = {}) {
  const { extensible = false } = options
  const byWire = new Map(fields.map((f) => [f.wire, f]))

  class Record {
    // Outbound: strict. Any value that doesn't match its declared shape is an error here.
    constructor(data) {
      if (typeof data !== 'object' || data === null || Array.isArray(data)) {
        throw new ValidationError(`${name}: expected an object`)
      }

      for (const field of fields) {
        if (!Object.hasOwn(data, field.wire)) {
          if (field.required) {
            throw new ValidationError(`${name}.${field.wire}: required field is missing`)
          }
          continue
        }
        const value = data[field.wire]
        validateValue(field.type, value, `${name}.${field.wire}`, 'outbound')
        this[field.name] = value
      }

      for (const wireKey of Object.keys(data)) {
        if (byWire.has(wireKey)) continue
        if (!extensible) {
          throw new ValidationError(`${name}: unknown property "${wireKey}"`)
        }
        // Object.defineProperty, not `this[wireKey] = ...`: wireKey is caller-supplied
        // and a literal "__proto__" key assigned via bracket notation hijacks this
        // instance's actual prototype instead of becoming a field (CWE-1321).
        // defineProperty always creates a genuine own data property, regardless of name.
        Object.defineProperty(this, wireKey, {
          value: data[wireKey], // vendor extras reach the wire on an extensible type
          enumerable: true,
          writable: true,
          configurable: true,
        })
      }

      Object.freeze(this)
    }

    // Inbound: tolerant of undeclared properties, but a missing required field
    // is rejected just like a structurally invalid value — omission used to be
    // tolerated here, but that's no longer required.
    // Bypasses the constructor above entirely — a single constructor enforcing
    // both directions symmetrically would make tolerated undeclared-property
    // retention impossible.
    static fromWire(payload) {
      if (typeof payload !== 'object' || payload === null || Array.isArray(payload)) {
        throw new ValidationError(`${name}: expected an object on the wire, got ${typeof payload}`)
      }

      const instance = Object.create(Record.prototype)

      for (const field of fields) {
        if (!Object.hasOwn(payload, field.wire)) {
          if (field.required) {
            throw new ValidationError(`${name}.${field.wire}: required field is missing`)
          }
          continue // left genuinely absent, optional field
        }
        const value = payload[field.wire]
        // A present value's shape is never tolerated, inbound or outbound.
        validateValue(field.type, value, `${name}.${field.wire}`, 'inbound')
        instance[field.name] = value
      }

      for (const wireKey of Object.keys(payload)) {
        if (byWire.has(wireKey)) continue
        // An extensible type preserves an undeclared field silently — no narrower
        // criterion than "extensible" itself (not, say, only fields that happen to be
        // sendable back on some other type). A non-extensible type warns and drops it
        // instead — the warning belongs only to the drop, not the retention.
        if (extensible) {
          // Object.defineProperty, not `instance[wireKey] = ...` — see the matching
          // comment in the constructor above: a literal "__proto__" key from an
          // untrusted wire payload must become a field, not swap the prototype (CWE-1321).
          Object.defineProperty(instance, wireKey, {
            value: payload[wireKey],
            enumerable: true,
            writable: true,
            configurable: true,
          })
        } else {
          process.emitWarning(`${name}: undeclared property "${wireKey}"`, 'BiDiSchemaWarning')
        }
      }

      Object.freeze(instance)
      return instance
    }
  }

  Object.defineProperty(Record, 'name', { value: name })
  register(name, { kind: 'record', RecordClass: Record })
  return Record
}

/**
 * Registers a schema `alias` — a name with no fields of its own, just a
 * pointer to another type node (e.g. `network.Intercept` aliasing a plain
 * string). A ref to an alias validates through the aliased type node.
 * @param {string} name
 * @param {object} type The schema's `type` node this name aliases.
 */
function defineAlias(name, type) {
  register(name, { kind: 'alias', type })
}

module.exports = { defineRecord, defineAlias, ValidationError }
