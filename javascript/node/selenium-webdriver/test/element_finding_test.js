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

'use strict';

var fail = require('assert').fail;

var {Browser, By, error, until} = require('..'),
    promise = require('../lib/promise'),
    {Pages, ignore, suite, whereIs} = require('../lib/test'),
    assert = require('../testing/assert');


suite(function(env) {
  var browsers = env.browsers;

  var driver;

  before(async function() {
    driver = await env.builder().build();
  });

  after(function() {
    return driver.quit();
  });

  describe('finding elements', function() {
    it('should work after loading multiple pages in a row', async function() {
      await driver.get(Pages.formPage);
      await driver.get(Pages.xhtmlTestPage);
      await driver.findElement(By.linkText('click me')).click();
      await driver.wait(until.titleIs('We Arrive Here'), 5000);
    });

    describe('By.id()', function() {
      it('should work', async function() {
        await driver.get(Pages.xhtmlTestPage);
        await driver.findElement(By.id('linkId')).click();
        await driver.wait(until.titleIs('We Arrive Here'), 5000);
      });

      it('should fail if ID not present on page', async function() {
        await driver.get(Pages.formPage);
        return driver.findElement(By.id('nonExistantButton')).
            then(fail, function(e) {
              assert(e).instanceOf(error.NoSuchElementError);
            });
      });

      it(
          'should find multiple elements by ID even though that is ' +
              'malformed HTML',
          async function() {
            await driver.get(Pages.nestedPage);

            let elements = await driver.findElements(By.id('2'));
            assert(elements.length).equalTo(8);
          });
    });

    describe('By.linkText()', function() {
      it('should be able to click on link identified by text', async function() {
        await driver.get(Pages.xhtmlTestPage);
        await driver.findElement(By.linkText('click me')).click();
        await driver.wait(until.titleIs('We Arrive Here'), 5000);
      });

      it(
          'should be able to find elements by partial link text',
          async function() {
            await driver.get(Pages.xhtmlTestPage);
            await driver.findElement(By.partialLinkText('ick me')).click();
            await driver.wait(until.titleIs('We Arrive Here'), 5000);
          });

      it('should work when link text contains equals sign', async function() {
        await driver.get(Pages.xhtmlTestPage);
        let el = await driver.findElement(By.linkText('Link=equalssign'));

        let id = await el.getAttribute('id');
        assert(id).equalTo('linkWithEqualsSign');
      });

      it('matches by partial text when containing equals sign',
        async function() {
          await driver.get(Pages.xhtmlTestPage);
          let link = await driver.findElement(By.partialLinkText('Link='));

          let id = await link.getAttribute('id');
          assert(id).equalTo('linkWithEqualsSign');
        });

      it('works when searching for multiple and text contains =',
          async function() {
            await driver.get(Pages.xhtmlTestPage);
            let elements =
                await driver.findElements(By.linkText('Link=equalssign'));

            assert(elements.length).equalTo(1);

            let id = await elements[0].getAttribute('id');
            assert(id).equalTo('linkWithEqualsSign');
          });

      it(
          'works when searching for multiple with partial text containing =',
          async function() {
            await driver.get(Pages.xhtmlTestPage);
            let elements =
                await driver.findElements(By.partialLinkText('Link='));

            assert(elements.length).equalTo(1);

            let id = await elements[0].getAttribute('id');
            assert(id).equalTo('linkWithEqualsSign');
          });

      it('should be able to find multiple exact matches',
          async function() {
            await driver.get(Pages.xhtmlTestPage);
            let elements = await driver.findElements(By.linkText('click me'));
            assert(elements.length).equalTo(2);
          });

      it('should be able to find multiple partial matches',
          async function() {
            await driver.get(Pages.xhtmlTestPage);
            let elements =
                await driver.findElements(By.partialLinkText('ick me'));
            assert(elements.length).equalTo(2);
          });

      ignore(browsers(Browser.SAFARI)).
      it('works on XHTML pages', async function() {
        await driver.get(whereIs('actualXhtmlPage.xhtml'));

        let el = await driver.findElement(By.linkText('Foo'));
        return assert(el.getText()).equalTo('Foo');
      });
    });

    describe('By.name()', function() {
      it('should work', async function() {
        await driver.get(Pages.formPage);

        let el = await driver.findElement(By.name('checky'));
        await assert(el.getAttribute('value')).equalTo('furrfu');
      });

      it('should find multiple elements with same name', async function() {
        await driver.get(Pages.nestedPage);

        let elements = await driver.findElements(By.name('checky'));
        assert(elements.length).greaterThan(1);
      });

      it(
          'should be able to find elements that do not support name property',
          async function() {
            await driver.get(Pages.nestedPage);
            await driver.findElement(By.name('div1'));
            // Pass if this does not return an error.
          });

      it('shoudl be able to find hidden elements by name', async function() {
        await driver.get(Pages.formPage);
        await driver.findElement(By.name('hidden'));
        // Pass if this does not return an error.
      });
    });

    describe('By.className()', function() {
      it('should work', async function() {
        await driver.get(Pages.xhtmlTestPage);

        let el = await driver.findElement(By.className('extraDiv'));
        await assert(el.getText()).startsWith('Another div starts here.');
      });

      it('should work when name is first name among many', async function() {
        await driver.get(Pages.xhtmlTestPage);

        let el = await driver.findElement(By.className('nameA'));
        await assert(el.getText()).equalTo('An H2 title');
      });

      it('should work when name is last name among many', async function() {
        await driver.get(Pages.xhtmlTestPage);

        let el = await driver.findElement(By.className('nameC'));
        await assert(el.getText()).equalTo('An H2 title');
      });

      it('should work when name is middle of many', async function() {
        await driver.get(Pages.xhtmlTestPage);

        let el = await driver.findElement(By.className('nameBnoise'));
        await assert(el.getText()).equalTo('An H2 title');
      });

      it('should work when name surrounded by whitespace', async function() {
        await driver.get(Pages.xhtmlTestPage);

        let el = await driver.findElement(By.className('spaceAround'));
        await assert(el.getText()).equalTo('Spaced out');
      });

      it('should fail if queried name only partially matches', async function() {
        await driver.get(Pages.xhtmlTestPage);
        return driver.findElement(By.className('nameB')).
            then(fail, function(e) {
              assert(e).instanceOf(error.NoSuchElementError);
            });
      });

      it('should implicitly wait', async function() {
        var TIMEOUT_IN_MS = 1000;
        var EPSILON = TIMEOUT_IN_MS / 2;

        await driver.manage().timeouts().implicitlyWait(TIMEOUT_IN_MS);
        await driver.get(Pages.formPage);

        var start = new Date();
        return driver.findElement(By.id('nonExistantButton')).
            then(fail, function(e) {
              var end = new Date();
              assert(e).instanceOf(error.NoSuchElementError);
              assert(end - start).closeTo(TIMEOUT_IN_MS, EPSILON);
            });
      });

      it('should be able to find multiple matches', async function() {
        await driver.get(Pages.xhtmlTestPage);

        let elements = await driver.findElements(By.className('nameC'));
        assert(elements.length).greaterThan(1);
      });

      it('permits compound class names', function() {
        return driver.get(Pages.xhtmlTestPage)
            .then(() => driver.findElement(By.className('nameA nameC')))
            .then(el => el.getText())
            .then(text => assert(text).equalTo('An H2 title'));
      });
    });

    describe('By.xpath()', function() {
      it('should work with multiple matches', async function() {
        await driver.get(Pages.xhtmlTestPage);
        let elements = await driver.findElements(By.xpath('//div'));
        assert(elements.length).greaterThan(1);
      });

      it('should work for selectors using contains keyword', async function() {
        await driver.get(Pages.nestedPage);
        await driver.findElement(By.xpath('//a[contains(., "hello world")]'));
        // Pass if no error.
      });
    });

    describe('By.tagName()', function() {
      it('works', async function() {
        await driver.get(Pages.formPage);

        let el = await driver.findElement(By.tagName('input'));
        await assert(el.getTagName()).equalTo('input');
      });

      it('can find multiple elements', async function() {
        await driver.get(Pages.formPage);

        let elements = await driver.findElements(By.tagName('input'));
        assert(elements.length).greaterThan(1);
      });
    });

    describe('By.css()', function() {
      it('works', async function() {
        await driver.get(Pages.xhtmlTestPage);
        await driver.findElement(By.css('div.content'));
        // Pass if no error.
      });

      it('can find multiple elements', async function() {
        await driver.get(Pages.xhtmlTestPage);

        let elements = await driver.findElements(By.css('p'));
        assert(elements.length).greaterThan(1);
        // Pass if no error.
      });

      it(
          'should find first matching element when searching by ' +
              'compound CSS selector',
          async function() {
            await driver.get(Pages.xhtmlTestPage);

            let el =
                await driver.findElement(By.css('div.extraDiv, div.content'));
            await assert(el.getAttribute('class')).equalTo('content');
          });

      it('should be able to find multiple elements by compound selector',
          async function() {
            await driver.get(Pages.xhtmlTestPage);
            let elements =
                await driver.findElements(By.css('div.extraDiv, div.content'));

            return Promise.all([
              assertClassIs(elements[0], 'content'),
              assertClassIs(elements[1], 'extraDiv')
            ]);

            function assertClassIs(el, expected) {
              return assert(el.getAttribute('class')).equalTo(expected);
            }
          });

      // IE only supports short version option[selected].
      ignore(browsers(Browser.IE)).
      it('should be able to find element by boolean attribute', async function() {
        await driver.get(whereIs(
            'locators_tests/boolean_attribute_selected.html'));

        let el = await driver.findElement(By.css('option[selected="selected"]'));
        await assert(el.getAttribute('value')).equalTo('two');
      });

      it(
          'should be able to find element with short ' +
              'boolean attribute selector',
          async function() {
            await driver.get(whereIs(
                'locators_tests/boolean_attribute_selected.html'));

            let el = await driver.findElement(By.css('option[selected]'));
            await assert(el.getAttribute('value')).equalTo('two');
          });

      it(
          'should be able to find element with short boolean attribute ' +
              'selector on HTML4 page',
          async function() {
            await driver.get(whereIs(
                'locators_tests/boolean_attribute_selected_html4.html'));

            let el = await driver.findElement(By.css('option[selected]'));
            await assert(el.getAttribute('value')).equalTo('two');
          });
    });

    describe('by custom locator', function() {
      it('handles single element result', async function() {
        await driver.get(Pages.javascriptPage);

        let link = await driver.findElement(function(driver) {
          let links = driver.findElements(By.tagName('a'));
          return promise.filter(links, function(link) {
            return link.getAttribute('id').then(id => id === 'updatediv');
          }).then(links => links[0]);
        });

        await assert(link.getText()).matches(/Update\s+a\s+div/);
      });

      it('uses first element if locator resolves to list', async function() {
        await driver.get(Pages.javascriptPage);

        let link = await driver.findElement(function() {
          return driver.findElements(By.tagName('a'));
        });

        await assert(link.getText()).isEqualTo('Change the page title!');
      });

      it('fails if locator returns non-webelement value', async function() {
        await driver.get(Pages.javascriptPage);

        let link = driver.findElement(function() {
          return driver.getTitle();
        });

        return link.then(
            () => fail('Should have failed'),
            (e) => assert(e).instanceOf(TypeError));
      });
    });

    describe('switchTo().activeElement()', function() {
      // SAFARI's new session response does not identify it as a W3C browser,
      // so the command is sent in the unsupported wire protocol format.
      ignore(browsers(Browser.SAFARI)).
      it('returns document.activeElement', async function() {
        await driver.get(Pages.formPage);

        let email = await driver.findElement(By.css('#email'));
        await driver.executeScript('arguments[0].focus()', email);

        let ae = await driver.switchTo().activeElement();
        let equal = await driver.executeScript(
            'return arguments[0] === arguments[1]', email, ae);
        assert(equal).isTrue();
      });
    });
  });
});
