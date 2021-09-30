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
const test = require('../lib/test')
const { Browser, logging } = require('..')

test.suite(function (env) {
  // Logging API is not supported in IE.
  // Logging API not supported in Marionette.
  // Logging API not supported in Safari.
  test
    .ignore(
      env.browsers(
        Browser.INTERNET_EXPLORER,
        Browser.SAFARI,
        Browser.FIREFOX,
        Browser.CHROME
      )
    )
    .describe('logging', function () {
      var driver

      beforeEach(function () {
        driver = null
      })

      afterEach(async function () {
        if (driver) {
          return driver.quit()
        }
      })

      it('can be disabled', async function () {
        var prefs = new logging.Preferences()
        prefs.setLevel(logging.Type.BROWSER, logging.Level.OFF)

        driver = await env.builder().setLoggingPrefs(prefs).build()

        await driver.get(
          dataUrl(
            '<!DOCTYPE html><script>',
            'console.info("hello");',
            'console.warn("this is a warning");',
            'console.error("and this is an error");',
            '</script>'
          )
        )
        return driver
          .manage()
          .logs()
          .get(logging.Type.BROWSER)
          .then((entries) => assert.strictEqual(entries.length, 0))
      })

      // Firefox does not capture JS error console log messages.
      test
        .ignore(env.browsers(Browser.FIREFOX, 'legacy-firefox'))
        .it('can be turned down', async function () {
          var prefs = new logging.Preferences()
          prefs.setLevel(logging.Type.BROWSER, logging.Level.SEVERE)

          driver = await env.builder().setLoggingPrefs(prefs).build()

          await driver.get(
            dataUrl(
              '<!DOCTYPE html><script>',
              'console.info("hello");',
              'console.warn("this is a warning");',
              'console.error("and this is an error");',
              '</script>'
            )
          )
          return driver
            .manage()
            .logs()
            .get(logging.Type.BROWSER)
            .then(function (entries) {
              assert.strictEqual(entries.length, 1)
              assert.strictEqual(entries[0].level.name, 'SEVERE')
              // eslint-disable-next-line no-useless-escape
              assert.ok(/.*\"?and this is an error\"?/.test(entries[0].message))
            })
        })

      // Firefox does not capture JS error console log messages.
      test
        .ignore(env.browsers(Browser.FIREFOX, 'legacy-firefox'))
        .it('can be made verbose', async function () {
          var prefs = new logging.Preferences()
          prefs.setLevel(logging.Type.BROWSER, logging.Level.DEBUG)

          driver = await env.builder().setLoggingPrefs(prefs).build()

          await driver.get(
            dataUrl(
              '<!DOCTYPE html><script>',
              'console.debug("hello");',
              'console.warn("this is a warning");',
              'console.error("and this is an error");',
              '</script>'
            )
          )
          return driver
            .manage()
            .logs()
            .get(logging.Type.BROWSER)
            .then(function (entries) {
              assert.strictEqual(entries.length, 3)
              assert.strictEqual(entries[0].level.name, 'DEBUG')
              // eslint-disable-next-line no-useless-escape
              assert.ok(/.*\"?hello\"?/.test(entries[0].message))

              assert.strictEqual(entries[1].level.name, 'WARNING')
              // eslint-disable-next-line no-useless-escape
              assert.ok(/.*\"?this is a warning\"?/.test(entries[1].message))

              assert.strictEqual(entries[2].level.name, 'SEVERE')
              // eslint-disable-next-line no-useless-escape
              assert.ok(/.*\"?and this is an error\"?/.test(entries[2].message))
            })
        })

      // Firefox does not capture JS error console log messages.
      test
        .ignore(env.browsers(Browser.FIREFOX, 'legacy-firefox'))
        .it('clears records after retrieval', async function () {
          var prefs = new logging.Preferences()
          prefs.setLevel(logging.Type.BROWSER, logging.Level.DEBUG)

          driver = await env.builder().setLoggingPrefs(prefs).build()

          await driver.get(
            dataUrl(
              '<!DOCTYPE html><script>',
              'console.debug("hello");',
              'console.warn("this is a warning");',
              'console.error("and this is an error");',
              '</script>'
            )
          )
          await driver
            .manage()
            .logs()
            .get(logging.Type.BROWSER)
            .then((entries) => assert.strictEqual(entries.length, 3))
          return driver
            .manage()
            .logs()
            .get(logging.Type.BROWSER)
            .then((entries) => assert.strictEqual(entries.length, 0))
        })

      it('does not mix log types', async function () {
        var prefs = new logging.Preferences()
        prefs.setLevel(logging.Type.BROWSER, logging.Level.DEBUG)
        prefs.setLevel(logging.Type.DRIVER, logging.Level.SEVERE)

        driver = await env.builder().setLoggingPrefs(prefs).build()

        await driver.get(
          dataUrl(
            '<!DOCTYPE html><script>',
            'console.debug("hello");',
            'console.warn("this is a warning");',
            'console.error("and this is an error");',
            '</script>'
          )
        )
        return driver
          .manage()
          .logs()
          .get(logging.Type.DRIVER)
          .then((entries) => assert.strictEqual(entries.length, 0))
      })
    })

  function dataUrl(...args) {
    return 'data:text/html,' + args.join('')
  }
})
