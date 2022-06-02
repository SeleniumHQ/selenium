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
const error = require('../lib/error')
const firefox = require('../firefox')
const io = require('../io')
const { Browser } = require('../')
const { Context } = require('../firefox')
const { Pages, suite } = require('../lib/test')
const { locate } = require('../lib/test/resources')

const WEBEXTENSION_EXTENSION_XPI = locate(
  'common/extensions/webextensions-selenium-example.xpi'
)
const WEBEXTENSION_EXTENSION_ZIP = locate(
  'common/extensions/webextensions-selenium-example.zip'
)
const WEBEXTENSION_EXTENSION_DIR = locate(
  'common/extensions/webextensions-selenium-example'
)

const WEBEXTENSION_EXTENSION_ID =
  'webextensions-selenium-example@example.com.xpi'

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
        let profileWithWebExtension
        let profileWithUserPrefs

        before(async function createProfileWithWebExtension() {
          profileWithWebExtension = await io.tmpDir()
          let extensionsDir = path.join(profileWithWebExtension, 'extensions')
          await io.mkdir(extensionsDir)
          await io.write(
            path.join(extensionsDir, WEBEXTENSION_EXTENSION_ID),
            await io.read(WEBEXTENSION_EXTENSION_XPI)
          )
        })

        before(async function createProfileWithUserPrefs() {
          profileWithUserPrefs = await io.tmpDir()
          await io.write(
            path.join(profileWithUserPrefs, 'user.js'),
            'user_pref("general.useragent.override", "foo;bar");\n'
          )
        })

        describe('setProfile', function () {
          it('use profile with custom prefs', async function () {
            let options = new firefox.Options()
            options.setProfile(profileWithUserPrefs)

            driver = env.builder().setFirefoxOptions(options).build()

            await driver.get(Pages.echoPage)
            await verifyUserAgentWasChanged()
          })

          it('use profile with extension', async function () {
            let options = new firefox.Options()
            options.setProfile(profileWithWebExtension)

            driver = env.builder().setFirefoxOptions(options).build()

            await driver.get(Pages.echoPage)
            await verifyWebExtensionWasInstalled()
          })
        })

        describe('set mobile options', function () {
          it('allows setting android activity', function () {
            let options = new firefox.Options().enableMobile()
            let firefoxOptions = options.firefoxOptions_()
            assert.deepStrictEqual(
              { androidPackage: 'org.mozilla.firefox' },
              firefoxOptions
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
            assert.throws(
              () => options.setPreference('d', undefined),
              TypeError
            )
            assert.throws(() => options.setPreference('d', {}), TypeError)
          })

          it('can start Firefox with custom preferences', async function () {
            let options = new firefox.Options()
            options.setPreference('general.useragent.override', 'foo;bar')

            driver = env.builder().setFirefoxOptions(options).build()

            await driver.get(Pages.echoPage)
            await verifyUserAgentWasChanged()
          })

          it('can add extra prefs on top of an existing profile', async function () {
            let options = new firefox.Options()
              .setPreference('general.useragent.override', 'foo;bar')
              .setProfile(profileWithWebExtension)

            driver = env.builder().setFirefoxOptions(options).build()

            await driver.get(Pages.echoPage)
            await verifyWebExtensionWasInstalled()
            await verifyUserAgentWasChanged()
          })
        })

        describe('addExtensions', function () {
          it('can add extension to brand new profile', async function () {
            let options = new firefox.Options()
            options.addExtensions(WEBEXTENSION_EXTENSION_XPI)

            driver = env.builder().setFirefoxOptions(options).build()

            await driver.get(Pages.echoPage)
            await verifyWebExtensionWasInstalled()
          })

          it('can add extension to custom profile', async function () {
            let options = new firefox.Options()
              .addExtensions(WEBEXTENSION_EXTENSION_XPI)
              .setProfile(profileWithUserPrefs)

            driver = env.builder().setFirefoxOptions(options).build()

            await driver.get(Pages.echoPage)
            await verifyWebExtensionWasInstalled()
            await verifyUserAgentWasChanged()
          })

          it('can addExtensions and setPreference', async function () {
            let options = new firefox.Options()
              .addExtensions(WEBEXTENSION_EXTENSION_XPI)
              .setPreference('general.useragent.override', 'foo;bar')

            driver = env.builder().setFirefoxOptions(options).build()

            await driver.get(Pages.echoPage)
            await verifyWebExtensionWasInstalled()
            await verifyUserAgentWasChanged()
          })

          it('can load .zip webextensions', async function () {
            let options = new firefox.Options()
            options.addExtensions(WEBEXTENSION_EXTENSION_ZIP)

            driver = env.builder().setFirefoxOptions(options).build()

            await driver.get(Pages.echoPage)
            await verifyWebExtensionWasInstalled()
          })
        })
      })

      describe('context switching', function () {
        beforeEach(async function () {
          driver = await env.builder().build()
        })

        it('can get context', async function () {
          assert.strictEqual(await driver.getContext(), Context.CONTENT)
        })

        it('can set context', async function () {
          await driver.setContext(Context.CHROME)
          let ctxt = await driver.getContext()
          assert.strictEqual(ctxt, Context.CHROME)

          await driver.setContext(Context.CONTENT)
          ctxt = await driver.getContext()
          assert.strictEqual(ctxt, Context.CONTENT)
        })

        it('throws on unknown context', function () {
          return driver.setContext('foo').then(assert.fail, function (e) {
            assert(e instanceof error.InvalidArgumentError)
          })
        })
      })

      describe('installAddon', function () {
        beforeEach(function () {
          driver = env.builder().build()
        })

        it('addons can be installed and uninstalled at runtime', async function () {
          await driver.get(Pages.echoPage)
          await verifyWebExtensionNotInstalled()

          let id = await driver.installAddon(WEBEXTENSION_EXTENSION_XPI)
          await driver.sleep(1000) // Give extension time to install (yuck).

          await driver.get(Pages.echoPage)
          await verifyWebExtensionWasInstalled()

          await driver.uninstallAddon(id)
          await driver.get(Pages.echoPage)
          await verifyWebExtensionNotInstalled()
        })

        it('unpacked addons can be installed and uninstalled at runtime', async function () {
          await driver.get(Pages.echoPage)
          await verifyWebExtensionNotInstalled()

          let id = await driver.installAddon(WEBEXTENSION_EXTENSION_DIR, true)

          await driver.get(Pages.echoPage)
          await verifyWebExtensionWasInstalled()

          await driver.uninstallAddon(id)
          await driver.get(Pages.echoPage)
          await verifyWebExtensionNotInstalled()
        })
      })

      async function verifyUserAgentWasChanged() {
        let userAgent = await driver.executeScript(
          'return window.navigator.userAgent'
        )
        assert.strictEqual(userAgent, 'foo;bar')
      }

      async function verifyWebExtensionNotInstalled() {
        let found = await driver.findElements({
          id: 'webextensions-selenium-example',
        })
        assert.strictEqual(found.length, 0)
      }

      async function verifyWebExtensionWasInstalled() {
        let footer = await driver.findElement({
          id: 'webextensions-selenium-example',
        })
        let text = await footer.getText()
        assert.strictEqual(
          text,
          'Content injected by webextensions-selenium-example'
        )
      }
    })
  },
  { browsers: [Browser.FIREFOX] }
)
