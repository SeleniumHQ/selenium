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

goog.provide('webdriver.test.testutil');
goog.provide('webdriver.test.testutil.StubError');

goog.require('goog.array');
goog.require('goog.debug.Error');
goog.require('goog.json');
goog.require('goog.string');
goog.require('goog.testing.recordFunction');
goog.require('webdriver.stacktrace');



/**
 * A custom error used for testing.
 * @param {string=} opt_msg The error message to use.
 * @constructor
 * @extends {goog.debug.Error}
 * @final
 */
webdriver.test.testutil.StubError = function(opt_msg) {
  webdriver.test.testutil.StubError.base(this, 'constructor', opt_msg);
};
goog.inherits(webdriver.test.testutil.StubError, goog.debug.Error);


/** @override */
webdriver.test.testutil.StubError.prototype.name = 'StubError';


/** @type {Array.<!string>} */
webdriver.test.testutil.messages = [];

webdriver.test.testutil.getStackTrace = function() {
  return webdriver.stacktrace.get();
};

webdriver.test.testutil.throwStubError = function() {
  throw new webdriver.test.testutil.StubError;
};

webdriver.test.testutil.assertIsStubError = function(error) {
  assertTrue(error + ' is not an instanceof StubError',
      error instanceof webdriver.test.testutil.StubError);
};


/**
 * Asserts the contents of the {@link webdriver.test.testutil.messages} array
 * are as expected.
 * @param {...*} var_args The expected contents.
 */
webdriver.test.testutil.assertMessages = function(var_args) {
  var args = Array.prototype.slice.call(arguments, 0);
  assertArrayEquals(args, webdriver.test.testutil.messages);
};


/**
 * Wraps a call to {@link webdriver.test.testutil.assertMessages} so it can
 * be passed as a callback.
 * @param {...*} var_args The expected contents.
 * @return {!Function} The wrapped function.
 */
webdriver.test.testutil.assertingMessages = function(var_args) {
  var args = goog.array.slice(arguments, 0);
  return function() {
    return webdriver.test.testutil.assertMessages.apply(null, args);
  };
};


/**
 * Asserts an object is a promise.
 * @param {*} obj The object to check.
 */
webdriver.test.testutil.assertIsPromise = function(obj) {
  assertTrue('Value is not a promise: ' + goog.typeOf(obj),
      webdriver.promise.isPromise(obj));
};


/**
 * Asserts an object is not a promise.
 * @param {*} obj The object to check.
 */
webdriver.test.testutil.assertNotPromise = function(obj) {
  assertFalse(webdriver.promise.isPromise(obj));
};

/**
 * Wraps a function. The wrapped function will have several utility functions:
 * <ul>
 * <li>assertCalled: Asserts that the function was called.
 * <li>assertNotCalled: Asserts that the function was not called.
 * </ul>
 * @param {Function=} opt_fn The function to wrap; defaults to
 *     goog.nullFunction.
 * @return {!Function} The wrapped function.
 * @see goog.testing.recordFunction
 */
webdriver.test.testutil.callbackHelper = function(opt_fn) {
  var callback = goog.testing.recordFunction(opt_fn);

  callback.getExpectedCallCountMessage = function(n, opt_prefix, opt_noJoin) {
    var message = [];
    if (opt_prefix) message.push(opt_prefix);

    var calls = callback.getCalls();
    message.push(
        'Expected to be called ' + n + ' times.',
        '  was called ' + calls.length + ' times:');
    goog.array.forEach(calls, function(call) {
      var e = call.getError();
      if (e) {
        throw e;
      }
    });
    return opt_noJoin ? message : message.join('\n');
  };

  callback.assertCalled = function(opt_message) {
    assertEquals(callback.getExpectedCallCountMessage(1, opt_message),
        1, callback.getCallCount());
  };

  callback.assertNotCalled = function(opt_message) {
    assertEquals(callback.getExpectedCallCountMessage(0, opt_message),
        0, callback.getCallCount());
  };

  return callback;
};


/**
 * Creates a utility for managing a pair of callbacks, capable of asserting only
 * one of the pair was ever called.
 *
 * @param {Function=} opt_callback The callback to manage.
 * @param {Function=} opt_errback The errback to manage.
 */
webdriver.test.testutil.callbackPair = function(opt_callback, opt_errback) {
  var pair = {
    callback: webdriver.test.testutil.callbackHelper(opt_callback),
    errback: webdriver.test.testutil.callbackHelper(opt_errback)
  };

  /** @param {string=} opt_message Optional failure message. */
  pair.assertEither = function(opt_message) {
    if (!pair.callback.getCallCount() &&
        !pair.errback.getCallCount()) {
      var message = ['Neither callback nor errback has been called'];
      if (opt_message) goog.array.insertAt(message, opt_message);
      fail(message.join('\n'));
    }
  };

  /** @param {string=} opt_message Optional failure message. */
  pair.assertNeither = function(opt_message) {
    var message = (opt_message || '') + 'Did not expect callback or errback';
    pair.callback.assertNotCalled(message);
    pair.errback.assertNotCalled(message);
  };

  /** @param {string=} opt_message Optional failure message. */
  pair.assertCallback = function(opt_message) {
    var message = opt_message ? (opt_message + ': ') : '';
    pair.errback.assertNotCalled(message + 'Expected callback, not errback');
    pair.callback.assertCalled(message + 'Callback not called');
  };

  /** @param {string=} opt_message Optional failure message. */
  pair.assertErrback = function(opt_message) {
    var message = opt_message ? (opt_message + ': ') : '';
    pair.callback.assertNotCalled(message + 'Expected errback, not callback');
    pair.errback.assertCalled(message + 'Errback not called');
  };

  pair.reset = function() {
    pair.callback.reset();
    pair.errback.reset();
  };

  return pair;
};


webdriver.test.testutil.assertObjectEquals = function(expected, actual) {
  assertObjectEquals(
      'Expected: ' + goog.json.serialize(expected) + '\n' +
      'Actual:   ' + goog.json.serialize(actual),
      expected, actual);
};
