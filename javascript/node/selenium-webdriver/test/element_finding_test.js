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

var Browser = require('..').Browser,
    By = require('..').By,
    error = require('..').error,
    until = require('..').until,
    promise = require('../lib/promise'),
    test = require('../lib/test'),
    assert = require('../testing/assert'),
    Pages = test.Pages;


test.suite(function(env) {
  var browsers = env.browsers;

  var driver;

  test.before(function*() {
    driver = yield env.builder().build();
  });

  after(function() {
    return driver.quit();
  });

  describe('finding elements', function() {
    test.it(
        'should work after loading multiple pages in a row',
        function*() {
          yield driver.get(Pages.formPage);
          yield driver.get(Pages.xhtmlTestPage);
          yield driver.findElement(By.linkText('click me')).click();
          yield driver.wait(until.titleIs('We Arrive Here'), 5000);
        });

    describe('By.id()', function() {
      test.it('should work', function*() {
        yield driver.get(Pages.xhtmlTestPage);
        yield driver.findElement(By.id('linkId')).click();
        yield driver.wait(until.titleIs('We Arrive Here'), 5000);
      });

      test.it('should fail if ID not present on page', function*() {
        yield driver.get(Pages.formPage);
        return driver.findElement(By.id('nonExistantButton')).
            then(fail, function(e) {
              assert(e).instanceOf(error.NoSuchElementError);
            });
      });

      test.it(
          'should find multiple elements by ID even though that is ' +
              'malformed HTML',
          function*() {
            yield driver.get(Pages.nestedPage);

            let elements = yield driver.findElements(By.id('2'));
            assert(elements.length).equalTo(8);
          });
    });

    describe('By.linkText()', function() {
      test.it('should be able to click on link identified by text', function*() {
        yield driver.get(Pages.xhtmlTestPage);
        yield driver.findElement(By.linkText('click me')).click();
        yield driver.wait(until.titleIs('We Arrive Here'), 5000);
      });

      test.it(
          'should be able to find elements by partial link text',
          function*() {
            yield driver.get(Pages.xhtmlTestPage);
            yield driver.findElement(By.partialLinkText('ick me')).click();
            yield driver.wait(until.titleIs('We Arrive Here'), 5000);
          });

      test.it('should work when link text contains equals sign', function*() {
        yield driver.get(Pages.xhtmlTestPage);
        let el = yield driver.findElement(By.linkText('Link=equalssign'));

        let id = yield el.getAttribute('id');
        assert(id).equalTo('linkWithEqualsSign');
      });

      test.it('matches by partial text when containing equals sign',
        function*() {
          yield driver.get(Pages.xhtmlTestPage);
          let link = yield driver.findElement(By.partialLinkText('Link='));

          let id = yield link.getAttribute('id');
          assert(id).equalTo('linkWithEqualsSign');
        });

      test.it('works when searching for multiple and text contains =',
          function*() {
            yield driver.get(Pages.xhtmlTestPage);
            let elements =
                yield driver.findElements(By.linkText('Link=equalssign'));

            assert(elements.length).equalTo(1);

            let id = yield elements[0].getAttribute('id');
            assert(id).equalTo('linkWithEqualsSign');
          });

      test.it(
          'works when searching for multiple with partial text containing =',
          function*() {
            yield driver.get(Pages.xhtmlTestPage);
            let elements =
                yield driver.findElements(By.partialLinkText('Link='));

            assert(elements.length).equalTo(1);

            let id = yield elements[0].getAttribute('id');
            assert(id).equalTo('linkWithEqualsSign');
          });

      test.it('should be able to find multiple exact matches',
          function*() {
            yield driver.get(Pages.xhtmlTestPage);
            let elements = yield driver.findElements(By.linkText('click me'));
            assert(elements.length).equalTo(2);
          });

      test.it('should be able to find multiple partial matches',
          function*() {
            yield driver.get(Pages.xhtmlTestPage);
            let elements =
                yield driver.findElements(By.partialLinkText('ick me'));
            assert(elements.length).equalTo(2);
          });

      test.ignore(browsers(Browser.SAFARI)).
      it('works on XHTML pages', function*() {
        yield driver.get(test.whereIs('actualXhtmlPage.xhtml'));

        let el = yield driver.findElement(By.linkText('Foo'));
        return assert(el.getText()).equalTo('Foo');
      });
    });

    describe('By.name()', function() {
      test.it('should work', function*() {
        yield driver.get(Pages.formPage);

        let el = yield driver.findElement(By.name('checky'));
        yield assert(el.getAttribute('value')).equalTo('furrfu');
      });

      test.it('should find multiple elements with same name', function*() {
        yield driver.get(Pages.nestedPage);

        let elements = yield driver.findElements(By.name('checky'));
        assert(elements.length).greaterThan(1);
      });

      test.it(
          'should be able to find elements that do not support name property',
          function*() {
            yield driver.get(Pages.nestedPage);
            yield driver.findElement(By.name('div1'));
            // Pass if this does not return an error.
          });

      test.it('shoudl be able to find hidden elements by name', function*() {
        yield driver.get(Pages.formPage);
        yield driver.findElement(By.name('hidden'));
        // Pass if this does not return an error.
      });
    });

    describe('By.className()', function() {
      test.it('should work', function*() {
        yield driver.get(Pages.xhtmlTestPage);

        let el = yield driver.findElement(By.className('extraDiv'));
        yield assert(el.getText()).startsWith('Another div starts here.');
      });

      test.it('should work when name is first name among many', function*() {
        yield driver.get(Pages.xhtmlTestPage);

        let el = yield driver.findElement(By.className('nameA'));
        yield assert(el.getText()).equalTo('An H2 title');
      });

      test.it('should work when name is last name among many', function*() {
        yield driver.get(Pages.xhtmlTestPage);

        let el = yield driver.findElement(By.className('nameC'));
        yield assert(el.getText()).equalTo('An H2 title');
      });

      test.it('should work when name is middle of many', function*() {
        yield driver.get(Pages.xhtmlTestPage);

        let el = yield driver.findElement(By.className('nameBnoise'));
        yield assert(el.getText()).equalTo('An H2 title');
      });

      test.it('should work when name surrounded by whitespace', function*() {
        yield driver.get(Pages.xhtmlTestPage);

        let el = yield driver.findElement(By.className('spaceAround'));
        yield assert(el.getText()).equalTo('Spaced out');
      });

      test.it('should fail if queried name only partially matches', function*() {
        yield driver.get(Pages.xhtmlTestPage);
        return driver.findElement(By.className('nameB')).
            then(fail, function(e) {
              assert(e).instanceOf(error.NoSuchElementError);
            });
      });

      test.it('should implicitly wait', function*() {
        var TIMEOUT_IN_MS = 1000;
        var EPSILON = TIMEOUT_IN_MS / 2;

        yield driver.manage().timeouts().implicitlyWait(TIMEOUT_IN_MS);
        yield driver.get(Pages.formPage);

        var start = new Date();
        return driver.findElement(By.id('nonExistantButton')).
            then(fail, function(e) {
              var end = new Date();
              assert(e).instanceOf(error.NoSuchElementError);
              assert(end - start).closeTo(TIMEOUT_IN_MS, EPSILON);
            });
      });

      test.it('should be able to find multiple matches', function*() {
        yield driver.get(Pages.xhtmlTestPage);

        let elements = yield driver.findElements(By.className('nameC'));
        assert(elements.length).greaterThan(1);
      });

      test.it('permits compound class names', function() {
        return driver.get(Pages.xhtmlTestPage)
            .then(() => driver.findElement(By.className('nameA nameC')))
            .then(el => el.getText())
            .then(text => assert(text).equalTo('An H2 title'));
      });
    });

    describe('By.xpath()', function() {
      test.it('should work with multiple matches', function*() {
        yield driver.get(Pages.xhtmlTestPage);
        let elements = yield driver.findElements(By.xpath('//div'));
        assert(elements.length).greaterThan(1);
      });

      test.it('should work for selectors using contains keyword', function*() {
        yield driver.get(Pages.nestedPage);
        yield driver.findElement(By.xpath('//a[contains(., "hello world")]'));
        // Pass if no error.
      });
    });

    describe('By.tagName()', function() {
      test.it('works', function*() {
        yield driver.get(Pages.formPage);

        let el = yield driver.findElement(By.tagName('input'));
        yield assert(el.getTagName()).equalTo('input');
      });

      test.it('can find multiple elements', function*() {
        yield driver.get(Pages.formPage);

        let elements = yield driver.findElements(By.tagName('input'));
        assert(elements.length).greaterThan(1);
      });
    });

    describe('By.css()', function() {
      test.it('works', function*() {
        yield driver.get(Pages.xhtmlTestPage);
        yield driver.findElement(By.css('div.content'));
        // Pass if no error.
      });

      test.it('can find multiple elements', function*() {
        yield driver.get(Pages.xhtmlTestPage);

        let elements = yield driver.findElements(By.css('p'));
        assert(elements.length).greaterThan(1);
        // Pass if no error.
      });

      test.it(
          'should find first matching element when searching by ' +
              'compound CSS selector',
          function*() {
            yield driver.get(Pages.xhtmlTestPage);

            let el =
                yield driver.findElement(By.css('div.extraDiv, div.content'));
            yield assert(el.getAttribute('class')).equalTo('content');
          });

      test.it('should be able to find multiple elements by compound selector',
          function*() {
            yield driver.get(Pages.xhtmlTestPage);
            let elements =
                yield driver.findElements(By.css('div.extraDiv, div.content'));

            return Promise.all([
              assertClassIs(elements[0], 'content'),
              assertClassIs(elements[1], 'extraDiv')
            ]);

            function assertClassIs(el, expected) {
              return assert(el.getAttribute('class')).equalTo(expected);
            }
          });

      // IE only supports short version option[selected].
      test.ignore(browsers(Browser.IE)).
      it('should be able to find element by boolean attribute', function*() {
        yield driver.get(test.whereIs(
            'locators_tests/boolean_attribute_selected.html'));

        let el = yield driver.findElement(By.css('option[selected="selected"]'));
        yield assert(el.getAttribute('value')).equalTo('two');
      });

      test.it(
          'should be able to find element with short ' +
              'boolean attribute selector',
          function*() {
            yield driver.get(test.whereIs(
                'locators_tests/boolean_attribute_selected.html'));

            let el = yield driver.findElement(By.css('option[selected]'));
            yield assert(el.getAttribute('value')).equalTo('two');
          });

      test.it(
          'should be able to find element with short boolean attribute ' +
              'selector on HTML4 page',
          function*() {
            yield driver.get(test.whereIs(
                'locators_tests/boolean_attribute_selected_html4.html'));

            let el = yield driver.findElement(By.css('option[selected]'));
            yield assert(el.getAttribute('value')).equalTo('two');
          });
    });

    describe('by custom locator', function() {
      test.it('handles single element result', function*() {
        yield driver.get(Pages.javascriptPage);

        let link = yield driver.findElement(function(driver) {
          let links = driver.findElements(By.tagName('a'));
          return promise.filter(links, function(link) {
            return link.getAttribute('id').then(id => id === 'updatediv');
          }).then(links => links[0]);
        });

        yield assert(link.getText()).matches(/Update\s+a\s+div/);
      });

      test.it('uses first element if locator resolves to list', function*() {
        yield driver.get(Pages.javascriptPage);

        let link = yield driver.findElement(function() {
          return driver.findElements(By.tagName('a'));
        });

        yield assert(link.getText()).isEqualTo('Change the page title!');
      });

      test.it('fails if locator returns non-webelement value', function*() {
        yield driver.get(Pages.javascriptPage);

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
      test.ignore(browsers(Browser.SAFARI)).
      it('returns document.activeElement', function*() {
        yield driver.get(Pages.formPage);

        let email = yield driver.findElement(By.css('#email'));
        yield driver.executeScript('arguments[0].focus()', email);

        let ae = yield driver.switchTo().activeElement();
        let equal = yield driver.executeScript(
            'return arguments[0] === arguments[1]', email, ae);
        assert(equal).isTrue();
      });
    });
  });
});
