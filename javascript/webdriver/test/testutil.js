// Copyright 2011 Software Freedom Conservatory. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

goog.provide('webdriver.test.testutil');

goog.require('goog.array');
goog.require('goog.testing.MockClock');


/** @type {goog.testing.MockClock} */
var clock;

/** @type {Array.<!string>} */
var messages;


function createMockClock() {
  clock = new goog.testing.MockClock(true);

  /* Patch to work around the following bug with mock clock:
   *   function testZeroBasedTimeoutsRunInNextEventLoop() {
   *     var count = 0;
   *     setTimeout(function() {
   *       count += 1;
   *       setTimeout(function() { count += 1; }, 0);
   *       setTimeout(function() { count += 1; }, 0);
   *     }, 0);
   *     clock.tick();
   *     assertEquals(1, count);  // Fails; count == 3
   *     clock.tick();
   *     assertEquals(3, count);
   *   }
   */
  clock.runFunctionsWithinRange_ = function(endTime) {
    var adjustedEndTime = endTime - this.timeoutDelay_;

    // Repeatedly pop off the last item since the queue is always sorted.
    // Stop once we've collected all timeouts that should run.
    var timeouts = [];
    while (this.queue_.length &&
        this.queue_[this.queue_.length - 1].runAtMillis <= adjustedEndTime) {
      timeouts.push(this.queue_.pop());
    }

    // Now run all timeouts that are within range.
    while (timeouts.length) {
      var timeout = timeouts.shift();

      if (!(timeout.timeoutKey in this.deletedKeys_)) {
        // Only move time forwards.
        this.nowMillis_ = Math.max(this.nowMillis_,
            timeout.runAtMillis + this.timeoutDelay_);
        // Call timeout in global scope and pass the timeout key as the argument.
        timeout.funcToCall.call(goog.global, timeout.timeoutKey);
        // In case the interval was cleared in the funcToCall
        if (timeout.recurring) {
          this.scheduleFunction_(
              timeout.timeoutKey, timeout.funcToCall, timeout.millis, true);
        }
      }
    }
  };

  return clock;
}


/**
 * Advances the clock by one tick.
 * @param {number=} opt_n The number of ticks to advance the clock. If not
 *     specified, will advance the clock once for every timeout made.
 *     Assumes all timeouts are 0-based.
 */
function consumeTimeouts(opt_n) {
  // webdriver.promise and webdriver.application only schedule 0 timeouts to
  // yield until the next available event loop.
  for (var i = 0; i < (opt_n || clock.getTimeoutsMade()); i++) {
    clock.tick();
  }
}


function assertMessages(var_args) {
  var args = Array.prototype.slice.call(arguments, 0);
  assertEquals(
      'Wrong # messages, expected [' + args.join(',') + '], but was [' +
          messages.join(',') + ']',
      args.length, messages.length);
  assertEquals(args.join(''), messages.join(''));
}


function assertingMessages(var_args) {
  var args = goog.array.slice(arguments, 0);
  return function() {
    return assertMessages.apply(null, args);
  };
}


function assertIsPromise(obj) {
  assertTrue('Value is not a promise: ' + goog.typeOf(obj),
      webdriver.promise.isPromise(obj));
}


function assertNotPromise(obj) {
  assertFalse(webdriver.promise.isPromise(obj));
}

/**
 * Wraps a function. The wrapped function will have several utility functions:
 * <ul>
 * <li>getError: Returns any errors thrown by the wrapped function
 * <li>getArgs: Returns the arguments the wrapped function was called with.
 * <li>wasCalled: Returns whether the function was called.
 * <li>reset: Resets the recording.
 * <li>assertCalled: Asserts that the function was called.
 * <li>assertNotCalled: Asserts that the function was not called.
 * </ul> 
 * @param {Function=} opt_fn The function to wrap; defaults to
 *     goog.nullFunction.
 * @param {boolean=} opt_expectError Whether the wrapped function is
 *     expected to throw; defaults to false.
 * @return {!Function} The wrapped function.
 */
function callbackHelper(opt_fn, opt_expectError) {
  var fn = opt_fn || goog.nullFunction;
  var args = null, error = null;
  var callback = function() {
    try {
      args = goog.array.map(arguments, function(arg) {
        if (arg) {
          if (arg.isJsUnitException)
            return {
              isJUnitException: true,
              message: arg.message,
              stack: arg.stack
            };
          if (arg instanceof Error)
            return {message:arg.message, stack:arg.stack};
        }
        return arg;
      });
      return fn.apply(this, arguments);
    } catch (ex) {
      error = ex;
      throw ex;
    }
  };

  callback.getError = function() { return error; };
  callback.getArgs = function() { return args; };
  callback.wasCalled = function() { return args !== null };
  callback.reset = function() {
    args = null;
    error = null;
  };

  callback.assertCalled = function(opt_message) {
    if (error && !opt_expectError) throw error;
    var message = 'Callback not called';
    if (opt_message) message += ': ' + opt_message;
    assertTrue(message, callback.wasCalled());
  };

  callback.assertNotCalled = function(opt_message) {
    if (error) throw error;
    var message = 'Callback called';
    if (opt_message) message += ': ' + opt_message;
    if (args != null) message += '; args: ' + JSON.stringify(args);
    assertFalse(message, callback.wasCalled());
  };

  return callback;
}


/**
 * Creates a utility for managing a pair of callbacks, capable of asserting only
 * one of the pair was ever called.
 *
 * @param {Function=} opt_callback The callback to manage.
 * @param {Function=} opt_errback The errback to manage.
 */
function callbackPair(opt_callback, opt_errback) {
  var pair = {
    callback: callbackHelper(opt_callback),
    errback: callbackHelper(opt_errback)
  };

  pair.assertNeither = function(opt_message) {
    var message = [];
    if (pair.callback.wasCalled()) {
      message.push('Did not expect callback to be called; args: ' +
          JSON.stringify(pair.callback.getArgs()));
    }
    if (pair.errback.wasCalled()) {
      message.push('Did not expect errback to be called; args: ' +
          JSON.stringify(pair.errback.getArgs()));
    }
    if (message.length) {
      if (opt_message) goog.array.insertAt(message, opt_message);
      fail(message.join('\n'));
    }
  };

  pair.assertCallback = function(opt_message) {
    assertCalls(pair.callback, 'callback', pair.errback, 'errback',
        opt_message);
  };

  pair.assertErrback = function(opt_message) {
    assertCalls(pair.errback, 'errback', pair.callback, 'callback',
        opt_message);
  };

  pair.reset = function() {
    pair.callback.reset();
    pair.errback.reset();
  };

  return pair;

  function assertCalls(expectedFn, expectedName, unexpectedFn, unexpectedName,
                       opt_message) {
    var message = [opt_message || 'Unexpected callback results:'];
    if (!expectedFn.wasCalled()) {
      message.push('Expected ' + expectedName + ' to be called.');
    }

    if (unexpectedFn.wasCalled()) {
      message.push('Did not expect ' + unexpectedName +
          ' to be called; args: ' +
          JSON.stringify(unexpectedFn.getArgs()));
    }

    if (message.length > 1) {
      fail(message.join('\n  -- '));
    }
  }
}


function _assertObjectEquals(expected, actual) {
  assertObjectEquals(
      'Expected: ' + JSON.stringify(expected) + '\n' +
      'Actual:   ' + JSON.stringify(actual),
      expected, actual);
}


function _assertArrayEquals(expected, actual) {
  assertArrayEquals(
      'Expected: ' + JSON.stringify(expected) + '\n' +
      'Actual:   ' + JSON.stringify(actual),
      expected, actual);
}
