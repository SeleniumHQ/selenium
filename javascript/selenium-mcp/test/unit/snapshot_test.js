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
const fs = require('node:fs')
const path = require('node:path')

const { JSDOM } = require('jsdom')

const { RefTable, collectNodes, formatLine, framePrefix } = require('../../lib/snapshot')

const FIXTURE = fs.readFileSync(path.join(__dirname, '../fixtures/snapshot.html'), 'utf8')

/** Runs the in-page collector the way the server does: as source, in the page. */
function collect(html, includeAll = false) {
  const dom = new JSDOM(html, { runScripts: 'outside-only' })
  const result = dom.window.eval(`(${collectNodes.toString()})(${includeAll})`)
  return { dom, ...result }
}

function render(items) {
  return items.map((item) => formatLine(item, item.ref ? `e${item.ref}` : null)).join('\n')
}

describe('snapshot', function () {
  describe('collectNodes', function () {
    it('lists interactive elements with roles, names and state', function () {
      const { items } = collect(FIXTURE)
      const text = render(items)
      for (const line of [
        '[e1] link "Home"',
        'heading "Sign in" [level=1]',
        'textbox "Username" [value="ada"]',
        'textbox "Password" [value=<hidden>]',
        'checkbox "Remember me" [checked]',
        'radio "Free"',
        'combobox "Country" [value="France"]',
        '  option "France" [selected]',
        'textbox "Notes"',
        'button "Sign in" [disabled]',
        'button "Go"',
        'alert "Wrong password"',
        'button "Custom button"',
        'generic "Clickable div"',
        'link "Inside presentation"',
        'button "Labelled by two"',
        'status "Saved Dismiss"',
        '  [e', // the status's child below
        'button "Dismiss"',
        'button "Typo role"',
        'iframe "Inner"',
      ]) {
        assert.ok(text.includes(line), `expected ${JSON.stringify(line)} in:\n${text}`)
      }
    })

    it('never leaks password values', function () {
      const text = render(collect(FIXTURE).items)
      assert.ok(!text.includes('secret'), text)
    })

    it('leaves out hidden and non-interactive content by default', function () {
      const text = render(collect(FIXTURE).items)
      for (const absent of [
        'Hidden button',
        'Also hidden',
        'Aria hidden',
        'Invisible',
        'Not a link',
        'Enter your details',
        'token',
      ]) {
        assert.ok(!text.includes(absent), `did not expect ${absent} in:\n${text}`)
      }
    })

    it('includes structure and text when asked for everything', function () {
      const text = render(collect(FIXTURE, true).items)
      assert.ok(text.includes('text "Enter your details below."'), text)
      assert.ok(/^\[e\d+\] main$/m.test(text), text)
      assert.ok(/^ +\[e\d+\] form$/m.test(text), text)
      assert.ok(text.includes('img "Logo"'), text)
      assert.ok(!text.includes('Hidden button'), text)
    })

    it('gives options no refs, since browser_select_option takes values', function () {
      const { items } = collect(FIXTURE)
      const options = items.filter((i) => i.role === 'option')
      assert.strictEqual(options.length, 2)
      assert.ok(options.every((o) => o.ref === null))
    })

    it('marks iframes so the server can descend into them', function () {
      const frames = collect(FIXTURE).items.filter((i) => i.frame)
      assert.strictEqual(frames.length, 1)
      assert.strictEqual(frames[0].element.localName, 'iframe')
    })

    it('keeps refs stable across snapshots of the same document', function () {
      const dom = new JSDOM(FIXTURE, { runScripts: 'outside-only' })
      const run = () => dom.window.eval(`(${collectNodes.toString()})(false)`)
      const first = run()
      dom.window.document.querySelector('h1').insertAdjacentHTML('afterend', '<button>New</button>')
      const second = run()
      assert.strictEqual(first.fresh, true)
      assert.strictEqual(second.fresh, false)
      const refOf = (r, name) => r.items.find((i) => i.name === name).ref
      assert.strictEqual(refOf(second, 'Username'), refOf(first, 'Username'))
      assert.ok(refOf(second, 'New') > refOf(first, 'Inner'))
    })

    it('does not repeat a container name as text', function () {
      const text = render(collect(FIXTURE, true).items)
      assert.ok(!/text "Saved"/.test(text), text)
      assert.ok(!/text "Wrong password"/.test(text), text)
    })

    it('handles an empty document', function () {
      assert.strictEqual(collect('<html><body></body></html>').items.length, 0)
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
  })
})
