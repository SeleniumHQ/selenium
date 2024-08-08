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
const { Browser, By } = require('selenium-webdriver')
const { Pages, suite } = require('../../lib/test')
const Network = require('selenium-webdriver/bidi/network')
const { AddInterceptParameters } = require('selenium-webdriver/bidi/addInterceptParameters')
const { InterceptPhase } = require('selenium-webdriver/bidi/interceptPhase')
const { until } = require('selenium-webdriver/index')
const { ContinueRequestParameters } = require('selenium-webdriver/bidi/continueRequestParameters')
const { ContinueResponseParameters } = require('selenium-webdriver/bidi/continueResponseParameters')
const { ProvideResponseParameters } = require('selenium-webdriver/bidi/provideResponseParameters')

suite(
  function (env) {
    let driver
    let network

    beforeEach(async function () {
      driver = await env.builder().build()

      network = await Network(driver)
    })

    afterEach(async function () {
      await network.close()
      await driver.quit()
    })

    describe('Network commands', function () {
      it('can add intercept', async function () {
        const intercept = await network.addIntercept(new AddInterceptParameters(InterceptPhase.BEFORE_REQUEST_SENT))
        assert.notEqual(intercept, null)
      })

      it('can remove intercept', async function () {
        const network = await Network(driver)
        const intercept = await network.addIntercept(new AddInterceptParameters(InterceptPhase.BEFORE_REQUEST_SENT))
        assert.notEqual(intercept, null)

        await network.removeIntercept(intercept)
      })

      it('can continue with auth credentials ', async function () {
        await network.addIntercept(new AddInterceptParameters(InterceptPhase.AUTH_REQUIRED))

        await network.authRequired(async (event) => {
          await network.continueWithAuth(event.request.request, 'genie', 'bottle')
        })
        await driver.get(Pages.basicAuth)

        await driver.wait(until.elementLocated(By.css('pre')))
        let source = await driver.getPageSource()
        assert.equal(source.includes('Access granted'), true)
      })

      it('can continue without auth credentials ', async function () {
        await network.addIntercept(new AddInterceptParameters(InterceptPhase.AUTH_REQUIRED))

        await network.authRequired(async (event) => {
          await network.continueWithAuthNoCredentials(event.request.request)
        })

        await driver.get(Pages.basicAuth)
        const alert = await driver.wait(until.alertIsPresent())
        await alert.dismiss()

        await driver.wait(until.elementLocated(By.css('pre')))
        let source = await driver.getPageSource()
        assert.equal(source.includes('Access denied'), true)
      })

      it('can cancel auth ', async function () {
        await network.addIntercept(new AddInterceptParameters(InterceptPhase.AUTH_REQUIRED))

        await network.authRequired(async (event) => {
          await network.cancelAuth(event.request.request)
        })
        try {
          await driver.wait(until.alertIsPresent(), 3000)
          assert.fail('Alert should not be present')
        } catch (e) {
          assert.strictEqual(e.name, 'TimeoutError')
        }
      })

      it('can fail request', async function () {
        await network.addIntercept(new AddInterceptParameters(InterceptPhase.BEFORE_REQUEST_SENT))

        await network.beforeRequestSent(async (event) => {
          await network.failRequest(event.request.request)
        })

        await driver.manage().setTimeouts({ pageLoad: 5000 })

        try {
          await driver.get(Pages.basicAuth)
          assert.fail('Page should not be loaded')
        } catch (e) {
          assert.strictEqual(e.name, 'TimeoutError')
        }
      })

      it('can continue request', async function () {
        await network.addIntercept(new AddInterceptParameters(InterceptPhase.BEFORE_REQUEST_SENT))

        let counter = 0

        await network.beforeRequestSent(async (event) => {
          await network.continueRequest(new ContinueRequestParameters(event.request.request))
          counter = counter + 1
        })

        await driver.get(Pages.logEntryAdded)

        assert.strictEqual(counter >= 1, true)
      })

      it('can continue response', async function () {
        await network.addIntercept(new AddInterceptParameters(InterceptPhase.RESPONSE_STARTED))

        let counter = 0

        await network.responseStarted(async (event) => {
          await network.continueResponse(new ContinueResponseParameters(event.request.request))
          counter = counter + 1
        })

        await driver.get(Pages.logEntryAdded)

        assert.strictEqual(counter >= 1, true)
      })

      it('can provide response', async function () {
        await network.addIntercept(new AddInterceptParameters(InterceptPhase.BEFORE_REQUEST_SENT))

        let counter = 0

        await network.beforeRequestSent(async (event) => {
          await network.provideResponse(new ProvideResponseParameters(event.request.request))
          counter = counter + 1
        })

        await driver.get(Pages.logEntryAdded)

        assert.strictEqual(counter >= 1, true)
      })
    })
  },
  { browsers: [Browser.FIREFOX] },
)
