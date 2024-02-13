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

const assert = require('assert')
const firefox = require('../../firefox')
const {Browser, By, WebElement} = require('../../')
const { Pages, suite } = require('../../lib/test')
const Network = require('../../bidi/network')
const {AddInterceptParameters} = require("../../bidi/addInterceptParameters");
const {InterceptPhase} = require("../../bidi/interceptPhase");
const {until} = require("../../index");

suite(
  function (env) {
    let driver
    let network

    beforeEach(async function () {
      driver = await env
        .builder()
        .setFirefoxOptions(new firefox.Options().enableBidi())
        .build()

      network = await Network(driver)
    })

    afterEach(async function () {
      await network.close()
      await driver.quit()
    })

    describe('Network commands', function () {
      xit('can add intercept', async function () {
        const intercept = await network.addIntercept(new AddInterceptParameters(InterceptPhase.BEFORE_REQUEST_SENT))
        assert.notEqual(intercept, null)
      })

      xit('can remove intercept', async function () {
        const network = await Network(driver)
        const intercept = await network.addIntercept(new AddInterceptParameters(InterceptPhase.BEFORE_REQUEST_SENT))
        assert.notEqual(intercept, null)

        await network.removeIntercept(intercept)
      })

      xit('can continue without auth credentials ', async function () {
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

      xit('can cancel auth ', async function () {
        await network.addIntercept(new AddInterceptParameters(InterceptPhase.AUTH_REQUIRED))

        await network.authRequired(async (event) => {
          await network.cancelAuth(event.request.request)
        })
        try {
          const alert = await driver.wait(until.alertIsPresent(), 3000)
          assert.fail("Alert should not be present")
        } catch (e) {
          assert.strictEqual(e.name, 'TimeoutError')
        }
      })
    })
  },
  {browsers: [Browser.FIREFOX]},
)
