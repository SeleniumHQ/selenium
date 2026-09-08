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
 *   type node:  { kind: 'record', fields: [field], map?, extensible?, specHref? }
 *             | { kind: 'enum',   values: [scalar], primitive?, specHref? }
 *             | { kind: 'union',  variants: [ref], selector, objectOnly?, specHref? }
 *             | { kind: 'alias',  type, specHref? }
 *   selector:   { by, variants: [{ value, ref }], default? }   // discriminated
 *             | { ordered: [{ ref, requires: [key] }] }        // structural, spec order
 *             | { correlated: true }                           // resolved by request id, not the payload
 *   field:      { name, wire, required, type }
 *   type ref:   { primitive } | { const } | { ref } | { enum, primitive? } | { list } | { map, extensible? } | { union, scalar?, scalarValues? }
 *               any ref may also carry `nullable: true` (a `/ null` alternative). On a
 *               record node, `map` is the value type of `* key => value` entries and
 *               `extensible: true` marks an open `* text => any` record.
 *
 * `specHref` (present only when known) is the URL of the element's definition in the
 * live spec — a binding can render it as a doc-comment link. It is carried on each
 * type node, on each `commands[]` / `events[]` entry, and (as `{specHref}`) per domain
 * in the schema's `domains` map. Two anchor sources are joined: the readable prose
 * section (`#type-…` / `#command-…` / `#event-…` / `#module-…`) where the core spec
 * has one, falling back to the webref CDDL production (`#cddl-type-…`) otherwise. It
 * points at the editor's draft, so for an older generated artifact the target drifts
 * from the pinned source; synthetic types (and anything neither source covers) omit it.
 *
 * Two derived signals let a binding validate the wire boundary without re-deriving
 * anything itself:
 *   `objectOnly: true`   — a union all of whose arms are object (record) types, so a
 *                          non-object payload is a schema violation, not a scalar arm.
 *   an inline `enum` ref carries the `primitive` its literals share, so even a scalar
 *   the normalizer did not hoist to a named enum is typed rather than opaque.
 *   `scalar` on an inline `union` ref marks a union with a bare-scalar arm (a map entry's
 *   `RemoteValue / text`) and carries that arm's primitive: a binding collapsing it onto its
 *   object_only ref arm passes a non-object payload (the string keys) through, but only when
 *   it matches the primitive — a wrong-typed scalar is still rejected.
 *   `scalarValues` on a `union` ref pins the exact literals its `{ const }` scalar arms admit
 *   (input.Origin's "viewport" / "pointer"), so a binding can reject a wrong string, not just a
 *   wrong primitive — the tightest check the schema affords for a bare-scalar union arm.
 *
 * Each structured (`record` / `union`) type additionally carries `outbound` /
 *   `inbound`: reachable (by a pure `ref` walk) from some command's `params`, and from
 *   some command's `result` or an event's `params`, respectively. A binding gives a
 *   send-side accessor only to `outbound` types. Both flags are independent, so all four
 *   combinations occur — including `(false, false)` for a type in no message (a flattened
 *   base, an envelope), which correctly gets no accessor.
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

// An occurrence with no upper bound (`*` / `+`). The parser emits Infinity; the AST's
// JSON round-trip renders that as null, so treat both as unbounded.
const isUnbounded = (occ) => !!occ && (occ.m === null || occ.m === Infinity)

// A `null` keyword or a `nil` prelude ref in a union means the value may be null.
const isNullAlt = (e) =>
  e === 'null' || (e && typeof e === 'object' && e.Type === 'group' && PRELUDE[e.Value] === 'null')

// The primitive a set of literal values shares (all strings → string, etc.), or
// undefined when they are mixed. Used to type an inline literal choice.
function literalPrimitive(values) {
  if (values.every((v) => typeof v === 'string')) return 'string'
  if (values.every((v) => typeof v === 'boolean')) return 'boolean'
  if (values.every((v) => Number.isInteger(v))) return 'integer'
  if (values.every((v) => typeof v === 'number')) return 'number'
  return undefined
}

// An inline literal choice (e.g. `("classic" / "overlay") / null`) the normalizer did
// not hoist to a named enum. Carry the literals' shared primitive so the scalar is
// typed rather than opaque — a binding can then reject a wrong-primitive wire value.
function enumNode(entries) {
  const values = entries.map((e) => e.Value)
  const node = { enum: values }
  const primitive = literalPrimitive(values)
  if (primitive) node.primitive = primitive
  return node
}

// The primitive a bare-scalar union arm accepts: a `{ primitive }` arm directly, or the
// value type of a `{ const }` arm. Undefined for an object / list / ref arm.
function scalarArmPrimitive(arm) {
  if (arm.primitive !== undefined) return arm.primitive
  if (arm.const !== undefined) return literalPrimitive([arm.const])
  return undefined
}

// An inline union of projected arms. `scalar` marks a union that has a bare-scalar arm (a
// primitive or a const) alongside object arms — e.g. a map entry's `RemoteValue / text` —
// and carries that arm's primitive (or the array of primitives when the scalar arms differ).
// A binding that collapses such a union onto its object (object_only) ref arm must still let
// a non-object payload through here, but only when it matches this primitive — a wrong-typed
// scalar is still a wire error. `scalarValues` additionally pins the exact literals a `{ const }`
// scalar arm admits (input.Origin's "viewport" / "pointer"), so a binding can reject a wrong
// string too, not just a wrong primitive. Derived once, in the schema, not re-detected per binding.
function unionNode(arms) {
  const node = { union: arms }
  const primitives = [...new Set(arms.map(scalarArmPrimitive).filter((p) => p !== undefined))]
  if (primitives.length === 1) node.scalar = primitives[0]
  else if (primitives.length > 1) node.scalar = primitives
  const values = arms.filter((a) => a.const !== undefined).map((a) => a.const)
  if (values.length) node.scalarValues = values
  return node
}

function projectRef(type) {
  const all = typeList(type)
  // A missing type (undefined/empty input, e.g. a malformed array element or map
  // value) is not a `null` value — fail closed so checkSchema's unknown guard
  // catches it instead of silently producing a valid-looking `null`.
  if (all.length === 0) return { primitive: 'unknown' }
  const entries = all.filter((e) => !isNullAlt(e))
  const node =
    entries.length > 1
      ? entries.every(isLiteral)
        ? enumNode(entries)
        : unionNode(entries.map(projectEntry))
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
    if (refs) return refs.length === 1 ? { ref: refs[0] } : unionNode(refs.map((r) => ({ ref: r })))
    return {
      record: e.Properties.flat()
        .filter((p) => p?.Name)
        .map(projectField),
    }
  }
  if (e.Type === 'array') return { list: projectRef(e.Values?.[0]?.Type) }
  if (e.Type === 'map') return { map: projectRef(e.ValueType ?? e.Values?.[0]?.Type), extensible: true }
  if (e.Type === 'range') {
    // A bound written as a float (`1.0`) parses to an integer `Value` carrying an `IsFloat`
    // marker; consult it so `(0.0..1.0)` is a number range, not — as its integral bounds alone
    // would read — an integer one. A bound with no marker falls back to its value's integralness.
    const intBound = (b) => b && !b.IsFloat && Number.isInteger(b.Value)
    const intRange = intBound(e.Value?.Min) && intBound(e.Value?.Max)
    return { primitive: intRange ? 'integer' : 'number' } // e.g. js-uint (0..MAX) vs latitude (-90.0..90.0)
  }
  return { primitive: PRIMITIVES[e.Type] ?? 'unknown' }
}

// A wire key that is already an identifier is kept verbatim, so `namespaceURI` stays
// wire-faithful; a quoted CDDL key that is not (`prefers-color-scheme`) is camelCased so
// every binding derives an identifier from `name` without re-solving punctuation itself.
const IDENTIFIER = /^[A-Za-z][A-Za-z0-9]*$/

function fieldName(wire) {
  if (IDENTIFIER.test(wire)) return wire
  const [head, ...rest] = wire.split(/[^A-Za-z0-9]+/).filter(Boolean)
  if (!head) return wire
  return head + rest.map((part) => part[0].toUpperCase() + part.slice(1)).join('')
}

function projectField(prop) {
  // A vendor-prefixed key (moz:allowPrivateBrowsing) keeps its wire form: extractVendor
  // routes it out of the shared types, and the vendor pipeline drops the namespace itself.
  const vendor = prop['x-selenium-vendor']
  const field = {
    name: vendor ? prop.Name : fieldName(prop.Name),
    wire: prop.Name,
    required: (prop.Occurrence?.n ?? 1) >= 1,
    type: projectRef(prop.Type),
  }
  // Provenance stamped by a vendor overlay (generate_bidi.mjs). Carried on the field so
  // extractVendor can route it out of the shared schema; stripped there before it ships.
  if (vendor) {
    field.vendor = vendor
    field.via = prop['x-selenium-vendor-via']
  }
  return field
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
    if (pt.length && pt.every(isLiteral)) {
      // Carry the literals' shared primitive so every binding reads the value type
      // rather than re-deriving it from the JSON values (which arrive differently typed
      // per language). Matches what enumNode does for an un-hoisted inline choice.
      const values = pt.map((e) => e.Value)
      const primitive = literalPrimitive(values)
      return primitive ? { kind: 'enum', values, primitive } : { kind: 'enum', values }
    }
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
 * Project a CDDL group into a record. A property with an unbounded occurrence (`*`/`+`)
 * is a map/spread entry, not a scalar field: `* text => any` marks the record extensible,
 * `* text => T` becomes a typed map, and an unbounded group spread is folded in. Everything
 * else is a normal field.
 */
function projectRecord(def) {
  const record = { kind: 'record', fields: [] }
  for (const prop of (def.Properties ?? []).flat()) {
    if (!prop || typeof prop !== 'object') continue
    // An unbounded upper bound is overloaded in this parser: a key-typed entry is a map
    // (`* text => value`); an anonymous entry is a structural spread; everything else is
    // just an optional field (the `?` quantifier). Only the first two are not real fields.
    // The parser emits the bound as Infinity; the AST's JSON round-trip turns it into null,
    // so accept either rather than depending on that coercion.
    if (isUnbounded(prop.Occurrence) && (!prop.Name || prop.Name in PRIMITIVES || prop.Name in PRELUDE)) {
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

// Whether a union variant is an object (record) type — following aliases and nested
// unions to their leaves. An enum, or an alias to a primitive/list/map (or an inline
// union arm with a scalar member), is not an object. `objectOnly` is true for a union
// only when every variant is one, so a non-object payload is a schema violation there.
function variantIsObject(ref, types, seen = new Set()) {
  if (seen.has(ref)) return true // a cycle bottoms out in records; treat as object
  seen.add(ref)
  const t = types[ref]
  if (!t) return false
  if (t.kind === 'record') return true
  if (t.kind === 'union') return t.variants.every((v) => variantIsObject(v, types, seen))
  if (t.kind === 'alias') {
    if (t.type?.ref) return variantIsObject(t.type.ref, types, seen)
    if (t.type?.union) return t.type.union.every((a) => a.ref !== undefined && variantIsObject(a.ref, types, seen))
    return false // alias to a primitive / list / map / const
  }
  return false // enum
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
 * Build a `{ typeName: specHref }` map from one or more webref definition indexes
 * (`ed/dfns/<spec>.json`, each `{ spec, dfns: [...] }`). Only `cddl-type` entries are
 * used, keyed by their `linkingText` — which is exactly the dotted schema type name
 * (e.g. `session.CapabilityRequest`). The `href` is already absolute (per-spec origin),
 * so indexes from different specs merge without a base-URL table; first index wins on
 * the rare cross-spec name clash. Types the index does not cover simply get no entry.
 * @param {object[]} dfnsDocs Parsed webref dfns documents.
 * @returns {Object<string,string>} Map from schema type name to its spec-definition URL.
 */
export function buildSpecHrefs(dfnsDocs) {
  const hrefs = {}
  for (const doc of dfnsDocs ?? [])
    for (const dfn of doc?.dfns ?? []) {
      const name = dfn.type === 'cddl-type' ? dfn.linkingText?.[0] : undefined
      if (name && dfn.href && !(name in hrefs)) hrefs[name] = dfn.href
    }
  return hrefs
}

/**
 * Compose the spec-link maps the projector attaches, from the webref CDDL indexes
 * (all merged specs) and the core spec's prose-anchor index (see
 * extract_bidi_anchors.mjs). All maps are lowercase-keyed for a case-insensitive
 * join (the prose anchors carry casing quirks that do not match schema names
 * exactly). Returns:
 *   types    — every CDDL type's `#cddl-type-*` anchor, upgraded to the readable
 *              `#type-<domain>-<Name>` prose section where the core spec has one.
 *   commands — `#command-<domain>-<name>` prose sections (core spec).
 *   events   — `#event-<domain>-<name>` prose sections (core spec).
 *   domains  — `#module-<domain>` prose sections (core spec).
 * The prose scheme is a core-BiDi convention; adjacent specs (Permissions, Web
 * Bluetooth, …) keep the CDDL fallback. Anything absent gets no entry (fail-closed).
 * @param {object[]} dfnsDocs Parsed webref dfns documents.
 * @param {{modules?:object,types?:object,commands?:object,events?:object}} [anchors] Prose-anchor index.
 * @returns {{types:object,commands:object,events:object,domains:object}}
 */
export function buildSpecLinks(dfnsDocs, anchors = {}) {
  const types = {}
  for (const [name, href] of Object.entries(buildSpecHrefs(dfnsDocs))) types[name.toLowerCase()] = href
  Object.assign(types, anchors.types ?? {}) // the prose section wins over the CDDL production
  return {
    types,
    commands: { ...(anchors.commands ?? {}) },
    events: { ...(anchors.events ?? {}) },
    domains: { ...(anchors.modules ?? {}) },
  }
}

// Every type name a *type expression* references (the value of a `field.type`, or a
// list element / map value type), descending through list, map, inline union arms, and
// inline record fields. Shared by refsOfNode and checkSchema.
function refsInType(node) {
  if (!node) return []
  if (node.ref) return [node.ref]
  if (node.list) return refsInType(node.list)
  if (node.map) return refsInType(node.map)
  if (node.union) return node.union.flatMap(refsInType)
  if (node.record) return node.record.flatMap((f) => refsInType(f.type))
  return []
}

// Every type name a projected *type node* (a named `schema.types` entry) references: a
// record's field and map-value refs, a union's variant (and selector) refs, an alias's
// target refs. Composition is already resolved upstream, so this ref adjacency is
// complete for a reachability walk.
function refsOfNode(node) {
  if (!node) return []
  if (node.kind === 'record') {
    const refs = node.fields.flatMap((f) => refsInType(f.type))
    if (node.map) refs.push(...refsInType(node.map))
    return refs
  }
  if (node.kind === 'union') {
    const refs = [...node.variants]
    if (node.selector?.variants) refs.push(...node.selector.variants.map((v) => v.ref))
    if (node.selector?.default) refs.push(node.selector.default)
    return refs
  }
  if (node.kind === 'alias') return refsInType(node.type)
  return []
}

// The transitive closure of a set of root type names over refsOfNode. An unknown name
// (a ref with no type entry) terminates that branch.
function reachableTypes(roots, types) {
  const seen = new Set()
  const stack = [...roots]
  while (stack.length) {
    const name = stack.pop()
    if (seen.has(name) || !types[name]) continue
    seen.add(name)
    for (const r of refsOfNode(types[name])) stack.push(r)
  }
  return seen
}

/**
 * Build the flat, binding-neutral schema from the raw AST and command/event model.
 * @param {object[]} ast The parsed CDDL AST (array of definition nodes).
 * @param {object} model The binding-neutral command/event model (per-domain).
 * @param {{types?:object,commands?:object,events?:object,domains?:object}} [links] Optional
 *   spec-link maps (see buildSpecLinks). When given, each type/command/event with a known URL
 *   carries it as `specHref`, and linked domains are collected in the schema's `domains` map.
 * @returns {{schemaVersion: number, generatedBy: string, regenerateWith: string, commands: object[], events: object[], types: object, domains: object}} The schema.
 */
export function projectSchema(ast, model, links = {}) {
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
    // Link to the type's definition in the live spec, when the index covers it —
    // the readable prose section where one exists, else the CDDL production.
    // Synthetic types have no spec definition and are (correctly) never in it.
    const typeHref = links.types?.[def.Name.toLowerCase()]
    if (typeHref) node.specHref = typeHref
    types[def.Name] = node
  }
  for (const [name, node] of Object.entries(types))
    if (node.kind === 'union') node.selector = unionSelector(name, types)
  // Override the result-grouping unions: they are dispatched by request id, so a
  // payload selector for them is meaningless (and would be empty/ambiguous).
  for (const name of correlatedUnions(types)) types[name].selector = { correlated: true }
  // A first-class union whose every arm is an object rejects a non-object payload
  // instead of passing it through. (An alias-union like input.Origin, which carries
  // bare-string arms, is intentionally left unflagged so those arms still pass through.)
  for (const node of Object.values(types))
    if (node.kind === 'union' && node.variants.every((v) => variantIsObject(v, types))) node.objectOnly = true

  const commands = []
  const events = []
  const envelopeParams = commandEnvelopeParams(types)
  // Commands and events link to their own prose section (`#command-*` / `#event-*`),
  // keyed by the wire method; domains to their `#module-*` section. Present-only-when-known.
  const link = (map, key) => (typeof key === 'string' ? map?.[key.toLowerCase()] : undefined)
  for (const [domain, entry] of Object.entries(model)) {
    for (const c of entry.commands ?? []) {
      const cmd = {
        domain,
        method: c.method,
        name: c.name,
        // Prefer the envelope's params (it captures inline params the model drops).
        params: typeRef(envelopeParams.get(c.method) ?? c.params),
        result: typeRef(c.result),
      }
      const href = link(links.commands, c.method)
      if (href) cmd.specHref = href
      commands.push(cmd)
    }
    for (const e of entry.events ?? []) {
      const ev = { domain, method: e.method, name: e.name, params: typeRef(envelopeParams.get(e.method) ?? e.params) }
      const href = link(links.events, e.method)
      if (href) ev.specHref = href
      events.push(ev)
    }
  }

  // Per-type directionality (see the header block): reachable from a command's params
  // (outbound) vs from a command's result or an event's params (inbound), closed over
  // the same ref edges the integrity check walks — no name heuristics.
  const outboundRoots = commands.map((c) => c.params?.ref).filter(Boolean)
  const inboundRoots = [...commands.map((c) => c.result?.ref), ...events.map((e) => e.params?.ref)].filter(Boolean)
  const outboundReach = reachableTypes(outboundRoots, types)
  const inboundReach = reachableTypes(inboundRoots, types)
  for (const [name, node] of Object.entries(types))
    if (node.kind === 'record' || node.kind === 'union') {
      node.outbound = outboundReach.has(name)
      node.inbound = inboundReach.has(name)
    }

  // Per-domain module links, for a binding that emits one class/namespace per domain.
  const domains = {}
  for (const domain of Object.keys(model)) {
    const href = link(links.domains, domain)
    if (href) domains[domain] = { specHref: href }
  }

  // Partition vendor-tagged fields out of the shared, browser-neutral schema into a namespaced
  // `vendor` section. The shared `types` are then exactly what upstream emits (spec-only); a
  // binding that reads only `types`/`commands`/`events` never sees vendor fields.
  const vendor = extractVendor(types)
  const schema = {
    schemaVersion: 1,
    generatedBy: 'javascript/selenium-webdriver/project_bidi_schema.mjs',
    regenerateWith: 'bazel run //common/bidi:update-schema',
    commands,
    events,
    types,
    domains,
  }
  if (Object.keys(vendor).length) schema.vendor = vendor
  return schema
}

/**
 * Move every vendor-tagged field out of the shared `types` and into a `{ <namespace>: { extends:
 * { <targetType>: { via, fields } } } }` structure. A field's `via` names the spec extension point
 * it flowed through; the field having resolved into a real shared record (via the `//=` fold and
 * group flatten) is what proves the merge happened — this only re-routes the output. The pure
 * extension-point anchor type (e.g. `webExtension.InstallParametersExtension`), left with no
 * spec fields once its vendor fields move out, is dropped from the shared schema.
 * With no vendor tags present this returns `{}` and mutates nothing, so output is unchanged.
 * @param {object} types The projected `types` map (mutated in place).
 * @returns {object} The vendor section, empty when there are no vendor fields.
 */
function extractVendor(types) {
  const vendor = {}
  const anchors = new Set()
  for (const [typeName, node] of Object.entries(types)) {
    if (node.kind !== 'record' || !Array.isArray(node.fields)) continue
    const kept = []
    for (const field of node.fields) {
      if (!field.vendor) {
        kept.push(field)
        continue
      }
      anchors.add(field.via)
      // The extension point's own type carries a copy of its fields; drop that copy (the anchor
      // itself is removed below) and route only the copy that resolved into a real target type.
      if (field.via === typeName) continue
      const { vendor: ns, via, ...clean } = field
      const bucket = (vendor[ns] ??= { extends: {} })
      const entry = (bucket.extends[typeName] ??= { via, fields: [] })
      entry.fields.push(clean)
    }
    node.fields = kept
  }
  for (const name of anchors) {
    const anchor = types[name]
    if (anchor && anchor.kind === 'record' && (anchor.fields?.length ?? 0) === 0) delete types[name]
  }
  return vendor
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
    for (const r of refsInType(node)) if (!has(r)) errors.push(`${where}: unresolved type ${r}`)
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
      const wireByName = new Map()
      for (const f of node.fields) {
        report(`${name}.${f.name}`, f.type)
        // Two wire keys that camelCase to one name would collapse into a single
        // attribute downstream, silently keeping whichever the binding wrote last.
        const prior = wireByName.get(f.name)
        if (prior !== undefined && prior !== f.wire)
          errors.push(`${name}: wire keys ${prior} and ${f.wire} both project to field name ${f.name}`)
        wireByName.set(f.name, f.wire)
      }
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
        for (const r of refsInType(f.type))
          if (correlated.has(r) && !(f.name === 'result' && f.type.ref === r && r === envelopeRoot))
            leak(`${name}.${f.name}`, r)
      if (node.map) for (const r of refsInType(node.map)) if (correlated.has(r)) leak(`${name}.*`, r)
    } else if (node.kind === 'union' && !node.selector?.correlated) {
      for (const v of node.variants) if (correlated.has(v)) leak(name, v)
    } else if (node.kind === 'alias') {
      for (const r of refsInType(node.type)) if (correlated.has(r)) leak(name, r)
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
    options: {
      ast: { type: 'string' },
      model: { type: 'string' },
      'dump-schema': { type: 'string' },
      // Repeatable: one webref dfns index per merged spec. Optional — omitting them
      // (and --anchors) yields a schema with no specHref links (fully backward compatible).
      dfns: { type: 'string', multiple: true },
      // The core spec's prose-anchor index (see extract_bidi_anchors.mjs). Optional;
      // upgrades type links to prose sections and adds command/event/domain links.
      anchors: { type: 'string' },
    },
  })
  if (!args.ast || !args.model || !args['dump-schema']) {
    console.error(
      'Usage: project_bidi_schema.mjs --ast <ast.json> --model <model.json> --dump-schema <out.json>' +
        ' [--dfns <dfns.json> ...] [--anchors <anchors.json>]',
    )
    process.exit(1)
  }

  const ast = JSON.parse(readFileSync(resolveInput(args.ast), 'utf8'))
  const model = JSON.parse(readFileSync(resolveInput(args.model), 'utf8'))
  const dfnsDocs = (args.dfns ?? []).map((p) => JSON.parse(readFileSync(resolveInput(p), 'utf8')))
  const anchors = args.anchors ? JSON.parse(readFileSync(resolveInput(args.anchors), 'utf8')) : {}
  const schema = projectSchema(ast, model, buildSpecLinks(dfnsDocs, anchors))

  // Generation is the gate: a broken or incomplete schema fails the build.
  const errors = [...checkSchema(schema), ...checkCompleteness(ast, schema)]
  if (errors.length) {
    console.error('BiDi schema validation failed:')
    errors.forEach((e) => console.error(`  ${e}`))
    process.exit(1)
  }

  writeFileSync(resolve(args['dump-schema']), JSON.stringify(schema, null, 2) + '\n', 'utf8')
  const prose = (u) => (u && !u.includes('#cddl-') ? 1 : 0)
  const linkedTypes = Object.values(schema.types).filter((t) => t.specHref)
  const proseTypes = linkedTypes.filter((t) => prose(t.specHref)).length
  console.log(
    `  ${schema.commands.length} commands, ${schema.events.length} events, ${Object.keys(schema.types).length} types` +
      ` (${linkedTypes.length} spec-linked, ${proseTypes} prose) → ${args['dump-schema']}`,
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
  // Every structured type must carry both directionality flags — a missing one means
  // the pass skipped a node. `(false, false)` is a valid combination (a type in no
  // message: an envelope, a grouping union, a flattened base), not an error.
  for (const [name, node] of Object.entries(schema.types)) {
    if (node.kind !== 'record' && node.kind !== 'union') continue
    if (typeof node.outbound !== 'boolean' || typeof node.inbound !== 'boolean')
      errors.push(`${name}: missing directionality flag (inbound/outbound)`)
  }
  return errors
}
