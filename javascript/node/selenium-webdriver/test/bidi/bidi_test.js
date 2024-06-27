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
const BrowsingContext = require('selenium-webdriver/bidi/browsingContext')
const until = require('selenium-webdriver/lib/until')

suite(
  function (env) {
    let driver
    let inspector

    beforeEach(async function () {
      driver = await env.builder().build()
      inspector = await logInspector(driver)
    })

    afterEach(async function () {
      await inspector.close()
      await driver.quit()
    })

    describe('Integration Tests', function () {
      it('can navigate and listen to errors', async function () {
        let logEntry = null

        await inspector.onJavascriptException(function (log) {
          logEntry = log
        })

        const id = await driver.getWindowHandle()
        const browsingContext = await BrowsingContext(driver, {
          browsingContextId: id,
        })
        const info = await browsingContext.navigate(Pages.logEntryAdded)

        assert.notEqual(browsingContext.id, null)
        assert.notEqual(info.navigationId, null)
        assert(info.url.includes('/bidi/logEntryAdded.html'))

        await driver.wait(until.urlIs(Pages.logEntryAdded))
        await driver.findElement({ id: 'jsException' }).click()

        assert.equal(logEntry.text, 'Error: Not working')
        assert.equal(logEntry.type, 'javascript')
        assert.equal(logEntry.level, 'error')

        await browsingContext.close()
      })
    })
  },
  { browsers: [Browser.FIREFOX] },
)
