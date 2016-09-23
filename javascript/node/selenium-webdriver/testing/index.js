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

/**
 * @fileoverview Provides wrappers around the following global functions from
 * [Mocha's BDD interface](https://github.com/mochajs/mocha):
 *
 * - after
 * - afterEach
 * - before
 * - beforeEach
 * - it
 * - it.only
 * - it.skip
 * - xit
 *
 * The provided wrappers leverage the {@link webdriver.promise.ControlFlow}
 * to simplify writing asynchronous tests:
 *
 *     var By = require('selenium-webdriver').By,
 *         until = require('selenium-webdriver').until,
 *         firefox = require('selenium-webdriver/firefox'),
 *         test = require('selenium-webdriver/testing');
 *
 *     test.describe('Google Search', function() {
 *       var driver;
 *
 *       test.before(function() {
 *         driver = new firefox.Driver();
 *       });
 *
 *       test.after(function() {
 *         driver.quit();
 *       });
 *
 *       test.it('should append query to title', function() {
 *         driver.get('http://www.google.com/ncr');
 *         driver.findElement(By.name('q')).sendKeys('webdriver');
 *         driver.findElement(By.name('btnG')).click();
 *         driver.wait(until.titleIs('webdriver - Google Search'), 1000);
 *       });
 *     });
 *
 * You may conditionally suppress a test function using the exported
 * "ignore" function. If the provided predicate returns true, the attached
 * test case will be skipped:
 *
 *     test.ignore(maybe()).it('is flaky', function() {
 *       if (Math.random() < 0.5) throw Error();
 *     });
 *
 *     function maybe() { return Math.random() < 0.5; }
 */

'use strict';

var promise = require('..').promise;
var flow = promise.controlFlow();


/**
 * Wraps a function so that all passed arguments are ignored.
 * @param {!Function} fn The function to wrap.
 * @return {!Function} The wrapped function.
 */
function seal(fn) {
  return function() {
    fn();
  };
}


/**
 * Wraps a function on Mocha's BDD interface so it runs inside a
 * webdriver.promise.ControlFlow and waits for the flow to complete before
 * continuing.
 * @param {!Function} globalFn The function to wrap.
 * @return {!Function} The new function.
 */
function wrapped(globalFn) {
  return function() {
    if (arguments.length === 1) {
      return globalFn(wrapArgument(arguments[0]));

    } else if (arguments.length === 2) {
      return globalFn(arguments[0], wrapArgument(arguments[1]));

    } else {
      throw Error('Invalid # arguments: ' + arguments.length);
    }
  };
}


function wrapArgument(value) {
  if (typeof value === 'function') {
    return makeAsyncTestFn(value);
  }
  return value;
}


/**
 * Make a wrapper to invoke caller's test function, fn.  Run the test function
 * within a ControlFlow.
 *
 * Should preserve the semantics of Mocha's Runnable.prototype.run (See
 * https://github.com/mochajs/mocha/blob/master/lib/runnable.js#L192)
 *
 * @param {Function} fn
 * @return {Function}
 */
function makeAsyncTestFn(fn) {
  var async = fn.length > 0; // if test function expects a callback, its "async"

  var ret = /** @type {function(this: mocha.Context)}*/ (function(done) {
    var runnable = this.runnable();
    var mochaCallback = runnable.callback;
    runnable.callback = function() {
      flow.reset();
      return mochaCallback.apply(this, arguments);
    };

    var testFn = fn.bind(this);
    flow.execute(function controlFlowExecute() {
      return new promise.Promise(function(fulfill, reject) {
        if (async) {
          // If testFn is async (it expects a done callback), resolve the promise of this
          // test whenever that callback says to.  Any promises returned from testFn are
          // ignored.
          testFn(function testFnDoneCallback(err) {
            if (err) {
              reject(err);
            } else {
              fulfill();
            }
          });
        } else {
          // Without a callback, testFn can return a promise, or it will
          // be assumed to have completed synchronously
          fulfill(testFn());
        }
      }, flow);
    }, runnable.fullTitle()).then(seal(done), done);
  });

  ret.toString = function() {
    return fn.toString();
  };

  return ret;
}


/**
 * Ignores the test chained to this function if the provided predicate returns
 * true.
 * @param {function(): boolean} predicateFn A predicate to call to determine
 *     if the test should be suppressed. This function MUST be synchronous.
 * @return {!Object} An object with wrapped versions of {@link #it()} and
 *     {@link #describe()} that ignore tests as indicated by the predicate.
 */
function ignore(predicateFn) {
  var describe = wrap(exports.xdescribe, exports.describe);
  describe.only = wrap(exports.xdescribe, exports.describe.only);

  var it = wrap(exports.xit, exports.it);
  it.only = wrap(exports.xit, exports.it.only);

  return {
    describe: describe,
    it: it
  };

  function wrap(onSkip, onRun) {
    return function(title, fn) {
      if (predicateFn()) {
        onSkip(title, fn);
      } else {
        onRun(title, fn);
      }
    };
  }
}


/**
 * @param {string} name
 * @return {!Function}
 * @throws {TypeError}
 */
function getMochaGlobal(name) {
  let fn = global[name];
  let type = typeof fn;
  if (type !== 'function') {
    throw TypeError(
        `Expected global.${name} to be a function, but is ${type}. `
            + 'This can happen if you try using this module when running '
            + 'with node directly instead of using the mocha executable');
  }
  return fn;
}


const WRAPPED = {
  after: null,
  afterEach: null,
  before: null,
  beforeEach: null,
  it: null,
  itOnly: null,
  xit: null
};


function wrapIt() {
  if (!WRAPPED.it) {
    let it = getMochaGlobal('it');
    WRAPPED.it = wrapped(it);
    WRAPPED.itOnly = wrapped(it.only);
  }
}



// PUBLIC API


/**
 * @return {!promise.ControlFlow} the control flow instance used by this module
 *     to coordinate test actions.
 */
exports.controlFlow = function(){
  return flow;
};


/**
 * Registers a new test suite.
 * @param {string} name The suite name.
 * @param {function()=} opt_fn The suite function, or `undefined` to define
 *     a pending test suite.
 */
exports.describe = function(name, opt_fn) {
  let fn = getMochaGlobal('describe');
  return opt_fn ? fn(name, opt_fn) : fn(name);
};


/**
 * Defines a suppressed test suite.
 * @param {string} name The suite name.
 * @param {function()=} opt_fn The suite function, or `undefined` to define
 *     a pending test suite.
 */
exports.describe.skip = function(name, opt_fn) {
  let fn = getMochaGlobal('describe');
  return opt_fn ? fn.skip(name, opt_fn) : fn.skip(name);
};


/**
 * Defines a suppressed test suite.
 * @param {string} name The suite name.
 * @param {function()=} opt_fn The suite function, or `undefined` to define
 *     a pending test suite.
 */
exports.xdescribe = function(name, opt_fn) {
  let fn = getMochaGlobal('xdescribe');
  return opt_fn ? fn(name, opt_fn) : fn(name);
};


/**
 * Register a function to call after the current suite finishes.
 * @param {function()} fn .
 */
exports.after = function(fn) {
  if (!WRAPPED.after) {
    WRAPPED.after = wrapped(getMochaGlobal('after'));
  }
  WRAPPED.after(fn);
};


/**
 * Register a function to call after each test in a suite.
 * @param {function()} fn .
 */
exports.afterEach = function(fn) {
  if (!WRAPPED.afterEach) {
    WRAPPED.afterEach = wrapped(getMochaGlobal('afterEach'));
  }
  WRAPPED.afterEach(fn);
};


/**
 * Register a function to call before the current suite starts.
 * @param {function()} fn .
 */
exports.before = function(fn) {
  if (!WRAPPED.before) {
    WRAPPED.before = wrapped(getMochaGlobal('before'));
  }
  WRAPPED.before(fn);
};

/**
 * Register a function to call before each test in a suite.
 * @param {function()} fn .
 */
exports.beforeEach = function(fn) {
  if (!WRAPPED.beforeEach) {
    WRAPPED.beforeEach = wrapped(getMochaGlobal('beforeEach'));
  }
  WRAPPED.beforeEach(fn);
};

/**
 * Add a test to the current suite.
 * @param {string} name The test name.
 * @param {function()=} opt_fn The test function, or `undefined` to define
 *     a pending test case.
 */
exports.it = function(name, opt_fn) {
  wrapIt();
  if (opt_fn) {
    WRAPPED.it(name, opt_fn);
  } else {
    WRAPPED.it(name);
  }
};

/**
 * An alias for {@link #it()} that flags the test as the only one that should
 * be run within the current suite.
 * @param {string} name The test name.
 * @param {function()=} opt_fn The test function, or `undefined` to define
 *     a pending test case.
 */
exports.it.only = function(name, opt_fn) {
  wrapIt();
  if (opt_fn) {
    WRAPPED.itOnly(name, opt_fn);
  } else {
    WRAPPED.itOnly(name);
  }
};


/**
 * Adds a test to the current suite while suppressing it so it is not run.
 * @param {string} name The test name.
 * @param {function()=} opt_fn The test function, or `undefined` to define
 *     a pending test case.
 */
exports.xit = function(name, opt_fn) {
  if (!WRAPPED.xit) {
    WRAPPED.xit = wrapped(getMochaGlobal('xit'));
  }
  if (opt_fn) {
    WRAPPED.xit(name, opt_fn);
  } else {
    WRAPPED.xit(name);
  }
};


exports.it.skip = exports.xit;
exports.ignore = ignore;
