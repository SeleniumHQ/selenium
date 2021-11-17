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

const chrome = require('../chrome')
const edge = require('../edge')
const error = require('../lib/error')
const firefox = require('../firefox')
const ie = require('../ie')
const safari = require('../safari')
const test = require('../lib/test')
const { Browser } = require('../lib/capabilities')
const { Pages } = require('../lib/test')
const { Builder, Capabilities } = require('..')

test.suite(function (env) {
  const BROWSER_MAP = new Map([
    [Browser.CHROME, chrome.Driver],
    [Browser.EDGE, edge.Driver],
    [Browser.FIREFOX, firefox.Driver],
    [Browser.INTERNET_EXPLORER, ie.Driver],
    [Browser.SAFARI, safari.Driver],
  ])

  if (BROWSER_MAP.has(env.browser.name)) {
    describe('builder creates thenable driver instances', function () {
      let driver

      after(() => driver && driver.quit())

      it(env.browser.name, function () {
        driver = env.builder().build()

        const want = BROWSER_MAP.get(env.browser.name)
        assert.ok(
          driver instanceof want,
          `want ${want.name}, but got ${driver.name}`
        )
        assert.strictEqual(typeof driver.then, 'function')

        return (
          driver
            .then((d) =>
              assert.ok(
                d instanceof want,
                `want ${want.name}, but got ${d.name}`
              )
            )
            // Load something so the safari driver doesn't crash from starting and
            // stopping in short time.
            .then(() => driver.get(Pages.echoPage))
        )
      })
    })
  }

  if (BROWSER_MAP.has(env.browser.name)) {
    describe('builder allows to set a single capability', function () {
      let driver

      after(() => driver && driver.quit())

      it(env.browser.name, async function () {
        let timeouts = { implicit: 0, pageLoad: 1000, script: 1000 }
        driver = new Builder()
          .setCapability('timeouts', timeouts)
          .forBrowser(env.browser.name)
          .build()

        let caps = await getCaps(driver)
        assert.deepEqual(caps.get('timeouts'), timeouts)
      })
    })
  }

  async function getCaps(driver) {
    return driver.getCapabilities()
  }

  describe('Builder', function () {
    describe('catches incorrect use of browser options class', function () {
      function test(key, options) {
        it(key, async function () {
          let builder = new Builder().withCapabilities(
            new Capabilities()
              .set('browserName', 'fake-browser-should-not-try-to-start')
              .set(key, new options())
          )
          try {
            let driver = await builder.build()
            await driver.quit()
            return Promise.reject(Error('should have failed'))
          } catch (ex) {
            if (!(ex instanceof error.InvalidArgumentError)) {
              throw ex
            }
          }
        })
      }

      test('chromeOptions', chrome.Options)
      test('moz:firefoxOptions', firefox.Options)
      test('safari.options', safari.Options)
    })
  })
})
