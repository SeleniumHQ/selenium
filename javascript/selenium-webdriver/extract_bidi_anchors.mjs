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
 * Extract the WebDriver BiDi spec's *prose* section anchors into a small, pinned
 * index the schema projector joins against (see project_bidi_schema.mjs).
 *
 * Why this exists: webref's CDDL index only records the auto-generated
 * `#cddl-type-*` anchors (the terse CDDL productions). The far more readable prose
 * section anchors — `#module-<domain>`, `#type-<domain>-<Name>`,
 * `#command-<domain>-<name>`, `#event-<domain>-<name>` — are an editorial fact that
 * lives only in the rendered spec, not in the CDDL. There is no rule that predicts
 * which types get a prose section (only ~64 of ~460 do), so the projector cannot
 * derive it; it must look it up. Extracting the full id set once, here, turns that
 * lookup into an in-memory join with no per-item cost at generation time.
 *
 * This scheme is a core-BiDi-spec convention; the adjacent specs merged into the
 * schema (Permissions, Web Bluetooth, …) do not use it, so their types keep the
 * `#cddl-type-*` fallback from webref. Only the core spec is scanned here.
 *
 * At build time this runs as a Bazel action over the pinned, sha-verified rendered
 * spec (`@webdriver_bidi_spec_html//file:index.html`, from w3c/webdriver-bidi's
 * gh-pages branch — see common/webref_cddl.bzl), so the index is reproducible and
 * nothing is fetched live or committed. Run:
 *   node extract_bidi_anchors.mjs --spec <index.html> --out anchors.json
 * `--spec` also accepts a URL for ad-hoc use; //scripts:update_cddl repins the HTML.
 */

import { pathToFileURL } from 'node:url'

const SPEC_URL = 'https://w3c.github.io/webdriver-bidi/'

// Keys are lowercased so the projector can join case-insensitively — the prose
// anchors carry a few casing quirks that do not match the schema's names exactly
// (e.g. `#type-input-origin` for input.Origin, `#type-browsingContext-Browsingcontext`).
const lower = (s) => s.toLowerCase()

/**
 * Build the anchor index from spec HTML.
 * @param {string} html The rendered spec HTML.
 * @param {string} base The spec URL the anchors are relative to.
 * @returns {{modules: object, types: object, commands: object, events: object}}
 */
export function extractAnchors(html, base = SPEC_URL) {
  const ids = new Set([...html.matchAll(/id="([^"]+)"/g)].map((m) => m[1]))
  const index = { modules: {}, types: {}, commands: {}, events: {} }
  const href = (id) => `${base.replace(/#.*$/, '').replace(/\/?$/, '/')}#${id}`
  for (const id of ids) {
    const parts = id.split('-')
    // `module-<domain>` (exactly; skip sub-sections like module-browser-commands).
    if (parts[0] === 'module' && parts.length === 2) index.modules[lower(parts[1])] = href(id)
    // `type|command|event-<domain>-<local>` — the prose definition sections. Keyed by
    // the dotted `<domain>.<local>` the schema uses (type name / command+event method).
    else if (['type', 'command', 'event'].includes(parts[0]) && parts.length === 3) {
      const bucket = parts[0] === 'type' ? index.types : parts[0] === 'command' ? index.commands : index.events
      bucket[lower(`${parts[1]}.${parts[2]}`)] = href(id)
    }
  }
  return index
}

async function main() {
  const { parseArgs } = await import('node:util')
  const { readFileSync, writeFileSync } = await import('node:fs')
  const { resolve } = await import('node:path')

  // Under Bazel the js_binary wrapper chdir's to BAZEL_BINDIR, but $(location)
  // inputs are execroot-relative and already carry that prefix — strip it so the
  // path is not doubled. Mirrors resolveInput() in project_bidi_schema.mjs.
  const resolveInput = (p) => {
    if (!process.env.BAZEL_BINDIR) return resolve(p)
    const prefix = process.env.BAZEL_BINDIR.replaceAll('\\', '/') + '/'
    const norm = p.replaceAll('\\', '/')
    return resolve(norm.startsWith(prefix) ? norm.slice(prefix.length) : norm)
  }

  const { values: args } = parseArgs({ options: { spec: { type: 'string' }, out: { type: 'string' } } })
  const spec = args.spec ?? SPEC_URL
  if (!args.out) {
    console.error('Usage: extract_bidi_anchors.mjs [--spec <url|file>] --out <anchors.json>')
    process.exit(1)
  }
  const html = /^https?:/.test(spec) ? await (await fetch(spec)).text() : readFileSync(resolveInput(spec), 'utf8')
  const index = extractAnchors(html, SPEC_URL)
  writeFileSync(resolve(args.out), JSON.stringify(index, null, 2) + '\n', 'utf8')
  const n = (o) => Object.keys(o).length
  console.log(
    `  anchors → ${args.out}: ${n(index.modules)} modules, ${n(index.types)} types, ` +
      `${n(index.commands)} commands, ${n(index.events)} events`,
  )
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((err) => {
    console.error(err)
    process.exit(1)
  })
}
