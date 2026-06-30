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
 * Project the normalized BiDi AST + command/event model into one flat,
 * binding-neutral schema for the generated Ruby / Java / Python clients.
 * The normalizer has already removed the awkward CDDL shapes, so this is a
 * straight mapping into a small vocabulary:
 *
 *   type node:  { kind: 'record', fields: [field], map?, extensible? }
 *             | { kind: 'enum',   values: [string] }
 *             | { kind: 'union',  variants: [ref], selector }
 *             | { kind: 'alias',  type }
 *   selector:   { by, variants: [{ value, ref }], default? }   // discriminated
 *             | { ordered: [{ ref, requires: [key] }] }        // structural, spec order
 *             | { correlated: true }                           // resolved by request id, not the payload
 *   field:      { name, wire, required, type }
 *   type ref:   { primitive } | { const } | { ref } | { enum } | { list } | { map, extensible? } | { union }
 *               any ref may also carry `nullable: true` (a `/ null` alternative). On a
 *               record node, `map` is the value type of `* key => value` entries and
 *               `extensible: true` marks an open `* text => any` record.
 *
 * Types the normalizer synthesized for anonymous CDDL constructs additionally
 * carry `{ synthetic: true, owner, label }`: `owner` is the type the construct
 * was lifted out of and `label` is the member name within it, so a binding can
 * keep the flat name or nest it (e.g. `Owner::Label`) without parsing the key.
 */

import { pathToFileURL } from 'node:url'
import { normalizeAst } from './normalize_bidi_ast.mjs'

// Note: the CDDL has no prose-only "exactly one of" constraints — every
// mutual-exclusivity case (e.g. session.unsubscribe) is a CDDL choice, which the
// normalizer turns into a `union`. A scan of all spec comments confirms none, so
// no separate constraint representation is carried.

// Events that parse into the AST but are not wired into the model because the
// upstream bluetooth spec does not fully define them. This is an external spec
// issue, not a Selenium/buildModel bug, and is intentionally not fixed here.
// Allowlisted so it does not fail the build; checkCompleteness() flags an entry
// as stale once it becomes emitted (e.g. after the spec is fixed upstream), so
// this list cannot silently rot.
const KNOWN_INCOMPLETE = new Set(['bluetooth.characteristicEventGenerated', 'bluetooth.descriptorEventGenerated'])

const PRIMITIVES = {
  text: 'string',
  tstr: 'string',
  uint: 'integer',
  int: 'integer',
  nint: 'integer',
  float: 'number',
  bool: 'boolean',
  null: 'null',
}
// CDDL prelude types surface as group refs but are builtins, not defined types.
const PRELUDE = {
  number: 'number',
  any: 'any',
  bytes: 'string',
  bstr: 'string',
  nil: 'null',
  tdate: 'string',
  uri: 'string',
}

const typeList = (t) => (Array.isArray(t) ? t : t === undefined || t === null ? [] : [t])
const isLiteral = (e) => e && typeof e === 'object' && e.Type === 'literal'
const isRef = (e) => e && typeof e === 'object' && e.Type === 'group' && typeof e.Value === 'string'

// A `null` keyword or a `nil` prelude ref in a union means the value may be null.
const isNullAlt = (e) =>
  e === 'null' || (e && typeof e === 'object' && e.Type === 'group' && PRELUDE[e.Value] === 'null')

function projectRef(type) {
  const all = typeList(type)
  // A missing type (undefined/empty input, e.g. a malformed array element or map
  // value) is not a `null` value — fail closed so checkSchema's unknown guard
  // catches it instead of silently producing a valid-looking `null`.
  if (all.length === 0) return { primitive: 'unknown' }
  const entries = all.filter((e) => !isNullAlt(e))
  // The only sole-`null` field in the spec is NullValue.type, whose CDDL source is
  // the quoted string literal "null" (its discriminator tag); the cddl parser strips
  // the quotes, collapsing it to the bareword null type. Genuine nullability is
  // always `X / null` (handled below), so a sole null here is that string tag.
  if (entries.length === 0) return { const: 'null' }
  const node =
    entries.length > 1
      ? entries.every(isLiteral)
        ? { enum: entries.map((e) => e.Value) }
        : { union: entries.map(projectEntry) }
      : projectEntry(entries[0])
  if (entries.length < all.length) node.nullable = true // a `null` alternative means the value may be null
  return node
}

function projectEntry(e) {
  if (typeof e === 'string') return { primitive: PRIMITIVES[e] ?? e }
  if (!e || typeof e !== 'object') return { primitive: 'unknown' }
  // A control operator (`.ge` / `.default` / `.le` …) wraps the real type as
  // `{ Type: <innerType>, Operator: {...} }`; the constraint does not change the
  // type, so project the inner type.
  if (e.Type && typeof e.Type === 'object') return projectEntry(e.Type)
  if (e.Type === 'literal') return { const: e.Value }
  if (e.Type === 'group' && e.Value) return e.Value in PRELUDE ? { primitive: PRELUDE[e.Value] } : { ref: e.Value }
  if (e.Type === 'group' && Array.isArray(e.Properties)) {
    // An inline group that only wraps anonymous ref(s) — e.g. a union arm
    // `{ DateLocalValue }` — is that ref (or a union of them), not a record.
    const refs = unionMemberRefs(e)
    if (refs) return refs.length === 1 ? { ref: refs[0] } : { union: refs.map((r) => ({ ref: r })) }
    return {
      record: e.Properties.flat()
        .filter((p) => p?.Name)
        .map(projectField),
    }
  }
  if (e.Type === 'array') return { list: projectRef(e.Values?.[0]?.Type) }
  if (e.Type === 'map') return { map: projectRef(e.ValueType ?? e.Values?.[0]?.Type), extensible: true }
  if (e.Type === 'range') {
    const intRange = Number.isInteger(e.Value?.Min?.Value) && Number.isInteger(e.Value?.Max?.Value)
    return { primitive: intRange ? 'integer' : 'number' } // e.g. js-uint (0..MAX) vs scale (0.1..2)
  }
  return { primitive: PRIMITIVES[e.Type] ?? 'unknown' }
}

function projectField(prop) {
  return { name: prop.Name, wire: prop.Name, required: (prop.Occurrence?.n ?? 1) >= 1, type: projectRef(prop.Type) }
}

// A group whose members are all anonymous refs (a top-level `a // b // c`
// choice, e.g. session.ProxyConfiguration, or a single-member dispatch root
// like LogEvent) carries those refs, not named fields. Returns the ref names,
// or null if it is a normal record.
function unionMemberRefs(def) {
  const flat = (def.Properties ?? []).flat()
  if (flat.length < 1) return null
  const refs = []
  for (const p of flat) {
    if (!p || typeof p !== 'object' || p.Name) return null
    const e = Array.isArray(p.Type) ? p.Type[0] : p.Type
    if (!e || e.Type !== 'group' || !e.Value) return null
    refs.push(e.Value)
  }
  return refs
}

function projectType(def) {
  if (def.Type === 'variable') {
    const pt = def.PropertyType ?? []
    if (pt.length && pt.every(isLiteral)) return { kind: 'enum', values: pt.map((e) => e.Value) }
    // A union of refs is a union even when some arms are inline groups wrapping a
    // ref (e.g. script.LocalValue's date/regexp arms): projectRef resolves those to
    // refs, so promote the all-ref result to a first-class union (it gets a selector)
    // rather than leaving it an alias-to-union the bindings would have to re-detect.
    const projected = projectRef(def.PropertyType)
    if (projected.union?.every((m) => m.ref) && !projected.nullable)
      return { kind: 'union', variants: projected.union.map((m) => m.ref) }
    return { kind: 'alias', type: projected }
  }
  if (def.Type === 'group') {
    const refs = unionMemberRefs(def)
    if (refs) return refs.length === 1 ? { kind: 'alias', type: { ref: refs[0] } } : { kind: 'union', variants: refs }
    return projectRecord(def)
  }
  // Top-level list/map (or any non-group, non-variable def) becomes an alias to
  // its element type, so the element type is not lost (e.g. script.ListLocalValue).
  return { kind: 'alias', type: projectEntry(def) }
}

/**
 * Project a CDDL group into a record. A property with `Occurrence.m === null` is
 * an unbounded entry (`* key => value`), not a scalar field: `* text => any` marks
 * the record extensible, `* text => T` becomes a typed map, and an unbounded group
 * spread is folded in. Everything else is a normal field.
 */
function projectRecord(def) {
  const record = { kind: 'record', fields: [] }
  for (const prop of (def.Properties ?? []).flat()) {
    if (!prop || typeof prop !== 'object') continue
    // `m === null` is overloaded in this parser: a key-typed entry is a map
    // (`* text => value`); an anonymous entry is a structural spread; everything
    // else is just an optional field (the `?` quantifier). Only the first two
    // are not real fields.
    if (prop.Occurrence?.m === null && (!prop.Name || prop.Name in PRIMITIVES || prop.Name in PRELUDE)) {
      if (prop.Name in PRIMITIVES || prop.Name in PRELUDE) {
        const value = projectRef(prop.Type)
        if (value.primitive === 'any') record.extensible = true
        else record.map = value
      }
      continue
    }
    if (prop.Name) record.fields.push(projectField(prop))
  }
  return record
}

const typeRef = (name) => (name ? { ref: name } : null)

// Map a command's method to the params type its normalized envelope record carries
// (skipping EmptyParams, which means no real params). This recovers params the
// model builder drops when a command declares an inline `params: { ... }` object
// instead of a named group ref (the normalizer hoists that object to a real type,
// but the model still records `params: null`).
function commandEnvelopeParams(types) {
  const params = new Map()
  for (const t of Object.values(types)) {
    if (t.kind !== 'record') continue
    const method = t.fields.find((f) => f.name === 'method' && f.type.const !== undefined)?.type.const
    const ref = t.fields.find((f) => f.name === 'params')?.type.ref
    if (method && ref && ref !== 'EmptyParams') params.set(method, ref)
  }
  return params
}

// Resolve a union member to its leaf record names, following nested unions and
// single-ref aliases. Every BiDi union bottoms out in records, so this is total.
function unionLeaves(ref, types, seen = new Set()) {
  if (seen.has(ref)) return []
  seen.add(ref)
  const t = types[ref]
  if (!t) return []
  if (t.kind === 'record') return [ref]
  if (t.kind === 'union') return t.variants.flatMap((v) => unionLeaves(v, types, seen))
  if (t.kind === 'alias' && t.type?.ref) return unionLeaves(t.type.ref, types, seen)
  return []
}

// The constant value a record pins on wire key `k`, as `{ value }` (a string or
// `null`), or `{ open: true }` when the field exists but is not constant (a base
// type acting as the catch-all, e.g. log.GenericLogEntry.type), or null when the
// key is absent.
function discriminatorValue(rec, k) {
  const f = rec.fields.find((x) => x.name === k)
  if (!f) return null
  if (f.type.const !== undefined) return { value: f.type.const }
  if (f.type.primitive === 'null') return { value: null }
  return { open: true }
}

// What an immediate union member contributes to a discriminator on `key`:
//   { tagged: [{ value, ref }] } — it (or, for a sub-union, each of its leaves)
//      pins a constant value on `key`; a clean tagged sub-union is flattened up.
//   { default: ref } — it carries no `key` (e.g. RemoteReference inside LocalValue)
//      or an open base type on `key` (e.g. log.GenericLogEntry): the catch-all.
//   null — it neither tags cleanly nor defaults cleanly, so `key` is not a usable
//      discriminator for this union.
function tagContribution(ref, key, types) {
  const t = types[ref]
  if (!t) return null
  if (t.kind === 'alias' && t.type?.ref) return tagContribution(t.type.ref, key, types)
  if (t.kind === 'record') {
    const d = discriminatorValue(t, key)
    if (!d || d.open) return { default: ref }
    return { tagged: [{ value: d.value, ref }] }
  }
  if (t.kind === 'union') {
    const leaves = unionLeaves(ref, types)
    const ds = leaves.map((l) => discriminatorValue(types[l], key))
    if (ds.every((d) => d?.value !== undefined))
      return { tagged: leaves.map((l, i) => ({ value: ds[i].value, ref: l })) }
    if (ds.every((d) => d === null)) return { default: ref } // a whole sub-union with no `key` at all
    return null
  }
  return null
}

/**
 * Derive how a wire payload selects one variant of a union, so every binding runs
 * the same dispatch instead of re-deriving it (and silently depending on emit
 * order). Two shapes:
 *   { by, variants: [{ value, ref }], default? } — a discriminated union: look up
 *     payload[by] among `variants` (value is a string or null), else `default`.
 *     `default` may itself be a union (e.g. LocalValue's untyped RemoteReference
 *     arm), whose own selector finishes the dispatch.
 *   { ordered: [{ ref, requires }] } — a structural union with no shared
 *     discriminator: the first variant whose `requires` keys are all present wins.
 *     Order is the CDDL choice order (the spec's priority), made explicit here.
 */
function unionSelector(name, types) {
  const variants = types[name].variants
  const constKeys = new Set()
  for (const leaf of variants.flatMap((v) => unionLeaves(v, types)))
    for (const f of types[leaf].fields)
      if (discriminatorValue(types[leaf], f.name)?.value !== undefined) constKeys.add(f.name)

  for (const key of constKeys) {
    const contributions = variants.map((v) => tagContribution(v, key, types))
    if (contributions.some((c) => c === null)) continue // some member can't be placed on this key
    const tagged = contributions.flatMap((c) => c.tagged ?? [])
    const defaults = contributions.filter((c) => c.default).map((c) => c.default)
    if (defaults.length > 1 || tagged.length === 0) continue // ambiguous catch-all, or nothing to tag
    const values = tagged.map((e) => JSON.stringify(e.value))
    if (new Set(values).size !== values.length) continue // values collide — not a clean tag
    const selector = { by: key, variants: tagged }
    if (defaults.length === 1) selector.default = defaults[0]
    return selector
  }

  // No shared discriminator: dispatch by required-field presence, in spec order.
  // Resolve each variant through aliases/sub-unions to its leaf records (as the
  // discriminator path does) and require the fields required in every leaf, so an
  // alias-to-record variant is not left with an empty (always-matching) predicate.
  const requiresOf = (ref) => {
    const leaves = unionLeaves(ref, types).map(
      (l) => new Set(types[l].fields.filter((f) => f.required).map((f) => f.name)),
    )
    return leaves.length ? [...leaves[0]].filter((k) => leaves.every((s) => s.has(k))) : []
  }
  return { ordered: variants.map((ref) => ({ ref, requires: requiresOf(ref) })) }
}

// A structural selector can dispatch a payload only when every arm has a required
// field to test AND no arm's `requires` is a subset of a later arm's (which would
// shadow it under first-match) — the same validity checkSelector enforces, used
// here so the correlated walk treats an undispatchable union as a result grouping.
function orderedIsDispatchable(ordered) {
  for (let i = 0; i < ordered.length; i++) {
    if (ordered[i].requires.length === 0) return false
    for (let j = i + 1; j < ordered.length; j++)
      if (ordered[j].requires.length && ordered[i].requires.every((k) => ordered[j].requires.includes(k))) return false
  }
  return true
}

// The command-response envelope is the record that pairs a `result` union with the
// request `id` that correlates it — that id is what makes its result request-
// dispatched rather than payload-dispatched. Returns the result union's name, or
// null. The `id` requirement is what excludes a plain payload type that merely has
// a `result` field (e.g. script.EvaluateResultSuccess, which has no request id).
function envelopeResultUnion(record, types) {
  if (record?.kind !== 'record' || !record.fields.some((f) => f.name === 'id' && f.required)) return null
  const result = record.fields.find(
    (f) => f.name === 'result' && f.required && f.type.ref && types[f.type.ref]?.kind === 'union',
  )
  return result ? result.type.ref : null
}

// The command-result hierarchy is dispatched by request id, not by inspecting the
// payload (a response is matched to the command that produced it), so those unions
// must not carry a payload selector. They can't be found from the model alone —
// void commands record `result: null`, erasing whole result unions (e.g. every
// emulation result) — so identify them structurally from the response envelope's
// `result` union (envelopeResultUnion), then walk the variant tree, marking each
// union that has no payload discriminator. The discriminator guard stops the walk
// at a result that IS payload-dispatched (e.g. script.EvaluateResult on `type`),
// leaving its selector intact. Requires provisional selectors to already be set.
function correlatedUnions(types) {
  const roots = new Set()
  for (const t of Object.values(types)) {
    const root = envelopeResultUnion(t, types)
    if (root) roots.add(root)
  }
  // A union is payload-dispatched — and so must keep its selector — when it has a
  // discriminator OR a structural selector that can actually distinguish its arms
  // (matching the validity the gate enforces). The result groupings fail this
  // (their arms share/lack distinguishing fields), so the walk passes through them.
  const payloadDispatched = (sel) => Boolean(sel?.by || (sel?.ordered && orderedIsDispatchable(sel.ordered)))
  const correlated = new Set()
  const mark = (name) => {
    const t = types[name]
    if (!t || t.kind !== 'union' || correlated.has(name) || payloadDispatched(t.selector)) return
    correlated.add(name)
    t.variants.forEach(mark)
  }
  roots.forEach(mark)
  return correlated
}

/**
 * Build the flat, binding-neutral schema from the raw AST and command/event model.
 * @param {object[]} ast The parsed CDDL AST (array of definition nodes).
 * @param {object} model The binding-neutral command/event model (per-domain).
 * @returns {{schemaVersion: number, commands: object[], events: object[], types: object}} The schema.
 */
export function projectSchema(ast, model) {
  const types = {}
  for (const def of normalizeAst(ast)) {
    if (!def?.Name) continue
    const node = projectType(def)
    // Types the normalizer minted for anonymous CDDL constructs (hoisted enums /
    // inline records, union arms) carry their decomposition so a binding can name
    // or nest them idiomatically without parsing the synthetic key. `owner` is the
    // type the construct was lifted out of; `label` is the member name within it.
    if (def['x-selenium-synthetic']) {
      node.synthetic = true
      node.owner = def['x-selenium-owner']
      node.label = def['x-selenium-label']
    }
    types[def.Name] = node
  }
  for (const [name, node] of Object.entries(types))
    if (node.kind === 'union') node.selector = unionSelector(name, types)
  // Override the result-grouping unions: they are dispatched by request id, so a
  // payload selector for them is meaningless (and would be empty/ambiguous).
  for (const name of correlatedUnions(types)) types[name].selector = { correlated: true }

  const commands = []
  const events = []
  const envelopeParams = commandEnvelopeParams(types)
  for (const [domain, entry] of Object.entries(model)) {
    for (const c of entry.commands ?? [])
      commands.push({
        domain,
        method: c.method,
        name: c.name,
        // Prefer the envelope's params (it captures inline params the model drops).
        params: typeRef(envelopeParams.get(c.method) ?? c.params),
        result: typeRef(c.result),
      })
    for (const e of entry.events ?? [])
      events.push({ domain, method: e.method, name: e.name, params: typeRef(envelopeParams.get(e.method) ?? e.params) })
  }

  return { schemaVersion: 1, commands, events, types }
}

/**
 * Fail-closed validation: every type reference resolves, and no type projects to
 * `unknown` (which would mean an unhandled CDDL form) — across command/event
 * params and results, record fields, record maps, union variants, and aliases.
 * @param {object} schema The projected schema (`{commands, events, types}`).
 * @returns {string[]} One message per problem; empty when valid.
 */
export function checkSchema(schema) {
  const errors = []
  const has = (name) => Object.hasOwn(schema.types, name)
  const refsIn = (node) =>
    !node
      ? []
      : node.ref
        ? [node.ref]
        : node.list
          ? refsIn(node.list)
          : node.map
            ? refsIn(node.map)
            : node.union
              ? node.union.flatMap(refsIn)
              : node.record
                ? node.record.flatMap((f) => refsIn(f.type))
                : []
  const hasUnknown = (node) =>
    !node
      ? false
      : node.primitive === 'unknown'
        ? true
        : node.list
          ? hasUnknown(node.list)
          : node.map
            ? hasUnknown(node.map)
            : node.union
              ? node.union.some(hasUnknown)
              : node.record
                ? node.record.some((f) => hasUnknown(f.type))
                : false
  const hasEmptyInlineRecord = (node) =>
    !node
      ? false
      : Array.isArray(node.record)
        ? node.record.length === 0 || node.record.some((f) => hasEmptyInlineRecord(f.type))
        : node.list
          ? hasEmptyInlineRecord(node.list)
          : node.map
            ? hasEmptyInlineRecord(node.map)
            : node.union
              ? node.union.some(hasEmptyInlineRecord)
              : false
  const report = (where, node) => {
    for (const r of refsIn(node)) if (!has(r)) errors.push(`${where}: unresolved type ${r}`)
    if (hasUnknown(node)) errors.push(`${where}: projected to an unknown primitive (unhandled CDDL type)`)
    if (hasEmptyInlineRecord(node)) errors.push(`${where}: projected an empty inline record (dropped type reference)`)
  }

  for (const c of [...schema.commands, ...schema.events]) {
    report(c.method, c.params)
    report(c.method, c.result ?? null)
  }
  // A command/event whose envelope record carries real params must surface them —
  // guards the model builder's gap where an inline `params: {...}` (vs a named ref)
  // was dropped, leaving it parameterless while its type still required them.
  const envelopeParams = commandEnvelopeParams(schema.types)
  for (const c of [...schema.commands, ...schema.events]) {
    const expected = envelopeParams.get(c.method)
    if (expected && c.params?.ref !== expected)
      errors.push(`${c.method}: params ${c.params?.ref ?? 'null'} does not match required envelope params ${expected}`)
  }
  for (const [name, node] of Object.entries(schema.types)) {
    if (node.synthetic && !has(node.owner)) errors.push(`${name}: synthetic owner ${node.owner} does not resolve`)
    if (node.kind === 'record') {
      for (const f of node.fields) report(`${name}.${f.name}`, f.type)
      if (node.map) report(`${name}.*`, node.map)
    } else if (node.kind === 'union') {
      for (const v of node.variants) if (!has(v)) errors.push(`${name}: unresolved variant ${v}`)
      errors.push(...checkSelector(name, node.selector, has))
    } else if (node.kind === 'alias') {
      report(name, node.type)
    }
  }

  // A `correlated` union is resolved by request id, which only holds at the command
  // response envelope's `result` position. If one is reachable anywhere else — a
  // non-`result` field, a `result` field on a record that is not the envelope (no
  // request id), a map/list/nested element, an alias, or a variant of a
  // non-correlated union — it would actually need payload dispatch, and marking it
  // correlated silently drops its selector. Fail closed so a misclassification (or
  // a too-broad envelope match) cannot ship.
  const correlated = new Set(
    Object.entries(schema.types)
      .filter(([, t]) => t.kind === 'union' && t.selector?.correlated)
      .map(([n]) => n),
  )
  const leak = (where, r) =>
    errors.push(`${where}: correlated union ${r} is reachable as a value (needs a payload selector)`)
  for (const [name, node] of Object.entries(schema.types)) {
    if (node.kind === 'record') {
      const envelopeRoot = envelopeResultUnion(node, schema.types)
      for (const f of node.fields)
        for (const r of refsIn(f.type))
          if (correlated.has(r) && !(f.name === 'result' && f.type.ref === r && r === envelopeRoot))
            leak(`${name}.${f.name}`, r)
      if (node.map) for (const r of refsIn(node.map)) if (correlated.has(r)) leak(`${name}.*`, r)
    } else if (node.kind === 'union' && !node.selector?.correlated) {
      for (const v of node.variants) if (correlated.has(v)) leak(name, v)
    } else if (node.kind === 'alias') {
      for (const r of refsIn(node.type)) if (correlated.has(r)) leak(name, r)
    }
  }
  return errors
}

// Validate a union's selector: every referenced variant resolves, a discriminated
// selector has distinct values and at most one default, a structural selector
// dispatches on something. Keeps a malformed selector from shipping silently.
function checkSelector(name, selector, has) {
  const errors = []
  if (!selector) return [`${name}: union has no selector`]
  if (selector.correlated) return [] // resolved by request id, not the payload — nothing to dispatch
  if (selector.by) {
    const values = selector.variants.map((v) => JSON.stringify(v.value))
    if (new Set(values).size !== values.length) errors.push(`${name}: selector has duplicate discriminator values`)
    for (const v of selector.variants)
      if (!has(v.ref)) errors.push(`${name}: selector variant ${v.ref} does not resolve`)
    if (selector.default && !has(selector.default))
      errors.push(`${name}: selector default ${selector.default} does not resolve`)
  } else if (selector.ordered) {
    // A structural selector must actually dispatch from the payload: every arm needs
    // a distinguishing required field, and no arm's `requires` may be a subset of a
    // later arm's — that would shadow the later arm under first-match. A union that
    // cannot satisfy this is not payload-dispatchable and must be `correlated`.
    selector.ordered.forEach((v, i) => {
      if (!has(v.ref)) errors.push(`${name}: selector variant ${v.ref} does not resolve`)
      if (!v.requires.length)
        errors.push(`${name}: structural selector arm ${v.ref} has no required fields to dispatch on`)
      for (let j = i + 1; j < selector.ordered.length; j++) {
        const w = selector.ordered[j]
        if (v.requires.length && w.requires.length && v.requires.every((k) => w.requires.includes(k)))
          errors.push(`${name}: structural selector arm ${v.ref} shadows ${w.ref} (requires is a subset)`)
      }
    })
  } else {
    errors.push(`${name}: selector is neither discriminated, structural, nor correlated`)
  }
  return errors
}

// ============================================================
// CLI: raw ast + model → flat schema (validated)
//   node project_bidi_schema.mjs --ast <ast.json> --model <model.json> --dump-schema <out.json>
// ============================================================

async function main() {
  const { parseArgs } = await import('node:util')
  const { readFileSync, writeFileSync } = await import('node:fs')
  const { resolve } = await import('node:path')

  // Under Bazel the js_binary wrapper chdir's to BAZEL_BINDIR, but $(location)
  // inputs are execroot-relative and already carry that prefix — strip it so the
  // path is not doubled. Mirrors resolveInputPath() in generate_bidi.mjs.
  const resolveInput = (p) => {
    if (!process.env.BAZEL_BINDIR) return resolve(p)
    const prefix = process.env.BAZEL_BINDIR.replaceAll('\\', '/') + '/'
    const norm = p.replaceAll('\\', '/')
    return resolve(norm.startsWith(prefix) ? norm.slice(prefix.length) : norm)
  }

  const { values: args } = parseArgs({
    options: { ast: { type: 'string' }, model: { type: 'string' }, 'dump-schema': { type: 'string' } },
  })
  if (!args.ast || !args.model || !args['dump-schema']) {
    console.error('Usage: project_bidi_schema.mjs --ast <ast.json> --model <model.json> --dump-schema <out.json>')
    process.exit(1)
  }

  const ast = JSON.parse(readFileSync(resolveInput(args.ast), 'utf8'))
  const model = JSON.parse(readFileSync(resolveInput(args.model), 'utf8'))
  const schema = projectSchema(ast, model)

  // Generation is the gate: a broken or incomplete schema fails the build.
  const errors = [...checkSchema(schema), ...checkCompleteness(ast, schema)]
  if (errors.length) {
    console.error('BiDi schema validation failed:')
    errors.forEach((e) => console.error(`  ${e}`))
    process.exit(1)
  }

  writeFileSync(resolve(args['dump-schema']), JSON.stringify(schema, null, 2) + '\n', 'utf8')
  console.log(
    `  ${schema.commands.length} commands, ${schema.events.length} events, ${Object.keys(schema.types).length} types → ${args['dump-schema']}`,
  )
}

// Run main() when invoked as the entry module. Uses an argv comparison rather
// than `import.meta.main`, which is only available on newer Node versions.
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((err) => {
    console.error(err)
    process.exit(1)
  })
}

/**
 * Independent completeness check: re-derive every command/event method straight
 * from the raw AST (a leaf def carries a literal `method` property) and assert it
 * survived into the schema. This compares input to output without trusting the
 * generator, so a dropped command/event fails the build even if generation and
 * its own checkSchema agree. Run as a Bazel test over committed fixtures.
 * @param {object[]} rawAst The parsed CDDL AST (pre-normalization).
 * @param {object} schema The projected schema to check against.
 * @returns {string[]} One message per dropped or stale-allowlisted method; empty when complete.
 */
export function checkCompleteness(rawAst, schema) {
  const emitted = new Set([...schema.commands, ...schema.events].map((c) => c.method))
  const errors = []
  for (const def of rawAst) {
    const methodProp = (def.Properties ?? []).flat().find((p) => p?.Name === 'method')
    const literal = methodProp && (Array.isArray(methodProp.Type) ? methodProp.Type[0] : methodProp.Type)
    if (literal?.Type !== 'literal') continue
    if (!emitted.has(literal.Value) && !KNOWN_INCOMPLETE.has(literal.Value))
      errors.push(`dropped from schema: ${literal.Value}`)
  }
  // Self-cleaning: if a known-incomplete method is now emitted, the entry is
  // stale and must be removed — so the allowlist cannot silently rot.
  for (const known of KNOWN_INCOMPLETE) {
    if (emitted.has(known)) errors.push(`stale KNOWN_INCOMPLETE entry (now emitted, remove it): ${known}`)
  }
  return errors
}
