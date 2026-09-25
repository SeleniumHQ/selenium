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
const fs = require('node:fs')
const firefox = require('selenium-webdriver/firefox')
const { Browser } = require('selenium-webdriver/index')
const { ignore, Pages, suite } = require('../../lib/test')
const { locate } = require('../../lib/test/resources')
const { until, By } = require('selenium-webdriver/index')

const EXT_XPI = locate('common/extensions/webextensions-selenium-example.xpi')
const EXT_UNSIGNED_ZIP = locate('common/extensions/webextensions-selenium-example-unsigned.zip')
const EXT_SIGNED_ZIP = locate('common/extensions/webextensions-selenium-example.zip')
const EXT_UNSIGNED_DIR = locate('common/extensions/webextensions-selenium-example')
const EXT_SIGNED_DIR = locate('common/extensions/webextensions-selenium-example')
const EXT_ID = 'webextensions-selenium-example-v3@example.com'

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

      describe('installAddon', function () {
        beforeEach(function () {
          driver = env.builder().build()
        })

        it('installs and uninstalls by xpi file', async function () {
          await driver.get(Pages.blankPage)
          await verifyWebExtensionNotInstalled()

          let id = await driver.installAddon(EXT_XPI)

          await driver.navigate().refresh()
          await verifyWebExtensionWasInstalled()

          await driver.uninstallAddon(id)
          await driver.navigate().refresh()
          await verifyWebExtensionNotInstalled()
        })

        // Temporarily installed unsigned extensions no longer inject content scripts
        // https://bugzilla.mozilla.org/show_bug.cgi?id=2045054
        ignore(env.browsers(Browser.FIREFOX)).it('installs and uninstalls by unsigned zip file', async function () {
          await driver.get(Pages.blankPage)
          await verifyWebExtensionNotInstalled()

          let id = await driver.installAddon(EXT_UNSIGNED_ZIP, true)

          await driver.navigate().refresh()
          await verifyWebExtensionWasInstalled()

          await driver.uninstallAddon(id)
          await driver.navigate().refresh()
          await verifyWebExtensionNotInstalled()
        })

        it('installs and uninstalls by signed zip file', async function () {
          await driver.get(Pages.blankPage)
          await verifyWebExtensionNotInstalled()

          let id = await driver.installAddon(EXT_SIGNED_ZIP)

          await driver.navigate().refresh()
          await verifyWebExtensionWasInstalled()

          await driver.uninstallAddon(id)
          await driver.navigate().refresh()
          await verifyWebExtensionNotInstalled()
        })

        // Temporarily installed unsigned extensions no longer inject content scripts
        // https://bugzilla.mozilla.org/show_bug.cgi?id=2045054
        ignore(env.browsers(Browser.FIREFOX)).it('installs and uninstalls by unsigned directory', async function () {
          await driver.get(Pages.blankPage)
          await verifyWebExtensionNotInstalled()

          let id = await driver.installAddon(EXT_UNSIGNED_DIR, true)

          await driver.navigate().refresh()
          await verifyWebExtensionWasInstalled()

          await driver.uninstallAddon(id)
          await driver.navigate().refresh()
          await verifyWebExtensionNotInstalled()
        })

        // Installs the unsigned directory temporarily, so hits the same bug
        // https://bugzilla.mozilla.org/show_bug.cgi?id=2045054
        ignore(env.browsers(Browser.FIREFOX)).it('installs and uninstalls by signed directory', async function () {
          await driver.get(Pages.blankPage)
          await verifyWebExtensionNotInstalled()

          let id = await driver.installAddon(EXT_SIGNED_DIR, true)

          await driver.navigate().refresh()
          await verifyWebExtensionWasInstalled()

          await driver.uninstallAddon(id)
          await driver.navigate().refresh()
          await verifyWebExtensionNotInstalled()
        })
      })

      // The test environment enables BiDi, so these exercise the moz webExtension.install command;
      // the classic fallback is covered by test/lib/web_extension_test.js.
      describe('installWebExtension', function () {
        it('installs and uninstalls an xpi file', async function () {
          driver = await env.builder().build()
          await driver.get(Pages.blankPage)
          await verifyWebExtensionNotInstalled()

          const extension = await driver.installWebExtension(EXT_XPI)
          assert.strictEqual(extension.id, EXT_ID)

          await driver.navigate().refresh()
          await verifyWebExtensionWasInstalled()

          await driver.uninstallWebExtension(extension)
          await driver.navigate().refresh()
          await verifyWebExtensionNotInstalled()
        })

        it('installs base64-encoded bytes', async function () {
          driver = await env.builder().build()
          await driver.get(Pages.blankPage)

          const extension = await driver.installWebExtension(fs.readFileSync(EXT_XPI).toString('base64'))
          assert.strictEqual(extension.id, EXT_ID)

          await driver.navigate().refresh()
          await verifyWebExtensionWasInstalled()
          await driver.uninstallWebExtension(extension)
        })

        // Temporarily installed unsigned extensions no longer inject content scripts
        // https://bugzilla.mozilla.org/show_bug.cgi?id=2045054
        ignore(env.browsers(Browser.FIREFOX)).it(
          'installs an unsigned directory when not permanent',
          async function () {
            driver = await env.builder().build()
            await driver.get(Pages.blankPage)

            const extension = await driver.installWebExtension(EXT_UNSIGNED_DIR, { permanent: false })
            assert.strictEqual(extension.id, EXT_ID)

            await driver.navigate().refresh()
            await verifyWebExtensionWasInstalled()
            await driver.uninstallWebExtension(extension)
          },
        )

        it('rejects a permanent install of a directory', async function () {
          driver = await env.builder().build()
          await assert.rejects(
            driver.installWebExtension(EXT_SIGNED_DIR, { permanent: true }),
            /Permanent installation of unpacked extensions is not supported/,
          )
        })

        describe('in a private window', function () {
          beforeEach(async function () {
            const options = env.builder().getFirefoxOptions() || new firefox.Options()
            options.addArguments('-private-window')
            driver = await env.builder().setFirefoxOptions(options).build()
          })

          it('runs when private browsing is allowed', async function () {
            await driver.installWebExtension(EXT_XPI, { allowPrivateBrowsing: true })
            await driver.get(Pages.blankPage)
            await verifyWebExtensionWasInstalled()
          })

          it('does not run by default', async function () {
            await driver.installWebExtension(EXT_XPI)
            await driver.get(Pages.blankPage)
            await verifyWebExtensionNotInstalled()
          })
        })
      })

      async function verifyWebExtensionNotInstalled() {
        let found = await driver.findElements({
          id: 'webextensions-selenium-example',
        })
        assert.strictEqual(found.length, 0)
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
