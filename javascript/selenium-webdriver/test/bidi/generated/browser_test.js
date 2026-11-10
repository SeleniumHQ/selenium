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
const { suite } = require('../../../lib/test')
const { Browser } = require('selenium-webdriver')

// Generated Browser domain class — produced by generate_bidi.mjs from the
// WebDriver BiDi CDDL spec. This test exercises the generated API to verify
// that the auto-generated code works correctly against a real browser.
const { Browser: GeneratedBrowser } = require('selenium-webdriver/bidi/generated/browser')

suite(
  function (env) {
    let driver

    beforeEach(async function () {
      driver = await env.builder().build()
    })

    afterEach(function () {
      return driver.quit()
    })

    describe('Generated BiDi Browser domain', function () {
      // The generated Browser class uses a static factory method Browser.create(driver)
      // instead of the hand-written getBrowserInstance(driver) helper function.

      it('can create a user context', async function () {
        const browser = await GeneratedBrowser.create(driver)

        // createUserContext({}) returns BrowserCreateUserContextResult = { userContext: string }
        // All params fields are optional per the spec so an empty object is valid.
        const result = await browser.createUserContext({})

        assert.notEqual(result.userContext, null)
        assert.strictEqual(typeof result.userContext, 'string')

        await browser.removeUserContext({ userContext: result.userContext })
      })

      it('can get user contexts', async function () {
        const browser = await GeneratedBrowser.create(driver)

        const result1 = await browser.createUserContext({})
        const result2 = await browser.createUserContext({})

        // getUserContexts() returns BrowserGetUserContextsResult = { userContexts: BrowserUserContextInfo[] }
        // Each BrowserUserContextInfo has a { userContext: string } field.
        const { userContexts } = await browser.getUserContexts()

        assert.strictEqual(userContexts.length >= 2, true)

        const ids = userContexts.map((ctx) => ctx.userContext)
        assert.ok(ids.includes(result1.userContext))
        assert.ok(ids.includes(result2.userContext))

        await browser.removeUserContext({ userContext: result1.userContext })
        await browser.removeUserContext({ userContext: result2.userContext })
      })

      it('can remove a user context', async function () {
        const browser = await GeneratedBrowser.create(driver)

        const result1 = await browser.createUserContext({})
        const result2 = await browser.createUserContext({})

        const before = await browser.getUserContexts()
        const beforeIds = before.userContexts.map((ctx) => ctx.userContext)
        assert.ok(beforeIds.includes(result1.userContext))
        assert.ok(beforeIds.includes(result2.userContext))

        // removeUserContext takes { userContext: string } — an object, not a bare string
        await browser.removeUserContext({ userContext: result2.userContext })

        const after = await browser.getUserContexts()
        const afterIds = after.userContexts.map((ctx) => ctx.userContext)
        assert.ok(afterIds.includes(result1.userContext))
        assert.ok(!afterIds.includes(result2.userContext))

        await browser.removeUserContext({ userContext: result1.userContext })
      })

      it('can get client windows', async function () {
        const browser = await GeneratedBrowser.create(driver)

        // getClientWindows() returns BrowserGetClientWindowsResult = { clientWindows: BrowserClientWindowInfo[] }
        const { clientWindows } = await browser.getClientWindows()

        assert.ok(Array.isArray(clientWindows))
        assert.ok(clientWindows.length > 0)

        const window = clientWindows[0]
        assert.strictEqual(typeof window.clientWindow, 'string')
        assert.ok(['fullscreen', 'maximized', 'minimized', 'normal'].includes(window.state))
        assert.ok(Number.isInteger(window.width) && window.width > 0)
        assert.ok(Number.isInteger(window.height) && window.height > 0)
        assert.ok(Number.isInteger(window.x))
        assert.ok(Number.isInteger(window.y))
        assert.strictEqual(typeof window.active, 'boolean')
      })
    })
  },
  { browsers: [Browser.CHROME, Browser.FIREFOX] },
)
