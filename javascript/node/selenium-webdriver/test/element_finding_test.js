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
const promise = require('../lib/promise')
const { Browser, By, error, withTagName, until } = require('..')
const { Pages, ignore, suite, whereIs } = require('../lib/test')
const { locateWith } = require('../lib/by')

suite(function (env) {
  const browsers = (...args) => env.browsers(...args)

  let driver

  before(async function () {
    driver = await env.builder().build()
  })

  after(function () {
    return driver.quit()
  })

  describe('finding elements', function () {
    it('should work after loading multiple pages in a row', async function () {
      await driver.get(Pages.formPage)
      await driver.get(Pages.xhtmlTestPage)
      await driver.findElement(By.linkText('click me')).click()
      await driver.wait(until.titleIs('We Arrive Here'), 5000)
    })

    describe('By.id()', function () {
      it('should work', async function () {
        await driver.get(Pages.xhtmlTestPage)
        await driver.findElement(By.id('linkId')).click()
        await driver.wait(until.titleIs('We Arrive Here'), 5000)
      })

      it('should fail if ID not present on page', async function () {
        await driver.get(Pages.formPage)
        return driver
          .findElement(By.id('nonExistantButton'))
          .then(assert.fail, function (e) {
            assert.ok(e instanceof error.NoSuchElementError)
          })
      })

      it(
        'should find multiple elements by ID even though that is ' +
        'malformed HTML',
        async function () {
          await driver.get(Pages.nestedPage)

          let elements = await driver.findElements(By.id('2'))
          assert.strictEqual(elements.length, 8)
        }
      )
    })

    describe('By.linkText()', function () {
      it('should be able to click on link identified by text', async function () {
        await driver.get(Pages.xhtmlTestPage)
        await driver.findElement(By.linkText('click me')).click()
        await driver.wait(until.titleIs('We Arrive Here'), 5000)
      })

      it('should be able to find elements by partial link text', async function () {
        await driver.get(Pages.xhtmlTestPage)
        await driver.findElement(By.partialLinkText('ick me')).click()
        await driver.wait(until.titleIs('We Arrive Here'), 5000)
      })

      it('should work when link text contains equals sign', async function () {
        await driver.get(Pages.xhtmlTestPage)
        let el = await driver.findElement(By.linkText('Link=equalssign'))

        let id = await el.getAttribute('id')
        assert.strictEqual(id, 'linkWithEqualsSign')
      })

      it('matches by partial text when containing equals sign', async function () {
        await driver.get(Pages.xhtmlTestPage)
        let link = await driver.findElement(By.partialLinkText('Link='))

        let id = await link.getAttribute('id')
        assert.strictEqual(id, 'linkWithEqualsSign')
      })

      it('works when searching for multiple and text contains =', async function () {
        await driver.get(Pages.xhtmlTestPage)
        let elements = await driver.findElements(By.linkText('Link=equalssign'))

        assert.strictEqual(elements.length, 1)

        let id = await elements[0].getAttribute('id')
        assert.strictEqual(id, 'linkWithEqualsSign')
      })

      it('works when searching for multiple with partial text containing =', async function () {
        await driver.get(Pages.xhtmlTestPage)
        let elements = await driver.findElements(By.partialLinkText('Link='))

        assert.strictEqual(elements.length, 1)

        let id = await elements[0].getAttribute('id')
        assert.strictEqual(id, 'linkWithEqualsSign')
      })

      it('should be able to find multiple exact matches', async function () {
        await driver.get(Pages.xhtmlTestPage)
        let elements = await driver.findElements(By.linkText('click me'))
        assert.strictEqual(elements.length, 2)
      })

      it('should be able to find multiple partial matches', async function () {
        await driver.get(Pages.xhtmlTestPage)
        let elements = await driver.findElements(By.partialLinkText('ick me'))
        assert.strictEqual(elements.length, 2)
      })

      ignore(browsers(Browser.SAFARI)).it(
        'works on XHTML pages',
        async function () {
          await driver.get(whereIs('actualXhtmlPage.xhtml'))

          let el = await driver.findElement(By.linkText('Foo'))
          assert.strictEqual(await el.getText(), 'Foo')
        }
      )
    })

    describe('By.name()', function () {
      it('should work', async function () {
        await driver.get(Pages.formPage)

        let el = await driver.findElement(By.name('checky'))
        assert.strictEqual(await el.getAttribute('value'), 'furrfu')
      })

      it('should find multiple elements with same name', async function () {
        await driver.get(Pages.nestedPage)

        let elements = await driver.findElements(By.name('checky'))
        assert.ok(elements.length > 1)
      })

      it('should be able to find elements that do not support name property', async function () {
        await driver.get(Pages.nestedPage)
        await driver.findElement(By.name('div1'))
        // Pass if this does not return an error.
      })

      it('should be able to find hidden elements by name', async function () {
        await driver.get(Pages.formPage)
        await driver.findElement(By.name('hidden'))
        // Pass if this does not return an error.
      })
    })

    describe('By.className()', function () {
      it('should work', async function () {
        await driver.get(Pages.xhtmlTestPage)

        let el = await driver.findElement(By.className('extraDiv'))
        let text = await el.getText()
        assert.ok(
          text.startsWith('Another div starts here.'),
          `Unexpected text: "${text}"`
        )
      })

      it('should work when name is first name among many', async function () {
        await driver.get(Pages.xhtmlTestPage)

        let el = await driver.findElement(By.className('nameA'))
        assert.strictEqual(await el.getText(), 'An H2 title')
      })

      it('should work when name is last name among many', async function () {
        await driver.get(Pages.xhtmlTestPage)

        let el = await driver.findElement(By.className('nameC'))
        assert.strictEqual(await el.getText(), 'An H2 title')
      })

      it('should work when name is middle of many', async function () {
        await driver.get(Pages.xhtmlTestPage)

        let el = await driver.findElement(By.className('nameBnoise'))
        assert.strictEqual(await el.getText(), 'An H2 title')
      })

      it('should work when name surrounded by whitespace', async function () {
        await driver.get(Pages.xhtmlTestPage)

        let el = await driver.findElement(By.className('spaceAround'))
        assert.strictEqual(await el.getText(), 'Spaced out')
      })

      it('should fail if queried name only partially matches', async function () {
        await driver.get(Pages.xhtmlTestPage)
        return driver
          .findElement(By.className('nameB'))
          .then(assert.fail, function (e) {
            assert.ok(e instanceof error.NoSuchElementError)
          })
      })

      it('should implicitly wait', async function () {
        const TIMEOUT_IN_MS = 1000
        const EPSILON = TIMEOUT_IN_MS / 2

        await driver.manage().setTimeouts({ implicit: TIMEOUT_IN_MS })
        await driver.get(Pages.formPage)

        let start = new Date()
        return driver
          .findElement(By.id('nonExistantButton'))
          .then(assert.fail, function (e) {
            let end = new Date()
            assert.ok(e instanceof error.NoSuchElementError)

            let elapsed = end - start
            let diff = Math.abs(elapsed - TIMEOUT_IN_MS)
            assert.ok(
              diff < EPSILON,
              `Expected ${TIMEOUT_IN_MS} \u00b1 ${EPSILON} but got ${elapsed}`
            )
          })
      })

      it('should be able to find multiple matches', async function () {
        await driver.get(Pages.xhtmlTestPage)

        let elements = await driver.findElements(By.className('nameC'))
        assert.ok(elements.length > 1)
      })

      it('permits compound class names', function () {
        return driver
          .get(Pages.xhtmlTestPage)
          .then(() => driver.findElement(By.className('nameA nameC')))
          .then((el) => el.getText())
          .then((text) => assert.strictEqual(text, 'An H2 title'))
      })
    })

    describe('By.xpath()', function () {
      it('should work with multiple matches', async function () {
        await driver.get(Pages.xhtmlTestPage)
        let elements = await driver.findElements(By.xpath('//div'))
        assert.ok(elements.length > 1)
      })

      it('should work for selectors using contains keyword', async function () {
        await driver.get(Pages.nestedPage)
        await driver.findElement(By.xpath('//a[contains(., "hello world")]'))
        // Pass if no error.
      })
    })

    describe('By.tagName()', function () {
      it('works', async function () {
        await driver.get(Pages.formPage)

        let el = await driver.findElement(By.tagName('input'))
        assert.strictEqual((await el.getTagName()).toLowerCase(), 'input')
      })

      it('can find multiple elements', async function () {
        await driver.get(Pages.formPage)

        let elements = await driver.findElements(By.tagName('input'))
        assert.ok(elements.length > 1)
      })
    })

    describe('By.css()', function () {
      it('works', async function () {
        await driver.get(Pages.xhtmlTestPage)
        await driver.findElement(By.css('div.content'))
        // Pass if no error.
      })

      it('can find multiple elements', async function () {
        await driver.get(Pages.xhtmlTestPage)

        let elements = await driver.findElements(By.css('p'))
        assert.ok(elements.length > 1)
        // Pass if no error.
      })

      it(
        'should find first matching element when searching by ' +
        'compound CSS selector',
        async function () {
          await driver.get(Pages.xhtmlTestPage)

          let el = await driver.findElement(By.css('div.extraDiv, div.content'))
          assert.strictEqual(await el.getAttribute('class'), 'content')
        }
      )

      it('should be able to find multiple elements by compound selector', async function () {
        await driver.get(Pages.xhtmlTestPage)
        let elements = await driver.findElements(
          By.css('div.extraDiv, div.content')
        )

        return Promise.all([
          assertClassIs(elements[0], 'content'),
          assertClassIs(elements[1], 'extraDiv'),
        ])

        async function assertClassIs(el, expected) {
          let clazz = await el.getAttribute('class')
          assert.strictEqual(clazz, expected)
        }
      })

      // IE only supports short version option[selected].
      ignore(browsers(Browser.INTERNET_EXPLORER)).it(
        'should be able to find element by boolean attribute',
        async function () {
          await driver.get(
            whereIs('locators_tests/boolean_attribute_selected.html')
          )

          let el = await driver.findElement(
            By.css('option[selected="selected"]')
          )
          assert.strictEqual(await el.getAttribute('value'), 'two')
        }
      )

      it(
        'should be able to find element with short ' +
        'boolean attribute selector',
        async function () {
          await driver.get(
            whereIs('locators_tests/boolean_attribute_selected.html')
          )

          let el = await driver.findElement(By.css('option[selected]'))
          assert.strictEqual(await el.getAttribute('value'), 'two')
        }
      )

      it(
        'should be able to find element with short boolean attribute ' +
        'selector on HTML4 page',
        async function () {
          await driver.get(
            whereIs('locators_tests/boolean_attribute_selected_html4.html')
          )

          let el = await driver.findElement(By.css('option[selected]'))
          assert.strictEqual(await el.getAttribute('value'), 'two')
        }
      )
    })

    describe('by custom locator', function () {
      it('handles single element result', async function () {
        await driver.get(Pages.javascriptPage)

        let link = await driver.findElement(function (driver) {
          let links = driver.findElements(By.tagName('a'))
          return promise
            .filter(links, function (link) {
              return link.getAttribute('id').then((id) => id === 'updatediv')
            })
            .then((links) => links[0])
        })

        let text = await link.getText()
        let regex = /Update\s+a\s+div/
        assert.ok(regex.test(text), `"${text}" does not match ${regex}`)
      })

      it('uses first element if locator resolves to list', async function () {
        await driver.get(Pages.javascriptPage)

        let link = await driver.findElement(function () {
          return driver.findElements(By.tagName('a'))
        })

        assert.strictEqual(await link.getText(), 'Change the page title!')
      })

      it('fails if locator returns non-webelement value', async function () {
        await driver.get(Pages.javascriptPage)

        let link = driver.findElement(function () {
          return driver.getTitle()
        })

        return link.then(
          () => assert.fail('Should have failed'),
          (e) => assert.ok(e instanceof TypeError)
        )
      })
    })

    describe('RelativeBy to find element', function () {
      it('finds an element above', async function () {
        await driver.get(Pages.relativeLocators)
        let below = await driver.findElement(By.id('below'))
        let elements = await driver.findElements(withTagName('p').above(below))
        let ids = []
        assert.strictEqual(elements.length, 2)
        for (let i = 0; i < elements.length; i++) {
          ids.push(await elements[i].getAttribute('id'))
        }
        assert.deepStrictEqual(ids, ['mid', 'above'])
      })

      it('should combine filters', async function () {
        await driver.get(Pages.relativeLocators)

        let elements = await driver.findElements(
          withTagName('td').above(By.id('center')).toRightOf(By.id('second'))
        )
        let ids = []
        for (let i = 0; i < elements.length; i++) {
          ids.push(await elements[i].getAttribute('id'))
        }
        assert.notDeepStrictEqual(
          ids.indexOf('third'),
          -1,
          `Elements are ${ids}`
        )
      })
    })

    describe('RelativeBy with findElement', function () {
      it('finds an element above', async function () {
        await driver.get(Pages.relativeLocators)
        let below = await driver.findElement(By.id('below'))
        let element = await driver.findElement(withTagName('p').above(below))
        assert.deepStrictEqual(await element.getAttribute('id'), `mid`)
      })

      it('should combine filters', async function () {
        await driver.get(Pages.relativeLocators)
        let element = await driver.findElement(
          withTagName('td').above(By.id('center')).toRightOf(By.id('second'))
        )
        assert.deepStrictEqual(await element.getAttribute('id'), `third`)
      })

      it('should search by passing in a by object', async function () {
        await driver.get(Pages.relativeLocators)
        let element = await driver.findElement(locateWith(By.css('p')).above(await driver.findElement(By.id('below'))))
        assert.deepStrictEqual(await element.getAttribute('id'), 'mid')
      })
    })

    describe('switchTo().activeElement()', function () {
      // SAFARI's new session response does not identify it as a W3C browser,
      // so the command is sent in the unsupported wire protocol format.
      ignore(browsers(Browser.SAFARI)).it(
        'returns document.activeElement',
        async function () {
          await driver.get(Pages.formPage)

          let email = await driver.findElement(By.css('#email'))
          await driver.executeScript('arguments[0].focus()', email)

          let ae = await driver.switchTo().activeElement()
          let equal = await driver.executeScript(
            'return arguments[0] === arguments[1]',
            email,
            ae
          )
          assert.ok(equal)
        }
      )
    })
  })
})
