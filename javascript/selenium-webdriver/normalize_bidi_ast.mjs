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
 * Produce `selenium-bidi-ast.json` from the raw `bidi-ast.json`.
 *
 * The raw AST (from the `cddl` parser) is faithful but unnormalized: the same
 * logical construct appears in several shapes that each binding generator then
 * has to recognize on its own — and currently each gets some of them wrong. This
 * stage rewrites a small number of nodes into ONE canonical shape per construct,
 * staying within the parser's existing node vocabulary so a consumer's existing
 * AST traversal keeps working — it just stops tripping on the awkward shapes.
 *
 * It is intentionally additive and surgical: the output is the input with a few
 * dozen nodes rewritten plus synthetic defs appended. The raw AST is left
 * untouched for `cddl2ts` (which consumes it directly for the JS type bindings).
 *
 * Transforms:
 *   1. Inline string-literal unions on a field  → a hoisted named enum def
 *      (the shape generators already handle for top-level enums), values verbatim.
 *   2. Variant-union params (a record carrying an inline choice of variants, OR
 *      a top-level union) → one canonical `variable` union whose members are
 *      self-contained variant records (common fields merged in). The discriminator
 *      then lives inside each variant, so "field required only for this variant"
 *      holds by construction.
 *
 * Type-name refs use the dotted CDDL name (e.g. `network.Request`), matching the
 * raw AST. Result/void handling stays in the model (`buildResultTypeNames`).
 *
 * Defs synthesized for anonymous constructs (hoisted enums/records, union arms)
 * carry `x-selenium-synthetic` plus `x-selenium-owner` (the def they were lifted
 * out of) and `x-selenium-label` (the member name within it). The projector turns
 * these into `{ synthetic, owner, label }` so a consumer can name or nest the type
 * idiomatically rather than reverse-engineering the synthetic def name.
 */

/** Normalize a node's `Type` to an array of type entries (group/literal/string). */
function typeList(t) {
  if (Array.isArray(t)) return t
  if (t === undefined || t === null) return []
  return [t]
}

/** PascalCase a field name for use in a synthetic type name. */
function pascal(name) {
  const cleaned = (name || '').replace(/[^A-Za-z0-9]/g, ' ')
  return cleaned
    .split(' ')
    .filter(Boolean)
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join('')
}

/** Split a dotted CDDL name into `{ domain, local }` (domain '' when undotted). */
function splitName(name) {
  const i = name.indexOf('.')
  return i === -1 ? { domain: '', local: name } : { domain: name.slice(0, i), local: name.slice(i + 1) }
}

/** A factory for collision-free synthetic def names within a known name set. */
function nameAllocator(existing) {
  const taken = new Set(existing)
  return (candidate) => {
    let name = candidate
    let n = 2
    while (taken.has(name)) name = `${candidate}${n++}`
    taken.add(name)
    return name
  }
}

/** True when `entry` is a reference to a named group (`{Type:'group', Value}`). */
function isGroupRef(entry) {
  return entry && typeof entry === 'object' && entry.Type === 'group' && typeof entry.Value === 'string'
}

/** True when `entry` is an inline anonymous group (`{Type:'group', Properties}`). */
function isInlineGroup(entry) {
  return entry && typeof entry === 'object' && entry.Type === 'group' && Array.isArray(entry.Properties)
}

function groupRef(value) {
  return { Type: 'group', Value: value, Unwrapped: false }
}

/**
 * Drop the leading run of `label` that restates `ownerLocal`, backing off to a
 * camelCase boundary, so `ContinueWithAuthParameters` + `ContinueWithAuthCredentials`
 * → `Credentials` (and `DownloadBehavior` + `DownloadBehaviorAllowed` → `Allowed`).
 */
function trimRedundantPrefix(ownerLocal, label) {
  let i = 0
  while (i < label.length && i < ownerLocal.length && label[i] === ownerLocal[i]) i++
  while (i > 0 && i < label.length && !(label[i] >= 'A' && label[i] <= 'Z')) i--
  const rest = label.slice(i)
  return rest.length > 0 && rest[0] >= 'A' && rest[0] <= 'Z' ? rest : label
}

/** Collect every named group referenced (`{Type:'group', Value}`) anywhere in the AST. */
function collectReferencedNames(ast) {
  const referenced = new Set()
  const walk = (v) => {
    if (Array.isArray(v)) {
      v.forEach(walk)
    } else if (v && typeof v === 'object') {
      if (v.Type === 'group' && typeof v.Value === 'string') referenced.add(v.Value)
      for (const key in v) if (key !== 'Name') walk(v[key])
    }
  }
  for (const def of ast) walk(def)
  return referenced
}

// ============================================================
// Transform 1: hoist inline string-literal unions to named enums
// ============================================================

/**
 * Visit every property object reachable through a def's `Properties`, including
 * those nested inside inline groups and arrays and inside choice branches
 * (array-wrapped elements). `fn(prop)` may mutate `prop` in place.
 */
function eachPropertyDeep(properties, fn) {
  if (!Array.isArray(properties)) return
  for (const element of properties) {
    if (Array.isArray(element)) {
      eachPropertyDeep(element, fn)
      continue
    }
    if (!element || typeof element !== 'object') continue
    fn(element)
    for (const entry of typeList(element.Type)) {
      if (isInlineGroup(entry)) eachPropertyDeep(entry.Properties, fn)
      if (entry && entry.Type === 'array' && Array.isArray(entry.Values)) eachPropertyDeep(entry.Values, fn)
    }
  }
}

/**
 * Rewrite fields whose type is a union of >= 2 string literals into a reference
 * to a synthetic enum def, and append those enum defs. Single-literal fields
 * (discriminators) are left untouched. Returns a new AST array.
 * @param {object[]} ast The AST to transform.
 * @returns {object[]} A new AST array with inline enums hoisted to named defs.
 */
export function hoistInlineEnums(ast) {
  const out = structuredClone(ast)
  const alloc = nameAllocator(out.map((d) => d.Name))
  const created = []

  for (const def of out) {
    if (!def || typeof def !== 'object' || !Array.isArray(def.Properties)) continue
    const owner = splitName(def.Name ?? '')
    eachPropertyDeep(def.Properties, (prop) => {
      const entries = typeList(prop.Type)
      const allLiterals =
        entries.length >= 2 && entries.every((e) => e && typeof e === 'object' && e.Type === 'literal')
      if (!allLiterals) return

      const base = pascal(prop.Name) || `Value${created.length}`
      const localName = `${owner.local}${base}`
      const synthName = alloc(owner.domain ? `${owner.domain}.${localName}` : localName)

      created.push({
        Type: 'variable',
        Name: synthName,
        IsChoiceAddition: false,
        PropertyType: entries.map((e) => structuredClone(e)),
        Comments: prop.Comments ?? [],
        'x-selenium-synthetic': true,
        'x-selenium-owner': def.Name,
        'x-selenium-label': base,
      })
      prop.Type = [groupRef(synthName)]
    })
  }

  return [...out, ...created]
}

/**
 * Hoist a named field whose type is an inline anonymous record into a synthetic
 * top-level def + a reference, so every structured type in the artifact is a
 * named ref (no inline records left for consumers to special-case). Uses a
 * worklist so records nested inside hoisted records are also lifted.
 * @param {object[]} ast The AST to transform.
 * @returns {object[]} A new AST array with inline records hoisted to named defs.
 */
export function hoistInlineRecords(ast) {
  const out = structuredClone(ast)
  const alloc = nameAllocator(out.map((d) => d.Name))
  const created = []
  const queue = [...out]

  while (queue.length) {
    const def = queue.shift()
    if (!def || typeof def !== 'object' || !Array.isArray(def.Properties)) continue
    const owner = splitName(def.Name ?? '')
    for (const prop of def.Properties.flat()) {
      if (!prop || typeof prop !== 'object' || !prop.Name) continue
      const entries = typeList(prop.Type)
      const inline = entries.length === 1 && isInlineGroup(entries[0]) && !entries[0].Value
      if (!inline) continue
      const localName = `${owner.local}${pascal(prop.Name)}`
      const synthName = alloc(owner.domain ? `${owner.domain}.${localName}` : localName)
      const newDef = {
        Type: 'group',
        Name: synthName,
        IsChoiceAddition: false,
        Properties: entries[0].Properties,
        Comments: prop.Comments ?? [],
        'x-selenium-synthetic': true,
        'x-selenium-owner': def.Name,
        'x-selenium-label': pascal(prop.Name),
      }
      created.push(newDef)
      queue.push(newDef)
      prop.Type = [groupRef(synthName)]
    }
  }

  return [...out, ...created]
}

// ============================================================
// Transform 3: canonicalize variant-union params
// ============================================================

/**
 * Flatten a choice group's `Properties` into an ordered list of branch property
 * objects. The parser encodes `a // b` as a mix of array-wrapped and bare
 * elements; both are choice alternatives here.
 */
function choiceBranches(properties) {
  const branches = []
  for (const element of properties ?? []) {
    if (Array.isArray(element)) branches.push(...element.filter((e) => e && typeof e === 'object'))
    else if (element && typeof element === 'object') branches.push(element)
  }
  return branches
}

/**
 * Detect a record with an inline variant choice: exactly one anonymous property
 * (`Name === ''`) whose type is an inline group of >= 2 choice branches. Returns
 * `{ commonFields, branches }` or null.
 */
function detectInlineVariant(def) {
  if (def.Type !== 'group' || !Array.isArray(def.Properties)) return null

  const named = []
  let choice = null
  for (const prop of def.Properties) {
    if (Array.isArray(prop) || !prop || typeof prop !== 'object') return null
    if (prop.Name === '' || prop.Name === undefined) {
      const entry = typeList(prop.Type)[0]
      if (isInlineGroup(entry)) {
        const branches = choiceBranches(entry.Properties)
        if (branches.length >= 2 && choice === null) {
          choice = branches
          continue
        }
      }
      return null // anonymous-but-not-a-clean-choice: leave it alone
    }
    named.push(prop)
  }

  return choice ? { commonFields: named, branches: choice } : null
}

/** The single variant entry carried by a choice branch (ref or inline group). */
function branchType(branch) {
  return typeList(branch.Type).find((e) => isGroupRef(e) || isInlineGroup(e))
}

/**
 * Build the fields for a self-contained variant record: the common fields plus
 * the variant's own fields (inlined from a referenced record, or taken from an
 * inline group). Returns `{ fields, label }` where label names the variant.
 */
function variantRecord(commonFields, entry, defMap, index) {
  const common = commonFields.map((f) => structuredClone(f))
  if (isGroupRef(entry)) {
    const target = defMap.get(entry.Value)
    const ownFields =
      target && Array.isArray(target.Properties) ? structuredClone(target.Properties) : [structuredClone({ ...entry })]
    return { fields: [...common, ...ownFields], label: splitName(entry.Value).local, supersedes: entry.Value }
  }
  // inline group: label by its sole distinguishing field when there is one
  const ownFields = structuredClone(entry.Properties)
  const named = ownFields.filter((f) => f && typeof f === 'object' && f.Name)
  const label = named.length === 1 ? pascal(named[0].Name) : `Variant${index}`
  return { fields: [...common, ...ownFields], label }
}

/**
 * Rewrite variant-union params into a canonical `variable` union of
 * self-contained variant records. Records that are already a `variable` union
 * (a top-level union of group refs) are left as the canonical target. Returns a
 * new AST array.
 * @param {object[]} ast The AST to transform.
 * @returns {object[]} A new AST array with variant-union params canonicalized.
 */
export function canonicalizeVariantParams(ast) {
  const out = structuredClone(ast)
  const defMap = new Map(out.map((d) => [d.Name, d]))
  const alloc = nameAllocator(out.map((d) => d.Name))
  const created = []
  const superseded = new Set()
  const supersededBy = new Map()

  for (const def of out) {
    const detected = detectInlineVariant(def)
    if (!detected) continue

    // Verify every branch is supported BEFORE allocating any names or emitting defs.
    // Allocating up front would reserve synthetic names (skewing later numeric
    // suffixes) and could leave orphaned defs if a later branch then bailed out, so
    // the result would depend on the presence/order of unsupported branches.
    const entries = detected.branches.map(branchType)
    if (entries.some((e) => !e)) continue // unexpected branch shape: leave def untouched

    const owner = splitName(def.Name)
    const memberRefs = entries.map((entry, i) => {
      const { fields, label, supersedes } = variantRecord(detected.commonFields, entry, defMap, i)
      const memberLabel = trimRedundantPrefix(owner.local, label)
      const localName = `${owner.local}_${memberLabel}`
      const synthName = alloc(owner.domain ? `${owner.domain}.${localName}` : localName)
      created.push({
        Type: 'group',
        Name: synthName,
        IsChoiceAddition: false,
        Properties: fields,
        Comments: [],
        'x-selenium-synthetic': true,
        'x-selenium-owner': def.Name,
        'x-selenium-label': memberLabel,
      })
      if (supersedes) {
        superseded.add(supersedes)
        supersededBy.set(supersedes, synthName)
      }
      return groupRef(synthName)
    })

    delete def.Properties
    def.Type = 'variable'
    def.PropertyType = memberRefs
    def['x-selenium-union'] = true
  }

  // Drop source variant defs that the merge inlined and nothing else references.
  const result = [...out, ...created]
  const referenced = collectReferencedNames(result)
  const kept = result.filter((d) => !(superseded.has(d.Name) && !referenced.has(d.Name)))

  // A def hoisted out of a source variant (e.g. an enum) now belongs to the
  // record that absorbed it, so re-point a synthetic owner the merge dropped.
  const keptNames = new Set(kept.map((d) => d.Name))
  for (const def of kept) {
    const owner = def['x-selenium-owner']
    if (owner && !keptNames.has(owner) && supersededBy.has(owner)) def['x-selenium-owner'] = supersededBy.get(owner)
  }
  return kept
}

// ============================================================
// Transform 4: flatten group composition
// ============================================================

// Dispatch-hierarchy defs (the command/event union machinery) are not data
// records and must not be flattened into. A command/event leaf is identified by
// a `method` property whose type is the literal method string (e.g.
// "log.entryAdded") — not a data field that merely happens to be named `method`
// (e.g. log.ConsoleLogEntry.method, a plain text field).
function isDispatchType(def) {
  if (!def) return false
  if (/Command$|Event$/.test(def.Name ?? '')) return true
  return (def.Properties ?? []).flat().some((p) => {
    if (p?.Name !== 'method') return false
    const t = Array.isArray(p.Type) ? p.Type[0] : p.Type
    return t?.Type === 'literal'
  })
}

// A record group carries named fields (no top-level choice branches).
function isRecordGroup(def) {
  return def && def.Type === 'group' && Array.isArray(def.Properties) && !def.Properties.some((p) => Array.isArray(p))
}

/**
 * Inline anonymous group-ref spreads (CDDL group composition, e.g. a params
 * record that includes `network.BaseParameters`) so every record carries its
 * full field set — nothing composed-in is dropped. Spreading the `Extensible`
 * marker inlines its `* text => any` wildcard, which the projector reads as
 * `extensible`, so extensibility propagates for free. Spreads of unions or the
 * dispatch hierarchy are left as-is. Recursion is memoized and cycle-guarded.
 * @param {object[]} ast The AST to transform.
 * @returns {object[]} A new AST array with group composition flattened.
 */
export function flattenGroupComposition(ast) {
  const out = structuredClone(ast)
  const defMap = new Map(out.map((d) => [d.Name, d]))
  const cache = new Map()

  function mergedFields(name, seen) {
    if (cache.has(name)) return cache.get(name)
    const def = defMap.get(name)
    if (!isRecordGroup(def) || isDispatchType(def) || seen.has(name)) return null
    seen.add(name)
    const fields = []
    for (const prop of def.Properties.flat()) {
      if (!prop || typeof prop !== 'object') continue
      const entry = typeList(prop.Type)[0]
      const isSpread = !prop.Name && isGroupRef(entry)
      const composed = isSpread ? mergedFields(entry.Value, seen) : null
      if (composed) fields.push(...structuredClone(composed))
      else fields.push(prop)
    }
    seen.delete(name)
    cache.set(name, fields)
    return fields
  }

  for (const def of out) {
    if (!isRecordGroup(def) || isDispatchType(def)) continue
    const fields = mergedFields(def.Name, new Set())
    if (fields) def.Properties = structuredClone(fields)
  }
  return out
}

// ============================================================
// Pipeline
// ============================================================

/**
 * Drop duplicate definitions, keeping the first occurrence — the `*-all.cddl`
 * input concatenates local + remote specs that both define shared types. This
 * matches `buildModel`'s `buildDefMap` ("first wins") so the normalized artifact
 * carries one def per name.
 * @param {object[]} ast The AST to dedupe.
 * @returns {object[]} A new AST array with duplicate-named defs removed (first wins).
 */
export function dedupeDefs(ast) {
  const seen = new Set()
  const out = []
  for (const def of ast) {
    if (def && typeof def === 'object' && typeof def.Name === 'string') {
      if (seen.has(def.Name)) continue
      seen.add(def.Name)
    }
    out.push(def)
  }
  return out
}

/**
 * Apply all normalizations to a raw BiDi AST. Pure — does not mutate `ast`.
 * @param {object[]} ast The parsed CDDL AST (array of definition nodes).
 * @returns {object[]} A new, normalized AST array.
 */
export function normalizeAst(ast) {
  let result = dedupeDefs(ast)
  result = hoistInlineEnums(result)
  result = canonicalizeVariantParams(result)
  result = hoistInlineRecords(result)
  result = flattenGroupComposition(result)
  return result
}
