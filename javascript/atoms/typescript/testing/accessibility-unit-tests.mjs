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

// Unit tests for the pure parts of the accessibility modules, run by Node
// with no DOM. The code under test is the test-only bundle
// (typescript/testing/accessibility.generated.js), the same bytes the QUnit
// pages load, evaluated the way the bindings evaluate an atom.
//
// It also holds the atom's own size to a ceiling: the bundle crosses the
// wire on every injection into a document that predates the preload, so a
// dependency that balloons it should fail here rather than ship.
//
// Usage: accessibility-unit-tests.mjs <testing/accessibility.generated.js> <accessibility-snapshot.generated.js>

import assert from 'node:assert/strict'
import fs from 'node:fs'
import { test } from 'node:test'
import vm from 'node:vm'

const [bundlePath, atomPath] = process.argv.slice(2)
if (!bundlePath || !atomPath) {
  throw new Error('Expected the paths of the testing bundle and the atom bundle')
}
const sandbox = { module: { exports: undefined } }
vm.runInNewContext(`module.exports = ${fs.readFileSync(bundlePath, 'utf8').trim()};`, sandbox, { filename: bundlePath })
const { toText } = sandbox.module.exports

const node = (role, name, extra = {}) => ({ role, name, description: '', states: {}, children: [], ...extra })
const text = (content) => node('text', content)

test('a node is one line: role, quoted name, states, value', () => {
  assert.equal(toText(node('button', 'Save')), '- button "Save"')
  assert.equal(toText(node('list', '')), '- list')
  assert.equal(toText(node('checkbox', 'Agree', { states: { checked: true } })), '- checkbox "Agree" [checked]')
  assert.equal(toText(node('textbox', 'Email', { value: 'a@b.c' })), '- textbox "Email": a@b.c')
  assert.equal(toText(node('textbox', 'Email', { states: { disabled: true }, value: 'x' })), '- textbox "Email" [disabled]: x')
})

test('states keep a fixed order; true is bare, false is left out, other values are spelled', () => {
  const states = { focused: true, disabled: true, level: 2, selected: false, expanded: true, pressed: 'mixed', checked: false }
  assert.equal(toText(node('heading', 'H', { states })), '- heading "H" [pressed=mixed] [expanded] [level=2] [disabled] [focused]')
})

test('text leaves are written as text lines', () => {
  assert.equal(toText(text('plain words')), '- text: plain words')
})

test('children indent two spaces per level', () => {
  const tree = node('list', '', {
    children: [node('listitem', '', { children: [text('one'), node('link', 'more')] }), node('listitem', '', { children: [text('two')] })],
  })
  assert.equal(toText(tree), ['- list', '  - listitem', '    - text: one', '    - link "more"', '  - listitem', '    - text: two'].join('\n'))
})

test('quotes and backslashes in names are escaped; an empty value is not written', () => {
  assert.equal(toText(node('button', 'Say "hi" \\ bye')), '- button "Say \\"hi\\" \\\\ bye"')
  assert.equal(toText(node('textbox', 'Empty', { value: '' })), '- textbox "Empty"')
})

test('a value stays on one line: line breaks and backslashes are escaped', () => {
  assert.equal(toText(node('textbox', 'Notes', { value: 'line one\nline two' })), '- textbox "Notes": line one\\nline two')
  assert.equal(toText(node('textbox', 'Log', { value: 'a\r\nb' })), '- textbox "Log": a\\r\\nb')
  assert.equal(toText(node('textbox', 'Path', { value: 'C:\\dir' })), '- textbox "Path": C:\\\\dir')
})

test('description is not part of the text form', () => {
  assert.equal(toText({ ...node('button', 'Save'), description: 'Saves the form' }), '- button "Save"')
})

test('the atom bundle stays under 64 KiB', () => {
  const size = fs.statSync(atomPath).size
  assert.ok(size < 64 * 1024, `accessibility-snapshot.generated.js is ${size} bytes`)
  // Printed so the size is in the log of every run, not only when it fails.
  console.log(`# accessibility-snapshot.generated.js: ${size} bytes`)
})
