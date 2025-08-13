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
const {Pages, suite} = require('../../lib/test')
const {Browser} = require('selenium-webdriver')
const BrowserBiDi = require('selenium-webdriver/bidi/browser')
const getScriptManager = require('selenium-webdriver/bidi/scriptManager')
const {GeolocationPositionError, getEmulationInstance } = require('selenium-webdriver/bidi/emulation/emulation')
const GeolocationCoordinates = require('selenium-webdriver/bidi/emulation/geolocationCoordinates')
const BrowsingContext = require('selenium-webdriver/bidi/browsingContext')
const {getPermissionInstance, PermissionState} = require('selenium-webdriver/bidi/external/permissions')
const {CreateContextParameters} = require('selenium-webdriver/bidi/createContextParameters')

suite(
  function (env) {
    describe('BiDi Emulation', function () {
      let driver, emulation, permission, script, browser

      const GET_ORIGIN = '() => {return window.location.origin;}'

      const GET_CURRENT_GEOLOCATION = `
  new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      position => {
        const coords = position.coords;
        resolve({
          latitude: coords.latitude,
          longitude: coords.longitude,
          accuracy: coords.accuracy,
          altitude: coords.altitude,
          altitudeAccuracy: coords.altitudeAccuracy,
          heading: coords.heading,
          speed: coords.speed,
          timestamp: position.timestamp
        });
      },
      error => resolve({ error: error.message }),
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 0 }
    );
  })
`

      beforeEach(async function () {
        driver = await env.builder().build()
        emulation = await getEmulationInstance(driver)
        permission = await getPermissionInstance(driver)
        script = await getScriptManager([], driver)
        browser = await BrowserBiDi(driver)
      })

      afterEach(function () {
        return driver.quit()
      })

      it('can override geolocation for browsing context', async function () {
        const windowHandle = await driver.getWindowHandle()
        const context = await BrowsingContext(driver, {browsingContextId: windowHandle})
        await context.navigate(Pages.blankPage, 'complete')

        const origin = await script.callFunctionInBrowsingContext(context.id, GET_ORIGIN, true, [])
        const originValue = origin.result.value
        await permission.setPermission({name: 'geolocation'}, PermissionState.GRANTED, originValue)

        const coords = new GeolocationCoordinates(37.7749, -122.4194)

        await emulation.setGeolocationOverride(coords, windowHandle)

        const result = await script.evaluateFunctionInBrowsingContext(context.id, GET_CURRENT_GEOLOCATION, true)

        const geolocation = result.result.value
        const currentLatitude = geolocation.latitude.value
        const currentLongitude = geolocation.longitude.value

        assert.strictEqual(currentLatitude, 37.7749)
        assert.strictEqual(currentLongitude, -122.4194)
      })

      it('can override geolocation for user context', async function () {
        const userContext1 = await browser.createUserContext()
        const userContext2 = await browser.createUserContext()

        const createParams1 = new CreateContextParameters().userContext(userContext1)
        const createParams2 = new CreateContextParameters().userContext(userContext2)

        const context1 = await BrowsingContext(driver, {type: 'tab', createParameters: createParams1})

        const context2 = await BrowsingContext(driver, {type: 'tab', createParameters: createParams2})

        const coords = new GeolocationCoordinates(45.5, -122.4194)

        await emulation.setGeolocationOverride(coords, undefined, [userContext1, userContext2])

        await driver.switchTo().window(context1.id)

        await context1.navigate(Pages.blankPage, 'complete')
        const origin1 = (await script.callFunctionInBrowsingContext(context1.id, GET_ORIGIN, true, [])).result.value
        await permission.setPermission({name: 'geolocation'}, PermissionState.GRANTED, origin1, userContext1)

        const result1 = await script.evaluateFunctionInBrowsingContext(context1.id, GET_CURRENT_GEOLOCATION, true)
        const geolocation1 = result1.result.value
        const currentLatitude1 = geolocation1.latitude.value
        const currentLongitude1 = geolocation1.longitude.value

        assert.strictEqual(currentLatitude1, 45.5)
        assert.strictEqual(currentLongitude1, -122.4194)

        await driver.switchTo().window(context2.id)

        await context2.navigate(Pages.blankPage, 'complete')
        const origin2 = (await script.callFunctionInBrowsingContext(context1.id, GET_ORIGIN, true, [])).result.value
        await permission.setPermission({name: 'geolocation'}, PermissionState.GRANTED, origin2, userContext2)

        const result2 = await script.evaluateFunctionInBrowsingContext(context2.id, GET_CURRENT_GEOLOCATION, true)
        const geolocation2 = result2.result.value
        const currentLatitude2 = geolocation2.latitude.value
        const currentLongitude2 = geolocation2.longitude.value

        assert.strictEqual(currentLatitude2, 45.5)
        assert.strictEqual(currentLongitude2, -122.4194)
      })

      it('can override geolocation with error', async function () {
        const windowHandle = await driver.getWindowHandle()
        const context = await BrowsingContext(driver, { browsingContextId: windowHandle })
        await context.navigate(Pages.blankPage, 'complete')

        const origin = await script.callFunctionInBrowsingContext(context.id, GET_ORIGIN, true, [])
        const originValue = origin.result.value

        await permission.setPermission({name: 'geolocation'}, PermissionState.GRANTED, originValue)

        await emulation.setGeolocationOverride(GeolocationPositionError, windowHandle)

        const result = await script.evaluateFunctionInBrowsingContext(
          context.id,
          GET_CURRENT_GEOLOCATION,
          true
        )

        const geolocation = result.result.value

        assert.ok(
          Object.hasOwn(geolocation, 'error'),
          `Expected geolocation to have 'error' key, but got: ${JSON.stringify(geolocation)}`
        )
      })
    })
  },
  {browsers: [Browser.CHROME]},
)
