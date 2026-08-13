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
const { Network } = require('selenium-webdriver/bidi/generated/network')
const { BrowsingContext } = require('selenium-webdriver/bidi/generated/browsing_context')

suite(
  function (env) {
    let driver
    let network
    let browsingContext
    let contextId

    beforeEach(async function () {
      driver = await env.builder().build()
      network = await Network.create(driver)
      browsingContext = await BrowsingContext.create(driver)
      contextId = await driver.getWindowHandle()
    })

    afterEach(function () {
      return driver.quit()
    })

    describe('onBeforeRequestSent', function () {
      it('receives event when a page is loaded', async function () {
        let event = null

        await network.onBeforeRequestSent((params) => {
          if (params.request.url.includes('emptyPage') || params.request.url.includes('empty')) {
            event = params
          }
        })

        await browsingContext.navigate({ context: contextId, url: Pages.emptyPage, wait: 'complete' })

        assert.ok(event, 'beforeRequestSent should have fired')
        assert.strictEqual(event.request.method, 'GET')
        assert.ok(event.request.url)
        assert.ok(event.request.headers.length > 0, 'request should have at least one header')
      })

      it('receives cookies in beforeRequestSent', async function () {
        let cookieEvent = null

        await network.onBeforeRequestSent((params) => {
          // Capture the first event that carries our test cookie
          if (params.request.cookies && params.request.cookies.some((c) => c.name === 'bidi-test')) {
            cookieEvent = params
          }
        })

        await browsingContext.navigate({ context: contextId, url: Pages.emptyText, wait: 'complete' })
        await driver.manage().addCookie({ name: 'bidi-test', value: 'works' })
        await browsingContext.navigate({ context: contextId, url: Pages.emptyText, wait: 'complete' })
        await driver.wait(() => cookieEvent !== null, 5000)

        assert.ok(cookieEvent, 'beforeRequestSent with bidi-test cookie should have fired')
        const cookie = cookieEvent.request.cookies.find((c) => c.name === 'bidi-test')
        assert.ok(cookie, 'cookie should appear in request')
        assert.strictEqual(cookie.value.value, 'works')
      })
    })

    describe('onResponseCompleted', function () {
      it('receives event when a response completes', async function () {
        let event = null

        await network.onResponseCompleted((params) => {
          // Capture the first responseCompleted event — no URL filter needed.
          if (!event) {
            event = params
          }
        })

        await browsingContext.navigate({ context: contextId, url: Pages.emptyPage, wait: 'complete' })
        await driver.wait(() => event !== null, 5000)

        assert.ok(event, 'responseCompleted should have fired')
        assert.ok(event.response)
        assert.ok(event.response.status >= 200)
        assert.ok(event.response.url)
      })
    })

    describe('onFetchError', function () {
      it('receives event on network fetch error', async function () {
        let errorEvent = null

        await network.onFetchError((params) => {
          errorEvent = params
        })

        // Navigate to a non-existent host to trigger a fetch error.
        // Use wait: 'none' so the call returns immediately — waiting for
        // 'complete' on a non-existent host blocks for the full TCP/DNS
        // timeout before the fetchError event can be observed.
        await browsingContext
          .navigate({ context: contextId, url: 'http://doesnotexist.invalid/', wait: 'none' })
          .catch(() => {})
        await driver.wait(() => errorEvent !== null, 5000)

        assert.ok(errorEvent, 'fetchError should have fired')
        assert.ok(errorEvent.request)
      })
    })

    describe('addIntercept and continueRequest', function () {
      it('can add and remove an intercept', async function () {
        const result = await network.addIntercept({
          phases: ['beforeRequestSent'],
        })

        assert.ok(result.intercept, 'intercept id should be returned')
        assert.strictEqual(typeof result.intercept, 'string')

        await network.removeIntercept({ intercept: result.intercept })
      })

      it('throws when removing a non-existent intercept', async function () {
        await assert.rejects(() => network.removeIntercept({ intercept: 'no-such-intercept-id' }), /no such intercept/)
      })

      it('can intercept and continue a request', async function () {
        const intercept = await network.addIntercept({
          phases: ['beforeRequestSent'],
        })

        let counter = 0
        await network.onBeforeRequestSent(async (params) => {
          if (params.isBlocked) {
            counter++
            try {
              await network.continueRequest({ request: params.request.request })
            } catch (_err) {
              // ignore — request may already be resolved
            }
          }
        })

        await browsingContext.navigate({ context: contextId, url: Pages.logEntryAdded, wait: 'complete' })

        assert.ok(counter >= 1, 'at least one request should have been intercepted and continued')
        await network.removeIntercept({ intercept: intercept.intercept })
      })

      it('can intercept by url pattern', async function () {
        const result = await network.addIntercept({
          phases: ['beforeRequestSent'],
          urlPatterns: [{ type: 'string', pattern: Pages.emptyPage }],
        })

        assert.ok(result.intercept)

        await network.removeIntercept({ intercept: result.intercept })
      })
    })

    describe('failRequest', function () {
      it('can fail an intercepted request', async function () {
        const intercept = await network.addIntercept({
          phases: ['beforeRequestSent'],
          urlPatterns: [{ type: 'string', pattern: Pages.emptyText }],
        })

        let interceptHandled = false
        await network.onBeforeRequestSent(async (params) => {
          if (params.isBlocked && params.request.url.includes('emptyText') && !interceptHandled) {
            interceptHandled = true
            try {
              await network.failRequest({ request: params.request.request })
            } catch (_err) {
              // ignore — request may already be gone
            }
          }
        })

        // Navigation will fail because we're blocking it — that's expected
        await browsingContext.navigate({ context: contextId, url: Pages.emptyText, wait: 'complete' }).catch(() => {})

        await network.removeIntercept({ intercept: intercept.intercept })
      })
    })

    describe('setCacheBehavior', function () {
      it('can set cache behavior to bypass', async function () {
        const contextId = await driver.getWindowHandle()

        const result = await network.setCacheBehavior({
          cacheBehavior: 'bypass',
          contexts: [contextId],
        })
      })

      it('can set cache behavior back to default', async function () {
        const contextId = await driver.getWindowHandle()

        await network.setCacheBehavior({ cacheBehavior: 'bypass', contexts: [contextId] })
        await network.setCacheBehavior({ cacheBehavior: 'default', contexts: [contextId] })
      })

      it('can set global cache behavior', async function () {
        await network.setCacheBehavior({ cacheBehavior: 'bypass' })
        await network.setCacheBehavior({ cacheBehavior: 'default' })
      })
    })

    describe('setExtraHeaders', function () {
      it('can set extra headers for a context', async function () {
        const contextId = await driver.getWindowHandle()

        const result = await network.setExtraHeaders({
          headers: [{ name: 'x-custom-header', value: { type: 'string', value: 'test-value' } }],
          contexts: [contextId],
        })
      })

      it('can clear extra headers', async function () {
        const contextId = await driver.getWindowHandle()

        await network.setExtraHeaders({
          headers: [{ name: 'x-custom-header', value: { type: 'string', value: 'test' } }],
          contexts: [contextId],
        })
        await network.setExtraHeaders({
          headers: [],
          contexts: [contextId],
        })
      })
    })

    describe('onResponseStarted', function () {
      it('receives event when a response starts', async function () {
        let event = null

        await network.onResponseStarted((params) => {
          if (!event) {
            event = params
          }
        })

        await browsingContext.navigate({ context: contextId, url: Pages.emptyPage, wait: 'complete' })
        await driver.wait(() => event !== null, 5000)

        assert.ok(event, 'responseStarted should have fired')
        assert.ok(event.response)
      })
    })
  },
  { browsers: [Browser.CHROME, Browser.FIREFOX] },
)
