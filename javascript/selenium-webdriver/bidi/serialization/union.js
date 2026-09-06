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
const { ValidationError } = require('./record')

// Resolves the variant ref a value/payload matches, per the schema's selector shape:
//   { by, variants: [{value, ref}], default? } - discriminated: match `data[by]` against
//     each variant's value.
//   { ordered: [{ref, requires}] }              - structural: first variant whose `requires`
//     keys are all present in `data`, in spec order.
function selectVariant(selector, data, hasKey) {
  if (selector.by) {
    const tag = hasKey(data, selector.by) ? data[selector.by] : undefined
    const match = selector.variants.find((v) => v.value === tag)
    if (match) return match.ref
    return selector.default
  }
  if (selector.ordered) {
    for (const variant of selector.ordered) {
      if (variant.requires.every((key) => hasKey(data, key))) return variant.ref
    }
    return undefined
  }
  return undefined // correlated: resolved by request id elsewhere, not from the payload
}

/**
 * Registers a schema `union` — a value that may be any one of several variant
 * record types, resolved by a discriminator field or by structural shape.
 * @param {string} name Schema type name, e.g. 'session.ProxyConfiguration'.
 * @param {object} selector The schema's `selector` node for this union.
 * @param {{objectOnly?: boolean}} [options]
 * @returns {{build: function(unknown): object, fromWire: function(unknown): object}}
 *   The registered union — `build(data)` resolves and constructs the matching
 *   variant outbound, `fromWire(payload)` resolves and parses it inbound.
 */
function defineUnion(name, selector, options = {}) {
  const { objectOnly = false } = options

  const union = {
    kind: 'union',

    // Outbound: resolve which variant `data` describes, then delegate to that
    // variant's own (strict) constructor. A discriminated selector's `default`
    // catch-all can itself resolve to another union — not just a record — e.g.
    // LocalValue's untyped RemoteReference arm (see unionSelector() in
    // project_bidi_schema.mjs) — so recurse through that union's own dispatch
    // rather than assuming every resolved ref is a record.
    build(data) {
      if (objectOnly && (typeof data !== 'object' || data === null || Array.isArray(data))) {
        throw new ValidationError(`${name}: expected an object`)
      }
      const ref = selectVariant(selector, data, (d, key) => Object.hasOwn(d, key))
      if (ref === undefined) {
        throw new ValidationError(`${name}: value does not match any known variant`)
      }
      const variant = resolve(ref)
      if (variant.kind === 'union') {
        return variant.build(data)
      }
      return new variant.RecordClass(data)
    },

    // Inbound: resolve which variant `payload` matches. An unresolvable payload is a
    // closed-vocabulary miss — always an error, never a warning, since there is no
    // valid typed object to fall back to. Same nested-union case as build() above.
    fromWire(payload) {
      if (objectOnly && (typeof payload !== 'object' || payload === null || Array.isArray(payload))) {
        throw new ValidationError(`${name}: expected an object on the wire, got ${typeof payload}`)
      }
      const ref = selectVariant(selector, payload, (d, key) => Object.hasOwn(d, key))
      if (ref === undefined) {
        throw new ValidationError(`${name}: received a variant not in this binding's BiDi schema`)
      }
      const variant = resolve(ref)
      if (variant.kind === 'union') {
        return variant.fromWire(payload)
      }
      return variant.RecordClass.fromWire(payload)
    },
  }

  register(name, union)
  return union
}

module.exports = { defineUnion }
