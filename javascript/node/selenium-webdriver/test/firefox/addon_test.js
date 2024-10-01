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
const { Browser } = require('selenium-webdriver/index')
const { Pages, suite } = require('../../lib/test')
const { locate } = require('../../lib/test/resources')
const { until, By } = require('selenium-webdriver/index')

const EXT_XPI = locate('common/extensions/webextensions-selenium-example.xpi')
const EXT_UNSIGNED_ZIP = locate('common/extensions/webextensions-selenium-example-unsigned.zip')
const EXT_SIGNED_ZIP = locate('common/extensions/webextensions-selenium-example.zip')
const EXT_UNSIGNED_DIR = locate('common/extensions/webextensions-selenium-example')
const EXT_SIGNED_DIR = locate('common/extensions/webextensions-selenium-example')

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

        it('installs and uninstalls by unsigned zip file', async function () {
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

        it('installs and uninstalls by unsigned directory', async function () {
          await driver.get(Pages.blankPage)
          await verifyWebExtensionNotInstalled()

          let id = await driver.installAddon(EXT_UNSIGNED_DIR, true)

          await driver.navigate().refresh()
          await verifyWebExtensionWasInstalled()

          await driver.uninstallAddon(id)
          await driver.navigate().refresh()
          await verifyWebExtensionNotInstalled()
        })

        it('installs and uninstalls by signed directory', async function () {
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
