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

const assert = require('assert');
const {fail} = require('assert');

const {Browser, By, WebElement, error} = require('..');
const {Pages, ignore, suite} = require('../lib/test');


suite(function(env) {
  var driver;

  before(async function() {
    driver = await env.builder().build();
  });

  after(function() {
    return driver.quit();
  });

  beforeEach(function() {
    return driver.get(Pages.echoPage);
  });

  describe('executeScript;', function() {
    var shouldHaveFailed = new Error('Should have failed');

    it('fails if script throws', function() {
      return execute('throw new Error("boom")')
          .then(function() { throw shouldHaveFailed; })
          .catch(function(e) {
            // The java WebDriver server adds a bunch of crap to error messages.
            // Error message will just be "JavaScript error" for IE.
            assert.ok(
                /.*(JavaScript error|boom).*/.test(e.message),
                `Unexpected error: ${e.message}`);
          });
    });

    it('fails if script does not parse', function() {
      return execute('throw function\\*')
          .then(function() { throw shouldHaveFailed; })
          .catch(function(e) {
            assert.notEqual(e, shouldHaveFailed);
          });
    });

    describe('scripts;', function() {
      it('do not pollute the global scope', async function() {
        await execute('var x = 1;');
        assert.equal(await execute('return typeof x;'), 'undefined');
      });

      it('can set global variables', async function() {
        await execute('window.x = 1234;');
        assert.equal(await execute('return x;'), 1234);
      });

      it('may be defined as a function expression', async function() {
        let result = await execute(function() {
          return 1234 + 'abc';
        });
        assert.equal(result, '1234abc');
      });
    });

    describe('return values;', function() {

      it('returns undefined as null', async function() {
        assert.strictEqual(await execute('var x; return x;'), null);
      });

      it('can return null', async function() {
        assert.strictEqual(await execute('return null;'), null);
      });

      it('can return numbers', async function() {
        assert.equal(await execute('return 1234'), 1234);
        assert.equal(await execute('return 3.1456'), 3.1456);
      });

      it('can return strings', async function() {
        assert.equal(await execute('return "hello"'), 'hello');
      });

      it('can return booleans', async function() {
        assert.equal(await execute('return true'), true);
        assert.equal(await execute('return false'), false);
      });

      it('can return an array of primitives', function() {
        return execute('var x; return [1, false, null, 3.14, x]')
            .then(verifyJson([1, false, null, 3.14, null]));
      });

      it('can return nested arrays', function() {
        return execute('return [[1, 2, [3]]]').then(verifyJson([[1, 2, [3]]]));
      });

      ignore(env.browsers(Browser.IE)).
      it('can return empty object literal', function() {
        return execute('return {}').then(verifyJson({}));
      });

      it('can return object literals', function() {
        return execute('return {a: 1, b: false, c: null}').then(result => {
          verifyJson(['a', 'b', 'c'])(Object.keys(result).sort());
          assert.equal(result.a, 1);
          assert.equal(result.b, false);
          assert.strictEqual(result.c, null);
        });
      });

      it('can return complex object literals', function() {
        return execute('return {a:{b: "hello"}}')
            .then(verifyJson({a:{b: 'hello'}}));
      });

      it('can return dom elements as web elements', async function() {
        let result =
            await execute('return document.querySelector(".header.host")');
        assert.ok(result instanceof WebElement);

        let text = await result.getText();
        assert.ok(text.startsWith('host: '), `got: ${text}`);
      });

      it('can return array of dom elements', async function() {
        let result = await execute(
            'var nodes = document.querySelectorAll(".request,.host");' +
            'return [nodes[0], nodes[1]];');
        assert.equal(result.length, 2);

        assert.ok(result[0] instanceof WebElement);
        assert.ok((await result[0].getText()).startsWith('GET '));;

        assert.ok(result[1] instanceof WebElement);
        assert.ok((await result[1].getText()).startsWith('host: '));;
      });

      it('can return a NodeList as an array of web elements', async function() {
        let result =
            await execute('return document.querySelectorAll(".request,.host");')

        assert.equal(result.length, 2);

        assert.ok(result[0] instanceof WebElement);
        assert.ok((await result[0].getText()).startsWith('GET '));;

        assert.ok(result[1] instanceof WebElement);
        assert.ok((await result[1].getText()).startsWith('host: '));;
      });

      it('can return object literal with element property', async function() {
        let result = await execute('return {a: document.body}');

        assert.ok(result.a instanceof WebElement);
        assert.equal((await result.a.getTagName()).toLowerCase(), 'body');
      });
    });

    describe('parameters;', function() {
      it('can pass numeric arguments', async function() {
        assert.equal(await execute('return arguments[0]', 12), 12);
        assert.equal(await execute('return arguments[0]', 3.14), 3.14);
      });

      it('can pass boolean arguments', async function() {
        assert.equal(await execute('return arguments[0]', true), true);
        assert.equal(await execute('return arguments[0]', false), false);
      });

      it('can pass string arguments', async function() {
        assert.equal(await execute('return arguments[0]', 'hi'), 'hi');
      });

      it('can pass null arguments', async function() {
        assert.equal(await execute('return arguments[0] === null', null), true);
        assert.equal(await execute('return arguments[0]', null), null);
      });

      it('passes undefined as a null argument', async function() {
        var x;
        assert.equal(await execute('return arguments[0] === null', x), true);
        assert.equal(await execute('return arguments[0]', x), null);
      });

      it('can pass multiple arguments', async function() {
        assert.equal(await execute('return arguments.length'), 0);
        assert.equal(await execute('return arguments.length', 1, 'a', false), 3);
      });

      ignore(env.browsers(Browser.FIREFOX, Browser.SAFARI)).
      it('can return arguments object as array', async function() {
        let val = await execute('return arguments', 1, 'a', false);

        assert.equal(val.length, 3);
        assert.equal(val[0], 1);
        assert.equal(val[1], 'a');
        assert.equal(val[2], false);
      });

      it('can pass object literal', async function() {
        let result = await execute(
            'return [typeof arguments[0], arguments[0].a]', {a: 'hello'})
        assert.equal(result[0], 'object');
        assert.equal(result[1], 'hello');
      });

      it('WebElement arguments are passed as DOM elements', async function() {
        let el = await driver.findElement(By.tagName('div'));
        let result =
            await execute('return arguments[0].tagName.toLowerCase();', el);
        assert.equal(result, 'div');
      });

      it('can pass array containing object literals', async function() {
        let result = await execute('return arguments[0]', [{color: "red"}]);
        assert.equal(result.length, 1);
        assert.equal(result[0].color, 'red');
      });

      it('does not modify object literal parameters', function() {
        var input = {color: 'red'};
        return execute('return arguments[0];', input).then(verifyJson(input));
      });
    });

    // See https://code.google.com/p/selenium/issues/detail?id=8223.
    describe('issue 8223;', function() {
      describe('using for..in loops;', function() {
        it('can return array built from for-loop index', function() {
          return execute(function() {
            var ret = [];
            for (var i = 0; i < 3; i++) {
              ret.push(i);
            }
            return ret;
          }).then(verifyJson[0, 1, 2]);
        });

        it('can copy input array contents', function() {
          return execute(function(input) {
            var ret = [];
            for (var i in input) {
              ret.push(input[i]);
            }
            return ret;
          }, ['fa', 'fe', 'fi']).then(verifyJson(['fa', 'fe', 'fi']));
        });

        it('can iterate over input object keys', function() {
          return execute(function(thing) {
            var ret = [];
            for (var w in thing.words) {
              ret.push(thing.words[w].word);
            }
            return ret;
          }, {words: [{word: 'fa'}, {word: 'fe'}, {word: 'fi'}]})
          .then(verifyJson(['fa', 'fe', 'fi']));
        });

        describe('recursive functions;', function() {
          it('can build array from input', function() {
            var input = ['fa', 'fe', 'fi'];
            return execute(function(thearray) {
              var ret = [];
              function build_response(thearray, ret) {
                ret.push(thearray.shift());
                return (!thearray.length && ret
                    || build_response(thearray, ret));
              }
              return build_response(thearray, ret);
            }, input).then(verifyJson(input));
          });

          it('can build array from elements in object', function() {
            var input = {words: [{word: 'fa'}, {word: 'fe'}, {word: 'fi'}]};
            return execute(function(thing) {
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
        return driver.manage().setTimeouts({script: TIMEOUT_IN_MS});
      });

      it('does not fail if script execute in time', function() {
        return executeTimeOutScript(ACCEPTABLE_WAIT);
      });

      it('fails if script took too long', function() {
        return executeTimeOutScript(TOO_LONG_WAIT)
          .then(function() {
            fail('it should have timed out');
          }).catch(function(e) {
            if (env.browser.name === Browser.SAFARI) {
              assert.equal(e.name, error.TimeoutError.name);
            } else {
              assert.equal(e.name, error.ScriptTimeoutError.name);
            }
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
      assert.equal(JSON.stringify(actual), JSON.stringify(expected));
    };
  }

  function execute() {
    return driver.executeScript.apply(driver, arguments);
  }
});
