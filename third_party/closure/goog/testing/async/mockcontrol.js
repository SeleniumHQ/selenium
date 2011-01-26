// Copyright 2010 The Closure Library Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview A wrapper for MockControl that provides mocks and assertions
 * for testing asynchronous code. All assertions will only be verified when
 * $verifyAll is called on the wrapped MockControl.
 *
 * This class is meant primarily for testing code that exposes asynchronous APIs
 * without being truly asynchronous (using asynchronous primitives like browser
 * events or timeouts). This is often the case when true asynchronous
 * depedencies have been mocked out. This means that it doesn't rely on
 * AsyncTestCase or DeferredTestCase, although it can be used with those as
 * well.
 *
 * Example usage:
 *
 * <pre>
 * var mockControl = new goog.testing.MockControl();
 * var asyncMockControl = new goog.testing.async.MockControl(mockControl);
 *
 * myAsyncObject.onSuccess(asyncMockControl.asyncAssertEquals(
 *     'callback should run and pass the correct value',
 *     'http://someurl.com');
 * asyncMockControl.assertDeferredEquals(
 *     'deferred object should be resolved with the correct value',
 *     'http://someurl.com',
 *     myAsyncObject.getDeferredUrl());
 * asyncMockControl.run();
 * mockControl.$verifyAll();
 * </pre>
 *
 */


goog.provide('goog.testing.async.MockControl');

goog.require('goog.asserts');
goog.require('goog.async.Deferred');
goog.require('goog.debug');
goog.require('goog.testing.asserts');
goog.require('goog.testing.mockmatchers.IgnoreArgument');



/**
 * Provides asynchronous mocks and assertions controlled by a parent
 * MockControl.
 *
 * @param {goog.testing.MockControl} mockControl The parent MockControl.
 * @constructor
 */
goog.testing.async.MockControl = function(mockControl) {
  /**
   * The parent MockControl.
   * @type {goog.testing.MockControl}
   * @private
   */
  this.mockControl_ = mockControl;
};


/**
 * Returns a function that will assert that it will be called, and run the given
 * callback when it is.
 *
 * @param {string} name The name of the callback mock.
 * @param {function(...[*]) : *} callback The wrapped callback. This will be
 *     called when the returned function is called.
 * @param {Object=} opt_selfObj The object which this should point to when the
 *     callback is run.
 * @return {!Function} The mock callback.
 * @suppress {missingProperties} Mocks do not fit in the type system well.
 */
goog.testing.async.MockControl.prototype.createCallbackMock = function(
    name, callback, opt_selfObj) {
  goog.asserts.assert(
      goog.isString(name),
      'name parameter ' + goog.debug.deepExpose(name) + ' should be a string');

  var ignored = new goog.testing.mockmatchers.IgnoreArgument();

  // Use everyone's favorite "double-cast" trick to subvert the type system.
  var obj = /** @type {Object} */ (this.mockControl_.createFunctionMock(name));
  var fn = /** @type {Function} */ (obj);

  fn(ignored).$does(function(args) {
    if (opt_selfObj) {
      callback = goog.bind(callback, opt_selfObj);
    }
    return callback.apply(this, args);
  });
  fn.$replay();
  return function() { return fn(arguments); };
};


/**
 * Returns a function that will assert that its arguments are equal to the
 * arguments given to asyncAssertEquals. In addition, the function also asserts
 * that it will be called.
 *
 * @param {string} message A message to print if the arguments are wrong.
 * @param {...*} var_args The arguments to assert.
 * @return {function(...[*]) : void} The mock callback.
 */
goog.testing.async.MockControl.prototype.asyncAssertEquals = function(
    message, var_args) {
  var expectedArgs = Array.prototype.slice.call(arguments, 1);
  return this.createCallbackMock('asyncAssertEquals', function() {
    assertObjectEquals(
        message, expectedArgs, Array.prototype.slice.call(arguments));
  });
};


/**
 * Asserts that a deferred object will have an error and call its errback
 * function.
 * @param {goog.async.Deferred} deferred The deferred object.
 * @param {function() : void} fn A function wrapping the code in which the error
 *     will occur.
 */
goog.testing.async.MockControl.prototype.assertDeferredError = function(
    deferred, fn) {
  deferred.addErrback(this.createCallbackMock(
      'assertDeferredError', function() {}));
  goog.testing.asserts.callWithoutLogging(fn);
};


/**
 * Asserts that a deferred object will call its callback with the given value.
 *
 * @param {string} message A message to print if the arguments are wrong.
 * @param {goog.async.Deferred|*} expected The expected value. If this is a
 *     deferred object, then the expected value is the deferred value.
 * @param {goog.async.Deferred|*} actual The actual value. If this is a deferred
 *     object, then the actual value is the deferred value. Either this or
 *     'expected' must be deferred.
 */
goog.testing.async.MockControl.prototype.assertDeferredEquals = function(
    message, expected, actual) {
  if (expected instanceof goog.async.Deferred &&
      actual instanceof goog.async.Deferred) {
    // Assert that the first deferred is resolved.
    expected.addCallback(this.createCallbackMock(
        'assertDeferredEquals', function(exp) {
          // Assert that the second deferred is resolved, and that the value is
          // as expected.
          actual.addCallback(this.asyncAssertEquals(message, exp));
        }, this));
  } else if (expected instanceof goog.async.Deferred) {
    expected.addCallback(this.createCallbackMock(
        'assertDeferredEquals', function(exp) {
          assertObjectEquals(message, exp, actual);
        }));
  } else if (actual instanceof goog.async.Deferred) {
    actual.addCallback(this.asyncAssertEquals(message, expected));
  } else {
    throw Error('Either expected or actual must be deferred');
  }
};
