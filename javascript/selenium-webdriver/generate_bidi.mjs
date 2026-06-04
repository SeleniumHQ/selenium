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
 * Generate TypeScript WebDriver BiDi bindings from a merged CDDL specification.
 *
 * Two-pass generation:
 *   Pass 1 — cddl2ts produces TypeScript interfaces from the CDDL AST.
 *             Post-processing deduplicates repeated declarations and
 *             replaces `any` with `unknown`.
 *   Pass 2 — The raw AST is walked to identify commands (groups with a
 *             `method` literal and `params` but no `type: "event"`) and
 *             events (same but with `type: "event"`). One implementation
 *             class per BiDi domain is emitted.
 *
 * Usage:
 *   node generate_bidi.mjs \
 *     --cddl merged.cddl \
 *     --output-dir bidi/generated/ \
 *     [--enhancements private/bidi_enhancements_manifest.json] \
 *     [--spec-version 1.0]
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
      enhancements: { type: 'string' },
      'output-dir': { type: 'string' },
      'spec-version': { type: 'string', default: '1.0' },
    },
  })

  if (!args.cddl || !args['output-dir']) {
    console.error('Usage: node generate_bidi.mjs --cddl <file> --output-dir <dir>')
    process.exit(1)
  }

  // When running inside a Bazel js_run_binary action, the js_binary wrapper
  // chdir()s to BAZEL_BINDIR (bazel-out/<config>/bin) before executing the
  // script. $(location …) args are relative to the execroot and therefore
  // already include the BAZEL_BINDIR prefix. Strip that prefix so the path is
  // relative to the CWD (= BAZEL_BINDIR), then resolve normally.
  // The --output-dir arg is passed as <pkg>/<rel_path>, which is already
  // relative to BAZEL_BINDIR (= CWD), so it needs no special handling.
  const cddlPath = resolveInputPath(args.cddl)
  if (!existsSync(cddlPath)) {
    console.error(`Error: CDDL file not found: ${cddlPath}`)
    process.exit(1)
  }
  const outputDir = resolve(args['output-dir'])
  const specVersion = args['spec-version']

  const enhancements = loadEnhancements(args.enhancements)

  console.log(`Parsing CDDL: ${cddlPath}`)
  const ast = parse(cddlPath)
  console.log(`  ${ast.length} top-level definitions`)

  // Pass 1: types
  console.log('Pass 1: generating types via cddl2ts…')
  const rawTypes = transform(ast)
  const cleanTypes = postProcessTypes(rawTypes)
  const typesByDomain = splitTypesByDomain(cleanTypes)

  // Build a set of all exported type/interface names across all domains.
  // Used by generateCommandMethod to detect when a result type doesn't exist
  // in the generated output and should be treated as void.
  const allGeneratedTypeNames = buildAllTypeNames(typesByDomain)

  // Build a map from type name to its domain for cross-domain import generation.
  const typeNameToDomain = buildTypeNameToDomainMap(typesByDomain)

  // Pass 2: implementations
  console.log('Pass 2: extracting commands and events from AST…')
  const emptyParamTypes = buildEmptyParamTypes(ast)
  const emptyResultTypes = buildEmptyResultTypes(cleanTypes)
  const allCommands = extractCommands(ast, emptyParamTypes)
  const allEvents = extractEvents(ast)
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
      emptyResultTypes,
      allGeneratedTypeNames,
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
 * Returns the set of result type names that are aliases for EmptyResult.
 */
function buildEmptyResultTypes(cleanTypes) {
  const empty = new Set()
  for (const line of cleanTypes.split('\n')) {
    const m = line.match(/^export type (\w+Result) = EmptyResult;/)
    if (m) empty.add(m[1])
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

/**
 * Extract command/event details from a leaf definition name.
 */
function parseLeafDef(defName, def, emptyParamTypes) {
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
  let paramsTypeName = null
  if (paramsTypeEntries[0]?.Type === 'group' && paramsTypeEntries[0]?.Value) {
    paramsTypeName = normalizeDottedName(paramsTypeEntries[0].Value)
  }

  return { domain, methodStr, operationName, paramsTypeName }
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

/**
 * Extract all BiDi command definitions by traversing CommandData and
 * extension-spec XxxCommand unions.
 */
function extractCommands(ast, emptyParamTypes) {
  const defMap = buildDefMap(ast)
  const commandNames = collectAllMembers(defMap, 'Command')
  const commands = []

  for (const name of commandNames) {
    const def = defMap.get(name)
    if (!def) continue

    const parsed = parseLeafDef(name, def, emptyParamTypes)
    if (!parsed) continue

    const { domain, methodStr, operationName: methodName, paramsTypeName } = parsed
    const normalizedName = normalizeDottedName(name)
    const hasParams = paramsTypeName !== null && !emptyParamTypes.has(paramsTypeName)

    commands.push({
      domain,
      name: normalizedName,
      methodStr,
      methodName,
      paramsTypeName,
      hasParams,
      resultTypeName: normalizedName + 'Result',
    })
  }

  return commands
}

/**
 * Extract all BiDi event definitions by traversing EventData and
 * extension-spec XxxEvent unions.
 */
function extractEvents(ast) {
  const defMap = buildDefMap(ast)
  const eventNames = collectAllMembers(defMap, 'Event')
  const events = []

  for (const name of eventNames) {
    const def = defMap.get(name)
    if (!def) continue

    const parsed = parseLeafDef(name, def, new Set())
    if (!parsed) continue

    const { domain, methodStr, operationName: eventName, paramsTypeName } = parsed
    const onMethodName = 'on' + eventName.charAt(0).toUpperCase() + eventName.slice(1)

    events.push({
      domain,
      name: normalizeDottedName(name),
      methodStr,
      eventName,
      paramsTypeName,
      onMethodName,
    })
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
 * Returns a Set of all exported type/interface names across every domain.
 * Used to detect when a result type doesn't exist in the generated output.
 */
function buildAllTypeNames(typesByDomain) {
  const names = new Set()
  for (const typeBlock of Object.values(typesByDomain)) {
    for (const line of typeBlock.split('\n')) {
      const m = line.match(/^export (?:type|interface) (\w+)/)
      if (m) names.add(m[1])
    }
  }
  return names
}

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
  emptyResultTypes,
  allGeneratedTypeNames,
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
        emptyResultTypes,
        allGeneratedTypeNames,
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

function generateClass({ className, commands, events, enhancement, emptyResultTypes, allGeneratedTypeNames }) {
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
    lines.push(override ?? generateCommandMethod(cmd, emptyResultTypes, allGeneratedTypeNames))
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

function generateCommandMethod(cmd, emptyResultTypes, allGeneratedTypeNames) {
  const { methodName, methodStr, paramsTypeName, hasParams, resultTypeName } = cmd
  // Treat as void when the result type is an EmptyResult alias OR when the
  // result type doesn't appear anywhere in the generated output (e.g. the CDDL
  // spec lists no explicit result type for this command).
  const isVoid = emptyResultTypes.has(resultTypeName) || !allGeneratedTypeNames.has(resultTypeName)
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
