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
const logInspector = require('selenium-webdriver/bidi/logInspector')
const filterBy = require('selenium-webdriver/bidi/filterBy')

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

    describe('Log Inspector', function () {
      it('can listen to console log', async function () {
        const inspector = await logInspector(driver)
        await inspector.onConsoleEntry(function (log) {
          assert.equal(log.text, 'Hello, world!')
          assert.notEqual(log.source.realmId, null)
          assert.notEqual(log.source.browsingContextId, null)
          assert.equal(log.type, 'console')
          assert.equal(log.level, 'info')
          assert.equal(log.method, 'log')
          assert.equal(log.args.length, 1)
        })

        await driver.get(Pages.logEntryAdded)
        await driver.findElement({ id: 'consoleLog' }).click()

        await inspector.close()
      })

      it('can listen to console log with different consumers', async function () {
        let logEntry = null
        const inspector = await logInspector(driver)
        await inspector.onConsoleEntry(function (log) {
          logEntry = log
          assert.equal(logEntry.text, 'Hello, world!')
          assert.notEqual(log.source.realmId, null)
          assert.notEqual(log.source.browsingContextId, null)
          assert.equal(logEntry.type, 'console')
          assert.equal(logEntry.level, 'info')
          assert.equal(logEntry.method, 'log')
          assert.equal(logEntry.args.length, 1)
        })

        let logEntryText = null
        await inspector.onConsoleEntry(function (log) {
          logEntryText = log.text
          assert.equal(logEntryText, 'Hello, world!')
        })

        await driver.get(Pages.logEntryAdded)
        await driver.findElement({ id: 'consoleLog' }).click()

        await inspector.close()
      })

      it('can filter console info level log', async function () {
        let logEntry = null
        const inspector = await logInspector(driver)
        await inspector.onConsoleEntry(function (log) {
          logEntry = log
          assert.equal(logEntry.text, 'Hello, world!')
          assert.notEqual(log.source.realmId, null)
          assert.notEqual(log.source.browsingContextId, null)
          assert.equal(logEntry.type, 'console')
          assert.equal(logEntry.level, 'info')
          assert.equal(logEntry.method, 'log')
          assert.equal(logEntry.args.length, 1)
        }, filterBy.FilterBy.logLevel('info'))

        await driver.get(Pages.logEntryAdded)
        await driver.findElement({ id: 'consoleLog' }).click()

        await inspector.close()
      })

      it('can filter console log', async function () {
        const inspector = await logInspector(driver)
        await inspector.onConsoleEntry(function (log) {
          assert.notEqual(log, null)
        }, filterBy.FilterBy.logLevel('info'))

        await driver.get(Pages.logEntryAdded)
        await driver.findElement({ id: 'consoleLog' }).click()

        await inspector.close()
      })

      it('can call multiple callbacks for console log', async function () {
        let logEntry1 = null
        let logEntry2 = null
        let logEntry3 = null
        let logEntry4 = null
        const inspector = await logInspector(driver)
        await inspector.onConsoleEntry(function (log) {
          logEntry1 = log
        })

        await inspector.onConsoleEntry(function (log) {
          logEntry2 = log
        })

        await inspector.onConsoleEntry(function (log) {
          logEntry3 = log
        }, filterBy.FilterBy.logLevel('info'))

        await inspector.onConsoleEntry(function (log) {
          logEntry4 = log
        }, filterBy.FilterBy.logLevel('error'))

        await driver.get(Pages.logEntryAdded)
        await driver.findElement({ id: 'consoleLog' }).click()

        await delay(3000)

        assert.notEqual(logEntry1, null)
        assert.notEqual(logEntry2, null)
        assert.notEqual(logEntry3, null)
        assert.equal(logEntry4, null)

        await inspector.close()
      })

      it('can listen to javascript log', async function () {
        let logEntry = null
        const inspector = await logInspector(driver)
        await inspector.onJavascriptLog(function (log) {
          logEntry = log
          assert.equal(logEntry.text, 'Error: Not working')
          assert.equal(logEntry.type, 'javascript')
          assert.equal(logEntry.level, 'error')
        })

        await driver.get(Pages.logEntryAdded)
        await driver.findElement({ id: 'jsException' }).click()

        await inspector.close()
      })

      it('can filter javascript log at error level', async function () {
        let logEntry = null
        const inspector = await logInspector(driver)
        await inspector.onJavascriptLog(function (log) {
          logEntry = log
          assert.equal(logEntry.text, 'Error: Not working')
          assert.equal(logEntry.type, 'javascript')
          assert.equal(logEntry.level, 'error')
        }, filterBy.FilterBy.logLevel('error'))

        await driver.get(Pages.logEntryAdded)
        await driver.findElement({ id: 'jsException' }).click()

        await inspector.close()
      })

      it('can filter javascript log', async function () {
        let logEntry = null
        const inspector = await logInspector(driver)
        await inspector.onJavascriptLog(function (log) {
          logEntry = log
          assert.notEqual(logEntry, null)
        }, filterBy.FilterBy.logLevel('error'))

        await driver.get(Pages.logEntryAdded)
        await driver.findElement({ id: 'jsException' }).click()

        await inspector.close()
      })

      it('can call multiple callbacks for javascript log', async function () {
        let logEntry1 = null
        let logEntry2 = null
        let logEntry3 = null
        let logEntry4 = null
        const inspector = await logInspector(driver)
        await inspector.onJavascriptLog(function (log) {
          logEntry1 = log
        })

        await inspector.onJavascriptLog(function (log) {
          logEntry2 = log
        })

        await inspector.onJavascriptLog(function (log) {
          logEntry3 = log
        }, filterBy.FilterBy.logLevel('error'))

        await inspector.onJavascriptLog(function (log) {
          logEntry4 = log
        }, filterBy.FilterBy.logLevel('info'))

        await driver.get(Pages.logEntryAdded)
        await driver.findElement({ id: 'jsException' }).click()

        await delay(3000)

        assert.notEqual(logEntry1, null)
        assert.notEqual(logEntry2, null)
        assert.notEqual(logEntry3, null)
        assert.equal(logEntry4, null)

        await inspector.close()
      })

      it('can listen to javascript error log', async function () {
        let logEntry = null
        const inspector = await logInspector(driver)
        await inspector.onJavascriptException(function (log) {
          logEntry = log
          assert.equal(logEntry.text, 'Error: Not working')
          assert.notEqual(log.source.realmId, null)
          assert.notEqual(log.source.browsingContextId, null)
          assert.equal(logEntry.type, 'javascript')
          assert.equal(logEntry.level, 'error')
        })

        await driver.get(Pages.logEntryAdded)
        await driver.findElement({ id: 'jsException' }).click()

        await inspector.close()
      })

      it('can retrieve stack trace for a log', async function () {
        let logEntry = null
        const inspector = await logInspector(driver)
        await inspector.onJavascriptException(function (log) {
          logEntry = log
          const stackTrace = logEntry.stackTrace
          assert.notEqual(stackTrace, null)
          assert.equal(stackTrace.callFrames.length > 0, true)
        })

        await driver.get(Pages.logEntryAdded)
        await driver.findElement({ id: 'jsException' }).click()

        await inspector.close()
      })

      it('can listen to any log', async function () {
        let logEntry = null
        const inspector = await logInspector(driver)
        await inspector.onLog(function (log) {
          logEntry = log
          assert.equal(logEntry.text, 'Hello, world!')
          assert.notEqual(log.source.realmId, null)
          assert.notEqual(log.source.browsingContextId, null)
          assert.equal(logEntry.type, 'console')
          assert.equal(logEntry.level, 'info')
          assert.equal(logEntry.method, 'log')
          assert.equal(logEntry.args.length, 1)
        })

        await driver.get(Pages.logEntryAdded)
        await driver.findElement({ id: 'consoleLog' }).click()

        await inspector.close()
      })

      it('can filter any log', async function () {
        let logEntry = null
        const inspector = await logInspector(driver)
        await inspector.onLog(function (log) {
          logEntry = log
          assert.equal(logEntry.text, 'Hello, world!')
          assert.notEqual(log.source.realmId, null)
          assert.notEqual(log.source.browsingContextId, null)
          assert.equal(logEntry.type, 'console')
          assert.equal(logEntry.level, 'info')
          assert.equal(logEntry.method, 'log')
          assert.equal(logEntry.args.length, 1)
        }, filterBy.FilterBy.logLevel('info'))

        await driver.get(Pages.logEntryAdded)
        await driver.findElement({ id: 'consoleLog' }).click()

        await inspector.close()
      })

      it('can filter any log at error level', async function () {
        let logEntry = null
        const inspector = await logInspector(driver)
        await inspector.onLog(function (log) {
          logEntry = log
          assert.equal(logEntry.text, 'Error: Not working')
          assert.equal(logEntry.type, 'javascript')
          assert.equal(logEntry.level, 'error')
        }, filterBy.FilterBy.logLevel('error'))

        await driver.get(Pages.logEntryAdded)
        await driver.findElement({ id: 'jsException' }).click()

        await inspector.close()
      })

      it('can call multiple callbacks for any log', async function () {
        let logEntry1 = null
        let logEntry2 = null
        let logEntry3 = null
        let logEntry4 = null
        const inspector = await logInspector(driver)
        await inspector.onLog(function (log) {
          logEntry1 = log
        })

        await inspector.onLog(function (log) {
          logEntry2 = log
        })

        await inspector.onLog(function (log) {
          logEntry3 = log
        }, filterBy.FilterBy.logLevel('error'))

        await inspector.onLog(function (log) {
          logEntry4 = log
        }, filterBy.FilterBy.logLevel('info'))

        await driver.get(Pages.logEntryAdded)
        await driver.findElement({ id: 'jsException' }).click()

        await delay(3000)

        assert.notEqual(logEntry1, null)
        assert.notEqual(logEntry2, null)
        assert.notEqual(logEntry3, null)
        assert.equal(logEntry4, null)

        await inspector.close()
      })

      it('can call multiple callbacks for any log with filter', async function () {
        let logEntry1 = null
        let logEntry2 = null
        const inspector = await logInspector(driver)
        await inspector.onLog(function (log) {
          logEntry1 = log
        }, filterBy.FilterBy.logLevel('error'))

        await inspector.onLog(function (log) {
          logEntry2 = log
        }, filterBy.FilterBy.logLevel('error'))

        await driver.get(Pages.logEntryAdded)
        await driver.findElement({ id: 'jsException' }).click()

        await delay(3000)

        assert.notEqual(logEntry1, null)
        assert.notEqual(logEntry2, null)

        await inspector.close()
      })
    })
  },
  { browsers: [Browser.FIREFOX, Browser.CHROME, Browser.EDGE] },
)
