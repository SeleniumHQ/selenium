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
const { Pages, suite } = require('../../lib/test')
const { Browser } = require('selenium-webdriver')
const BrowserBiDi = require('selenium-webdriver/bidi/browser')
const getScriptManager = require('selenium-webdriver/bidi/scriptManager')
const { getPermissionInstance, PermissionState } = require('selenium-webdriver/bidi/external/permissions')
const BrowsingContext = require('selenium-webdriver/bidi/browsingContext')
const { CreateContextParameters } = require('selenium-webdriver/bidi/createContextParameters')

suite(
  function (env) {
    describe('BiDi Permissions', function () {
      let driver, permission, browser, script

      const GET_GEOLOCATION_PERMISSION =
        "async () => { const perm = await navigator.permissions.query({ name: 'geolocation' }); return perm.state; }"
      const GET_ORIGIN = '() => {return window.location.origin;}'

      beforeEach(async function () {
        driver = await env.builder().build()
        permission = await getPermissionInstance(driver)
        browser = await BrowserBiDi(driver)
        script = await getScriptManager([], driver)
      })

      afterEach(function () {
        return driver.quit()
      })

      it('can set permission to granted', async function () {
        const context = await BrowsingContext(driver, { type: 'tab' })
        await context.navigate(Pages.blankPage, 'complete')

        const origin = await script.callFunctionInBrowsingContext(context.id, GET_ORIGIN, true, [])
        const originValue = origin.result.value

        await permission.setPermission({ name: 'geolocation' }, PermissionState.GRANTED, originValue)

        const result = await script.callFunctionInBrowsingContext(context.id, GET_GEOLOCATION_PERMISSION, true, [])
        assert.strictEqual(result.result.value, PermissionState.GRANTED)
      })

      it('can set permission to denied', async function () {
        const context = await BrowsingContext(driver, { type: 'tab' })
        await context.navigate(Pages.blankPage, 'complete')

        const origin = await script.callFunctionInBrowsingContext(context.id, GET_ORIGIN, true, [])

        const originValue = origin.result.value
        await permission.setPermission({ name: 'geolocation' }, PermissionState.DENIED, originValue)

        const result = await script.callFunctionInBrowsingContext(context.id, GET_GEOLOCATION_PERMISSION, true, [])
        assert.strictEqual(result.result.value, PermissionState.DENIED)
      })

      it('can set permission to prompt', async function () {
        const context = await BrowsingContext(driver, { type: 'tab' })
        await context.navigate(Pages.blankPage, 'complete')

        const origin = await script.callFunctionInBrowsingContext(context.id, GET_ORIGIN, true, [])

        const originValue = origin.result.value
        await permission.setPermission({ name: 'geolocation' }, PermissionState.DENIED, originValue)

        await permission.setPermission({ name: 'geolocation' }, PermissionState.PROMPT, originValue)

        const result = await script.callFunctionInBrowsingContext(context.id, GET_GEOLOCATION_PERMISSION, true, [])
        assert.strictEqual(result.result.value, PermissionState.PROMPT)
      })

      it('can set permission for a user context', async function () {
        const userContext = await browser.createUserContext()

        const context1 = await BrowsingContext(driver, { type: 'tab' })
        const context2 = await BrowsingContext(driver, {
          type: 'tab',
          createParameters: new CreateContextParameters().userContext(userContext),
        })

        await context1.navigate(Pages.blankPage, 'complete')
        await context2.navigate(Pages.blankPage, 'complete')

        const origin = await script.callFunctionInBrowsingContext(context1.id, GET_ORIGIN, true, [])
        const originValue = origin.result.value

        // Get the actual permission states from each context
        const originalTabPermission = await script.callFunctionInBrowsingContext(
          context1.id,
          GET_GEOLOCATION_PERMISSION,
          true,
          [],
        )

        const newTabPermission = await script.callFunctionInBrowsingContext(
          context2.id,
          GET_GEOLOCATION_PERMISSION,
          true,
          [],
        )

        const originalTabState = originalTabPermission.result.value
        const newTabState = newTabPermission.result.value

        // Set permission only for the user context
        await permission.setPermission({ name: 'geolocation' }, PermissionState.GRANTED, originValue, userContext)

        // Check that the original tab's permission state hasn't changed
        const originalTabUpdatedPermission = await script.callFunctionInBrowsingContext(
          context1.id,
          GET_GEOLOCATION_PERMISSION,
          true,
          [],
        )
        assert.strictEqual(originalTabUpdatedPermission.result.value, originalTabState)

        // Check that the new tab's permission state has been updated to GRANTED
        const newTabUpdatedPermission = await script.callFunctionInBrowsingContext(
          context2.id,
          GET_GEOLOCATION_PERMISSION,
          true,
          [],
        )
        assert.strictEqual(newTabUpdatedPermission.result.value, PermissionState.GRANTED)
      })
    })
  },
  { browsers: [Browser.FIREFOX, Browser.CHROME, Browser.EDGE] },
)
