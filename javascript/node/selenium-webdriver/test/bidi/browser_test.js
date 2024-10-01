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
const { suite } = require('../../lib/test')
const { Browser } = require('selenium-webdriver')
const BrowserBiDi = require('selenium-webdriver/bidi/browser')

suite(
  function (env) {
    describe('BiDi Browser', function () {
      let driver

      beforeEach(async function () {
        driver = await env.builder().build()
      })

      afterEach(function () {
        return driver.quit()
      })

      it('can create a user context', async function () {
        const browser = await BrowserBiDi(driver)

        const userContext = await browser.createUserContext()

        assert.notEqual(userContext, null)

        await browser.removeUserContext(userContext)
      })

      it('can get user contexts', async function () {
        const browser = await BrowserBiDi(driver)

        const userContext1 = await browser.createUserContext()
        const userContext2 = await browser.createUserContext()

        const userContexts = await browser.getUserContexts()

        assert.strictEqual(userContexts.length >= 2, true)

        await browser.removeUserContext(userContext1)
        await browser.removeUserContext(userContext2)
      })

      it('can remove user context', async function () {
        const browser = await BrowserBiDi(driver)

        const userContext1 = await browser.createUserContext()
        const userContext2 = await browser.createUserContext()

        const userContexts = await browser.getUserContexts()

        assert.strictEqual(userContexts.length >= 2, true)

        await browser.removeUserContext(userContext2)

        const updatedUserContexts = await browser.getUserContexts()

        assert.strictEqual(updatedUserContexts.includes(userContext1), true)
        assert.strictEqual(updatedUserContexts.includes(userContext2), false)

        await browser.removeUserContext(userContext1)
      })
    })
  },
  { browsers: [Browser.FIREFOX, Browser.CHROME, Browser.EDGE] },
)
