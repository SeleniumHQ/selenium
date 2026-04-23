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
const path = require('node:path')
const firefox = require('selenium-webdriver/firefox')
const io = require('selenium-webdriver/io')
const { Browser } = require('selenium-webdriver/index')
const { Pages, suite } = require('../../lib/test')
const { locate } = require('../../lib/test/resources')
const { until, By } = require('selenium-webdriver/index')

const EXT_XPI = locate('common/extensions/webextensions-selenium-example.xpi')

suite(
  function (env) {
    describe('firefox', function () {
      let driver

      beforeEach(function () {
        driver = null
      })

      afterEach(function () {
        return driver && driver.quit()
      })

      describe('Options', function () {
        let profileWithUserPrefs

        before(async function createProfileWithUserPrefs() {
          profileWithUserPrefs = await io.tmpDir()
          await io.write(
            path.join(profileWithUserPrefs, 'user.js'),
            'user_pref("general.useragent.override", "foo;bar");\n',
          )
        })

        describe('setProfile', function () {
          it('use profile with custom prefs', async function () {
            let options = env.builder().getFirefoxOptions() || new firefox.Options()
            options.setProfile(profileWithUserPrefs)

            driver = env.builder().setFirefoxOptions(options).build()

            await driver.get(Pages.echoPage)
            await verifyUserAgentWasChanged()
          })
        })

        describe('set mobile options', function () {
          it('allows setting android activity', function () {
            let options = new firefox.Options().enableMobile()
            let firefoxOptions = options.firefoxOptions_()
            assert.deepStrictEqual(
              {
                androidPackage: 'org.mozilla.firefox',
                prefs: { 'remote.active-protocols': 1 },
              },
              firefoxOptions,
            )
          })
        })

        describe('setPreference', function () {
          it('throws if key is not a string', function () {
            let options = new firefox.Options()
            assert.throws(() => options.setPreference(1, 2), TypeError)
            options.setPreference('1', 2) // OK if no throw.
          })

          it('throws if value is an invalid type', function () {
            let options = new firefox.Options()
            options.setPreference('a', 1)
            options.setPreference('b', '2')
            options.setPreference('c', true)

            assert.throws(() => options.setPreference('d', null), TypeError)
            assert.throws(() => options.setPreference('d', undefined), TypeError)
            assert.throws(() => options.setPreference('d', {}), TypeError)
          })

          it('can start Firefox with custom preferences', async function () {
            let options = env.builder().getFirefoxOptions() || new firefox.Options()
            options.setPreference('general.useragent.override', 'foo;bar')

            driver = env.builder().setFirefoxOptions(options).build()

            await driver.get(Pages.echoPage)
            await verifyUserAgentWasChanged()
          })

          it('can add extra prefs on top of an existing profile', async function () {
            let options = env.builder().getFirefoxOptions() || new firefox.Options()
            options.setPreference('general.useragent.override', 'baz;qux')
            options.setProfile(profileWithUserPrefs)

            driver = env.builder().setFirefoxOptions(options).build()

            await driver.get(Pages.echoPage)
            await verifyUserAgent('baz;qux')
          })
        })

        describe('addExtensions', function () {
          it('can add extension to brand new profile', async function () {
            let options = env.builder().getFirefoxOptions() || new firefox.Options()
            options.addExtensions(EXT_XPI)

            driver = env.builder().setFirefoxOptions(options).build()

            await driver.get(Pages.echoPage)
            await verifyWebExtensionWasInstalled()
          })

          it('can add extension to custom profile', async function () {
            let options = env.builder().getFirefoxOptions() || new firefox.Options()
            options.addExtensions(EXT_XPI).setProfile(profileWithUserPrefs)

            driver = env.builder().setFirefoxOptions(options).build()

            await driver.get(Pages.echoPage)
            await verifyWebExtensionWasInstalled()
            await verifyUserAgentWasChanged()
          })

          it('can addExtensions and setPreference', async function () {
            let options = env.builder().getFirefoxOptions() || new firefox.Options()
            options.addExtensions(EXT_XPI)
            options.setPreference('general.useragent.override', 'foo;bar')

            driver = env.builder().setFirefoxOptions(options).build()

            await driver.get(Pages.echoPage)
            await verifyWebExtensionWasInstalled()
            await verifyUserAgentWasChanged()
          })

          it('can load .zip webextensions', async function () {
            let options = env.builder().getFirefoxOptions() || new firefox.Options()
            options.addExtensions(EXT_XPI)

            driver = env.builder().setFirefoxOptions(options).build()

            await driver.get(Pages.echoPage)
            await verifyWebExtensionWasInstalled()
          })
        })
      })

      async function verifyUserAgentWasChanged() {
        await verifyUserAgent('foo;bar')
      }

      async function verifyUserAgent(expected) {
        let userAgent = await driver.executeScript('return window.navigator.userAgent')
        assert.strictEqual(userAgent, expected)
      }

      async function verifyWebExtensionWasInstalled() {
        let footer = await driver.wait(until.elementLocated(By.id('webextensions-selenium-example')), 5000)

        let text = await footer.getText()
        assert.strictEqual(text, 'Content injected by webextensions-selenium-example')
      }
    })
  },
  { browsers: [Browser.FIREFOX] },
)
