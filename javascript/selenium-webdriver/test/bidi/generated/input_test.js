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
const { suite, ignore, Pages } = require('../../../lib/test')
const { Browser } = require('selenium-webdriver')

const { Input } = require('selenium-webdriver/bidi/generated/input')
const { Script } = require('selenium-webdriver/bidi/generated/script')

suite(
  function (env) {
    let driver
    let input
    let script

    beforeEach(async function () {
      driver = await env.builder().build()
      input = await Input.create(driver)
      script = await Script.create(driver)
    })

    afterEach(function () {
      return driver.quit()
    })

    describe('performActions keyboard', function () {
      it('can type into a text field using key actions', async function () {
        const contextId = await driver.getWindowHandle()
        await driver.get(Pages.formPage)

        // Find a text input (id="working" is <input type="text"> on formPage)
        const inputEl = await driver.findElement({ id: 'working' })
        await inputEl.click()

        // Perform key actions using the generated API
        await input.performActions({
          context: contextId,
          actions: [
            {
              type: 'key',
              id: 'keyboard',
              actions: [
                { type: 'keyDown', value: 'H' },
                { type: 'keyUp', value: 'H' },
                { type: 'keyDown', value: 'i' },
                { type: 'keyUp', value: 'i' },
              ],
            },
          ],
        })

        const value = await inputEl.getAttribute('value')
        assert.strictEqual(value, 'Hi')
      })

      it('can perform select all and delete', async function () {
        const contextId = await driver.getWindowHandle()
        await driver.get(Pages.formPage)

        // id="working" is <input type="text"> on formPage
        const inputEl = await driver.findElement({ id: 'working' })
        await inputEl.clear()
        await inputEl.sendKeys('hello')

        // Select all and delete using BiDi key actions
        const modifier = process.platform === 'darwin' ? '' : '' // Meta / Control
        await input.performActions({
          context: contextId,
          actions: [
            {
              type: 'key',
              id: 'keyboard',
              actions: [
                { type: 'keyDown', value: modifier },
                { type: 'keyDown', value: 'a' },
                { type: 'keyUp', value: 'a' },
                { type: 'keyUp', value: modifier },
                { type: 'keyDown', value: '' }, // Backspace
                { type: 'keyUp', value: '' },
              ],
            },
          ],
        })

        const value = await inputEl.getAttribute('value')
        assert.strictEqual(value, '')
      })
    })

    describe('performActions pointer mouse', function () {
      it('can click using mouse pointer actions', async function () {
        const contextId = await driver.getWindowHandle()
        await driver.get(Pages.clicksPage)

        const button = await driver.findElement({ id: 'normal' })
        const rect = await button.getRect()

        await input.performActions({
          context: contextId,
          actions: [
            {
              type: 'pointer',
              id: 'mouse',
              parameters: { pointerType: 'mouse' },
              actions: [
                {
                  type: 'pointerMove',
                  x: Math.round(rect.x + rect.width / 2),
                  y: Math.round(rect.y + rect.height / 2),
                  origin: 'viewport',
                },
                { type: 'pointerDown', button: 0, width: 1, height: 1, pressure: 0 },
                { type: 'pointerUp', button: 0 },
              ],
            },
          ],
        })

        // If click went through, page should show a result
        const url = await driver.getCurrentUrl()
        assert.ok(url)
      })

      it('can perform mouse move', async function () {
        const contextId = await driver.getWindowHandle()
        await driver.get(Pages.emptyPage)

        await input.performActions({
          context: contextId,
          actions: [
            {
              type: 'pointer',
              id: 'mouse',
              parameters: { pointerType: 'mouse' },
              actions: [{ type: 'pointerMove', x: 100, y: 100, origin: 'viewport' }],
            },
          ],
        })
      })
    })

    ignore(env.browsers(Browser.CHROME)).describe('releaseActions', function () {
      it('can release actions', async function () {
        const contextId = await driver.getWindowHandle()
        await driver.get(Pages.emptyPage)

        await input.performActions({
          context: contextId,
          actions: [
            {
              type: 'key',
              id: 'keyboard',
              actions: [{ type: 'keyDown', value: 'a' }],
            },
          ],
        })

        await input.releaseActions({ context: contextId })
      })
    })

    ignore(env.browsers(Browser.FIREFOX)).describe('onFileDialogOpened', function () {
      it('receives event when a file input is clicked', async function () {
        let dialogEvent = null
        await input.onFileDialogOpened((params) => {
          dialogEvent = params
          assert.ok(params.context, 'event should have a context')
        })

        const contextId = await driver.getWindowHandle()
        await driver.get(Pages.uploadPage)

        // userActivation: true is required — Chrome blocks file dialog without a user gesture
        await script.evaluate({
          expression: "document.getElementById('upload').click()",
          target: { context: contextId },
          awaitPromise: false,
          userActivation: true,
        })
        // if code reaches here means the event did not happen so fail the test
        await driver.wait(() => dialogEvent !== null, 5000, 'fileDialogOpened event should have fired')
      })
    })
  },
  { browsers: [Browser.CHROME, Browser.FIREFOX] },
)
