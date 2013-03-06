// Copyright 2013 Selenium committers
// Copyright 2013 Software Freedom Conservancy
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
//     You may obtain a copy of the License at
//
// http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

'use strict';

require('./lib/_bootstrap')(module);

var assert = require('assert'),
    By = require('selenium-webdriver').By,
    error = require('selenium-webdriver').error;

var test = require('./lib/testbase'),
    Browser = test.Browser,
    Pages = test.Pages;


test.suite(function(env) {
  var browsers = env.browsers,
      waitForTitleToBe = env.waitForTitleToBe;

  var driver;
  beforeEach(function() { driver = env.driver; });

  describe('finding elements', function() {

    test.it(
        'should work after loading multiple pages in a row',
        function() {
          driver.get(Pages.formPage);
          driver.get(Pages.xhtmlTestPage);
          driver.findElement(By.linkText('click me')).click();
          waitForTitleToBe('We Arrive Here');
        });

    describe('By.id()', function() {
      test.it('should work', function() {
        driver.get(Pages.xhtmlTestPage);
        driver.findElement(By.id('linkId')).click();
        waitForTitleToBe('We Arrive Here');
      });

      test.it('should fail if ID not present on page', function() {
        driver.get(Pages.formPage);
        driver.findElement(By.id('nonExistantButton')).
            then(assert.fail, function(e) {
              assert.equal(error.ErrorCode.NO_SUCH_ELEMENT, e.code);
            });
      });

      test.ignore(browsers(Browser.ANDROID)).it(
          'should find multiple elements by ID even though that ' +
              'is malformed HTML',
          function() {
            driver.get(Pages.nestedPage);
            driver.findElements(By.id('2')).then(function(elements) {
              assert.equal(elements.length, 8);
            });
          });
    });

    describe('By.linkText()', function() {
      test.it('should be able to click on link identified by text', function() {
        driver.get(Pages.xhtmlTestPage);
        driver.findElement(By.linkText('click me')).click();
        waitForTitleToBe('We Arrive Here');
      });

      test.it(
        'should be able to find elements by partial link text', function() {
          driver.get(Pages.xhtmlTestPage);
          driver.findElement(By.partialLinkText('ick me')).click();
          waitForTitleToBe('We Arrive Here');
        });

      test.it('should work when link text contains equals sign', function() {
        driver.get(Pages.xhtmlTestPage);
        driver.findElement(By.linkText('Link=equalssign')).
            getAttribute('id').
            then(function(id) {
              assert.equal('linkWithEqualsSign', id);
            });
      });

      test.it('matches by partial text when containing equals sign',
        function() {
          driver.get(Pages.xhtmlTestPage);
          driver.findElement(By.partialLinkText('Link=')).
              getAttribute('id').
              then(function(id) {
                assert.equal('linkWithEqualsSign', id);
              });
        });

      test.it('works when searching for multiple and text contains =',
          function() {
            driver.get(Pages.xhtmlTestPage);
            driver.findElements(By.linkText('Link=equalssign')).
                then(function(elements) {
                  assert.equal(elements.length, 1);
                  return elements[0].getAttribute('id');
                }).
                then(function(id) {
                  assert.equal('linkWithEqualsSign', id);
                });
          });

      test.it(
          'works when searching for multiple with partial text containing =',
          function() {
            driver.get(Pages.xhtmlTestPage);
            driver.findElements(By.partialLinkText('Link=')).
                then(function(elements) {
                  assert.equal(elements.length, 1);
                  return elements[0].getAttribute('id');
                }).
                then(function(id) {
                  assert.equal('linkWithEqualsSign', id);
                });
          });

      test.it('should be able to find multiple exact matches',
          function() {
            driver.get(Pages.xhtmlTestPage);
            driver.findElements(By.linkText('click me')).
                then(function(elements) {
                  assert.equal(elements.length, 2);
                });
          });

      test.it('should be able to find multiple partial matches',
          function() {
            driver.get(Pages.xhtmlTestPage);
            driver.findElements(By.partialLinkText('ick me')).
                then(function(elements) {
                  assert.equal(elements.length, 2);
                });
          });

      test.ignore(browsers(Browser.OPERA)).
      it('works on XHTML pages', function() {
        driver.get(test.whereIs('actualXhtmlPage.xhtml'));
        driver.findElement(By.linkText('Foo')).getText().then(function(text) {
          assert.equal(text, 'Foo');
        });
      });
    });

    describe('By.name()', function() {
      test.it('should work', function() {
        driver.get(Pages.formPage);
        driver.findElement(By.name('checky')).
            getAttribute('value').
            then(function(value) {
              assert.equal('furrfu', value);
            });
      });

      test.it('should find multiple elements with same name', function() {
        driver.get(Pages.nestedPage);
        driver.findElements(By.name('checky')).then(function(elements) {
          assert.ok(elements.length > 1);
        });
      });

      test.it(
          'should be able to find elements that do not support name property',
          function() {
            driver.get(Pages.nestedPage);
            driver.findElement(By.name('div1'));
            // Pass if this does not return an error.
          });

      test.it('shoudl be able to find hidden elements by name', function() {
        driver.get(Pages.formPage);
        driver.findElement(By.name('hidden'));
        // Pass if this does not return an error.
      });
    });

    describe('By.className()', function() {
      test.it('should work', function() {
        driver.get(Pages.xhtmlTestPage);
        driver.findElement(By.className('extraDiv')).
            getText().
            then(function(text) {
              var expected = 'Another div starts here.';
              var actual = text.substring(0, expected.length);
              assert.equal(actual, expected);
            });
      });

      test.it('should work when name is first name among many', function() {
        driver.get(Pages.xhtmlTestPage);
        driver.findElement(By.className('nameA')).
            getText().
            then(function(text) {
              assert.equal(text, 'An H2 title');
            });
      });

      test.it('should work when name is last name among many', function() {
        driver.get(Pages.xhtmlTestPage);
        driver.findElement(By.className('nameC')).
            getText().
            then(function(text) {
              assert.equal(text, 'An H2 title');
            });
      });

      test.it('should work when name is middle of many', function() {
        driver.get(Pages.xhtmlTestPage);
        driver.findElement(By.className('nameBnoise')).
            getText().
            then(function(text) {
              assert.equal(text, 'An H2 title');
            });
      });

      test.it('should work when name surrounded by whitespace', function() {
        driver.get(Pages.xhtmlTestPage);
        driver.findElement(By.className('spaceAround')).
            getText().
            then(function(text) {
              assert.equal(text, 'Spaced out');
            });
      });

      test.it('should fail if queried name only partially matches', function() {
        driver.get(Pages.xhtmlTestPage);
        driver.findElement(By.className('nameB')).
            then(assert.fail, function(e) {
              assert.equal(error.ErrorCode.NO_SUCH_ELEMENT, e.code);
            });
      });

      test.it('should be able to find multiple matches', function() {
        driver.get(Pages.xhtmlTestPage);
        driver.findElements(By.className('nameC')).then(function(elements) {
          assert.ok(elements.length > 1);
        });
      });

      test.it('does not permit compound class names', function() {
        driver.get(Pages.xhtmlTestPage);
        driver.findElement(By.className('a b')).then(assert.fail, pass);
        driver.findElements(By.className('a b')).then(assert.fail, pass);
        function pass() {}
      });
    });

    describe('By.xpath()', function() {
      test.it('should work with multiple matches', function() {
        driver.get(Pages.xhtmlTestPage);
        driver.findElements(By.xpath('//div')).then(function(elements) {
          assert.ok(elements.length > 1, elements.length);
        });
      });

      test.it('should work for selectors using contains keyword', function() {
        driver.get(Pages.nestedPage);
        driver.findElement(By.xpath('//a[contains(., "hello world")]'));
        // Pass if no error.
      });
    });

    describe('By.tagName()', function() {
      test.it('works', function() {
        driver.get(Pages.formPage);
        driver.findElement(By.tagName('input')).getTagName().
            then(function(name) {
              assert.equal(name, 'input');
            });
      });

      test.it('can find multiple elements', function() {
        driver.get(Pages.formPage);
        driver.findElements(By.tagName('input')).then(function(elements) {
          assert.ok(elements.length > 1);
        });
      });
    });

    describe('By.css()', function() {
      test.it('works', function() {
        driver.get(Pages.xhtmlTestPage);
        driver.findElement(By.css('div.content'));
        // Pass if no error.
      });

      test.it('can find multiple elements', function() {
        driver.get(Pages.xhtmlTestPage);
        driver.findElements(By.css('p')).then(function(elements) {
          assert.ok(elements.length > 1);
        });
        // Pass if no error.
      });

      test.it('should be able to find element by compound CSS selector',
        function() {
          driver.get(Pages.xhtmlTestPage);
          assertAttributeIs(
              driver.findElement(By.css('div.extraDiv, div.content')),
              'class', 'content');
        });

      test.it('should be able to find multiple elements by compound selector',
          function() {
            driver.get(Pages.xhtmlTestPage);
            driver.findElements(By.css('div.extraDiv, div.content')).
                then(function(elements) {
                  assertAttributeIs(elements[0], 'class', 'content');
                  assertAttributeIs(elements[1], 'class', 'extraDiv');
                });
          });

      // IE only supports short version option[selected].
      test.ignore(browsers(Browser.IE)).
      it('should be able to find element by boolean attribute', function() {
        driver.get(test.whereIs(
            'locators_tests/boolean_attribute_selected.html'));
        assertAttributeIs(
            driver.findElement(By.css('option[selected="selected"]')),
            'value', 'two');
      });

      test.it(
          'should be able to find element with short ' +
              'boolean attribute selector',
          function() {
            driver.get(test.whereIs(
                'locators_tests/boolean_attribute_selected.html'));
            assertAttributeIs(
                driver.findElement(By.css('option[selected]')), 'value', 'two');
          });

      test.it(
          'should be able to find element with short boolean attribute ' +
              'selector on HTML4 page',
          function() {
            driver.get(test.whereIs(
                'locators_tests/boolean_attribute_selected_html4.html'));
            assertAttributeIs(driver.findElement(By.css('option[selected]')),
                'value', 'two');
          });

      function assertAttributeIs(element, attribute, expected) {
        element.getAttribute(attribute).then(function(attribute) {
          assert.equal(attribute, expected);
        });
      }
    });
  });
});
