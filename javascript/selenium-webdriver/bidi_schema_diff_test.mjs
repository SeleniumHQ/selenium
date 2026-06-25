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

/**
 * Differential fidelity check against cddl2ts.
 *
 * cddl2ts independently emits TypeScript types from the same AST, so it is an
 * oracle for what each type should contain. This compares the projected schema
 * to cddl2ts and fails on any difference that is not explicitly allowlisted —
 * catching dropped/extra fields, field-type drift (optional/nullable/array) and
 * enum drift, the class of bug the structural validators (checkSchema /
 * checkCompleteness) cannot see.
 *
 * Mocha test; `describe`/`it` are mocha globals. It runs against the *generated*
 * schema artifact (and the AST, for cddl2ts) declared as Bazel data and read
 * relative to the package dir via chdir — so the test depends on, and therefore
 * exercises, the schema-generation CLI rather than re-projecting in-process.
 * Intentional differences live in KNOWN_DIFFERENCES with a reason; the check
 * flags an allowlist entry as stale once the difference disappears, so the list
 * cannot silently rot.
 */

import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { transform } from 'cddl2ts'

// Intentional, reviewed divergences from cddl2ts, keyed by schema type name.
// `fields` are field names cddl2ts has that we deliberately do not (because we
// keep the wire-faithful name, or nest them under a hoisted inline-record type).
const KNOWN_DIFFERENCES = {
  // We preserve the wire name `namespaceURI`; cddl2ts mangles it to namespaceUri.
  'script.NodeProperties': { fields: ['namespaceUri'], reason: 'wire-faithful name namespaceURI' },
}

// Union types whose collective field set intentionally differs from cddl2ts.
const UNION_DIFFERENCES = {
  // The top-level protocol envelope composes the EventData union; method/params
  // live on the individual event types here, not on the envelope.
  Message: { fields: ['method', 'params'], reason: 'envelope composes EventData union' },
}

// Composed records (cddl2ts `Base & {...}` intersection aliases) whose field set
// intentionally differs. The Command/Event protocol envelopes compose the
// Command/Event data unions, whose method/params live on the leaf types here.
const RECORD_ALIAS_DIFFERENCES = {
  Command: { fields: ['method', 'params'], reason: 'envelope composes CommandData union' },
  Event: { fields: ['method', 'params'], reason: 'envelope composes EventData union' },
}

// Fields cddl2ts reports as nullable that we intentionally do not. The cddl parser
// strips the quotes from the reserved word `"null"`, so cddl2ts reads NullValue's
// string-literal tag `type: "null"` as the JSON null type; we correctly project it
// as the string const "null" (the real wire discriminator), so it is not nullable.
const NULLABLE_DIFFERENCES = {
  'script.NullValue': { fields: ['type'], reason: 'quoted "null" tag, not the null type' },
}

/** dotted CDDL name → cddl2ts PascalCase name (mirrors normalizeDottedName). */
function tsName(name) {
  return name
    .split('.')
    .map((part) => {
      const titled = part.charAt(0).toUpperCase() + part.slice(1)
      return titled.replace(/([A-Z]{2,})(?=[A-Z][a-z]|$)/g, (m) => m[0] + m.slice(1).toLowerCase())
    })
    .join('')
}

const OPEN = '{(['
const CLOSE = '})]'

/** Slice the brace-balanced body following the `{` at `from` (exclusive of braces). */
function balancedBody(ts, from) {
  let depth = 1
  let i = from
  while (i < ts.length && depth > 0) {
    if (OPEN.includes(ts[i])) depth++
    else if (CLOSE.includes(ts[i])) depth--
    i++
  }
  return { body: ts.slice(from, i - 1), end: i }
}

/** Remove the contents of nested `{...}` blocks, keeping tokens outside them. */
function stripObjectBodies(s) {
  let out = ''
  let depth = 0
  for (const c of s) {
    if (c === '{') depth++
    else if (c === '}') depth--
    else if (depth === 0) out += c
  }
  return out
}

/** Parse the top-level fields of an interface body (nested object types ignored). */
function topLevelFields(body) {
  const fields = {}
  let i = 0
  let depth = 0
  while (i < body.length) {
    if (OPEN.includes(body[i])) {
      depth++
      i++
      continue
    }
    if (CLOSE.includes(body[i])) {
      depth--
      i++
      continue
    }
    const m = depth === 0 ? /^(\w+)(\??):\s*/.exec(body.slice(i)) : null
    if (!m) {
      i++
      continue
    }
    let j = i + m[0].length
    let d = 0
    while (j < body.length && !(d === 0 && body[j] === ';')) {
      if (OPEN.includes(body[j])) d++
      else if (CLOSE.includes(body[j])) d--
      j++
    }
    const type = body.slice(i + m[0].length, j).trim()
    // Detect the field's own nullability/array-ness from its type with nested
    // object bodies removed, so `null`/`[]` belonging to nested fields (e.g. an
    // inline `{ x: T | null }`) are not attributed to this field.
    const shallow = stripObjectBodies(type)
    fields[m[1]] = { optional: m[2] === '?', nullable: /\bnull\b/.test(shallow), array: /\[\]/.test(shallow) }
    i = j + 1
  }
  return fields
}

/** Parse cddl2ts output into { interfaces, enums, aliases }. */
function parseCddl2ts(ts) {
  const interfaces = {}
  for (const m of ts.matchAll(/export interface (\w+)\s*\{/g)) {
    const { body } = balancedBody(ts, m.index + m[0].length)
    interfaces[m[1]] = topLevelFields(body)
  }
  const aliases = {} // name → raw RHS expression (for union/intersection types)
  for (const m of ts.matchAll(/export type (\w+) = /g)) {
    let i = m.index + m[0].length
    let depth = 0
    const start = i
    while (i < ts.length && !(depth === 0 && ts[i] === ';')) {
      if (OPEN.includes(ts[i])) depth++
      else if (CLOSE.includes(ts[i])) depth--
      i++
    }
    aliases[m[1]] = ts.slice(start, i)
  }
  // Enums are the aliases whose RHS is a pure string-literal union. Derived from
  // the parsed aliases (linear) rather than a nested-quantifier regex.
  const enums = {}
  for (const [name, expr] of Object.entries(aliases)) {
    const parts = splitTopLevel(expr, '|').map((p) => p.trim())
    if (parts.length && parts.every((p) => /^"[^"]*"$/.test(p))) enums[name] = new Set(parts.map((p) => p.slice(1, -1)))
  }
  return { interfaces, enums, aliases }
}

/** Split `expr` on `sep` at bracket depth 0. */
function splitTopLevel(expr, sep) {
  const parts = []
  let depth = 0
  let cur = ''
  for (const c of expr) {
    if (OPEN.includes(c)) depth++
    else if (CLOSE.includes(c)) depth--
    if (c === sep && depth === 0) {
      parts.push(cur)
      cur = ''
    } else cur += c
  }
  parts.push(cur)
  return parts
}

/**
 * Collect the flattened field names a cddl2ts union/intersection expression
 * contributes: `& {...}` common objects, inline-object members, and named
 * members resolved through interfaces and (recursively) composition aliases.
 */
function expectedUnionFields(expr, parsed, fields = new Set(), seen = new Set()) {
  let stripped = ''
  let i = 0
  while (i < expr.length) {
    if (expr[i] === '&') {
      let j = i + 1
      while (j < expr.length && /\s/.test(expr[j])) j++
      if (expr[j] === '{') {
        const { body, end } = balancedBody(expr, j + 1)
        Object.keys(topLevelFields(body)).forEach((f) => fields.add(f))
        i = end
        continue
      }
    }
    stripped += expr[i]
    i++
  }
  for (let part of splitTopLevel(stripped, '|')) {
    part = part.trim()
    if (part.startsWith('(')) expectedUnionFields(balancedBody(part, 1).body, parsed, fields, seen)
    else if (part.startsWith('{')) Object.keys(topLevelFields(balancedBody(part, 1).body)).forEach((f) => fields.add(f))
    else {
      const id = part.match(/^([A-Za-z]\w*)/)?.[1]
      if (!id || seen.has(id)) continue
      seen.add(id)
      if (parsed.interfaces[id]) Object.keys(parsed.interfaces[id]).forEach((f) => fields.add(f))
      else if (parsed.aliases[id]) expectedUnionFields(parsed.aliases[id], parsed, fields, seen)
    }
  }
  return fields
}

/** Collect the flattened field names a schema type contributes (through unions and aliases). */
function schemaTypeFields(name, types, fields = new Set(), seen = new Set()) {
  if (seen.has(name)) return fields
  seen.add(name)
  const t = types[name]
  if (!t) return fields
  if (t.kind === 'record') t.fields.forEach((f) => fields.add(f.name))
  else if (t.kind === 'union') t.variants.forEach((v) => schemaTypeFields(v, types, fields, seen))
  else if (t.kind === 'alias' && t.type?.ref) schemaTypeFields(t.type.ref, types, fields, seen)
  return fields
}

/**
 * Compare the generated schema against the cddl2ts oracle.
 * @param {object} schema The generated schema artifact (`{commands, events, types}`).
 * @param {object[]} ast The parsed CDDL AST (fed to cddl2ts).
 * @returns {string[]} Difference messages; empty means the schema matches cddl2ts.
 */
function diffAgainstCddl2ts(schema, ast) {
  const parsed = parseCddl2ts(transform(ast))
  const { interfaces, enums, aliases } = parsed
  const errors = []

  for (const [name, node] of Object.entries(schema.types)) {
    if (node.kind === 'record') {
      const oracle = interfaces[tsName(name)]
      if (!oracle) {
        const alias = aliases[tsName(name)]
        if (alias?.includes('&')) {
          // A composed record cddl2ts emits as `Base & {...}` — field-compare it,
          // so a dropped composition (e.g. an un-flattened base type) is caught.
          const expected = expectedUnionFields(alias, parsed)
          const mine = new Set(node.fields.map((f) => f.name))
          const allow = new Set(RECORD_ALIAS_DIFFERENCES[name]?.fields ?? [])
          const missing = [...expected].filter((f) => !mine.has(f) && !allow.has(f))
          if (missing.length) errors.push(`${name}: composed record missing fields cddl2ts has: ${missing.join(', ')}`)
        } else if (node.fields.length === 0 && !node.map && !node.extensible && alias) {
          // A fieldless record where cddl2ts emits a list/union alias means the
          // element type was dropped (e.g. a top-level `[*T]` or `a // b`).
          errors.push(
            `${name}: projected as an empty record but cddl2ts emits a type alias (dropped list/union element type)`,
          )
        }
        continue
      }
      const oracleNames = Object.keys(oracle)
      const mine = new Map(node.fields.map((f) => [f.name, f]))
      const allow = new Set(KNOWN_DIFFERENCES[name]?.fields ?? [])
      const missing = oracleNames.filter((f) => !mine.has(f) && !allow.has(f))
      const stale = [...allow].filter((f) => mine.has(f) || !(f in oracle))
      if (missing.length) errors.push(`${name}: missing fields cddl2ts has: ${missing.join(', ')}`)
      if (stale.length) errors.push(`${name}: stale KNOWN_DIFFERENCES fields (resolved, remove): ${stale.join(', ')}`)
      // Type fidelity for fields present in both: optional / nullable / array.
      const allowNullable = new Set(NULLABLE_DIFFERENCES[name]?.fields ?? [])
      for (const [fname, field] of mine) {
        const o = oracle[fname]
        if (!o) continue
        if (o.optional === field.required)
          errors.push(
            `${name}.${fname}: optional mismatch (cddl2ts optional=${o.optional}, schema required=${field.required})`,
          )
        if (o.nullable && !field.type?.nullable && !allowNullable.has(fname))
          errors.push(`${name}.${fname}: cddl2ts is nullable, schema is not`)
        if (field.type?.nullable && !o.nullable && !allowNullable.has(fname))
          errors.push(`${name}.${fname}: schema is nullable, cddl2ts is not`)
        if (o.array && !field.type?.list) errors.push(`${name}.${fname}: cddl2ts is array, schema is not`)
      }
      const staleNullable = [...allowNullable].filter((f) => !oracle[f]?.nullable || mine.get(f)?.type?.nullable)
      if (staleNullable.length)
        errors.push(`${name}: stale NULLABLE_DIFFERENCES (resolved, remove): ${staleNullable.join(', ')}`)
    } else if (node.kind === 'enum') {
      const oracle = enums[tsName(name)]
      if (!oracle) continue // hoisted/synthetic enums have no named cddl2ts counterpart
      const mine = new Set(node.values)
      const missing = [...oracle].filter((v) => !mine.has(v))
      const extra = [...mine].filter((v) => !oracle.has(v))
      if (missing.length || extra.length)
        errors.push(`${name}: enum values differ (cddl2ts-only: [${missing}], schema-only: [${extra}])`)
    } else if (node.kind === 'union') {
      const alias = aliases[tsName(name)]
      if (!alias) continue // cddl2ts represents it some other way; nothing to compare
      const expected = expectedUnionFields(alias, parsed)
      const mine = schemaTypeFields(name, schema.types)
      const allow = new Set(UNION_DIFFERENCES[name]?.fields ?? [])
      const missing = [...expected].filter((f) => !mine.has(f) && !allow.has(f))
      const extra = [...mine].filter((f) => !expected.has(f))
      const stale = [...allow].filter((f) => mine.has(f) || !expected.has(f))
      if (missing.length) errors.push(`${name}: union missing fields cddl2ts has: ${missing.join(', ')}`)
      if (extra.length) errors.push(`${name}: union has fields cddl2ts does not: ${extra.join(', ')}`)
      if (stale.length) errors.push(`${name}: stale UNION_DIFFERENCES (resolved, remove): ${stale.join(', ')}`)
    } else if (node.kind === 'alias' && node.type?.list) {
      // A list alias must correspond to a cddl2ts array; otherwise an element
      // type was lost (the same class as the empty-record list bug).
      const alias = aliases[tsName(name)]
      if (alias !== undefined && !alias.includes('[]'))
        errors.push(`${name}: projected as a list but cddl2ts is not an array (${alias.slice(0, 40)})`)
    }
  }

  // Stale whole-type allowlist entries (the type no longer exists / is no longer a record).
  for (const name of Object.keys(KNOWN_DIFFERENCES)) {
    if (!(name in schema.types)) errors.push(`stale KNOWN_DIFFERENCES type (gone, remove): ${name}`)
  }
  return errors
}

describe('BiDi schema vs cddl2ts oracle', () => {
  it('matches cddl2ts on record fields, field types, enum values, and union members', () => {
    const schema = JSON.parse(readFileSync('create-bidi-src_schema.json', 'utf8'))
    const ast = JSON.parse(readFileSync('create-bidi-src_ast.json', 'utf8'))
    assert.deepEqual(diffAgainstCddl2ts(schema, ast), [])
  })
})
