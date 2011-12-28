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
 * http://wiki.commonjs.org/wiki/Promises
 */

goog.provide('webdriver.promise');
goog.provide('webdriver.promise.Application');
goog.provide('webdriver.promise.Deferred');
goog.provide('webdriver.promise.Promise');

goog.require('goog.array');
goog.require('goog.object');
goog.require('webdriver.EventEmitter');


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
 * @export
 */
webdriver.promise.Promise = function() {
};


/**
 * Registers listeners for when this instance is resolved. This function most
 * overridden by subtypes.
 *
 * @param {?function(*)} callback The function to call if this promise is
 *     successfully resolved. The function should expect a single argument: the
 *     promise's resolved value.
 * @param {?function(*)=} opt_errback The function to call if this promise is
 *     rejected. The function should expect a single argument: the failure
 *     reason. While this argument is typically an {@code Error}, any type is
 *     permissible.
 * @return {!webdriver.promise.Promise} A new promise which will be resolved
 *     with the result of the invoked callback.
 * @export
 */
webdriver.promise.Promise.prototype.then = function(callback, opt_errback) {
  throw new TypeError('Unimplemented function: "then"');
};


/**
 * Registers a function to be invoked when this promise is successfully
 * resolved. This function is provided for backwards compatibility with the
 * Dojo Deferred API.
 *
 * @param {?function(*)} callback The function to call if this promise is
 *     successfully resolved. The function should expect a single argument: the
 *     promise's resolved value.
 * @param {!Object=} opt_self The object which |this| should refer to when the
 *     function is invoked.
 * @return {!webdriver.promise.Promise} A new promise which will be resolved
 *     with the result of the invoked callback.
 * @export
 */
webdriver.promise.Promise.prototype.addCallback = function(callback, opt_self) {
  return this.then(goog.bind(callback, opt_self));
};


/**
 * Registers a function to be invoked when this promise is rejected.
 * This function is provided for backwards compatibility with the
 * Dojo Deferred API.
 *
 * @param {?function(*)} errback The function to call if this promise is
 *     rejected. The function should expect a single argument: the failure
 *     reason. While this argument is typically an {@code Error}, any type is
 *     permissible.
 * @param {!Object=} opt_self The object which |this| should refer to when the
 *     function is invoked.
 * @return {!webdriver.promise.Promise} A new promise which will be resolved
 *     with the result of the invoked callback.
 * @export
 */
webdriver.promise.Promise.prototype.addErrback = function(errback, opt_self) {
  return this.then(null, goog.bind(errback, opt_self));
};


/**
 * Registers a function to be invoked when this promise is either rejected or
 * resolved. This function is provided for backwards compatibility with the
 * Dojo Deferred API.
 *
 * @param {?function(*)} callback The function to call when this promise is
 *     either resolved or rejected. The function should expect a single
 *     argument: the resolved value or rejection error.
 * @param {!Object=} opt_self The object which |this| should refer to when the
 *     function is invoked.
 * @return {!webdriver.promise.Promise} A new promise which will be resolved
 *     with the result of the invoked callback.
 * @export
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
 * @param {?function(*)} callback The function to call if this promise is
 *     successfully resolved. The function should expect a single argument: the
 *     promise's resolved value.
 * @param {?function(*)} errback The function to call if this promise is
 *     rejected. The function should expect a single argument: the failure
 *     reason. While this argument is typically an {@code Error}, any type is
 *     permissible.
 * @param {!Object=} opt_self The object which |this| should refer to when the
 *     function is invoked.
 * @return {!webdriver.promise.Promise} A new promise which will be resolved
 *     with the result of the invoked callback.
 * @export
 */
webdriver.promise.Promise.prototype.addCallbacks = function(callback, errback,
                                                            opt_self) {
  return this.then(goog.bind(callback, opt_self),
      goog.bind(errback,  opt_self));
};


/**
 * Represents a value that will be resolved at some point in the future. This
 * class represents the protected "producer" half of a Promise - each Deferred
 * has a {@code promise} property that may be returned to consumers for
 * registering callbacks, reserving the ability to resolve the deferred to the
 * producer.
 *
 * If this Defererd is rejected and there are no listeners registered before the
 * next turn of the event loop, the rejection will be passed to the
 * {@code webdriver.promise.Application} as an unhandled failure.
 *
 * @constructor
 * @extends {webdriver.promise.Promise}
 * @export
 */
webdriver.promise.Deferred = function() {
  /* NOTE: This class's implementation diverges from the prototypical style
   * used in the rest of the atoms library. This was done intentionally to
   * protect the internal Deferred state from consumers, as outlined by
   *     http://wiki.commonjs.org/wiki/Promises
   */
  webdriver.promise.Promise.call(this);

  /**
   * The listeners registered with this Deferred. Each element in the list will
   * be a 3-tuple of the callback function, errback function, and the
   * corresponding deferred object.
   * @type {!Array.<!webdriver.promise.Deferred.Listener>}
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
   * @type {!webdriver.promise.Deferred.State}
   */
  var state = webdriver.promise.Deferred.State.PENDING;

  /**
   * This Deferred's resolved value; set when the state transitions from
   * {@code webdriver.promise.Deferred.State.PENDING}.
   * @type {*}
   */
  var value;

  /**
   * Notifies all of the listeners registered with this Deferred that its state
   * has changed. Will throw an error if this Deferred has already been
   * resolved.
   * @param {!webdriver.promise.Deferred.State} newState The deferred's new
   *     state.
   * @param {*} newValue The deferred's new value.
   */
  function notifyAll(newState, newValue) {
    if (state != webdriver.promise.Deferred.State.PENDING) {
      throw new Error('This Deferred has already been resolved.');
    }

    state = newState;
    value = newValue;
    while (listeners.length) {
      notify(listeners.shift());
    }

    if (!handled && state == webdriver.promise.Deferred.State.REJECTED) {
      setTimeout(function() {
        if (!handled) {
          webdriver.promise.Application.getInstance().abortCurrentFrame_(value);
        }
      }, 0);
    }
  }

  /**
   * Notifies a single listener of this Deferred's change in state.
   * @param {!webdriver.promise.Deferred.Listener} listener The listener to
   *     notify.
   */
  function notify(listener) {
    var func = state == webdriver.promise.Deferred.State.RESOLVED ?
        listener.callback : listener.errback;
    if (func) {
      var app = webdriver.promise.Application.getInstance();
      var result = app.executeAsap_(goog.partial(func, value));
      webdriver.promise.asap(result,
          listener.deferred.resolve,
          listener.deferred.reject);
    } else if (state == webdriver.promise.Deferred.State.REJECTED) {
      listener.deferred.reject(value);
    } else {
      listener.deferred.resolve(value);
    }
  }

  /** @override */
  this.then = function(callback, opt_errback) {
    // The moment a listener is registered, we consider this deferred to be
    // handled; the callback must handle any rejection errors.
    handled = true;

    var listener = {
      callback: callback,
      errback: opt_errback,
      deferred: new webdriver.promise.Deferred()
    };

    if (state == webdriver.promise.Deferred.State.PENDING) {
      listeners.push(listener);
    } else {
      notify(listener);
    }

    return listener.deferred.promise;
  };

  /**
   * The consumer promise for this instance. Provides protected access to the
   * callback registering functions.
   * @type {!webdriver.promise.Promise}
   */
  var promise = new webdriver.promise.Promise();
  promise.then = this.then;

  var self = this;

  /**
   * Resolves this promise with the given value. If the value is itself a
   * promise and not a reference to this deferred, this instance will wait for
   * it before resolving.
   * @param {*} value The resolved value.
   */
  function resolve(value) {
    if (webdriver.promise.isPromise(value) && value !== self) {
      if (value instanceof webdriver.promise.Deferred) {
        value.then(
            goog.partial(notifyAll, webdriver.promise.Deferred.State.RESOLVED),
            goog.partial(notifyAll, webdriver.promise.Deferred.State.REJECTED));
        return;
      }
      webdriver.promise.when(value, resolve, reject);
    } else {
      notifyAll(webdriver.promise.Deferred.State.RESOLVED, value);
    }
  }

  /**
   * Rejects this promise. If the error is itself a promise, this instance will
   * be chained to it and be rejected with the error's resolved value.
   * @param {*} error The rejection reason, typically either a {@code Error} or
   *     a {@code string}.
   */
  function reject(error) {
    if (webdriver.promise.isPromise(error) && value !== self) {
      if (value instanceof webdriver.promise.Deferred) {
        value.then(
            goog.partial(notifyAll, webdriver.promise.Deferred.State.REJECTED),
            goog.partial(notifyAll, webdriver.promise.Deferred.State.REJECTED));
        return;
      }
      webdriver.promise.when(error, reject, reject);
    } else {
      notifyAll(webdriver.promise.Deferred.State.REJECTED, error);
    }
  }

  // Export our public API.
  this.promise = promise;
  this.promise.then = this.then;
  this.resolve = this.callback = resolve;
  this.reject = this.errback = reject;
};
goog.inherits(webdriver.promise.Deferred, webdriver.promise.Promise);


/**
 * Type definition for a listener registered on a Deferred object.
 * @typedef {{callback:?function(*),
 *            errback:?function(*),
 *            deferred:!webdriver.promise.Deferred}}
 */
webdriver.promise.Deferred.Listener;


/**
 * The three states a {@code webdriver.promise.Deferred} object may be in.
 * @enum {number}
 * @private
 */
webdriver.promise.Deferred.State = {
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
 * @export
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
 * @export
 */
webdriver.promise.delayed = function(ms) {
  var deferred = new webdriver.promise.Deferred();
  setTimeout(deferred.resolve, ms);
  return deferred.promise;
};


/**
 * Creates a promise that has been resolved with the given value.
 * @param {*=} opt_value The resolved value.
 * @return {!webdriver.promise.Promise} The resolved promise.
 * @export
 */
webdriver.promise.resolved = function(opt_value) {
  var deferred = new webdriver.promise.Deferred();
  deferred.resolve(opt_value);
  return deferred.promise;
};


/**
 * Creates a promise that has been rejected with the given reason.
 * @param {*} reason The rejection reason; may be any value, but is usually an
 *     Error or a string.
 * @return {!webdriver.promise.Promise} The rejected promise.
 * @export
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
 * @export
 */
webdriver.promise.checkedNodeCall = function(fn) {
  var deferred = new webdriver.promise.Deferred();
  var resolved = false;
  try {
    fn(function(error, value) {
      if (!resolved) {
        resolved = true;
        error ? deferred.reject(error) : deferred.resolve(value);
      }
    });
  } catch (ex) {
    if (!resolved) {
      resolved = true;
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
 * @param {?function(*)=} opt_callback The function to call when the value is
 *     resolved successfully.
 * @param {?function(*)=} opt_errback The function to call when the value is
 *     rejected.
 * @return {!webdriver.promise.Promise} A new promise.
 * @export
 */
webdriver.promise.when = function(value, opt_callback, opt_errback) {
  if (value instanceof webdriver.promise.Promise) {
    return value.then(opt_callback, opt_errback);
  }

  var deferred = new webdriver.promise.Deferred();
  webdriver.promise.asap(value, deferred.resolve, deferred.reject);
  return deferred.then(opt_callback, opt_errback);
};


/**
 * Invokes the appropriate callback function as soon as a promised
 * {@code value} is resolved. This function is similar to
 * {@code webdriver.promise.when}, except it does not return a new promise.
 * @param {*} value The value to observe.
 * @param {?function(*)} callback The function to call when the value is
 *     resolved successfully.
 * @param {?function(*)=} opt_errback The function to call when the value is
 *     rejected.
 * @export
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
 * @export
 */
webdriver.promise.fullyResolved = function(value) {
  if (webdriver.promise.isPromise(value)) {
    return webdriver.promise.when(value, resolveValue);
  }
  return resolveValue(value);

  function resolveValue(value) {
    switch (goog.typeOf(value)) {
      case 'array':
        // In IE, goog.array.forEach will not iterate properly over arrays
        // containing undefined values because "index in array" returns
        // false when array[index] === undefined. To get around this, we need
        // to use our own forEach implementation.  Yay, IE.
        return resolveKeys(value, value.length, function(arr, f, opt_obj) {
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
          return value;
        }

        if (goog.isNumber(value.nodeType)) {
          // DOM node; return early to avoid infinite recursion. Should we
          // only support objects with a certain level of nesting?
          return webdriver.promise.resolved(value);
        }

        return resolveKeys(value, goog.object.getKeys(value).length,
            goog.object.forEach);

      default:  // boolean, function, null, number, string, undefined
        return webdriver.promise.resolved(value);
    }
  }

  function resolveKeys(obj, numKeys, forEachKey) {
    if (!numKeys) {
      return webdriver.promise.resolved(obj);
    }

    var numResolved = 0;
    var rejected = false;
    var deferred = new webdriver.promise.Deferred();

    forEachKey(obj, function(partialValue, key) {
      var type = goog.typeOf(partialValue);
      if (type != 'array' && type != 'object') {
        return maybeResolveValue();
      }

      webdriver.promise.fullyResolved(partialValue).then(
          function(resolvedValue) {
            obj[key] = resolvedValue;
            maybeResolveValue();
          },
          function(err) {
            if (!rejected) {
              rejected = true;
              deferred.reject(err);
            }
          });

      function maybeResolveValue() {
        if (++numResolved == numKeys) {
          deferred.resolve(obj);
        }
      }
    });

    return deferred.promise;
  }
};

//////////////////////////////////////////////////////////////////////////////
//
//  webdriver.promise.Application
//
//////////////////////////////////////////////////////////////////////////////


/**
 * Handles the execution of scheduled tasks, each of which may be an
 * asynchronous operation. The application will ensure tasks are executed in the
 * ordered scheduled, starting each tasks only once those before it have
 * completed.
 *
 * <p>Each task scheduled with the application may return a
 * {@link webdriver.promise.Promise} to indicate it is an asynchronous
 * operation. The Application will wait for such promises to be resolved before
 * marking the task as completed.
 *
 * <p>Tasks and each callback registered on a {@link webdriver.promise.Deferred}
 * will be run in their own Application frame.  Any tasks scheduled within a
 * frame will take precedence over previously scheduled tasks. Furthermore, if
 * any of the tasks in the frame fails, the remainder of the tasks in that frame
 * will be discarded and the failure will be propagated to user through the
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
 * @export
 */
webdriver.promise.Application = function() {
  webdriver.EventEmitter.call(this);

  /**
   * Frame stack for this application. Upon each turn of the event loop, the
   * task to execute will be pulled from the queue of the topmost frame.
   * @type {!Array.<!webdriver.promise.Application.Frame_>}
   * @private
   */
  this.frames_ = [];

  /**
   * A history of commands executed by this Application.
   * @type {!Array.<string>}
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
 * Resets this instance, clearing its queue and removing all event listeners.
 */
webdriver.promise.Application.prototype.reset = function() {
  this.frames_ = [];
  this.clearHistory();
  this.removeAllListeners();
  this.cancelShutdown_();
  this.cancelEventLoop_();
};


/**
 * Returns this instance's current task history, with each task listed on a
 * separate line.
 * @return {string} The task history.
 */
webdriver.promise.Application.prototype.getHistory = function() {
  return this.history_.join('\n');
};


/** Clears this instance's task history. */
webdriver.promise.Application.prototype.clearHistory = function() {
  this.history_ = [];
};


webdriver.promise.Application.prototype.getSchedule = function() {
  var schedule = [];
  goog.array.forEach(this.frames_, function(frame) {
    schedule.push([
      '[',
      goog.array.map(frame.queue, function(task) {
        return task.description;
      }).join(', '),
      ']'].join(''));
  });
  return schedule.join('');
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
 * @export
 */
webdriver.promise.Application.prototype.schedule = function(description, fn) {
  this.cancelShutdown_();

  var currentFrame = goog.array.peek(this.frames_);
  if (!currentFrame) {
    currentFrame = new webdriver.promise.Application.Frame_();
    currentFrame.then(goog.bind(this.commenceShutdown_, this),
                      goog.bind(this.abortNow_, this));
    this.frames_.push(currentFrame);
  }

  var task = new webdriver.promise.Application.Task_(fn, description);
  currentFrame.queue.push(task);

  this.emit(webdriver.promise.Application.EventType.SCHEDULE_TASK);

  this.scheduleEventLoopStart_();
  return task.promise;
};


/**
 * Schedules a task for execution.  Unlike {@code #schedule()}, which returns
 * a promise tied to the scheduled task, this function will return a promise
 * that will be resolved once this application has gone idle. The returned
 * promise will be rejected if the application aborts due to an uncaught
 * exception.
 *
 * Note: there may only ever be one (1) task scheduled to wait for idle with an
 * application at any time. This constraint is required to drastically reduce
 * implementation complexity.
 *
 * @param {string} description A description of the task.
 * @param {!Function} fn The function to call to start the task.
 * @return {!webdriver.promise.Promise} A promise that will be resolved when the
 *     application is idle for one turn of the event loop, or rejected if the
 *     application aborts with an uncaught exception.
 * @export
 */
webdriver.promise.Application.prototype.scheduleAndWaitForIdle =
    function(description, fn) {
  if (this.waitingForIdle_) {
    throw new Error('Whoops! It looks like another task is already waiting ' +
                    'this application to go idle: ' + this.waitingForIdle_);
  }
  this.waitingForIdle_ = description;

  var deferred = new webdriver.promise.Deferred();
  var self = this;
  var idleTimeoutId;

  self.schedule(description, fn);
  self.once(webdriver.promise.Application.EventType.IDLE, onIdle);
  self.once(webdriver.promise.Application.EventType.UNCAUGHT_EXCEPTION,
      onError);

  return deferred.promise;

  function onIdle() {
    // A task may be scheduled later in this event loop after the app has gone
    // idle. Delay resolving the promise for one turn of the event loop.
    idleTimeoutId = setTimeout(function() {
      self.removeListener(
          webdriver.promise.Application.EventType.SCHEDULE_TASK, onScheduled);
      self.removeListener(
          webdriver.promise.Application.EventType.UNCAUGHT_EXCEPTION, onError);
      self.waitingForIdle_ = null;
      deferred.resolve();
    }, 0);
    self.once(
        webdriver.promise.Application.EventType.SCHEDULE_TASK, onScheduled);
  }

  function onScheduled() {
    clearTimeout(idleTimeoutId);
    // It is safe to re-apply the onIdle listener here because onScheduled is
    // only ever attached by onIdle. Only one of the listeners will ever be
    // active.
    self.once(webdriver.promise.Application.EventType.IDLE, onIdle);
  }

  function onError(e) {
    clearTimeout(idleTimeoutId);
    self.removeListener(webdriver.promise.Application.EventType.IDLE, onIdle);
    self.removeListener(webdriver.promise.Application.EventType.SCHEDULE_TASK,
        onScheduled);

    // Delay rejecting the deferred until the next turn of the event loop. This
    // is required because if the deferred has a callback that does another
    // scheduleAndWaitForIdle(), that new task will be caught in this turn of
    // UNCAUGHT_EXCEPTION events and will immediately fail. This is not a
    // problem for resolving the deferred onIdle because we always wait one
    // extra turn of the event loop anyway to catch new tasks being scheduled.
    setTimeout(function() {
      self.waitingForIdle_ = null;
      deferred.reject(e);
    }, 0);
  }
};


/**
 * Inserts a {@code setTimeout} into the command queue. This is equivalent to
 * a thread sleep in a synchronous programming language.
 *
 * @param {string} description A description to accompany the timeout.
 * @param {number} ms The timeout delay, in milliseconds.
 * @return {!webdriver.promise.Promise} A promise that will be resolved with
 *     the result of the action.
 * @export
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
 * @param {boolean=} opt_waitNot Whether to wait for the inverse of the
 *     provided condition; defaults to {@code false}.
 * @return {!webdriver.promise.Promise} A promise that will be resolved when the
 *     condition has been satisified. The promise shall be rejected if the wait
 *     times out waiting for the condition.
 * @export
 */
webdriver.promise.Application.prototype.scheduleWait = function(description,
                                                                condition,
                                                                timeout,
                                                                opt_message,
                                                                opt_waitNot) {
  var sleep = Math.min(timeout, 100);
  var waitOnInverse = !!opt_waitNot;
  var self = this;

  return this.schedule(description, function() {
    var startTime = goog.now();
    var waitResult = new webdriver.promise.Deferred();
    var waitFrame = goog.array.peek(self.frames_);
    waitFrame.isWaiting = true;
    pollCondition();
    return waitResult.promise;

    function pollCondition() {
      var result = self.executeAsap_(condition);
      return webdriver.promise.when(result, function(value) {
        var ellapsed = goog.now() - startTime;
        if (waitOnInverse != !!value) {
          waitFrame.isWaiting = false;
          waitResult.resolve();
        } else if (ellapsed >= timeout) {
          waitResult.reject(new Error((opt_message ? opt_message + '\n' : '') +
              'Wait timed out after ' + ellapsed + 'ms'));
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
  // If the app aborts due to an unhandled exception after we've scheduled
  // another turn of the execution loop, we can end up in here with no tasks
  // left. This is OK, just quietly return.
  var currentFrame = goog.array.peek(this.frames_);
  if (currentFrame.pendingTask) {
    return;
  }

  var task = currentFrame.queue.shift();
  if (!task) {
    if (currentFrame.isWaiting) {
      currentFrame.isActive = false;
      return;
    }
    this.frames_.pop();
    currentFrame.resolve();
    return;
  }

  this.history_.push(task.description);

  currentFrame.isActive = true;
  currentFrame.pendingTask = task;
  var result = this.executeAsap_(task.execute);
  webdriver.promise.asap(result, function(result) {
    currentFrame.pendingTask = null;
    task.resolve(result);
  }, function(error) {
    currentFrame.pendingTask = null;
    task.reject(error);
  });
};


/**
 * Executes a function as soon as possible.
 *
 * Ensures that any tasks scheduled with this application by the function are
 * given precedence over those currently scheduled. This function is guaranteed
 * to return a rejected promise instead of ever throwing.
 *
 * @param {!Function} fn The function to execute.
 * @return {*} The function's return value, or a promise that will be resolved
 *     once all tasks scheduled by the function have completed.
 */
webdriver.promise.Application.prototype.executeAsap_ = function(fn) {
  // If this application is idle (no frames), or the current frame is inactive,
  // it is safe to execute the function immediately.
  var currentFrame = goog.array.peek(this.frames_);
  if (!currentFrame || !currentFrame.isActive) {
    try {
      return fn();
    } catch (ex) {
      return webdriver.promise.rejected(ex);
    }
  } else {
    var frame = new webdriver.promise.Application.Frame_();
    this.frames_.push(frame);
    try {
      var result = fn();
      if (!frame.queue.length) {
        this.frames_.pop();
        return result;
      } else {
        return frame.then(function() {
          return result;
        });
      }
    } catch (ex) {
      this.frames_.pop();
      return webdriver.promise.rejected(ex);
    }
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
  this.frames_ = [];
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
 * Aborts the current frame. The frame will be removed from the stack and its
 * promised result will be rejected. These errors will bubble up the stack
 * until handled by a task's errback, or the application is aborted.
 * @param {*} error The reason the frame is being aborted; typically either
 *     an Error or string.
 * @private
 */
webdriver.promise.Application.prototype.abortCurrentFrame_ = function(error) {
  var frame = this.frames_.pop();
  if (frame) {
    try {
      frame.reject(error);
    } catch (ex) {
      throw ex;
    }
  } else {
    this.abortNow_(error);
  }
};


/**
 * Maintains a queue of scheduled {@code webdriver.promise.Application.Tasks_}
 * for a single execution frame in a {@code webdriver.promise.Application}.
 * @constructor
 * @extends {webdriver.promise.Deferred}
 * @private
 */
webdriver.promise.Application.Frame_ = function() {
  webdriver.promise.Deferred.call(this);

  /**
   * This frame's task queue.
   * @type {!Array.<!webdriver.promise.Application.Task_>}
   */
  this.queue = [];
};
goog.inherits(webdriver.promise.Application.Frame_, webdriver.promise.Deferred);


/**
 * The task currently being executed within this frame.
 * @type {!webdriver.promise.Application.Task_}
 */
webdriver.promise.Application.Frame_.prototype.pendingTask = null;


/**
 * Whethr this frame is currently blocked on a waiting task. Each time a
 * frame blocked on waiting empties its queue, it will be marked as inactive,
 * but left on the stack for future polling attempts for the wait condition.
 * @type {boolean}
 */
webdriver.promise.Application.Frame_.prototype.isWaiting = false;


/**
 * Whether this frame is active. A frame is considered active as soon as one of
 * its tasks has been executed.
 * @type {boolean}
 */
webdriver.promise.Application.Frame_.prototype.isActive = false;


/**
 * A task to be executed by a {@code webdriver.promise.Application}.
 *
 * @param {!Function} fn The function to call when the task executes. If it
 *     returns a {@code webdriver.promise.Promise}, the application will wait
 *     for it to be resolved before starting the next task.
 * @param {string=} opt_description A description of the task for debugging.
 * @constructor
 * @extends {webdriver.promise.Deferred}
 * @private
 */
webdriver.promise.Application.Task_ = function(fn, opt_description) {
  webdriver.promise.Deferred.call(this);

  /**
   * Executes this task.
   * @return {*} The function result.
   */
  this.execute = fn;

  /**
   * The description of this task.
   * @type {string}
   */
  this.description = opt_description || '(anonymous task)';
};
goog.inherits(webdriver.promise.Application.Task_, webdriver.promise.Deferred);
