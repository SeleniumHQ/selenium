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

const { Log } = require('selenium-webdriver/bidi/generated/log')

suite(
  function (env) {
    let driver
    let log

    beforeEach(async function () {
      driver = await env.builder().build()
      log = await Log.create(driver)
    })

    afterEach(function () {
      return driver.quit()
    })

    describe('onConsoleEntry', function () {
      it('can listen to console.log', async function () {
        let entry = null

        await log.onConsoleEntry((params) => {
          if (params.text === 'Hello, world!') {
            entry = params
          }
        })

        await driver.get(Pages.logEntryAdded)
        await driver.findElement({ id: 'consoleLog' }).click()
        await driver.wait(() => entry !== null, 5000)

        assert.ok(entry, 'console log entry should have been captured')
        assert.strictEqual(entry.type, 'console')
        assert.strictEqual(entry.level, 'info')
        assert.strictEqual(entry.method, 'log')
        assert.strictEqual(entry.text, 'Hello, world!')
        assert.ok(entry.source)
        // Raw BiDi event params use source.realm (not source.realmId which is
        // the hand-coded Source wrapper's getter)
        assert.ok(entry.source.realm)
      })

      it('can listen to console.error', async function () {
        let entry = null

        await log.onConsoleEntry((params) => {
          if (params.level === 'error' && params.text) {
            entry = params
          }
        })

        await driver.get(Pages.logEntryAdded)
        await driver.findElement({ id: 'consoleError' }).click()
        await driver.wait(() => entry !== null, 5000)

        assert.ok(entry, 'console error entry should have been captured')
        assert.strictEqual(entry.type, 'console')
        assert.strictEqual(entry.level, 'error')
      })

      it('can listen to console.warn', async function () {
        let entry = null

        await log.onConsoleEntry((params) => {
          if (params.level === 'warn' && params.text) {
            entry = params
          }
        })

        await driver.get(Pages.logEntryAdded)
        // logEntryAdded.html has no warn button; trigger via script instead
        await driver.executeScript('console.warn("test warn message")')
        await driver.wait(() => entry !== null, 5000)

        assert.ok(entry, 'console warn entry should have been captured')
        assert.strictEqual(entry.level, 'warn')
      })

      it('captures args in console log entries', async function () {
        let entry = null

        await log.onConsoleEntry((params) => {
          if (params.text === 'Hello, world!') {
            entry = params
          }
        })

        await driver.get(Pages.logEntryAdded)
        await driver.findElement({ id: 'consoleLog' }).click()
        await driver.wait(() => entry !== null, 5000)

        assert.ok(entry)
        assert.ok(Array.isArray(entry.args))
        assert.ok(entry.args.length > 0)
      })
    })

    describe('onJavascriptException', function () {
      it('can listen to javascript exceptions', async function () {
        let entry = null

        await log.onJavascriptException((params) => {
          entry = params
        })

        await driver.get(Pages.logEntryAdded)
        await driver.findElement({ id: 'jsException' }).click()
        await driver.wait(() => entry !== null, 5000)

        assert.ok(entry, 'javascript exception entry should have been captured')
        assert.strictEqual(entry.type, 'javascript')
        assert.strictEqual(entry.level, 'error')
        assert.ok(entry.text)
      })
    })

    describe('onEntryAdded', function () {
      it('receives all log entries including console', async function () {
        const entries = []

        await log.onEntryAdded((params) => {
          entries.push(params)
        })

        await driver.get(Pages.logEntryAdded)
        await driver.findElement({ id: 'consoleLog' }).click()
        await driver.wait(() => entries.length > 0, 5000)

        assert.ok(entries.length > 0, 'should have received at least one log entry')
      })

      it('can register multiple listeners', async function () {
        let count1 = 0
        let count2 = 0

        await log.onConsoleEntry(() => {
          count1++
        })
        await log.onConsoleEntry(() => {
          count2++
        })

        await driver.get(Pages.logEntryAdded)
        await driver.findElement({ id: 'consoleLog' }).click()
        await driver.wait(() => count1 >= 1 && count2 >= 1, 5000)

        assert.ok(count1 >= 1)
        assert.ok(count2 >= 1)
      })
    })

    describe('onJavascriptLog', function () {
      it('can listen to javascript log entries', async function () {
        const entries = []

        await log.onJavascriptLog((params) => {
          entries.push(params)
        })

        await driver.get(Pages.logEntryAdded)

        // Trigger a JS error to produce a javascript log entry
        await driver.findElement({ id: 'jsException' }).click()
        await driver.wait(() => entries.length > 0, 5000)

        assert.ok(entries.length > 0, 'onJavascriptLog should have received at least one entry')
        assert.strictEqual(entries[0].type, 'javascript')
      })
    })
  },
  { browsers: [Browser.CHROME, Browser.FIREFOX] },
)
