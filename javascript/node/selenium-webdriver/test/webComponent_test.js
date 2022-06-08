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
const { By, error } = require('..')
const test = require('../lib/test')
const Pages = test.Pages

test.suite(
  function (env) {
    describe('ShadowRoot', function () {
      let driver

      before(async function () {
        driver = await env.builder().build()
      })

      after(function () {
        return driver.quit()
      })

      it('can get Shadow Root', async function () {
        await driver.get(Pages.webComponents)
        let element = await driver.findElement(
          By.css('custom-checkbox-element')
        )
        await element.getShadowRoot()
        // If an error is not thrown then test passes
      })

      it('Throws NoSuchShadowRoot when one is not attached', async function () {
        await driver.get(Pages.simpleTestPage)
        let element = await driver.findElement(By.css('input'))

        try {
          await element.getShadowRoot()
          assert.fail('Error should have been thrown')
        } catch (e) {
          assert.ok(
            e instanceof error.NoSuchShadowRootError,
            `The error is ${typeof e}`
          )
        }
      })

      it('can find element below a shadow root', async function () {
        await driver.get(Pages.webComponents)
        let element = await driver.findElement(
          By.css('custom-checkbox-element')
        )
        let shadowRoot = await element.getShadowRoot()
        await shadowRoot.findElement(By.css('input'))
        // test passes if no error throw
      })

      it('can find elements below a shadow root', async function () {
        await driver.get(Pages.webComponents)
        let element = await driver.findElement(
          By.css('custom-checkbox-element')
        )
        let shadowRoot = await element.getShadowRoot()
        let actual = await shadowRoot.findElements(By.css('input'))
        assert.strictEqual(actual.length, 1)
      })

      it('can return a shadowRoot from executeScript', async function () {
        await driver.get(Pages.webComponents)
        let element = await driver.findElement(
          By.css('custom-checkbox-element')
        )
        let shadowRoot = await element.getShadowRoot()
        let executeShadow = await driver.executeScript(
          'return arguments[0].shadowRoot',
          element
        )
        assert.strictEqual(executeShadow.getId(), shadowRoot.getId())
      })
    })
  },
  { browsers: ['chrome'] }
)
