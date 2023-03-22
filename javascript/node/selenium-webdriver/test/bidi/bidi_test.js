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

const assert = require('assert')
const firefox = require('../../firefox')
const { Browser } = require('../../')
const { Pages, suite } = require('../../lib/test')
const logInspector = require('../../bidi/logInspector')
const BrowsingContext = require('../../bidi/browsingContext')
const filterBy = require('../../bidi/filterBy')
const until = require('../../lib/until')

suite(
  function (env) {
    let driver

    beforeEach(async function () {
      driver = await env
        .builder()
        .setFirefoxOptions(new firefox.Options().enableBidi())
        .build()
    })

    afterEach(async function () {
      await driver.quit()
    })

    describe('Session', function () {
      it('can create bidi session', async function () {
        const bidi = await driver.getBidi()
        const status = await bidi.status

        assert('ready' in status['result'])
        assert.notEqual(status['result']['message'], null)
      })
    })

    describe('Log Inspector', function () {
      it('can listen to console log', async function () {
        let logEntry = null
        const inspector = await logInspector(driver)
        await inspector.onConsoleEntry(function (log) {
          logEntry = log
        })

        await driver.get(Pages.logEntryAdded)
        await driver.findElement({ id: 'consoleLog' }).click()

        assert.equal(logEntry.text, 'Hello, world!')
        assert.equal(logEntry.realm, null)
        assert.equal(logEntry.type, 'console')
        assert.equal(logEntry.level, 'info')
        assert.equal(logEntry.method, 'log')
        assert.equal(logEntry.stackTrace, null)
        assert.equal(logEntry.args.length, 1)

        await inspector.close()
      })

      it('can listen to console log with different consumers', async function () {
        let logEntry = null
        const inspector = await logInspector(driver)
        await inspector.onConsoleEntry(function (log) {
          logEntry = log
        })

        let logEntryText = null
        await inspector.onConsoleEntry(function (log) {
          logEntryText = log.text
        })

        await driver.get(Pages.logEntryAdded)
        await driver.findElement({ id: 'consoleLog' }).click()

        assert.equal(logEntry.text, 'Hello, world!')
        assert.equal(logEntry.realm, null)
        assert.equal(logEntry.type, 'console')
        assert.equal(logEntry.level, 'info')
        assert.equal(logEntry.method, 'log')
        assert.equal(logEntry.stackTrace, null)
        assert.equal(logEntry.args.length, 1)

        assert.equal(logEntryText, 'Hello, world!')

        await inspector.close()
      })

      it('can filter console info level log', async function () {
        let logEntry = null
        const inspector = await logInspector(driver)
        await inspector.onConsoleEntry(function (log) {
          logEntry = log
        }, filterBy.FilterBy.logLevel('info'))

        await driver.get(Pages.logEntryAdded)
        await driver.findElement({ id: 'consoleLog' }).click()

        assert.equal(logEntry.text, 'Hello, world!')
        assert.equal(logEntry.realm, null)
        assert.equal(logEntry.type, 'console')
        assert.equal(logEntry.level, 'info')
        assert.equal(logEntry.method, 'log')
        assert.equal(logEntry.stackTrace, null)
        assert.equal(logEntry.args.length, 1)

        await inspector.close()
      })

      it('can filter console log', async function () {
        let logEntry = null
        const inspector = await logInspector(driver)
        await inspector.onConsoleEntry(function (log) {
          logEntry = log
        }, filterBy.FilterBy.logLevel('error'))

        await driver.get(Pages.logEntryAdded)
        // Generating info level log but we are filtering by error level
        await driver.findElement({ id: 'consoleLog' }).click()

        assert.equal(logEntry, null)
        await inspector.close()
      })

      it('can listen to javascript log', async function () {
        let logEntry = null
        const inspector = await logInspector(driver)
        await inspector.onJavascriptLog(function (log) {
          logEntry = log
        })

        await driver.get(Pages.logEntryAdded)
        await driver.findElement({ id: 'jsException' }).click()

        assert.equal(logEntry.text, 'Error: Not working')
        assert.equal(logEntry.type, 'javascript')
        assert.equal(logEntry.level, 'error')

        await inspector.close()
      })

      it('can filter javascript log at error level', async function () {
        let logEntry = null
        const inspector = await logInspector(driver)
        await inspector.onJavascriptLog(function (log) {
          logEntry = log
        }, filterBy.FilterBy.logLevel('error'))

        await driver.get(Pages.logEntryAdded)
        await driver.findElement({ id: 'jsException' }).click()

        assert.equal(logEntry.text, 'Error: Not working')
        assert.equal(logEntry.type, 'javascript')
        assert.equal(logEntry.level, 'error')

        await inspector.close()
      })

      it('can filter javascript log', async function () {
        let logEntry = null
        const inspector = await logInspector(driver)
        await inspector.onJavascriptLog(function (log) {
          logEntry = log
        }, filterBy.FilterBy.logLevel('info'))

        await driver.get(Pages.logEntryAdded)
        await driver.findElement({ id: 'jsException' }).click()

        assert.equal(logEntry, null)

        await inspector.close()
      })

      it('can listen to javascript error log', async function () {
        let logEntry = null
        const inspector = await logInspector(driver)
        await inspector.onJavascriptException(function (log) {
          logEntry = log
        })

        await driver.get(Pages.logEntryAdded)
        await driver.findElement({ id: 'jsException' }).click()

        assert.equal(logEntry.text, 'Error: Not working')
        assert.equal(logEntry.type, 'javascript')
        assert.equal(logEntry.level, 'error')

        await inspector.close()
      })

      it('can retrieve stack trace for a log', async function () {
        let logEntry = null
        const inspector = await logInspector(driver)
        await inspector.onJavascriptException(function (log) {
          logEntry = log
        })

        await driver.get(Pages.logEntryAdded)
        await driver.findElement({ id: 'jsException' }).click()

        const stackTrace = logEntry.stackTrace
        assert.notEqual(stackTrace, null)
        assert.equal(stackTrace.callFrames.length, 3)

        await inspector.close()
      })

      it('can listen to any log', async function () {
        let logEntry = null
        const inspector = await logInspector(driver)
        await inspector.onLog(function (log) {
          logEntry = log
        })

        await driver.get(Pages.logEntryAdded)
        await driver.findElement({ id: 'consoleLog' }).click()

        assert.equal(logEntry.text, 'Hello, world!')
        assert.equal(logEntry.realm, null)
        assert.equal(logEntry.type, 'console')
        assert.equal(logEntry.level, 'info')
        assert.equal(logEntry.method, 'log')
        assert.equal(logEntry.stackTrace, null)
        assert.equal(logEntry.args.length, 1)

        await inspector.close()
      })

      it('can filter any log', async function () {
        let logEntry = null
        const inspector = await logInspector(driver)
        await inspector.onLog(function (log) {
          logEntry = log
        }, filterBy.FilterBy.logLevel('info'))

        await driver.get(Pages.logEntryAdded)
        await driver.findElement({ id: 'consoleLog' }).click()

        assert.equal(logEntry.text, 'Hello, world!')
        assert.equal(logEntry.realm, null)
        assert.equal(logEntry.type, 'console')
        assert.equal(logEntry.level, 'info')
        assert.equal(logEntry.method, 'log')
        assert.equal(logEntry.stackTrace, null)
        assert.equal(logEntry.args.length, 1)

        await inspector.close()
      })

      it('can filter any log at error level', async function () {
        let logEntry = null
        const inspector = await logInspector(driver)
        await inspector.onLog(function (log) {
          logEntry = log
        }, filterBy.FilterBy.logLevel('error'))

        await driver.get(Pages.logEntryAdded)
        await driver.findElement({ id: 'jsException' }).click()

        assert.equal(logEntry.text, 'Error: Not working')
        assert.equal(logEntry.type, 'javascript')
        assert.equal(logEntry.level, 'error')
        await inspector.close()
      })
    })

    describe('Browsing Context', function () {
      it('can create a browsing context for given id', async function () {
        const id = await driver.getWindowHandle()
        const browsingContext = await BrowsingContext(driver, {
          browsingContextId: id,
        })
        assert.equal(browsingContext.id, id)
      })

      it('can create a window', async function () {
        const browsingContext = await BrowsingContext(driver, {
          type: 'window',
        })
        assert.notEqual(browsingContext.id, null)
      })

      it('can create a window with a reference context', async function () {
        const browsingContext = await BrowsingContext(driver, {
          type: 'window',
          referenceContext: await driver.getWindowHandle(),
        })
        assert.notEqual(browsingContext.id, null)
      })

      it('can create a tab', async function () {
        const browsingContext = await BrowsingContext(driver, {
          type: 'tab',
        })
        assert.notEqual(browsingContext.id, null)
      })

      it('can create a tab with a reference context', async function () {
        const browsingContext = await BrowsingContext(driver, {
          type: 'tab',
          referenceContext: await driver.getWindowHandle(),
        })
        assert.notEqual(browsingContext.id, null)
      })

      it('can navigate to a url', async function () {
        const browsingContext = await BrowsingContext(driver, {
          type: 'tab',
        })

        let info = await browsingContext.navigate(Pages.logEntryAdded)

        assert.notEqual(browsingContext.id, null)
        assert.equal(info.navigationId, null)
        assert(info.url.includes('/bidi/logEntryAdded.html'))
      })

      it('can navigate to a url with readiness state', async function () {
        const browsingContext = await BrowsingContext(driver, {
          type: 'tab',
        })

        const info = await browsingContext.navigate(
          Pages.logEntryAdded,
          'complete'
        )

        assert.notEqual(browsingContext.id, null)
        assert.equal(info.navigationId, null)
        assert(info.url.includes('/bidi/logEntryAdded.html'))
      })

      it('can get tree with a child', async function () {
        const browsingContextId = await driver.getWindowHandle()
        const parentWindow = await BrowsingContext(driver, {
          browsingContextId: browsingContextId,
        })
        await parentWindow.navigate(Pages.iframePage, 'complete')

        const contextInfo = await parentWindow.getTree()
        assert.equal(contextInfo.children.length, 1)
        assert.equal(contextInfo.id, browsingContextId)
        assert(contextInfo.children[0]['url'].includes('formPage.html'))
      })

      it('can get tree with depth', async function () {
        const browsingContextId = await driver.getWindowHandle()
        const parentWindow = await BrowsingContext(driver, {
          browsingContextId: browsingContextId,
        })
        await parentWindow.navigate(Pages.iframePage, 'complete')

        const contextInfo = await parentWindow.getTree(0)
        assert.equal(contextInfo.children, null)
        assert.equal(contextInfo.id, browsingContextId)
      })

      it('can close a window', async function () {
        const window1 = await BrowsingContext(driver, { type: 'window' })
        const window2 = await BrowsingContext(driver, { type: 'window' })

        await window2.close()

        assert.doesNotThrow(async function () {
          await window1.getTree()
        })
        await assert.rejects(window2.getTree(), { message: 'no such frame' })
      })
    })

    describe('Integration Tests', function () {
      it('can navigate and listen to errors', async function () {
        let logEntry = null
        const inspector = await logInspector(driver)
        await inspector.onJavascriptException(function (log) {
          logEntry = log
        })

        const id = await driver.getWindowHandle()
        const browsingContext = await BrowsingContext(driver, {
          browsingContextId: id,
        })
        const info = await browsingContext.navigate(Pages.logEntryAdded)

        assert.notEqual(browsingContext.id, null)
        assert.equal(info.navigationId, null)
        assert(info.url.includes('/bidi/logEntryAdded.html'))

        await driver.wait(until.urlIs(Pages.logEntryAdded))
        await driver.findElement({ id: 'jsException' }).click()

        assert.equal(logEntry.text, 'Error: Not working')
        assert.equal(logEntry.type, 'javascript')
        assert.equal(logEntry.level, 'error')

        await inspector.close()
        await browsingContext.close()
      })
    })
  },
  { browsers: [Browser.FIREFOX] }
)
