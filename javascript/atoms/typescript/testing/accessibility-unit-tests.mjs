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

const [bundlePath, atomPath, wirePath] = process.argv.slice(2)
if (!bundlePath || !atomPath || !wirePath) {
  throw new Error('Expected the paths of the testing bundle, the atom bundle and the wire bundle')
}
const sandbox = { module: { exports: undefined } }
vm.runInNewContext(`module.exports = ${fs.readFileSync(bundlePath, 'utf8').trim()};`, sandbox, { filename: bundlePath })
const { encodeWire, toText } = sandbox.module.exports

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

test('the wire bundle, which the bindings send with every call, stays under 64 KiB', () => {
  const size = fs.statSync(wirePath).size
  assert.ok(size < 64 * 1024, `accessibility-snapshot-wire.generated.js is ${size} bytes`)
  console.log(`# accessibility-snapshot-wire.generated.js: ${size} bytes`)
})

// The wire encoder is pure: elements and windows are whatever objects the tree
// holds, so plain objects stand in for them here.
test('the wire form replaces element references with indices, in first-mention order', () => {
  const body = { id: 'body' }
  const link = { id: 'link' }
  const tree = node('generic', '', {
    element: body,
    children: [text('intro'), node('link', 'More', { element: link, children: [text('More')] })],
  })

  const wire = encodeWire(tree)

  // The encoder runs in its own vm realm, so arrays are compared by content, not prototype.
  assert.strictEqual(wire.elements.length, 2)
  assert.strictEqual(wire.elements[0], body)
  assert.strictEqual(wire.elements[1], link)
  assert.strictEqual(wire.windows.length, 0)
  const parsed = JSON.parse(JSON.stringify(wire.node))
  assert.equal(parsed.element, 0)
  assert.equal(parsed.children[0].element, undefined, 'a text leaf has no element')
  assert.equal(parsed.children[1].element, 1)
  assert.deepEqual(parsed.children[1].children[0], { role: 'text', name: 'More', description: '', states: {}, children: [] })
})

test('a frame node points at its content window; a frame without one has no frame index', () => {
  const win = { name: 'child' }
  const framed = { id: 'frame', contentWindow: win }
  const empty = { id: 'frame2', contentWindow: null }
  const tree = node('document', 'Frames', {
    element: { id: 'root' },
    children: [node('iframe', 'Embedded', { element: framed }), node('iframe', '', { element: empty })],
  })

  const wire = encodeWire(tree)

  assert.strictEqual(wire.windows.length, 1)
  assert.strictEqual(wire.windows[0], win)
  assert.equal(wire.node.children[0].frame, 0)
  assert.equal(wire.node.children[1].frame, undefined)
  assert.equal(wire.node.children[1].element, 2)
})

test('the wire node keeps value and states exactly, and drops an absent value', () => {
  const tree = node('textbox', 'Email', { element: { id: 'e' }, value: 'a@b.c', states: { focused: true, level: 2, pressed: 'mixed' } })

  const parsed = JSON.parse(JSON.stringify(encodeWire(tree).node))

  assert.equal(parsed.value, 'a@b.c')
  assert.deepEqual(parsed.states, { focused: true, level: 2, pressed: 'mixed' })
  assert.equal('value' in JSON.parse(JSON.stringify(encodeWire(node('list', '')).node)), false)
})
