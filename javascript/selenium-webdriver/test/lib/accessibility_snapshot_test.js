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
  nodeFromWire,
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

describe('nodeFromWire', function () {
  it('builds the tree from the JSON form and resolves element and frame indices', async function () {
    const data = {
      role: 'generic',
      name: '',
      description: '',
      states: {},
      element: 0,
      children: [
        { role: 'text', name: 'Intro', description: '', states: {}, children: [] },
        {
          role: 'textbox',
          name: 'Email',
          description: 'Where to write',
          value: 'a@b.c',
          states: { focused: true, level: 2, pressed: 'mixed', selected: false },
          element: 1,
          children: [],
        },
        { role: 'iframe', name: 'Embedded', description: '', states: {}, element: 2, frame: 0, children: [] },
      ],
    }
    const stitched = []
    const node = await nodeFromWire(data, ['element:0', 'element:1', 'element:2'], async (index) => {
      stitched.push(index)
      return [new AccessibilityNode({ role: 'document', name: 'Inner' })]
    })

    assert.strictEqual(node.role, 'generic')
    assert.strictEqual(node.element, 'element:0')
    const [text, textbox, frame] = node.children
    assert.strictEqual(text.role, 'text')
    assert.strictEqual(text.element, null)
    assert.deepStrictEqual(text.children, [])
    assert.strictEqual(textbox.element, 'element:1')
    assert.strictEqual(textbox.value, 'a@b.c')
    assert.strictEqual(textbox.description, 'Where to write')
    assert.deepStrictEqual(textbox.states, { focused: true, level: 2, pressed: 'mixed', selected: false })
    assert.strictEqual(frame.element, 'element:2')
    assert.deepStrictEqual(
      frame.children.map((child) => child.name),
      ['Inner'],
      "the frame's children come from the binding",
    )
    assert.deepStrictEqual(stitched, [0])
  })

  it('keeps absent fields absent', async function () {
    const node = await nodeFromWire({ role: 'list', name: '', states: {}, children: [] }, [], async () => [])

    assert.strictEqual(node.description, '')
    assert.strictEqual(node.value, undefined)
    assert.strictEqual(node.element, null)
    assert.deepStrictEqual(node.children, [])
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

  it('reads a root another document owns as null and a detached root as the stale error', async function () {
    const snapshotter = new AccessibilitySnapshotter({}, () => null)
    const answers = []
    snapshotter.send_ = async () => ({ type: 'success', result: answers.shift() })

    answers.push({ type: 'null' })
    assert.strictEqual(await snapshotter.snapshotContext_('ctx', 'shared-1'), null)

    answers.push({ type: 'object', value: [['error', { type: 'string', value: 'detached' }]] })
    await assert.rejects(snapshotter.snapshotContext_('ctx', 'shared-1'), error.StaleElementReferenceError)
  })

  it("maps the elements list to elements and a frame index to the frame's context", async function () {
    const made = []
    const snapshotter = new AccessibilitySnapshotter({}, (id) => {
      made.push(id)
      return `element:${id}`
    })
    const contexts = []
    snapshotter.send_ = async (_method, params) => {
      contexts.push(params.target.context)
      if (contexts.length === 1) {
        return {
          type: 'success',
          result: {
            type: 'object',
            value: [
              [
                'json',
                {
                  type: 'string',
                  value: JSON.stringify({
                    role: 'document',
                    name: 'Frames',
                    description: '',
                    states: {},
                    element: 0,
                    children: [
                      { role: 'iframe', name: '', description: '', states: {}, element: 1, frame: 0, children: [] },
                    ],
                  }),
                },
              ],
              [
                'elements',
                {
                  type: 'array',
                  value: [
                    { type: 'node', sharedId: 'top-html' },
                    { type: 'node', sharedId: 'frame-1' },
                  ],
                },
              ],
              ['windows', { type: 'array', value: [{ type: 'window', value: { context: 'child' } }] }],
            ],
          },
        }
      }
      return {
        type: 'success',
        result: {
          type: 'object',
          value: [
            [
              'json',
              {
                type: 'string',
                value: JSON.stringify({
                  role: 'document',
                  name: 'Inner',
                  description: '',
                  states: {},
                  element: 0,
                  children: [],
                }),
              },
            ],
            ['elements', { type: 'array', value: [{ type: 'node', sharedId: 'child-html' }] }],
            ['windows', { type: 'array', value: [] }],
          ],
        },
      }
    }

    const tree = await snapshotter.snapshotContext_('top', null)

    assert.deepStrictEqual(contexts, ['top', 'child'], 'the frame is snapshotted in its own context')
    assert.strictEqual(tree.element, 'element:top-html')
    assert.strictEqual(tree.children[0].role, 'iframe')
    assert.strictEqual(tree.children[0].element, 'element:frame-1')
    assert.strictEqual(tree.children[0].children[0].name, 'Inner')
    assert.strictEqual(tree.children[0].children[0].element, 'element:child-html')
    assert.deepStrictEqual(made, ['top-html', 'frame-1', 'child-html'])
  })
})
