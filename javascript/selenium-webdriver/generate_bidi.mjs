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
 *                  [--enhancements <f>] [--spec-version <v>]
 */

import { parse } from 'cddl'
import { transform } from 'cddl2ts'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { parseArgs } from 'node:util'

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

// Maps TypeScript export name prefixes to domain keys.
// Ordered longest-first so the most specific prefix always wins.
const NAME_PREFIX_TO_DOMAIN = [
  ['UserAgentClientHints', 'userAgentClientHints'],
  ['BrowsingContext', 'browsingContext'],
  ['WebExtension', 'webExtension'],
  ['Permissions', 'permissions'],
  ['Bluetooth', 'bluetooth'],
  ['Emulation', 'emulation'],
  ['Speculation', 'speculation'],
  ['Storage', 'storage'],
  ['Session', 'session'],
  ['Network', 'network'],
  ['Script', 'script'],
  ['Input', 'input'],
  ['Browser', 'browser'],
  ['Log', 'log'],
]

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
      cddl: { type: 'string' },
      ast: { type: 'string' },
      model: { type: 'string' },
      'dump-ast': { type: 'string' },
      'dump-model': { type: 'string' },
      enhancements: { type: 'string' },
      'output-dir': { type: 'string' },
      'spec-version': { type: 'string', default: '1.0' },
    },
  })

  // One pipeline stage per invocation; the flags select the stage.
  if (args['dump-ast'] && args.cddl) {
    writeJson(args['dump-ast'], parseCddl(args.cddl), 'ast')
  } else if (args['dump-model'] && args.ast) {
    writeJson(args['dump-model'], buildModel(readJson(args.ast, 'AST')), 'model', true)
  } else if (args['output-dir'] && args.ast && args.model) {
    generateTypeScript(readJson(args.ast, 'AST'), readJson(args.model, 'model'), args)
  } else {
    console.error(
      'Usage (one stage per invocation):\n' +
        '  generate_bidi.mjs --cddl <file> --dump-ast <file>\n' +
        '  generate_bidi.mjs --ast <file> --dump-model <file>\n' +
        '  generate_bidi.mjs --ast <file> --model <file> --output-dir <dir> [--enhancements <file>] [--spec-version <v>]',
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

/** Emit one TS module per domain: types from the AST (cddl2ts), methods from the model. */
function generateTypeScript(ast, model, args) {
  const outputDir = resolve(args['output-dir'])
  const specVersion = args['spec-version']
  const enhancements = loadEnhancements(args.enhancements)

  console.log('Pass 1: generating types via cddl2ts…')
  const rawTypes = transform(ast)
  const cleanTypes = postProcessTypes(rawTypes)
  const typesByDomain = splitTypesByDomain(cleanTypes)
  const typeNameToDomain = buildTypeNameToDomainMap(typesByDomain)

  console.log('Pass 2: building commands and events from model…')
  const allCommands = modelToCommands(model)
  const allEvents = modelToEvents(model)
  console.log(`  ${allCommands.length} commands, ${allEvents.length} events`)

  mkdirSync(outputDir, { recursive: true })

  for (const [domainKey, filename] of Object.entries(DOMAIN_FILES)) {
    const types = typesByDomain[domainKey] ?? ''
    const commands = allCommands.filter((c) => c.domain === domainKey)
    const events = allEvents.filter((e) => e.domain === domainKey)
    const enhancement = enhancements[domainKey] ?? {}
    const className = DOMAIN_CLASSES[domainKey]

    const content = generateDomainFile({
      domain: domainKey,
      className,
      types,
      commands,
      events,
      enhancement,
      specVersion,
      typeNameToDomain,
    })

    const outPath = join(outputDir, filename)
    writeFileSync(outPath, content, 'utf8')
    console.log(`  → ${outPath}`)
  }

  console.log('Done.')
}

// ============================================================
// Enhancements manifest
// ============================================================

function loadEnhancements(manifestPath) {
  if (!manifestPath) return {}
  const fullPath = resolveInputPath(manifestPath)
  if (!existsSync(fullPath)) {
    console.warn(`Warning: enhancements manifest not found: ${fullPath}`)
    return {}
  }
  let parsed
  try {
    parsed = JSON.parse(readFileSync(fullPath, 'utf8'))
  } catch (err) {
    throw new Error(`Failed to parse enhancements manifest at ${fullPath}: ${err.message}`)
  }
  if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
    throw new Error(
      `Enhancements manifest at ${fullPath} must be a JSON object, got ${Array.isArray(parsed) ? 'array' : typeof parsed}`,
    )
  }
  return parsed
}

// ============================================================
// Pass 1: type post-processing
// ============================================================

/**
 * Remove duplicate export declarations (cddl2ts emits them when the
 * `*-all.cddl` input concatenates local + remote definitions that both
 * define the same shared types) and replace `any` with `unknown`.
 */
function postProcessTypes(rawTs) {
  const seen = new Set()
  const output = []
  const lines = rawTs.split('\n')
  let i = 0

  while (i < lines.length) {
    const line = lines[i]
    const match = line.match(/^export (?:type|interface) (\w+)/)

    if (match) {
      const name = match[1]

      if (seen.has(name)) {
        // Determine end of this declaration before skipping it.
        if (line.includes('{') && !line.endsWith('{}') && !line.endsWith('{};')) {
          // Multi-line block: skip until braces balance back to zero.
          let depth = (line.match(/\{/g) ?? []).length - (line.match(/\}/g) ?? []).length
          i++
          while (i < lines.length && depth > 0) {
            depth += (lines[i].match(/\{/g) ?? []).length - (lines[i].match(/\}/g) ?? []).length
            i++
          }
        } else {
          i++ // single-line declaration
        }
        // Consume the trailing blank line that follows every declaration.
        if (i < lines.length && lines[i] === '') i++
        continue
      }

      seen.add(name)
    }

    // Replace any → unknown.
    const cleaned = line
      .replace(/Record<string, any>/g, 'Record<string, unknown>')
      .replace(/: any([;,)\s\[])/g, ': unknown$1')

    output.push(cleaned)
    i++
  }

  return output.join('\n')
}

// ============================================================
// Domain splitting
// ============================================================

function getDomainForExportName(name) {
  for (const [prefix, domain] of NAME_PREFIX_TO_DOMAIN) {
    if (name.startsWith(prefix)) return domain
  }
  return 'common'
}

/**
 * Partition the flat cddl2ts TypeScript output into per-domain strings,
 * treating each blank-line-separated block as one export declaration.
 */
function splitTypesByDomain(cleanTypes) {
  const domainLines = {}

  const lines = cleanTypes.split('\n')
  let blockLines = []

  // Flush one accumulated block, splitting it further by individual exports
  // so that consecutive single-line declarations (no blank line between them)
  // each land in the correct domain rather than all being bucketed under the
  // first declaration's domain.
  const flushBlock = () => {
    if (blockLines.length === 0) return

    let exportLines = []
    let exportDomain = null

    const commitExport = () => {
      if (exportLines.length === 0) return
      const domain = exportDomain ?? 'common'
      if (!domainLines[domain]) domainLines[domain] = []
      domainLines[domain].push(...exportLines, '')
      exportLines = []
      exportDomain = null
    }

    for (const line of blockLines) {
      const m = line.match(/^export (?:type|interface) (\w+)/)
      if (m) {
        commitExport()
        exportDomain = getDomainForExportName(m[1])
      }
      exportLines.push(line)
    }
    commitExport()

    blockLines = []
  }

  for (const line of lines) {
    // Skip cddl2ts source comment headers.
    if (line.startsWith('// GENERATED CONTENT') || line.startsWith('// Source:')) {
      flushBlock()
      continue
    }
    if (line === '' && blockLines.length > 0) {
      flushBlock()
    } else if (line !== '') {
      blockLines.push(line)
    }
  }
  flushBlock()

  const result = {}
  for (const [domain, dl] of Object.entries(domainLines)) {
    result[domain] = dl.join('\n').trimEnd()
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
    .map((part) => {
      const titled = part.charAt(0).toUpperCase() + part.slice(1)
      // Normalize acronym runs to match cddl2ts output:
      //   CSPParameters → CspParameters   HTMLCollection → HtmlCollection
      // Rule: 2+ uppercase letters followed by an uppercase+lowercase pair (or end
      // of string) → keep only the first uppercase and lowercase the rest.
      return titled.replace(/([A-Z]{2,})(?=[A-Z][a-z]|$)/g, (m) => m[0] + m.slice(1).toLowerCase())
    })
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

/** Map model commands to the generator's command-entry shape. */
function modelToCommands(model) {
  const commands = []
  for (const [domain, entry] of Object.entries(model)) {
    for (const c of entry.commands) {
      commands.push({
        domain,
        methodStr: c.method,
        methodName: c.name,
        paramsTypeName: c.params !== null ? normalizeDottedName(c.params) : null,
        hasParams: c.params !== null,
        resultTypeName: c.result !== null ? normalizeDottedName(c.result) : null,
      })
    }
  }
  return commands
}

/** Map model events to the generator's event-entry shape. */
function modelToEvents(model) {
  const events = []
  for (const [domain, entry] of Object.entries(model)) {
    for (const e of entry.events) {
      events.push({
        domain,
        methodStr: e.method,
        eventName: e.name,
        paramsTypeName: e.params !== null ? normalizeDottedName(e.params) : null,
        onMethodName: 'on' + e.name.charAt(0).toUpperCase() + e.name.slice(1),
      })
    }
  }
  return events
}

// ============================================================
// Code generation
// ============================================================

const LICENSE_HEADER = `\
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
// under the License.`

// ============================================================
// Type-map helpers for cross-domain import generation
// ============================================================

/**
 * Returns a Map from exported type name → domain key.
 * Used to generate cross-domain import statements.
 */
function buildTypeNameToDomainMap(typesByDomain) {
  const map = new Map()
  for (const [domain, typeBlock] of Object.entries(typesByDomain)) {
    for (const line of typeBlock.split('\n')) {
      const m = line.match(/^export (?:type|interface) (\w+)/)
      if (m) map.set(m[1], domain)
    }
  }
  return map
}

/**
 * Scans a domain's type block for references to types that live in OTHER
 * domains and returns the import statements needed to make the file compile.
 *
 * Only PascalCase identifiers that exist in typeNameToDomain and belong to a
 * different domain are considered. Built-in TypeScript types (string, number,
 * boolean, …) never appear in the map, so they are naturally excluded.
 */
function computeCrossDomainImports(typeBlock, domain, typeNameToDomain) {
  if (!typeBlock) return []

  // Collect all PascalCase identifiers referenced in the type block.
  const referenced = new Set()
  for (const match of typeBlock.matchAll(/\b([A-Z][A-Za-z0-9]*)\b/g)) {
    referenced.add(match[1])
  }

  // Group by source domain (skip same-domain types and unknown types).
  const bySourceDomain = new Map()
  for (const name of referenced) {
    const sourceDomain = typeNameToDomain.get(name)
    if (!sourceDomain || sourceDomain === domain) continue
    if (!bySourceDomain.has(sourceDomain)) bySourceDomain.set(sourceDomain, new Set())
    bySourceDomain.get(sourceDomain).add(name)
  }

  // Emit sorted import lines.
  const imports = []
  for (const [sourceDomain, names] of [...bySourceDomain.entries()].sort()) {
    const sourceFile = DOMAIN_FILES[sourceDomain].replace('.ts', '.js')
    const sorted = [...names].sort()
    imports.push(`import type { ${sorted.join(', ')} } from './${sourceFile}'`)
  }
  return imports
}

function generateDomainFile({
  domain,
  className,
  types,
  commands,
  events,
  enhancement,
  specVersion,
  typeNameToDomain,
}) {
  const parts = [LICENSE_HEADER, '']

  parts.push(`// Auto-generated from WebDriver BiDi CDDL spec (v${specVersion}) — DO NOT EDIT MANUALLY`)
  parts.push(`// Source: https://github.com/w3c/webref/tree/main/ed/cddl`)
  parts.push('')

  const filteredCommands = commands.filter((c) => !enhancement.excludeMethods?.includes(c.methodName))
  const filteredEvents = events.filter((e) => !enhancement.excludeMethods?.includes(e.eventName))
  const hasImplementation = className != null && (filteredCommands.length > 0 || filteredEvents.length > 0)

  // Filter out excluded types before emitting.
  let typeBlock = types
  if (enhancement.excludeTypes?.length) {
    typeBlock = filterExcludedTypes(typeBlock, enhancement.excludeTypes)
  }

  // Compute cross-domain imports needed by this domain's type block.
  // Types from other domains are referenced by name but live in separate files.
  const crossDomainImports = computeCrossDomainImports(typeBlock, domain, typeNameToDomain)

  if (crossDomainImports.length > 0) {
    for (const line of crossDomainImports) {
      parts.push(line)
    }
    parts.push('')
  }

  if (hasImplementation) {
    // Define the BiDi connection interface inline so the generated file is
    // self-contained for tsc and doesn't need to resolve ../index.js.
    parts.push(`/** Minimal BiDi transport interface (satisfied structurally by bidi/index.js). */`)
    parts.push(`interface BidiConnection {`)
    parts.push(`  send(command: Record<string, unknown>): Promise<unknown>`)
    parts.push(`  subscribe(event: string | string[], contexts?: string[]): Promise<void>`)
    parts.push(`  on(event: string, listener: (params: unknown) => void): void`)
    parts.push(`}`)
    parts.push('')
  }

  if (typeBlock) {
    parts.push(`// --- Types ---`)
    parts.push('')
    parts.push(typeBlock)
    parts.push('')
  }

  if (enhancement.extraTypes) {
    parts.push(`// --- Additional Types ---`)
    parts.push('')
    parts.push(enhancement.extraTypes)
    parts.push('')
  }

  if (hasImplementation) {
    parts.push(`// --- Implementation ---`)
    parts.push('')
    parts.push(
      generateClass({
        className,
        commands: filteredCommands,
        events: filteredEvents,
        enhancement,
      }),
    )
  }

  return parts.join('\n') + '\n'
}

function filterExcludedTypes(typeBlock, excludeTypes) {
  const lines = typeBlock.split('\n')
  const output = []
  let i = 0

  while (i < lines.length) {
    const line = lines[i]
    const match = line.match(/^export (?:type|interface) (\w+)/)
    if (match && excludeTypes.includes(match[1])) {
      if (line.includes('{') && !line.endsWith('{}') && !line.endsWith('{};')) {
        let depth = (line.match(/\{/g) ?? []).length - (line.match(/\}/g) ?? []).length
        i++
        while (i < lines.length && depth > 0) {
          depth += (lines[i].match(/\{/g) ?? []).length - (lines[i].match(/\}/g) ?? []).length
          i++
        }
      } else {
        i++
      }
      if (i < lines.length && lines[i] === '') i++
      continue
    }
    output.push(line)
    i++
  }

  return output.join('\n').trimEnd()
}

function generateClass({ className, commands, events, enhancement }) {
  const lines = []

  lines.push(`export class ${className} {`)
  lines.push(`  private constructor(private readonly bidi: BidiConnection) {}`)
  lines.push('')
  lines.push(`  static async create(driver: unknown): Promise<${className}> {`)
  lines.push(
    `    const caps = await (driver as { getCapabilities(): Promise<{ get(key: string): unknown }> }).getCapabilities()`,
  )
  lines.push(`    if (!caps.get('webSocketUrl')) {`)
  lines.push(`      throw new Error('WebDriver instance must support BiDi protocol')`)
  lines.push(`    }`)
  lines.push(`    const bidi = await (driver as { getBidi(): Promise<BidiConnection> }).getBidi()`)
  lines.push(`    return new ${className}(bidi)`)
  lines.push(`  }`)

  for (const cmd of commands) {
    const override = enhancement.extraMethods?.[cmd.methodName]
    lines.push('')
    lines.push(override ?? generateCommandMethod(cmd))
  }

  for (const evt of events) {
    const override = enhancement.extraMethods?.[evt.onMethodName]
    lines.push('')
    lines.push(override ?? generateEventMethod(evt))
  }

  if (enhancement.extraMethods) {
    const knownNames = new Set([...commands.map((c) => c.methodName), ...events.map((e) => e.onMethodName)])
    for (const [name, body] of Object.entries(enhancement.extraMethods)) {
      if (!knownNames.has(name)) {
        // Purely additive method not tied to a command or event.
        lines.push('')
        lines.push(body)
      }
    }
  }

  lines.push(`}`)
  return lines.join('\n')
}

function generateCommandMethod(cmd) {
  const { methodName, methodStr, paramsTypeName, hasParams, resultTypeName } = cmd
  const isVoid = resultTypeName === null
  const returnType = isVoid ? 'void' : resultTypeName

  // Use a double-cast (T as unknown as Record<string,unknown>) so TypeScript
  // accepts the conversion even when the params type has no index signature.
  const paramsCast = hasParams ? '(params as unknown as Record<string, unknown>)' : '{}'

  const lines = []
  if (hasParams) {
    lines.push(`  async ${methodName}(params: ${paramsTypeName}): Promise<${returnType}> {`)
  } else {
    lines.push(`  async ${methodName}(): Promise<${returnType}> {`)
  }

  // Both void and non-void commands go through the same error-check pattern.
  // bidi/index.js always resolves (never rejects) regardless of response type,
  // so we must inspect the payload ourselves and throw on error responses.
  lines.push(`    const response = await this.bidi.send({`)
  lines.push(`      method: '${methodStr}',`)
  lines.push(`      params: ${paramsCast},`)
  lines.push(`    }) as Record<string, unknown>`)
  lines.push(`    if (response['type'] === 'error') {`)
  lines.push(`      throw new Error(\`\${response['error']}: \${response['message']}\`)`)
  lines.push(`    }`)
  if (!isVoid) {
    lines.push(`    return (response as unknown as { result: ${resultTypeName} }).result`)
  }

  lines.push(`  }`)
  return lines.join('\n')
}

function generateEventMethod(evt) {
  const { onMethodName, methodStr, paramsTypeName } = evt
  const cbType = paramsTypeName ? `(params: ${paramsTypeName}) => void` : `(params: unknown) => void`

  const lines = []
  lines.push(`  async ${onMethodName}(callback: ${cbType}): Promise<void> {`)
  lines.push(`    await this.bidi.subscribe('${methodStr}')`)
  // bidi/index.js emits BiDi events by method name through its single shared
  // message dispatcher (which already handles JSON parsing and closed-state
  // guards). Using bidi.on() here avoids attaching a new ws.on('message', ...)
  // listener on every subscription call, preventing listener accumulation and
  // MaxListeners warnings.
  lines.push(`    this.bidi.on('${methodStr}', (params: unknown) => {`)
  lines.push(`      callback(${paramsTypeName ? `params as ${paramsTypeName}` : 'params'})`)
  lines.push(`    })`)
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
