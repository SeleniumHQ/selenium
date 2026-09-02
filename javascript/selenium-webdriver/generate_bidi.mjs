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
 * Generate the shared WebDriver BiDi artifacts and TypeScript bindings from a
 * merged CDDL spec, as a three-stage pipeline — one stage per invocation:
 *
 *   1. parse     --cddl <f>  --dump-ast <f>                 CDDL → AST
 *   2. model     --ast  <f>  --dump-model <f>               AST → command/event model
 *   3. generate  --ast  <f>  --model <f>  --output-dir <d>  AST + model → one TS module per domain
 *                  [--spec-version <v>]
 */

import { parse } from 'cddl'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { basename, dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { parseArgs } from 'node:util'
import { projectSchema } from './project_bidi_schema.mjs'

// ============================================================
// Domain configuration
// ============================================================

// Maps the domain segment in a BiDi method string (e.g. "browsingContext"
// from "browsingContext.activate") to a canonical domain key.
const METHOD_DOMAIN_MAP = {
  browser: 'browser',
  browsingContext: 'browsingContext',
  emulation: 'emulation',
  input: 'input',
  log: 'log',
  network: 'network',
  permissions: 'permissions',
  script: 'script',
  session: 'session',
  speculation: 'speculation',
  storage: 'storage',
  userAgentClientHints: 'userAgentClientHints',
  webExtension: 'webExtension',
  bluetooth: 'bluetooth',
}

// Output filename for each domain key.
const DOMAIN_FILES = {
  browser: 'browser.ts',
  browsingContext: 'browsing_context.ts',
  emulation: 'emulation.ts',
  input: 'input.ts',
  log: 'log.ts',
  network: 'network.ts',
  permissions: 'permissions.ts',
  script: 'script.ts',
  session: 'session.ts',
  speculation: 'speculation.ts',
  storage: 'storage.ts',
  userAgentClientHints: 'user_agent_client_hints.ts',
  webExtension: 'webextension.ts',
  bluetooth: 'bluetooth.ts',
  common: 'common.ts',
}

// Implementation class name for each domain key.
// Domains absent from this map only receive type definitions (no class).
const DOMAIN_CLASSES = {
  browser: 'Browser',
  browsingContext: 'BrowsingContext',
  emulation: 'Emulation',
  input: 'Input',
  log: 'Log',
  network: 'Network',
  permissions: 'Permissions',
  script: 'Script',
  session: 'Session',
  speculation: 'Speculation',
  storage: 'Storage',
  userAgentClientHints: 'UserAgentClientHints',
  webExtension: 'WebExtension',
  bluetooth: 'Bluetooth',
}

// ============================================================
// Path helpers
// ============================================================

/**
 * Resolve a path that came from a Bazel $(location …) expansion.
 *
 * When a js_binary runs inside a js_run_binary action Bazel sets BAZEL_BINDIR
 * and the js_binary wrapper calls process.chdir(BAZEL_BINDIR) before handing
 * control to the script. $(location) values are relative to the *execroot*,
 * so they already contain the BAZEL_BINDIR prefix. Stripping that prefix
 * makes them relative to the CWD, after which path.resolve() works correctly.
 * Outside Bazel (BAZEL_BINDIR unset) paths are resolved normally.
 */
function resolveInputPath(p) {
  if (!p) return null
  if (!process.env.BAZEL_BINDIR) return resolve(p)
  // Normalize both strings to forward slashes before prefix-stripping so that
  // mixed separators on Windows (BAZEL_BINDIR uses '\', $(location) uses '/')
  // do not cause the startsWith check to silently fail.
  const normalizedP = p.replaceAll('\\', '/')
  const normalizedBindir = process.env.BAZEL_BINDIR.replaceAll('\\', '/')
  const prefix = normalizedBindir + '/'
  return resolve(normalizedP.startsWith(prefix) ? normalizedP.slice(prefix.length) : normalizedP)
}

// ============================================================
// Main
// ============================================================

async function main() {
  const { values: args } = parseArgs({
    options: {
      cddl: { type: 'string', multiple: true },
      'override-cddl': { type: 'string', multiple: true },
      'vendor-cddl': { type: 'string', multiple: true },
      ast: { type: 'string' },
      model: { type: 'string' },
      'dump-ast': { type: 'string' },
      'dump-model': { type: 'string' },
      'output-dir': { type: 'string' },
      'spec-version': { type: 'string', default: '1.0' },
    },
  })

  // One pipeline stage per invocation; the flags select the stage.
  if (args['dump-ast'] && args.cddl?.length) {
    // The base spec is several CDDL files (webdriver-bidi + the adjacent specs); each
    // is parsed independently and their definitions concatenated. Top-level CDDL
    // productions are position-independent (refs resolve by name later), so this equals
    // parsing one merged file — without a separate merge step or tool. Spec-shaped Selenium
    // overrides (e.g. #1140) are applied here; vendor overlays are NOT, so this base AST —
    // which feeds the model and the browser-neutral TypeScript binding — stays vendor-free.
    const baseAst = args.cddl.flatMap(parseCddl)
    writeJson(args['dump-ast'], applyOverrides(baseAst, args['override-cddl'] ?? []), 'ast')
  } else if (args['dump-ast'] && args.ast && args['vendor-cddl']?.length) {
    // The base AST plus vendor overlays, consumed ONLY by the schema projector. Applying vendor
    // on this separate path (rather than into the shared base AST) is what keeps the tagged
    // vendor fields out of cddl2ts and the model — the schema step segregates them into `vendor`.
    writeJson(args['dump-ast'], applyVendor(readJson(args.ast, 'AST'), args['vendor-cddl']), 'ast')
  } else if (args['dump-model'] && args.ast) {
    writeJson(args['dump-model'], buildModel(readJson(args.ast, 'AST')), 'model', true)
  } else if (args['output-dir'] && args.ast && args.model) {
    generateTypeScript(readJson(args.ast, 'AST'), readJson(args.model, 'model'), args)
  } else {
    console.error(
      'Usage (one stage per invocation):\n' +
        '  generate_bidi.mjs --cddl <file> [--cddl <file>...] --dump-ast <file>\n' +
        '  generate_bidi.mjs --ast <file> --dump-model <file>\n' +
        '  generate_bidi.mjs --ast <file> --model <file> --output-dir <dir> [--spec-version <v>]',
    )
    process.exit(1)
  }
}

function parseCddl(cddlArg) {
  const cddlPath = resolveInputPath(cddlArg)
  if (!existsSync(cddlPath)) {
    console.error(`Error: CDDL file not found: ${cddlPath}`)
    process.exit(1)
  }
  console.log(`Parsing CDDL: ${cddlPath}`)
  const ast = parse(cddlPath)
  console.log(`  ${ast.length} top-level definitions`)
  return ast
}

/**
 * Apply Selenium overlay CDDL (see common/bidi/) to the parsed upstream AST: any
 * production an overlay defines replaces the identically named upstream one, which is
 * dropped. Kept here rather than in the shared CDDL merge so the overlay is a
 * schema-generation concern only — the upstream grammars other bindings consume are
 * untouched. Overlay defs are appended so downstream normalization treats them like
 * any other definition.
 */
function applyOverrides(ast, overrideArgs) {
  if (!overrideArgs.length) return ast
  const overrides = overrideArgs.flatMap((arg) => parseCddl(arg))
  const names = new Set(overrides.filter((d) => d?.Name).map((d) => d.Name))
  return [...ast.filter((d) => !(d?.Name && names.has(d.Name))), ...overrides]
}

/**
 * Apply Selenium vendor overlay CDDL (see common/bidi/*-extensions.cddl) to the AST.
 * A vendor overlay extends a spec extension point (e.g. `webExtension.InstallParametersExtension
 * //= (...)`) with typed browser-specific fields. Unlike a plain override, every field a vendor
 * overlay contributes is tagged with its provenance — the vendor namespace (from the field's wire
 * key prefix, e.g. `moz:` → `moz`) and the extension point it flows through — so the projector can
 * resolve it against the real extension point (the merge genuinely happens) yet route it out of the
 * shared, browser-neutral schema into a separate `vendor` section. Vendor defs are appended after
 * overrides so the extension point they extend is already present for the `//=` fold.
 */
function applyVendor(ast, vendorArgs) {
  if (!vendorArgs.length) return ast
  const vendorDefs = vendorArgs.flatMap((arg) => tagVendorDefs(parseCddl(arg), vendorFileStem(arg)))
  return [...ast, ...vendorDefs]
}

function vendorFileStem(cddlArg) {
  return basename(resolveInputPath(cddlArg)).replace(/\.cddl$/, '')
}

// The vendor namespace is intrinsic to the field: a `moz:permanent` wire key belongs to `moz`.
// Fields without a namespaced key fall back to the overlay file's stem.
function vendorNamespaceOf(wireKey, fallback) {
  const i = typeof wireKey === 'string' ? wireKey.indexOf(':') : -1
  return i > 0 ? wireKey.slice(0, i) : fallback
}

// Stamp `x-selenium-vendor` (namespace) and `x-selenium-vendor-via` (the extension-point def the
// field extends) onto every named field a vendor overlay def declares. The tags ride through the
// AST JSON round-trip and normalization (the `//=` fold and group flatten preserve them) so the
// projector can partition them out of the shared schema by provenance.
function tagVendorDefs(defs, fileStem) {
  for (const def of defs) {
    const via = def.Name
    const walk = (props) => {
      for (const p of props ?? []) {
        if (Array.isArray(p)) {
          walk(p)
          continue
        }
        if (!p || typeof p !== 'object') continue
        if (p.Name) {
          p['x-selenium-vendor'] = vendorNamespaceOf(p.Name, fileStem)
          p['x-selenium-vendor-via'] = via
        }
        if (Array.isArray(p.Properties)) walk(p.Properties)
      }
    }
    walk(def.Properties)
  }
  return defs
}

function readJson(fileArg, label) {
  const path = resolveInputPath(fileArg)
  if (!existsSync(path)) {
    console.error(`Error: ${label} file not found: ${path}`)
    process.exit(1)
  }
  return JSON.parse(readFileSync(path, 'utf8'))
}

function writeJson(fileArg, data, label, pretty = false) {
  const out = resolve(fileArg)
  writeFileSync(out, pretty ? JSON.stringify(data, null, 2) + '\n' : JSON.stringify(data), 'utf8')
  console.log(`  → ${out} (${label})`)
}

/** Emit one TS module per domain: types and commands/events, both from bidi_schema.json. */
function generateTypeScript(ast, model, args) {
  const outputDir = resolve(args['output-dir'])
  const specVersion = args['spec-version']

  console.log('Projecting the binding-neutral schema…')
  const schema = projectSchema(ast, model)
  console.log(
    `  ${schema.commands.length} commands, ${schema.events.length} events, ${Object.keys(schema.types).length} types`,
  )

  const typesByDomain = groupTypesByDomain(schema.types)
  const allCommands = schemaToCommands(schema)
  const allEvents = schemaToEvents(schema)

  mkdirSync(outputDir, { recursive: true })

  for (const [domainKey, filename] of Object.entries(DOMAIN_FILES)) {
    const types = typesByDomain[domainKey] ?? {}
    const commands = allCommands.filter((c) => c.domain === domainKey)
    const events = allEvents.filter((e) => e.domain === domainKey)
    const className = DOMAIN_CLASSES[domainKey]

    const content = generateDomainFile({
      domain: domainKey,
      className,
      types,
      commands,
      events,
      specVersion,
    })

    const outPath = join(outputDir, filename)
    writeFileSync(outPath, content, 'utf8')
    console.log(`  → ${outPath}`)
  }

  console.log('Done.')
}

// ============================================================
// Schema-derived domain grouping
// ============================================================

/** A schema type name's domain segment, e.g. 'network.AddIntercept' -> 'network'. */
function domainForTypeName(name) {
  const dotIdx = name.indexOf('.')
  if (dotIdx === -1) return 'common'
  return METHOD_DOMAIN_MAP[name.slice(0, dotIdx)] ?? 'common'
}

/** Groups the schema's flat `types` map into `{ domain: { typeName: node } }`. */
function groupTypesByDomain(types) {
  const result = {}
  for (const [name, node] of Object.entries(types)) {
    const domain = domainForTypeName(name)
    ;(result[domain] ??= {})[name] = node
  }
  return result
}

// ============================================================
// Pass 2: AST analysis
// ============================================================

/**
 * Returns the set of group names that carry no named parameters.
 * This includes truly empty groups AND groups whose only properties are
 * anonymous inclusions (e.g. `EmptyParams = { Extensible }`) — those are
 * extensibility markers with no protocol fields of their own.
 */
function buildEmptyParamTypes(ast) {
  const empty = new Set()
  for (const def of ast) {
    if (def.Type !== 'group' || !Array.isArray(def.Properties)) continue
    const flat = def.Properties.flatMap((p) => (Array.isArray(p) ? p : [p]))
    const hasNamedProp = flat.some((p) => p.Name && p.Name !== '')
    if (!hasNamedProp) empty.add(def.Name)
  }
  return empty
}

/**
 * Convert a dotted CDDL name to PascalCase TypeScript name.
 * "browsingContext.Info" → "BrowsingContextInfo"
 */
function normalizeDottedName(name) {
  return name
    .split('.')
    .map((part) =>
      // A schema name segment may itself be hyphenated (e.g. the CDDL prelude
      // range aliases 'js-uint'/'js-int'), which isn't a valid TS identifier
      // character — split on '-' too so each word gets its own PascalCase turn.
      part
        .split('-')
        .map((word) => {
          const titled = word.charAt(0).toUpperCase() + word.slice(1)
          // Normalize acronym runs to match cddl2ts output:
          //   CSPParameters → CspParameters   HTMLCollection → HtmlCollection
          // Rule: 2+ uppercase letters followed by an uppercase+lowercase pair (or end
          // of string) → keep only the first uppercase and lowercase the rest.
          return titled.replace(/([A-Z]{2,})(?=[A-Z][a-z]|$)/g, (m) => m[0] + m.slice(1).toLowerCase())
        })
        .join(''),
    )
    .join('')
}

/**
 * Walk the `CommandData` or `EventData` union type hierarchy and collect all
 * leaf definition names (the actual command/event group names).
 *
 * The CDDL AST represents union groups with Properties that can be:
 *   - An array of choice objects (each with a Type.Value pointing to the next level)
 *   - A single property object with Type as an array or direct object
 *
 * A leaf is a definition that itself has a `method` property (string literal).
 */
function collectUnionMembers(rootName, defMap, visited = new Set()) {
  if (visited.has(rootName)) return new Set()
  visited.add(rootName)

  const def = defMap.get(rootName)
  if (!def) return new Set()

  const members = new Set()

  // Flatten Properties — each element is either a choice-array or a property object.
  const rawProps = def.Properties ?? []
  const allChoices = []
  for (const prop of rawProps) {
    if (Array.isArray(prop)) {
      allChoices.push(...prop)
    } else {
      allChoices.push(prop)
    }
  }

  for (const choice of allChoices) {
    // choice.Type can be a single object or an array of type alternatives.
    const typeEntries = Array.isArray(choice.Type) ? choice.Type : [choice.Type]

    for (const entry of typeEntries) {
      if (entry?.Type !== 'group' || !entry.Value) continue
      const childName = entry.Value
      const childDef = defMap.get(childName)
      if (!childDef) continue

      // A leaf has a `method` property — it is the actual command or event definition.
      const childProps = childDef.Properties ?? []
      const flat = childProps.flatMap((p) => (Array.isArray(p) ? p : [p]))
      if (flat.some((p) => p.Name === 'method')) {
        members.add(childName)
      } else {
        // Intermediate union — recurse.
        for (const m of collectUnionMembers(childName, defMap, visited)) {
          members.add(m)
        }
      }
    }
  }

  return members
}

/**
 * Build a name → definition map from the AST (deduplicated — first wins).
 */
function buildDefMap(ast) {
  const map = new Map()
  for (const def of ast) {
    if (def.Name && !map.has(def.Name)) map.set(def.Name, def)
  }
  return map
}

/** Extract {domain, methodStr, operationName, paramsCddl} from a command/event leaf def. */
function parseLeafDef(def) {
  const flatProps = (def.Properties ?? []).flatMap((p) => (Array.isArray(p) ? p : [p]))

  const methodProp = flatProps.find((p) => p.Name === 'method')
  const paramsProp = flatProps.find((p) => p.Name === 'params')
  if (!methodProp || !paramsProp) return null

  const methodLiteral = Array.isArray(methodProp.Type) ? methodProp.Type : [methodProp.Type]
  if (methodLiteral[0]?.Type !== 'literal') return null

  const methodStr = methodLiteral[0].Value // e.g. "browser.createUserContext"
  const dotIdx = methodStr.indexOf('.')
  if (dotIdx === -1) return null

  const domainRaw = methodStr.slice(0, dotIdx)
  const operationName = methodStr.slice(dotIdx + 1)
  const domain = METHOD_DOMAIN_MAP[domainRaw] ?? 'common'

  const paramsTypeEntries = Array.isArray(paramsProp.Type) ? paramsProp.Type : [paramsProp.Type]
  let paramsCddl = null
  if (paramsTypeEntries[0]?.Type === 'group' && paramsTypeEntries[0]?.Value) {
    paramsCddl = paramsTypeEntries[0].Value
  }

  return { domain, methodStr, operationName, paramsCddl }
}

/**
 * Collect all leaf command/event names from every XxxCommand / XxxEvent
 * union that can be reached from either the core BiDi root (`CommandData` /
 * `EventData`) or from extension-spec roots (e.g. `PermissionsCommand`,
 * `SpeculationEvent`).  Extension specs are not wired into `CommandData` /
 * `EventData` inside the core BiDi CDDL, so a second pass is required.
 */
function collectAllMembers(defMap, rootSuffix) {
  const members = new Set()

  // Primary traversal from the core BiDi root.
  const rootName = rootSuffix === 'Command' ? 'CommandData' : 'EventData'
  for (const m of collectUnionMembers(rootName, defMap)) members.add(m)

  // Secondary traversal: pick up any XxxCommand / XxxEvent unions in
  // extension specs whose members were not already found above.
  for (const [name, def] of defMap) {
    if (!name.endsWith(rootSuffix) || name === rootName) continue
    if (def.Type !== 'variable' && def.Type !== 'group') continue
    for (const m of collectUnionMembers(name, defMap)) members.add(m)
  }

  return members
}

/** Extract all BiDi commands by traversing CommandData and extension XxxCommand unions. */
function extractCommands(ast) {
  const defMap = buildDefMap(ast)
  const emptyParamTypes = buildEmptyParamTypes(ast)
  const commandNames = collectAllMembers(defMap, 'Command')
  const commands = []

  for (const name of commandNames) {
    const def = defMap.get(name)
    if (!def) continue

    const parsed = parseLeafDef(def)
    if (!parsed) continue

    const { domain, methodStr, operationName: methodName, paramsCddl } = parsed
    // emptyParamTypes holds raw CDDL group names, so compare the raw name (not the normalized one).
    const hasParams = paramsCddl !== null && !emptyParamTypes.has(paramsCddl)

    commands.push({
      domain,
      cddlName: name,
      methodStr,
      methodName,
      paramsCddl,
      hasParams,
    })
  }

  return commands
}

/** Extract all BiDi events by traversing EventData and extension XxxEvent unions. */
function extractEvents(ast) {
  const defMap = buildDefMap(ast)
  const eventNames = collectAllMembers(defMap, 'Event')
  const events = []

  for (const name of eventNames) {
    const def = defMap.get(name)
    if (!def) continue

    const parsed = parseLeafDef(def)
    if (!parsed) continue

    const { domain, methodStr, operationName: eventName, paramsCddl } = parsed

    events.push({
      domain,
      methodStr,
      eventName,
      paramsCddl,
    })
  }

  return events
}

// ============================================================
// Binding-neutral model
// ============================================================

/**
 * Build the binding-neutral model from the AST. Type refs are CDDL names.
 * Shape per domain key:
 *   { commands: [{ method, name, params, result }],
 *     events:   [{ method, name, params }] }
 * `params`/`result` are null when there are no params / no return value.
 */
function buildModel(ast) {
  const model = {}
  const resultTypes = buildResultTypeNames(ast)
  const ensure = (domain) => (model[domain] ??= { commands: [], events: [] })

  for (const c of extractCommands(ast)) {
    const result = c.cddlName + 'Result'
    ensure(c.domain).commands.push({
      method: c.methodStr,
      name: c.methodName,
      params: c.hasParams ? c.paramsCddl : null,
      result: resultTypes.has(result) ? result : null,
    })
  }

  for (const e of extractEvents(ast)) {
    ensure(e.domain).events.push({
      method: e.methodStr,
      name: e.eventName,
      params: e.paramsCddl || null,
    })
  }

  return model
}

/** Result type names the spec defines with a value; an absent or `EmptyResult`-aliased result is void. */
function buildResultTypeNames(ast) {
  const emptyAlias = new Set()
  for (const d of ast) {
    const pt = d.PropertyType
    if (d.Name && d.Type === 'variable' && Array.isArray(pt) && pt.length === 1 && pt[0]?.Value === 'EmptyResult') {
      emptyAlias.add(d.Name)
    }
  }
  const names = new Set()
  for (const d of ast) {
    if (d.Name && d.Name.endsWith('Result') && !emptyAlias.has(d.Name)) names.add(d.Name)
  }
  return names
}

/** Map the schema's commands to the generator's command-entry shape. */
function schemaToCommands(schema) {
  return schema.commands.map((c) => ({
    domain: c.domain,
    methodStr: c.method,
    methodName: c.name,
    paramsTypeName: c.params ? normalizeDottedName(c.params.ref) : null,
    hasParams: c.params !== null,
    resultTypeName: c.result ? normalizeDottedName(c.result.ref) : null,
  }))
}

/** Map the schema's events to the generator's event-entry shape. */
function schemaToEvents(schema) {
  return schema.events.map((e) => ({
    domain: e.domain,
    methodStr: e.method,
    eventName: e.name,
    paramsTypeName: e.params ? normalizeDottedName(e.params.ref) : null,
  }))
}

// ============================================================
// Code generation
// ============================================================

// Shared license + note text, copied next to this script by BUILD.bazel — see scripts/*.txt.
const GENERATOR_DIR = dirname(fileURLToPath(import.meta.url))
const commentLines = (text) =>
  text
    .split('\n')
    .map((line) => `// ${line}`.trimEnd())
    .join('\n')

const LICENSE_HEADER = commentLines(readFileSync(join(GENERATOR_DIR, 'license_header.txt'), 'utf8').replace(/\n$/, ''))

const GENERATED_NOTE = commentLines(
  readFileSync(join(GENERATOR_DIR, 'generated_note_template.txt'), 'utf8')
    .replace('{generator}', 'javascript/selenium-webdriver/generate_bidi.mjs')
    .replace('{command}', 'bazel build //javascript/selenium-webdriver:create-bidi-src')
    .trim(),
)

// ============================================================
// Schema type node -> TypeScript, and cross-domain imports
// ============================================================

const PRIMITIVE_TS = { string: 'string', integer: 'number', number: 'number', boolean: 'boolean', null: 'null' }

/** Converts a schema type-ref node into a TypeScript type expression. */
function typeNodeToTs(node) {
  if (!node) return 'unknown'
  let base
  if (node.primitive !== undefined) {
    base = PRIMITIVE_TS[node.primitive] ?? 'unknown'
  } else if (node.const !== undefined) {
    base = JSON.stringify(node.const)
  } else if (node.ref !== undefined) {
    base = normalizeDottedName(node.ref)
  } else if (node.enum !== undefined) {
    base = node.enum.map((v) => JSON.stringify(v)).join(' | ')
  } else if (node.list !== undefined) {
    base = `Array<${typeNodeToTs(node.list)}>`
  } else if (node.map !== undefined) {
    base = `Record<string, ${typeNodeToTs(node.map)}>`
  } else if (node.union !== undefined) {
    base = node.union.map((v) => typeNodeToTs(v)).join(' | ')
  } else {
    base = 'unknown'
  }
  return node.nullable ? `${base} | null` : base
}

/** The type-name refs a projected ref node points at (list/map/union recurse). */
function refsIn(node) {
  if (!node) return []
  if (node.ref) return [node.ref]
  if (node.list) return refsIn(node.list)
  if (node.map) return refsIn(node.map)
  if (node.union) return node.union.flatMap(refsIn)
  return []
}

/** The type-name refs a type *node* (record/union/alias) points at. */
function typeRefNames(node) {
  if (node.kind === 'record') {
    const refs = node.fields.flatMap((f) => refsIn(f.type))
    if (node.map) refs.push(...refsIn(node.map))
    return refs
  }
  if (node.kind === 'union') return node.variants
  if (node.kind === 'alias') return refsIn(node.type)
  return []
}

/**
 * Import statements for every other-domain type this domain's types reference: a
 * type-only import for the TS names themselves, plus a plain side-effect import of
 * the same module. The type-only import is erased at compile time (it exists purely
 * for `tsc`), so it registers nothing at runtime — a caller who only imports, say,
 * `session.js` would never actually load `browsing_context.js`, leaving every
 * `browsingContext.*` type unregistered in the shared runtime registry (registry.js)
 * and silently skipping deep validation for any field that refs one (see
 * validateValue()'s `if (referenced === undefined) return value` in record.js).
 * The side-effect import forces that module to load — and therefore register its
 * types — regardless of whether this domain is used standalone. Safe even when two
 * domains reference each other (e.g. session <-> browsingContext): CommonJS resolves
 * a require() cycle by returning the other module's not-yet-complete exports, but a
 * bare side-effect import binds nothing, and no type here is read at define time
 * anyway — resolution happens lazily, at validation time (registry.js), by which
 * point both modules have finished loading.
 */
function computeCrossDomainImports(types, domain) {
  const bySourceDomain = new Map()
  for (const node of Object.values(types)) {
    for (const ref of typeRefNames(node)) {
      const sourceDomain = domainForTypeName(ref)
      if (sourceDomain === domain) continue
      if (!bySourceDomain.has(sourceDomain)) bySourceDomain.set(sourceDomain, new Set())
      bySourceDomain.get(sourceDomain).add(normalizeDottedName(ref))
    }
  }

  const imports = []
  for (const [sourceDomain, names] of [...bySourceDomain.entries()].sort()) {
    const sourceFile = DOMAIN_FILES[sourceDomain].replace('.ts', '.js')
    imports.push(`import type { ${[...names].sort().join(', ')} } from './${sourceFile}'`)
    imports.push(`import './${sourceFile}'`)
  }
  return imports
}

/**
 * Emits one schema type's TS declaration plus the runtime call that registers
 * it for validation — see bidi/serialization/{record,enum,union}.js. Returns
 * the runtime binding's own name and kind too, so a command method in the
 * same domain can reference it directly (e.g. to validate its params before
 * sending, or parse its result via fromWire()) rather than only reaching
 * nested/cross-domain refs indirectly through the shared registry.
 */
function generateTypeDeclaration(name, node) {
  const tsName = normalizeDottedName(name)

  if (node.kind === 'enum') {
    const runtimeName = `${tsName}Enum`
    const literal = node.values.map((v) => JSON.stringify(v)).join(' | ')
    const ts = [
      `export type ${tsName} = ${literal}`,
      `const ${runtimeName} = defineEnum<${tsName}>('${name}', ${JSON.stringify(node.values)})`,
    ].join('\n')
    return { ts, runtimeName, kind: 'enum' }
  }

  if (node.kind === 'alias') {
    const ts = [
      `export type ${tsName} = ${typeNodeToTs(node.type)}`,
      `defineAlias('${name}', ${JSON.stringify(node.type)})`,
    ].join('\n')
    return { ts, runtimeName: null, kind: 'alias' }
  }

  if (node.kind === 'record') {
    // No suffix: an interface and a const may share one name in TS (they live in
    // separate type/value spaces, and only the const survives compilation to JS) —
    // verified this compiles clean. Two names for one concept was self-inflicted
    // confusion, not a real requirement; Ruby's generator uses one name too.
    const runtimeName = tsName
    const lines = [`export interface ${tsName} {`]
    for (const field of node.fields) {
      // Tolerating a missing required field's absence is no longer required —
      // fromWire() now rejects a missing required field the same as any other
      // invalid value, so a required field is always present, nullable or not.
      const optional = !field.required
      lines.push(`  ${field.name}${optional ? '?' : ''}: ${typeNodeToTs(field.type)}`)
    }
    lines.push(`}`)
    const optionsArg = node.extensible ? `, ${JSON.stringify({ extensible: true })}` : ''
    lines.push(`const ${runtimeName} = defineRecord<${tsName}>('${name}', ${JSON.stringify(node.fields)}${optionsArg})`)
    return { ts: lines.join('\n'), runtimeName, kind: 'record' }
  }

  if (node.kind === 'union') {
    const runtimeName = `${tsName}Union`
    const memberNames = node.variants.map((v) => normalizeDottedName(v))
    const options = {}
    if (node.objectOnly) options.objectOnly = true
    const optionsArg = Object.keys(options).length ? `, ${JSON.stringify(options)}` : ''
    const ts = [
      `export type ${tsName} = ${memberNames.join(' | ')}`,
      `const ${runtimeName} = defineUnion<${tsName}>('${name}', ${JSON.stringify(node.selector)}${optionsArg})`,
    ].join('\n')
    return { ts, runtimeName, kind: 'union' }
  }

  return { ts: `export type ${tsName} = unknown`, runtimeName: null, kind: 'unknown' }
}

function generateDomainFile({ domain, className, types, commands, events, specVersion }) {
  const parts = [LICENSE_HEADER, '', GENERATED_NOTE]

  parts.push(`// Built from the WebDriver BiDi CDDL spec (v${specVersion}).`)
  parts.push(`// Source: https://github.com/w3c/webref/tree/main/ed/cddl`)
  parts.push('')

  const hasImplementation = className != null && (commands.length > 0 || events.length > 0)

  const typeEntries = Object.entries(types)

  const crossDomainImports = computeCrossDomainImports(Object.fromEntries(typeEntries), domain)
  if (crossDomainImports.length > 0) {
    for (const line of crossDomainImports) parts.push(line)
    parts.push('')
  }

  if (typeEntries.length > 0) {
    parts.push(`import { defineRecord, defineAlias } from '../serialization/record.js'`)
    parts.push(`import { defineEnum } from '../serialization/enum.js'`)
    parts.push(`import { defineUnion } from '../serialization/union.js'`)
    parts.push('')
  }

  if (hasImplementation) {
    // Domain.connect(driver) reaches the one BiDi connection for `driver`
    // through the real internal accessor (never the deprecated driver.getBidi()).
    parts.push(`import { Domain, event, type EventDescriptor, DOMAIN_TOKEN } from '../domain.js'`)
    parts.push('')
  }

  // tsName -> {runtimeName, kind, fields?}, so a command method in this same file
  // can validate its own params/result directly (rather than only reaching
  // nested/cross-domain refs indirectly through the shared registry) and document
  // each params field in its JSDoc from the same field list, not a second copy.
  const runtimeByTsName = new Map()
  // Enum constants owned by this domain, exposed as a discoverable static property
  // on the domain class (or a top-level export when there's no class to attach to) —
  // e.g. Network.SameSite = { STRICT: 'strict', ... }, mirroring how Ruby's generator
  // exposes Network::SAME_SITE as a real, inspectable constant rather than a bare string.
  const enumConstants = []

  if (typeEntries.length > 0) {
    parts.push(`// --- Types ---`)
    parts.push('')
    for (const [name, node] of typeEntries) {
      const declared = generateTypeDeclaration(name, node)
      const tsName = normalizeDottedName(name)
      if (declared.runtimeName) {
        runtimeByTsName.set(tsName, {
          runtimeName: declared.runtimeName,
          kind: declared.kind,
          fields: node.kind === 'record' ? node.fields : undefined,
        })
      }
      if (declared.kind === 'enum') {
        enumConstants.push({ propertyName: localSchemaName(name, tsName), values: node.values })
      }
      parts.push(declared.ts)
      parts.push('')
    }
  }

  if (!hasImplementation && enumConstants.length > 0) {
    parts.push(`// --- Enum constants ---`)
    parts.push('')
    for (const { propertyName, values } of enumConstants) {
      parts.push(`export const ${propertyName} = ${generateEnumConstantLiteral(values)}`)
    }
    parts.push('')
  }

  if (hasImplementation) {
    parts.push(`// --- Implementation ---`)
    parts.push('')
    parts.push(
      generateClass({
        className,
        commands,
        events,
        runtimeByTsName,
        enumConstants,
      }),
    )
  }

  return parts.join('\n') + '\n'
}

// Disclaimer attached to every generated class — matches Java's BiDiGenerator.
const INTERNAL_API_DOC = [
  '/**',
  ' * This is an unsupported API. No compatibility guarantees are provided.',
  ' * It tracks the W3C WebDriver BiDi specification directly. As the specification',
  ' * evolves, this API will change or be removed without prior notice.',
  ' */',
].join('\n')

// camelCase -> SCREAMING_SNAKE_CASE, for event descriptor constant names
// ("beforeRequestSent" -> "BEFORE_REQUEST_SENT") and enum constant keys
// ("beforeRequestSent" -> "BEFORE_REQUEST_SENT", "strict" -> "STRICT").
function screamingSnakeCase(camel) {
  return camel.replace(/([a-z0-9])([A-Z])/g, '$1_$2').toUpperCase()
}

// The un-prefixed local segment of a dotted schema name, PascalCased —
// 'network.InterceptPhase' -> 'InterceptPhase'. Used for a static enum constant's
// property name on its owning domain class, where the class already implies the
// domain (Network.InterceptPhase, not Network.NetworkInterceptPhase).
function localSchemaName(name, tsNameFallback) {
  const dotIdx = name.indexOf('.')
  return dotIdx === -1 ? tsNameFallback : normalizeDottedName(name.slice(dotIdx + 1))
}

// A valid JS identifier for an enum constant's key, derived from its wire value.
// Unlike event/method names (always clean camelCase), some enum values are
// space- or hyphen-separated (error.ErrorCode: "invalid argument", emulation.
// ScreenOrientationType: "portrait-primary") or start with a character no JS
// identifier can (script.SpecialNumber: "-0", "-Infinity") — normalize those
// separators to underscores, and guard a still-invalid leading digit, before
// screamingSnakeCase's uppercasing, so every generated key actually parses.
function enumConstantKey(value) {
  const key = screamingSnakeCase(String(value).replace(/[-\s]+/g, '_'))
  return /^[0-9]/.test(key) ? `_${key}` : key
}

// A frozen, inspectable object literal for an enum's values — the JS-idiomatic
// answer to Ruby's `Network::INTERCEPT_PHASE` constant (see
// serialization.rb's Serialization module): a real value a caller can log,
// autocomplete on, or iterate, instead of a bare string they have to already know.
// Raw string values (e.g. 'beforeRequestSent') keep working unchanged — this is
// purely an additional, discoverable way to reach the same values.
function generateEnumConstantLiteral(values) {
  const entries = values.map((v) => `${enumConstantKey(v)}: ${JSON.stringify(v)}`).join(', ')
  return `Object.freeze({ ${entries} } as const)`
}

// The WebDriver BiDi spec's own anchor format for a command/event section
// (e.g. '#command-network-addIntercept', '#event-network-beforeRequestSent') —
// matches the @see links Ruby's generator emits for the same commands/events.
function specSectionUrl(methodStr, kind) {
  const [domain, local] = methodStr.split('.')
  return `https://w3c.github.io/webdriver-bidi/#${kind}-${domain}-${local}`
}

function generateClass({ className, commands, events, runtimeByTsName, enumConstants }) {
  const lines = []

  lines.push(INTERNAL_API_DOC)
  lines.push(`export class ${className} extends Domain {`)

  for (const evt of events) {
    lines.push('')
    lines.push(generateEventDescriptor(evt, runtimeByTsName))
  }

  for (const { propertyName, values } of enumConstants) {
    lines.push('')
    lines.push(`  static readonly ${propertyName} = ${generateEnumConstantLiteral(values)}`)
  }

  lines.push('')
  lines.push(`  static async create(driver: unknown): Promise<${className}> {`)
  lines.push(`    return new ${className}(await Domain.connect(driver), DOMAIN_TOKEN)`)
  lines.push(`  }`)

  for (const cmd of commands) {
    lines.push('')
    lines.push(generateCommandMethod(cmd, runtimeByTsName))
  }

  lines.push(`}`)
  return lines.join('\n')
}

// A static EventDescriptor<T> constant — no subscribe/dispatch method. Callers
// reach events via the inherited addCallback(descriptor, handler), never a
// per-event generated method. When the params type has a registered runtime
// (record/union), it's passed to event() so addCallback() can validate each
// delivered payload through fromWire() before the caller's handler runs.
function generateEventDescriptor(evt, runtimeByTsName) {
  const { eventName, methodStr, paramsTypeName } = evt
  const paramsType = paramsTypeName ?? 'unknown'
  const constName = screamingSnakeCase(eventName)
  const paramsRuntime = paramsTypeName ? runtimeByTsName.get(paramsTypeName) : undefined
  const runtimeArg =
    paramsRuntime?.kind === 'record' || paramsRuntime?.kind === 'union' ? `, ${paramsRuntime.runtimeName}` : ''
  const doc = `  /** @see ${specSectionUrl(methodStr, 'event')} */`
  return `${doc}\n  static readonly ${constName}: EventDescriptor<${paramsType}> = event('${methodStr}'${runtimeArg})`
}

// A JSDoc block for a generated command method — readable without any TypeScript
// tooling, since a plain-JS user gets no autocomplete from the sibling .d.ts unless
// their editor happens to resolve it. Unrolls each params field individually (from
// the same field list defineRecord() validates against, not a second copy of it) so
// required vs. optional is visible in an ordinary hover, matching what Ruby's
// generator gives for free via real keyword arguments in the method signature.
function generateCommandJsDoc(cmd, paramsRuntime, resultTypeName) {
  const { methodStr, paramsTypeName, hasParams } = cmd
  const lines = ['  /**']
  if (hasParams) {
    lines.push(`   * @param {${paramsTypeName}} params`)
    for (const field of paramsRuntime?.fields ?? []) {
      const tsType = typeNodeToTs(field.type)
      const tag = field.required ? `params.${field.name}` : `[params.${field.name}]`
      lines.push(`   * @param {${tsType}} ${tag}`)
    }
  }
  lines.push(`   * @returns {Promise<${resultTypeName ?? 'void'}>}`)
  lines.push(`   * @see ${specSectionUrl(methodStr, 'command')}`)
  lines.push('   */')
  return lines.join('\n')
}

function generateCommandMethod(cmd, runtimeByTsName) {
  const { methodName, methodStr, paramsTypeName, hasParams, resultTypeName } = cmd
  const isVoid = resultTypeName === null
  const returnType = isVoid ? 'void' : resultTypeName

  // Use a double-cast (T as unknown as Record<string,unknown>) so TypeScript
  // accepts the conversion even when the params type has no index signature.
  // Only actually used when there's no RecordClass/UnionClass to build a validated
  // instance from below (paramsRuntime undefined) — otherwise sendArg overrides it.
  const paramsCast = hasParams ? '(params as unknown as Record<string, unknown>)' : '{}'
  const paramsRuntime = hasParams ? runtimeByTsName.get(paramsTypeName) : undefined
  const resultRuntime = !isVoid ? runtimeByTsName.get(resultTypeName) : undefined

  const lines = [generateCommandJsDoc(cmd, paramsRuntime, isVoid ? null : resultTypeName)]
  if (hasParams) {
    lines.push(`  async ${methodName}(params: ${paramsTypeName}): Promise<${returnType}> {`)
  } else {
    lines.push(`  async ${methodName}(): Promise<${returnType}> {`)
  }

  // Outbound validation: constructing/building the params record throws on a violation
  // before anything reaches the wire. Takes the original typed `params` directly
  // (matching RecordClass<T>'s `new (data: T)`), not the Record<string, unknown> cast
  // meant only for the wire send() call below. The *validated* instance — not the
  // caller's original `params` — is what actually gets sent: its toJSON() is what
  // converts JS-facing field names (params.prefersColorScheme) to their declared wire
  // keys (prefers-color-scheme), including on any nested record/union field.
  let sendArg = paramsCast
  if (paramsRuntime?.kind === 'record') {
    lines.push(`    const validatedParams = new ${paramsRuntime.runtimeName}(params)`)
    sendArg = '(validatedParams as unknown as Record<string, unknown>)'
  } else if (paramsRuntime?.kind === 'union') {
    lines.push(`    const validatedParams = ${paramsRuntime.runtimeName}.build(params)`)
    sendArg = '(validatedParams as unknown as Record<string, unknown>)'
  }

  // Domain.send() already checks for an error response and throws. Inbound
  // validation then runs through the result's own fromWire() when one is
  // registered; otherwise the result is cast as before.
  if (isVoid) {
    lines.push(`    await this.send('${methodStr}', ${sendArg})`)
  } else if (resultRuntime?.kind === 'record' || resultRuntime?.kind === 'union') {
    lines.push(`    const result = await this.send('${methodStr}', ${sendArg})`)
    lines.push(`    return ${resultRuntime.runtimeName}.fromWire(result) as unknown as ${resultTypeName}`)
  } else {
    lines.push(`    return (await this.send('${methodStr}', ${sendArg})) as ${resultTypeName}`)
  }

  lines.push(`  }`)
  return lines.join('\n')
}

// ============================================================
// Entry point
// ============================================================

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
