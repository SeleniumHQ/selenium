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

goog.module('webdriver.promise');
goog.module.declareLegacyNamespace();

var Arrays = goog.require('goog.array');
var asserts = goog.require('goog.asserts');
var asyncRun = goog.require('goog.async.run');
var throwException = goog.require('goog.async.throwException');
var DebugError = goog.require('goog.debug.Error');
var Objects = goog.require('goog.object');
var EventEmitter = goog.require('webdriver.EventEmitter');
var stacktrace = goog.require('webdriver.stacktrace');



/**
 * @define {boolean} Whether to append traces of {@code then} to rejection
 *     errors.
 */
goog.define('webdriver.promise.LONG_STACK_TRACES', false);

/** @const */
var promise = exports;


/**
 * Generates an error to capture the current stack trace.
 * @param {string} name Error name for this stack trace.
 * @param {string} msg Message to record.
 * @param {!Function} topFn The function that should appear at the top of the
 *     stack; only applicable in V8.
 * @return {!Error} The generated error.
 */
promise.captureStackTrace = function(name, msg, topFn) {
  var e = Error(msg);
  e.name = name;
  if (Error.captureStackTrace) {
    Error.captureStackTrace(e, topFn);
  } else {
    var stack = stacktrace.getStack(e);
    e.stack = e.toString();
    if (stack) {
      e.stack += '\n' + stack;
    }
  }
  return e;
};


/**
 * Error used when the computation of a promise is cancelled.
 *
 * @param {string=} opt_msg The cancellation message.
 * @constructor
 * @extends {DebugError}
 * @final
 */
promise.CancellationError = function(opt_msg) {
  DebugError.call(this, opt_msg);

  /** @override */
  this.name = 'CancellationError';
};
goog.inherits(promise.CancellationError, DebugError);


/**
 * Wraps the given error in a CancellationError. Will trivially return
 * the error itself if it is an instanceof CancellationError.
 *
 * @param {*} error The error to wrap.
 * @param {string=} opt_msg The prefix message to use.
 * @return {!promise.CancellationError} A cancellation error.
 */
promise.CancellationError.wrap = function(error, opt_msg) {
  if (error instanceof promise.CancellationError) {
    return /** @type {!promise.CancellationError} */(error);
  } else if (opt_msg) {
    var message = opt_msg;
    if (error) {
      message += ': ' + error;
    }
    return new promise.CancellationError(message);
  }
  var message;
  if (error) {
    message = error + '';
  }
  return new promise.CancellationError(message);
};



/**
 * Thenable is a promise-like object with a {@code then} method which may be
 * used to schedule callbacks on a promised value.
 *
 * @interface
 * @extends {IThenable<T>}
 * @template T
 */
promise.Thenable = function() {};


/**
 * Cancels the computation of this promise's value, rejecting the promise in the
 * process. This method is a no-op if the promise has already been resolved.
 *
 * @param {(string|promise.CancellationError)=} opt_reason The reason this
 *     promise is being cancelled.
 */
promise.Thenable.prototype.cancel = function(opt_reason) {};


/** @return {boolean} Whether this promise's value is still being computed. */
promise.Thenable.prototype.isPending = function() {};


/**
 * Registers listeners for when this instance is resolved.
 *
 * @param {?(function(T): (R|IThenable<R>))=} opt_callback The
 *     function to call if this promise is successfully resolved. The function
 *     should expect a single argument: the promise's resolved value.
 * @param {?(function(*): (R|IThenable<R>))=} opt_errback
 *     The function to call if this promise is rejected. The function should
 *     expect a single argument: the rejection reason.
 * @return {!promise.Promise<R>} A new promise which will be
 *     resolved with the result of the invoked callback.
 * @template R
 */
promise.Thenable.prototype.then = function(opt_callback, opt_errback) {};


/**
 * Registers a listener for when this promise is rejected. This is synonymous
 * with the {@code catch} clause in a synchronous API:
 *
 *     // Synchronous API:
 *     try {
 *       doSynchronousWork();
 *     } catch (ex) {
 *       console.error(ex);
 *     }
 *
 *     // Asynchronous promise API:
 *     doAsynchronousWork().thenCatch(function(ex) {
 *       console.error(ex);
 *     });
 *
 * @param {function(*): (R|IThenable<R>)} errback The
 *     function to call if this promise is rejected. The function should
 *     expect a single argument: the rejection reason.
 * @return {!promise.Promise<R>} A new promise which will be
 *     resolved with the result of the invoked callback.
 * @template R
 */
promise.Thenable.prototype.thenCatch = function(errback) {};


/**
 * Registers a listener to invoke when this promise is resolved, regardless
 * of whether the promise's value was successfully computed. This function
 * is synonymous with the {@code finally} clause in a synchronous API:
 *
 *     // Synchronous API:
 *     try {
 *       doSynchronousWork();
 *     } finally {
 *       cleanUp();
 *     }
 *
 *     // Asynchronous promise API:
 *     doAsynchronousWork().thenFinally(cleanUp);
 *
 * __Note:__ similar to the {@code finally} clause, if the registered
 * callback returns a rejected promise or throws an error, it will silently
 * replace the rejection error (if any) from this promise:
 *
 *     try {
 *       throw Error('one');
 *     } finally {
 *       throw Error('two');  // Hides Error: one
 *     }
 *
 *     promise.rejected(Error('one'))
 *         .thenFinally(function() {
 *           throw Error('two');  // Hides Error: one
 *         });
 *
 * @param {function(): (R|IThenable<R>)} callback The function
 *     to call when this promise is resolved.
 * @return {!promise.Promise<R>} A promise that will be fulfilled
 *     with the callback result.
 * @template R
 */
promise.Thenable.prototype.thenFinally = function(callback) {};


/**
 * Property used to flag constructor's as implementing the Thenable interface
 * for runtime type checking.
 * @type {string}
 * @const
 */
var IMPLEMENTED_BY_PROP = '$webdriver_Thenable';


/**
 * Adds a property to a class prototype to allow runtime checks of whether
 * instances of that class implement the Thenable interface. This function will
 * also ensure the prototype's {@code then} function is exported from compiled
 * code.
 * @param {function(new: promise.Thenable, ...?)} ctor The
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
        IMPLEMENTED_BY_PROP,
        {'value': true, 'enumerable': false});
  } catch (ex) {
    ctor.prototype[IMPLEMENTED_BY_PROP] = true;
  }
};


/**
 * Checks if an object has been tagged for implementing the Thenable interface
 * as defined by {@link webdriver.promise.Thenable.addImplementation}.
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
    return !!object[IMPLEMENTED_BY_PROP];
  } catch (e) {
    return false;  // Property access seems to be forbidden.
  }
};



/**
 * @enum {string}
 */
var PromiseState = {
  PENDING: 'pending',
  BLOCKED: 'blocked',
  REJECTED: 'rejected',
  FULFILLED: 'fulfilled'
};



/**
 * Represents the eventual value of a completed operation. Each promise may be
 * in one of three states: pending, fulfilled, or rejected. Each promise starts
 * in the pending state and may make a single transition to either a
 * fulfilled or rejected state, at which point the promise is considered
 * resolved.
 *
 * @param {function(
 *           function((T|IThenable<T>|Thenable)=),
 *           function(*=))} resolver
 *     Function that is invoked immediately to begin computation of this
 *     promise's value. The function should accept a pair of callback functions,
 *     one for fulfilling the promise and another for rejecting it.
 * @param {promise.ControlFlow=} opt_flow The control flow
 *     this instance was created under. Defaults to the currently active flow.
 * @constructor
 * @implements {promise.Thenable<T>}
 * @template T
 * @see http://promises-aplus.github.io/promises-spec/
 */
promise.Promise = function(resolver, opt_flow) {
  goog.getUid(this);

  /** @private {!promise.ControlFlow} */
  this.flow_ = opt_flow || promise.controlFlow();

  /** @private {Error} */
  this.stack_ = null;
  if (promise.LONG_STACK_TRACES) {
    this.stack_ = promise.captureStackTrace('Promise', 'new', promise.Promise);
  }

  /** @private {promise.Promise<?>} */
  this.parent_ = null;

  /** @private {Array<!Callback>} */
  this.callbacks_ = null;

  /** @private {PromiseState} */
  this.state_ = PromiseState.PENDING;

  /** @private {boolean} */
  this.handled_ = false;

  /** @private {boolean} */
  this.pendingNotifications_ = false;

  /** @private {*} */
  this.value_ = undefined;

  try {
    var self = this;
    resolver(function(value) {
      self.resolve_(PromiseState.FULFILLED, value);
    }, function(reason) {
      self.resolve_(PromiseState.REJECTED, reason);
    });
  } catch (ex) {
    this.resolve_(PromiseState.REJECTED, ex);
  }
};
promise.Thenable.addImplementation(promise.Promise);


/** @override */
promise.Promise.prototype.toString = function() {
  return 'Promise::' + goog.getUid(this) +
      ' {[[PromiseStatus]]: "' + this.state_ + '"}';
};


/**
 * Resolves this promise. If the new value is itself a promise, this function
 * will wait for it to be resolved before notifying the registered listeners.
 * @param {PromiseState} newState The promise's new state.
 * @param {*} newValue The promise's new value.
 * @throws {TypeError} If {@code newValue === this}.
 * @private
 */
promise.Promise.prototype.resolve_ = function(newState, newValue) {
  if (PromiseState.PENDING !== this.state_) {
    return;
  }

  if (newValue === this) {
    // See promise a+, 2.3.1
    // http://promises-aplus.github.io/promises-spec/#point-48
    throw new TypeError('A promise may not resolve to itself');
  }

  this.parent_ = null;
  this.state_ = PromiseState.BLOCKED;

  if (promise.Thenable.isImplementation(newValue)) {
    // 2.3.2
    newValue = /** @type {!promise.Thenable} */(newValue);
    newValue.then(
        this.unblockAndResolve_.bind(this, PromiseState.FULFILLED),
        this.unblockAndResolve_.bind(this, PromiseState.REJECTED));
    return;

  } else if (goog.isObject(newValue)) {
    // 2.3.3

    try {
      // 2.3.3.1
      var then = newValue['then'];
    } catch (e) {
      // 2.3.3.2
      this.state_ = PromiseState.REJECTED;
      this.value_ = e;
      this.scheduleNotifications_();
      return;
    }

    // NB: goog.isFunction is loose and will accept instanceof Function.
    if (typeof then === 'function') {
      // 2.3.3.3
      this.invokeThen_(newValue, then);
      return;
    }
  }

  if (newState === PromiseState.REJECTED &&
      isError(newValue) && newValue.stack && this.stack_) {
    newValue.stack += '\nFrom: ' + (this.stack_.stack || this.stack_);
  }

  // 2.3.3.4 and 2.3.4
  this.state_ = newState;
  this.value_ = newValue;
  this.scheduleNotifications_();
};


/**
 * Invokes a thenable's "then" method according to 2.3.3.3 of the promise
 * A+ spec.
 * @param {!Object} x The thenable object.
 * @param {!Function} then The "then" function to invoke.
 * @private
 */
promise.Promise.prototype.invokeThen_ = function(x, then) {
  var called = false;
  var self = this;

  var resolvePromise = function(value) {
    if (!called) {  // 2.3.3.3.3
      called = true;
      // 2.3.3.3.1
      self.unblockAndResolve_(PromiseState.FULFILLED, value);
    }
  };

  var rejectPromise = function(reason) {
    if (!called) {  // 2.3.3.3.3
      called = true;
      // 2.3.3.3.2
      self.unblockAndResolve_(PromiseState.REJECTED, reason);
    }
  };

  try {
    // 2.3.3.3
    then.call(x, resolvePromise, rejectPromise);
  } catch (e) {
    // 2.3.3.3.4.2
    rejectPromise(e);
  }
};


/**
 * @param {PromiseState} newState The promise's new state.
 * @param {*} newValue The promise's new value.
 * @private
 */
promise.Promise.prototype.unblockAndResolve_ = function(newState, newValue) {
  if (this.state_ === PromiseState.BLOCKED) {
    this.state_ = PromiseState.PENDING;
    this.resolve_(newState, newValue);
  }
};


/**
 * @private
 */
promise.Promise.prototype.scheduleNotifications_ = function() {
  if (!this.pendingNotifications_) {
    this.pendingNotifications_ = true;
    this.flow_.suspend_();

    var activeFrame;

    if (!this.handled_ &&
        this.state_ === PromiseState.REJECTED &&
        !(this.value_ instanceof promise.CancellationError)) {
      activeFrame = this.flow_.getActiveFrame_();
      activeFrame.pendingRejection = true;
    }

    if (this.callbacks_ && this.callbacks_.length) {
      activeFrame = this.flow_.getRunningFrame_();
      var self = this;
      this.callbacks_.forEach(function(callback) {
        if (!callback.frame_.getParent()) {
          activeFrame.addChild(callback.frame_);
        }
      });
    }

    asyncRun(goog.bind(this.notifyAll_, this, activeFrame));
  }
};


/**
 * Notifies all of the listeners registered with this promise that its state
 * has changed.
 * @param {Frame} frame The active frame from when this round of
 *     notifications were scheduled.
 * @private
 */
promise.Promise.prototype.notifyAll_ = function(frame) {
  this.flow_.resume_();
  this.pendingNotifications_ = false;

  if (!this.handled_ &&
      this.state_ === PromiseState.REJECTED &&
      !(this.value_ instanceof promise.CancellationError)) {
    this.flow_.abortFrame_(this.value_, frame);
  }

  if (this.callbacks_) {
    var callbacks = this.callbacks_;
    this.callbacks_ = null;
    callbacks.forEach(this.notify_, this);
  }
};


/**
 * Notifies a single callback of this promise's change ins tate.
 * @param {Callback} callback The callback to notify.
 * @private
 */
promise.Promise.prototype.notify_ = function(callback) {
  callback.notify(this.state_, this.value_);
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
        PromiseState.REJECTED,
        promise.CancellationError.wrap(opt_reason));
  }
};


/** @override */
promise.Promise.prototype.isPending = function() {
  return this.state_ === PromiseState.PENDING;
};


/** @override */
promise.Promise.prototype.then = function(opt_callback, opt_errback) {
  return this.addCallback_(
        opt_callback, opt_errback, 'then', promise.Promise.prototype.then);
};


/** @override */
promise.Promise.prototype.thenCatch = function(errback) {
  return this.addCallback_(
        null, errback, 'thenCatch', promise.Promise.prototype.thenCatch);
};


/** @override */
promise.Promise.prototype.thenFinally = function(callback) {
  var error;
  var mustThrow = false;
  return this.then(function() {
    return callback();
  }, function(err) {
    error = err;
    mustThrow = true;
    return callback();
  }).then(function() {
    if (mustThrow) {
      throw error;
    }
  });
};


/**
 * Registers a new callback with this promise
 * @param {(function(T): (R|IThenable<R>)|null|undefined)} callback The
 *    fulfillment callback.
 * @param {(function(*): (R|IThenable<R>)|null|undefined)} errback The
 *    rejection callback.
 * @param {string} name The callback name.
 * @param {!Function} fn The function to use as the top of the stack when
 *     recording the callback's creation point.
 * @return {!promise.Promise<R>} A new promise which will be resolved with the
 *     esult of the invoked callback.
 * @template R
 * @private
 */
promise.Promise.prototype.addCallback_ = function(callback, errback, name, fn) {
  if (!goog.isFunction(callback) && !goog.isFunction(errback)) {
    return this;
  }

  this.handled_ = true;
  var cb = new Callback(this, callback, errback, name, fn);

  if (!this.callbacks_) {
    this.callbacks_ = [];
  }
  this.callbacks_.push(cb);

  if (this.state_ !== PromiseState.PENDING &&
      this.state_ !== PromiseState.BLOCKED) {
    this.flow_.getSchedulingFrame_().addChild(cb.frame_);
    this.scheduleNotifications_();
  }
  return cb.promise;
};


/**
 * Represents a value that will be resolved at some point in the future. This
 * class represents the protected "producer" half of a Promise - each Deferred
 * has a {@code promise} property that may be returned to consumers for
 * registering callbacks, reserving the ability to resolve the deferred to the
 * producer.
 *
 * If this Deferred is rejected and there are no listeners registered before
 * the next turn of the event loop, the rejection will be passed to the
 * {@link webdriver.promise.ControlFlow} as an unhandled failure.
 *
 * @param {promise.ControlFlow=} opt_flow The control flow
 *     this instance was created under. This should only be provided during
 *     unit tests.
 * @constructor
 * @implements {promise.Thenable<T>}
 * @template T
 */
promise.Deferred = function(opt_flow) {
  var fulfill, reject;

  /** @type {!promise.Promise<T>} */
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
   * Resolves this deferred with the given value. It is safe to call this as a
   * normal function (with no bound "this").
   * @param {(T|IThenable<T>|Thenable)=} opt_value The fulfilled value.
   */
  this.fulfill = function(opt_value) {
    checkNotSelf(opt_value);
    fulfill(opt_value);
  };

  /**
   * Rejects this promise with the given reason. It is safe to call this as a
   * normal function (with no bound "this").
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
  return this.promise.thenFinally(opt_cb);
};


/**
 * Tests if a value is an Error-like object. This is more than an straight
 * instanceof check since the value may originate from another context.
 * @param {*} value The value to test.
 * @return {boolean} Whether the value is an error.
 */
function isError(value) {
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
      // contract. Use typeof rather than goog.isFunction because
      // goog.isFunction accepts instanceof Function, which the promise spec
      // does not.
      typeof value['then'] === 'function';
};


/**
 * Creates a promise that will be resolved at a set time in the future.
 * @param {number} ms The amount of time, in milliseconds, to wait before
 *     resolving the promise.
 * @return {!promise.Promise} The promise.
 */
promise.delayed = function(ms) {
  var key;
  return new promise.Promise(function(fulfill) {
    key = setTimeout(function() {
      key = null;
      fulfill();
    }, ms);
  }).thenCatch(function(e) {
    clearTimeout(key);
    key = null;
    throw e;
  });
};


/**
 * Creates a new deferred object.
 * @return {!promise.Deferred<T>} The new deferred object.
 * @template T
 */
promise.defer = function() {
  return new promise.Deferred();
};


/**
 * Creates a promise that has been resolved with the given value.
 * @param {T=} opt_value The resolved value.
 * @return {!promise.Promise<T>} The resolved promise.
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
 * @return {!promise.Promise<T>} The rejected promise.
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
 * Wraps a function that expects a node-style callback as its final
 * argument. This callback expects two arguments: an error value (which will be
 * null if the call succeeded), and the success value as the second argument.
 * The callback will the resolve or reject the returned promise, based on its arguments.
 * @param {!Function} fn The function to wrap.
 * @param {...?} var_args The arguments to apply to the function, excluding the
 *     final callback.
 * @return {!promise.Promise} A promise that will be resolved with the
 *     result of the provided function's callback.
 */
promise.checkedNodeCall = function(fn, var_args) {
  var args = Arrays.slice(arguments, 1);
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
 * {@link webdriver.promise.when}, except it does not return a new promise.
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
 * @param {!Array<(T|!promise.Promise<T>)>} arr An array of
 *     promises to wait on.
 * @return {!promise.Promise<!Array<T>>} A promise that is
 *     fulfilled with an array containing the fulfilled values of the
 *     input array, or rejected with the same reason as the first
 *     rejected value.
 * @template T
 */
promise.all = function(arr) {
  return new promise.Promise(function(fulfill, reject) {
    var n = arr.length;
    var values = [];

    if (!n) {
      fulfill(values);
      return;
    }

    var toFulfill = n;
    var onFulfilled = function(index, value) {
      values[index] = value;
      toFulfill--;
      if (toFulfill == 0) {
        fulfill(values);
      }
    };

    for (var i = 0; i < n; ++i) {
      promise.asap(arr[i], goog.partial(onFulfilled, i), reject);
    }
  });
};


/**
 * Calls a function for each element in an array and inserts the result into a
 * new array, which is used as the fulfillment value of the promise returned
 * by this function.
 *
 * If the return value of the mapping function is a promise, this function
 * will wait for it to be fulfilled before inserting it into the new array.
 *
 * If the mapping function throws or returns a rejected promise, the
 * promise returned by this function will be rejected with the same reason.
 * Only the first failure will be reported; all subsequent errors will be
 * silently ignored.
 *
 * @param {!(Array<TYPE>|promise.Promise<!Array<TYPE>>)} arr The
 *     array to iterator over, or a promise that will resolve to said array.
 * @param {function(this: SELF, TYPE, number, !Array<TYPE>): ?} fn The
 *     function to call for each element in the array. This function should
 *     expect three arguments (the element, the index, and the array itself.
 * @param {SELF=} opt_self The object to be used as the value of 'this' within
 *     {@code fn}.
 * @template TYPE, SELF
 */
promise.map = function(arr, fn, opt_self) {
  return promise.fulfilled(arr).then(function(arr) {
    goog.asserts.assertNumber(arr.length, 'not an array like value');
    return new promise.Promise(function(fulfill, reject) {
      var n = arr.length;
      var values = new Array(n);
      (function processNext(i) {
        for (; i < n; i++) {
          if (i in arr) {
            break;
          }
        }
        if (i >= n) {
          fulfill(values);
          return;
        }
        try {
          promise.asap(
              fn.call(opt_self, arr[i], i, /** @type {!Array} */(arr)),
              function(value) {
                values[i] = value;
                processNext(i + 1);
              },
              reject);
        } catch (ex) {
          reject(ex);
        }
      })(0);
    });
  });
};


/**
 * Calls a function for each element in an array, and if the function returns
 * true adds the element to a new array.
 *
 * If the return value of the filter function is a promise, this function
 * will wait for it to be fulfilled before determining whether to insert the
 * element into the new array.
 *
 * If the filter function throws or returns a rejected promise, the promise
 * returned by this function will be rejected with the same reason. Only the
 * first failure will be reported; all subsequent errors will be silently
 * ignored.
 *
 * @param {!(Array<TYPE>|promise.Promise<!Array<TYPE>>)} arr The
 *     array to iterator over, or a promise that will resolve to said array.
 * @param {function(this: SELF, TYPE, number, !Array<TYPE>): (
 *             boolean|promise.Promise<boolean>)} fn The function
 *     to call for each element in the array.
 * @param {SELF=} opt_self The object to be used as the value of 'this' within
 *     {@code fn}.
 * @template TYPE, SELF
 */
promise.filter = function(arr, fn, opt_self) {
  return promise.fulfilled(arr).then(function(arr) {
    goog.asserts.assertNumber(arr.length, 'not an array like value');
    return new promise.Promise(function(fulfill, reject) {
      var n = arr.length;
      var values = [];
      var valuesLength = 0;
      (function processNext(i) {
        for (; i < n; i++) {
          if (i in arr) {
            break;
          }
        }
        if (i >= n) {
          fulfill(values);
          return;
        }
        try {
          var value = arr[i];
          var include = fn.call(opt_self, value, i, /** @type {!Array} */(arr));
          promise.asap(include, function(include) {
            if (include) {
              values[valuesLength++] = value;
            }
            processNext(i + 1);
            }, reject);
        } catch (ex) {
          reject(ex);
        }
      })(0);
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
 *
 *     var value = {};
 *     value['self'] = value;
 *     promise.fullyResolved(value);  // Stack overflow.
 *
 * @param {*} value The value to fully resolve.
 * @return {!promise.Promise} A promise for a fully resolved version
 *     of the input value.
 */
promise.fullyResolved = function(value) {
  if (promise.isPromise(value)) {
    return promise.when(value, fullyResolveValue);
  }
  return fullyResolveValue(value);
};


/**
 * @param {*} value The value to fully resolve. If a promise, assumed to
 *     already be resolved.
 * @return {!promise.Promise} A promise for a fully resolved version
 *     of the input value.
 */
 function fullyResolveValue(value) {
  switch (goog.typeOf(value)) {
    case 'array':
      return fullyResolveKeys(/** @type {!Array} */ (value));

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

      return fullyResolveKeys(/** @type {!Object} */ (value));

    default:  // boolean, function, null, number, string, undefined
      return promise.fulfilled(value);
  }
};


/**
 * @param {!(Array|Object)} obj the object to resolve.
 * @return {!promise.Promise} A promise that will be resolved with the
 *     input object once all of its values have been fully resolved.
 */
 function fullyResolveKeys(obj) {
  var isArray = goog.isArray(obj);
  var numKeys = isArray ? obj.length : Objects.getCount(obj);
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
    var forEachKey = !isArray ? Objects.forEach : function(arr, fn) {
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
 * Each task scheduled within this flow may return a
 * {@link webdriver.promise.Promise} to indicate it is an asynchronous
 * operation. The ControlFlow will wait for such promises to be resolved before
 * marking the task as completed.
 *
 * Tasks and each callback registered on a {@link webdriver.promise.Promise}
 * will be run in their own ControlFlow frame.  Any tasks scheduled within a
 * frame will take priority over previously scheduled tasks. Furthermore, if any
 * of the tasks in the frame fail, the remainder of the tasks in that frame will
 * be discarded and the failure will be propagated to the user through the
 * callback/task's promised result.
 *
 * Each time a ControlFlow empties its task queue, it will fire an
 * {@link webdriver.promise.ControlFlow.EventType.IDLE IDLE} event. Conversely,
 * whenever the flow terminates due to an unhandled error, it will remove all
 * remaining tasks in its queue and fire an
 * {@link webdriver.promise.ControlFlow.EventType.UNCAUGHT_EXCEPTION
 * UNCAUGHT_EXCEPTION} event. If there are no listeners registered with the
 * flow, the error will be rethrown to the global error handler.
 *
 * @constructor
 * @extends {EventEmitter}
 * @final
 */
promise.ControlFlow = function() {
  EventEmitter.call(this);
  goog.getUid(this);

  /**
   * Tracks the active execution frame for this instance. Lazily initialized
   * when the first task is scheduled.
   * @private {Frame}
   */
  this.activeFrame_ = null;

  /**
   * A reference to the frame which is currently top of the stack in
   * {@link #runInFrame_}. The {@link #activeFrame_} will always be an ancestor
   * of the {@link #runningFrame_}, but the two will often not be the same. The
   * active frame represents which frame is currently executing a task while the
   * running frame represents either the task itself or a promise callback which
   * has fired asynchronously.
   * @private {Frame}
   */
  this.runningFrame_ = null;

  /**
   * A reference to the frame in which new tasks should be scheduled. If
   * {@code null}, tasks will be scheduled within the active frame. When forcing
   * a function to run in the context of a new frame, this pointer is used to
   * ensure tasks are scheduled within the newly created frame, even though it
   * won't be active yet.
   * @private {Frame}
   * @see {#runInFrame_}
   */
  this.schedulingFrame_ = null;

  /**
   * Micro task that controls shutting down the control flow. Upon shut down,
   * the flow will emit an {@link webdriver.promise.ControlFlow.EventType.IDLE}
   * event. Idle events always follow a brief timeout in order to catch latent
   * errors from the last completed task. If this task had a callback
   * registered, but no errback, and the task fails, the unhandled failure would
   * not be reported by the promise system until the next turn of the event
   * loop:
   *
   *   // Schedule 1 task that fails.
   *   var result = promise.controlFlow().schedule('example',
   *       function() { return promise.rejected('failed'); });
   *   // Set a callback on the result. This delays reporting the unhandled
   *   // failure for 1 turn of the event loop.
   *   result.then(goog.nullFunction);
   *
   * @private {MicroTask}
   */
  this.shutdownTask_ = null;

  /**
   * Micro task used to trigger execution of this instance's event loop.
   * @private {MicroTask}
   */
  this.eventLoopTask_ = null;

  /**
   * ID for a long running interval used to keep a Node.js process running
   * while a control flow's event loop has yielded. This is a cheap hack
   * required since the {@link #runEventLoop_} is only scheduled to run when
   * there is _actually_ something to run. When a control flow is waiting on
   * a task, there will be nothing in the JS event loop and the process would
   * terminate without this.
   *
   * An alternative solution would be to change {@link #runEventLoop_} to run
   * as an interval rather than as on-demand micro-tasks. While this approach
   * (which was previously used) requires fewer micro-task allocations, it
   * results in many unnecessary invocations of {@link #runEventLoop_}.
   *
   * @private {?number}
   */
  this.hold_ = null;

  /**
   * The number of holds placed on this flow. These represent points where the
   * flow must not execute any further actions so an asynchronous action may
   * run first. One such example are notifications fired by a
   * {@link webdriver.promise.Promise}: the Promise spec requires that callbacks
   * are invoked in a turn of the event loop after they are scheduled. To ensure
   * tasks within a callback are scheduled in the correct frame, a promise will
   * make the parent flow yield before its notifications are fired.
   * @private {number}
   */
  this.yieldCount_ = 0;
};
goog.inherits(promise.ControlFlow, EventEmitter);


/**
 * Events that may be emitted by an {@link webdriver.promise.ControlFlow}.
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
 * Returns a string representation of this control flow, which is its current
 * {@link #getSchedule() schedule}, sans task stack traces.
 * @return {string} The string representation of this contorl flow.
 * @override
 */
promise.ControlFlow.prototype.toString = function() {
  return this.getSchedule();
};


/**
 * Resets this instance, clearing its queue and removing all event listeners.
 */
promise.ControlFlow.prototype.reset = function() {
  this.activeFrame_ = null;
  this.schedulingFrame_ = null;
  this.emit(promise.ControlFlow.EventType.RESET);
  this.removeAllListeners();
  this.cancelShutdown_();
  this.cancelEventLoop_();
};


/**
 * Generates an annotated string describing the internal state of this control
 * flow, including the currently executing as well as pending tasks. If
 * {@code opt_includeStackTraces === true}, the string will include the
 * stack trace from when each task was scheduled.
 * @param {string=} opt_includeStackTraces Whether to include the stack traces
 *     from when each task was scheduled. Defaults to false.
 * @return {string} String representation of this flow's internal state.
 */
promise.ControlFlow.prototype.getSchedule = function(opt_includeStackTraces) {
  var ret = 'ControlFlow::' + goog.getUid(this);
  var activeFrame = this.activeFrame_;
  var runningFrame = this.runningFrame_;
  if (!activeFrame) {
    return ret;
  }
  var childIndent = '| ';
  return ret + '\n' + toStringHelper(activeFrame.getRoot(), childIndent);

  /**
   * @param {!(Frame|Task)} node .
   * @param {string} indent .
   * @param {boolean=} opt_isPending .
   * @return {string} .
   */
  function toStringHelper(node, indent, opt_isPending) {
    var ret = node.toString();
    if (opt_isPending) {
      ret = '(pending) ' + ret;
    }
    if (node === activeFrame) {
      ret = '(active) ' + ret;
    }
    if (node === runningFrame) {
      ret = '(running) ' + ret;
    }
    if (node instanceof Frame) {
      if (node.getPendingTask()) {
        ret += '\n' + toStringHelper(
            /** @type {!Task} */(node.getPendingTask()),
            childIndent,
            true);
      }
      if (node.children_) {
        node.children_.forEach(function(child) {
          if (!node.getPendingTask() ||
              node.getPendingTask().getFrame() !== child) {
            ret += '\n' + toStringHelper(child, childIndent);
          }
        });
      }
    } else {
      var task = /** @type {!Task} */(node);
      if (opt_includeStackTraces && task.promise.stack_) {
        ret += '\n' + childIndent +
            (task.promise.stack_.stack || task.promise.stack_).
            replace(/\n/g, '\n' + childIndent);
      }
      if (task.getFrame()) {
        ret += '\n' + toStringHelper(
            /** @type {!Frame} */(task.getFrame()),
            childIndent);
      }
    }
    return indent + ret.replace(/\n/g, '\n' + indent);
  }
};


/**
 * @return {!Frame} The active frame for this flow.
 * @private
 */
promise.ControlFlow.prototype.getActiveFrame_ = function() {
  this.cancelShutdown_();
  if (!this.activeFrame_) {
    this.activeFrame_ = new Frame(this);
    this.activeFrame_.once(Frame.ERROR_EVENT, this.abortNow_, this);
    this.scheduleEventLoopStart_();
  }
  return this.activeFrame_;
};


/**
 * @return {!Frame} The frame that new items should be added to.
 * @private
 */
promise.ControlFlow.prototype.getSchedulingFrame_ = function() {
  return this.schedulingFrame_ || this.getActiveFrame_();
};


/**
 * @return {!Frame} The frame that is current executing.
 * @private
 */
promise.ControlFlow.prototype.getRunningFrame_ = function() {
  return this.runningFrame_ || this.getActiveFrame_();
};


/**
 * Schedules a task for execution. If there is nothing currently in the
 * queue, the task will be executed in the next turn of the event loop. If
 * the task function is a generator, the task will be executed using
 * {@link webdriver.promise.consume}.
 *
 * @param {function(): (T|promise.Promise<T>)} fn The function to
 *     call to start the task. If the function returns a
 *     {@link webdriver.promise.Promise}, this instance will wait for it to be
 *     resolved before starting the next task.
 * @param {string=} opt_description A description of the task.
 * @return {!promise.Promise<T>} A promise that will be resolved
 *     with the result of the action.
 * @template T
 */
promise.ControlFlow.prototype.execute = function(fn, opt_description) {
  if (promise.isGenerator(fn)) {
    fn = goog.partial(promise.consume, fn);
  }

  if (!this.hold_) {
    var holdIntervalMs = 2147483647;  // 2^31-1; max timer length for Node.js
    this.hold_ = setInterval(goog.nullFunction, holdIntervalMs);
  }

  var description = opt_description || '<anonymous>';
  var task = new Task(this, fn, description);
  task.promise.stack_ = promise.captureStackTrace('Task', description,
      promise.ControlFlow.prototype.execute);

  this.getSchedulingFrame_().addChild(task);
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
 * Condition functions may schedule sub-tasks with this instance, however,
 * their execution time will be factored into whether a wait has timed out.
 *
 * In the event a condition returns a Promise, the polling loop will wait for
 * it to be resolved before evaluating whether the condition has been satisfied.
 * The resolution time for a promise is factored into whether a wait has timed
 * out.
 *
 * If the condition function throws, or returns a rejected promise, the
 * wait task will fail.
 *
 * If the condition is defined as a promise, the flow will wait for it to
 * settle. If the timeout expires before the promise settles, the promise
 * returned by this function will be rejected.
 *
 * If this function is invoked with `timeout === 0`, or the timeout is omitted,
 * the flow will wait indefinitely for the condition to be satisfied.
 *
 * @param {(!promise.Promise<T>|function())} condition The condition to poll,
 *     or a promise to wait on.
 * @param {number=} opt_timeout How long to wait, in milliseconds, for the
 *     condition to hold before timing out. If omitted, the flow will wait
 *     indefinitely.
 * @param {string=} opt_message An optional error message to include if the
 *     wait times out; defaults to the empty string.
 * @return {!promise.Promise<T>} A promise that will be fulfilled
 *     when the condition has been satisified. The promise shall be rejected if
 *     the wait times out waiting for the condition.
 * @throws {TypeError} If condition is not a function or promise or if timeout
 *     is not a number >= 0.
 * @template T
 */
promise.ControlFlow.prototype.wait = function(
    condition, opt_timeout, opt_message) {
  var timeout = opt_timeout || 0;
  if (!goog.isNumber(timeout) || timeout < 0) {
    throw TypeError('timeout must be a number >= 0: ' + timeout);
  }

  if (promise.isPromise(condition)) {
    return this.execute(function() {
      if (!timeout) {
        return condition;
      }
      return new promise.Promise(function(fulfill, reject) {
        var start = goog.now();
        var timer = setTimeout(function() {
          timer = null;
          reject(Error((opt_message ? opt_message + '\n' : '') +
              'Timed out waiting for promise to resolve after ' +
              (goog.now() - start) + 'ms'));
        }, timeout);

        /** @type {Thenable} */(condition).then(
            function(value) {
              timer && clearTimeout(timer);
              fulfill(value);
            },
            function(error) {
              timer && clearTimeout(timer);
              reject(error);
            });
      });
    }, opt_message || '<anonymous wait: promise resolution>');
  }

  if (!goog.isFunction(condition)) {
    throw TypeError('Invalid condition; must be a function or promise: ' +
        goog.typeOf(condition));
  }

  if (promise.isGenerator(condition)) {
    condition = goog.partial(promise.consume, condition);
  }

  var self = this;
  return this.execute(function() {
    var startTime = goog.now();
    return new promise.Promise(function(fulfill, reject) {
      self.suspend_();
      pollCondition();

      function pollCondition() {
        self.resume_();
        self.execute(/**@type {function()}*/(condition)).then(function(value) {
          var elapsed = goog.now() - startTime;
          if (!!value) {
            fulfill(value);
          } else if (timeout && elapsed >= timeout) {
            reject(new Error((opt_message ? opt_message + '\n' : '') +
                'Wait timed out after ' + elapsed + 'ms'));
          } else {
            self.suspend_();
            // Do not use asyncRun here because we need a non-micro yield
            // here so the UI thread is given a chance when running in a
            // browser.
            setTimeout(pollCondition, 0);
          }
        }, reject);
      }
    });
  }, opt_message || '<anonymous wait>');
};


/**
 * Schedules the interval for this instance's event loop, if necessary.
 * @private
 */
promise.ControlFlow.prototype.scheduleEventLoopStart_ = function() {
  if (!this.eventLoopTask_ && !this.yieldCount_ && this.activeFrame_ &&
      !this.activeFrame_.getPendingTask()) {
    this.eventLoopTask_ = new MicroTask(this.runEventLoop_, this);
  }
};


/**
 * Cancels the event loop, if necessary.
 * @private
 */
promise.ControlFlow.prototype.cancelEventLoop_ = function() {
  if (this.eventLoopTask_) {
    this.eventLoopTask_.cancel();
    this.eventLoopTask_ = null;
  }
};


/**
 * Suspends this control flow, preventing it from executing any more tasks.
 * @private
 */
promise.ControlFlow.prototype.suspend_ = function() {
  this.yieldCount_ += 1;
  this.cancelEventLoop_();
};


/**
 * Resumes execution of tasks scheduled within this control flow.
 * @private
 */
promise.ControlFlow.prototype.resume_ = function() {
  this.yieldCount_ -= 1;
  if (!this.yieldCount_ && this.activeFrame_) {
    this.scheduleEventLoopStart_();
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
  this.eventLoopTask_ = null;

  if (this.yieldCount_) {
    return;
  }

  if (!this.activeFrame_) {
    this.commenceShutdown_();
    return;
  }

  if (this.activeFrame_.getPendingTask()) {
    return;
  }

  var task = this.getNextTask_();
  if (!task) {
    return;
  }

  var activeFrame = this.activeFrame_;
  var scheduleEventLoop = goog.bind(this.scheduleEventLoopStart_, this);

  var onSuccess = function(value) {
    activeFrame.setPendingTask(null);
    task.setFrame(null);
    task.fulfill(value);
    scheduleEventLoop();
  };

  var onFailure = function(reason) {
    activeFrame.setPendingTask(null);
    task.setFrame(null);
    task.reject(reason);
    scheduleEventLoop();
  };

  activeFrame.setPendingTask(task);
  var frame = new Frame(this);
  task.setFrame(frame);
  this.runInFrame_(frame, task.execute, function(result) {
    promise.asap(result, onSuccess, onFailure);
  }, onFailure, true);
};


/**
 * @return {Task} The next task to execute, or
 *     {@code null} if a frame was resolved.
 * @private
 */
promise.ControlFlow.prototype.getNextTask_ = function() {
  var frame = this.activeFrame_;
  var firstChild = frame.getFirstChild();
  if (!firstChild) {
    if (!frame.pendingCallback && !frame.isBlocked_) {
      this.resolveFrame_(frame);
    }
    return null;
  }

  if (firstChild instanceof Frame) {
    this.activeFrame_ = firstChild;
    return this.getNextTask_();
  }

  frame.removeChild(firstChild);
  if (!firstChild.isPending()) {
    return this.getNextTask_();
  }
  return firstChild;
};


/**
 * @param {!Frame} frame The frame to resolve.
 * @private
 */
promise.ControlFlow.prototype.resolveFrame_ = function(frame) {
  if (this.activeFrame_ === frame) {
    this.activeFrame_ = frame.getParent();
  }

  if (frame.getParent()) {
    frame.getParent().removeChild(frame);
  }
  frame.emit(Frame.CLOSE_EVENT);

  if (!this.activeFrame_) {
    this.commenceShutdown_();
  } else {
    this.scheduleEventLoopStart_();
  }
};


/**
 * Aborts the current frame. The frame, and all of the tasks scheduled within it
 * will be discarded. If this instance does not have an active frame, it will
 * immediately terminate all execution.
 * @param {*} error The reason the frame is being aborted; typically either
 *     an Error or string.
 * @param {Frame=} opt_frame The frame to abort; will use the
 *     currently active frame if not specified.
 * @private
 */
promise.ControlFlow.prototype.abortFrame_ = function(error, opt_frame) {
  if (!this.activeFrame_) {
    this.abortNow_(error);
    return;
  }

  // Frame parent is always another frame, but the compiler is not smart
  // enough to recognize this.
  var parent = /** @type {Frame} */ (
      this.activeFrame_.getParent());
  if (parent) {
    parent.removeChild(this.activeFrame_);
  }

  var frame = this.activeFrame_;
  this.activeFrame_ = parent;
  frame.abort(error);
};


/**
 * Executes a function within a specific frame. If the function does not
 * schedule any new tasks, the frame will be discarded and the function's result
 * returned passed to the given callback immediately. Otherwise, the callback
 * will be invoked once all of the tasks scheduled within the function have been
 * completed. If the frame is aborted, the `errback` will be invoked with the
 * offending error.
 *
 * @param {!Frame} newFrame The frame to use.
 * @param {!Function} fn The function to execute.
 * @param {function(T)} callback The function to call with a successful result.
 * @param {function(*)} errback The function to call if there is an error.
 * @param {boolean=} opt_isTask Whether the function is a task and the frame
 *     should be immediately activated to capture subtasks and errors.
 * @throws {Error} If this function is invoked while another call to this
 *     function is present on the stack.
 * @template T
 * @private
 */
promise.ControlFlow.prototype.runInFrame_ = function(
      newFrame, fn, callback, errback, opt_isTask) {
  asserts.assert(
      !this.runningFrame_, 'unexpected recursive call to runInFrame');

  var self = this,
      oldFrame = this.activeFrame_;

  try {
    if (this.activeFrame_ !== newFrame && !newFrame.getParent()) {
      this.activeFrame_.addChild(newFrame);
    }

    // Activate the new frame to force tasks to be treated as sub-tasks of
    // the parent frame.
    if (opt_isTask) {
      this.activeFrame_ = newFrame;
    }

    try {
      this.runningFrame_ = newFrame;
      this.schedulingFrame_ = newFrame;
      activeFlows.push(this);
      var result = fn();
    } finally {
      activeFlows.pop();
      this.schedulingFrame_ = null;

      // `newFrame` should only be considered the running frame when it is
      // actually executing. After it finishes, set top of stack to its parent
      // so any failures/interrupts that occur while processing newFrame's
      // result are handled there.
      this.runningFrame_ = newFrame.parent_;
    }
    newFrame.isLocked_ = true;

    // If there was nothing scheduled in the new frame we can discard the
    // frame and return immediately.
    if (isCloseable(newFrame) && (!opt_isTask || !promise.isPromise(result))) {
      removeNewFrame();
      callback(result);
      return;
    }

    // If the executed function returned a promise, wait for it to resolve. If
    // there is nothing scheduled in the frame, go ahead and discard it.
    // Otherwise, we wait for the frame to be closed out by the event loop.
    var shortCircuitTask;
    if (promise.isPromise(result)) {
      newFrame.isBlocked_ = true;
      var onResolve = function() {
        newFrame.isBlocked_ = false;
        shortCircuitTask = new MicroTask(function() {
          if (isCloseable(newFrame)) {
            removeNewFrame();
            callback(result);
          }
        });
      };
      /** @type {Thenable} */(result).then(onResolve, onResolve);

    // If the result is a thenable, attach a listener to silence any unhandled
    // rejection warnings. This is safe because we *will* handle it once the
    // frame has completed.
    } else if (promise.Thenable.isImplementation(result)) {
      /** @type {!promise.Thenable} */(result).thenCatch(goog.nullFunction);
    }

    newFrame.once(Frame.CLOSE_EVENT, function() {
      shortCircuitTask && shortCircuitTask.cancel();
      if (isCloseable(newFrame)) {
        removeNewFrame();
      }
      callback(result);
    }).once(Frame.ERROR_EVENT, function(reason) {
      shortCircuitTask && shortCircuitTask.cancel();
      if (promise.Thenable.isImplementation(result) && result.isPending()) {
        result.cancel(reason);
      }
      errback(reason);
    });
  } catch (ex) {
    removeNewFrame(ex);
    errback(ex);
  } finally {
    // No longer running anything, clear the reference.
    this.runningFrame_ = null;
  }

  function isCloseable(frame) {
    return (!frame.children_ || !frame.children_.length)
        && !frame.pendingRejection;
  }

  /**
   * @param {*=} opt_err If provided, the reason that the frame was removed.
   */
  function removeNewFrame(opt_err) {
    var parent = newFrame.getParent();
    if (parent) {
      parent.removeChild(newFrame);
      asyncRun(function() {
        if (isCloseable(parent) && parent !== self.activeFrame_) {
          parent.emit(Frame.CLOSE_EVENT);
        }
      });
      self.scheduleEventLoopStart_();
    }

    if (opt_err) {
      newFrame.cancelRemainingTasks(promise.CancellationError.wrap(
          opt_err, 'Tasks cancelled due to uncaught error'));
    }
    self.activeFrame_ = oldFrame;
  }
};


/**
 * Commences the shutdown sequence for this instance. After one turn of the
 * event loop, this object will emit the
 * {@link webdriver.promise.ControlFlow.EventType.IDLE IDLE} event to signal
 * listeners that it has completed. During this wait, if another task is
 * scheduled, the shutdown will be aborted.
 * @private
 */
promise.ControlFlow.prototype.commenceShutdown_ = function() {
  if (!this.shutdownTask_) {
    // Go ahead and stop the event loop now.  If we're in here, then there are
    // no more frames with tasks to execute. If we waited to cancel the event
    // loop in our timeout below, the event loop could trigger *before* the
    // timeout, generating an error from there being no frames.
    // If #execute is called before the timeout below fires, it will cancel
    // the timeout and restart the event loop.
    this.cancelEventLoop_();
    this.shutdownTask_ = new MicroTask(this.shutdown_, this);
  }
};


/** @private */
promise.ControlFlow.prototype.cancelHold_ = function() {
  if (this.hold_) {
    clearInterval(this.hold_);
    this.hold_ = null;
  }
};


/** @private */
promise.ControlFlow.prototype.shutdown_ = function() {
  this.cancelHold_();
  this.shutdownTask_ = null;
  this.emit(promise.ControlFlow.EventType.IDLE);
};


/**
 * Cancels the shutdown sequence if it is currently scheduled.
 * @private
 */
promise.ControlFlow.prototype.cancelShutdown_ = function() {
  if (this.shutdownTask_) {
    this.shutdownTask_.cancel();
    this.shutdownTask_ = null;
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
  this.cancelHold_();

  var listeners = this.listeners(
      promise.ControlFlow.EventType.UNCAUGHT_EXCEPTION);
  if (!listeners.length) {
    throwException(error);
  } else {
    this.emit(promise.ControlFlow.EventType.UNCAUGHT_EXCEPTION, error);
  }
};


/**
 * Wraps a function to execute as a cancellable micro task.
 * @final
 */
var MicroTask = goog.defineClass(null, {
  /**
   * @param {function(this: THIS)} fn The function to run as a micro task.
   * @param {THIS=} opt_scope The scope to run the function in.
   * @template THIS
   */
  constructor: function(fn, opt_scope) {
    /** @private {boolean} */
    this.cancelled_ = false;
    asyncRun(function() {
      if (!this.cancelled_) {
        fn.call(opt_scope);
      }
    }, this);
  },

  /**
   * Cancels the execution of this task. Note: this will not prevent the task
   * timer from firing, just the invocation of the wrapped function.
   */
  cancel: function() {
    this.cancelled_ = true;
  }
});


/**
 * An execution frame within a {@link webdriver.promise.ControlFlow}.  Each
 * frame represents the execution context for either a
 * {@link webdriver.Task} or a callback on a
 * {@link webdriver.promise.Promise}.
 *
 * Each frame may contain sub-frames.  If child N is a sub-frame, then the
 * items queued within it are given priority over child N+1.
 *
 * @unrestricted
 * @final
 * @private
 */
var Frame = goog.defineClass(EventEmitter, {
  /**
   * @param {!promise.ControlFlow} flow The flow this instance belongs to.
   */
  constructor: function(flow) {
    EventEmitter.call(this);
    goog.getUid(this);

    /** @private {!promise.ControlFlow} */
    this.flow_ = flow;

    /** @private {Frame} */
    this.parent_ = null;

    /** @private {Array<!(Frame|Task)>} */
    this.children_ = null;

    /** @private {(Frame|Task)} */
    this.lastInsertedChild_ = null;

    /**
     * The task currently being executed within this frame.
     * @private {Task}
     */
    this.pendingTask_ = null;

    /**
     * Whether this frame is currently locked. A locked frame represents an
     * executed function that has scheduled all of its tasks.
     *
     * Once a frame becomes locked, any new frames which are added as children
     * represent interrupts (such as a {@link webdriver.promise.Promise}
     * callback) whose tasks must be given priority over those already scheduled
     * within this frame. For example:
     *
     *     var flow = promise.controlFlow();
     *     flow.execute('start here', goog.nullFunction).then(function() {
     *       flow.execute('this should execute 2nd', goog.nullFunction);
     *     });
     *     flow.execute('this should execute last', goog.nullFunction);
     *
     * @private {boolean}
     */
    this.isLocked_ = false;

    /**
     * Whether this frame's completion is blocked on the resolution of a promise
     * returned by its main function.
     * @private
     */
    this.isBlocked_ = false;

    /**
     * Whether this frame represents a pending callback attached to a
     * {@link webdriver.promise.Promise}.
     * @private {boolean}
     */
    this.pendingCallback = false;

    /**
     * Whether there are pending unhandled rejections detected within this frame.
     * @private {boolean}
     */
    this.pendingRejection = false;

    /** @private {promise.CancellationError} */
    this.cancellationError_ = null;
  },

  statics: {
    /** @const */
    CLOSE_EVENT: 'close',

    /** @const */
    ERROR_EVENT: 'error',

    /**
     * @param {!promise.CancellationError} error The cancellation error.
     * @param {!(Frame|Task)} child The child to cancel.
     * @private
     */
    cancelChild_: function(error, child) {
      if (child instanceof Frame) {
        child.cancelRemainingTasks(error);
      } else {
        child.promise.callbacks_ = null;
        child.cancel(error);
      }
    }
  },

  /** @return {Frame} This frame's parent, if any. */
  getParent: function() {
    return this.parent_;
  },

  /** @param {Frame} parent This frame's new parent. */
  setParent: function(parent) {
    this.parent_ = parent;
  },

  /** @return {!Frame} The root of this frame's tree. */
  getRoot: function() {
    var root = this;
    while (root.parent_) {
      root = root.parent_;
    }
    return root;
  },

  /**
   * Aborts the execution of this frame, cancelling all outstanding tasks
   * scheduled within this frame.
   *
   * @param {*} error The error that triggered this abortion.
   */
  abort: function(error) {
    this.cancellationError_ = promise.CancellationError.wrap(
        error, 'Task discarded due to a previous task failure');
    this.cancelRemainingTasks(this.cancellationError_);
    if (!this.pendingCallback) {
      this.emit(Frame.ERROR_EVENT, error);
    }
  },

  /**
   * Marks all of the tasks that are descendants of this frame in the execution
   * tree as cancelled. This is necessary for callbacks scheduled asynchronous.
   * For example:
   *
   *     var someResult;
   *     promise.createFlow(function(flow) {
   *       someResult = flow.execute(function() {});
   *       throw Error();
   *     }).thenCatch(function(err) {
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
   * @param {!promise.CancellationError} reason The cancellation reason.
   */
  cancelRemainingTasks: function(reason) {
    if (this.children_) {
      this.children_.forEach(function(child) {
        Frame.cancelChild_(reason, child);
      });
    }
  },

  /**
   * @return {Task} The task currently executing
   *     within this frame, if any.
   */
  getPendingTask: function() {
    return this.pendingTask_;
  },

  /**
   * @param {Task} task The task currently
   *     executing within this frame, if any.
   */
  setPendingTask: function(task) {
    this.pendingTask_ = task;
  },

  /**
   * @return {boolean} Whether this frame is empty (has no scheduled tasks or
   *     pending callback frames).
   */
  isEmpty: function() {
    return !this.children_ || !this.children_.length;
  },

  /**
   * Adds a new node to this frame.
   * @param {!(Frame|Task)} node The node to insert.
   */
  addChild: function(node) {
    if (this.cancellationError_) {
      Frame.cancelChild_(this.cancellationError_, node);
      return;  // Child will never run, no point keeping a reference.
    }

    if (!this.children_) {
      this.children_ = [];
    }

    node.setParent(this);
    if (this.isLocked_ && node instanceof Frame) {
      var index = 0;
      if (this.lastInsertedChild_ instanceof Frame) {
        index = this.children_.indexOf(this.lastInsertedChild_);
        // If the last inserted child into a locked frame is a pending callback,
        // it is an interrupt and the new interrupt must come after it. Otherwise,
        // we have our first interrupt for this frame and it shoudl go before the
        // last inserted child.
        index += (this.lastInsertedChild_.pendingCallback) ? 1 : -1;
      }
      this.children_.splice(Math.max(index, 0), 0, node);
      this.lastInsertedChild_ = node;
      return;
    }

    this.lastInsertedChild_ = node;
    this.children_.push(node);
  },

  /**
   * @return {(Frame|Task)} This frame's fist child.
   */
  getFirstChild: function() {
    this.isLocked_ = true;
    return this.children_ && this.children_[0];
  },

  /**
   * Removes a child from this frame.
   * @param {!(Frame|Task)} child The child to remove.
   */
  removeChild: function(child) {
    goog.asserts.assert(child.parent_ === this, 'not a child of this frame');
    goog.asserts.assert(this.children_ !== null, 'frame has no children!');
    var index = this.children_.indexOf(child);
    child.setParent(null);
    this.children_.splice(index, 1);
    if (this.lastInsertedChild_ === child) {
      this.lastInsertedChild_ = this.children_[index - 1] || null;
    }
    if (!this.children_.length) {
      this.children_ = null;
    }
  },

  /** @override */
  toString: function() {
    return 'Frame::' + goog.getUid(this);
  }
});


/**
 * A task to be executed by a {@link webdriver.promise.ControlFlow}.
 *
 * @unrestricted
 * @final
 */
var Task = goog.defineClass(promise.Deferred, {
  /**
   * @param {!promise.ControlFlow} flow The flow this instances belongs
   *     to.
   * @param {function(): (T|!promise.Promise<T>)} fn The function to
   *     call when the task executes. If it returns a
   *     {@link webdriver.promise.Promise}, the flow will wait for it to be
   *     resolved before starting the next task.
   * @param {string} description A description of the task for debugging.
   * @constructor
   * @extends {promise.Deferred<T>}
   * @template T
   */
  constructor: function(flow, fn, description) {
    Task.base(this, 'constructor', flow);
    goog.getUid(this);

    /**
     * @type {function(): (T|!promise.Promise<T>)}
     */
    this.execute = fn;

    /** @private {string} */
    this.description_ = description;

    /** @private {Frame} */
    this.parent_ = null;

    /** @private {Frame} */
    this.frame_ = null;
  },

  /**
   * @return {Frame} frame The frame used to run this task's
   *     {@link #execute} method.
   */
  getFrame: function() {
    return this.frame_;
  },

  /**
   * @param {Frame} frame The frame used to run this task's
   *     {@link #execute} method.
   */
  setFrame: function(frame) {
    this.frame_ = frame;
  },

  /**
   * @param {Frame} frame The frame this task is scheduled in.
   */
  setParent: function(frame) {
    goog.asserts.assert(goog.isNull(this.parent_) || goog.isNull(frame),
        'parent already set');
    this.parent_ = frame;
  },

  /** @return {string} This task's description. */
  getDescription: function() {
    return this.description_;
  },

  /** @override */
  toString: function() {
    return 'Task::' + goog.getUid(this) + '<' + this.description_ + '>';
  }
});


/**
 * Manages a callback attached to a {@link webdriver.promise.Promise}. When the
 * promise is resolved, this callback will invoke the appropriate callback
 * function based on the promise's resolved value.
 *
 * @unrestricted
 * @final
 */
var Callback = goog.defineClass(promise.Deferred, {
  /**
   * @param {!promise.Promise} parent The promise this callback is attached to.
   * @param {(function(T): (IThenable<R>|R)|null|undefined)} callback
   *     The fulfillment callback.
   * @param {(function(*): (IThenable<R>|R)|null|undefined)} errback
   *     The rejection callback.
   * @param {string} name The callback name.
   * @param {!Function} fn The function to use as the top of the stack when
   *     recording the callback's creation point.
   * @extends {promise.Deferred<R>}
   * @template T, R
   */
  constructor: function(parent, callback, errback, name, fn) {
    Callback.base(this, 'constructor', parent.flow_);

    /** @private {(function(T): (IThenable<R>|R)|null|undefined)} */
    this.callback_ = callback;

    /** @private {(function(*): (IThenable<R>|R)|null|undefined)} */
    this.errback_ = errback;

    /** @private {!Frame} */
    this.frame_ = new Frame(parent.flow_);
    this.frame_.pendingCallback = true;

    this.promise.parent_ = parent;
    if (promise.LONG_STACK_TRACES) {
      this.promise.stack_ = promise.captureStackTrace('Promise', name, fn);
    }
  },

  /**
   * Called by the parent promise when it has been resolved.
   * @param {!PromiseState} state The parent's new state.
   * @param {*} value The parent's new value.
   */
  notify: function(state, value) {
    var callback = this.callback_;
    var fallback = this.fulfill;
    if (state === PromiseState.REJECTED) {
      callback = this.errback_;
      fallback = this.reject;
    }

    this.frame_.pendingCallback = false;
    if (goog.isFunction(callback)) {
      this.frame_.flow_.runInFrame_(
          this.frame_,
          goog.bind(callback, undefined, value),
          this.fulfill, this.reject);
    } else {
      if (this.frame_.getParent()) {
        this.frame_.getParent().removeChild(this.frame_);
      }
      fallback(value);
    }
  }
});



/**
 * The default flow to use if no others are active.
 * @type {!promise.ControlFlow}
 */
var defaultFlow = new promise.ControlFlow();


/**
 * A stack of active control flows, with the top of the stack used to schedule
 * commands. When there are multiple flows on the stack, the flow at index N
 * represents a callback triggered within a task owned by the flow at index
 * N-1.
 * @type {!Array<!promise.ControlFlow>}
 */
var activeFlows = [];


/**
 * Changes the default flow to use when no others are active.
 * @param {!promise.ControlFlow} flow The new default flow.
 * @throws {Error} If the default flow is not currently active.
 */
promise.setDefaultFlow = function(flow) {
  if (activeFlows.length) {
    throw Error('You may only change the default flow while it is active');
  }
  defaultFlow = flow;
};


/**
 * @return {!promise.ControlFlow} The currently active control flow.
 */
promise.controlFlow = function() {
  return /** @type {!promise.ControlFlow} */ (
      Arrays.peek(activeFlows) || defaultFlow);
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
  var flow = new promise.ControlFlow;
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
 * __Example 1:__ the Fibonacci Sequence.
 *
 *     promise.consume(function* fibonacci() {
 *       var n1 = 1, n2 = 1;
 *       for (var i = 0; i < 4; ++i) {
 *         var tmp = yield n1 + n2;
 *         n1 = n2;
 *         n2 = tmp;
 *       }
 *       return n1 + n2;
 *     }).then(function(result) {
 *       console.log(result);  // 13
 *     });
 *
 * __Example 2:__ a generator that throws.
 *
 *     promise.consume(function* () {
 *       yield promise.delayed(250).then(function() {
 *         throw Error('boom');
 *       });
 *     }).thenCatch(function(e) {
 *       console.log(e.toString());  // Error: boom
 *     });
 *
 * @param {!Function} generatorFn The generator function to execute.
 * @param {Object=} opt_self The object to use as "this" when invoking the
 *     initial generator.
 * @param {...*} var_args Any arguments to pass to the initial generator.
 * @return {!promise.Promise<?>} A promise that will resolve to the
 *     generator's final result.
 * @throws {TypeError} If the given function is not a generator.
 */
promise.consume = function(generatorFn, opt_self, var_args) {
  if (!promise.isGenerator(generatorFn)) {
    throw new TypeError('Input is not a GeneratorFunction: ' +
        generatorFn.constructor.name);
  }

  var deferred = promise.defer();
  var generator = generatorFn.apply(opt_self, Arrays.slice(arguments, 2));
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
