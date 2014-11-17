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

/**
 * @license Portions of this code are from the Dojo toolkit, received under the
 * BSD License:
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 *   * Redistributions of source code must retain the above copyright notice,
 *     this list of conditions and the following disclaimer.
 *   * Redistributions in binary form must reproduce the above copyright notice,
 *     this list of conditions and the following disclaimer in the documentation
 *     and/or other materials provided with the distribution.
 *   * Neither the name of the Dojo Foundation nor the names of its contributors
 *     may be used to endorse or promote products derived from this software
 *     without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
 * AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
 * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
 * ARE DISCLAIMED.  IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE
 * LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
 * CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF
 * SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
 * INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN
 * CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
 * ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
 * POSSIBILITY OF SUCH DAMAGE.
 */

/**
 * @fileoverview A promise implementation based on the CommonJS promise/A and
 * promise/B proposals. For more information, see
 * http://wiki.commonjs.org/wiki/Promises.
 */

goog.provide('webdriver.promise');
goog.provide('webdriver.promise.ControlFlow');
goog.provide('webdriver.promise.ControlFlow.Timer');
goog.provide('webdriver.promise.Deferred');
goog.provide('webdriver.promise.Promise');
goog.provide('webdriver.promise.Thenable');

goog.require('goog.array');
goog.require('goog.debug.Error');
goog.require('goog.object');
goog.require('webdriver.EventEmitter');
goog.require('webdriver.stacktrace.Snapshot');



goog.scope(function() {
var promise = webdriver.promise;

/**
 * Error used when the computation of a promise is cancelled.
 *
 * @param {string=} opt_msg The cancellation message.
 * @constructor
 * @extends {goog.debug.Error}
 * @final
 */
promise.CancellationError = function(opt_msg) {
  goog.debug.Error.call(this, opt_msg);

  /** @override */
  this.name = 'CancellationError';
};
goog.inherits(promise.CancellationError, goog.debug.Error);



/**
 * Thenable is a promise-like object with a {@code then} method which may be
 * used to schedule callbacks on a promised value.
 *
 * @interface
 * @extends {IThenable.<T>}
 * @template T
 */
promise.Thenable = function() {};


/**
 * Cancels the computation of this promise's value, rejecting the promise in the
 * process. This method is a no-op if the promise has alreayd been resolved.
 *
 * @param {string=} opt_reason The reason this promise is being cancelled.
 */
promise.Thenable.prototype.cancel = function(opt_reason) {};


/** @return {boolean} Whether this promise's value is still being computed. */
promise.Thenable.prototype.isPending = function() {};


/**
 * Registers listeners for when this instance is resolved.
 *
 * @param {?(function(T): (R|promise.Promise.<R>))=} opt_callback The
 *     function to call if this promise is successfully resolved. The function
 *     should expect a single argument: the promise's resolved value.
 * @param {?(function(*): (R|promise.Promise.<R>))=} opt_errback
 *     The function to call if this promise is rejected. The function should
 *     expect a single argument: the rejection reason.
 * @return {!promise.Promise.<R>} A new promise which will be
 *     resolved with the result of the invoked callback.
 * @template R
 */
promise.Thenable.prototype.then = function(opt_callback, opt_errback) {};


/**
 * Registers a listener for when this promise is rejected. This is synonymous
 * with the {@code catch} clause in a synchronous API:
 * <pre><code>
 *   // Synchronous API:
 *   try {
 *     doSynchronousWork();
 *   } catch (ex) {
 *     console.error(ex);
 *   }
 *
 *   // Asynchronous promise API:
 *   doAsynchronousWork().thenCatch(function(ex) {
 *     console.error(ex);
 *   });
 * </code></pre>
 *
 * @param {function(*): (R|promise.Promise.<R>)} errback The
 *     function to call if this promise is rejected. The function should
 *     expect a single argument: the rejection reason.
 * @return {!promise.Promise.<R>} A new promise which will be
 *     resolved with the result of the invoked callback.
 * @template R
 */
promise.Thenable.prototype.thenCatch = function(errback) {};


/**
 * Registers a listener to invoke when this promise is resolved, regardless
 * of whether the promise's value was successfully computed. This function
 * is synonymous with the {@code finally} clause in a synchronous API:
 * <pre><code>
 *   // Synchronous API:
 *   try {
 *     doSynchronousWork();
 *   } finally {
 *     cleanUp();
 *   }
 *
 *   // Asynchronous promise API:
 *   doAsynchronousWork().thenFinally(cleanUp);
 * </code></pre>
 *
 * <b>Note:</b> similar to the {@code finally} clause, if the registered
 * callback returns a rejected promise or throws an error, it will silently
 * replace the rejection error (if any) from this promise:
 * <pre><code>
 *   try {
 *     throw Error('one');
 *   } finally {
 *     throw Error('two');  // Hides Error: one
 *   }
 *
 *   promise.rejected(Error('one'))
 *       .thenFinally(function() {
 *         throw Error('two');  // Hides Error: one
 *       });
 * </code></pre>
 *
 *
 * @param {function(): (R|promise.Promise.<R>)} callback The function
 *     to call when this promise is resolved.
 * @return {!promise.Promise.<R>} A promise that will be fulfilled
 *     with the callback result.
 * @template R
 */
promise.Thenable.prototype.thenFinally = function(callback) {};


/**
 * Property used to flag constructor's as implementing the Thenable interface
 * for runtime type checking.
 * @private {string}
 * @const
 */
promise.Thenable.IMPLEMENTED_BY_PROP_ = '$webdriver_Thenable';


/**
 * Adds a property to a class prototype to allow runtime checks of whether
 * instances of that class implement the Thenable interface. This function will
 * also ensure the prototype's {@code then} function is exported from compiled
 * code.
 * @param {function(new: promise.Thenable, ...[?])} ctor The
 *     constructor whose prototype to modify.
 */
promise.Thenable.addImplementation = function(ctor) {
  // Based on goog.promise.Thenable.isImplementation.
  ctor.prototype['then'] = ctor.prototype.then;
  try {
    // Old IE7 does not support defineProperty; IE8 only supports it for
    // DOM elements.
    Object.defineProperty(
        ctor.prototype,
        promise.Thenable.IMPLEMENTED_BY_PROP_,
        {'value': true, 'enumerable': false});
  } catch (ex) {
    ctor.prototype[promise.Thenable.IMPLEMENTED_BY_PROP_] = true;
  }
};


/**
 * Checks if an object has been tagged for implementing the Thenable interface
 * as defined by {@link promise.Thenable.addImplementation}.
 * @param {*} object The object to test.
 * @return {boolean} Whether the object is an implementation of the Thenable
 *     interface.
 */
promise.Thenable.isImplementation = function(object) {
  // Based on goog.promise.Thenable.isImplementation.
  if (!object) {
    return false;
  }
  try {
    return !!object[promise.Thenable.IMPLEMENTED_BY_PROP_];
  } catch (e) {
    return false;  // Property access seems to be forbidden.
  }
};



/**
 * Represents the eventual value of a completed operation. Each promise may be
 * in one of three states: pending, resolved, or rejected. Each promise starts
 * in the pending state and may make a single transition to either a
 * fulfilled or rejected state, at which point the promise is considered
 * resolved.
 *
 * @param {function(
 *           function((T|IThenable.<T>|Thenable)=),
 *           function(*=))} resolver
 *     Function that is invoked immediately to begin computation of this
 *     promise's value. The function should accept a pair of callback functions,
 *     one for fulfilling the promise and another for rejecting it.
 * @param {promise.ControlFlow=} opt_flow The control flow
 *     this instance was created under. Defaults to the currently active flow.
 * @constructor
 * @implements {promise.Thenable.<T>}
 * @template T
 * @see http://promises-aplus.github.io/promises-spec/
 */
promise.Promise = function(resolver, opt_flow) {

  /** @private {!promise.ControlFlow} */
  this.flow_ = opt_flow || promise.controlFlow();

  /** @private {promise.Promise.<?>} */
  this.parent_ = null;

  /** @private {Array.<promise.Promise.Listener_>} */
  this.listeners_ = null;

  /** @private {promise.Promise.State_} */
  this.state_ = promise.Promise.State_.PENDING;

  /** @private {boolean} */
  this.handled_ = false;

  /** @private {?number} */
  this.pendingRejectionKey_ = null;

  /** @private {*} */
  this.value_ = undefined;

  try {
    var self = this;
    resolver(function(value) {
      self.resolve_(promise.Promise.State_.FULFILLED, value);
    }, function(reason) {
      self.resolve_(promise.Promise.State_.REJECTED, reason);
    });
  } catch (ex) {
    this.resolve_(promise.Promise.State_.REJECTED, ex);
  }
};
promise.Thenable.addImplementation(promise.Promise);


/**
 * @typedef {{
 *     promise: !promise.Promise,
 *     onFulfilled: function(*),
 *     onRejected: function(*)
 * }}
 * @private
 */
promise.Promise.Listener_;


/**
 * @enum {number}
 * @private
 */
promise.Promise.State_ = {
  PENDING: 0,
  BLOCKED: 1,
  REJECTED: 2,
  FULFILLED: 3
};


/**
 * Resolves this promise. If the new value is itself a promise, this function
 * will wait for it to be resolved before notifying the registered listeners.
 * @param {promise.Promise.State_} newState The promise's new state.
 * @param {*} newValue The promise's new value.
 * @throws {TypeError} If {@code newValue === this}.
 * @private
 */
promise.Promise.prototype.resolve_ = function(newState, newValue) {
  if (promise.Promise.State_.PENDING !== this.state_) {
    return;
  }

  if (newValue === this) {
    // See promise a+, 2.3.1
    // http://promises-aplus.github.io/promises-spec/#point-48
    throw new TypeError('A promise may not resolve to itself');
  }

  this.state_ = promise.Promise.State_.BLOCKED;

  if (promise.isPromise(newValue)) {
    var onFulfill = goog.bind(this.notifyAll_, this, newState);
    var onReject = goog.bind(this.notifyAll_, this,
        promise.Promise.State_.REJECTED);
    if (newValue instanceof promise.Promise) {
      newValue.then(onFulfill, onReject);
    } else {
      promise.asap(newValue, onFulfill, onReject);
    }
  } else {
    this.notifyAll_(newState, newValue);
  }
};


/**
 * Notifies all of the listeners registered with this promise that its state
 * has changed.
 * @param {promise.Promise.State_} newState The promise's new state.
 * @param {*} newValue The promise's new value.
 * @private
 */
promise.Promise.prototype.notifyAll_ = function(newState, newValue) {
  this.state_ = newState;
  this.value_ = newValue;

  while (this.listeners_ && this.listeners_.length) {
    this.notify_(this.listeners_.shift());
  }
  this.listeners_ = null;

  if (!this.handled_ &&
      newState === promise.Promise.State_.REJECTED &&
      !(newValue instanceof promise.CancellationError)) {
    var self = this;
    this.flow_.pendingRejections_ += 1;
    this.pendingRejectionKey_ = this.flow_.timer.setTimeout(function() {
      self.pendingRejectionKey_ = null;
      self.flow_.pendingRejections_ -= 1;
      self.flow_.abortFrame_(newValue);
    }, 0);
  }
};


/**
 * Notifies a single listener of this promise's change in state.
 * @param {promise.Promise.Listener_} listener The listener to
 *     notify.
 * @private
 */
promise.Promise.prototype.notify_ = function(listener) {
  if (this.state_ === promise.Promise.State_.REJECTED) {
    listener.onRejected(this.value_);
  } else {
    listener.onFulfilled(this.value_);
  }
};


/** @override */
promise.Promise.prototype.cancel = function(opt_reason) {
  if (!this.isPending()) {
    return;
  }

  if (this.parent_) {
    this.parent_.cancel(opt_reason);
  } else {
    this.resolve_(
        promise.Promise.State_.REJECTED,
        new promise.CancellationError(opt_reason));
  }
};


/** @override */
promise.Promise.prototype.isPending = function() {
  return this.state_ === promise.Promise.State_.PENDING;
};


/** @override */
promise.Promise.prototype.then = function(opt_callback, opt_errback) {
  if (!goog.isFunction(opt_callback) && !goog.isFunction(opt_errback)) {
    return this;
  }

  this.handled_ = true;
  if (this.pendingRejectionKey_ !== null) {
    this.flow_.pendingRejections_ -= 1;
    this.flow_.timer.clearTimeout(this.pendingRejectionKey_);
    this.pendingRejectionKey_ = null;
  }

  var listener = {
    promise: null,
    onFulfilled: null,
    onRejected: null
  };

  var flow = this.flow_;
  listener.promise = new promise.Promise(function(fulfill, reject) {
    listener.onFulfilled = function (value) {
      if (goog.isFunction(opt_callback)) {
        flow.runInNewFrame_(goog.partial(opt_callback, value), fulfill, reject);
      } else {
        fulfill(value);
      }
    };

    listener.onRejected = function (reason) {
      if (goog.isFunction(opt_errback)) {
        flow.runInNewFrame_(goog.partial(opt_errback, reason), fulfill, reject);
      } else {
        reject(reason);
      }
    };
  }, this.flow_);
  listener.promise.parent_ = this;

  if (this.state_ === promise.Promise.State_.PENDING ||
      this.state_ === promise.Promise.State_.BLOCKED) {
    this.listeners_ = this.listeners_ || [];
    this.listeners_.push(listener);
  } else {
    this.notify_(
        /** @type {promise.Promise.Listener_} */(listener));
  }
  return listener.promise;
};


/** @override */
promise.Promise.prototype.thenCatch = function(errback) {
  return this.then(null, errback);
};


/** @override */
promise.Promise.prototype.thenFinally = function(callback) {
  return this.then(callback, function(err) {
    var value = callback();
    if (promise.isPromise(value)) {
      return value.then(function() {
        throw err;
      });
    }
    throw err;
  });
};



/**
 * Represents a value that will be resolved at some point in the future. This
 * class represents the protected "producer" half of a Promise - each Deferred
 * has a {@code promise} property that may be returned to consumers for
 * registering callbacks, reserving the ability to resolve the deferred to the
 * producer.
 *
 * <p>If this Deferred is rejected and there are no listeners registered before
 * the next turn of the event loop, the rejection will be passed to the
 * {@link promise.ControlFlow} as an unhandled failure.
 *
 * <p>If this Deferred is cancelled, the cancellation reason will be forward to
 * the Deferred's canceller function (if provided). The canceller may return a
 * truth-y value to override the reason provided for rejection.
 *
 * @param {promise.ControlFlow=} opt_flow The control flow
 *     this instance was created under. This should only be provided during
 *     unit tests.
 * @constructor
 * @implements {promise.Thenable.<T>}
 * @template T
 */
promise.Deferred = function(opt_flow) {
  var fulfill, reject;

  /** @type {!promise.Promise.<T>} */
  this.promise = new promise.Promise(function(f, r) {
    fulfill = f;
    reject = r;
  }, opt_flow);

  var self = this;
  var checkNotSelf = function(value) {
    if (value === self) {
      throw new TypeError('May not resolve a Deferred with itself');
    }
  };

  /**
   * Resolves this deferred with the given value.
   * @param {(T|IThenable.<T>|Thenable)=} opt_value The fulfilled value.
   */
  this.fulfill = function(opt_value) {
    checkNotSelf(opt_value);
    fulfill(opt_value);
  };

  /**
   * Rejects this promise with the given reason.
   * @param {*=} opt_reason The rejection reason.
   */
  this.reject = function(opt_reason) {
    checkNotSelf(opt_reason);
    reject(opt_reason);
  };
};
promise.Thenable.addImplementation(promise.Deferred);


/** @override */
promise.Deferred.prototype.isPending = function() {
  return this.promise.isPending();
};


/** @override */
promise.Deferred.prototype.cancel = function(opt_reason) {
  this.promise.cancel(opt_reason);
};


/**
 * @override
 * @deprecated Use {@code then} from the promise property directly.
 */
promise.Deferred.prototype.then = function(opt_cb, opt_eb) {
  return this.promise.then(opt_cb, opt_eb);
};


/**
 * @override
 * @deprecated Use {@code thenCatch} from the promise property directly.
 */
promise.Deferred.prototype.thenCatch = function(opt_eb) {
  return this.promise.thenCatch(opt_eb);
};


/**
 * @override
 * @deprecated Use {@code thenFinally} from the promise property directly.
 */
promise.Deferred.prototype.thenFinally = function(opt_cb) {
  this.promise.thenFinally(opt_cb);
};


/**
 * Tests if a value is an Error-like object. This is more than an straight
 * instanceof check since the value may originate from another context.
 * @param {*} value The value to test.
 * @return {boolean} Whether the value is an error.
 * @private
 */
promise.isError_ = function(value) {
  return value instanceof Error ||
      goog.isObject(value) &&
      (goog.isString(value.message) ||
       // A special test for goog.testing.JsUnitException.
       value.isJsUnitException);

};


/**
 * Determines whether a {@code value} should be treated as a promise.
 * Any object whose "then" property is a function will be considered a promise.
 *
 * @param {*} value The value to test.
 * @return {boolean} Whether the value is a promise.
 */
promise.isPromise = function(value) {
  return !!value && goog.isObject(value) &&
      // Use array notation so the Closure compiler does not obfuscate away our
      // contract.
      goog.isFunction(value['then']);
};


/**
 * Creates a promise that will be resolved at a set time in the future.
 * @param {number} ms The amount of time, in milliseconds, to wait before
 *     resolving the promise.
 * @return {!promise.Promise} The promise.
 */
promise.delayed = function(ms) {
  var timer = promise.controlFlow().timer;
  var key;
  return new promise.Promise(function(fulfill) {
    key = timer.setTimeout(fulfill, ms);
  }).thenCatch(function(e) {
    timer.clearTimeout(key);
    throw e;
  });
};


/**
 * Creates a new deferred object.
 * @return {!promise.Deferred.<T>} The new deferred object.
 * @template T
 */
promise.defer = function() {
  return new promise.Deferred();
};


/**
 * Creates a promise that has been resolved with the given value.
 * @param {T=} opt_value The resolved value.
 * @return {!promise.Promise.<T>} The resolved promise.
 * @template T
 */
promise.fulfilled = function(opt_value) {
  if (opt_value instanceof promise.Promise) {
    return opt_value;
  }
  return new promise.Promise(function(fulfill) {
    fulfill(opt_value);
  });
};


/**
 * Creates a promise that has been rejected with the given reason.
 * @param {*=} opt_reason The rejection reason; may be any value, but is
 *     usually an Error or a string.
 * @return {!promise.Promise.<T>} The rejected promise.
 * @template T
 */
promise.rejected = function(opt_reason) {
  if (opt_reason instanceof promise.Promise) {
    return opt_reason;
  }
  return new promise.Promise(function(_, reject) {
    reject(opt_reason);
  });
};


/**
 * Wraps a function that is assumed to be a node-style callback as its final
 * argument. This callback takes two arguments: an error value (which will be
 * null if the call succeeded), and the success value as the second argument.
 * If the call fails, the returned promise will be rejected, otherwise it will
 * be resolved with the result.
 * @param {!Function} fn The function to wrap.
 * @param {...?} var_args The arguments to apply to the function, excluding the
 *     final callback.
 * @return {!promise.Promise} A promise that will be resolved with the
 *     result of the provided function's callback.
 */
promise.checkedNodeCall = function(fn, var_args) {
  var args = goog.array.slice(arguments, 1);
  return new promise.Promise(function(fulfill, reject) {
    try {
      args.push(function(error, value) {
        error ? reject(error) : fulfill(value);
      });
      fn.apply(undefined, args);
    } catch (ex) {
      reject(ex);
    }
  });
};


/**
 * Registers an observer on a promised {@code value}, returning a new promise
 * that will be resolved when the value is. If {@code value} is not a promise,
 * then the return promise will be immediately resolved.
 * @param {*} value The value to observe.
 * @param {Function=} opt_callback The function to call when the value is
 *     resolved successfully.
 * @param {Function=} opt_errback The function to call when the value is
 *     rejected.
 * @return {!promise.Promise} A new promise.
 */
promise.when = function(value, opt_callback, opt_errback) {
  if (promise.Thenable.isImplementation(value)) {
    return value.then(opt_callback, opt_errback);
  }

  return new promise.Promise(function(fulfill, reject) {
    promise.asap(value, fulfill, reject);
  }).then(opt_callback, opt_errback);
};


/**
 * Invokes the appropriate callback function as soon as a promised
 * {@code value} is resolved. This function is similar to
 * {@link promise.when}, except it does not return a new promise.
 * @param {*} value The value to observe.
 * @param {Function} callback The function to call when the value is
 *     resolved successfully.
 * @param {Function=} opt_errback The function to call when the value is
 *     rejected.
 */
promise.asap = function(value, callback, opt_errback) {
  if (promise.isPromise(value)) {
    value.then(callback, opt_errback);

  // Maybe a Dojo-like deferred object?
  } else if (!!value && goog.isObject(value) &&
      goog.isFunction(value.addCallbacks)) {
    value.addCallbacks(callback, opt_errback);

  // A raw value, return a resolved promise.
  } else if (callback) {
    callback(value);
  }
};


/**
 * Given an array of promises, will return a promise that will be fulfilled
 * with the fulfillment values of the input array's values. If any of the
 * input array's promises are rejected, the returned promise will be rejected
 * with the same reason.
 *
 * @param {!Array.<(T|!promise.Promise.<T>)>} arr An array of
 *     promises to wait on.
 * @return {!promise.Promise.<!Array.<T>>} A promise that is
 *     fulfilled with an array containing the fulfilled values of the
 *     input array, or rejected with the same reason as the first
 *     rejected value.
 * @template T
 */
promise.all = function(arr) {
  var n = arr.length;
  if (!n) {
    return promise.fulfilled([]);
  }

  var toFulfill = n;
  var result = promise.defer();
  var values = [];

  var onFulfill = function(index, value) {
    values[index] = value;
    toFulfill--;
    if (toFulfill == 0) {
      result.fulfill(values);
    }
  };

  for (var i = 0; i < n; ++i) {
    promise.asap(
        arr[i], goog.partial(onFulfill, i), result.reject);
  }

  return result.promise;
};


/**
 * Calls a function for each element in an array and inserts the result into a
 * new array, which is used as the fulfillment value of the promise returned
 * by this function.
 *
 * <p>If the return value of the mapping function is a promise, this function
 * will wait for it to be fulfilled before inserting it into the new array.
 *
 * <p>If the mapping function throws or returns a rejected promise, the
 * promise returned by this function will be rejected with the same reason.
 * Only the first failure will be reported; all subsequent errors will be
 * silently ignored.
 *
 * @param {!(Array.<TYPE>|promise.Promise.<!Array.<TYPE>>)} arr The
 *     array to iterator over, or a promise that will resolve to said array.
 * @param {function(this: SELF, TYPE, number, !Array.<TYPE>): ?} fn The
 *     function to call for each element in the array. This function should
 *     expect three arguments (the element, the index, and the array itself.
 * @param {SELF=} opt_self The object to be used as the value of 'this' within
 *     {@code fn}.
 * @template TYPE, SELF
 */
promise.map = function(arr, fn, opt_self) {
  return promise.when(arr, function(arr) {
    var result = goog.array.map(arr, fn, opt_self);
    return promise.all(result);
  });
};


/**
 * Calls a function for each element in an array, and if the function returns
 * true adds the element to a new array.
 *
 * <p>If the return value of the filter function is a promise, this function
 * will wait for it to be fulfilled before determining whether to insert the
 * element into the new array.
 *
 * <p>If the filter function throws or returns a rejected promise, the promise
 * returned by this function will be rejected with the same reason. Only the
 * first failure will be reported; all subsequent errors will be silently
 * ignored.
 *
 * @param {!(Array.<TYPE>|promise.Promise.<!Array.<TYPE>>)} arr The
 *     array to iterator over, or a promise that will resolve to said array.
 * @param {function(this: SELF, TYPE, number, !Array.<TYPE>): (
 *             boolean|promise.Promise.<boolean>)} fn The function
 *     to call for each element in the array.
 * @param {SELF=} opt_self The object to be used as the value of 'this' within
 *     {@code fn}.
 * @template TYPE, SELF
 */
promise.filter = function(arr, fn, opt_self) {
  return promise.when(arr, function(arr) {
    var originalValues = goog.array.clone(arr);
    return promise.map(arr, fn, opt_self).then(function(include) {
      return goog.array.filter(originalValues, function(value, index) {
        return include[index];
      });
    });
  });
};


/**
 * Returns a promise that will be resolved with the input value in a
 * fully-resolved state. If the value is an array, each element will be fully
 * resolved. Likewise, if the value is an object, all keys will be fully
 * resolved. In both cases, all nested arrays and objects will also be
 * fully resolved.  All fields are resolved in place; the returned promise will
 * resolve on {@code value} and not a copy.
 *
 * Warning: This function makes no checks against objects that contain
 * cyclical references:
 * <pre><code>
 *   var value = {};
 *   value['self'] = value;
 *   promise.fullyResolved(value);  // Stack overflow.
 * </code></pre>
 *
 * @param {*} value The value to fully resolve.
 * @return {!promise.Promise} A promise for a fully resolved version
 *     of the input value.
 */
promise.fullyResolved = function(value) {
  if (promise.isPromise(value)) {
    return promise.when(value, promise.fullyResolveValue_);
  }
  return promise.fullyResolveValue_(value);
};


/**
 * @param {*} value The value to fully resolve. If a promise, assumed to
 *     already be resolved.
 * @return {!promise.Promise} A promise for a fully resolved version
 *     of the input value.
 * @private
 */
promise.fullyResolveValue_ = function(value) {
  switch (goog.typeOf(value)) {
    case 'array':
      return promise.fullyResolveKeys_(
          /** @type {!Array} */ (value));

    case 'object':
      if (promise.isPromise(value)) {
        // We get here when the original input value is a promise that
        // resolves to itself. When the user provides us with such a promise,
        // trust that it counts as a "fully resolved" value and return it.
        // Of course, since it's already a promise, we can just return it
        // to the user instead of wrapping it in another promise.
        return /** @type {!promise.Promise} */ (value);
      }

      if (goog.isNumber(value.nodeType) &&
          goog.isObject(value.ownerDocument) &&
          goog.isNumber(value.ownerDocument.nodeType)) {
        // DOM node; return early to avoid infinite recursion. Should we
        // only support objects with a certain level of nesting?
        return promise.fulfilled(value);
      }

      return promise.fullyResolveKeys_(
          /** @type {!Object} */ (value));

    default:  // boolean, function, null, number, string, undefined
      return promise.fulfilled(value);
  }
};


/**
 * @param {!(Array|Object)} obj the object to resolve.
 * @return {!promise.Promise} A promise that will be resolved with the
 *     input object once all of its values have been fully resolved.
 * @private
 */
promise.fullyResolveKeys_ = function(obj) {
  var isArray = goog.isArray(obj);
  var numKeys = isArray ? obj.length : goog.object.getCount(obj);
  if (!numKeys) {
    return promise.fulfilled(obj);
  }

  var numResolved = 0;
  return new promise.Promise(function(fulfill, reject) {
    // In pre-IE9, goog.array.forEach will not iterate properly over arrays
    // containing undefined values because "index in array" returns false
    // when array[index] === undefined (even for x = [undefined, 1]). To get
    // around this, we need to use our own forEach implementation.
    // DO NOT REMOVE THIS UNTIL WE NO LONGER SUPPORT IE8. This cannot be
    // reproduced in IE9 by changing the browser/document modes, it requires an
    // actual pre-IE9 browser.  Yay, IE!
    var forEachKey = !isArray ? goog.object.forEach : function(arr, fn) {
      var n = arr.length;
      for (var i = 0; i < n; ++i) {
        fn.call(null, arr[i], i, arr);
      }
    };

    forEachKey(obj, function(partialValue, key) {
      var type = goog.typeOf(partialValue);
      if (type != 'array' && type != 'object') {
        maybeResolveValue();
        return;
      }

      promise.fullyResolved(partialValue).then(
          function(resolvedValue) {
            obj[key] = resolvedValue;
            maybeResolveValue();
          },
          reject);
    });

    function maybeResolveValue() {
      if (++numResolved == numKeys) {
        fulfill(obj);
      }
    }
  });
};


//////////////////////////////////////////////////////////////////////////////
//
//  promise.ControlFlow
//
//////////////////////////////////////////////////////////////////////////////



/**
 * Handles the execution of scheduled tasks, each of which may be an
 * asynchronous operation. The control flow will ensure tasks are executed in
 * the ordered scheduled, starting each task only once those before it have
 * completed.
 *
 * <p>Each task scheduled within this flow may return a
 * {@link promise.Promise} to indicate it is an asynchronous
 * operation. The ControlFlow will wait for such promises to be resolved before
 * marking the task as completed.
 *
 * <p>Tasks and each callback registered on a {@link promise.Deferred}
 * will be run in their own ControlFlow frame.  Any tasks scheduled within a
 * frame will have priority over previously scheduled tasks. Furthermore, if
 * any of the tasks in the frame fails, the remainder of the tasks in that frame
 * will be discarded and the failure will be propagated to the user through the
 * callback/task's promised result.
 *
 * <p>Each time a ControlFlow empties its task queue, it will fire an
 * {@link promise.ControlFlow.EventType.IDLE} event. Conversely,
 * whenever the flow terminates due to an unhandled error, it will remove all
 * remaining tasks in its queue and fire an
 * {@link promise.ControlFlow.EventType.UNCAUGHT_EXCEPTION} event. If
 * there are no listeners registered with the flow, the error will be
 * rethrown to the global error handler.
 *
 * @param {promise.ControlFlow.Timer=} opt_timer The timer object
 *     to use. Should only be set for testing.
 * @constructor
 * @extends {webdriver.EventEmitter}
 */
promise.ControlFlow = function(opt_timer) {
  webdriver.EventEmitter.call(this);

  /**
   * The timer used by this instance.
   * @type {promise.ControlFlow.Timer}
   */
  this.timer = opt_timer || promise.ControlFlow.defaultTimer;

  /**
   * A list of recent tasks. Each time a new task is started, or a frame is
   * completed, the previously recorded task is removed from this list. If
   * there are multiple tasks, task N+1 is considered a sub-task of task
   * N.
   * @private {!Array.<!promise.Task_>}
   */
  this.history_ = [];

  /**
   * Tracks the active execution frame for this instance. Lazily initialized
   * when the first task is scheduled.
   * @private {promise.Frame_}
   */
  this.activeFrame_ = null;

  /**
   * A reference to the frame in which new tasks should be scheduled. If
   * {@code null}, tasks will be scheduled within the active frame. When forcing
   * a function to run in the context of a new frame, this pointer is used to
   * ensure tasks are scheduled within the newly created frame, even though it
   * won't be active yet.
   * @private {promise.Frame_}
   * @see {#runInNewFrame_}
   */
  this.schedulingFrame_ = null;

  /**
   * Timeout ID set when the flow is about to shutdown without any errors
   * being detected. Upon shutting down, the flow will emit an
   * {@link promise.ControlFlow.EventType.IDLE} event. Idle events
   * always follow a brief timeout in order to catch latent errors from the last
   * completed task. If this task had a callback registered, but no errback, and
   * the task fails, the unhandled failure would not be reported by the promise
   * system until the next turn of the event loop:
   *
   *   // Schedule 1 task that fails.
   *   var result = webriver.promise.controlFlow().schedule('example',
   *       function() { return promise.rejected('failed'); });
   *   // Set a callback on the result. This delays reporting the unhandled
   *   // failure for 1 turn of the event loop.
   *   result.then(goog.nullFunction);
   *
   * @private {?number}
   */
  this.shutdownId_ = null;

  /**
   * Interval ID for this instance's event loop.
   * @private {?number}
   */
  this.eventLoopId_ = null;

  /**
   * The number of "pending" promise rejections.
   *
   * <p>Each time a promise is rejected and is not handled by a listener, it
   * will schedule a 0-based timeout to check if it is still unrejected in the
   * next turn of the JS-event loop. This allows listeners to attach to, and
   * handle, the rejected promise at any point in same turn of the event loop
   * that the promise was rejected.
   *
   * <p>When this flow's own event loop triggers, it will not run if there
   * are any outstanding promise rejections. This allows unhandled promises to
   * be reported before a new task is started, ensuring the error is reported
   * to the current task queue.
   *
   * @private {number}
   */
  this.pendingRejections_ = 0;

  /**
   * The number of aborted frames since the last time a task was executed or a
   * frame completed successfully.
   * @private {number}
   */
  this.numAbortedFrames_ = 0;
};
goog.inherits(promise.ControlFlow, webdriver.EventEmitter);


/**
 * @typedef {{clearInterval: function(number),
 *            clearTimeout: function(number),
 *            setInterval: function(!Function, number): number,
 *            setTimeout: function(!Function, number): number}}
 */
promise.ControlFlow.Timer;


/**
 * The default timer object, which uses the global timer functions.
 * @type {promise.ControlFlow.Timer}
 */
promise.ControlFlow.defaultTimer = (function() {
  // The default timer functions may be defined as free variables for the
  // current context, so do not reference them using "window" or
  // "goog.global".  Also, we must invoke them in a closure, and not using
  // bind(), so we do not get "TypeError: Illegal invocation" (WebKit) or
  // "Invalid calling object" (IE) errors.
  return {
    clearInterval: wrap(clearInterval),
    clearTimeout: wrap(clearTimeout),
    setInterval: wrap(setInterval),
    setTimeout: wrap(setTimeout)
  };

  function wrap(fn) {
    return function() {
      // Cannot use .call() or .apply() since we do not know which variable
      // the function is bound to, and using the wrong one will generate
      // an error.
      return fn(arguments[0], arguments[1]);
    };
  }
})();


/**
 * Events that may be emitted by an {@link promise.ControlFlow}.
 * @enum {string}
 */
promise.ControlFlow.EventType = {

  /** Emitted when all tasks have been successfully executed. */
  IDLE: 'idle',

  /** Emitted when a ControlFlow has been reset. */
  RESET: 'reset',

  /** Emitted whenever a new task has been scheduled. */
  SCHEDULE_TASK: 'scheduleTask',

  /**
   * Emitted whenever a control flow aborts due to an unhandled promise
   * rejection. This event will be emitted along with the offending rejection
   * reason. Upon emitting this event, the control flow will empty its task
   * queue and revert to its initial state.
   */
  UNCAUGHT_EXCEPTION: 'uncaughtException'
};


/**
 * How often, in milliseconds, the event loop should run.
 * @type {number}
 * @const
 */
promise.ControlFlow.EVENT_LOOP_FREQUENCY = 10;


/**
 * Resets this instance, clearing its queue and removing all event listeners.
 */
promise.ControlFlow.prototype.reset = function() {
  this.activeFrame_ = null;
  this.clearHistory();
  this.emit(promise.ControlFlow.EventType.RESET);
  this.removeAllListeners();
  this.cancelShutdown_();
  this.cancelEventLoop_();
};


/**
 * Returns a summary of the recent task activity for this instance. This
 * includes the most recently completed task, as well as any parent tasks. In
 * the returned summary, the task at index N is considered a sub-task of the
 * task at index N+1.
 * @return {!Array.<string>} A summary of this instance's recent task
 *     activity.
 */
promise.ControlFlow.prototype.getHistory = function() {
  var pendingTasks = [];
  var currentFrame = this.activeFrame_;
  while (currentFrame) {
    var task = currentFrame.getPendingTask();
    if (task) {
      pendingTasks.push(task);
    }
    // A frame's parent node will always be another frame.
    currentFrame =
        /** @type {promise.Frame_} */ (currentFrame.getParent());
  }

  var fullHistory = goog.array.concat(this.history_, pendingTasks);
  return goog.array.map(fullHistory, function(task) {
    return task.toString();
  });
};


/** Clears this instance's task history. */
promise.ControlFlow.prototype.clearHistory = function() {
  this.history_ = [];
};


/**
 * Removes a completed task from this instance's history record. If any
 * tasks remain from aborted frames, those will be removed as well.
 * @private
 */
promise.ControlFlow.prototype.trimHistory_ = function() {
  if (this.numAbortedFrames_) {
    goog.array.splice(this.history_,
        this.history_.length - this.numAbortedFrames_,
        this.numAbortedFrames_);
    this.numAbortedFrames_ = 0;
  }
  this.history_.pop();
};


/**
 * Property used to track whether an error has been annotated by
 * {@link promise.ControlFlow#annotateError}.
 * @private {string}
 * @const
 */
promise.ControlFlow.ANNOTATION_PROPERTY_ = 'promise_error_';


/**
 * Appends a summary of this instance's recent task history to the given
 * error's stack trace. This function will also ensure the error's stack trace
 * is in canonical form.
 * @param {!(Error|goog.testing.JsUnitException)} e The error to annotate.
 * @return {!(Error|goog.testing.JsUnitException)} The annotated error.
 */
promise.ControlFlow.prototype.annotateError = function(e) {
  if (!!e[promise.ControlFlow.ANNOTATION_PROPERTY_]) {
    return e;
  }

  var history = this.getHistory();
  if (history.length) {
    e = webdriver.stacktrace.format(e);

    /** @type {!Error} */(e).stack += [
      '\n==== async task ====\n',
      history.join('\n==== async task ====\n')
    ].join('');

    e[promise.ControlFlow.ANNOTATION_PROPERTY_] = true;
  }

  return e;
};


/**
 * @return {string} The scheduled tasks still pending with this instance.
 */
promise.ControlFlow.prototype.getSchedule = function() {
  return this.activeFrame_ ? this.activeFrame_.getRoot().toString() : '[]';
};


/**
 * Schedules a task for execution. If there is nothing currently in the
 * queue, the task will be executed in the next turn of the event loop. If
 * the task function is a generator, the task will be executed using
 * {@link promise.consume}.
 *
 * @param {function(): (T|promise.Promise.<T>)} fn The function to
 *     call to start the task. If the function returns a
 *     {@link promise.Promise}, this instance will wait for it to be
 *     resolved before starting the next task.
 * @param {string=} opt_description A description of the task.
 * @return {!promise.Promise.<T>} A promise that will be resolved
 *     with the result of the action.
 * @template T
 */
promise.ControlFlow.prototype.execute = function(fn, opt_description) {
  if (promise.isGenerator(fn)) {
    fn = goog.partial(promise.consume, fn);
  }

  this.cancelShutdown_();

  if (!this.activeFrame_) {
    this.activeFrame_ = new promise.Frame_(this);
  }

  // Trim an extra frame off the generated stack trace for the call to this
  // function.
  var snapshot = new webdriver.stacktrace.Snapshot(1);
  var task = new promise.Task_(
      this, fn, opt_description || '', snapshot);
  var scheduleIn = this.schedulingFrame_ || this.activeFrame_;
  scheduleIn.addChild(task);

  this.emit(promise.ControlFlow.EventType.SCHEDULE_TASK, opt_description);

  this.scheduleEventLoopStart_();
  return task.promise;
};


/**
 * Inserts a {@code setTimeout} into the command queue. This is equivalent to
 * a thread sleep in a synchronous programming language.
 *
 * @param {number} ms The timeout delay, in milliseconds.
 * @param {string=} opt_description A description to accompany the timeout.
 * @return {!promise.Promise} A promise that will be resolved with
 *     the result of the action.
 */
promise.ControlFlow.prototype.timeout = function(ms, opt_description) {
  return this.execute(function() {
    return promise.delayed(ms);
  }, opt_description);
};


/**
 * Schedules a task that shall wait for a condition to hold. Each condition
 * function may return any value, but it will always be evaluated as a boolean.
 *
 * <p>Condition functions may schedule sub-tasks with this instance, however,
 * their execution time will be factored into whether a wait has timed out.
 *
 * <p>In the event a condition returns a Promise, the polling loop will wait for
 * it to be resolved before evaluating whether the condition has been satisfied.
 * The resolution time for a promise is factored into whether a wait has timed
 * out.
 *
 * <p>If the condition function throws, or returns a rejected promise, the
 * wait task will fail.
 *
 * @param {function(): T} condition The condition function to poll.
 * @param {number} timeout How long to wait, in milliseconds, for the condition
 *     to hold before timing out.
 * @param {string=} opt_message An optional error message to include if the
 *     wait times out; defaults to the empty string.
 * @return {!promise.Promise.<T>} A promise that will be fulfilled
 *     when the condition has been satisified. The promise shall be rejected if
 *     the wait times out waiting for the condition.
 * @template T
 */
promise.ControlFlow.prototype.wait = function(condition, timeout, opt_message) {
  var sleep = Math.min(timeout, 100);
  var self = this;

  if (promise.isGenerator(condition)) {
    condition = goog.partial(promise.consume, condition);
  }

  return this.execute(function() {
    var startTime = goog.now();
    var waitResult = new promise.Deferred();
    var waitFrame = self.activeFrame_;
    waitFrame.isWaiting = true;
    pollCondition();
    return waitResult.promise;

    function pollCondition() {
      self.runInNewFrame_(condition, function(value) {
        var elapsed = goog.now() - startTime;
        if (!!value) {
          waitFrame.isWaiting = false;
          waitResult.fulfill(value);
        } else if (elapsed >= timeout) {
          waitResult.reject(new Error((opt_message ? opt_message + '\n' : '') +
              'Wait timed out after ' + elapsed + 'ms'));
        } else {
          self.timer.setTimeout(pollCondition, sleep);
        }
      }, waitResult.reject, true);
    }
  }, opt_message);
};


/**
 * Schedules a task that will wait for another promise to resolve.  The resolved
 * promise's value will be returned as the task result.
 * @param {!promise.Promise} promise The promise to wait on.
 * @return {!promise.Promise} A promise that will resolve when the
 *     task has completed.
 */
promise.ControlFlow.prototype.await = function(promise) {
  return this.execute(function() {
    return promise;
  });
};


/**
 * Schedules the interval for this instance's event loop, if necessary.
 * @private
 */
promise.ControlFlow.prototype.scheduleEventLoopStart_ = function() {
  if (!this.eventLoopId_) {
    this.eventLoopId_ = this.timer.setInterval(
        goog.bind(this.runEventLoop_, this),
        promise.ControlFlow.EVENT_LOOP_FREQUENCY);
  }
};


/**
 * Cancels the event loop, if necessary.
 * @private
 */
promise.ControlFlow.prototype.cancelEventLoop_ = function() {
  if (this.eventLoopId_) {
    this.timer.clearInterval(this.eventLoopId_);
    this.eventLoopId_ = null;
  }
};


/**
 * Executes the next task for the current frame. If the current frame has no
 * more tasks, the frame's result will be resolved, returning control to the
 * frame's creator. This will terminate the flow if the completed frame was at
 * the top of the stack.
 * @private
 */
promise.ControlFlow.prototype.runEventLoop_ = function() {
  // If we get here and there are pending promise rejections, then those
  // promises are queued up to run as soon as this (JS) event loop terminates.
  // Short-circuit our loop to give those promises a chance to run. Otherwise,
  // we might start a new task only to have it fail because of one of these
  // pending rejections.
  if (this.pendingRejections_) {
    return;
  }

  // If the flow aborts due to an unhandled exception after we've scheduled
  // another turn of the execution loop, we can end up in here with no tasks
  // left. This is OK, just quietly return.
  if (!this.activeFrame_) {
    this.commenceShutdown_();
    return;
  }

  var task;
  if (this.activeFrame_.getPendingTask() || !(task = this.getNextTask_())) {
    // Either the current frame is blocked on a pending task, or we don't have
    // a task to finish because we've completed a frame. When completing a
    // frame, we must abort the event loop to allow the frame's promise's
    // callbacks to execute.
    return;
  }

  var activeFrame = this.activeFrame_;
  activeFrame.setPendingTask(task);
  var markTaskComplete = goog.bind(function() {
    this.history_.push(/** @type {!promise.Task_} */ (task));
    activeFrame.setPendingTask(null);
  }, this);

  this.trimHistory_();
  this.runInNewFrame_(task.execute, function(result) {
    markTaskComplete();
    task.fulfill(result);
  }, function(error) {
    markTaskComplete();
    task.reject(error);
  }, true);
};


/**
 * @return {promise.Task_} The next task to execute, or
 *     {@code null} if a frame was resolved.
 * @private
 */
promise.ControlFlow.prototype.getNextTask_ = function() {
  var frame = this.activeFrame_;
  var firstChild = frame.getFirstChild();
  if (!firstChild) {
    if (!frame.isWaiting) {
      this.resolveFrame_(frame);
    }
    return null;
  }

  if (firstChild instanceof promise.Frame_) {
    this.activeFrame_ = firstChild;
    return this.getNextTask_();
  }

  frame.removeChild(firstChild);
  return firstChild;
};


/**
 * @param {!promise.Frame_} frame The frame to resolve.
 * @private
 */
promise.ControlFlow.prototype.resolveFrame_ = function(frame) {
  if (this.activeFrame_ === frame) {
    // Frame parent is always another frame, but the compiler is not smart
    // enough to recognize this.
    this.activeFrame_ =
        /** @type {promise.Frame_} */ (frame.getParent());
  }

  if (frame.getParent()) {
    frame.getParent().removeChild(frame);
  }
  this.trimHistory_();
  frame.close();

  if (!this.activeFrame_) {
    this.commenceShutdown_();
  }
};


/**
 * Aborts the current frame. The frame, and all of the tasks scheduled within it
 * will be discarded. If this instance does not have an active frame, it will
 * immediately terminate all execution.
 * @param {*} error The reason the frame is being aborted; typically either
 *     an Error or string.
 * @private
 */
promise.ControlFlow.prototype.abortFrame_ = function(error) {
  // Annotate the error value if it is Error-like.
  if (promise.isError_(error)) {
    this.annotateError(/** @type {!Error} */ (error));
  }
  this.numAbortedFrames_++;

  if (!this.activeFrame_) {
    this.abortNow_(error);
    return;
  }

  // Frame parent is always another frame, but the compiler is not smart
  // enough to recognize this.
  var parent = /** @type {promise.Frame_} */ (
      this.activeFrame_.getParent());
  if (parent) {
    parent.removeChild(this.activeFrame_);
  }

  var frame = this.activeFrame_;
  this.activeFrame_ = parent;
  frame.abort(error);
};


/**
 * Executes a function in a new frame. If the function does not schedule any new
 * tasks, the frame will be discarded and the function's result returned
 * immediately. Otherwise, a promise will be returned. This promise will be
 * resolved with the function's result once all of the tasks scheduled within
 * the function have been completed. If the function's frame is aborted, the
 * returned promise will be rejected.
 *
 * @param {!Function} fn The function to execute.
 * @param {function(T)} callback The function to call with a successful result.
 * @param {function(*)} errback The function to call if there is an error.
 * @param {boolean=} opt_activate Whether the active frame should be updated to
 *     the newly created frame so tasks are treated as sub-tasks.
 * @template T
 * @private
 */
promise.ControlFlow.prototype.runInNewFrame_ = function(
    fn, callback, errback, opt_activate) {
  var newFrame = new promise.Frame_(this),
      self = this,
      oldFrame = this.activeFrame_;

  try {
    if (!this.activeFrame_) {
      this.activeFrame_ = newFrame;
    } else {
      this.activeFrame_.addChild(newFrame);
    }

    // Activate the new frame to force tasks to be treated as sub-tasks of
    // the parent frame.
    if (opt_activate) {
      this.activeFrame_ = newFrame;
    }

    try {
      this.schedulingFrame_ = newFrame;
      promise.pushFlow_(this);
      var result = fn();
    } finally {
      promise.popFlow_();
      this.schedulingFrame_ = null;
    }
    newFrame.isLocked_ = true;

    // If there was nothing scheduled in the new frame we can discard the
    // frame and return immediately.
    if (!newFrame.children_.length) {
      removeNewFrame();
      promise.asap(result, callback, errback);
      return;
    }

    newFrame.onComplete = function() {
      promise.asap(result, callback, errback);
    };

    newFrame.onAbort = function(e) {
      if (promise.Thenable.isImplementation(result) &&
          result.isPending()) {
        result.cancel(e);
        e = result;
      }
      errback(e);
    };
  } catch (ex) {
    removeNewFrame(ex);
    errback(ex);
  }

  /**
   * @param {*=} opt_err If provided, the reason that the frame was removed.
   */
  function removeNewFrame(opt_err) {
    var parent = newFrame.getParent();
    if (parent) {
      parent.removeChild(newFrame);
    }

    if (opt_err) {
      newFrame.cancelRemainingTasks(
          'Tasks cancelled due to uncaught error: ' + opt_err);
    }
    self.activeFrame_ = oldFrame;
  }
};


/**
 * Commences the shutdown sequence for this instance. After one turn of the
 * event loop, this object will emit the
 * {@link promise.ControlFlow.EventType.IDLE} event to signal
 * listeners that it has completed. During this wait, if another task is
 * scheduled, the shutdown will be aborted.
 * @private
 */
promise.ControlFlow.prototype.commenceShutdown_ = function() {
  if (!this.shutdownId_) {
    // Go ahead and stop the event loop now.  If we're in here, then there are
    // no more frames with tasks to execute. If we waited to cancel the event
    // loop in our timeout below, the event loop could trigger *before* the
    // timeout, generating an error from there being no frames.
    // If #execute is called before the timeout below fires, it will cancel
    // the timeout and restart the event loop.
    this.cancelEventLoop_();

    var self = this;
    self.shutdownId_ = self.timer.setTimeout(function() {
      self.shutdownId_ = null;
      self.emit(promise.ControlFlow.EventType.IDLE);
    }, 0);
  }
};


/**
 * Cancels the shutdown sequence if it is currently scheduled.
 * @private
 */
promise.ControlFlow.prototype.cancelShutdown_ = function() {
  if (this.shutdownId_) {
    this.timer.clearTimeout(this.shutdownId_);
    this.shutdownId_ = null;
  }
};


/**
 * Aborts this flow, abandoning all remaining tasks. If there are
 * listeners registered, an {@code UNCAUGHT_EXCEPTION} will be emitted with the
 * offending {@code error}, otherwise, the {@code error} will be rethrown to the
 * global error handler.
 * @param {*} error Object describing the error that caused the flow to
 *     abort; usually either an Error or string value.
 * @private
 */
promise.ControlFlow.prototype.abortNow_ = function(error) {
  this.activeFrame_ = null;
  this.cancelShutdown_();
  this.cancelEventLoop_();

  var listeners = this.listeners(
      promise.ControlFlow.EventType.UNCAUGHT_EXCEPTION);
  if (!listeners.length) {
    this.timer.setTimeout(function() {
      throw error;
    }, 0);
  } else {
    this.emit(promise.ControlFlow.EventType.UNCAUGHT_EXCEPTION,
        error);
  }
};



/**
 * An execution frame within a {@link promise.ControlFlow}.  Each
 * frame represents the execution context for either a
 * {@link promise.Task_} or a callback on a
 * {@link promise.Deferred}.
 *
 * <p>Each frame may contain sub-frames.  If child N is a sub-frame, then the
 * items queued within it are given priority over child N+1.
 *
 * @param {!promise.ControlFlow} flow The flow this instance belongs
 *     to.
 * @constructor
 * @private
 * @final
 * @struct
 */
promise.Frame_ = function(flow) {
  /** @private {!promise.ControlFlow} */
  this.flow_ = flow;

  /** @private {promise.Frame_} */
  this.parent_ = null;

  /**
   * @private {!Array.<!(promise.Frame_|promise.Task_)>}
   */
  this.children_ = [];


  /** @private {(promise.Frame_|promise.Task_)} */
  this.lastInsertedChild_ = null;

  /**
   * The task currently being executed within this frame.
   * @private {promise.Task_}
   */
  this.pendingTask_ = null;

  /**
   * Whether this frame is currently locked. A locked frame represents an
   * executed function that has scheduled all of its tasks.
   *
   * <p>Once a frame becomes locked, any new frames which are added as children
   * represent interrupts (such as a {@link promise.Promise}
   * callback) whose tasks must be given priority over those already scheduled
   * within this frame. For example:
   * <code><pre>
   *   var flow = promise.controlFlow();
   *   flow.execute('start here', goog.nullFunction).then(function() {
   *     flow.execute('this should execute 2nd', goog.nullFunction);
   *   });
   *   flow.execute('this should execute last', goog.nullFunction);
   * </pre></code>
   *
   * @private {boolean}
   */
  this.isLocked_ = false;

  /** @type {boolean} */
  this.isWaiting = false;

  /**
   * The function to notify if this frame executes without error.
   * @type {?function()}
   */
  this.onComplete = null;

  /**
   * The function to notify if this frame is aborted with an error.
   * @type {?function(*)}
   */
  this.onAbort = null;
};


/** @return {promise.Frame_} This frame's parent, if any. */
promise.Frame_.prototype.getParent = function() {
  return this.parent_;
};


/**
 * @param {promise.Frame_} parent This frame's new parent.
 */
promise.Frame_.prototype.setParent = function(parent) {
  this.parent_ = parent;
};


/**
 * @return {!promise.Frame_} The root of this frame's tree.
 */
promise.Frame_.prototype.getRoot = function() {
  var root = this;
  while (root.parent_) {
    root = root.parent_;
  }
  return root;
};


/**
 * Aborts the execution of this frame, cancelling all outstanding tasks
 * scheduled within this frame.
 *
 * @param {*} error The error that triggered this abortion.
 */
promise.Frame_.prototype.abort = function(error) {
  this.cancelRemainingTasks(
      'Task discarded due to a previous task failure: ' + error);

  var frame = this;
  frame.flow_.pendingRejections_ += 1;
  this.flow_.timer.setTimeout(function() {
    frame.flow_.pendingRejections_ -= 1;
    if (frame.onAbort) {
      frame.notify_(frame.onAbort, error);
    } else {
      frame.flow_.abortFrame_(error);
    }
  }, 0);
};


/**
 * Signals that this frame has successfully finished executing.
 */
promise.Frame_.prototype.close = function() {
  var frame = this;
  this.flow_.timer.setTimeout(function() {
    frame.notify_(frame.onComplete);
  }, 0);
};


/**
 * @param {?(function(*)|function())} fn The function to notify.
 * @param {*=} opt_error Value to pass to the notified function, if any.
 * @private
 */
promise.Frame_.prototype.notify_ = function(fn, opt_error) {
  this.onAbort = this.onComplete = null;
  if (fn) {
    fn(opt_error);
  }
};


/**
 * Marks all of the tasks that are descendants of this frame in the execution
 * tree as cancelled. This is necessary for callbacks scheduled asynchronous.
 * For example:
 *
 *     var someResult;
 *     promise.createFlow(function(flow) {
 *       someResult = flow.execute(function() {});
 *       throw Error();
 *     }).addErrback(function(err) {
 *       console.log('flow failed: ' + err);
 *       someResult.then(function() {
 *         console.log('task succeeded!');
 *       }, function(err) {
 *         console.log('task failed! ' + err);
 *       });
 *     });
 *     // flow failed: Error: boom
 *     // task failed! CancelledTaskError: Task discarded due to a previous
 *     // task failure: Error: boom
 *
 * @param {string} reason The cancellation reason.
 */
promise.Frame_.prototype.cancelRemainingTasks = function(reason) {
  goog.array.forEach(this.children_, function(child) {
    if (child instanceof promise.Frame_) {
      child.cancelRemainingTasks(reason);
    } else {
      // None of the previously registered listeners should be notified that
      // the task is being canceled, however, we need at least one errback
      // to prevent the cancellation from bubbling up.
      child.listeners_ = null;
      child.promise.thenCatch(goog.nullFunction);
      child.cancel(reason);
    }
  });
};


/**
 * @return {promise.Task_} The task currently executing
 *     within this frame, if any.
 */
promise.Frame_.prototype.getPendingTask = function() {
  return this.pendingTask_;
};


/**
 * @param {promise.Task_} task The task currently
 *     executing within this frame, if any.
 */
promise.Frame_.prototype.setPendingTask = function(task) {
  this.pendingTask_ = task;
};


/**
 * Adds a new node to this frame.
 * @param {!(promise.Frame_|promise.Task_)} node
 *     The node to insert.
 */
promise.Frame_.prototype.addChild = function(node) {
  if (this.lastInsertedChild_ &&
      this.lastInsertedChild_ instanceof promise.Frame_ &&
      !this.lastInsertedChild_.isLocked_) {
    this.lastInsertedChild_.addChild(node);
    return;
  }

  if (node instanceof promise.Frame_) {
    node.setParent(this);
  }

  if (this.isLocked_ && node instanceof promise.Frame_) {
    var index = 0;
    if (this.lastInsertedChild_ instanceof
        promise.Frame_) {
      index = goog.array.indexOf(this.children_, this.lastInsertedChild_) + 1;
    }
    goog.array.insertAt(this.children_, node, index);
    this.lastInsertedChild_ = node;
    return;
  }

  this.lastInsertedChild_ = node;
  this.children_.push(node);
};


/**
 * @return {(promise.Frame_|promise.Task_)} This frame's
 *     fist child.
 */
promise.Frame_.prototype.getFirstChild = function() {
  this.isLocked_ = true;
  this.lastInsertedChild_ = null;
  return this.children_[0];
};


/**
 * Removes a child from this frame.
 * @param {!(promise.Frame_|promise.Task_)} child
 *     The child to remove.
 */
promise.Frame_.prototype.removeChild = function(child) {
  var index = goog.array.indexOf(this.children_, child);
  if (child instanceof promise.Frame_) {
    child.setParent(null);
  }
  goog.array.removeAt(this.children_, index);
  if (this.lastInsertedChild_ === child) {
    this.lastInsertedChild_ = null;
  }
};


/** @override */
promise.Frame_.prototype.toString = function() {
  return '[' + goog.array.map(this.children_, function(child) {
    return child.toString();
  }).join(', ') + ']';
};



/**
 * A task to be executed by a {@link promise.ControlFlow}.
 *
 * @param {!promise.ControlFlow} flow The flow this instances belongs
 *     to.
 * @param {function(): (T|!promise.Promise.<T>)} fn The function to
 *     call when the task executes. If it returns a
 *     {@link promise.Promise}, the flow will wait for it to be
 *     resolved before starting the next task.
 * @param {string} description A description of the task for debugging.
 * @param {!webdriver.stacktrace.Snapshot} snapshot A snapshot of the stack
 *     when this task was scheduled.
 * @constructor
 * @extends {promise.Deferred.<T>}
 * @template T
 * @private
 */
promise.Task_ = function(flow, fn, description, snapshot) {
  promise.Deferred.call(this, flow);

  /**
   * @type {function(): (T|!promise.Promise.<T>)}
   */
  this.execute = fn;

  /** @private {string} */
  this.description_ = description;

  /** @private {!webdriver.stacktrace.Snapshot} */
  this.snapshot_ = snapshot;
};
goog.inherits(promise.Task_, promise.Deferred);


/** @return {string} This task's description. */
promise.Task_.prototype.getDescription = function() {
  return this.description_;
};


/** @override */
promise.Task_.prototype.toString = function() {
  var stack = this.snapshot_.getStacktrace();
  var ret = this.description_;
  if (stack.length) {
    if (this.description_) {
      ret += '\n';
    }
    ret += stack.join('\n');
  }
  return ret;
};



/**
 * The default flow to use if no others are active.
 * @private {!promise.ControlFlow}
 */
promise.defaultFlow_ = new promise.ControlFlow();


/**
 * A stack of active control flows, with the top of the stack used to schedule
 * commands. When there are multiple flows on the stack, the flow at index N
 * represents a callback triggered within a task owned by the flow at index
 * N-1.
 * @private {!Array.<!promise.ControlFlow>}
 */
promise.activeFlows_ = [];


/**
 * Changes the default flow to use when no others are active.
 * @param {!promise.ControlFlow} flow The new default flow.
 * @throws {Error} If the default flow is not currently active.
 */
promise.setDefaultFlow = function(flow) {
  if (promise.activeFlows_.length) {
    throw Error('You may only change the default flow while it is active');
  }
  promise.defaultFlow_ = flow;
};


/**
 * @return {!promise.ControlFlow} The currently active control flow.
 */
promise.controlFlow = function() {
  return /** @type {!promise.ControlFlow} */ (
      goog.array.peek(promise.activeFlows_) ||
      promise.defaultFlow_);
};


/**
 * @param {!promise.ControlFlow} flow The new flow.
 * @private
 */
promise.pushFlow_ = function(flow) {
  promise.activeFlows_.push(flow);
};


/** @private */
promise.popFlow_ = function() {
  promise.activeFlows_.pop();
};


/**
 * Creates a new control flow. The provided callback will be invoked as the
 * first task within the new flow, with the flow as its sole argument. Returns
 * a promise that resolves to the callback result.
 * @param {function(!promise.ControlFlow)} callback The entry point
 *     to the newly created flow.
 * @return {!promise.Promise} A promise that resolves to the callback
 *     result.
 */
promise.createFlow = function(callback) {
  var flow = new promise.ControlFlow(
      promise.defaultFlow_.timer);
  return flow.execute(function() {
    return callback(flow);
  });
};


/**
 * Tests is a function is a generator.
 * @param {!Function} fn The function to test.
 * @return {boolean} Whether the function is a generator.
 */
promise.isGenerator = function(fn) {
  return fn.constructor.name === 'GeneratorFunction';
};


/**
 * Consumes a {@code GeneratorFunction}. Each time the generator yields a
 * promise, this function will wait for it to be fulfilled before feeding the
 * fulfilled value back into {@code next}. Likewise, if a yielded promise is
 * rejected, the rejection error will be passed to {@code throw}.
 *
 * <p>Example 1: the Fibonacci Sequence.
 * <pre><code>
 * promise.consume(function* fibonacci() {
 *   var n1 = 1, n2 = 1;
 *   for (var i = 0; i < 4; ++i) {
 *     var tmp = yield n1 + n2;
 *     n1 = n2;
 *     n2 = tmp;
 *   }
 *   return n1 + n2;
 * }).then(function(result) {
 *   console.log(result);  // 13
 * });
 * </code></pre>
 *
 * <p>Example 2: a generator that throws.
 * <pre><code>
 * promise.consume(function* () {
 *   yield promise.delayed(250).then(function() {
 *     throw Error('boom');
 *   });
 * }).thenCatch(function(e) {
 *   console.log(e.toString());  // Error: boom
 * });
 * </code></pre>
 *
 * @param {!Function} generatorFn The generator function to execute.
 * @param {Object=} opt_self The object to use as "this" when invoking the
 *     initial generator.
 * @param {...*} var_args Any arguments to pass to the initial generator.
 * @return {!promise.Promise.<?>} A promise that will resolve to the
 *     generator's final result.
 * @throws {TypeError} If the given function is not a generator.
 */
promise.consume = function(generatorFn, opt_self, var_args) {
  if (!promise.isGenerator(generatorFn)) {
    throw new TypeError('Input is not a GeneratorFunction: ' +
        generatorFn.constructor.name);
  }

  var deferred = promise.defer();
  var generator = generatorFn.apply(opt_self, goog.array.slice(arguments, 2));
  callNext();
  return deferred.promise;

  /** @param {*=} opt_value . */
  function callNext(opt_value) {
    pump(generator.next, opt_value);
  }

  /** @param {*=} opt_error . */
  function callThrow(opt_error) {
    // Dictionary lookup required because Closure compiler's built-in
    // externs does not include GeneratorFunction.prototype.throw.
    pump(generator['throw'], opt_error);
  }

  function pump(fn, opt_arg) {
    if (!deferred.isPending()) {
      return;  // Defererd was cancelled; silently abort.
    }

    try {
      var result = fn.call(generator, opt_arg);
    } catch (ex) {
      deferred.reject(ex);
      return;
    }

    if (result.done) {
      deferred.fulfill(result.value);
      return;
    }

    promise.asap(result.value, callNext, callThrow);
  }
};

});  // goog.scope
