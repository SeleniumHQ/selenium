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
const until = require('selenium-webdriver/lib/until')
const { By } = require('selenium-webdriver')

suite(
  function (env) {
    let driver

    beforeEach(async function () {
      driver = await env.builder().build()
    })

    afterEach(async function () {
      await driver.quit()
    })

    describe('script()', function () {
      it('can add authentication handler', async function () {
        await driver.network().addAuthenticationHandler('genie', 'bottle')
        await driver.get(Pages.basicAuth)

        await driver.wait(until.elementLocated(By.css('pre')))
        let source = await driver.getPageSource()
        assert.equal(source.includes('Access granted'), true)
      })

      it('can remove authentication handler', async function () {
        const id = await driver.network().addAuthenticationHandler('genie', 'bottle')

        await driver.network().removeAuthenticationHandler(id)

        try {
          await driver.get(Pages.basicAuth)
          await driver.wait(until.elementLocated(By.css('pre')))
          assert.fail('Page should not be loaded')
        } catch (e) {
          assert.strictEqual(e.name, 'UnexpectedAlertOpenError')
        }
      })

      it('can clear authentication handlers', async function () {
        await driver.network().addAuthenticationHandler('genie', 'bottle')

        await driver.network().addAuthenticationHandler('bottle', 'genie')

        await driver.network().clearAuthenticationHandlers()

        try {
          await driver.get(Pages.basicAuth)
          await driver.wait(until.elementLocated(By.css('pre')))
          assert.fail('Page should not be loaded')
        } catch (e) {
          assert.strictEqual(e.name, 'UnexpectedAlertOpenError')
        }
      })
    })
  },
  { browsers: [Browser.FIREFOX] },
)
