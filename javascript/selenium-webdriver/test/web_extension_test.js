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
const { Browser, By, until } = require('selenium-webdriver')
const { ignore, Pages, suite } = require('../lib/test')
const { locate } = require('../lib/test/resources')

// Signed, so Firefox also runs it from a directory; Chromium installs only unpacked directories.
const EXT_SIGNED_DIR = locate('common/extensions/webextensions-selenium-example-signed')

suite(
  function (env) {
    describe('WebDriver web extensions', function () {
      let driver

      beforeEach(async function () {
        driver = await env.builder().build()
      })

      afterEach(function () {
        return driver.quit()
      })

      // Firefox installs a directory only temporarily, and temporarily installed extensions no
      // longer inject content scripts: https://bugzilla.mozilla.org/show_bug.cgi?id=2045054
      ignore(env.browsers(Browser.FIREFOX)).it('installs an unpacked directory', async function () {
        const extension = await driver.installWebExtension(EXT_SIGNED_DIR)
        assert.ok(extension.id)

        await driver.get(Pages.blankPage)
        await verifyWebExtensionWasInstalled(driver)
      })

      ignore(env.browsers(Browser.FIREFOX)).it('uninstalls an installed extension', async function () {
        const extension = await driver.installWebExtension(EXT_SIGNED_DIR)
        await driver.get(Pages.blankPage)
        await verifyWebExtensionWasInstalled(driver)

        await driver.uninstallWebExtension(extension)
        await driver.navigate().refresh()
        assert.deepStrictEqual(await driver.findElements(By.id('webextensions-selenium-example')), [])
      })
    })
  },
  { browsers: [Browser.CHROME, Browser.EDGE, Browser.FIREFOX] },
)

async function verifyWebExtensionWasInstalled(driver) {
  const injected = await driver.wait(until.elementLocated(By.id('webextensions-selenium-example')), 5000)
  assert.strictEqual(await injected.getText(), 'Content injected by webextensions-selenium-example')
}
