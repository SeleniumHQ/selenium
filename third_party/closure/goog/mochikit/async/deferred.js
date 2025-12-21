// Copyright 2007 Bob Ippolito. All Rights Reserved.
// Modifications Copyright 2009 The Closure Library Authors. All Rights
// Reserved.

/**
 * @license Portions of this code are from MochiKit, received by
 * The Closure Authors under the MIT license. All other code is Copyright
 * 2005-2009 The Closure Authors. All Rights Reserved.
 */

/**
 * @fileoverview Classes for tracking asynchronous operations and handling the
 * results. The Deferred object here is patterned after the Deferred object in
 * the Twisted python networking framework.
 *
 * See: http://twistedmatrix.com/projects/core/documentation/howto/defer.html
 *
 * Based on the Dojo code which in turn is based on the MochiKit code.
 *
 * @author arv@google.com (Erik Arvidsson)
 * @author brenneman@google.com (Shawn Brenneman)
 */

goog.provide('goog.async.Deferred');
goog.provide('goog.async.Deferred.AlreadyCalledError');
goog.provide('goog.async.Deferred.CanceledError');

goog.require('goog.Promise');
goog.require('goog.Thenable');
goog.require('goog.array');
goog.require('goog.asserts');
goog.require('goog.debug.Error');



/**
 * A Deferred represents the result of an asynchronous operation. A Deferred
 * instance has no result when it is created, and is "fired" (given an initial
 * result) by calling `callback` or `errback`.
 *
 * Once fired, the result is passed through a sequence of callback functions
 * registered with `addCallback` or `addErrback`. The functions may
 * mutate the result before it is passed to the next function in the sequence.
 *
 * Callbacks and errbacks may be added at any time, including after the Deferred
 * has been "fired". If there are no pending actions in the execution sequence
 * of a fired Deferred, any new callback functions will be called with the last
 * computed result. Adding a callback function is the only way to access the
 * result of the Deferred.
 *
 * If a Deferred operation is canceled, an optional user-provided cancellation
 * function is invoked which may perform any special cleanup, followed by firing
 * the Deferred's errback sequence with a `CanceledError`. If the
 * Deferred has already fired, cancellation is ignored.
 *
 * Deferreds may be templated to a specific type they produce using generics
 * with syntax such as:
 *
 *    /** @type {goog.async.Deferred<string>} *\
 *    var d = new goog.async.Deferred();
 *    // Compiler can infer that foo is a string.
 *    d.addCallback(function(foo) {...});
 *    d.callback('string');  // Checked to be passed a string
 *
 * Since deferreds are often used to produce different values across a chain,
 * the type information is not propagated across chains, but rather only
 * associated with specifically cast objects.
 *
 * @param {Function=} opt_onCancelFunction A function that will be called if the
 *     Deferred is canceled. If provided, this function runs before the
 *     Deferred is fired with a `CanceledError`.
 * @param {Object=} opt_defaultScope The default object context to call
 *     callbacks and errbacks in.
 * @constructor
 * @implements {goog.Thenable<VALUE>}
 * @template VALUE
 */
goog.async.Deferred = function(opt_onCancelFunction, opt_defaultScope) {
  /**
   * Entries in the sequence are arrays containing a callback, an errback, and
   * an optional scope. The callback or errback in an entry may be null.
   * @type {!Array<!Array>}
   * @private
   */
  this.sequence_ = [];

  /**
   * Optional function that will be called if the Deferred is canceled.
   * @type {Function|undefined}
   * @private
   */
  this.onCancelFunction_ = opt_onCancelFunction;

  /**
   * The default scope to execute callbacks and errbacks in.
   * @type {Object}
   * @private
   */
  this.defaultScope_ = opt_defaultScope || null;

  /**
   * Whether the Deferred has been fired.
   * @type {boolean}
   * @private
   */
  this.fired_ = false;

  /**
   * Whether the last result in the execution sequence was an error.
   * @type {boolean}
   * @private
   */
  this.hadError_ = false;

  /**
   * The current Deferred result, updated as callbacks and errbacks are
   * executed.
   * @type {*}
   * @private
   */
  this.result_ = undefined;

  /**
   * Whether the Deferred is blocked waiting on another Deferred to fire. If a
   * callback or errback returns a Deferred as a result, the execution sequence
   * is blocked until that Deferred result becomes available.
   * @type {boolean}
   * @private
   */
  this.blocked_ = false;

  /**
   * Whether this Deferred is blocking execution of another Deferred. If this
   * instance was returned as a result in another Deferred's execution
   * sequence,that other Deferred becomes blocked until this instance's
   * execution sequence completes. No additional callbacks may be added to a
   * Deferred once it is blocking another instance.
   * @type {boolean}
   * @private
   */
  this.blocking_ = false;

  /**
   * Whether the Deferred has been canceled without having a custom cancel
   * function.
   * @type {boolean}
   * @private
   */
  this.silentlyCanceled_ = false;

  /**
   * If an error is thrown during Deferred execution with no errback to catch
   * it, the error is rethrown after a timeout. Reporting the error after a
   * timeout allows execution to continue in the calling context (empty when
   * no error is scheduled).
   * @type {number}
   * @private
   */
  this.unhandledErrorId_ = 0;

  /**
   * If this Deferred was created by branch(), this will be the "parent"
   * Deferred.
   * @type {?goog.async.Deferred}
   * @private
   */
  this.parent_ = null;

  /**
   * The number of Deferred objects that have been branched off this one. This
   * will be decremented whenever a branch is fired or canceled.
   * @type {number}
   * @private
   */
  this.branches_ = 0;

  if (goog.async.Deferred.LONG_STACK_TRACES) {
    /**
     * Holds the stack trace at time of deferred creation if the JS engine
     * provides the Error.captureStackTrace API.
     * @private {?string}
     */
    this.constructorStack_ = null;
    if (Error.captureStackTrace) {
      var target = { stack: '' };
      Error.captureStackTrace(target, goog.async.Deferred);
      // Check if Error.captureStackTrace worked. It fails in gjstest.
      if (typeof target.stack == 'string') {
        // Remove first line and force stringify to prevent memory leak due to
        // holding on to actual stack frames.
        this.constructorStack_ = target.stack.replace(/^[^\n]*\n/, '');
      }
    }
  }
};


/**
 * @define {boolean} Whether unhandled errors should always get rethrown to the
 * global scope. Defaults to false.
 */
goog.async.Deferred.STRICT_ERRORS =
    goog.define('goog.async.Deferred.STRICT_ERRORS', false);


/**
 * @define {boolean} Whether to attempt to make stack traces long.  Defaults to
 * false.
 */
goog.async.Deferred.LONG_STACK_TRACES =
    goog.define('goog.async.Deferred.LONG_STACK_TRACES', false);


/**
 * Cancels a Deferred that has not yet been fired, or is blocked on another
 * deferred operation. If this Deferred is waiting for a blocking Deferred to
 * fire, the blocking Deferred will also be canceled.
 *
 * If this Deferred was created by calling branch() on a parent Deferred with
 * opt_propagateCancel set to true, the parent may also be canceled. If
 * opt_deepCancel is set, cancel() will be called on the parent (as well as any
 * other ancestors if the parent is also a branch). If one or more branches were
 * created with opt_propagateCancel set to true, the parent will be canceled if
 * cancel() is called on all of those branches.
 *
 * @param {boolean=} opt_deepCancel If true, cancels this Deferred's parent even
 *     if cancel() hasn't been called on some of the parent's branches. Has no
 *     effect on a branch without opt_propagateCancel set to true.
 */
goog.async.Deferred.prototype.cancel = function(opt_deepCancel) {
  if (!this.hasFired()) {
    if (this.parent_) {
      // Get rid of the parent reference before potentially running the parent's
      // canceler function to ensure that this cancellation isn't
      // double-counted.
      var parent = this.parent_;
      delete this.parent_;
      if (opt_deepCancel) {
        parent.cancel(opt_deepCancel);
      } else {
        parent.branchCancel_();
      }
    }

    if (this.onCancelFunction_) {
      // Call in user-specified scope.
      this.onCancelFunction_.call(this.defaultScope_, this);
    } else {
      this.silentlyCanceled_ = true;
    }
    if (!this.hasFired()) {
      this.errback(new goog.async.Deferred.CanceledError(this));
    }
  } else if (this.result_ instanceof goog.async.Deferred) {
    this.result_.cancel();
  }
};


/**
 * Handle a single branch being canceled. Once all branches are canceled, this
 * Deferred will be canceled as well.
 *
 * @private
 */
goog.async.Deferred.prototype.branchCancel_ = function() {
  this.branches_--;
  if (this.branches_ <= 0) {
    this.cancel();
  }
};


/**
 * Called after a blocking Deferred fires. Unblocks this Deferred and resumes
 * its execution sequence.
 *
 * @param {boolean} isSuccess Whether the result is a success or an error.
 * @param {*} res The result of the blocking Deferred.
 * @private
 */
goog.async.Deferred.prototype.continue_ = function(isSuccess, res) {
  this.blocked_ = false;
  this.updateResult_(isSuccess, res);
};


/**
 * Updates the current result based on the success or failure of the last action
 * in the execution sequence.
 *
 * @param {boolean} isSuccess Whether the new result is a success or an error.
 * @param {*} res The result.
 * @private
 */
goog.async.Deferred.prototype.updateResult_ = function(isSuccess, res) {
  this.fired_ = true;
  this.result_ = res;
  this.hadError_ = !isSuccess;
  this.fire_();
};


/**
 * Verifies that the Deferred has not yet been fired.
 *
 * @private
 * @throws {Error} If this has already been fired.
 */
goog.async.Deferred.prototype.check_ = function() {
  if (this.hasFired()) {
    if (!this.silentlyCanceled_) {
      throw new goog.async.Deferred.AlreadyCalledError(this);
    }
    this.silentlyCanceled_ = false;
  }
};


/**
 * Fire the execution sequence for this Deferred by passing the starting result
 * to the first registered callback.
 * @param {VALUE=} opt_result The starting result.
 */
goog.async.Deferred.prototype.callback = function(opt_result) {
  this.check_();
  this.assertNotDeferred_(opt_result);
  this.updateResult_(true /* isSuccess */, opt_result);
};


/**
 * Fire the execution sequence for this Deferred by passing the starting error
 * result to the first registered errback.
 * @param {*=} opt_result The starting error.
 */
goog.async.Deferred.prototype.errback = function(opt_result) {
  this.check_();
  this.assertNotDeferred_(opt_result);
  this.makeStackTraceLong_(opt_result);
  this.updateResult_(false /* isSuccess */, opt_result);
};


/**
 * Attempt to make the error's stack trace be long in that it contains the
 * stack trace from the point where the deferred was created on top of the
 * current stack trace to give additional context.
 * @param {*} error
 * @private
 */
goog.async.Deferred.prototype.makeStackTraceLong_ = function(error) {
  if (!goog.async.Deferred.LONG_STACK_TRACES) {
    return;
  }
  if (this.constructorStack_ && goog.isObject(error) && error.stack &&
      // Stack looks like it was system generated. See
      // https://code.google.com/p/v8/wiki/JavaScriptStackTraceApi
      (/^[^\n]+(\n   [^\n]+)+/).test(error.stack)) {
    error.stack = error.stack + '\nDEFERRED OPERATION:\n' +
        this.constructorStack_;
  }
};


/**
 * Asserts that an object is not a Deferred.
 * @param {*} obj The object to test.
 * @throws {Error} Throws an exception if the object is a Deferred.
 * @private
 */
goog.async.Deferred.prototype.assertNotDeferred_ = function(obj) {
  goog.asserts.assert(
      !(obj instanceof goog.async.Deferred),
      'An execution sequence may not be initiated with a blocking Deferred.');
};


/**
 * Register a callback function to be called with a successful result. If no
 * value is returned by the callback function, the result value is unchanged. If
 * a new value is returned, it becomes the Deferred result and will be passed to
 * the next callback in the execution sequence.
 *
 * If the function throws an error, the error becomes the new result and will be
 * passed to the next errback in the execution chain.
 *
 * If the function returns a Deferred, the execution sequence will be blocked
 * until that Deferred fires. Its result will be passed to the next callback (or
 * errback if it is an error result) in this Deferred's execution sequence.
 *
 * @param {function(this:T,VALUE):?} cb The function to be called with a
 *     successful result.
 * @param {T=} opt_scope An optional scope to call the callback in.
 * @return {!goog.async.Deferred} This Deferred.
 * @template T
 */
goog.async.Deferred.prototype.addCallback = function(cb, opt_scope) {
  return this.addCallbacks(cb, null, opt_scope);
};


/**
 * Register a callback function to be called with an error result. If no value
 * is returned by the function, the error result is unchanged. If a new error
 * value is returned or thrown, that error becomes the Deferred result and will
 * be passed to the next errback in the execution sequence.
 *
 * If the errback function handles the error by returning a non-error value,
 * that result will be passed to the next normal callback in the sequence.
 *
 * If the function returns a Deferred, the execution sequence will be blocked
 * until that Deferred fires. Its result will be passed to the next callback (or
 * errback if it is an error result) in this Deferred's execution sequence.
 *
 * @param {function(this:T,?):?} eb The function to be called on an
 *     unsuccessful result.
 * @param {T=} opt_scope An optional scope to call the errback in.
 * @return {!goog.async.Deferred<VALUE>} This Deferred.
 * @template T
 */
goog.async.Deferred.prototype.addErrback = function(eb, opt_scope) {
  return this.addCallbacks(null, eb, opt_scope);
};


/**
 * Registers one function as both a callback and errback.
 *
 * @param {function(this:T,?):?} f The function to be called on any result.
 * @param {T=} opt_scope An optional scope to call the function in.
 * @return {!goog.async.Deferred} This Deferred.
 * @template T
 */
goog.async.Deferred.prototype.addBoth = function(f, opt_scope) {
  return this.addCallbacks(f, f, opt_scope);
};


/**
 * Like addBoth, but propagates uncaught exceptions in the errback.
 *
 * @param {function(this:T,?):?} f The function to be called on any result.
 * @param {T=} opt_scope An optional scope to call the function in.
 * @return {!goog.async.Deferred<VALUE>} This Deferred.
 * @template T
 */
goog.async.Deferred.prototype.addFinally = function(f, opt_scope) {
  return this.addCallbacks(f, function(err) {
    var result = f.call(/** @type {?} */ (this), err);
    if (result === undefined) {
      throw err;
    }
    return result;
  }, opt_scope);
};


/**
 * Registers a callback function and an errback function at the same position
 * in the execution sequence. Only one of these functions will execute,
 * depending on the error state during the execution sequence.
 *
 * NOTE: This is not equivalent to {@code def.addCallback().addErrback()}! If
 * the callback is invoked, the errback will be skipped, and vice versa.
 *
 * @param {?(function(this:T,VALUE):?)} cb The function to be called on a
 *     successful result.
 * @param {?(function(this:T,?):?)} eb The function to be called on an
 *     unsuccessful result.
 * @param {T=} opt_scope An optional scope to call the functions in.
 * @return {!goog.async.Deferred} This Deferred.
 * @template T
 */
goog.async.Deferred.prototype.addCallbacks = function(cb, eb, opt_scope) {
  goog.asserts.assert(!this.blocking_, 'Blocking Deferreds can not be re-used');
  this.sequence_.push([cb, eb, opt_scope]);
  if (this.hasFired()) {
    this.fire_();
  }
  return this;
};


/**
 * Implements {@see goog.Thenable} for seamless integration with
 * {@see goog.Promise}.
 * Deferred results are mutable and may represent multiple values over
 * their lifetime. Calling `then` on a Deferred returns a Promise
 * with the result of the Deferred at that point in its callback chain.
 * Note that if the Deferred result is never mutated, and only
 * `then` calls are made, the Deferred will behave like a Promise.
 *
 * @override
 */
goog.async.Deferred.prototype.then = function(opt_onFulfilled, opt_onRejected,
    opt_context) {
  var resolve, reject;
  var promise = new goog.Promise(function(res, rej) {
    // Copying resolvers to outer scope, so that they are available when the
    // deferred callback fires (which may be synchronous).
    resolve = res;
    reject = rej;
  });
  this.addCallbacks(resolve, function(reason) {
    if (reason instanceof goog.async.Deferred.CanceledError) {
      promise.cancel();
    } else {
      reject(reason);
    }
  });
  return promise.then(opt_onFulfilled, opt_onRejected, opt_context);
};
goog.Thenable.addImplementation(goog.async.Deferred);


/**
 * Links another Deferred to the end of this Deferred's execution sequence. The
 * result of this execution sequence will be passed as the starting result for
 * the chained Deferred, invoking either its first callback or errback.
 *
 * @param {!goog.async.Deferred} otherDeferred The Deferred to chain.
 * @return {!goog.async.Deferred} This Deferred.
 */
goog.async.Deferred.prototype.chainDeferred = function(otherDeferred) {
  this.addCallbacks(
      otherDeferred.callback, otherDeferred.errback, otherDeferred);
  return this;
};


/**
 * Makes this Deferred wait for another Deferred's execution sequence to
 * complete before continuing.
 *
 * This is equivalent to adding a callback that returns `otherDeferred`,
 * but doesn't prevent additional callbacks from being added to
 * `otherDeferred`.
 *
 * @param {!goog.async.Deferred|!goog.Thenable} otherDeferred The Deferred
 *     to wait for.
 * @return {!goog.async.Deferred} This Deferred.
 */
goog.async.Deferred.prototype.awaitDeferred = function(otherDeferred) {
  if (!(otherDeferred instanceof goog.async.Deferred)) {
    // The Thenable case.
    return this.addCallback(function() {
      return otherDeferred;
    });
  }
  return this.addCallback(goog.bind(otherDeferred.branch, otherDeferred));
};


/**
 * Creates a branch off this Deferred's execution sequence, and returns it as a
 * new Deferred. The branched Deferred's starting result will be shared with the
 * parent at the point of the branch, even if further callbacks are added to the
 * parent.
 *
 * All branches at the same stage in the execution sequence will receive the
 * same starting value.
 *
 * @param {boolean=} opt_propagateCancel If cancel() is called on every child
 *     branch created with opt_propagateCancel, the parent will be canceled as
 *     well.
 * @return {!goog.async.Deferred<VALUE>} A Deferred that will be started with
 *     the computed result from this stage in the execution sequence.
 */
goog.async.Deferred.prototype.branch = function(opt_propagateCancel) {
  var d = new goog.async.Deferred();
  this.chainDeferred(d);
  if (opt_propagateCancel) {
    d.parent_ = this;
    this.branches_++;
  }
  return d;
};


/**
 * @return {boolean} Whether the execution sequence has been started on this
 *     Deferred by invoking `callback` or `errback`.
 */
goog.async.Deferred.prototype.hasFired = function() {
  return this.fired_;
};


/**
 * @param {*} res The latest result in the execution sequence.
 * @return {boolean} Whether the current result is an error that should cause
 *     the next errback to fire. May be overridden by subclasses to handle
 *     special error types.
 * @protected
 */
goog.async.Deferred.prototype.isError = function(res) {
  return res instanceof Error;
};


/**
 * @return {boolean} Whether an errback exists in the remaining sequence.
 * @private
 */
goog.async.Deferred.prototype.hasErrback_ = function() {
  return goog.array.some(this.sequence_, function(sequenceRow) {
    // The errback is the second element in the array.
    return goog.isFunction(sequenceRow[1]);
  });
};


/**
 * Exhausts the execution sequence while a result is available. The result may
 * be modified by callbacks or errbacks, and execution will block if the
 * returned result is an incomplete Deferred.
 *
 * @private
 */
goog.async.Deferred.prototype.fire_ = function() {
  if (this.unhandledErrorId_ && this.hasFired() && this.hasErrback_()) {
    // It is possible to add errbacks after the Deferred has fired. If a new
    // errback is added immediately after the Deferred encountered an unhandled
    // error, but before that error is rethrown, the error is unscheduled.
    goog.async.Deferred.unscheduleError_(this.unhandledErrorId_);
    this.unhandledErrorId_ = 0;
  }

  if (this.parent_) {
    this.parent_.branches_--;
    delete this.parent_;
  }

  var res = this.result_;
  var unhandledException = false;
  var isNewlyBlocked = false;

  while (this.sequence_.length && !this.blocked_) {
    var sequenceEntry = this.sequence_.shift();

    var callback = sequenceEntry[0];
    var errback = sequenceEntry[1];
    var scope = sequenceEntry[2];

    var f = this.hadError_ ? errback : callback;
    if (f) {

      try {
        var ret = f.call(scope || this.defaultScope_, res);

        // If no result, then use previous result.
        if (ret !== undefined) {
          // Bubble up the error as long as the return value hasn't changed.
          this.hadError_ = this.hadError_ && (ret == res || this.isError(ret));
          this.result_ = res = ret;
        }

        if (goog.Thenable.isImplementedBy(res) ||
            (typeof goog.global['Promise'] === 'function' &&
            res instanceof goog.global['Promise'])) {
          isNewlyBlocked = true;
          this.blocked_ = true;
        }

      } catch (ex) {
        res = ex;
        this.hadError_ = true;
        this.makeStackTraceLong_(res);

        if (!this.hasErrback_()) {
          // If an error is thrown with no additional errbacks in the queue,
          // prepare to rethrow the error.
          unhandledException = true;
        }
      }
    }
  }

  this.result_ = res;

  if (isNewlyBlocked) {
    var onCallback = goog.bind(this.continue_, this, true /* isSuccess */);
    var onErrback = goog.bind(this.continue_, this, false /* isSuccess */);

    if (res instanceof goog.async.Deferred) {
      res.addCallbacks(onCallback, onErrback);
      res.blocking_ = true;
    } else {
      /** @type {!IThenable} */ (res).then(onCallback, onErrback);
    }
  } else if (goog.async.Deferred.STRICT_ERRORS && this.isError(res) &&
      !(res instanceof goog.async.Deferred.CanceledError)) {
    this.hadError_ = true;
    unhandledException = true;
  }

  if (unhandledException) {
    // Rethrow the unhandled error after a timeout. Execution will continue, but
    // the error will be seen by global handlers and the user. The throw will
    // be canceled if another errback is appended before the timeout executes.
    // The error's original stack trace is preserved where available.
    this.unhandledErrorId_ = goog.async.Deferred.scheduleError_(res);
  }
};


/**
 * Creates a Deferred that has an initial result.
 *
 * @param {*=} opt_result The result.
 * @return {!goog.async.Deferred} The new Deferred.
 */
goog.async.Deferred.succeed = function(opt_result) {
  var d = new goog.async.Deferred();
  d.callback(opt_result);
  return d;
};


/**
 * Creates a Deferred that fires when the given promise resolves.
 * Use only during migration to Promises.
 *
 * Note: If the promise resolves to a thenable value (which is not allowed by
 * conforming promise implementations), then the deferred may behave
 * unexpectedly as it tries to wait on it. This should not be a risk when using
 * goog.Promise, goog.async.Deferred, or native Promise objects.
 *
 * @param {!IThenable<T>} promise
 * @return {!goog.async.Deferred<T>} The new Deferred.
 * @template T
 */
goog.async.Deferred.fromPromise = function(promise) {
  var d = new goog.async.Deferred();
  promise.then(
      function(value) {
        d.callback(value);
      },
      function(error) {
        d.errback(error);
      });
  return d;
};


/**
 * Creates a Deferred that has an initial error result.
 *
 * @param {*} res The error result.
 * @return {!goog.async.Deferred} The new Deferred.
 */
goog.async.Deferred.fail = function(res) {
  var d = new goog.async.Deferred();
  d.errback(res);
  return d;
};


/**
 * Creates a Deferred that has already been canceled.
 *
 * @return {!goog.async.Deferred} The new Deferred.
 */
goog.async.Deferred.canceled = function() {
  var d = new goog.async.Deferred();
  d.cancel();
  return d;
};


/**
 * Normalizes values that may or may not be Deferreds.
 *
 * If the input value is a Deferred, the Deferred is branched (so the original
 * execution sequence is not modified) and the input callback added to the new
 * branch. The branch is returned to the caller.
 *
 * If the input value is not a Deferred, the callback will be executed
 * immediately and an already firing Deferred will be returned to the caller.
 *
 * In the following (contrived) example, if <code>isImmediate</code> is true
 * then 3 is alerted immediately, otherwise 6 is alerted after a 2-second delay.
 *
 * <pre>
 * var value;
 * if (isImmediate) {
 *   value = 3;
 * } else {
 *   value = new goog.async.Deferred();
 *   setTimeout(function() { value.callback(6); }, 2000);
 * }
 *
 * var d = goog.async.Deferred.when(value, alert);
 * </pre>
 *
 * @param {*} value Deferred or normal value to pass to the callback.
 * @param {function(this:T, ?):?} callback The callback to execute.
 * @param {T=} opt_scope An optional scope to call the callback in.
 * @return {!goog.async.Deferred} A new Deferred that will call the input
 *     callback with the input value.
 * @template T
 */
goog.async.Deferred.when = function(value, callback, opt_scope) {
  if (value instanceof goog.async.Deferred) {
    return value.branch(true).addCallback(callback, opt_scope);
  } else {
    return goog.async.Deferred.succeed(value).addCallback(callback, opt_scope);
  }
};



/**
 * An error sub class that is used when a Deferred has already been called.
 * @param {!goog.async.Deferred} deferred The Deferred.
 *
 * @constructor
 * @extends {goog.debug.Error}
 */
goog.async.Deferred.AlreadyCalledError = function(deferred) {
  goog.debug.Error.call(this);

  /**
   * The Deferred that raised this error.
   * @type {goog.async.Deferred}
   */
  this.deferred = deferred;
};
goog.inherits(goog.async.Deferred.AlreadyCalledError, goog.debug.Error);


/** @override */
goog.async.Deferred.AlreadyCalledError.prototype.message =
    'Deferred has already fired';


/** @override */
goog.async.Deferred.AlreadyCalledError.prototype.name = 'AlreadyCalledError';



/**
 * An error sub class that is used when a Deferred is canceled.
 *
 * @param {!goog.async.Deferred} deferred The Deferred object.
 * @constructor
 * @extends {goog.debug.Error}
 */
goog.async.Deferred.CanceledError = function(deferred) {
  goog.debug.Error.call(this);

  /**
   * The Deferred that raised this error.
   * @type {goog.async.Deferred}
   */
  this.deferred = deferred;
};
goog.inherits(goog.async.Deferred.CanceledError, goog.debug.Error);


/** @override */
goog.async.Deferred.CanceledError.prototype.message = 'Deferred was canceled';


/** @override */
goog.async.Deferred.CanceledError.prototype.name = 'CanceledError';



/**
 * Wrapper around errors that are scheduled to be thrown by failing deferreds
 * after a timeout.
 *
 * @param {*} error Error from a failing deferred.
 * @constructor
 * @final
 * @private
 * @struct
 */
goog.async.Deferred.Error_ = function(error) {
  /** @const @private {number} */
  this.id_ = goog.global.setTimeout(goog.bind(this.throwError, this), 0);

  /** @const @private {*} */
  this.error_ = error;
};


/**
 * Actually throws the error and removes it from the list of pending
 * deferred errors.
 */
goog.async.Deferred.Error_.prototype.throwError = function() {
  goog.asserts.assert(goog.async.Deferred.errorMap_[this.id_],
      'Cannot throw an error that is not scheduled.');
  delete goog.async.Deferred.errorMap_[this.id_];
  throw this.error_;
};


/**
 * Resets the error throw timer.
 */
goog.async.Deferred.Error_.prototype.resetTimer = function() {
  goog.global.clearTimeout(this.id_);
};


/**
 * Map of unhandled errors scheduled to be rethrown in a future timestep.
 * @private {!Object<(number|string), goog.async.Deferred.Error_>}
 */
goog.async.Deferred.errorMap_ = {};


/**
 * Schedules an error to be thrown after a delay.
 * @param {*} error Error from a failing deferred.
 * @return {number} Id of the error.
 * @private
 */
goog.async.Deferred.scheduleError_ = function(error) {
  var deferredError = new goog.async.Deferred.Error_(error);
  goog.async.Deferred.errorMap_[deferredError.id_] = deferredError;
  return deferredError.id_;
};


/**
 * Unschedules an error from being thrown.
 * @param {number} id Id of the deferred error to unschedule.
 * @private
 */
goog.async.Deferred.unscheduleError_ = function(id) {
  var error = goog.async.Deferred.errorMap_[id];
  if (error) {
    error.resetTimer();
    delete goog.async.Deferred.errorMap_[id];
  }
};


/**
 * Asserts that there are no pending deferred errors. If there are any
 * scheduled errors, one will be thrown immediately to make this function fail.
 */
goog.async.Deferred.assertNoErrors = function() {
  var map = goog.async.Deferred.errorMap_;
  for (var key in map) {
    var error = map[key];
    error.resetTimer();
    error.throwError();
  }
};
