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
const fileServer = require('../../lib/test/fileserver')
const { ignore, Pages, suite } = require('../../lib/test')
const { Key, Origin } = require('selenium-webdriver/lib/input')
const { Browser, By, until } = require('selenium-webdriver')
const Input = require('selenium-webdriver/bidi/input')

suite(
  function (env) {
    describe('BiDi Input', function () {
      let driver

      beforeEach(async function () {
        driver = await env.builder().build()
      })

      afterEach(function () {
        return driver.quit()
      })

      it('can click element', async function () {
        const browsingContextId = await driver.getWindowHandle()
        const input = await Input(driver)
        await driver.get(fileServer.whereIs('/data/actions/click.html'))

        let box = await driver.findElement(By.id('box'))
        assert.strictEqual(await box.getAttribute('class'), '')

        const actions = await driver.actions().click(box).getSequences()

        await input.perform(browsingContextId, actions)

        await driver.wait(async () => {
          assert.strictEqual(await box.getAttribute('class'), 'green')
          return true
        }, 10000)
      })

      it('can click in center of element', async function () {
        const browsingContextId = await driver.getWindowHandle()
        const input = await Input(driver)
        await driver.get(fileServer.whereIs('/data/actions/record_click.html'))

        const div = await driver.findElement(By.css('div'))
        const rect = await div.getRect()
        assert.deepStrictEqual(rect, { width: 500, height: 500, x: 0, y: 0 })

        const actions = await driver.actions().click(div).getSequences()

        await input.perform(browsingContextId, actions)

        await driver.wait(
          async () => {
            const clicks = await driver.executeScript('return clicks')
            return clicks.length > 0
          },
          10000,
          'No clicks returned',
        )
        const clicks = await driver.executeScript('return clicks')
        assert.deepStrictEqual(clicks, [[250, 250]])
      })

      it('can move relative to element center', async function () {
        const browsingContextId = await driver.getWindowHandle()
        const input = await Input(driver)
        await driver.get(fileServer.whereIs('/data/actions/record_click.html'))

        const div = await driver.findElement(By.css('div'))
        const rect = await div.getRect()
        assert.deepStrictEqual(rect, { width: 500, height: 500, x: 0, y: 0 })

        const actions = await driver.actions().move({ x: 10, y: 10, origin: div }).click().getSequences()

        await input.perform(browsingContextId, actions)

        await driver.wait(
          async () => {
            const clicks = await driver.executeScript('return clicks')
            return clicks.length > 0
          },
          10000,
          'No clicks returned',
        )
        const clicks = await driver.executeScript('return clicks')
        assert.deepStrictEqual(clicks, [[260, 260]])
      })

      ignore(env.browsers(Browser.SAFARI)).it('doubleClick(element)', async function () {
        const browsingContextId = await driver.getWindowHandle()
        const input = await Input(driver)
        await driver.get(fileServer.whereIs('/data/actions/click.html'))

        let box = await driver.findElement(By.id('box'))
        assert.strictEqual(await box.getAttribute('class'), '')

        const actions = await driver.actions().doubleClick(box).getSequences()

        await input.perform(browsingContextId, actions)

        await driver.wait(async () => (await box.getAttribute('class')) === 'blue', 10000)
        assert.strictEqual(await box.getAttribute('class'), 'blue')
      })

      it('dragAndDrop()', async function () {
        const browsingContextId = await driver.getWindowHandle()
        const input = await Input(driver)
        await driver.get(fileServer.whereIs('/data/actions/drag.html'))

        let slide = await driver.findElement(By.id('slide'))
        assert.strictEqual(await slide.getCssValue('left'), '0px')
        assert.strictEqual(await slide.getCssValue('top'), '0px')

        let br = await driver.findElement(By.id('BR'))
        let actions = await driver.actions().dragAndDrop(slide, br).getSequences()
        await input.perform(browsingContextId, actions)
        assert.strictEqual(await slide.getCssValue('left'), '206px')
        assert.strictEqual(await slide.getCssValue('top'), '206px')

        let tr = await driver.findElement(By.id('TR'))
        actions = await driver.actions().dragAndDrop(slide, tr).getSequences()
        await input.perform(browsingContextId, actions)
        assert.strictEqual(await slide.getCssValue('left'), '206px')
        assert.strictEqual(await slide.getCssValue('top'), '1px')
      })

      it('move()', async function () {
        const browsingContextId = await driver.getWindowHandle()
        const input = await Input(driver)
        await driver.get(fileServer.whereIs('/data/actions/drag.html'))

        let slide = await driver.findElement(By.id('slide'))
        assert.strictEqual(await slide.getCssValue('left'), '0px')
        assert.strictEqual(await slide.getCssValue('top'), '0px')

        const actions = await driver
          .actions()
          .move({ origin: slide })
          .press()
          .move({ x: 100, y: 100, origin: Origin.POINTER })
          .release()
          .getSequences()

        input.perform(browsingContextId, actions)

        await driver.wait(async () => (await slide.getCssValue('left')) === '101px', 10000)
        assert.strictEqual(await slide.getCssValue('left'), '101px')
        assert.strictEqual(await slide.getCssValue('left'), '101px')
      })

      xit('can move to and click element in an iframe', async function () {
        const browsingContextId = await driver.getWindowHandle()
        const input = await Input(driver)
        await driver.get(fileServer.whereIs('click_tests/click_in_iframe.html'))

        await driver.wait(until.elementLocated(By.id('ifr')), 5000).then((frame) => driver.switchTo().frame(frame))

        let link = await driver.findElement(By.id('link'))

        const actions = await driver.actions().click(link).getSequences()
        input.perform(browsingContextId, actions)
        await driver.switchTo().defaultContent()
        return driver.wait(until.titleIs('Submitted Successfully!'), 10000)
      })

      it('can send keys to focused element', async function () {
        const browsingContextId = await driver.getWindowHandle()
        const input = await Input(driver)
        await driver.get(Pages.formPage)

        let el = await driver.findElement(By.id('email'))
        assert.strictEqual(await el.getAttribute('value'), '')

        await driver.executeScript('arguments[0].focus()', el)

        const actions = await driver.actions().sendKeys('foobar').getSequences()

        input.perform(browsingContextId, actions)

        await driver.wait(async () => (await el.getAttribute('value')) === 'foobar', 10000)
        assert.strictEqual(await el.getAttribute('value'), 'foobar')
      })

      it('can get the property of element', async function () {
        const browsingContextId = await driver.getWindowHandle()
        const input = await Input(driver)
        await driver.get(Pages.formPage)

        let el = await driver.findElement(By.id('email'))
        assert.strictEqual(await el.getProperty('value'), '')

        await driver.executeScript('arguments[0].focus()', el)

        const actions = await driver.actions().sendKeys('foobar').getSequences()

        await input.perform(browsingContextId, actions)
        await driver.wait(async () => (await el.getProperty('value')) === 'foobar', 10000)
        assert.strictEqual(await el.getProperty('value'), 'foobar')
      })

      it('can send keys to focused element (with modifiers)', async function () {
        const browsingContextId = await driver.getWindowHandle()
        const input = await Input(driver)
        await driver.get(Pages.formPage)

        let el = await driver.findElement(By.id('email'))
        assert.strictEqual(await el.getAttribute('value'), '')

        await driver.executeScript('arguments[0].focus()', el)

        const actions = await driver
          .actions()
          .sendKeys('fo')
          .keyDown(Key.SHIFT)
          .sendKeys('OB')
          .keyUp(Key.SHIFT)
          .sendKeys('ar')
          .getSequences()

        await input.perform(browsingContextId, actions)

        await driver.wait(async () => (await el.getAttribute('value')) === 'foOBar', 10000)
        assert.strictEqual(await el.getAttribute('value'), 'foOBar')
      })

      it('can interact with simple form elements', async function () {
        const browsingContextId = await driver.getWindowHandle()
        const input = await Input(driver)
        await driver.get(Pages.formPage)

        let el = await driver.findElement(By.id('email'))
        assert.strictEqual(await el.getAttribute('value'), '')

        const actions = await driver.actions().click(el).sendKeys('foobar').getSequences()

        await input.perform(browsingContextId, actions)

        await driver.wait(async () => (await el.getAttribute('value')) === 'foobar', 10000)
        assert.strictEqual(await el.getAttribute('value'), 'foobar')
      })

      it('can send keys to designated element', async function () {
        const browsingContextId = await driver.getWindowHandle()
        const input = await Input(driver)
        await driver.get(Pages.formPage)

        let el = await driver.findElement(By.id('email'))
        assert.strictEqual(await el.getAttribute('value'), '')

        const actions = await driver.actions().sendKeys(el, 'foobar').getSequences()

        await input.perform(browsingContextId, actions)

        await driver.wait(async () => (await el.getAttribute('value')) === 'foobar', 10000)
        assert.strictEqual(await el.getAttribute('value'), 'foobar')
      })

      it('can scroll with the wheel input', async function () {
        const browsingContextId = await driver.getWindowHandle()
        const input = await Input(driver)
        await driver.get(Pages.scrollingPage)
        let scrollable = await driver.findElement(By.id('scrollable'))

        const actions = await driver.actions().scroll(0, 0, 5, 10, scrollable).getSequences()
        input.perform(browsingContextId, actions)
        let events = await _getEvents(driver)
        assert.strictEqual(events[0].type, 'wheel')
        assert.ok(events[0].deltaX >= 5)
        assert.ok(events[0].deltaY >= 10)
        assert.strictEqual(events[0].deltaZ, 0)
        assert.strictEqual(events[0].target, 'scrollContent')
      })

      it('can execute release in browsing context', async function () {
        const browsingContextId = await driver.getWindowHandle()
        const input = await Input(driver)
        await driver.get(Pages.releaseAction)

        let inputTextBox = await driver.findElement(By.id('keys'))

        await driver.executeScript('arguments[0].focus()', inputTextBox)

        const actions = await driver.actions().keyDown('a').keyDown('b').getSequences()

        await input.perform(browsingContextId, actions)

        await driver.executeScript('resetEvents()')

        await input.release(browsingContextId)

        const events = await driver.executeScript('return allEvents.events')

        assert.strictEqual(events[0].code, 'KeyB')
        assert.strictEqual(events[1].code, 'KeyA')
      })

      async function _getEvents(driver) {
        await driver.wait(async () => {
          const events = await driver.executeScript('return allEvents.events;')
          return events.length > 0
        }, 5000)
        return (await driver.executeScript('return allEvents.events;')) || []
      }
    })
  },
  { browsers: [Browser.FIREFOX, Browser.CHROME, Browser.EDGE] },
)
