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
const error = require('../lib/error')
const fileServer = require('../lib/test/fileserver')
const test = require('../lib/test')
const { Key, Origin } = require('../lib/input')
const { By } = require('..')

test.suite(function (env) {
  describe('WebDriver.actions()', function () {
    let driver

    before(async function () {
      driver = await env.builder().build()
    })

    afterEach(async function () {
      try {
        await driver.actions().clear()
      } catch (e) {
        if (
          e instanceof error.UnsupportedOperationError ||
          e instanceof error.UnknownCommandError
        ) {
          return
        }
        throw e
      }
    })

    after(function () {
      return driver.quit()
    })

    it('move()', async function () {
      await driver.get(fileServer.whereIs('/data/actions/drag.html'))

      let slide = await driver.findElement(By.id('slide'))
      assert.equal(await slide.getCssValue('left'), '0px')
      assert.equal(await slide.getCssValue('top'), '0px')

      await driver
        .actions()
        .move({ origin: slide })
        .press()
        .move({ x: 100, y: 100, origin: Origin.POINTER })
        .release()
        .perform()
      assert.equal(await slide.getCssValue('left'), '101px')
      assert.equal(await slide.getCssValue('top'), '101px')
    })

    it('can send keys to focused element', async function () {
      await driver.get(test.Pages.formPage)

      let el = await driver.findElement(By.id('email'))
      assert.equal(await el.getAttribute('value'), '')

      await driver.executeScript('arguments[0].focus()', el)

      await driver.actions().sendKeys('foobar').perform()

      assert.equal(await el.getAttribute('value'), 'foobar')
    })

    it('can get the property of element', async function () {
      await driver.get(test.Pages.formPage)

      let el = await driver.findElement(By.id('email'))
      assert.equal(await el.getProperty('value'), '')

      await driver.executeScript('arguments[0].focus()', el)

      await driver.actions().sendKeys('foobar').perform()

      assert.equal(await el.getProperty('value'), 'foobar')
    })

    it('can send keys to focused element (with modifiers)', async function () {
      await driver.get(test.Pages.formPage)

      let el = await driver.findElement(By.id('email'))
      assert.equal(await el.getAttribute('value'), '')

      await driver.executeScript('arguments[0].focus()', el)

      await driver
        .actions()
        .sendKeys('fo')
        .keyDown(Key.SHIFT)
        .sendKeys('OB')
        .keyUp(Key.SHIFT)
        .sendKeys('ar')
        .perform()

      assert.equal(await el.getAttribute('value'), 'foOBar')
    })
  })
})
