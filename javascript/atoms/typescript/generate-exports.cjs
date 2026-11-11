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

// Derives the `exports` and `typesVersions` blocks of the @selenium/atoms
// package.json from the atom registry in typescript/defs.bzl, so adding an atom
// cannot silently leave the published surface behind.
//
// An alias produces an extra subpath pointing at the *same* dist files as the
// atom it aliases; it is never a separate build output.
//
// Usage: generate-exports.cjs <atoms.json> <package.json> [--check]

const fs = require('node:fs')

const [atomsPath, packagePath, mode] = process.argv.slice(2)

if (!atomsPath || !packagePath) {
  throw new Error('Expected an atom registry path and a package.json path')
}

const atoms = JSON.parse(fs.readFileSync(atomsPath, 'utf8'))
const manifest = JSON.parse(fs.readFileSync(packagePath, 'utf8'))

const subpathsOf = (atom) => [atom.name, ...(atom.aliases || [])]

const exportsBlock = {
  '.': {
    types: './dist/index.d.ts',
    default: './dist/index.js',
  },
}
const typesVersionsBlock = {}

for (const atom of atoms) {
  for (const subpath of subpathsOf(atom)) {
    exportsBlock[`./${subpath}`] = {
      types: `./dist/typescript/${atom.name}.d.ts`,
      default: `./dist/typescript/${atom.name}.js`,
    }
    typesVersionsBlock[subpath] = [`./dist/typescript/${atom.name}.d.ts`]
  }
}

// Rebuild the manifest key by key so the generated blocks land in their
// existing positions instead of being appended.
const regenerated = {}
for (const key of Object.keys(manifest)) {
  if (key === 'exports') {
    regenerated.exports = exportsBlock
  } else if (key === 'typesVersions') {
    regenerated.typesVersions = { '*': typesVersionsBlock }
  } else {
    regenerated[key] = manifest[key]
  }
}

// JSON.stringify always breaks arrays across lines; the checked-in manifest
// keeps the single-entry typesVersions arrays inline. Collapsing them here is
// what lets --check compare against the file as it is actually written.
const serialized =
  JSON.stringify(regenerated, null, 2).replace(/\[\n\s*("[^"\n]*")\n\s*\]/g, '[$1]') + '\n'

if (mode === '--check') {
  const current = fs.readFileSync(packagePath, 'utf8')
  if (current !== serialized) {
    process.stderr.write(
      'javascript/atoms/package.json no longer matches the atom registry in\n' +
        'javascript/atoms/typescript/defs.bzl. Replace its "exports" and\n' +
        '"typesVersions" blocks with:\n\n' +
        JSON.stringify(
          { exports: regenerated.exports, typesVersions: regenerated.typesVersions },
          null,
          2,
        ) +
        '\n',
    )
    process.exit(1)
  }
  process.stdout.write('package.json matches the atom registry\n')
} else {
  fs.writeFileSync(packagePath, serialized)
}
