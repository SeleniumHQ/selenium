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

// Loads every atom the way Node consumers do, with no DOM present, and fails
// if any of them touches a browser global while loading.
//
// selenium-webdriver's lib/http.js require()s its atoms at import time
// (make-atoms-module.js turns the injectable expression into
// `module.exports = <atom>`), and an npm consumer importing @selenium/atoms
// evaluates every module behind the barrel. Either way the atom body runs in
// Node, so DOM access has to wait until the atom is called.
//
// Usage: load-in-node.mjs <dist/index.js> <atom.generated.js>...

import fs from 'node:fs'
import path from 'node:path'
import { pathToFileURL } from 'node:url'
import vm from 'node:vm'

const [indexPath, ...atomPaths] = process.argv.slice(2)
const failures = []

for (const atomPath of atomPaths) {
  const name = path.basename(atomPath)
  const source = fs.readFileSync(atomPath, 'utf8').trim()
  const sandbox = { module: { exports: undefined } }
  try {
    vm.runInNewContext(`module.exports = ${source};`, sandbox, { filename: name })
    if (typeof sandbox.module.exports !== 'function') {
      failures.push(`${name}: evaluated to ${typeof sandbox.module.exports}, not a function`)
    }
  } catch (e) {
    failures.push(`${name}: ${e}`)
  }
}

try {
  await import(pathToFileURL(path.resolve(indexPath)).href)
} catch (e) {
  failures.push(`${path.basename(indexPath)}: ${e}`)
}

if (failures.length) {
  console.error('Atoms that cannot be loaded without a DOM:\n  ' + failures.join('\n  '))
  process.exit(1)
}
console.log(`Loaded ${atomPaths.length} atoms and the package entry point without a DOM.`)
