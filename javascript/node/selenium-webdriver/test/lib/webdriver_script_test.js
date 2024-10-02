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
const { Browser } = require('selenium-webdriver')
const { Pages, suite } = require('../../lib/test')
const fileServer = require('../../lib/test/fileserver')
const until = require('selenium-webdriver/lib/until')

suite(
  function (env) {
    let driver

    beforeEach(async function () {
      driver = await env.builder().build()
    })

    afterEach(async function () {
      await driver.quit()
    })

    function delay(ms) {
      return new Promise((resolve) => setTimeout(resolve, ms))
    }

    describe('script()', function () {
      it('can listen to console log', async function () {
        let log = null
        const handler = await driver.script().addConsoleMessageHandler((logEntry) => {
          log = logEntry
        })

        await driver.get(Pages.logEntryAdded)
        await driver.findElement({ id: 'consoleLog' }).click()

        await delay(3000)

        assert.equal(log.text, 'Hello, world!')
        assert.equal(log.realm, null)
        assert.equal(log.type, 'console')
        assert.equal(log.level, 'info')
        assert.equal(log.method, 'log')
        assert.equal(log.args.length, 1)
        await driver.script().removeConsoleMessageHandler(handler)
      })

      it('can listen to javascript error', async function () {
        let log = null
        const handler = await driver.script().addJavaScriptErrorHandler((logEntry) => {
          log = logEntry
        })

        await driver.get(Pages.logEntryAdded)
        await driver.findElement({ id: 'jsException' }).click()

        await delay(3000)

        assert.equal(log.text, 'Error: Not working')
        assert.equal(log.type, 'javascript')
        assert.equal(log.level, 'error')

        await driver.script().removeJavaScriptErrorHandler(handler)
      })

      it('throws an error while removing a handler that does not exist', async function () {
        try {
          await driver.script().removeJavaScriptErrorHandler(10)
          assert.fail('Expected error not thrown. Non-existent handler cannot be removed')
        } catch (e) {
          assert.strictEqual(e.message, 'Callback with id 10 not found')
        }
      })

      it('can listen to dom mutations', async function () {
        let message = null
        await driver.script().addDomMutationHandler((m) => {
          message = m
        })

        await driver.get(fileServer.Pages.dynamicPage)

        let element = driver.findElement({ id: 'reveal' })
        await element.click()
        let revealed = driver.findElement({ id: 'revealed' })
        await driver.wait(until.elementIsVisible(revealed), 5000)

        assert.strictEqual(message['attribute_name'], 'style')
        assert.strictEqual(message['current_value'], '')
        assert.strictEqual(message['old_value'], 'display:none;')
      })

      it('can remove to dom mutation handler', async function () {
        let message = null
        let id = await driver.script().addDomMutationHandler((m) => {
          message = m
        })

        await driver.get(fileServer.Pages.dynamicPage)

        await driver.script().removeDomMutationHandler(id)

        let element = driver.findElement({ id: 'reveal' })
        await element.click()
        let revealed = driver.findElement({ id: 'revealed' })
        await driver.wait(until.elementIsVisible(revealed), 5000)

        assert.strictEqual(message, null)
      })

      it('can pin script', async function () {
        await driver.script().pin("() => { console.log('Hello!'); }")
        let log

        await driver.script().addConsoleMessageHandler((logEntry) => {
          log = logEntry
        })

        await driver.get(Pages.logEntryAdded)

        await delay(3000)

        assert.equal(log.text, 'Hello!')
      })

      it('can unpin script', async function () {
        const id = await driver.script().pin("() => { console.log('Hello!'); }")

        let count = 0
        await driver.script().addConsoleMessageHandler((logEntry) => {
          count++
        })

        await driver.get(Pages.logEntryAdded)

        await driver.script().unpin(id)

        await driver.get(Pages.logEntryAdded)

        assert.equal(count, 1)
      })
    })
  },
  { browsers: [Browser.FIREFOX, Browser.CHROME, Browser.EDGE] },
)
