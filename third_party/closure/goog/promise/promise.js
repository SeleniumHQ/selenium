// Copyright 2013 The Closure Library Authors. All Rights Reserved.
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

goog.provide('goog.Promise');

goog.require('goog.Thenable');
goog.require('goog.asserts');
goog.require('goog.async.FreeList');
goog.require('goog.async.run');
goog.require('goog.async.throwException');
goog.require('goog.debug.Error');
goog.require('goog.promise.Resolver');



/**
 * Promises provide a result that may be resolved asynchronously. A Promise may
 * be resolved by being fulfilled with a fulfillment value, rejected with a
 * rejection reason, or blocked by another Promise. A Promise is said to be
 * settled if it is either fulfilled or rejected. Once settled, the Promise
 * result is immutable.
 *
 * Promises may represent results of any type, including undefined. Rejection
 * reasons are typically Errors, but may also be of any type. Closure Promises
 * allow for optional type annotations that enforce that fulfillment values are
 * of the appropriate types at compile time.
 *
 * The result of a Promise is accessible by calling {@code then} and registering
 * {@code onFulfilled} and {@code onRejected} callbacks. Once the Promise
 * is settled, the relevant callbacks are invoked with the fulfillment value or
 * rejection reason as argument. Callbacks are always invoked in the order they
 * were registered, even when additional {@code then} calls are made from inside
 * another callback. A callback is always run asynchronously sometime after the
 * scope containing the registering {@code then} invocation has returned.
 *
 * If a Promise is resolved with another Promise, the first Promise will block
 * until the second is settled, and then assumes the same result as the second
 * Promise. This allows Promises to depend on the results of other Promises,
 * linking together multiple asynchronous operations.
 *
 * This implementation is compatible with the Promises/A+ specification and
 * passes that specification's conformance test suite. A Closure Promise may be
 * resolved with a Promise instance (or sufficiently compatible Promise-like
 * object) created by other Promise implementations. From the specification,
 * Promise-like objects are known as "Thenables".
 *
 * @see http://promisesaplus.com/
 *
 * @param {function(
 *             this:RESOLVER_CONTEXT,
 *             function((TYPE|IThenable<TYPE>|Thenable)=),
 *             function(*=)): void} resolver
 *     Initialization function that is invoked immediately with {@code resolve}
 *     and {@code reject} functions as arguments. The Promise is resolved or
 *     rejected with the first argument passed to either function.
 * @param {RESOLVER_CONTEXT=} opt_context An optional context for executing the
 *     resolver function. If unspecified, the resolver function will be executed
 *     in the default scope.
 * @constructor
 * @struct
 * @final
 * @implements {goog.Thenable<TYPE>}
 * @template TYPE,RESOLVER_CONTEXT
 */
goog.Promise = function(resolver, opt_context) {
  /**
   * The internal state of this Promise. Either PENDING, FULFILLED, REJECTED, or
   * BLOCKED.
   * @private {goog.Promise.State_}
   */
  this.state_ = goog.Promise.State_.PENDING;

  /**
   * The settled result of the Promise. Immutable once set with either a
   * fulfillment value or rejection reason.
   * @private {*}
   */
  this.result_ = undefined;

  /**
   * For Promises created by calling {@code then()}, the originating parent.
   * @private {goog.Promise}
   */
  this.parent_ = null;

  /**
   * The linked list of {@code onFulfilled} and {@code onRejected} callbacks
   * added to this Promise by calls to {@code then()}.
   * @private {?goog.Promise.CallbackEntry_}
   */
  this.callbackEntries_ = null;

  /**
   * The tail of the linked list of {@code onFulfilled} and {@code onRejected}
   * callbacks added to this Promise by calls to {@code then()}.
   * @private {?goog.Promise.CallbackEntry_}
   */
  this.callbackEntriesTail_ = null;

  /**
   * Whether the Promise is in the queue of Promises to execute.
   * @private {boolean}
   */
  this.executing_ = false;

  if (goog.Promise.UNHANDLED_REJECTION_DELAY > 0) {
    /**
     * A timeout ID used when the {@code UNHANDLED_REJECTION_DELAY} is greater
     * than 0 milliseconds. The ID is set when the Promise is rejected, and
     * cleared only if an {@code onRejected} callback is invoked for the
     * Promise (or one of its descendants) before the delay is exceeded.
     *
     * If the rejection is not handled before the timeout completes, the
     * rejection reason is passed to the unhandled rejection handler.
     * @private {number}
     */
    this.unhandledRejectionId_ = 0;
  } else if (goog.Promise.UNHANDLED_REJECTION_DELAY == 0) {
    /**
     * When the {@code UNHANDLED_REJECTION_DELAY} is set to 0 milliseconds, a
     * boolean that is set if the Promise is rejected, and reset to false if an
     * {@code onRejected} callback is invoked for the Promise (or one of its
     * descendants). If the rejection is not handled before the next timestep,
     * the rejection reason is passed to the unhandled rejection handler.
     * @private {boolean}
     */
    this.hadUnhandledRejection_ = false;
  }

  if (goog.Promise.LONG_STACK_TRACES) {
    /**
     * A list of stack trace frames pointing to the locations where this Promise
     * was created or had callbacks added to it. Saved to add additional context
     * to stack traces when an exception is thrown.
     * @private {!Array<string>}
     */
    this.stack_ = [];
    this.addStackTrace_(new Error('created'));

    /**
     * Index of the most recently executed stack frame entry.
     * @private {number}
     */
    this.currentStep_ = 0;
  }

  if (resolver == goog.Promise.RESOLVE_FAST_PATH_) {
    // If the special sentinel resolver value is passed (from
    // goog.Promise.resolve) we short cut to immediately resolve the promise
    // using the value passed as opt_context. Don't try this at home.
    this.resolve_(goog.Promise.State_.FULFILLED, opt_context);
  } else {
    try {
      var self = this;
      resolver.call(
          opt_context,
          function(value) {
            self.resolve_(goog.Promise.State_.FULFILLED, value);
          },
          function(reason) {
            if (goog.DEBUG &&
                !(reason instanceof goog.Promise.CancellationError)) {
              try {
                // Promise was rejected. Step up one call frame to see why.
                if (reason instanceof Error) {
                  throw reason;
                } else {
                  throw new Error('Promise rejected.');
                }
              } catch (e) {
                // Only thrown so browser dev tools can catch rejections of
                // promises when the option to break on caught exceptions is
                // activated.
              }
            }
            self.resolve_(goog.Promise.State_.REJECTED, reason);
          });
    } catch (e) {
      this.resolve_(goog.Promise.State_.REJECTED, e);
    }
  }
};


/**
 * @define {boolean} Whether traces of {@code then} calls should be included in
 * exceptions thrown
 */
goog.define('goog.Promise.LONG_STACK_TRACES', false);


/**
 * @define {number} The delay in milliseconds before a rejected Promise's reason
 * is passed to the rejection handler. By default, the rejection handler
 * rethrows the rejection reason so that it appears in the developer console or
 * {@code window.onerror} handler.
 *
 * Rejections are rethrown as quickly as possible by default. A negative value
 * disables rejection handling entirely.
 */
goog.define('goog.Promise.UNHANDLED_REJECTION_DELAY', 0);


/**
 * The possible internal states for a Promise. These states are not directly
 * observable to external callers.
 * @enum {number}
 * @private
 */
goog.Promise.State_ = {
  /** The Promise is waiting for resolution. */
  PENDING: 0,

  /** The Promise is blocked waiting for the result of another Thenable. */
  BLOCKED: 1,

  /** The Promise has been resolved with a fulfillment value. */
  FULFILLED: 2,

  /** The Promise has been resolved with a rejection reason. */
  REJECTED: 3
};



/**
 * Entries in the callback chain. Each call to {@code then},
 * {@code thenCatch}, or {@code thenAlways} creates an entry containing the
 * functions that may be invoked once the Promise is settled.
 *
 * @private @final @struct @constructor
 */
goog.Promise.CallbackEntry_ = function() {
  /** @type {?goog.Promise} */
  this.child = null;
  /** @type {Function} */
  this.onFulfilled = null;
  /** @type {Function} */
  this.onRejected = null;
  /** @type {?} */
  this.context = null;
  /** @type {?goog.Promise.CallbackEntry_} */
  this.next = null;

  /**
   * A boolean value to indicate this is a "thenAlways" callback entry.
   * Unlike a normal "then/thenVoid" a "thenAlways doesn't participate
   * in "cancel" considerations but is simply an observer and requires
   * special handling.
   * @type {boolean}
   */
  this.always = false;
};


/** clear the object prior to reuse */
goog.Promise.CallbackEntry_.prototype.reset = function() {
  this.child = null;
  this.onFulfilled = null;
  this.onRejected = null;
  this.context = null;
  this.always = false;
};


/**
 * @define {number} The number of currently unused objects to keep around for
 *    reuse.
 */
goog.define('goog.Promise.DEFAULT_MAX_UNUSED', 100);


/** @const @private {goog.async.FreeList<!goog.Promise.CallbackEntry_>} */
goog.Promise.freelist_ = new goog.async.FreeList(
    function() {
      return new goog.Promise.CallbackEntry_();
    },
    function(item) {
      item.reset();
    },
    goog.Promise.DEFAULT_MAX_UNUSED);


/**
 * @param {Function} onFulfilled
 * @param {Function} onRejected
 * @param {?} context
 * @return {!goog.Promise.CallbackEntry_}
 * @private
 */
goog.Promise.getCallbackEntry_ = function(onFulfilled, onRejected, context) {
  var entry = goog.Promise.freelist_.get();
  entry.onFulfilled = onFulfilled;
  entry.onRejected = onRejected;
  entry.context = context;
  return entry;
};


/**
 * @param {!goog.Promise.CallbackEntry_} entry
 * @private
 */
goog.Promise.returnEntry_ = function(entry) {
  goog.Promise.freelist_.put(entry);
};


/**
 * If this passed as the first argument to the {@link goog.Promise} constructor
 * the the opt_context is (against its primary use) used to immediately resolve
 * the promise. This is used from  {@link goog.Promise.resolve} as an
 * optimization to avoid allocating 3 closures that are never really needed.
 * @private @const {!Function}
 */
goog.Promise.RESOLVE_FAST_PATH_ = function() {};


/**
 * @param {(TYPE|goog.Thenable<TYPE>|Thenable)=} opt_value
 * @return {!goog.Promise<TYPE>} A new Promise that is immediately resolved
 *     with the given value. If the input value is already a goog.Promise, it
 *     will be returned immediately without creating a new instance.
 * @template TYPE
 */
goog.Promise.resolve = function(opt_value) {
  if (opt_value instanceof goog.Promise) {
    // Avoid creating a new object if we already have a promise object
    // of the correct type.
    return opt_value;
  }

  // Passes the value as the context, which is a special fast pass when
  // goog.Promise.RESOLVE_FAST_PATH_ is passed as the first argument.
  return new goog.Promise(goog.Promise.RESOLVE_FAST_PATH_, opt_value);
};


/**
 * @param {*=} opt_reason
 * @return {!goog.Promise} A new Promise that is immediately rejected with the
 *     given reason.
 */
goog.Promise.reject = function(opt_reason) {
  return new goog.Promise(function(resolve, reject) {
    reject(opt_reason);
  });
};


/**
 * @param {!Array<!(goog.Thenable<TYPE>|Thenable)>} promises
 * @return {!goog.Promise<TYPE>} A Promise that receives the result of the
 *     first Promise (or Promise-like) input to settle immediately after it
 *     settles.
 * @template TYPE
 */
goog.Promise.race = function(promises) {
  return new goog.Promise(function(resolve, reject) {
    if (!promises.length) {
      resolve(undefined);
    }
    for (var i = 0, promise; promise = promises[i]; i++) {
      goog.Promise.maybeThenVoid_(promise, resolve, reject);
    }
  });
};


/**
 * @param {!Array<!(goog.Thenable<TYPE>|Thenable)>} promises
 * @return {!goog.Promise<!Array<TYPE>>} A Promise that receives a list of
 *     every fulfilled value once every input Promise (or Promise-like) is
 *     successfully fulfilled, or is rejected with the first rejection reason
 *     immediately after it is rejected.
 * @template TYPE
 */
goog.Promise.all = function(promises) {
  return new goog.Promise(function(resolve, reject) {
    var toFulfill = promises.length;
    var values = [];

    if (!toFulfill) {
      resolve(values);
      return;
    }

    var onFulfill = function(index, value) {
      toFulfill--;
      values[index] = value;
      if (toFulfill == 0) {
        resolve(values);
      }
    };

    var onReject = function(reason) {
      reject(reason);
    };

    for (var i = 0, promise; promise = promises[i]; i++) {
      goog.Promise.maybeThenVoid_(
          promise, goog.partial(onFulfill, i), onReject);
    }
  });
};


/**
 * @param {!Array<!(goog.Thenable<TYPE>|Thenable)>} promises
 * @return {!goog.Promise<!Array<{
 *     fulfilled: boolean,
 *     value: (TYPE|undefined),
 *     reason: (*|undefined)}>>} A Promise that resolves with a list of
 *         result objects once all input Promises (or Promise-like) have
 *         settled. Each result object contains a 'fulfilled' boolean indicating
 *         whether an input Promise was fulfilled or rejected. For fulfilled
 *         Promises, the resulting value is stored in the 'value' field. For
 *         rejected Promises, the rejection reason is stored in the 'reason'
 *         field.
 * @template TYPE
 */
goog.Promise.allSettled = function(promises) {
  return new goog.Promise(function(resolve, reject) {
    var toSettle = promises.length;
    var results = [];

    if (!toSettle) {
      resolve(results);
      return;
    }

    var onSettled = function(index, fulfilled, result) {
      toSettle--;
      results[index] = fulfilled ?
          {fulfilled: true, value: result} :
          {fulfilled: false, reason: result};
      if (toSettle == 0) {
        resolve(results);
      }
    };

    for (var i = 0, promise; promise = promises[i]; i++) {
      goog.Promise.maybeThenVoid_(promise,
          goog.partial(onSettled, i, true /* fulfilled */),
          goog.partial(onSettled, i, false /* fulfilled */));
    }
  });
};


/**
 * @param {!Array<!(goog.Thenable<TYPE>|Thenable)>} promises
 * @return {!goog.Promise<TYPE>} A Promise that receives the value of the first
 *     input to be fulfilled, or is rejected with a list of every rejection
 *     reason if all inputs are rejected.
 * @template TYPE
 */
goog.Promise.firstFulfilled = function(promises) {
  return new goog.Promise(function(resolve, reject) {
    var toReject = promises.length;
    var reasons = [];

    if (!toReject) {
      resolve(undefined);
      return;
    }

    var onFulfill = function(value) {
      resolve(value);
    };

    var onReject = function(index, reason) {
      toReject--;
      reasons[index] = reason;
      if (toReject == 0) {
        reject(reasons);
      }
    };

    for (var i = 0, promise; promise = promises[i]; i++) {
      goog.Promise.maybeThenVoid_(
          promise, onFulfill, goog.partial(onReject, i));
    }
  });
};


/**
 * @return {!goog.promise.Resolver<TYPE>} Resolver wrapping the promise and its
 *     resolve / reject functions. Resolving or rejecting the resolver
 *     resolves or rejects the promise.
 * @template TYPE
 */
goog.Promise.withResolver = function() {
  var resolve, reject;
  var promise = new goog.Promise(function(rs, rj) {
    resolve = rs;
    reject = rj;
  });
  return new goog.Promise.Resolver_(promise, resolve, reject);
};


/**
 * Adds callbacks that will operate on the result of the Promise, returning a
 * new child Promise.
 *
 * If the Promise is fulfilled, the {@code onFulfilled} callback will be invoked
 * with the fulfillment value as argument, and the child Promise will be
 * fulfilled with the return value of the callback. If the callback throws an
 * exception, the child Promise will be rejected with the thrown value instead.
 *
 * If the Promise is rejected, the {@code onRejected} callback will be invoked
 * with the rejection reason as argument, and the child Promise will be resolved
 * with the return value or rejected with the thrown value of the callback.
 *
 * @override
 */
goog.Promise.prototype.then = function(
    opt_onFulfilled, opt_onRejected, opt_context) {

  if (opt_onFulfilled != null) {
    goog.asserts.assertFunction(opt_onFulfilled,
        'opt_onFulfilled should be a function.');
  }
  if (opt_onRejected != null) {
    goog.asserts.assertFunction(opt_onRejected,
        'opt_onRejected should be a function. Did you pass opt_context ' +
        'as the second argument instead of the third?');
  }

  if (goog.Promise.LONG_STACK_TRACES) {
    this.addStackTrace_(new Error('then'));
  }

  return this.addChildPromise_(
      goog.isFunction(opt_onFulfilled) ? opt_onFulfilled : null,
      goog.isFunction(opt_onRejected) ? opt_onRejected : null,
      opt_context);
};
goog.Thenable.addImplementation(goog.Promise);


/**
 * Adds callbacks that will operate on the result of the Promise without
 * returning a child Promise (unlike "then").
 *
 * If the Promise is fulfilled, the {@code onFulfilled} callback will be invoked
 * with the fulfillment value as argument.
 *
 * If the Promise is rejected, the {@code onRejected} callback will be invoked
 * with the rejection reason as argument.
 *
 * @param {?(function(this:THIS, TYPE):?)=} opt_onFulfilled A
 *     function that will be invoked with the fulfillment value if the Promise
 *     is fulfilled.
 * @param {?(function(this:THIS, *): *)=} opt_onRejected A function that will
 *     be invoked with the rejection reason if the Promise is rejected.
 * @param {THIS=} opt_context An optional context object that will be the
 *     execution context for the callbacks. By default, functions are executed
 *     with the default this.
 * @package
 * @template THIS
 */
goog.Promise.prototype.thenVoid = function(
    opt_onFulfilled, opt_onRejected, opt_context) {

  if (opt_onFulfilled != null) {
    goog.asserts.assertFunction(opt_onFulfilled,
        'opt_onFulfilled should be a function.');
  }
  if (opt_onRejected != null) {
    goog.asserts.assertFunction(opt_onRejected,
        'opt_onRejected should be a function. Did you pass opt_context ' +
        'as the second argument instead of the third?');
  }

  if (goog.Promise.LONG_STACK_TRACES) {
    this.addStackTrace_(new Error('then'));
  }

  // Note: no default rejection handler is provided here as we need to
  // distinguish unhandled rejections.
  this.addCallbackEntry_(goog.Promise.getCallbackEntry_(
      opt_onFulfilled || goog.nullFunction,
      opt_onRejected || null,
      opt_context));
};


/**
 * Calls "thenVoid" if possible to avoid allocating memory. Otherwise calls
 * "then".
 * @param {(goog.Thenable<TYPE>|Thenable)} promise
 * @param {function(this:THIS, TYPE): ?} onFulfilled
 * @param {function(this:THIS, *): *} onRejected
 * @param {THIS=} opt_context
 * @template THIS,TYPE
 * @private
 */
goog.Promise.maybeThenVoid_ = function(
    promise, onFulfilled, onRejected, opt_context) {
  if (promise instanceof goog.Promise) {
    promise.thenVoid(onFulfilled, onRejected, opt_context);
  } else {
    promise.then(onFulfilled, onRejected, opt_context);
  }
};


/**
 * Adds a callback that will be invoked when the Promise is settled (fulfilled
 * or rejected). The callback receives no argument, and no new child Promise is
 * created. This is useful for ensuring that cleanup takes place after certain
 * asynchronous operations. Callbacks added with {@code thenAlways} will be
 * executed in the same order with other calls to {@code then},
 * {@code thenAlways}, or {@code thenCatch}.
 *
 * Since it does not produce a new child Promise, cancellation propagation is
 * not prevented by adding callbacks with {@code thenAlways}. A Promise that has
 * a cleanup handler added with {@code thenAlways} will be canceled if all of
 * its children created by {@code then} (or {@code thenCatch}) are canceled.
 * Additionally, since any rejections are not passed to the callback, it does
 * not stop the unhandled rejection handler from running.
 *
 * @param {function(this:THIS): void} onSettled A function that will be invoked
 *     when the Promise is settled (fulfilled or rejected).
 * @param {THIS=} opt_context An optional context object that will be the
 *     execution context for the callbacks. By default, functions are executed
 *     in the global scope.
 * @return {!goog.Promise<TYPE>} This Promise, for chaining additional calls.
 * @template THIS
 */
goog.Promise.prototype.thenAlways = function(onSettled, opt_context) {
  if (goog.Promise.LONG_STACK_TRACES) {
    this.addStackTrace_(new Error('thenAlways'));
  }

  var entry = goog.Promise.getCallbackEntry_(onSettled, onSettled, opt_context);
  entry.always = true;
  this.addCallbackEntry_(entry);
  return this;
};


/**
 * Adds a callback that will be invoked only if the Promise is rejected. This
 * is equivalent to {@code then(null, onRejected)}.
 *
 * @param {!function(this:THIS, *): *} onRejected A function that will be
 *     invoked with the rejection reason if the Promise is rejected.
 * @param {THIS=} opt_context An optional context object that will be the
 *     execution context for the callbacks. By default, functions are executed
 *     in the global scope.
 * @return {!goog.Promise} A new Promise that will receive the result of the
 *     callback.
 * @template THIS
 */
goog.Promise.prototype.thenCatch = function(onRejected, opt_context) {
  if (goog.Promise.LONG_STACK_TRACES) {
    this.addStackTrace_(new Error('thenCatch'));
  }
  return this.addChildPromise_(null, onRejected, opt_context);
};


/**
 * Cancels the Promise if it is still pending by rejecting it with a cancel
 * Error. No action is performed if the Promise is already resolved.
 *
 * All child Promises of the canceled Promise will be rejected with the same
 * cancel error, as with normal Promise rejection. If the Promise to be canceled
 * is the only child of a pending Promise, the parent Promise will also be
 * canceled. Cancellation may propagate upward through multiple generations.
 *
 * @param {string=} opt_message An optional debugging message for describing the
 *     cancellation reason.
 */
goog.Promise.prototype.cancel = function(opt_message) {
  if (this.state_ == goog.Promise.State_.PENDING) {
    goog.async.run(function() {
      var err = new goog.Promise.CancellationError(opt_message);
      this.cancelInternal_(err);
    }, this);
  }
};


/**
 * Cancels this Promise with the given error.
 *
 * @param {!Error} err The cancellation error.
 * @private
 */
goog.Promise.prototype.cancelInternal_ = function(err) {
  if (this.state_ == goog.Promise.State_.PENDING) {
    if (this.parent_) {
      // Cancel the Promise and remove it from the parent's child list.
      this.parent_.cancelChild_(this, err);
      this.parent_ = null;
    } else {
      this.resolve_(goog.Promise.State_.REJECTED, err);
    }
  }
};


/**
 * Cancels a child Promise from the list of callback entries. If the Promise has
 * not already been resolved, reject it with a cancel error. If there are no
 * other children in the list of callback entries, propagate the cancellation
 * by canceling this Promise as well.
 *
 * @param {!goog.Promise} childPromise The Promise to cancel.
 * @param {!Error} err The cancel error to use for rejecting the Promise.
 * @private
 */
goog.Promise.prototype.cancelChild_ = function(childPromise, err) {
  if (!this.callbackEntries_) {
    return;
  }
  var childCount = 0;
  var childEntry = null;
  var beforeChildEntry = null;

  // Find the callback entry for the childPromise, and count whether there are
  // additional child Promises.
  for (var entry = this.callbackEntries_; entry; entry = entry.next) {
    if (!entry.always) {
      childCount++;
      if (entry.child == childPromise) {
        childEntry = entry;
      }
      if (childEntry && childCount > 1) {
        break;
      }
    }
    if (!childEntry) {
      beforeChildEntry = entry;
    }
  }

  // Can a child entry be missing?

  // If the child Promise was the only child, cancel this Promise as well.
  // Otherwise, reject only the child Promise with the cancel error.
  if (childEntry) {
    if (this.state_ == goog.Promise.State_.PENDING && childCount == 1) {
      this.cancelInternal_(err);
    } else {
      if (beforeChildEntry) {
        this.removeEntryAfter_(beforeChildEntry);
      } else {
        this.popEntry_();
      }

      this.executeCallback_(
          childEntry, goog.Promise.State_.REJECTED, err);
    }
  }
};


/**
 * Adds a callback entry to the current Promise, and schedules callback
 * execution if the Promise has already been settled.
 *
 * @param {goog.Promise.CallbackEntry_} callbackEntry Record containing
 *     {@code onFulfilled} and {@code onRejected} callbacks to execute after
 *     the Promise is settled.
 * @private
 */
goog.Promise.prototype.addCallbackEntry_ = function(callbackEntry) {
  if (!this.hasEntry_() &&
      (this.state_ == goog.Promise.State_.FULFILLED ||
       this.state_ == goog.Promise.State_.REJECTED)) {
    this.scheduleCallbacks_();
  }
  this.queueEntry_(callbackEntry);
};


/**
 * Creates a child Promise and adds it to the callback entry list. The result of
 * the child Promise is determined by the state of the parent Promise and the
 * result of the {@code onFulfilled} or {@code onRejected} callbacks as
 * specified in the Promise resolution procedure.
 *
 * @see http://promisesaplus.com/#the__method
 *
 * @param {?function(this:THIS, TYPE):
 *          (RESULT|goog.Promise<RESULT>|Thenable)} onFulfilled A callback that
 *     will be invoked if the Promise is fullfilled, or null.
 * @param {?function(this:THIS, *): *} onRejected A callback that will be
 *     invoked if the Promise is rejected, or null.
 * @param {THIS=} opt_context An optional execution context for the callbacks.
 *     in the default calling context.
 * @return {!goog.Promise} The child Promise.
 * @template RESULT,THIS
 * @private
 */
goog.Promise.prototype.addChildPromise_ = function(
    onFulfilled, onRejected, opt_context) {

  /** @type {goog.Promise.CallbackEntry_} */
  var callbackEntry = goog.Promise.getCallbackEntry_(null, null, null);

  callbackEntry.child = new goog.Promise(function(resolve, reject) {
    // Invoke onFulfilled, or resolve with the parent's value if absent.
    callbackEntry.onFulfilled = onFulfilled ? function(value) {
      try {
        var result = onFulfilled.call(opt_context, value);
        resolve(result);
      } catch (err) {
        reject(err);
      }
    } : resolve;

    // Invoke onRejected, or reject with the parent's reason if absent.
    callbackEntry.onRejected = onRejected ? function(reason) {
      try {
        var result = onRejected.call(opt_context, reason);
        if (!goog.isDef(result) &&
            reason instanceof goog.Promise.CancellationError) {
          // Propagate cancellation to children if no other result is returned.
          reject(reason);
        } else {
          resolve(result);
        }
      } catch (err) {
        reject(err);
      }
    } : reject;
  });

  callbackEntry.child.parent_ = this;
  this.addCallbackEntry_(callbackEntry);
  return callbackEntry.child;
};


/**
 * Unblocks the Promise and fulfills it with the given value.
 *
 * @param {TYPE} value
 * @private
 */
goog.Promise.prototype.unblockAndFulfill_ = function(value) {
  goog.asserts.assert(this.state_ == goog.Promise.State_.BLOCKED);
  this.state_ = goog.Promise.State_.PENDING;
  this.resolve_(goog.Promise.State_.FULFILLED, value);
};


/**
 * Unblocks the Promise and rejects it with the given rejection reason.
 *
 * @param {*} reason
 * @private
 */
goog.Promise.prototype.unblockAndReject_ = function(reason) {
  goog.asserts.assert(this.state_ == goog.Promise.State_.BLOCKED);
  this.state_ = goog.Promise.State_.PENDING;
  this.resolve_(goog.Promise.State_.REJECTED, reason);
};


/**
 * Attempts to resolve a Promise with a given resolution state and value. This
 * is a no-op if the given Promise has already been resolved.
 *
 * If the given result is a Thenable (such as another Promise), the Promise will
 * be settled with the same state and result as the Thenable once it is itself
 * settled.
 *
 * If the given result is not a Thenable, the Promise will be settled (fulfilled
 * or rejected) with that result based on the given state.
 *
 * @see http://promisesaplus.com/#the_promise_resolution_procedure
 *
 * @param {goog.Promise.State_} state
 * @param {*} x The result to apply to the Promise.
 * @private
 */
goog.Promise.prototype.resolve_ = function(state, x) {
  if (this.state_ != goog.Promise.State_.PENDING) {
    return;
  }

  if (this == x) {
    state = goog.Promise.State_.REJECTED;
    x = new TypeError('Promise cannot resolve to itself');

  } else if (goog.Thenable.isImplementedBy(x)) {
    x = /** @type {!goog.Thenable} */ (x);
    this.state_ = goog.Promise.State_.BLOCKED;
    goog.Promise.maybeThenVoid_(
        x, this.unblockAndFulfill_, this.unblockAndReject_, this);
    return;
  } else if (goog.isObject(x)) {
    try {
      var then = x['then'];
      if (goog.isFunction(then)) {
        this.tryThen_(x, then);
        return;
      }
    } catch (e) {
      state = goog.Promise.State_.REJECTED;
      x = e;
    }
  }

  this.result_ = x;
  this.state_ = state;
  // Since we can no longer be cancelled, remove link to parent, so that the
  // child promise does not keep the parent promise alive.
  this.parent_ = null;
  this.scheduleCallbacks_();

  if (state == goog.Promise.State_.REJECTED &&
      !(x instanceof goog.Promise.CancellationError)) {
    goog.Promise.addUnhandledRejection_(this, x);
  }
};


/**
 * Attempts to call the {@code then} method on an object in the hopes that it is
 * a Promise-compatible instance. This allows interoperation between different
 * Promise implementations, however a non-compliant object may cause a Promise
 * to hang indefinitely. If the {@code then} method throws an exception, the
 * dependent Promise will be rejected with the thrown value.
 *
 * @see http://promisesaplus.com/#point-70
 *
 * @param {Thenable} thenable An object with a {@code then} method that may be
 *     compatible with the Promise/A+ specification.
 * @param {!Function} then The {@code then} method of the Thenable object.
 * @private
 */
goog.Promise.prototype.tryThen_ = function(thenable, then) {
  this.state_ = goog.Promise.State_.BLOCKED;
  var promise = this;
  var called = false;

  var resolve = function(value) {
    if (!called) {
      called = true;
      promise.unblockAndFulfill_(value);
    }
  };

  var reject = function(reason) {
    if (!called) {
      called = true;
      promise.unblockAndReject_(reason);
    }
  };

  try {
    then.call(thenable, resolve, reject);
  } catch (e) {
    reject(e);
  }
};


/**
 * Executes the pending callbacks of a settled Promise after a timeout.
 *
 * Section 2.2.4 of the Promises/A+ specification requires that Promise
 * callbacks must only be invoked from a call stack that only contains Promise
 * implementation code, which we accomplish by invoking callback execution after
 * a timeout. If {@code startExecution_} is called multiple times for the same
 * Promise, the callback chain will be evaluated only once. Additional callbacks
 * may be added during the evaluation phase, and will be executed in the same
 * event loop.
 *
 * All Promises added to the waiting list during the same browser event loop
 * will be executed in one batch to avoid using a separate timeout per Promise.
 *
 * @private
 */
goog.Promise.prototype.scheduleCallbacks_ = function() {
  if (!this.executing_) {
    this.executing_ = true;
    goog.async.run(this.executeCallbacks_, this);
  }
};


/**
 * @return {boolean} Whether there are any pending callbacks queued.
 * @private
 */
goog.Promise.prototype.hasEntry_ = function() {
  return !!this.callbackEntries_;
};


/**
 * @param {goog.Promise.CallbackEntry_} entry
 * @private
 */
goog.Promise.prototype.queueEntry_ = function(entry) {
  goog.asserts.assert(entry.onFulfilled != null);

  if (this.callbackEntriesTail_) {
    this.callbackEntriesTail_.next = entry;
    this.callbackEntriesTail_ = entry;
  } else {
    // It the work queue was empty set the head too.
    this.callbackEntries_ = entry;
    this.callbackEntriesTail_ = entry;
  }
};


/**
 * @return {goog.Promise.CallbackEntry_} entry
 * @private
 */
goog.Promise.prototype.popEntry_ = function() {
  var entry = null;
  if (this.callbackEntries_) {
    entry = this.callbackEntries_;
    this.callbackEntries_ = entry.next;
    entry.next = null;
  }
  // It the work queue is empty clear the tail too.
  if (!this.callbackEntries_) {
    this.callbackEntriesTail_ = null;
  }

  if (entry != null) {
    goog.asserts.assert(entry.onFulfilled != null);
  }
  return entry;
};


/**
 * @param {goog.Promise.CallbackEntry_} previous
 * @private
 */
goog.Promise.prototype.removeEntryAfter_ = function(previous) {
  goog.asserts.assert(this.callbackEntries_);
  goog.asserts.assert(previous != null);
  // If the last entry is being removed, update the tail
  if (previous.next == this.callbackEntriesTail_) {
    this.callbackEntriesTail_ = previous;
  }

  previous.next = previous.next.next;
};


/**
 * Executes all pending callbacks for this Promise.
 *
 * @private
 */
goog.Promise.prototype.executeCallbacks_ = function() {
  var entry = null;
  while (entry = this.popEntry_()) {
    if (goog.Promise.LONG_STACK_TRACES) {
      this.currentStep_++;
    }
    this.executeCallback_(entry, this.state_, this.result_);
  }
  this.executing_ = false;
};


/**
 * Executes a pending callback for this Promise. Invokes an {@code onFulfilled}
 * or {@code onRejected} callback based on the settled state of the Promise.
 *
 * @param {!goog.Promise.CallbackEntry_} callbackEntry An entry containing the
 *     onFulfilled and/or onRejected callbacks for this step.
 * @param {goog.Promise.State_} state The resolution status of the Promise,
 *     either FULFILLED or REJECTED.
 * @param {*} result The settled result of the Promise.
 * @private
 */
goog.Promise.prototype.executeCallback_ = function(
    callbackEntry, state, result) {
  // Cancel an unhandled rejection if the then/thenVoid call had an onRejected.
  if (state == goog.Promise.State_.REJECTED &&
      callbackEntry.onRejected && !callbackEntry.always) {
    this.removeUnhandledRejection_();
  }

  if (callbackEntry.child) {
    // When the parent is settled, the child no longer needs to hold on to it,
    // as the parent can no longer be canceled.
    callbackEntry.child.parent_ = null;
    goog.Promise.invokeCallback_(callbackEntry, state, result);
  } else {
    // Callbacks created with thenAlways or thenVoid do not have the rejection
    // handling code normally set up in the child Promise.
    try {
      callbackEntry.always ?
          callbackEntry.onFulfilled.call(callbackEntry.context) :
          goog.Promise.invokeCallback_(callbackEntry, state, result);
    } catch (err) {
      goog.Promise.handleRejection_.call(null, err);
    }
  }
  goog.Promise.returnEntry_(callbackEntry);
};


/**
 * Executes the onFulfilled or onRejected callback for a callbackEntry.
 *
 * @param {!goog.Promise.CallbackEntry_} callbackEntry
 * @param {goog.Promise.State_} state
 * @param {*} result
 * @private
 */
goog.Promise.invokeCallback_ = function(callbackEntry, state, result) {
  if (state == goog.Promise.State_.FULFILLED) {
    callbackEntry.onFulfilled.call(callbackEntry.context, result);
  } else if (callbackEntry.onRejected) {
    callbackEntry.onRejected.call(callbackEntry.context, result);
  }
};


/**
 * Records a stack trace entry for functions that call {@code then} or the
 * Promise constructor. May be disabled by unsetting {@code LONG_STACK_TRACES}.
 *
 * @param {!Error} err An Error object created by the calling function for
 *     providing a stack trace.
 * @private
 */
goog.Promise.prototype.addStackTrace_ = function(err) {
  if (goog.Promise.LONG_STACK_TRACES && goog.isString(err.stack)) {
    // Extract the third line of the stack trace, which is the entry for the
    // user function that called into Promise code.
    var trace = err.stack.split('\n', 4)[3];
    var message = err.message;

    // Pad the message to align the traces.
    message += Array(11 - message.length).join(' ');
    this.stack_.push(message + trace);
  }
};


/**
 * Adds extra stack trace information to an exception for the list of
 * asynchronous {@code then} calls that have been run for this Promise. Stack
 * trace information is recorded in {@see #addStackTrace_}, and appended to
 * rethrown errors when {@code LONG_STACK_TRACES} is enabled.
 *
 * @param {*} err An unhandled exception captured during callback execution.
 * @private
 */
goog.Promise.prototype.appendLongStack_ = function(err) {
  if (goog.Promise.LONG_STACK_TRACES &&
      err && goog.isString(err.stack) && this.stack_.length) {
    var longTrace = ['Promise trace:'];

    for (var promise = this; promise; promise = promise.parent_) {
      for (var i = this.currentStep_; i >= 0; i--) {
        longTrace.push(promise.stack_[i]);
      }
      longTrace.push('Value: ' +
          '[' + (promise.state_ == goog.Promise.State_.REJECTED ?
              'REJECTED' : 'FULFILLED') + '] ' +
          '<' + String(promise.result_) + '>');
    }
    err.stack += '\n\n' + longTrace.join('\n');
  }
};


/**
 * Marks this rejected Promise as having being handled. Also marks any parent
 * Promises in the rejected state as handled. The rejection handler will no
 * longer be invoked for this Promise (if it has not been called already).
 *
 * @private
 */
goog.Promise.prototype.removeUnhandledRejection_ = function() {
  if (goog.Promise.UNHANDLED_REJECTION_DELAY > 0) {
    for (var p = this; p && p.unhandledRejectionId_; p = p.parent_) {
      goog.global.clearTimeout(p.unhandledRejectionId_);
      p.unhandledRejectionId_ = 0;
    }
  } else if (goog.Promise.UNHANDLED_REJECTION_DELAY == 0) {
    for (var p = this; p && p.hadUnhandledRejection_; p = p.parent_) {
      p.hadUnhandledRejection_ = false;
    }
  }
};


/**
 * Marks this rejected Promise as unhandled. If no {@code onRejected} callback
 * is called for this Promise before the {@code UNHANDLED_REJECTION_DELAY}
 * expires, the reason will be passed to the unhandled rejection handler. The
 * handler typically rethrows the rejection reason so that it becomes visible in
 * the developer console.
 *
 * @param {!goog.Promise} promise The rejected Promise.
 * @param {*} reason The Promise rejection reason.
 * @private
 */
goog.Promise.addUnhandledRejection_ = function(promise, reason) {
  if (goog.Promise.UNHANDLED_REJECTION_DELAY > 0) {
    promise.unhandledRejectionId_ = goog.global.setTimeout(function() {
      promise.appendLongStack_(reason);
      goog.Promise.handleRejection_.call(null, reason);
    }, goog.Promise.UNHANDLED_REJECTION_DELAY);

  } else if (goog.Promise.UNHANDLED_REJECTION_DELAY == 0) {
    promise.hadUnhandledRejection_ = true;
    goog.async.run(function() {
      if (promise.hadUnhandledRejection_) {
        promise.appendLongStack_(reason);
        goog.Promise.handleRejection_.call(null, reason);
      }
    });
  }
};


/**
 * A method that is invoked with the rejection reasons for Promises that are
 * rejected but have no {@code onRejected} callbacks registered yet.
 * @type {function(*)}
 * @private
 */
goog.Promise.handleRejection_ = goog.async.throwException;


/**
 * Sets a handler that will be called with reasons from unhandled rejected
 * Promises. If the rejected Promise (or one of its descendants) has an
 * {@code onRejected} callback registered, the rejection will be considered
 * handled, and the rejection handler will not be called.
 *
 * By default, unhandled rejections are rethrown so that the error may be
 * captured by the developer console or a {@code window.onerror} handler.
 *
 * @param {function(*)} handler A function that will be called with reasons from
 *     rejected Promises. Defaults to {@code goog.async.throwException}.
 */
goog.Promise.setUnhandledRejectionHandler = function(handler) {
  goog.Promise.handleRejection_ = handler;
};



/**
 * Error used as a rejection reason for canceled Promises.
 *
 * @param {string=} opt_message
 * @constructor
 * @extends {goog.debug.Error}
 * @final
 */
goog.Promise.CancellationError = function(opt_message) {
  goog.Promise.CancellationError.base(this, 'constructor', opt_message);
};
goog.inherits(goog.Promise.CancellationError, goog.debug.Error);


/** @override */
goog.Promise.CancellationError.prototype.name = 'cancel';



/**
 * Internal implementation of the resolver interface.
 *
 * @param {!goog.Promise<TYPE>} promise
 * @param {function((TYPE|goog.Promise<TYPE>|Thenable)=)} resolve
 * @param {function(*=): void} reject
 * @implements {goog.promise.Resolver<TYPE>}
 * @final @struct
 * @constructor
 * @private
 * @template TYPE
 */
goog.Promise.Resolver_ = function(promise, resolve, reject) {
  /** @const */
  this.promise = promise;

  /** @const */
  this.resolve = resolve;

  /** @const */
  this.reject = reject;
};
