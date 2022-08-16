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
const fileServer = require('../lib/test/fileserver')
const { ignore, Pages, suite } = require('../lib/test')
const { Key, Origin } = require('../lib/input')
const { Browser, By, until } = require('..')

suite(function (env) {
  describe('WebDriver.actions()', function () {
    let driver

    beforeEach(async function () {
      driver = await env.builder().build()
    })

    afterEach(function () {
      return driver.quit()
    })

    it('click(element)', async function () {
      await driver.get(fileServer.whereIs('/data/actions/click.html'))

      let box = await driver.findElement(By.id('box'))
      assert.strictEqual(await box.getAttribute('class'), '')

      await driver.actions().click(box).perform()
      await driver.wait(async () => {
        assert.strictEqual(await box.getAttribute('class'), 'green')
        return true
      }, 10000)
    })

    it('click(element) clicks in center of element', async function () {
      await driver.get(fileServer.whereIs('/data/actions/record_click.html'))

      const div = await driver.findElement(By.css('div'))
      const rect = await div.getRect()
      assert.deepStrictEqual(rect, { width: 500, height: 500, x: 0, y: 0 })

      await driver.actions().click(div).perform()

      await driver.wait(
        async () => {
          const clicks = await driver.executeScript('return clicks')
          return clicks.length > 0
        },
        10000,
        'No clicks returned'
      )
      const clicks = await driver.executeScript('return clicks')
      assert.deepStrictEqual(clicks, [[250, 250]])
    })

    it('can move relative to element center', async function () {
      await driver.get(fileServer.whereIs('/data/actions/record_click.html'))

      const div = await driver.findElement(By.css('div'))
      const rect = await div.getRect()
      assert.deepStrictEqual(rect, { width: 500, height: 500, x: 0, y: 0 })

      await driver
        .actions()
        .move({ x: 10, y: 10, origin: div })
        .click()
        .perform()

      await driver.wait(
        async () => {
          const clicks = await driver.executeScript('return clicks')
          return clicks.length > 0
        },
        10000,
        'No clicks returned'
      )
      const clicks = await driver.executeScript('return clicks')
      assert.deepStrictEqual(clicks, [[260, 260]])
    })

    ignore(env.browsers(Browser.SAFARI)).it(
      'doubleClick(element)',
      async function () {
        await driver.get(fileServer.whereIs('/data/actions/click.html'))

        let box = await driver.findElement(By.id('box'))
        assert.strictEqual(await box.getAttribute('class'), '')

        await driver.actions().doubleClick(box).perform()
        await driver.wait(
          async () => (await box.getAttribute('class')) === 'blue',
          10000
        )
        assert.strictEqual(await box.getAttribute('class'), 'blue')
      }
    )

    it('dragAndDrop()', async function () {
      await driver.get(fileServer.whereIs('/data/actions/drag.html'))

      let slide = await driver.findElement(By.id('slide'))
      assert.strictEqual(await slide.getCssValue('left'), '0px')
      assert.strictEqual(await slide.getCssValue('top'), '0px')

      let br = await driver.findElement(By.id('BR'))
      await driver.actions().dragAndDrop(slide, br).perform()
      assert.strictEqual(await slide.getCssValue('left'), '206px')
      assert.strictEqual(await slide.getCssValue('top'), '206px')

      let tr = await driver.findElement(By.id('TR'))
      await driver.actions().dragAndDrop(slide, tr).perform()
      assert.strictEqual(await slide.getCssValue('left'), '206px')
      assert.strictEqual(await slide.getCssValue('top'), '1px')
    })

    it('move()', async function () {
      await driver.get(fileServer.whereIs('/data/actions/drag.html'))

      let slide = await driver.findElement(By.id('slide'))
      assert.strictEqual(await slide.getCssValue('left'), '0px')
      assert.strictEqual(await slide.getCssValue('top'), '0px')

      await driver
        .actions()
        .move({ origin: slide })
        .press()
        .move({ x: 100, y: 100, origin: Origin.POINTER })
        .release()
        .perform()

      await driver.wait(
        async () => (await slide.getCssValue('left')) === '101px',
        10000
      )
      assert.strictEqual(await slide.getCssValue('left'), '101px')
      assert.strictEqual(await slide.getCssValue('left'), '101px')
    })

    it('can move to and click element in an iframe', async function () {
      await driver.get(fileServer.whereIs('click_tests/click_in_iframe.html'))

      await driver
        .wait(until.elementLocated(By.id('ifr')), 5000)
        .then((frame) => driver.switchTo().frame(frame))

      let link = await driver.findElement(By.id('link'))

      await driver.actions().click(link).perform()
      await driver.switchTo().defaultContent()
      return driver.wait(until.titleIs('Submitted Successfully!'), 10000)
    })

    it('can send keys to focused element', async function () {
      await driver.get(Pages.formPage)

      let el = await driver.findElement(By.id('email'))
      assert.strictEqual(await el.getAttribute('value'), '')

      await driver.executeScript('arguments[0].focus()', el)

      await driver.actions().sendKeys('foobar').perform()

      await driver.wait(
        async () => (await el.getAttribute('value')) === 'foobar',
        10000
      )
      assert.strictEqual(await el.getAttribute('value'), 'foobar')
    })

    it('can get the property of element', async function () {
      await driver.get(Pages.formPage)

      let el = await driver.findElement(By.id('email'))
      assert.strictEqual(await el.getProperty('value'), '')

      await driver.executeScript('arguments[0].focus()', el)

      await driver.actions().sendKeys('foobar').perform()

      await driver.wait(
        async () => (await el.getProperty('value')) === 'foobar',
        10000
      )
      assert.strictEqual(await el.getProperty('value'), 'foobar')
    })

    it('can send keys to focused element (with modifiers)', async function () {
      await driver.get(Pages.formPage)

      let el = await driver.findElement(By.id('email'))
      assert.strictEqual(await el.getAttribute('value'), '')

      await driver.executeScript('arguments[0].focus()', el)

      await driver
        .actions()
        .sendKeys('fo')
        .keyDown(Key.SHIFT)
        .sendKeys('OB')
        .keyUp(Key.SHIFT)
        .sendKeys('ar')
        .perform()

      await driver.wait(
        async () => (await el.getAttribute('value')) === 'foOBar',
        10000
      )
      assert.strictEqual(await el.getAttribute('value'), 'foOBar')
    })

    it('can interact with simple form elements', async function () {
      await driver.get(Pages.formPage)

      let el = await driver.findElement(By.id('email'))
      assert.strictEqual(await el.getAttribute('value'), '')

      await driver.actions().click(el).sendKeys('foobar').perform()

      await driver.wait(
        async () => (await el.getAttribute('value')) === 'foobar',
        10000
      )
      assert.strictEqual(await el.getAttribute('value'), 'foobar')
    })

    it('can send keys to designated element', async function () {
      await driver.get(Pages.formPage)

      let el = await driver.findElement(By.id('email'))
      assert.strictEqual(await el.getAttribute('value'), '')

      await driver.actions().sendKeys(el, 'foobar').perform()

      await driver.wait(
        async () => (await el.getAttribute('value')) === 'foobar',
        10000
      )
      assert.strictEqual(await el.getAttribute('value'), 'foobar')
    })

    ignore(env.browsers(Browser.FIREFOX, Browser.SAFARI)).it(
      'can scroll with the wheel input',
      async function () {
        await driver.get(Pages.scrollingPage)
        let scrollable = await driver.findElement(By.id('scrollable'))

        await driver.actions().scroll(0, 0, 5, 10, scrollable).perform()
        let events = await _getEvents(driver)
        assert.strictEqual(events[0].type, 'wheel')
        assert.ok(events[0].deltaX >= 5)
        assert.ok(events[0].deltaY >= 10)
        assert.strictEqual(events[0].deltaZ, 0)
        assert.strictEqual(events[0].target, 'scrollContent')
      }
    )

    async function _getEvents(driver) {
      await driver.wait(async () => {
        const events = await driver.executeScript('return allEvents.events;')
        return events.length > 0
      }, 5000)
      return (await driver.executeScript('return allEvents.events;')) || []
    }
  })
})
