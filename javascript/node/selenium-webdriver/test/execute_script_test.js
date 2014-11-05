// Copyright 2014 Selenium committers
// Copyright 2014 Software Freedom Conservancy
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

var path = require('path');

var webdriver = require('..'),
    By = webdriver.By,
    assert = require('../testing/assert'),
    test = require('../lib/test');


test.suite(function(env) {
  var driver;

  test.before(function() {
    driver = env.builder().build();
  });

  test.after(function() {
    driver.quit();
  });

  test.beforeEach(function() {
    driver.get('data:text/html,<html><h1>' + path.basename(__filename) +
        '</h1></html>');
  });

  describe('executeScript', function() {
    var shouldHaveFailed = new Error('Should have failed');

    test.it('fails if script throws', function() {
      execute('throw new Error("boom")')
          .then(function() { throw shoudlHaveFailed; })
          .thenCatch(function(e) {
            // The java WebDriver server adds a bunch of crap to error messages.
            assert(e.message).matches(/.*boom.*/);
          });
    });

    test.it('fails if script does not parse', function() {
      execute('throw function\\*')
          .then(function() { throw shoudlHaveFailed; })
          .thenCatch(function(e) {
            assert(e).not.equalTo(shouldHaveFailed);
          });
    });

    describe('scripts', function() {
      test.it('do not pollute the global scope', function() {
        execute('var x = 1;');
        assert(execute('return typeof x;')).equalTo('undefined');
      });

      test.it('can set global variables', function() {
        execute('window.x = 1234;');
        assert(execute('return x;')).equalTo(1234);
      });

      test.it('may be defined as a function expression', function() {
        assert(execute(function() {
          return 1234 + 'abc';
        })).equalTo('1234abc');
      });
    });

    describe('return values', function() {

      test.it('returns undefined as null', function() {
        assert(execute('var x; return x;')).isNull();
      });

      test.it('can return null', function() {
        assert(execute('return null;')).isNull();
      });

      test.it('can return numbers', function() {
        assert(execute('return 1234')).equalTo(1234);
        assert(execute('return 3.1456')).equalTo(3.1456);
      });

      test.it('can return strings', function() {
        assert(execute('return "hello"')).equalTo('hello');
      });

      test.it('can return booleans', function() {
        assert(execute('return true')).equalTo(true);
        assert(execute('return false')).equalTo(false);
      });

      test.it('can return an array of primitives', function() {
        execute('var x; return [1, false, null, 3.14, x]')
            .then(verifyJson([1, false, null, 3.14, null]));
      });

      test.it('can return nested arrays', function() {
        execute('return [[1, 2, [3]]]')
            .then(verifyJson([[1, 2, [3]]]));
      });

      test.it('can return object literals', function() {
        execute('return {}').then(verifyJson({}));
        execute('return {a: 1, b: false, c: null}').then(function(result) {
          verifyJson(['a', 'b', 'c'])(Object.keys(result).sort());
          assert(result.a).equalTo(1);
          assert(result.b).equalTo(false);
          assert(result.c).isNull();
        });
      });

      test.it('can return complex object literals', function() {
        execute('return {a:{b: "hello"}}').then(verifyJson({a:{b: 'hello'}}));
      });

      test.it('can return dom elements as web elements', function() {
        execute('return document.getElementsByTagName("h1")[0]')
            .then(function(result) {
              assert(result).instanceOf(webdriver.WebElement);
              assert(result.getText()).equalTo(path.basename(__filename));
            });
      });

      test.it('can return array of dom elements', function() {
        driver.get('data:text/html,<!DOCTYPE html>' +
            '<h1>' + path.basename(__filename) + '</h1>' +
            '<h1>Hello, world!</h1>');
        execute('var nodes = document.getElementsByTagName("h1");' +
                'return [nodes[0], nodes[1]];')
            .then(function(result) {
              assert(result.length).equalTo(2);

              assert(result[0]).instanceOf(webdriver.WebElement);
              assert(result[0].getText()).equalTo(path.basename(__filename));

              assert(result[1]).instanceOf(webdriver.WebElement);
              assert(result[1].getText()).equalTo('Hello, world!');
            });
      });

      test.it('can return a NodeList as an array of web elements', function() {
        driver.get('data:text/html,<!DOCTYPE html>' +
            '<h1>' + path.basename(__filename) + '</h1>' +
            '<h1>Hello, world!</h1>');
        execute('return document.getElementsByTagName("h1");')
            .then(function(result) {
              assert(result.length).equalTo(2);

              assert(result[0]).instanceOf(webdriver.WebElement);
              assert(result[0].getText()).equalTo(path.basename(__filename));

              assert(result[1]).instanceOf(webdriver.WebElement);
              assert(result[1].getText()).equalTo('Hello, world!');
            });
      });

      test.it('can return object literal with element property', function() {
        execute('return {a: document.body}').then(function(result) {
          assert(result.a).instanceOf(webdriver.WebElement);
          assert(result.a.getTagName()).equalTo('body');
        });
      });
    });

    describe('parameters', function() {
      test.it('can pass numeric arguments', function() {
        assert(execute('return arguments[0]', 12)).equalTo(12);
        assert(execute('return arguments[0]', 3.14)).equalTo(3.14);
      });

      test.it('can pass boolean arguments', function() {
        assert(execute('return arguments[0]', true)).equalTo(true);
        assert(execute('return arguments[0]', false)).equalTo(false);
      });

      test.it('can pass string arguments', function() {
        assert(execute('return arguments[0]', 'hi')).equalTo('hi');
      });

      test.it('can pass null arguments', function() {
        assert(execute('return arguments[0] === null', null)).equalTo(true);
        assert(execute('return arguments[0]', null)).equalTo(null);
      });

      test.it('passes undefined as a null argument', function() {
        var x;
        assert(execute('return arguments[0] === null', x)).equalTo(true);
        assert(execute('return arguments[0]', x)).equalTo(null);
      });

      test.it('can pass multiple arguments', function() {
        assert(execute('return arguments.length')).equalTo(0);
        assert(execute('return arguments.length', 1, 'a', false)).equalTo(3);
      });

      test.it('can return arguments object as array', function() {
        execute('return arguments', 1, 'a', false).then(function(val) {
          assert(val.length).equalTo(3);
          assert(val[0]).equalTo(1);
          assert(val[1]).equalTo('a');
          assert(val[2]).equalTo(false);
        });
      });

      test.it('can pass object literal', function() {
        execute(
            'return [typeof arguments[0], arguments[0].a]', {a: 'hello'})
            .then(function(result) {
              assert(result[0]).equalTo('object');
              assert(result[1]).equalTo('hello');
            });
      });

      test.it('WebElement arguments are passed as DOM elements', function() {
        var el = driver.findElement(By.tagName('h1'));
        assert(execute('return arguments[0].tagName.toLowerCase();', el))
            .equalTo('h1');
      });

      test.it('can pass array containing object literals', function() {
        execute('return arguments[0]', [{color: "red"}]).then(function(result) {
          assert(result.length).equalTo(1);
          assert(result[0].color).equalTo('red');
        });
      });
    });
  });

  function verifyJson(expected) {
    return function(actual) {
      assert(JSON.stringify(actual)).equalTo(JSON.stringify(expected));
    };
  }

  function execute() {
    return driver.executeScript.apply(driver, arguments);
  }
});
