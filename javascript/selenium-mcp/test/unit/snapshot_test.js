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

const assert = require('node:assert')

const { AccessibilityNode, WebElement } = require('selenium-webdriver')

const { RefTable, formatLine, framePrefix, renderTree } = require('../../lib/snapshot')

let nextId = 0

/** A node backed by an element, as the bindings return it. */
function el(role, name, fields = {}) {
  return new AccessibilityNode({ role, name, element: new WebElement(null, `id-${++nextId}`), ...fields })
}

function text(content) {
  return new AccessibilityNode({ role: 'text', name: content })
}

function page(...children) {
  return new AccessibilityNode({ role: 'document', name: 'Page', element: new WebElement(null, 'root'), children })
}

async function render(root, options = {}, table = new RefTable()) {
  const { lines, entries } = await renderTree(root, table, options)
  return { text: lines.join('\n'), entries, table }
}

describe('snapshot', function () {
  describe('renderTree', function () {
    const form = () =>
      page(
        el('banner', '', { children: [el('navigation', '', { children: [el('link', 'Home')] })] }),
        el('main', '', {
          children: [
            el('heading', 'Sign in', { states: { level: 1 }, children: [text('Sign in')] }),
            el('paragraph', '', { children: [text('Enter your details below.')] }),
            el('form', '', {
              children: [
                text('Username'),
                el('textbox', 'Username', { value: 'ada' }),
                el('textbox', 'Password', { value: '••••••' }),
                el('checkbox', 'Remember me', { states: { checked: true } }),
                el('combobox', 'Country', {
                  value: 'France',
                  children: [el('option', 'United Kingdom'), el('option', 'France', { states: { selected: true } })],
                }),
                el('button', 'Sign in', { states: { disabled: true } }),
                el('button', 'Menu', { states: { expanded: false } }),
              ],
            }),
            el('alert', '', { children: [text('Wrong password')] }),
            el('status', '', { children: [text('Saved'), el('button', 'Dismiss')] }),
          ],
        }),
      )

    it('lists interactive elements with roles, names and state', async function () {
      const { text } = await render(form())
      for (const line of [
        '[e1] link "Home"',
        'heading "Sign in" [level=1]',
        'textbox "Username" [value="ada"]',
        'checkbox "Remember me" [checked]',
        'combobox "Country" [value="France"]',
        '  option "France" [selected]',
        'button "Sign in" [disabled]',
        'button "Menu" [collapsed]',
      ]) {
        assert.ok(text.includes(line), `expected ${JSON.stringify(line)} in:\n${text}`)
      }
    })

    it('names alerts and status regions from their text', async function () {
      const { text } = await render(form())
      assert.match(text, /\] alert "Wrong password"$/m)
      assert.match(text, /\] status "Saved"\n {2}\[e\d+\] button "Dismiss"$/m)
    })

    it('leaves out structure and text by default', async function () {
      const { text } = await render(form())
      for (const absent of ['banner', 'main', 'form', 'paragraph', 'Enter your details', 'text ']) {
        assert.ok(!text.includes(absent), `did not expect ${absent} in:\n${text}`)
      }
    })

    it('includes structure and text when asked for everything', async function () {
      const { text } = await render(form(), { all: true })
      assert.ok(text.includes('text "Enter your details below."'), text)
      assert.ok(/^\[e\d+\] main$/m.test(text), text)
      assert.ok(/^ +\[e\d+\] form$/m.test(text), text)
      assert.ok(!text.includes('text "Wrong password"'), 'the alert name already says it')
    })

    it('gives a native select’s options no refs, since browser_select_option takes their text', async function () {
      const { text } = await render(form())
      assert.match(text, /^ {2}option "United Kingdom"$/m)
      const listbox = page(el('listbox', 'Pick', { children: [el('option', 'One')] }))
      assert.match((await render(listbox)).text, /\[e\d+\] option "One"/)
    })

    it('keeps an element’s ref across snapshots and drops refs for elements that went away', async function () {
      const table = new RefTable()
      const save = el('button', 'Save')
      const remove = el('button', 'Remove me')
      const first = await render(page(remove, save), {}, table)
      table.replaceWith(first.entries)
      assert.match(first.text, /\[e2\] button "Save"/)
      const second = await render(page(save), {}, table)
      table.replaceWith(second.entries)
      assert.match(second.text, /^\[e2\] button "Save"$/)
      assert.throws(() => table.get('e1'), /not in the current snapshot/)
      assert.strictEqual(table.get('e2').element, save.element)
    })

    it('puts frame content under the iframe with prefixed refs and the frame path', async function () {
      const frame = el('iframe', 'Inner', { children: [page(el('button', 'In frame'))] })
      const { text, entries } = await render(page(el('button', 'Outer'), frame))
      assert.match(text, /^\[e2\] iframe "Inner"\n {2}\[f2e1\] button "In frame"$/m)
      assert.deepStrictEqual(entries.get('f2e1').framePath, [frame.element])
    })

    it('says when a frame could not be read', async function () {
      const { text } = await render(page(el('iframe', 'Gone')))
      assert.match(text, /iframe "Gone"\n {2}\(frame content not available\)/)
    })

    it('stops descending into deeply nested frames', async function () {
      let node = el('button', 'Deep')
      for (let i = 0; i < 7; i++) node = el('iframe', `F${i}`, { children: [page(node)] })
      const { text } = await render(page(node))
      assert.match(text, /\(frames nested too deep, not shown\)/)
      assert.ok(!text.includes('Deep'), text)
    })

    it('shortens long names', async function () {
      const { text } = await render(page(el('link', 'x'.repeat(300))))
      assert.match(text, /link "x{99}…"/)
    })
  })

  describe('formatLine', function () {
    it('indents, quotes the name and lists properties', function () {
      assert.strictEqual(
        formatLine({ depth: 2, role: 'checkbox', name: 'Say "hi"', props: ['checked', 'disabled'] }, 'e4'),
        '    [e4] checkbox "Say \\"hi\\"" [checked] [disabled]',
      )
    })

    it('omits the ref and name when there are none', function () {
      assert.strictEqual(formatLine({ depth: 0, role: 'option', name: '', props: [] }, null), 'option')
    })
  })

  describe('framePrefix', function () {
    it('nests frame refs under the frame element ref', function () {
      assert.strictEqual(framePrefix('', 7), 'f7')
      assert.strictEqual(framePrefix('f7', 3), 'f7f3')
    })
  })

  describe('RefTable', function () {
    it('looks refs up, with or without brackets', function () {
      const table = new RefTable()
      const entry = { element: {}, framePath: [] }
      table.set('e3', entry)
      assert.strictEqual(table.get('e3'), entry)
      assert.strictEqual(table.get('[e3]'), entry)
    })

    it('explains how to recover from an unknown ref', function () {
      assert.throws(() => new RefTable().get('e9'), /Call browser_snapshot/)
    })

    it('drops refs the new entries leave out', function () {
      const table = new RefTable()
      table.set('e1', { element: {}, framePath: [] })
      table.set('e2', { element: {}, framePath: [] })
      const kept = { element: {}, framePath: [] }
      table.replaceWith(new Map([['e2', kept]]))
      assert.throws(() => table.get('e1'), /not in the current snapshot/)
      assert.strictEqual(table.get('e2'), kept)
    })

    it('numbers elements per frame and starts again once cleared', function () {
      const table = new RefTable()
      assert.strictEqual(table.numberFor('', 'a'), 1)
      assert.strictEqual(table.numberFor('', 'b'), 2)
      assert.strictEqual(table.numberFor('f1', 'c'), 1)
      assert.strictEqual(table.numberFor('', 'a'), 1)
      table.clear()
      assert.strictEqual(table.numberFor('', 'b'), 1)
    })
  })
})
