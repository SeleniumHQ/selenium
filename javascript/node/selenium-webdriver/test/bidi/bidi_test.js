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
const path = require('path')
const error = require('../../lib/error')
const firefox = require('../../firefox')
const io = require('../../io')
const { Browser } = require('../../')
const { Context } = require('../../firefox')
const { Pages, suite } = require('../../lib/test')
// const { locate } = require('../../lib/test/resources')
const logInspector = require('../../bidi/logInspector')
// const fileServer = require('../../lib/test/fileserver')

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
      //   console.log("sleeping")
      //   await driver.sleep(2)
    })

    // describe('Session', function () {
    //   it('can create bidi session', async function () {
    //     const bidi = await driver.getBidi()
    //     const status = await bidi.status
    //     console.log('status =', status)

    //     assert('ready' in status['result'])
    //     assert.notEqual(status['result']['message'], null)
    //   })
    // })

    // eslint-disable-next-line no-only-tests/no-only-tests
    describe('Log Inspector', function () {
      it('can create bidi session', async function () {
        const bidi = await driver.getBidi()
        const status = await bidi.status
        console.log('status =', status)

        assert('ready' in status['result'])
        assert.notEqual(status['result']['message'], null)
      })

      // eslint-disable-next-line no-only-tests/no-only-tests
      it('can listen to javascript error log', async function () {
        let logEntry = null
        const inspector = await logInspector(driver)
        await inspector.onJavascriptException(function (log) {
          logEntry = log
        })

        await driver.get(Pages.logEntryAdded)
        let element = driver.findElement({ id: 'jsException' })
        await element.click()

        await driver.sleep(1500)

        // console.log('log = ', logEntry)

        assert.equal(logEntry.text, 'Error: Not working')
        assert.equal(logEntry.type, 'javascript')
        assert.equal(logEntry.level, 'error')
      })

      it('can listen to console log', async function () {
        let logEntry = null
        const inspector = await logInspector(driver)
        await inspector.onConsoleLog(function (log) {
          logEntry = log
        })

        await driver.get(Pages.logEntryAdded)
        let element = driver.findElement({ id: 'consoleLog' })
        await element.click()
        await driver.sleep(500)

        // console.log('log = ', logEntry)

        assert.equal(logEntry.text, 'Hello, world!')
        assert.equal(logEntry.realm, null)
        assert.equal(logEntry.type, 'console')
        assert.equal(logEntry.level, 'info')
        assert.equal(logEntry.method, 'log')
        assert.equal(logEntry.stack_trace, null)
        assert.equal(logEntry.args.length, 1)
      })
    })
  },
  { browsers: [Browser.FIREFOX] }
)
