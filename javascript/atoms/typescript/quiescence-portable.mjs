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

// npm consumers install quiescence by sending the function's own source to the
// browser: BiDi script.addPreloadScript takes it as a function declaration, CDP
// Page.addScriptToEvaluateOnNewDocument and Playwright's addInitScript take its
// text. That only works while installQuiescence references nothing outside its
// own body, so this evaluates its source text in a bare context, away from the
// module it was compiled into, and checks the ledger it installs works.

import assert from 'node:assert/strict'
import path from 'node:path'
import { pathToFileURL } from 'node:url'
import vm from 'node:vm'

const [modulePath] = process.argv.slice(2)
const { default: installQuiescence } = await import(pathToFileURL(path.resolve(modulePath)).href)

const sandbox = vm.createContext({ setTimeout, clearTimeout, setInterval, clearInterval, console })
const install = vm.runInContext(`(${installQuiescence.toString()})`, sandbox)
install()

const api = vm.runInContext('globalThis.__quiescence', sandbox)
assert.ok(api, 'calling the source text with no arguments installs into its own global')
assert.equal(typeof api.isQuiet, 'function')
assert.equal(typeof api.waitUntilActionable, 'function')

vm.runInContext('setTimeout(() => {}, 50)', sandbox)
assert.equal(api.isQuiet(), false, 'a pending timer in the sandbox blocks quiescence')
assert.equal(api.getBlockers()[0].type, 'timeout')

const result = await api.awaitQuiet({ timeoutMs: 2000, settleMs: 10 })
assert.equal(result.quiet, true, 'the ledger drains once the timer fires')
