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
const { suite } = require('../../lib/test')
const Network = require('../../bidi/network')
const {AddInterceptParameters} = require("../../bidi/addInterceptParameters");
const {InterceptPhase} = require("../../bidi/interceptPhase");

suite(
  function (env) {
    let driver

    beforeEach(async function () {
      driver = await env
        .builder()
        .setFirefoxOptions(new firefox.Options().enableBidi())
        .build()
    })

    afterEach(async function () {
      await driver.quit()
    })

    describe('Network commands', function () {
      xit('can add intercept', async function () {
        const network = await Network(driver)
        const intercept = await network.addIntercept(new AddInterceptParameters(InterceptPhase.BEFORE_REQUEST_SENT))
        assert.notEqual(intercept, null)
      })

      xit('can remove intercept', async function () {
        const network = await Network(driver)
        const intercept = await network.addIntercept(new AddInterceptParameters(InterceptPhase.BEFORE_REQUEST_SENT))
        assert.notEqual(intercept, null)

        await network.removeIntercept(intercept)
      })
    })

  },
  {browsers: [Browser.FIREFOX]}
)
