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

const By = require('../../lib/by').By;
const CommandName = require('../../lib/command').Name;
const error = require('../../lib/error');
const promise = require('../../lib/promise');
const until = require('../../lib/until');
const webdriver = require('../../lib/webdriver'),
      WebElement = webdriver.WebElement;

describe('until', function() {
  let driver, executor;

  class TestExecutor {
    constructor() {
      this.handlers_ = {};
    }

    on(cmd, handler) {
      this.handlers_[cmd] = handler;
      return this;
    }

    execute(cmd) {
      let self = this;
      return Promise.resolve().then(function() {
        if (!self.handlers_[cmd.getName()]) {
          throw new error.UnknownCommandError(cmd.getName());
        }
        return self.handlers_[cmd.getName()](cmd);
      });
    }
  }

  function fail(opt_msg) {
    throw new assert.AssertionError({message: opt_msg});
  }

  beforeEach(function setUp() {
    executor = new TestExecutor();
    driver = new webdriver.WebDriver('session-id', executor);
  });

  describe('ableToSwitchToFrame', function() {
    it('failsFastForNonSwitchErrors', function() {
      let e = Error('boom');
      executor.on(CommandName.SWITCH_TO_FRAME, function() {
        throw e;
      });
      return driver.wait(until.ableToSwitchToFrame(0), 100)
          .then(fail, (e2) => assert.strictEqual(e2, e));
    });

    it('byIndex', function() {
      executor.on(CommandName.SWITCH_TO_FRAME, () => true);
      return driver.wait(until.ableToSwitchToFrame(0), 100);
    });

    it('byWebElement', function() {
      executor.on(CommandName.SWITCH_TO_FRAME, () => true);
      var el = new webdriver.WebElement(driver, {ELEMENT: 1234});
      return driver.wait(until.ableToSwitchToFrame(el), 100);
    });

    it('byWebElementPromise', function() {
      executor.on(CommandName.SWITCH_TO_FRAME, () => true);
      var el = new webdriver.WebElementPromise(driver,
          promise.fulfilled(new webdriver.WebElement(driver, {ELEMENT: 1234})));
      return driver.wait(until.ableToSwitchToFrame(el), 100);
    });

    it('byLocator', function() {
      executor.on(CommandName.FIND_ELEMENTS, () => [WebElement.buildId(1234)]);
      executor.on(CommandName.SWITCH_TO_FRAME, () => true);
      return driver.wait(until.ableToSwitchToFrame(By.id('foo')), 100);
    });

    it('byLocator_elementNotInitiallyFound', function() {
      var foundResponses = [[], [], [WebElement.buildId(1234)]];
      executor.on(CommandName.FIND_ELEMENTS, () => foundResponses.shift());
      executor.on(CommandName.SWITCH_TO_FRAME, () => true);

      return driver.wait(until.ableToSwitchToFrame(By.id('foo')), 2000)
          .then(function() {
            assert.equal(foundResponses.length, 0);
          });
    });

    it('timesOutIfNeverAbletoSwitchFrames', function() {
      var count = 0;
      executor.on(CommandName.SWITCH_TO_FRAME, function() {
        count += 1;
        throw new error.NoSuchFrameError;
      });

      return driver.wait(until.ableToSwitchToFrame(0), 100)
          .then(fail, function(e) {
            assert.ok(count > 0);
            assert.ok(
                e.message.startsWith('Waiting to be able to switch to frame'),
                'Wrong message: ' + e.message);
          });
    });
  });

  describe('alertIsPresent', function() {
    it('failsFastForNonAlertSwitchErrors', function() {
      return driver.wait(until.alertIsPresent(), 100).then(fail, function(e) {
        assert.ok(e instanceof error.UnknownCommandError);
        assert.equal(e.message, CommandName.GET_ALERT_TEXT);
      });
    });

    it('waitsForAlert', function() {
      var count = 0;
      executor.on(CommandName.GET_ALERT_TEXT, function() {
        if (count++ < 3) {
          throw new error.NoSuchAlertError;
        } else {
          return true;
        }
      }).on(CommandName.DISMISS_ALERT, () => true);

      return driver.wait(until.alertIsPresent(), 1000).then(function(alert) {
        assert.equal(count, 4);
        return alert.dismiss();
      });
    });

    // TODO: Remove once GeckoDriver doesn't throw this unwanted error.
    // See https://github.com/SeleniumHQ/selenium/pull/2137
    describe('workaround for GeckoDriver', function() {
      it('doesNotFailWhenCannotConvertNullToObject', function() {
        var count = 0;
        executor.on(CommandName.GET_ALERT_TEXT, function() {
          if (count++ < 3) {
            throw new error.WebDriverError(`can't convert null to object`);
          } else {
            return true;
          }
        }).on(CommandName.DISMISS_ALERT, () => true);

        return driver.wait(until.alertIsPresent(), 1000).then(function(alert) {
          assert.equal(count, 4);
          return alert.dismiss();
        });
      });

      it('keepsRaisingRegularWebdriverError', function() {
        var webDriverError = new error.WebDriverError;

        executor.on(CommandName.GET_ALERT_TEXT, function() {
          throw webDriverError;
        });

        return driver.wait(until.alertIsPresent(), 1000).then(function() {
          throw new Error('driver did not fail against WebDriverError');
        }, function(error) {
          assert.equal(error, webDriverError);
        });
      })
    });
  });

  it('testUntilTitleIs', function() {
    var titles = ['foo', 'bar', 'baz'];
    executor.on(CommandName.GET_TITLE, () => titles.shift());

    return driver.wait(until.titleIs('bar'), 3000).then(function() {
      assert.deepStrictEqual(titles, ['baz']);
    });
  });

  it('testUntilTitleContains', function() {
    var titles = ['foo', 'froogle', 'google'];
    executor.on(CommandName.GET_TITLE, () => titles.shift());

    return driver.wait(until.titleContains('oogle'), 3000).then(function() {
      assert.deepStrictEqual(titles, ['google']);
    });
  });

  it('testUntilTitleMatches', function() {
    var titles = ['foo', 'froogle', 'aaaabc', 'aabbbc', 'google'];
    executor.on(CommandName.GET_TITLE, () => titles.shift());

    return driver.wait(until.titleMatches(/^a{2,3}b+c$/), 3000)
        .then(function() {
          assert.deepStrictEqual(titles, ['google']);
        });
  });

  it('testUntilUrlIs', function() {
    var urls = ['http://www.foo.com', 'https://boo.com', 'http://docs.yes.com'];
    executor.on(CommandName.GET_CURRENT_URL, () => urls.shift());

    return driver.wait(until.urlIs('https://boo.com'), 3000).then(function() {
      assert.deepStrictEqual(urls, ['http://docs.yes.com']);
    });
  });

  it('testUntilUrlContains', function() {
    var urls =
        ['http://foo.com', 'https://groups.froogle.com', 'http://google.com'];
    executor.on(CommandName.GET_CURRENT_URL, () => urls.shift());

    return driver.wait(until.urlContains('oogle.com'), 3000).then(function() {
      assert.deepStrictEqual(urls, ['http://google.com']);
    });
  });

  it('testUntilUrlMatches', function() {
    var urls = ['foo', 'froogle', 'aaaabc', 'aabbbc', 'google'];
    executor.on(CommandName.GET_CURRENT_URL, () => urls.shift());

    return driver.wait(until.urlMatches(/^a{2,3}b+c$/), 3000)
        .then(function() {
          assert.deepStrictEqual(urls, ['google']);
        });
  });

  it('testUntilElementLocated', function() {
    var responses = [
        [],
        [WebElement.buildId('abc123'), WebElement.buildId('foo')],
        ['end']
    ];
    executor.on(CommandName.FIND_ELEMENTS, () => responses.shift());

    let element = driver.wait(until.elementLocated(By.id('quux')), 2000);
    assert.ok(element instanceof webdriver.WebElementPromise);
    return element.getId().then(function(id) {
      assert.deepStrictEqual(responses, [['end']]);
      assert.equal(id, 'abc123');
    });
  });

  describe('untilElementLocated, elementNeverFound', function() {
    function runNoElementFoundTest(locator, locatorStr) {
      executor.on(CommandName.FIND_ELEMENTS, () => []);

      function expectedFailure() {
        fail('expected condition to timeout');
      }

      return driver.wait(until.elementLocated(locator), 100)
          .then(expectedFailure, function(error) {
            var expected = 'Waiting for element to be located ' + locatorStr;
            var lines = error.message.split(/\n/, 2);
            assert.equal(lines[0], expected);

            let regex = /^Wait timed out after \d+ms$/;
            assert.ok(regex.test(lines[1]),
                `Lines <${lines[1]}> does not match ${regex}`);
          });
    }

    it('byLocator', function() {
      return runNoElementFoundTest(
          By.id('quux'), 'By(css selector, *[id="quux"])');
    });

    it('byHash', function() {
      return runNoElementFoundTest(
          {id: 'quux'}, 'By(css selector, *[id="quux"])');
    });

    it('byFunction', function() {
      return runNoElementFoundTest(function() {}, 'by function()');
    });
  });

  it('testUntilElementsLocated', function() {
    var responses = [
        [],
        [WebElement.buildId('abc123'), WebElement.buildId('foo')],
        ['end']
    ];
    executor.on(CommandName.FIND_ELEMENTS, () => responses.shift());

    return driver.wait(until.elementsLocated(By.id('quux')), 2000)
        .then(function(els) {
          return Promise.all(els.map(e => e.getId()));
        }).then(function(ids) {
          assert.deepStrictEqual(responses, [['end']]);
          assert.equal(ids.length, 2);
          assert.equal(ids[0], 'abc123');
          assert.equal(ids[1], 'foo');
        });
  });

  describe('untilElementsLocated, noElementsFound', function() {
    function runNoElementsFoundTest(locator, locatorStr) {
      executor.on(CommandName.FIND_ELEMENTS, () => []);

      function expectedFailure() {
        fail('expected condition to timeout');
      }

      return driver.wait(until.elementsLocated(locator), 100)
          .then(expectedFailure, function(error) {
            var expected =
                'Waiting for at least one element to be located ' + locatorStr;
            var lines = error.message.split(/\n/, 2);
            assert.equal(lines[0], expected);

            let regex = /^Wait timed out after \d+ms$/;
            assert.ok(regex.test(lines[1]),
                `Lines <${lines[1]}> does not match ${regex}`);
          });
    }

    it('byLocator', function() {
      return runNoElementsFoundTest(
          By.id('quux'), 'By(css selector, *[id="quux"])');
    });

    it('byHash', function() {
      return runNoElementsFoundTest(
          {id: 'quux'}, 'By(css selector, *[id="quux"])');
    });

    it('byFunction', function() {
      return runNoElementsFoundTest(function() {}, 'by function()');
    });
  });

  it('testUntilStalenessOf', function() {
    let count = 0;
    executor.on(CommandName.GET_ELEMENT_TAG_NAME, function() {
      while (count < 3) {
        count += 1;
        return 'body';
      }
      throw new error.StaleElementReferenceError('now stale');
    });

    var el = new webdriver.WebElement(driver, {ELEMENT: 'foo'});
    return driver.wait(until.stalenessOf(el), 2000)
        .then(() => assert.equal(count, 3));
  });

  describe('element state conditions', function() {
    function runElementStateTest(predicate, command, responses, var_args) {
      let original = new webdriver.WebElement(driver, 'foo');
      let predicateArgs = [original];
      if (arguments.length > 3) {
        predicateArgs = predicateArgs.concat(arguments[1]);
        command = arguments[2];
        responses = arguments[3];
      }

      assert.ok(responses.length > 1);

      responses = responses.concat(['end']);
      executor.on(command, () => responses.shift());

      let result = driver.wait(predicate.apply(null, predicateArgs), 2000);
      assert.ok(result instanceof webdriver.WebElementPromise);
      return result.then(function(value) {
        assert.ok(value instanceof webdriver.WebElement);
        assert.ok(!(value instanceof webdriver.WebElementPromise));
        return value.getId();
      }).then(function(id) {
        assert.equal('foo', id);
        assert.deepStrictEqual(responses, ['end']);
      });
    }

    it('elementIsVisible', function() {
      return runElementStateTest(
          until.elementIsVisible,
          CommandName.IS_ELEMENT_DISPLAYED, [false, false, true]);
    });

    it('elementIsNotVisible', function() {
      return runElementStateTest(
          until.elementIsNotVisible,
          CommandName.IS_ELEMENT_DISPLAYED, [true, true, false]);
    });

    it('elementIsEnabled', function() {
      return runElementStateTest(
          until.elementIsEnabled,
          CommandName.IS_ELEMENT_ENABLED, [false, false, true]);
    });

    it('elementIsDisabled', function() {
      return runElementStateTest(
          until.elementIsDisabled,
          CommandName.IS_ELEMENT_ENABLED, [true, true, false]);
    });

    it('elementIsSelected', function() {
      return runElementStateTest(
          until.elementIsSelected,
          CommandName.IS_ELEMENT_SELECTED, [false, false, true]);
    });

    it('elementIsNotSelected', function() {
      return runElementStateTest(
          until.elementIsNotSelected,
          CommandName.IS_ELEMENT_SELECTED, [true, true, false]);
    });

    it('elementTextIs', function() {
      return runElementStateTest(
          until.elementTextIs, 'foobar',
          CommandName.GET_ELEMENT_TEXT,
          ['foo', 'fooba', 'foobar']);
    });

    it('elementTextContains', function() {
      return runElementStateTest(
          until.elementTextContains, 'bar',
          CommandName.GET_ELEMENT_TEXT,
          ['foo', 'foobaz', 'foobarbaz']);
    });

    it('elementTextMatches', function() {
      return runElementStateTest(
          until.elementTextMatches, /fo+bar{3}/,
          CommandName.GET_ELEMENT_TEXT,
          ['foo', 'foobar', 'fooobarrr']);
    });
  });

  describe('WebElementCondition', function() {
    it('fails if wait completes with a non-WebElement value', function() {
      let result = driver.wait(
          new webdriver.WebElementCondition('testing', () => 123), 1000);

      return result.then(
          () => assert.fail('expected to fail'),
          function(e) {
            assert.ok(e instanceof TypeError);
            assert.equal(
                'WebElementCondition did not resolve to a WebElement: '
                    + '[object Number]',
                e.message);
          });
    });
  });
});
