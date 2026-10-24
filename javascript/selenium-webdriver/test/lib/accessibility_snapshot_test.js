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

'use strict'

// The pure parts of the accessibility snapshot (ADR 18205): the text renderer,
// held to the shared corpus, the decoder from the BiDi wire shape, and the
// guard for sessions without BiDi.

const assert = require('node:assert')
const fs = require('node:fs')
const path = require('node:path')
const { locate } = require('../../lib/test/resources')
const {
  AccessibilityNode,
  AccessibilitySnapshotter,
  nodeFromRemoteValue,
} = require('selenium-webdriver/lib/accessibility_snapshot')
const { Capabilities } = require('selenium-webdriver/lib/capabilities')
const error = require('selenium-webdriver/lib/error')

const CORPUS = locate('common/src/web/accessibility')

/** The corpus JSON as nodes; `element` holds the recorded id, which the text form never renders. */
function nodeFromJson(data) {
  return new AccessibilityNode({
    role: data.role,
    name: data.name,
    description: data.description,
    value: data.value,
    states: data.states,
    element: data.element ?? null,
    children: data.children.map(nodeFromJson),
  })
}

function read(file) {
  return fs.readFileSync(path.join(CORPUS, file), 'utf8')
}

describe('AccessibilityNode', function () {
  describe('toText', function () {
    for (const page of JSON.parse(read('index.json'))) {
      it(`renders ${page} as the corpus records it`, function () {
        const tree = nodeFromJson(JSON.parse(read(`${page}.expected.json`)))
        assert.strictEqual(tree.toText() + '\n', read(`${page}.expected.txt`))
      })
    }

    it('writes one line per node: role, quoted name, states in order, value', function () {
      const node = new AccessibilityNode({
        role: 'textbox',
        name: 'Say "hi" \\ bye',
        states: { focused: true, disabled: true, level: 2, selected: false, pressed: 'mixed' },
        value: 'line one\nline two\\',
      })
      assert.strictEqual(
        node.toText(),
        '- textbox "Say \\"hi\\" \\\\ bye" [pressed=mixed] [level=2] [disabled] [focused]: line one\\nline two\\\\',
      )
      assert.strictEqual(new AccessibilityNode({ role: 'list', name: '' }).toText(), '- list')
      assert.strictEqual(new AccessibilityNode({ role: 'text', name: 'plain words' }).toText(), '- text: plain words')
      assert.strictEqual(
        new AccessibilityNode({ role: 'textbox', name: 'Empty', value: '' }).toText(),
        '- textbox "Empty"',
      )
    })

    it('indents children two spaces per level', function () {
      const tree = new AccessibilityNode({
        role: 'list',
        name: '',
        children: [
          new AccessibilityNode({
            role: 'listitem',
            name: '',
            children: [
              new AccessibilityNode({ role: 'text', name: 'one' }),
              new AccessibilityNode({ role: 'link', name: 'more' }),
            ],
          }),
        ],
      })
      assert.strictEqual(tree.toText(), '- list\n  - listitem\n    - text: one\n    - link "more"')
    })
  })

  describe('defaults', function () {
    it('has an empty description, no value, no states, no element and no children', function () {
      const node = new AccessibilityNode({ role: 'button', name: 'Save' })
      assert.strictEqual(node.description, '')
      assert.strictEqual(node.value, undefined)
      assert.deepStrictEqual(node.states, {})
      assert.strictEqual(node.element, null)
      assert.deepStrictEqual(node.children, [])
    })
  })
})

describe('nodeFromRemoteValue', function () {
  const remote = (type, value, extra = {}) => ({ type, ...(value === undefined ? {} : { value }), ...extra })
  const object = (fields) => remote('object', Object.entries(fields))

  it('decodes a script.callFunction result: pairs, arrays and nodes with a sharedId', function () {
    const wire = object({
      role: remote('string', 'button'),
      name: remote('string', 'Save'),
      description: remote('string', 'Saves the form'),
      states: object({ pressed: remote('string', 'mixed'), disabled: remote('boolean', true) }),
      element: remote('node', { nodeType: 1 }, { sharedId: 'f.1.e.42' }),
      children: remote('array', [
        object({
          role: remote('string', 'text'),
          name: remote('string', 'Save'),
          description: remote('string', ''),
          states: object({}),
          children: remote('array', []),
        }),
        object({
          role: remote('string', 'heading'),
          name: remote('string', 'H'),
          description: remote('string', ''),
          value: remote('string', 'v'),
          states: object({ level: remote('number', 2) }),
          element: remote('node', { nodeType: 1 }, { sharedId: 'f.1.e.43' }),
          children: remote('array', []),
        }),
      ]),
    })
    const made = []
    const node = nodeFromRemoteValue(wire, (id) => {
      made.push(id)
      return `element:${id}`
    })

    assert.strictEqual(node.role, 'button')
    assert.strictEqual(node.name, 'Save')
    assert.strictEqual(node.description, 'Saves the form')
    assert.strictEqual(node.value, undefined)
    assert.deepStrictEqual(node.states, { pressed: 'mixed', disabled: true })
    assert.strictEqual(node.element, 'element:f.1.e.42')
    const [text, heading] = node.children
    assert.strictEqual(text.role, 'text')
    assert.strictEqual(text.element, null)
    assert.deepStrictEqual(text.children, [])
    assert.strictEqual(heading.value, 'v')
    assert.deepStrictEqual(heading.states, { level: 2 })
    assert.deepStrictEqual(made, ['f.1.e.42', 'f.1.e.43'])
  })
})

describe('AccessibilitySnapshotter', function () {
  it('raises UnsupportedOperationError, naming BiDi, for a session without it', async function () {
    // Only the capability lookup is consulted before the guard fires.
    const driver = { getCapabilities: async () => new Capabilities() }
    const snapshotter = new AccessibilitySnapshotter(driver, () => null)
    await assert.rejects(snapshotter.snapshot(null), (e) => {
      assert.ok(e instanceof error.UnsupportedOperationError)
      assert.match(e.message, /BiDi/)
      return true
    })
  })

  it('tries a failed preload again on the next snapshot', async function () {
    const snapshotter = new AccessibilitySnapshotter({}, () => null)
    let calls = 0
    let failing = true
    snapshotter.send_ = async () => {
      calls++
      if (failing) throw new error.UnknownCommandError('script.addPreloadScript')
      return { script: 'preload-1' }
    }

    await snapshotter.ensurePreload_()
    await snapshotter.ensurePreload_()
    assert.strictEqual(calls, 2, 'a failure must not count as preloaded')

    failing = false
    await snapshotter.ensurePreload_()
    await snapshotter.ensurePreload_()
    assert.strictEqual(calls, 3, 'a success is remembered')
  })

  it('shares one preload between overlapping snapshots', async function () {
    const snapshotter = new AccessibilitySnapshotter({}, () => null)
    let calls = 0
    let release
    snapshotter.send_ = () => {
      calls++
      return new Promise((resolve) => {
        release = () => resolve({ script: 'preload-1' })
      })
    }

    const first = snapshotter.ensurePreload_()
    const second = snapshotter.ensurePreload_()
    release()
    await Promise.all([first, second])
    await snapshotter.ensurePreload_()

    assert.strictEqual(calls, 1)
  })
})
