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
const chrome = require('selenium-webdriver/chrome')
const test = require('../../lib/test')
const { ignore } = require('../../lib/test')
const { Browser } = require('selenium-webdriver/index')

test.suite(
  function (env) {
    // Chrome unable to set "prompt" due to: https://bugs.chromium.org/p/chromedriver/issues/detail?id=4350
    describe('setPermission', () => {
      ignore(env.browsers(Browser.CHROME)).it('can set permission', async function () {
        const driver = await env.builder().build()

        await driver.get(test.Pages.clicksPage)

        await driver.setPermission('clipboard-read', 'prompt')
        assert.strictEqual(await checkPermission(driver, 'clipboard-read'), 'prompt')

        await driver.setPermission('clipboard-read', 'granted')
        assert.strictEqual(await checkPermission(driver, 'clipboard-read'), 'granted')

        await driver.quit()
      })

      ignore(env.browsers(Browser.CHROME)).it('can set permission in headless mode', async function () {
        const driver = await env.builder().setChromeOptions(new chrome.Options().addArguments('-headless')).build()

        await driver.get(test.Pages.clicksPage)

        await driver.setPermission('clipboard-read', 'prompt')
        assert.strictEqual(await checkPermission(driver, 'clipboard-read'), 'prompt')

        await driver.setPermission('clipboard-read', 'granted')
        assert.strictEqual(await checkPermission(driver, 'clipboard-read'), 'granted')

        await driver.quit()
      })
    })
  },
  { browsers: ['chrome'] },
)

const checkPermission = (driver, permission) => {
  return driver.executeAsyncScript((permission, callback) => {
    // eslint-disable-next-line
    navigator.permissions.query({ name: permission }).then((result) => callback(result.state))
  }, permission)
}
