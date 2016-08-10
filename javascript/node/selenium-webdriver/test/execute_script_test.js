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

var webdriver = require('..'),
    Browser = webdriver.Browser,
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
    driver.get(test.Pages.echoPage);
  });

  describe('executeScript;', function() {
    var shouldHaveFailed = new Error('Should have failed');

    test.it('fails if script throws', function() {
      execute('throw new Error("boom")')
          .then(function() { throw shouldHaveFailed; })
          .catch(function(e) {
            // The java WebDriver server adds a bunch of crap to error messages.
            // Error message will just be "JavaScript error" for IE.
            assert(e.message).matches(/.*(JavaScript error|boom).*/);
          });
    });

    test.it('fails if script does not parse', function() {
      execute('throw function\\*')
          .then(function() { throw shouldHaveFailed; })
          .catch(function(e) {
            assert(e).notEqualTo(shouldHaveFailed);
          });
    });

    describe('scripts;', function() {
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

    describe('return values;', function() {

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

      test.ignore(env.browsers(Browser.IE, Browser.SAFARI)).
      it('can return empty object literal', function() {
        execute('return {}').then(verifyJson({}));
      });

      test.it('can return object literals', function() {
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
        execute('return document.querySelector(".header.host")')
            .then(function(result) {
              assert(result).instanceOf(webdriver.WebElement);
              assert(result.getText()).startsWith('host: ');
            });
      });

      test.it('can return array of dom elements', function() {
        execute('var nodes = document.querySelectorAll(".request,.host");' +
                'return [nodes[0], nodes[1]];')
            .then(function(result) {
              assert(result.length).equalTo(2);

              assert(result[0]).instanceOf(webdriver.WebElement);
              assert(result[0].getText()).startsWith('GET ');

              assert(result[1]).instanceOf(webdriver.WebElement);
              assert(result[1].getText()).startsWith('host: ');
            });
      });

      test.it('can return a NodeList as an array of web elements', function() {
        execute('return document.querySelectorAll(".request,.host");')
            .then(function(result) {
              assert(result.length).equalTo(2);

              assert(result[0]).instanceOf(webdriver.WebElement);
              assert(result[0].getText()).startsWith('GET ');

              assert(result[1]).instanceOf(webdriver.WebElement);
              assert(result[1].getText()).startsWith('host: ');
            });
      });

      test.it('can return object literal with element property', function() {
        execute('return {a: document.body}').then(function(result) {
          assert(result.a).instanceOf(webdriver.WebElement);
          assert(result.a.getTagName()).equalTo('body');
        });
      });
    });

    describe('parameters;', function() {
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

      test.ignore(env.browsers(Browser.FIREFOX)).
      it('can return arguments object as array', function() {
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
        var el = driver.findElement(By.tagName('div'));
        assert(execute('return arguments[0].tagName.toLowerCase();', el))
            .equalTo('div');
      });

      test.it('can pass array containing object literals', function() {
        execute('return arguments[0]', [{color: "red"}]).then(function(result) {
          assert(result.length).equalTo(1);
          assert(result[0].color).equalTo('red');
        });
      });

      test.it('does not modify object literal parameters', function() {
        var input = {color: 'red'};
        execute('return arguments[0];', input).then(verifyJson(input));
      });
    });

    // See https://code.google.com/p/selenium/issues/detail?id=8223.
    describe('issue 8223;', function() {
      describe('using for..in loops;', function() {
        test.it('can return array built from for-loop index', function() {
          execute(function() {
            var ret = [];
            for (var i = 0; i < 3; i++) {
              ret.push(i);
            }
            return ret;
          }).then(verifyJson[0, 1, 2]);
        });

        test.it('can copy input array contents', function() {
          execute(function(input) {
            var ret = [];
            for (var i in input) {
              ret.push(input[i]);
            }
            return ret;
          }, ['fa', 'fe', 'fi']).then(verifyJson(['fa', 'fe', 'fi']));
        });

        test.it('can iterate over input object keys', function() {
          execute(function(thing) {
            var ret = [];
            for (var w in thing.words) {
              ret.push(thing.words[w].word);
            }
            return ret;
          }, {words: [{word: 'fa'}, {word: 'fe'}, {word: 'fi'}]})
          .then(verifyJson(['fa', 'fe', 'fi']));
        });

        describe('recursive functions;', function() {
          test.it('can build array from input', function() {
            var input = ['fa', 'fe', 'fi'];
            execute(function(thearray) {
              var ret = [];
              function build_response(thearray, ret) {
                ret.push(thearray.shift());
                return (!thearray.length && ret
                    || build_response(thearray, ret));
              }
              return build_response(thearray, ret);
            }, input).then(verifyJson(input));
          });

          test.it('can build array from elements in object', function() {
            var input = {words: [{word: 'fa'}, {word: 'fe'}, {word: 'fi'}]};
            execute(function(thing) {
              var ret = [];
              function build_response(thing, ret) {
                var item = thing.words.shift();
                ret.push(item.word);
                return (!thing.words.length && ret
                    || build_response(thing, ret));
              }
              return build_response(thing, ret);
            }, input).then(verifyJson(['fa', 'fe', 'fi']));
          });
        });
      });
    });

    describe('async timeouts', function() {
      var TIMEOUT_IN_MS = 200;
      var ACCEPTABLE_WAIT = TIMEOUT_IN_MS / 10;
      var TOO_LONG_WAIT = TIMEOUT_IN_MS * 10;

      before(function() {
        return driver.manage().timeouts().setScriptTimeout(TIMEOUT_IN_MS)
      });

      test.it('does not fail if script execute in time', function() {
        return executeTimeOutScript(ACCEPTABLE_WAIT);
      });

      test.it('fails if script took too long', function() {
        return executeTimeOutScript(TOO_LONG_WAIT)
          .then(function() {
            fail('it should have timed out');
          }).catch(function(e) {
            assert(e.name).equalTo('ScriptTimeoutError');
          });
      });

      function executeTimeOutScript(sleepTime) {
        return driver.executeAsyncScript(function(sleepTime) {
          var callback = arguments[arguments.length - 1];
          setTimeout(callback, sleepTime)
        }, sleepTime);
      }
    })
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
