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
goog.provide('webdriver.promise.Application');
goog.provide('webdriver.promise.Deferred');
goog.provide('webdriver.promise.Promise');

goog.require('goog.array');
goog.require('goog.object');
goog.require('webdriver.EventEmitter');
goog.require('webdriver.stacktrace.Snapshot');



/**
 * Represents the eventual value of a completed operation. Each promise may be
 * in one of three states: pending, resolved, or rejected. Each promise starts
 * in the pending state and may make a single transition to either a
 * fulfilled or failed state.
 *
 * <p/>This class is based on the Promise/A proposal from CommonJS. Additional
 * functions are provided for API compatibility with Dojo Deferred objects.
 *
 * @constructor
 * @see http://wiki.commonjs.org/wiki/Promises/A
 */
webdriver.promise.Promise = function() {
};


/**
 * Cancels the computation of this promise's value, rejecting the promise in the
 * process.
 * @param {*} reason The reason this promise is being cancelled. While typically
 *     an {@code Error}, any type is permissible.
 */
webdriver.promise.Promise.prototype.cancel = function(reason) {
  throw new TypeError('Unimplemented function: "cancel"');
};


/** @return {boolean} Whether this promise's value is still being computed. */
webdriver.promise.Promise.prototype.isPending = function() {
  throw new TypeError('Unimplemented function: "isPending"');
};


/**
 * Registers listeners for when this instance is resolved. This function most
 * overridden by subtypes.
 *
 * @param {Function=} opt_callback The function to call if this promise is
 *     successfully resolved. The function should expect a single argument: the
 *     promise's resolved value.
 * @param {Function=} opt_errback The function to call if this promise is
 *     rejected. The function should expect a single argument: the failure
 *     reason. While this argument is typically an {@code Error}, any type is
 *     permissible.
 * @return {!webdriver.promise.Promise} A new promise which will be resolved
 *     with the result of the invoked callback.
 */
webdriver.promise.Promise.prototype.then = function(opt_callback,
                                                    opt_errback) {
  throw new TypeError('Unimplemented function: "then"');
};


/**
 * Registers a function to be invoked when this promise is successfully
 * resolved. This function is provided for backwards compatibility with the
 * Dojo Deferred API.
 *
 * @param {Function} callback The function to call if this promise is
 *     successfully resolved. The function should expect a single argument: the
 *     promise's resolved value.
 * @param {!Object=} opt_self The object which |this| should refer to when the
 *     function is invoked.
 * @return {!webdriver.promise.Promise} A new promise which will be resolved
 *     with the result of the invoked callback.
 */
webdriver.promise.Promise.prototype.addCallback = function(callback, opt_self) {
  return this.then(goog.bind(callback, opt_self));
};


/**
 * Registers a function to be invoked when this promise is rejected.
 * This function is provided for backwards compatibility with the
 * Dojo Deferred API.
 *
 * @param {Function} errback The function to call if this promise is
 *     rejected. The function should expect a single argument: the failure
 *     reason. While this argument is typically an {@code Error}, any type is
 *     permissible.
 * @param {!Object=} opt_self The object which |this| should refer to when the
 *     function is invoked.
 * @return {!webdriver.promise.Promise} A new promise which will be resolved
 *     with the result of the invoked callback.
 */
webdriver.promise.Promise.prototype.addErrback = function(errback, opt_self) {
  return this.then(null, goog.bind(errback, opt_self));
};


/**
 * Registers a function to be invoked when this promise is either rejected or
 * resolved. This function is provided for backwards compatibility with the
 * Dojo Deferred API.
 *
 * @param {Function} callback The function to call when this promise is
 *     either resolved or rejected. The function should expect a single
 *     argument: the resolved value or rejection error.
 * @param {!Object=} opt_self The object which |this| should refer to when the
 *     function is invoked.
 * @return {!webdriver.promise.Promise} A new promise which will be resolved
 *     with the result of the invoked callback.
 */
webdriver.promise.Promise.prototype.addBoth = function(callback, opt_self) {
  callback = goog.bind(callback, opt_self);
  return this.then(callback, callback);
};


/**
 * An alias for {@code webdriver.promise.Promise.prototype.then} that permits
 * the scope of the invoked function to be specified. This function is provided
 * for backwards compatibility with the Dojo Deferred API.
 *
 * @param {Function} callback The function to call if this promise is
 *     successfully resolved. The function should expect a single argument: the
 *     promise's resolved value.
 * @param {Function} errback The function to call if this promise is
 *     rejected. The function should expect a single argument: the failure
 *     reason. While this argument is typically an {@code Error}, any type is
 *     permissible.
 * @param {!Object=} opt_self The object which |this| should refer to when the
 *     function is invoked.
 * @return {!webdriver.promise.Promise} A new promise which will be resolved
 *     with the result of the invoked callback.
 */
webdriver.promise.Promise.prototype.addCallbacks = function(callback, errback,
                                                            opt_self) {
  return this.then(goog.bind(callback, opt_self),
      goog.bind(errback, opt_self));
};



/**
 * Represents a value that will be resolved at some point in the future. This
 * class represents the protected "producer" half of a Promise - each Deferred
 * has a {@code promise} property that may be returned to consumers for
 * registering callbacks, reserving the ability to resolve the deferred to the
 * producer.
 *
 * <p>If this Defererd is rejected and there are no listeners registered before
 * the next turn of the event loop, the rejection will be passed to the
 * {@link webdriver.promise.Application} as an unhandled failure.
 *
 * <p>If this Deferred is cancelled, the cancellation reason will be forward to
 * the Deferred's canceller function (if provided). The canceller may return a
 * truth-y value to override the reason provided for rejection.
 *
 * @param {Function=} opt_canceller Function to call when cancelling the
 *     computation of this instance's value.
 * @constructor
 * @extends {webdriver.promise.Promise}
 */
webdriver.promise.Deferred = function(opt_canceller) {
  /* NOTE: This class's implementation diverges from the prototypical style
   * used in the rest of the atoms library. This was done intentionally to
   * protect the internal Deferred state from consumers, as outlined by
   *     http://wiki.commonjs.org/wiki/Promises
   */
  goog.base(this);

  /**
   * The listeners registered with this Deferred. Each element in the list will
   * be a 3-tuple of the callback function, errback function, and the
   * corresponding deferred object.
   * @type {!Array.<!webdriver.promise.Deferred.Listener_>}
   */
  var listeners = [];

  /**
   * Whether this Deferred's resolution was ever handled by a listener.
   * If the Deferred is rejected and its value is not handled by a listener
   * before the next turn of the event loop, the error will be passed to the
   * global error handler.
   * @type {boolean}
   */
  var handled = false;

  /**
   * This Deferred's current state.
   * @type {!webdriver.promise.Deferred.State_}
   */
  var state = webdriver.promise.Deferred.State_.PENDING;

  /**
   * This Deferred's resolved value; set when the state transitions from
   * {@code webdriver.promise.Deferred.State_.PENDING}.
   * @type {*}
   */
  var value;

  /** @return {boolean} Whether this promise's value is still pending. */
  function isPending() {
    return state == webdriver.promise.Deferred.State_.PENDING;
  }

  /**
   * Notifies all of the listeners registered with this Deferred that its state
   * has changed. Will throw an error if this Deferred has already been
   * resolved.
   * @param {!webdriver.promise.Deferred.State_} newState The deferred's new
   *     state.
   * @param {*} newValue The deferred's new value.
   */
  function notifyAll(newState, newValue) {
    if (!isPending()) {
      throw new Error('This Deferred has already been resolved.');
    }

    state = newState;
    value = newValue;
    while (listeners.length) {
      notify(listeners.shift());
    }

    if (!handled && state == webdriver.promise.Deferred.State_.REJECTED) {
      var app = webdriver.promise.Application.getInstance();
      app.pendingRejections_ += 1;
      setTimeout(function() {
        app.pendingRejections_ -= 1;
        if (!handled) {
          app.abortFrame_(value);
        }
      }, 0);
    }
  }

  /**
   * Notifies a single listener of this Deferred's change in state.
   * @param {!webdriver.promise.Deferred.Listener_} listener The listener to
   *     notify.
   */
  function notify(listener) {
    var func = state == webdriver.promise.Deferred.State_.RESOLVED ?
        listener.callback : listener.errback;
    if (func) {
      var app = webdriver.promise.Application.getInstance();
      var result = app.runInNewFrame_(goog.partial(func, value));
      webdriver.promise.asap(result,
          listener.deferred.resolve,
          listener.deferred.reject);
    } else if (state == webdriver.promise.Deferred.State_.REJECTED) {
      listener.deferred.reject(value);
    } else {
      listener.deferred.resolve(value);
    }
  }

  /**
   * The consumer promise for this instance. Provides protected access to the
   * callback registering functions.
   * @type {!webdriver.promise.Promise}
   */
  var promise = new webdriver.promise.Promise();

  /**
   * Registers a callback on this Deferred.
   * @param {Function=} opt_callback The callback.
   * @param {Function=} opt_errback The errback.
   * @return {!webdriver.promise.Promise} A new promise representing the result
   *     of the callback.
   * @see webdriver.promise.Promise#then
   */
  function then(opt_callback, opt_errback) {
    // Avoid unnecessary allocations if we weren't given any callback functions.
    if (!opt_callback && !opt_errback) {
      return promise;
    }

    // The moment a listener is registered, we consider this deferred to be
    // handled; the callback must handle any rejection errors.
    handled = true;

    var listener = {
      callback: opt_callback,
      errback: opt_errback,
      deferred: new webdriver.promise.Deferred(cancel)
    };

    if (state == webdriver.promise.Deferred.State_.PENDING) {
      listeners.push(listener);
    } else {
      notify(listener);
    }

    return listener.deferred.promise;
  }

  var self = this;

  /**
   * Resolves this promise with the given value. If the value is itself a
   * promise and not a reference to this deferred, this instance will wait for
   * it before resolving.
   * @param {*=} opt_value The resolved value.
   */
  function resolve(opt_value) {
    if (webdriver.promise.isPromise(opt_value) && opt_value !== self) {
      if (opt_value instanceof webdriver.promise.Deferred) {
        opt_value.then(
            goog.partial(notifyAll, webdriver.promise.Deferred.State_.RESOLVED),
            goog.partial(notifyAll,
                webdriver.promise.Deferred.State_.REJECTED));
        return;
      }
      webdriver.promise.asap(opt_value, resolve, reject);
    } else {
      notifyAll(webdriver.promise.Deferred.State_.RESOLVED, opt_value);
    }
  }

  /**
   * Rejects this promise. If the error is itself a promise, this instance will
   * be chained to it and be rejected with the error's resolved value.
   * @param {*=} opt_error The rejection reason, typically either a
   *     {@code Error} or a {@code string}.
   */
  function reject(opt_error) {
    if (webdriver.promise.isPromise(opt_error) && opt_error !== self) {
      if (opt_error instanceof webdriver.promise.Deferred) {
        opt_error.then(
            goog.partial(notifyAll, webdriver.promise.Deferred.State_.REJECTED),
            goog.partial(notifyAll,
                webdriver.promise.Deferred.State_.REJECTED));
        return;
      }
      webdriver.promise.asap(opt_error, reject, reject);
    } else {
      notifyAll(webdriver.promise.Deferred.State_.REJECTED, opt_error);
    }
  }

  /**
   * Cancels the computation of this promise's value and flags the promise as a
   * rejected value.
   * @param {*} reason The reason for cancelling this promise.
   */
  function cancel(reason) {
    if (!isPending()) {
      throw Error('This Deferred has already been resolved.');
    }

    if (opt_canceller) {
      reason = opt_canceller(reason) || reason;
    }

    // Only reject this promise if it is still pending after calling its
    // canceller function. This is because the user may have injected a
    // canceller that directly rejects (or resolves) this promise's value. The
    // more likely scenario, however, is that this promise is chained off
    // another. Once the cancellation request reaches the root deferred, the
    // subsequent rejection will trickle back down.
    if (isPending()) {
      reject(reason);
    }
  }

  this.promise = promise;
  this.promise.then = this.then = then;
  this.promise.cancel = this.cancel = cancel;
  this.promise.isPending = this.isPending = isPending;
  this.resolve = this.callback = resolve;
  this.reject = this.errback = reject;

  // Export symbols necessary for the contract on this object to work in
  // compiled mode.
  goog.exportProperty(this, 'then', this.then);
  goog.exportProperty(this, 'cancel', cancel);
  goog.exportProperty(this, 'resolve', resolve);
  goog.exportProperty(this, 'reject', reject);
  goog.exportProperty(this, 'isPending', isPending);
  goog.exportProperty(this, 'promise', this.promise);
  goog.exportProperty(this.promise, 'then', this.then);
  goog.exportProperty(this.promise, 'cancel', cancel);
  goog.exportProperty(this.promise, 'isPending', isPending);
};
goog.inherits(webdriver.promise.Deferred, webdriver.promise.Promise);


/**
 * Type definition for a listener registered on a Deferred object.
 * @typedef {{callback:(Function|undefined),
 *            errback:(Function|undefined),
 *            deferred:!webdriver.promise.Deferred}}
 * @private
 */
webdriver.promise.Deferred.Listener_;


/**
 * The three states a {@code webdriver.promise.Deferred} object may be in.
 * @enum {number}
 * @private
 */
webdriver.promise.Deferred.State_ = {
  REJECTED: -1,
  PENDING: 0,
  RESOLVED: 1
};


/**
 * Determines whether a {@code value} should be treated as a promise.
 * Any object whose "then" property is a function will be considered a promise.
 *
 * @param {*} value The value to test.
 * @return {boolean} Whether the value is a promise.
 */
webdriver.promise.isPromise = function(value) {
  return !!value && goog.isObject(value) &&
      // Use array notation so the Closure compiler does not obfuscate away our
      // contract.
      goog.isFunction(value['then']);
};


/**
 * Creates a promise that will be resolved at a set time in the future.
 * @param {number} ms The amount of time, in milliseconds, to wait before
 *     resolving the promise.
 * @return {!webdriver.promise.Promise} The promise.
 */
webdriver.promise.delayed = function(ms) {
  var key;
  var deferred = new webdriver.promise.Deferred(function() {
    clearTimeout(key);
  });
  key = setTimeout(deferred.resolve, ms);
  return deferred.promise;
};


/**
 * Creates a promise that has been resolved with the given value.
 * @param {*=} opt_value The resolved value.
 * @return {!webdriver.promise.Promise} The resolved promise.
 */
webdriver.promise.resolved = function(opt_value) {
  if (opt_value instanceof webdriver.promise.Promise) {
    return opt_value;
  }
  var deferred = new webdriver.promise.Deferred();
  deferred.resolve(opt_value);
  return deferred.promise;
};


/**
 * Creates a promise that has been rejected with the given reason.
 * @param {*} reason The rejection reason; may be any value, but is usually an
 *     Error or a string.
 * @return {!webdriver.promise.Promise} The rejected promise.
 */
webdriver.promise.rejected = function(reason) {
  var deferred = new webdriver.promise.Deferred();
  deferred.reject(reason);
  return deferred.promise;
};


/**
 * Wraps a function that is assumed to be a node-style callback as its final
 * argument. This callback takes two arguments: an error value (which will be
 * null if the call succeeded), and the success value as the second argument.
 * If the call fails, the returned promise will be rejected, otherwise it will
 * be resolved with the result.
 * @param {!Function} fn The function to wrap.
 * @return {!webdriver.promise.Promise} A promise that will be resolved with the
 *     result of the provided function's callback.
 */
webdriver.promise.checkedNodeCall = function(fn) {
  var deferred = new webdriver.promise.Deferred(function() {
    throw Error('This Deferred may not be cancelled');
  });
  try {
    fn(function(error, value) {
      if (deferred.isPending()) {
        error ? deferred.reject(error) : deferred.resolve(value);
      }
    });
  } catch (ex) {
    if (deferred.isPending()) {
      deferred.reject(ex);
    }
  }
  return deferred.promise;
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
 * @return {!webdriver.promise.Promise} A new promise.
 */
webdriver.promise.when = function(value, opt_callback, opt_errback) {
  if (value instanceof webdriver.promise.Promise) {
    return value.then(opt_callback, opt_errback);
  }

  var deferred = new webdriver.promise.Deferred();

  webdriver.promise.asap(value,
      goog.partial(maybeResolve, deferred.resolve),
      goog.partial(maybeResolve, deferred.reject));

  return deferred.then(opt_callback, opt_errback);

  function maybeResolve(resolveFn, value) {
    if (deferred.isPending()) {
      resolveFn(value);
    }
  }
};


/**
 * Invokes the appropriate callback function as soon as a promised
 * {@code value} is resolved. This function is similar to
 * {@code webdriver.promise.when}, except it does not return a new promise.
 * @param {*} value The value to observe.
 * @param {Function} callback The function to call when the value is
 *     resolved successfully.
 * @param {Function=} opt_errback The function to call when the value is
 *     rejected.
 */
webdriver.promise.asap = function(value, callback, opt_errback) {
  if (webdriver.promise.isPromise(value)) {
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
 *   var value = {};
 *   value['self'] = value;
 *   webdriver.promise.fullyResolved(value);  // Stack overflow.
 *
 * @param {*} value The value to fully resolve.
 * @return {!webdriver.promise.Promise} A promise for a fully resolved version
 *     of the input value.
 */
webdriver.promise.fullyResolved = function(value) {
  if (webdriver.promise.isPromise(value)) {
    return webdriver.promise.when(value, webdriver.promise.fullyResolveValue_);
  }
  return webdriver.promise.fullyResolveValue_(value);
};


/**
 * @param {*} value The value to fully resolve. If a promise, assumed to
 *     already be resolved.
 * @return {!webdriver.promise.Promise} A promise for a fully resolved version
 *     of the input value.
 * @private
 */
webdriver.promise.fullyResolveValue_ = function(value) {
  switch (goog.typeOf(value)) {
    case 'array':
      // In IE, goog.array.forEach will not iterate properly over arrays
      // containing undefined values because "index in array" returns
      // false when array[index] === undefined. To get around this, we need
      // to use our own forEach implementation.  Yay, IE.
      value = (/** @type {!Array} */value);
      return webdriver.promise.fullyResolveKeys_(value, value.length,
          function(arr, f, opt_obj) {
            var l = arr.length;
            for (var i = 0; i < l; ++i) {
              f.call(opt_obj, arr[i], i, arr);
            }
          });

    case 'object':
      if (webdriver.promise.isPromise(value)) {
        // We get here when the original input value is a promise that
        // resolves to itself. When the user provides us with such a promise,
        // trust that it counts as a "fully resolved" value and return it.
        // Of course, since it's already a promise, we can just return it
        // to the user instead of wrapping it in another promise.
        return (/** @type {!webdriver.promise.Promise} */value);
      }

      if (goog.isNumber(value.nodeType)) {
        // DOM node; return early to avoid infinite recursion. Should we
        // only support objects with a certain level of nesting?
        return webdriver.promise.resolved(value);
      }

      value = (/** @type {!Object} */value);
      return webdriver.promise.fullyResolveKeys_(value,
          goog.object.getKeys(value).length,
          goog.object.forEach);

    default:  // boolean, function, null, number, string, undefined
      return webdriver.promise.resolved(value);
  }
};


/**
 * @param {!Object} obj the object to resolve.
 * @param {number} numKeys The number of keys in the object.
 * @param {!Function} forEachKey The function to use for iterating over the keys
 *     in the object.
 * @return {!webdriver.promise.Promise} A promise that will be resolved with the
 *     input object once all of its values have been fully resolved.
 * @private
 */
webdriver.promise.fullyResolveKeys_ = function(obj, numKeys, forEachKey) {
  if (!numKeys) {
    return webdriver.promise.resolved(obj);
  }

  var numResolved = 0;
  var deferred = new webdriver.promise.Deferred();

  forEachKey(obj, function(partialValue, key) {
    var type = goog.typeOf(partialValue);
    if (type != 'array' && type != 'object') {
      return maybeResolveValue();
    }

    webdriver.promise.fullyResolved(partialValue).then(
        function(resolvedValue) {
          if (deferred.isPending()) {
            obj[key] = resolvedValue;
            maybeResolveValue();
          }
        },
        function(err) {
          if (deferred.isPending()) {
            deferred.reject(err);
          }
        });

    function maybeResolveValue() {
      if (++numResolved == numKeys && deferred.isPending()) {
        deferred.resolve(obj);
      }
    }
  });

  return deferred.promise;
};


//////////////////////////////////////////////////////////////////////////////
//
//  webdriver.promise.Application
//
//////////////////////////////////////////////////////////////////////////////



/**
 * Handles the execution of scheduled tasks, each of which may be an
 * asynchronous operation. The application will ensure tasks are executed in the
 * ordered scheduled, starting each task only once those before it have
 * completed.
 *
 * <p>Each task scheduled with the application may return a
 * {@link webdriver.promise.Promise} to indicate it is an asynchronous
 * operation. The Application will wait for such promises to be resolved before
 * marking the task as completed.
 *
 * <p>Tasks and each callback registered on a {@link webdriver.promise.Deferred}
 * will be run in their own Application frame.  Any tasks scheduled within a
 * frame will have priority over previously scheduled tasks. Furthermore, if
 * any of the tasks in the frame fails, the remainder of the tasks in that frame
 * will be discarded and the failure will be propagated to the user through the
 * callback/task's promised result.
 *
 * <p>Each time an application empties its task queue, it will fire an
 * {@link webdriver.promise.Application.EventType.IDLE} event. Conversely,
 * whenever the application terminates due to an unhandled error,
 * it will remove all remaining tasks in its queue and fire an
 * {@link webdriver.promise.Application.EventType.UNCAUGHT_EXCEPTION} event. If
 * there are no listeners registered with the application, the error will be
 * rethrown to the global error handler.
 *
 * @constructor
 * @extends {webdriver.EventEmitter}
 */
webdriver.promise.Application = function() {
  webdriver.EventEmitter.call(this);

  /**
   * A list of recently completed tasks. Each time a new task is started or a
   * frame is completed, the previously recorded task is removed from this
   * list.
   * @type {!Array.<!webdriver.promise.Application.Task_>}
   * @private
   */
  this.history_ = [];
};
goog.inherits(webdriver.promise.Application, webdriver.EventEmitter);
goog.addSingletonGetter(webdriver.promise.Application);


/**
 * Events that may be emitted by an {@link webdriver.promise.Application}.
 * @enum {string}
 */
webdriver.promise.Application.EventType = {

  /** Emitted when all tasks have been successfully executed. */
  IDLE: 'idle',

  /** Emitted whenever a new task has been scheduled. */
  SCHEDULE_TASK: 'scheduleTask',

  /**
   * Emitted whenever an application is aborting due to an unhandled promise
   * rejection. This event will be emitted along with the offending rejection
   * reason. Upon emitting this event, the application will empty its task queue
   * and revert to its initial state.
   */
  UNCAUGHT_EXCEPTION: 'uncaughtException'
};


/**
 * How often, in milliseconds, the Application event loop should run.
 * @type {number}
 * @const
 */
webdriver.promise.Application.EVENT_LOOP_FREQUENCY = 10;


/**
 * Tracks the active execution frame for this application. Lazily initialized
 * when the first task is scheduled.
 * @type {webdriver.promise.Application.Frame_}
 * @private
 */
webdriver.promise.Application.prototype.activeFrame_ = null;


/**
 * A reference to the frame in which new tasks should be scheduled. If
 * {@code null}, tasks will be scheduled within the active frame. When forcing
 * a function to run in the context of a new frame, this pointer is used to
 * ensure tasks are scheduled within the newly created frame, even though it
 * won't be active yet.
 * @type {webdriver.promise.Application.Frame_}
 * @private
 * @see {#runInNewFrame_}
 */
webdriver.promise.Application.prototype.schedulingFrame_ = null;


/**
 * Timeout ID set when the application is about to shutdown without any errors
 * being detected. Upon shutting down, the application will emit an
 * {@link webdriver.promise.Application.EventType.IDLE} event. Idle events
 * always follow a brief timeout in order to catch latent errors from the last
 * completed task. If this task had a callback registered, but no errback, and
 * the task fails, the unhandled failure would not be reported by the promise
 * system until the next turn of the event loop:
 *
 *   // Schedule 1 task that fails.
 *   var result = webriver.Application.getInstance().schedule('example',
 *       function() { return webdriver.promise.rejected('failed'); });
 *   // Set a callback on the result. This delays reporting the unhandled
 *   // failure for 1 turn of the event loop.
 *   result.then(goog.nullFunction);
 *
 * @type {?number}
 * @private
 */
webdriver.promise.Application.prototype.shutdownId_ = null;


/**
 * Interval ID for the application event loop.
 * @type {?number}
 * @private
 */
webdriver.promise.Application.prototype.eventLoopId_ = null;


/**
 * The number of "pending" promise rejections.
 *
 * <p>Each time a promise is rejected and is not handled by a listener, it will
 * schedule a 0-based timeout to check if it is still unrejected in the next
 * turn of the JS-event loop. This allows listeners to attach to, and handle,
 * the rejected promise at any point in same turn of the event loop that the
 * promise was rejected.
 *
 * <p>When this Application's own event loop triggers, it will not run if there
 * are any outstanding promise rejections. This allows unhandled promises to
 * be reported before a new task is started, ensuring the error is reported to
 * the current task queue.
 *
 * @type {number}
 * @private
 */
webdriver.promise.Application.prototype.pendingRejections_ = 0;


/**
 * The number of aborted frames since the last time a task was executed or a
 * frame completed successfully.
 * @type {number}
 * @private
 */
webdriver.promise.Application.prototype.numAbortedFrames_ = 0;


/**
 * Resets this instance, clearing its queue and removing all event listeners.
 */
webdriver.promise.Application.prototype.reset = function() {
  this.activeFrame_ = null;
  this.clearHistory();
  this.removeAllListeners();
  this.cancelShutdown_();
  this.cancelEventLoop_();
};


/**
 * Returns a summary of the recent task activity for this instance. This
 * includes the most recently completed task, as well as any parent tasks. In
 * the returned summary, the task at index N is considered a sub-task of the
 * task at index N+1.
 * @return {!Array.<string>} A summary of this application's recent task
 *     activity.
 */
webdriver.promise.Application.prototype.getHistory = function() {
  var pendingTasks = [];
  var currentFrame = this.activeFrame_;
  while (currentFrame) {
    var task = currentFrame.getPendingTask();
    if (task) {
      pendingTasks.push(task);
    }
    // A frame's parent node will always be another frame.
    currentFrame =
        (/** @type {webdriver.promise.Application.Frame_} */currentFrame.
            getParent());
  }

  var fullHistory = goog.array.concat(this.history_, pendingTasks);
  return goog.array.map(fullHistory, function(task) {
    return task.toString();
  });
};


/** Clears this instance's task history. */
webdriver.promise.Application.prototype.clearHistory = function() {
  this.history_ = [];
};


/**
 * Removes a completed task from this application's history record. If any
 * tasks remain from aborted frames, those will be removed as well.
 * @private
 */
webdriver.promise.Application.prototype.trimHistory_ = function() {
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
 * {@link webdriver.promise.Application#annotateError}.
 * @type {string}
 * @const
 * @private
 */
webdriver.promise.Application.ANNOTATION_PROPERTY_ =
    'webdriver_promise_error_';


/**
 * Appends a summary of this application's recent task history to the given
 * error's stack trace. This function will also ensure the error's stack trace
 * is in canonical form.
 * @param {!(Error|goog.testing.JsUnitException)} e The error to annotate.
 * @return {!(Error|goog.testing.JsUnitException)} The annotated error.
 */
webdriver.promise.Application.prototype.annotateError = function(e) {
  if (!!e[webdriver.promise.Application.ANNOTATION_PROPERTY_]) {
    return e;
  }

  e = webdriver.stacktrace.format(e);
  e.stack += [
    '\n==== async task ====\n',
    this.getHistory().join('\n==== async task ====\n')
  ].join('');
  e[webdriver.promise.Application.ANNOTATION_PROPERTY_] = true;
  return e;
};


/**
 * @return {string} The scheduled tasks still pending with this application.
 */
webdriver.promise.Application.prototype.getSchedule = function() {
  return this.activeFrame_ ? this.activeFrame_.getRoot().toString() : '[]';
};


/**
 * Schedules a task for execution. If there is nothing currently in the
 * queue, the task will be executed in the next turn of the event loop.
 *
 * @param {string} description A description of the task.
 * @param {!Function} fn The function to call to start the task. If the
 *     function returns a {@code webdriver.promise.Promise}, the application
 *     will wait for it to be resolved before starting the next task.
 * @return {!webdriver.promise.Promise} A promise that will be resolved with
 *     the result of the action.
 */
webdriver.promise.Application.prototype.schedule = function(description, fn) {
  this.cancelShutdown_();

  if (!this.activeFrame_) {
    this.activeFrame_ = new webdriver.promise.Application.Frame_();
  }

  // Trim an extra frame off the generated stack trace for the call to this
  // function.
  var snapshot = new webdriver.stacktrace.Snapshot(1);
  var task = new webdriver.promise.Application.Task_(fn, description, snapshot);
  var scheduleIn = this.schedulingFrame_ || this.activeFrame_;
  scheduleIn.addChild(task);

  this.emit(webdriver.promise.Application.EventType.SCHEDULE_TASK);

  this.scheduleEventLoopStart_();
  return task.promise;
};


/**
 * Inserts a {@code setTimeout} into the command queue. This is equivalent to
 * a thread sleep in a synchronous programming language.
 *
 * @param {string} description A description to accompany the timeout.
 * @param {number} ms The timeout delay, in milliseconds.
 * @return {!webdriver.promise.Promise} A promise that will be resolved with
 *     the result of the action.
 */
webdriver.promise.Application.prototype.scheduleTimeout = function(description,
                                                                   ms) {
  return this.schedule(description, function() {
    return webdriver.promise.delayed(ms);
  });
};


/**
 * Schedules a task that shall wait for a condition to hold. Each condition
 * function may return any value, but it will always be evaluated as a boolean.
 *
 * <p>Condition functions may schedule sub-tasks with this application, however,
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
 * @param {string} description A description of the wait.
 * @param {!Function} condition The condition function to poll.
 * @param {number} timeout How long to wait, in milliseconds, for the condition
 *     to hold before timing out.
 * @param {string=} opt_message An optional error message to include if the
 *     wait times out; defaults to the empty string.
 * @return {!webdriver.promise.Promise} A promise that will be resolved when the
 *     condition has been satisified. The promise shall be rejected if the wait
 *     times out waiting for the condition.
 */
webdriver.promise.Application.prototype.scheduleWait = function(description,
                                                                condition,
                                                                timeout,
                                                                opt_message) {
  var sleep = Math.min(timeout, 100);
  var self = this;

  return this.schedule(description, function() {
    var startTime = goog.now();
    var waitResult = new webdriver.promise.Deferred();
    var waitFrame = self.activeFrame_;
    waitFrame.isWaiting = true;
    pollCondition();
    return waitResult.promise;

    function pollCondition() {
      var result = self.runInNewFrame_(condition);
      return webdriver.promise.when(result, function(value) {
        var elapsed = goog.now() - startTime;
        if (!!value) {
          waitFrame.isWaiting = false;
          waitResult.resolve(value);
        } else if (elapsed >= timeout) {
          waitResult.reject(new Error((opt_message ? opt_message + '\n' : '') +
              'Wait timed out after ' + elapsed + 'ms'));
        } else {
          setTimeout(pollCondition, sleep);
        }
      }, waitResult.reject);
    }
  });
};


/**
 * Schedules the interval for this application's event loop, if necessary.
 * @private
 */
webdriver.promise.Application.prototype.scheduleEventLoopStart_ = function() {
  if (!this.eventLoopId_) {
    this.eventLoopId_ = setInterval(goog.bind(this.runEventLoop_, this),
        webdriver.promise.Application.EVENT_LOOP_FREQUENCY);
  }
};


/**
 * Cancels the event loop, if necessary.
 * @private
 */
webdriver.promise.Application.prototype.cancelEventLoop_ = function() {
  if (this.eventLoopId_) {
    clearInterval(this.eventLoopId_);
    this.eventLoopId_ = null;
  }
};


/**
 * Executes the next task for the current frame. If the current frame has no
 * more tasks, the frame's result will be resolved, returning control to the
 * frame's creator. This will terminate the application if the completed
 * frame was at the top of the stack.
 * @private
 */
webdriver.promise.Application.prototype.runEventLoop_ = function() {
  // If we get here and there are pending promise rejections, then those
  // promises are queued up to run as soon as this (JS) event loop terminates.
  // Short-circuit our loop to give those promises a chance to run. Otherwise,
  // we might start a new task only to have it fail because of one of these
  // pending rejections.
  if (this.pendingRejections_) {
    return;
  }

  // If the app aborts due to an unhandled exception after we've scheduled
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
    this.history_.push(task);
    activeFrame.setPendingTask(null);
  }, this);

  this.trimHistory_();
  var result = this.runInNewFrame_(task.execute, true);
  var self = this;
  webdriver.promise.asap(result, function(result) {
    markTaskComplete();
    task.resolve(result);
  }, function(error) {
    markTaskComplete();
    task.reject(self.annotateError(error));
  });
};


/**
 * @return {webdriver.promise.Application.Task_} The next task to execute, or
 *     {@code null} if a frame was resolved.
 * @private
 */
webdriver.promise.Application.prototype.getNextTask_ = function() {
  var firstChild = this.activeFrame_.getFirstChild();
  if (!firstChild) {
    if (!this.activeFrame_.isWaiting) {
      this.resolveFrame_(this.activeFrame_);
    }
    return null;
  }

  if (firstChild instanceof webdriver.promise.Application.Frame_) {
    this.activeFrame_ = firstChild;
    return this.getNextTask_();
  }

  firstChild.getParent().removeChild(firstChild);
  return firstChild;
};


/**
 * @param {!webdriver.promise.Application.Frame_} frame The frame to resolve.
 * @private
 */
webdriver.promise.Application.prototype.resolveFrame_ = function(frame) {
  if (this.activeFrame_ === frame) {
    // Frame parent is always another frame, but the compiler is not smart
    // enough to recognize this.
    this.activeFrame_ =
        (/** @type {webdriver.promise.Application.Frame_} */frame.getParent());
  }

  if (frame.getParent()) {
    frame.getParent().removeChild(frame);
  }
  this.trimHistory_();
  frame.resolve();

  if (!this.activeFrame_) {
    this.commenceShutdown_();
  }
};


/**
 * Aborts the current frame. The frame, and all of the tasks scheduled within it
 * will be discarded. If this application does not have an active frame, it will
 * immediately terminate all execution.
 * @param {*} error The reason the frame is being aborted; typically either
 *     an Error or string.
 * @private
 */
webdriver.promise.Application.prototype.abortFrame_ = function(error) {
  // Annotate the error value if it is Error-like.  We cannot use an instanceof
  // check because in Node the value may come from a different context that
  // this script so instanceof Error would fail.
  if (goog.isObject(error) &&
      goog.isString(error['message']) &&
      goog.isString(error['stack'])) {
    this.annotateError((/** @type {!Error} */error));
  }
  this.numAbortedFrames_++;

  if (!this.activeFrame_) {
    this.abortNow_(error);
    return;
  }

  // Frame parent is always another frame, but the compiler is not smart
  // enough to recognize this.
  var parent = (/** @type {webdriver.promise.Application.Frame_} */
      this.activeFrame_.getParent());
  if (parent) {
    parent.removeChild(this.activeFrame_);
  }

  var frame = this.activeFrame_;
  this.activeFrame_ = parent;
  frame.reject(error);
};


/**
 * Executes a function in a new frame. If the function does not schedule any new
 * tasks, the frame will be discarded and the function's result returned
 * immediately. Otherwise, a promise will be returned. This promise will be
 * resolved with the function's result once all of the tasks scheduled within
 * the function have been completed. If the function's frame is aborted, the
 * returned promise will be rejected.
 *
 * <p>When executing a {@link webdriver.promise.Application.Task_}, this
 * application's active frame will be updated to the newly created frame to
 * permit tasks to schedule sub-tasks.
 *
 * @param {!Function} fn The function to execute.
 * @param {boolean=} opt_isTask Whether the function is a task's
 *     {@link webdriver.promise.Application.Task_#execute execute} function.
 * @return {*} The function's return value, or a promise that will be resolved
 *     once all tasks scheduled by the function have completed.
 * @private
 */
webdriver.promise.Application.prototype.runInNewFrame_ = function(fn,
                                                                  opt_isTask) {
  var newFrame = new webdriver.promise.Application.Frame_(),
      self = this,
      oldFrame = this.activeFrame_;
  try {
    if (!this.activeFrame_) {
      this.activeFrame_ = newFrame;
    } else {
      this.activeFrame_.addChild(newFrame);
    }

    if (opt_isTask) {
      this.activeFrame_ = newFrame;
    }

    try {
      this.schedulingFrame_ = newFrame;
      var result = fn();
    } finally {
      this.schedulingFrame_ = null;
    }
    newFrame.lockFrame();

    if (!newFrame.children_.length) {
      removeNewFrame();
      return result;
    }

    return newFrame.then(function() {
      return result;
    }, function(e) {
      if (result instanceof webdriver.promise.Promise && result.isPending()) {
        result.cancel(e);
        return result;
      }
      throw e;
    });
  } catch (ex) {
    removeNewFrame();
    return webdriver.promise.rejected(ex);
  }

  function removeNewFrame() {
    var parent = newFrame.getParent();
    if (parent) {
      parent.removeChild(newFrame);
    }
    self.activeFrame_ = oldFrame;
  }
};


/**
 * Commences the shutdown sequence for this application. The application will
 * wait for 1 turn of the event loop before emitting the
 * {@link webdriver.promise.Application.EventType.IDLE} event to signal
 * listeners that it has completed. During this wait, if another task is
 * scheduled, the shutdown will be aborted and the application will continue
 * to operate.
 * @private
 */
webdriver.promise.Application.prototype.commenceShutdown_ = function() {
  if (!this.shutdownId_) {
    // Go ahead and stop the event loop now.  If we're in here, then there are
    // no more frames with tasks to execute. If we waited to cancel the event
    // loop in our timeout below, the event loop could trigger *before* the
    // timeout, generating an error from there being no frames.
    // If #schedule is called before the timeout below fires, it will cancel
    // the timeout and restart the event loop.
    this.cancelEventLoop_();

    var self = this;
    self.shutdownId_ = setTimeout(function() {
      self.shutdownId_ = null;
      self.emit(webdriver.promise.Application.EventType.IDLE);
    }, 0);
  }
};


/**
 * Cancels the shutdown sequence if it is currently scheduled.
 * @private
 */
webdriver.promise.Application.prototype.cancelShutdown_ = function() {
  if (this.shutdownId_) {
    clearTimeout(this.shutdownId_);
    this.shutdownId_ = null;
  }
};


/**
 * Aborts this application, abandoning all remaining tasks. If there are
 * listeners registered, an {@code UNCAUGHT_EXCEPTION} will be emitted with the
 * offending {@code error}, otherwise, the {@code error} will be rethrown to the
 * global error handler.
 * @param {*} error Object describing the error that caused the application to
 *     abort; usually either an Error or string value.
 * @private
 */
webdriver.promise.Application.prototype.abortNow_ = function(error) {
  this.activeFrame_ = null;
  this.cancelShutdown_();
  this.cancelEventLoop_();

  var listeners = this.listeners(
      webdriver.promise.Application.EventType.UNCAUGHT_EXCEPTION);
  if (!listeners.length) {
    setTimeout(function() {
      throw error;
    }, 0);
  } else {
    this.emit(webdriver.promise.Application.EventType.UNCAUGHT_EXCEPTION,
        error);
  }
};



/**
 * A single node in an {@link webdriver.promise.Application}'s task tree.
 * @constructor
 * @extends {webdriver.promise.Deferred}
 * @private
 */
webdriver.promise.Application.Node_ = function() {
  webdriver.promise.Deferred.call(this);
};
goog.inherits(webdriver.promise.Application.Node_, webdriver.promise.Deferred);


/**
 * This node's parent.
 * @type {webdriver.promise.Application.Node_}
 * @private
 */
webdriver.promise.Application.Node_.prototype.parent_ = null;


/** @return {webdriver.promise.Application.Node_} This node's parent. */
webdriver.promise.Application.Node_.prototype.getParent = function() {
  return this.parent_;
};


/**
 * @param {webdriver.promise.Application.Node_} parent This node's new parent.
 */
webdriver.promise.Application.Node_.prototype.setParent = function(parent) {
  this.parent_ = parent;
};


/**
 * @return {!webdriver.promise.Application.Node_} The root of this node's tree.
 */
webdriver.promise.Application.Node_.prototype.getRoot = function() {
  var root = this;
  while (root.parent_) {
    root = root.parent_;
  }
  return root;
};



/**
 * An execution frame within a {@link webdriver.promise.Application}.  Each
 * frame represents the execution context for either a
 * {@link webdriver.promise.Application.Task_} or a callback on a
 * {@link webdriver.promise.Deferred}.
 *
 * <p>Each frame may contain sub-frames.  If child N is a sub-frame, then the
 * items queued within it are given priority over child N+1.
 *
 * @constructor
 * @extends {webdriver.promise.Application.Node_}
 * @private
 */
webdriver.promise.Application.Frame_ = function() {
  webdriver.promise.Application.Node_.call(this);

  /**
   * @type {!Array.<!(webdriver.promise.Application.Frame_|
   *                  webdriver.promise.Application.Task_)>}
   * @private
   */
  this.children_ = [];
};
goog.inherits(webdriver.promise.Application.Frame_,
    webdriver.promise.Application.Node_);


/**
 * The task currently being executed within this frame.
 * @type {webdriver.promise.Application.Task_}
 * @private
 */
webdriver.promise.Application.Frame_.prototype.pendingTask_ = null;


/**
 * Whether this frame is active. A frame is considered active once one of its
 * descendants has been removed for execution.
 *
 * Adding a sub-frame as a child to an active frame is an indication that
 * a callback to a {@link webdriver.promise.Deferred} is being invoked and any
 * tasks scheduled within it should have priority over previously scheduled
 * tasks:
 * <code><pre>
 *   var app = webdriver.promise.Application.getInstance();
 *   app.schedule('start here', goog.nullFunction).then(function() {
 *     app.schedule('this should execute 2nd', goog.nullFunction);
 *   });
 *   app.schedule('this should execute last', goog.nullFunction);
 * </pre></code>
 *
 * @type {boolean}
 * @private
 */
webdriver.promise.Application.Frame_.prototype.isActive_ = false;


/**
 * Whether this frame is currently locked. A locked frame represents a callback
 * or task function which has run to completion and scheduled all of its tasks.
 *
 * <p>Once a frame becomes {@link #isActive_ active}, any new frames which are
 * added represent callbacks on a {@link webdriver.promise.Deferred}, whose
 * tasks must be given priority over previously scheduled tasks.
 *
 * @type {boolean}
 * @private
 */
webdriver.promise.Application.Frame_.prototype.isLocked_ = false;


/**
 * A reference to the last node inserted in this frame.
 * @type {webdriver.promise.Application.Node_}
 * @private
 */
webdriver.promise.Application.Frame_.prototype.lastInsertedChild_ = null;


/**
 * @return {webdriver.promise.Application.Task_} The task currently executing
 *     within this frame, if any.
 */
webdriver.promise.Application.Frame_.prototype.getPendingTask = function() {
  return this.pendingTask_;
};


/**
 * @param {webdriver.promise.Application.Task_} task The task currently
 *     executing within this frame, if any.
 */
webdriver.promise.Application.Frame_.prototype.setPendingTask = function(task) {
  this.pendingTask_ = task;
};


/** Locks this frame. */
webdriver.promise.Application.Frame_.prototype.lockFrame = function() {
  this.isLocked_ = true;
};


/**
 * Adds a new node to this frame.
 * @param {!(webdriver.promise.Application.Frame_|
 *           webdriver.promise.Application.Task_)} node The node to insert.
 */
webdriver.promise.Application.Frame_.prototype.addChild = function(node) {
  if (this.lastInsertedChild_ &&
      this.lastInsertedChild_ instanceof webdriver.promise.Application.Frame_ &&
      !this.lastInsertedChild_.isLocked_) {
    this.lastInsertedChild_.addChild(node);
    return;
  }

  node.setParent(this);

  if (this.isActive_ && node instanceof webdriver.promise.Application.Frame_) {
    var index = 0;
    if (this.lastInsertedChild_ instanceof
        webdriver.promise.Application.Frame_) {
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
 * @return {(webdriver.promise.Application.Frame_|
 *           webdriver.promise.Application.Task_)} This frame's fist child.
 */
webdriver.promise.Application.Frame_.prototype.getFirstChild = function() {
  this.isActive_ = true;
  return this.children_[0];
};


/**
 * Removes a child from this frame.
 * @param {!(webdriver.promise.Application.Frame_|
 *           webdriver.promise.Application.Task_)} child The child to remove.
 */
webdriver.promise.Application.Frame_.prototype.removeChild = function(child) {
  var index = goog.array.indexOf(this.children_, child);
  child.setParent(null);
  goog.array.removeAt(this.children_, index);
  if (this.lastInsertedChild_ === child) {
    this.lastInsertedChild_ = null;
  }
};


/** @override */
webdriver.promise.Application.Frame_.prototype.toString = function() {
  return '[' + goog.array.map(this.children_, function(child) {
    return child.toString();
  }).join(',') + ']';
};



/**
 * A task to be executed by a {@link webdriver.promise.Application}.
 *
 * @param {!Function} fn The function to call when the task executes. If it
 *     returns a {@code webdriver.promise.Promise}, the application will wait
 *     for it to be resolved before starting the next task.
 * @param {string} description A description of the task for debugging.
 * @param {!webdriver.stacktrace.Snapshot} snapshot A snapshot of the stack
 *     when this task was scheduled.
 * @constructor
 * @extends {webdriver.promise.Application.Node_}
 * @private
 */
webdriver.promise.Application.Task_ = function(fn, description, snapshot) {
  webdriver.promise.Application.Node_.call(this);

  /**
   * Executes this task.
   * @type {!Function}
   */
  this.execute = fn;

  /**
   * @type {string}
   * @private
   */
  this.description_ = description;

  /**
   * @type {!webdriver.stacktrace.Snapshot}
   * @private
   */
  this.snapshot_ = snapshot;
};
goog.inherits(webdriver.promise.Application.Task_,
    webdriver.promise.Application.Node_);


/** @return {string} This task's description. */
webdriver.promise.Application.Task_.prototype.getDescription = function() {
  return this.description_;
};


/** @override */
webdriver.promise.Application.Task_.prototype.toString = function() {
  var stack = this.snapshot_.getStacktrace();
  var ret = this.description_;
  if (stack) {
    ret += '\n' + stack;
  }
  return ret;
};
