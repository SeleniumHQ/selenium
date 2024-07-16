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
require('../../lib/test/fileserver')
const { Pages, suite } = require('../../lib/test')
const { Browser, By } = require('selenium-webdriver')
const Input = require('selenium-webdriver/bidi/input')
const io = require('selenium-webdriver/io')
const { ReferenceValue, RemoteReferenceType } = require('selenium-webdriver/bidi/protocolValue')
const fs = require('node:fs')
const { ignore } = require('selenium-webdriver/testing')

suite(
  function (env) {
    describe('Input Set Files', function () {
      const FILE_HTML = '<!DOCTYPE html><div>' + 'Hello' + '</div>'
      let driver

      let _fp
      before(function () {
        return (_fp = io.tmpFile().then(function (fp) {
          fs.writeFileSync(fp, FILE_HTML)
          return fp
        }))
      })

      beforeEach(async function () {
        driver = await env.builder().build()
      })

      afterEach(function () {
        return driver.quit()
      })

      ignore(env.browsers(Browser.FIREFOX)).it('can set files', async function () {
        const browsingContextId = await driver.getWindowHandle()
        const input = await Input(driver)
        await driver.get(Pages.formPage)

        const filePath = await io.tmpFile().then(function (fp) {
          fs.writeFileSync(fp, FILE_HTML)
          return fp
        })

        const webElement = await driver.findElement(By.id('upload'))

        assert.strictEqual(await webElement.getAttribute('value'), '')

        const webElementId = await webElement.getId()

        await input.setFiles(browsingContextId, new ReferenceValue(RemoteReferenceType.SHARED_ID, webElementId), [
          filePath,
        ])

        assert.notEqual(await webElement.getAttribute('value'), '')
      })

      ignore(env.browsers(Browser.FIREFOX)).it('can set files with element id', async function () {
        const browsingContextId = await driver.getWindowHandle()
        const input = await Input(driver)
        await driver.get(Pages.formPage)

        const filePath = await io.tmpFile().then(function (fp) {
          fs.writeFileSync(fp, FILE_HTML)
          return fp
        })

        const webElement = await driver.findElement(By.id('upload'))

        assert.strictEqual(await webElement.getAttribute('value'), '')

        const webElementId = await webElement.getId()

        await input.setFiles(browsingContextId, webElementId, filePath)

        assert.notEqual(await webElement.getAttribute('value'), '')
      })
    })
  },
  { browsers: [Browser.FIREFOX, Browser.CHROME, Browser.EDGE] },
)
