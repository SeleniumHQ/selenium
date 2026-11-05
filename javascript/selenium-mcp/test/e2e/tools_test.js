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

const { refOf, startMcp, startPageServer } = require('./harness')

describe('selenium-mcp tools', function () {
  let pages
  let mcp

  before(async function () {
    pages = await startPageServer()
    mcp = await startMcp()
  })

  after(async function () {
    if (mcp) await mcp.close()
    if (pages) await pages.close()
  })

  async function open(path) {
    const result = await mcp.call('browser_navigate', { url: pages.url(path) })
    assert.ok(!result.isError, result.text)
    return result.text
  }

  async function ok(name, args) {
    const result = await mcp.call(name, args)
    assert.ok(!result.isError, `${name} failed: ${result.text}`)
    return result.text
  }

  it('lists the tools without starting a browser', async function () {
    const { tools } = await mcp.client.listTools()
    assert.strictEqual(tools.length, 16)
    assert.strictEqual(mcp.session.isOpen, false)
  })

  describe('login scenario', function () {
    it('logs in on the bindings login page using only refs', async function () {
      const page = await open('/common/login.html')
      assert.match(page, /heading "Login"/)
      await ok('browser_type', { ref: refOf(page, 'textbox "Username"'), text: 'username' })
      await ok('browser_type', { ref: refOf(page, 'textbox "Password"'), text: 'password' })
      const clicked = await ok('browser_click', { element: 'Login button', ref: refOf(page, 'button "Login"') })
      assert.match(clicked, /A dialog is open: "You have successfully logged in."/)
      const after = await ok('browser_handle_dialog', { accept: true })
      assert.match(after, /### Snapshot/)
    })

    it('fills the form in one call and submits with Enter', async function () {
      const page = await open('/common/login.html')
      await ok('browser_fill_form', {
        fields: [
          { name: 'Username', type: 'textbox', ref: refOf(page, 'textbox "Username"'), value: 'wrong' },
          { name: 'Password', type: 'textbox', ref: refOf(page, 'textbox "Password"'), value: 'wrong' },
        ],
      })
      const clicked = await ok('browser_click', { ref: refOf(page, 'button "Login"') })
      assert.match(clicked, /Please enter valid credentials/)
      await ok('browser_handle_dialog', { accept: true })
    })
  })

  describe('snapshot', function () {
    it('descends into iframes and acts on refs inside them', async function () {
      const page = await open('/fixtures/frames.html')
      const inner = refOf(page, 'button "Inner button"')
      assert.match(inner, /^f\d+e\d+$/)
      const clicked = await ok('browser_click', { ref: inner })
      assert.match(clicked, /button "Inner clicked"/)
      const outer = await ok('browser_click', { ref: refOf(clicked, 'button "Outer button"') })
      assert.match(outer, /button "Outer clicked"/)
      assert.match(await ok('browser_wait_for', { text: 'Inner clicked' }), /Waited for text/)
    })

    it('descends into the bindings iframes page', async function () {
      const page = await open('/common/iframes.html')
      assert.match(page, /iframe/)
      assert.match(page, /\[f\d+e\d+\] textbox/)
    })

    it('shows and acts on elements inside open shadow roots', async function () {
      const page = await open('/fixtures/shadow.html')
      const clicked = await ok('browser_click', { ref: refOf(page, 'button "Shadow button"') })
      assert.match(clicked, /button "Shadow clicked"/)
    })

    it('names a status region from its text', async function () {
      const page = await open('/fixtures/snapshot.html')
      assert.match(page, /status "Saved"\n\s+\[e\d+\] button "Dismiss"/)
      assert.match(page, /alert "Wrong password"/)
      assert.ok(!page.includes('secret'), page)
    })

    it('returns everything when asked', async function () {
      await open('/fixtures/snapshot.html')
      const all = await ok('browser_snapshot', { all: true })
      assert.match(all, /text "Enter your details below."/)
    })

    it('keeps refs across snapshots and rejects unknown ones', async function () {
      const page = await open('/fixtures/interactions.html')
      const again = await ok('browser_snapshot', {})
      assert.strictEqual(refOf(again, 'button "Hover me"'), refOf(page, 'button "Hover me"'))
      const result = await mcp.call('browser_click', { ref: 'e999' })
      assert.ok(result.isError)
      assert.match(result.text, /browser_snapshot/)
    })

    it('reports bad arguments without touching the browser', async function () {
      const result = await mcp.call('browser_click', {})
      assert.ok(result.isError)
      assert.match(result.text, /ref is required/)
    })
  })

  describe('interaction', function () {
    let page

    beforeEach(async function () {
      page = await open('/fixtures/interactions.html')
    })

    it('selects an option by label or value', async function () {
      const byLabel = await ok('browser_select_option', { ref: refOf(page, 'combobox "Fruit"'), values: ['Pear'] })
      assert.match(byLabel, /status "Picked pear"/)
      const multi = await ok('browser_select_option', {
        ref: refOf(page, 'listbox "Extras"'),
        values: ['seeds', 'oats'],
      })
      assert.match(multi, /option "Seeds" \[selected\]/)
      assert.match(multi, /option "Nuts"\n/)
    })

    it('says which options exist when a value is wrong, and changes nothing', async function () {
      const result = await mcp.call('browser_select_option', { ref: refOf(page, 'combobox "Fruit"'), values: ['kiwi'] })
      assert.ok(result.isError)
      assert.match(result.text, /"Apple", "Pear"/)
      const multi = await mcp.call('browser_select_option', {
        ref: refOf(page, 'listbox "Extras"'),
        values: ['seeds', 'kiwi'],
      })
      assert.ok(multi.isError)
      assert.match(await ok('browser_snapshot', {}), /option "Nuts" \[selected\]\n\s+\[e\d+\] option "Seeds"\n/)
    })

    it('moves a slider through fill_form', async function () {
      const filled = await ok('browser_fill_form', {
        fields: [{ name: 'Volume', type: 'slider', ref: refOf(page, 'slider "Volume'), value: '7' }],
      })
      assert.match(filled, /status "Volume 7"/)
      const spelled = await ok('browser_fill_form', {
        fields: [{ name: 'Volume', type: 'slider', ref: refOf(page, 'slider "Volume'), value: '3.0' }],
      })
      assert.match(spelled, /status "Volume 3"/)
      const readonly = await ok('browser_fill_form', {
        fields: [{ name: 'Readonly', type: 'slider', ref: refOf(page, 'slider "Readonly'), value: '8' }],
      })
      assert.match(readonly, /slider "Readonly" \[value="8"\]/)
    })

    it('refuses slider values out of range, and disabled sliders, without changing them', async function () {
      const outOfRange = await mcp.call('browser_fill_form', {
        fields: [{ name: 'Volume', type: 'slider', ref: refOf(page, 'slider "Volume'), value: '99' }],
      })
      assert.ok(outOfRange.isError)
      assert.match(outOfRange.text, /would take 10/)
      const locked = await mcp.call('browser_fill_form', {
        fields: [{ name: 'Locked', type: 'slider', ref: refOf(page, 'slider "Locked'), value: '1' }],
      })
      assert.ok(locked.isError)
      assert.match(locked.text, /disabled/)
      const after = await ok('browser_snapshot', {})
      assert.match(after, /status "Nothing yet"/)
      assert.match(after, /slider "Locked" \[disabled\] \[value="5"\]/)
    })

    it('picks radios and refuses to clear one', async function () {
      const picked = await ok('browser_fill_form', {
        fields: [{ name: 'Large', type: 'radio', ref: refOf(page, 'radio "Large"'), value: 'true' }],
      })
      assert.match(picked, /radio "Large" \[checked\]/)
      const cleared = await mcp.call('browser_fill_form', {
        fields: [{ name: 'Large', type: 'radio', ref: refOf(picked, 'radio "Large"'), value: 'false' }],
      })
      assert.ok(cleared.isError)
      assert.match(cleared.text, /choose another option/)
    })

    it('refuses a ref whose element the page removed', async function () {
      const ref = refOf(page, 'button "Remove me"')
      const after = await ok('browser_click', { ref })
      assert.ok(!after.includes('Remove me'), after)
      const stale = await mcp.call('browser_click', { ref })
      assert.ok(stale.isError)
      assert.match(stale.text, /not in the current snapshot/)
    })

    it('hovers and double clicks', async function () {
      assert.match(await ok('browser_hover', { ref: refOf(page, 'button "Hover me"') }), /button "Hovered"/)
      const dbl = await ok('browser_click', { ref: refOf(page, 'button "Double click me"'), doubleClick: true })
      assert.match(dbl, /button "Double clicked"/)
    })

    it('presses keys in the focused element', async function () {
      await ok('browser_type', { ref: refOf(page, 'textbox "Keys"'), text: 'abc' })
      assert.match(await ok('browser_press_key', { key: 'Enter' }), /status "Enter in abc"/)
    })

    it('ticks a checkbox through fill_form', async function () {
      const filled = await ok('browser_fill_form', {
        fields: [{ name: 'Agree', type: 'checkbox', ref: refOf(page, 'checkbox "Agree"'), value: 'true' }],
      })
      assert.match(filled, /checkbox "Agree" \[checked\]/)
    })

    it('waits for text to appear', async function () {
      await ok('browser_click', { ref: refOf(page, 'button "Load later"') })
      assert.match(await ok('browser_wait_for', { text: 'Done loading' }), /status "Done loading"/)
      const timedOut = await mcp.call('browser_wait_for', { textGone: 'Done loading', time: 0 })
      assert.ok(timedOut.isError)
    })
  })

  describe('dialogs', function () {
    it('answers a prompt and dismisses a confirm', async function () {
      let page = await open('/common/alerts.html')
      const prompted = await ok('browser_click', { ref: refOf(page, 'link "prompt happen"') })
      assert.match(prompted, /"Enter something"/)
      await ok('browser_handle_dialog', { accept: true, promptText: 'cheddar' })
      page = await ok('browser_snapshot', { all: true })
      assert.match(page, /cheddar/)

      const confirmed = await ok('browser_click', { ref: refOf(page, 'link "test confirm"') })
      assert.match(confirmed, /"Are you sure\?"/)
      const dismissed = await ok('browser_handle_dialog', { accept: false })
      assert.match(dismissed, /alerts\.html/)
    })

    it('says when there is no dialog', async function () {
      await open('/fixtures/interactions.html')
      const result = await mcp.call('browser_handle_dialog', { accept: true })
      assert.ok(result.isError)
      assert.match(result.text, /No dialog/)
    })
  })

  describe('pages and tabs', function () {
    it('navigates back', async function () {
      await open('/fixtures/interactions.html')
      await open('/common/login.html')
      const back = await ok('browser_navigate_back', {})
      assert.match(back, /interactions\.html/)
      assert.match(back, /^\[e1\] /m)
    })

    it('starts refs over on a new page', async function () {
      await open('/fixtures/interactions.html')
      assert.match(await open('/common/login.html'), /^\[e1\] /m)
    })

    it('opens, lists, selects and closes tabs', async function () {
      const page = await open('/fixtures/interactions.html')
      await ok('browser_click', { ref: refOf(page, 'link "Open in new tab"') })
      const list = await ok('browser_tabs', { action: 'list' })
      assert.match(list, /- 1: "Inner"/)
      assert.match(await ok('browser_tabs', { action: 'select', index: 1 }), /button "Inner button"/)
      assert.match(await ok('browser_tabs', { action: 'close' }), /interactions\.html/)
      assert.match(await ok('browser_tabs', { action: 'new' }), /about:blank/)
      await ok('browser_tabs', { action: 'close', index: 1 })
    })
  })

  describe('inspection', function () {
    it('takes viewport and element screenshots', async function () {
      const page = await open('/fixtures/interactions.html')
      const viewport = await mcp.call('browser_take_screenshot', {})
      assert.strictEqual(viewport.content[1].type, 'image')
      assert.strictEqual(viewport.content[1].mimeType, 'image/png')
      const element = await mcp.call('browser_take_screenshot', { ref: refOf(page, 'button "Hover me"') })
      assert.ok(element.content[1].data.length < viewport.content[1].data.length)
    })

    it('collects console messages over BiDi', async function () {
      await open('/fixtures/interactions.html')
      const info = await ok('browser_console_messages', {})
      assert.match(info, /\[warning\] fixture warning/)
      assert.match(info, /\[info\] fixture info/)
      const warnings = await ok('browser_console_messages', { level: 'warning' })
      assert.ok(!warnings.includes('fixture info'), warnings)
      await ok('browser_tabs', { action: 'new' })
      const fresh = await ok('browser_console_messages', {})
      assert.ok(!fresh.includes('fixture warning'), fresh)
      await ok('browser_tabs', { action: 'close' })
    })
  })

  describe('lifecycle and security', function () {
    it('refuses origins outside the allow list', async function () {
      const restricted = await startMcp({ allowedOrigins: ['https://example.invalid'] })
      try {
        const result = await restricted.call('browser_navigate', { url: pages.url('/common/login.html') })
        assert.ok(result.isError)
        assert.match(result.text, /allowed-origins/)
        assert.strictEqual(restricted.session.isOpen, false)
      } finally {
        await restricted.close()
      }
    })

    it('closes the browser and starts a new one on the next call', async function () {
      await ok('browser_close', {})
      assert.strictEqual(mcp.session.isOpen, false)
      await open('/common/login.html')
      assert.strictEqual(mcp.session.isOpen, true)
    })

    it('recovers when the browser goes away underneath it', async function () {
      await open('/common/login.html')
      await (await mcp.session.driver()).quit()
      const gone = await mcp.call('browser_snapshot', {})
      assert.ok(gone.isError)
      assert.match(gone.text, /no longer running/)
      await open('/common/login.html')
    })
  })
})
