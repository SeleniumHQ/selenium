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
const { suite, ignore, Pages } = require('../../../lib/test')
const { Browser } = require('selenium-webdriver')

const { Emulation } = require('selenium-webdriver/bidi/generated/emulation')
const { Script } = require('selenium-webdriver/bidi/generated/script')
const { BrowsingContext } = require('selenium-webdriver/bidi/generated/browsing_context')

suite(
  function (env) {
    let driver
    let emulation
    let script
    let browsingContext

    beforeEach(async function () {
      driver = await env.builder().build()
      emulation = await Emulation.create(driver)
      script = await Script.create(driver)
      browsingContext = await BrowsingContext.create(driver)
      await driver.get(Pages.emptyPage)
    })

    afterEach(function () {
      return driver.quit()
    })

    describe('setUserAgentOverride', function () {
      it('can override the user agent', async function () {
        const contextId = await driver.getWindowHandle()
        const customUA = 'MyCustomUA/1.0'

        await emulation.setUserAgentOverride({
          userAgent: customUA,
          contexts: [contextId],
        })

        // Navigate after setting override so the new UA is used for the request
        await driver.get(Pages.emptyPage)
        const ua = await driver.executeScript('return navigator.userAgent')
        assert.strictEqual(ua, customUA)
      })

      it('can clear the user agent override', async function () {
        const contextId = await driver.getWindowHandle()

        await emulation.setUserAgentOverride({ userAgent: 'test-ua', contexts: [contextId] })
        await driver.get(Pages.emptyPage)

        // Clear by passing null
        await emulation.setUserAgentOverride({ userAgent: null, contexts: [contextId] })
        await driver.get(Pages.emptyPage)

        const ua = await driver.executeScript('return navigator.userAgent')
        // After clearing, user agent should not be 'test-ua'
        assert.notStrictEqual(ua, 'test-ua')
      })
    })

    describe('setTimezoneOverride', function () {
      it('can override the timezone', async function () {
        // Open a fresh tab, set the override for it, navigate, then evaluate.
        // Using a new context ensures the override is applied before any page
        // load so the new realm picks it up from the start.
        const { context: newContextId } = await browsingContext.create({ type: 'tab' })

        await emulation.setTimezoneOverride({
          timezone: 'America/New_York',
          contexts: [newContextId],
        })

        await browsingContext.navigate({
          context: newContextId,
          url: Pages.emptyPage,
          wait: 'complete',
        })

        const evalResult = await script.evaluate({
          expression: 'Intl.DateTimeFormat().resolvedOptions().timeZone',
          target: { context: newContextId },
          awaitPromise: false,
        })

        await browsingContext.close({ context: newContextId })
        assert.strictEqual(evalResult.result.value, 'America/New_York')
      })

      it('can set UTC timezone', async function () {
        const { context: newContextId } = await browsingContext.create({ type: 'tab' })

        await emulation.setTimezoneOverride({
          timezone: 'UTC',
          contexts: [newContextId],
        })

        await browsingContext.navigate({
          context: newContextId,
          url: Pages.emptyPage,
          wait: 'complete',
        })

        const evalResult = await script.evaluate({
          expression: 'Intl.DateTimeFormat().resolvedOptions().timeZone',
          target: { context: newContextId },
          awaitPromise: false,
        })

        await browsingContext.close({ context: newContextId })
        assert.strictEqual(evalResult.result.value, 'UTC')
      })
    })

    describe('setLocaleOverride', function () {
      it('can override the locale', async function () {
        // Same fresh-tab approach as setTimezoneOverride — set override before
        // any page load so the new realm picks it up from the start.
        const { context: newContextId } = await browsingContext.create({ type: 'tab' })

        await emulation.setLocaleOverride({
          locale: 'fr-FR',
          contexts: [newContextId],
        })

        await browsingContext.navigate({
          context: newContextId,
          url: Pages.emptyPage,
          wait: 'complete',
        })

        const evalResult = await script.evaluate({
          expression: 'Intl.DateTimeFormat().resolvedOptions().locale',
          target: { context: newContextId },
          awaitPromise: false,
        })

        await browsingContext.close({ context: newContextId })
        assert.ok(
          evalResult.result.value.startsWith('fr'),
          `locale should start with 'fr', got '${evalResult.result.value}'`,
        )
      })

      it('can clear the locale override', async function () {
        const contextId = await driver.getWindowHandle()

        await emulation.setLocaleOverride({ locale: 'ja-JP', contexts: [contextId] })
        // Clear by passing null
        await emulation.setLocaleOverride({ locale: null, contexts: [contextId] })
      })
    })

    describe('setNetworkConditions', function () {
      it('can set network conditions to offline', async function () {
        const contextId = await driver.getWindowHandle()

        await emulation.setNetworkConditions({
          networkConditions: { type: 'offline' },
          contexts: [contextId],
        })

        // Restore
        await emulation.setNetworkConditions({
          networkConditions: null,
          contexts: [contextId],
        })
      })

      it('can clear network conditions', async function () {
        const contextId = await driver.getWindowHandle()

        await emulation.setNetworkConditions({
          networkConditions: { type: 'offline' },
          contexts: [contextId],
        })
        await emulation.setNetworkConditions({
          networkConditions: null,
          contexts: [contextId],
        })
      })
    })

    describe('setGeolocationOverride', function () {
      it('can override geolocation coordinates', async function () {
        const contextId = await driver.getWindowHandle()

        await emulation.setGeolocationOverride({
          coordinates: {
            latitude: 37.7749,
            longitude: -122.4194,
            accuracy: 10,
          },
          contexts: [contextId],
        })
      })

      it('can clear geolocation override', async function () {
        const contextId = await driver.getWindowHandle()

        await emulation.setGeolocationOverride({
          coordinates: { latitude: 0, longitude: 0, accuracy: 1 },
          contexts: [contextId],
        })
        await emulation.setGeolocationOverride({
          coordinates: null,
          contexts: [contextId],
        })
      })
    })

    describe('setScreenOrientationOverride', function () {
      it('can override screen orientation to portrait', async function () {
        const contextId = await driver.getWindowHandle()

        await emulation.setScreenOrientationOverride({
          screenOrientation: { natural: 'portrait', type: 'portrait-primary' },
          contexts: [contextId],
        })
      })

      it('can override screen orientation to landscape', async function () {
        const contextId = await driver.getWindowHandle()

        await emulation.setScreenOrientationOverride({
          screenOrientation: { natural: 'landscape', type: 'landscape-primary' },
          contexts: [contextId],
        })
      })

      it('can clear screen orientation override', async function () {
        const contextId = await driver.getWindowHandle()

        await emulation.setScreenOrientationOverride({
          screenOrientation: { natural: 'portrait', type: 'portrait-primary' },
          contexts: [contextId],
        })
        await emulation.setScreenOrientationOverride({
          screenOrientation: null,
          contexts: [contextId],
        })
      })
    })

    ignore(env.browsers(Browser.FIREFOX)).describe('setScriptingEnabled', function () {
      it('can disable scripting for a context', async function () {
        const contextId = await driver.getWindowHandle()

        await emulation.setScriptingEnabled({
          enabled: false,
          contexts: [contextId],
        })

        // Restore by passing null
        await emulation.setScriptingEnabled({
          enabled: null,
          contexts: [contextId],
        })
      })
    })

    ignore(env.browsers(Browser.FIREFOX)).describe('setTouchOverride', function () {
      it('can enable touch emulation', async function () {
        const contextId = await driver.getWindowHandle()

        await emulation.setTouchOverride({
          maxTouchPoints: 5,
          contexts: [contextId],
        })

        // Restore by passing null
        await emulation.setTouchOverride({
          maxTouchPoints: null,
          contexts: [contextId],
        })
      })
    })
  },
  { browsers: [Browser.CHROME, Browser.FIREFOX] },
)
