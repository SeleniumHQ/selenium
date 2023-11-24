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

const test = require('../lib/test')
const { Pages } = require('../lib/test')
const { Browser } = require('../')
const assert = require('assert')

let startIndex = 0
let endIndex = 5
let pdfMagicNumber = 'JVBER'
let base64Code

test.suite(
  function (env) {
    let driver

    afterEach(function () {
      return driver.quit()
    })

    it('Should Print pdf with 2 pages', async function () {
      driver = env.builder().build()
      await driver.get(Pages.printPage)
      base64Code = await driver.printPage({ pageRanges: ['1-2'] })
      base64Code = base64Code.slice(startIndex, endIndex)
      assert.strictEqual(base64Code, pdfMagicNumber)
    })

    it('Should Print pdf with total pages', async function () {
      driver = env.builder().build()
      await driver.get(Pages.printPage)
      base64Code = await driver.printPage()
      base64Code = base64Code.slice(startIndex, endIndex)
      assert.strictEqual(base64Code, pdfMagicNumber)
    })

    it('Check with all valid params', async function () {
      driver = env.builder().build()
      await driver.get(Pages.printPage)
      base64Code = await driver.printPage({
        orientation: 'landscape',
        scale: 1,
        background: true,
        width: 30,
        height: 30,
        top: 1,
        bottom: 1,
        left: 1,
        right: 1,
        shrinkToFit: true,
        pageRanges: ['1-2'],
      })
      base64Code = base64Code.slice(startIndex, endIndex)
      assert.strictEqual(base64Code, pdfMagicNumber)
    })

    it('Check with page params', async function () {
      driver = env.builder().build()
      await driver.get(Pages.printPage)
      base64Code = await driver.printPage({ width: 30, height: 30 })
      base64Code = base64Code.slice(startIndex, endIndex)
      assert.strictEqual(base64Code, pdfMagicNumber)
    })

    it('Check with margin params', async function () {
      driver = env.builder().build()
      await driver.get(Pages.printPage)
      base64Code = await driver.printPage({
        top: 1,
        bottom: 1,
        left: 1,
        right: 1,
      })
      base64Code = base64Code.slice(startIndex, endIndex)
      assert.strictEqual(base64Code, pdfMagicNumber)
    })
  },
  { browsers: [Browser.FIREFOX, Browser.CHROME] }
)
