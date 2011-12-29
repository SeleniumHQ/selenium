// Copyright 2011 Software Freedom Conservancy. All Rights Reserved.
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
goog.require('goog.json');
goog.require('goog.string');
goog.require('goog.testing.MockClock');
goog.require('goog.testing.recordFunction');


/** @type {goog.testing.MockClock} */
var clock;

/** @type {Array.<!string>} */
var messages;

var STUB_ERROR = new Error('ouch');
STUB_ERROR.stack = '(stub error; stack irrelevant)';

function throwStubError() {
  throw STUB_ERROR;
}

function assertIsStubError(error) {
  assertEquals(STUB_ERROR, error);
}

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
  var callback = goog.testing.recordFunction(opt_fn);

  callback.getExpectedCallCountMessage = function(n, opt_prefix, opt_noJoin) {
    var message = [];
    if (opt_prefix) message.push(opt_prefix);

    var calls = callback.getCalls();
    message.push(
        'Expected to be called ' + n + ' times.',
        '  was called ' + calls.length + ' times:');
    message = goog.array.concat(message, goog.array.map(calls, function(call, i) {
      return goog.string.repeat(' ', 4) +
          'args(call #' + i + '): ' +
          goog.json.serialize(call.getArguments());
    }));
    return opt_noJoin ? message : message.join('\n');
  };

  callback.assertCalled = function(opt_message) {
    assertEquals(callback.getExpectedCallCountMessage(1, opt_message),
        1, callback.getCallCount());
  };

  callback.assertNotCalled = function(opt_message) {
    assertEquals(callback.getExpectedCallCountMessage(1, opt_message),
        0, callback.getCallCount());
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

  pair.assertEither = function(opt_message) {
    if (!pair.callback.getCallCount() &&
        !pair.errback.getCallCount()) {
      var message = ['Neither callback nor errback has been called'];
      if (opt_message) goog.array.insertAt(message, opt_message);
      fail(message.join('\n'));
    }
  };

  pair.assertNeither = function(opt_message) {
    var message = [opt_message || 'Unexpected callback results:'];
    if (pair.callback.getCallCount()) {
      message = goog.array.concat(message,
          pair.callback.getExpectedCallCountMessage(0,
              'Did not expect callback to be called.', true));
    }
    if (pair.errback.getCallCount()) {
      message = goog.array.concat(message,
          pair.callback.getExpectedCallCountMessage(0,
              'Did not expect errback to be called.', true));
    }
    if (message.length > 1) {
      fail(message.join('\n  -- '));
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
    if (!expectedFn.getCallCount()) {
      message.push('Expected ' + expectedName + ' to be called.');
    } else if (expectedFn.getCallCount() > 1) {
      message.push(
          'Expected ' + expectedName + ' to be called only once.',
          '  was called ' + expectedFn.getCallCount() + ' times:');
      message = goog.array.concat(message, expectedFn.getFormattedArgs(4));
    }

    if (unexpectedFn.getCallCount()) {
      message.push(
          'Did not expect ' + unexpectedName + ' to be called.',
          '  was called ' + unexpectedFn.getCallCount() + ' times:');
      message = goog.array.concat(message, unexpectedFn.getFormattedArgs(4));
    }

    if (message.length > 1) {
      fail(message.join('\n  -- '));
    }
  }
}


function _assertObjectEquals(expected, actual) {
  assertObjectEquals(
      'Expected: ' + goog.json.serialize(expected) + '\n' +
      'Actual:   ' + goog.json.serialize(actual),
      expected, actual);
}
