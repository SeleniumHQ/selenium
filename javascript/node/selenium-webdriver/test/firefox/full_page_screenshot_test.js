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
const { Browser } = require('selenium-webdriver/index')
const { Pages, suite } = require('../../lib/test')
let startIndex = 0
let endIndex = 5
let pngMagicNumber = 'iVBOR'
suite(
  function (env) {
    describe('firefox', function () {
      let driver

      beforeEach(function () {
        driver = null
      })

      afterEach(function () {
        return driver && driver.quit()
      })

      it('Should be able to take full page screenshot', async function () {
        driver = env.builder().build()
        await driver.get(Pages.simpleTestPage)
        let encoding = await driver.takeFullPageScreenshot()
        const base64code = encoding.slice(startIndex, endIndex)
        assert.equal(base64code, pngMagicNumber)
      })
    })
  },
  { browsers: [Browser.FIREFOX] },
)
