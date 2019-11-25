// Copyright 2016 The Closure Library Authors. All Rights Reserved.
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
 * @fileoverview A utility for wrapping a JSTD test object so that any test
 * methods are receive a queue that is compatible with JSTD but supports the
 * JsUnit async API of returning a promise in the test method.
 *
 * To convert a JSTD object call convertToAsyncTestObj on it and run with the
 * JsUnit test runner.
 */

goog.provide('goog.testing.JsTdAsyncWrapper');

goog.require('goog.Promise');


/**
 * @param {Function|string} callback
 * @param {number=} opt_delay
 * @param {...*} var_args
 * @return {number}
 * @private
 */
goog.testing.JsTdAsyncWrapper.REAL_SET_TIMEOUT_FN_ = goog.global.setTimeout;


/**
 * Calls a function after a specified timeout. This uses the original setTimeout
 * to be resilient to tests that override it.
 * @param {Function} fn The function to call.
 * @param {number} timeout Timeout time in ms.
 * @private
 */
goog.testing.JsTdAsyncWrapper.REAL_SET_TIMEOUT_ = function(fn, timeout) {
  // Setting timeout into a variable is necessary to invoke the function in the
  // default global context. Inlining breaks chrome since it requires setTimeout
  // to be called with the global context, and IE8 doesn't support the call
  // method on setTimeout.
  var setTimeoutFn = goog.testing.JsTdAsyncWrapper.REAL_SET_TIMEOUT_FN_;
  setTimeoutFn(fn, timeout);
};


/**
 * Wraps an object's methods by passing in a Queue that is based on the JSTD
 * async API. The queue exposes a promise that resolves when the queue
 * completes. This promise can be used in JsUnit tests.
 * @param {!Object} original The original JSTD test object. The object should
 *     contain methods such as testXyz or setUp.
 * @return {!Object} A object that has all test methods wrapped in a fake
 *     testing queue.
 */
goog.testing.JsTdAsyncWrapper.convertToAsyncTestObj = function(original) {
  // Wraps a call to a test function and passes an instance of a fake queue
  // into the test function.
  var queueWrapperFn = function(fn) {
    return function() {
      var queue = new goog.testing.JsTdAsyncWrapper.Queue(this);
      fn.call(this, queue);
      return queue.startExecuting();
    };
  };

  var newTestObj = {};
  for (var prop in original) {
    // If this is a test or tearDown/setUp method wrap the method with a queue
    if (prop.indexOf('test') == 0 || prop == 'setUp' || prop == 'tearDown') {
      newTestObj[prop] = queueWrapperFn(original[prop]);
    } else {
      newTestObj[prop] = original[prop];
    }
  }
  return newTestObj;
};



/**
 * A queue that mirrors the JSTD Async Queue api but exposes a promise that
 * resolves once the queue is complete for compatibility with JsUnit.
 * @param {!Object} testObj The test object containing all test methods. This
 *     object is passed into queue callbacks as the "this" object.
 * @constructor
 * @final
 */
goog.testing.JsTdAsyncWrapper.Queue = function(testObj) {
  /**
   * The queue steps.
   * @private {!Array<!goog.testing.JsTdAsyncWrapper.Step_>}
   */
  this.steps_ = [];

  /**
   * A delegate that is used within a defer call.
   * @private {?goog.testing.JsTdAsyncWrapper.Queue}
   */
  this.delegate_ = null;

  /**
   * thisArg that should be used by default for addCallback function calls.
   * @private {!Object}
   */
  this.testObj_ = testObj;
};


/**
 * @param {string|function(!goog.testing.JsTdAsyncWrapper.Pool_=)} stepName
 *     The name of the current testing step, or the fn parameter if
 *     no stepName is desired.
 * @param {function(!goog.testing.JsTdAsyncWrapper.Pool_=)=} opt_fn A function
 *   that will be called.
 */
goog.testing.JsTdAsyncWrapper.Queue.prototype.defer = function(
    stepName, opt_fn) {
  var fn = opt_fn;
  if (!opt_fn && typeof stepName == 'function') {
    fn = stepName;
    stepName = '(Not named)';
  }
  // If another queue.defer is called within a pool callback it should be
  // executed after the current one. Any defer that is called within a defer
  // will be passed to a delegate and the current defer waits till all delegate
  // defer are resolved.
  if (this.delegate_) {
    this.delegate_.defer(stepName, fn);
    return;
  }
  this.steps_.push(new goog.testing.JsTdAsyncWrapper.Step_(
      /** @type {string} */ (stepName),
      /** @type {function(!goog.testing.JsTdAsyncWrapper.Pool_=)} */ (fn)));
};


/**
 * Starts the execution.
 * @return {!goog.Promise<void>}
 */
goog.testing.JsTdAsyncWrapper.Queue.prototype.startExecuting = function() {
  return new goog.Promise(goog.bind(function(resolve, reject) {
    this.executeNextStep_(resolve, reject);
  }, this));
};


/**
 * Executes the next step on the queue waiting for all pool callbacks and then
 * starts executing any delegate queues before it finishes.
 * @param {function()} callback
 * @param {function(*)} errback
 * @private
 */
goog.testing.JsTdAsyncWrapper.Queue.prototype.executeNextStep_ = function(
    callback, errback) {
  // Note: From this point on, we can no longer use goog.Promise (which uses
  // the goog.async.run queue) because it conflicts with MockClock, and we can't
  // use the native Promise because it is not supported on IE. So we revert to
  // using callbacks and setTimeout.
  if (!this.steps_.length) {
    callback();
    return;
  }
  var step = this.steps_.shift();
  this.delegate_ = new goog.testing.JsTdAsyncWrapper.Queue(this.testObj_);
  var pool = new goog.testing.JsTdAsyncWrapper.Pool_(
      this.testObj_, goog.bind(function() {
        goog.testing.JsTdAsyncWrapper.REAL_SET_TIMEOUT_(goog.bind(function() {
          this.executeDelegate_(callback, errback);
        }, this), 0);
      }, this), goog.bind(function(reason) {
        this.handleError_(errback, reason, step.name);
      }, this));
  try {
    step.fn.call(this.testObj_, pool);
  } catch (e) {
    this.handleError_(errback, e, step.name);
  }
  pool.maybeComplete();
};


/**
 * Execute the delegate queue.
 * @param {function()} callback
 * @param {function(*)} errback
 * @private
 */
goog.testing.JsTdAsyncWrapper.Queue.prototype.executeDelegate_ = function(
    callback, errback) {
  // Wait till the delegate queue completes before moving on to the
  // next step.
  if (!this.delegate_) {
    this.executeNextStep_(callback, errback);
    return;
  }
  this.delegate_.executeNextStep_(goog.bind(function() {
    this.delegate_ = null;
    goog.testing.JsTdAsyncWrapper.REAL_SET_TIMEOUT_(goog.bind(function() {
      this.executeNextStep_(callback, errback);
    }, this), 0);
  }, this), errback);
};


/**
 * @param {function(*)} errback
 * @param {*} reason
 * @param {string} stepName
 * @private
 */
goog.testing.JsTdAsyncWrapper.Queue.prototype.handleError_ = function(
    errback, reason, stepName) {
  var error = reason instanceof Error ? reason : Error(reason);
  error.message = 'In step ' + stepName + ', error: ' + error.message;
  errback(reason);
};



/**
 * A step to be executed.
 * @param {string} name
 * @param {function(!goog.testing.JsTdAsyncWrapper.Pool_=)} fn
 * @constructor
 * @private
 */
goog.testing.JsTdAsyncWrapper.Step_ = function(name, fn) {
  /** @final {string} */
  this.name = name;
  /** @final {function(!goog.testing.JsTdAsyncWrapper.Pool_=)} */
  this.fn = fn;
};



/**
 * A fake pool that mimics the JSTD AsyncTestCase's pool object.
 * @param {!Object} testObj The test object containing all test methods. This
 *     object is passed into queue callbacks as the "this" object.
 * @param {function()} callback
 * @param {function(*)} errback
 * @constructor
 * @private
 * @final
 */
goog.testing.JsTdAsyncWrapper.Pool_ = function(testObj, callback, errback) {

  /** @private {number} */
  this.outstandingCallbacks_ = 0;

  /** @private {function()} */
  this.callback_ = callback;

  /** @private {function(*)} */
  this.errback_ = errback;

  /**
   * thisArg that should be used by default for defer function calls.
   * @private {!Object}
   */
  this.testObj_ = testObj;

  /** @private {boolean} */
  this.callbackCalled_ = false;
};


/**
 * @return {function()}
 */
goog.testing.JsTdAsyncWrapper.Pool_.prototype.noop = function() {
  return this.addCallback(function() {});
};


/**
 * @param {function(...*):*} fn The function to add to the pool.
 * @param {?number=} opt_n The number of permitted uses of the given callback;
 *     defaults to one.
 * @param {?number=} opt_timeout The timeout in milliseconds.
 *     This is not supported in the adapter for now. Specifying this argument
 *     will result in a test failure.
 * @param {?string=} opt_description The callback description.
 * @return {function()}
 */
goog.testing.JsTdAsyncWrapper.Pool_.prototype.addCallback = function(
    fn, opt_n, opt_timeout, opt_description) {
  // TODO(mtragut): This could be fixed if required by test cases.
  if (opt_timeout || opt_description) {
    throw Error(
        'Setting timeout or description in a pool callback is not supported.');
  }
  var numCallbacks = opt_n || 1;
  this.outstandingCallbacks_ = this.outstandingCallbacks_ + numCallbacks;
  return goog.bind(function() {
    try {
      fn.apply(this.testObj_, arguments);
    } catch (e) {
      if (opt_description) {
        e.message = opt_description + e.message;
      }
      this.errback_(e);
    }
    this.outstandingCallbacks_ = this.outstandingCallbacks_ - 1;
    this.maybeComplete();
  }, this);
};


/**
 * @param {function(...*):*} fn The function to add to the pool.
 * @param {?number=} opt_n The number of permitted uses of the given callback;
 *     defaults to one.
 * @param {?number=} opt_timeout The timeout in milliseconds.
 *     This is not supported in the adapter for now. Specifying this argument
 *     will result in a test failure.
 * @param {?string=} opt_description The callback description.
 * @return {function()}
 */
goog.testing.JsTdAsyncWrapper.Pool_.prototype.add =
    goog.testing.JsTdAsyncWrapper.Pool_.prototype.addCallback;


/**
 * @param {string} msg The message to print if the error callback gets called.
 * @return {function()}
 */
goog.testing.JsTdAsyncWrapper.Pool_.prototype.addErrback = function(msg) {
  return goog.bind(function() {
    var errorMsg = msg;
    if (arguments.length) {
      errorMsg += ' - Error callback called with params: ( ';
      for (var i = 0; i < arguments.length; i++) {
        var arg = arguments[i];
        errorMsg += arg + ' ';
        if (arg instanceof Error) {
          errorMsg += '\n' + arg.stack + '\n';
        }
      }
      errorMsg += ')';
    }
    this.errback_(errorMsg);
  }, this);
};


/**
 * Completes the pool if there are no outstanding callbacks.
 */
goog.testing.JsTdAsyncWrapper.Pool_.prototype.maybeComplete = function() {
  if (this.outstandingCallbacks_ == 0 && !this.callbackCalled_) {
    this.callbackCalled_ = true;
    this.callback_();
  }
};
