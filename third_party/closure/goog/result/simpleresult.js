// Copyright 2012 The Closure Library Authors. All Rights Reserved.
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
 * @fileoverview A SimpleResult object that implements goog.result.Result.
 * See below for a more detailed description.
 */

goog.provide('goog.result.SimpleResult');
goog.provide('goog.result.SimpleResult.StateError');

goog.require('goog.Promise');
goog.require('goog.Thenable');
goog.require('goog.debug.Error');
goog.require('goog.result.Result');



/**
 * A SimpleResult object is a basic implementation of the
 * goog.result.Result interface. This could be subclassed(e.g. XHRResult)
 * or instantiated and returned by another class as a form of result. The caller
 * receiving the result could then attach handlers to be called when the result
 * is resolved(success or error).
 *
 * @constructor
 * @implements {goog.result.Result}
 * @deprecated Use {@link goog.Promise} instead - http://go/promisemigration
 */
goog.result.SimpleResult = function() {
  /**
   * The current state of this Result.
   * @type {goog.result.Result.State}
   * @private
   */
  this.state_ = goog.result.Result.State.PENDING;

  /**
   * The list of handlers to call when this Result is resolved.
   * @type {!Array.<!goog.result.SimpleResult.HandlerEntry_>}
   * @private
   */
  this.handlers_ = [];

  // The value_ and error_ properties are initialized in the constructor to
  // ensure that all SimpleResult instances share the same hidden class in
  // modern JavaScript engines.

  /**
   * The 'value' of this Result.
   * @type {*}
   * @private
   */
  this.value_ = undefined;

  /**
   * The error slug for this Result.
   * @type {*}
   * @private
   */
  this.error_ = undefined;
};
goog.Thenable.addImplementation(goog.result.SimpleResult);


/**
 * A waiting handler entry.
 * @typedef {{
 *   callback: !function(goog.result.SimpleResult),
 *   scope: Object
 * }}
 * @private
 */
goog.result.SimpleResult.HandlerEntry_;



/**
 * Error thrown if there is an attempt to set the value or error for this result
 * more than once.
 *
 * @constructor
 * @extends {goog.debug.Error}
 * @final
 * @deprecated Use {@link goog.Promise} instead - http://go/promisemigration
 */
goog.result.SimpleResult.StateError = function() {
  goog.result.SimpleResult.StateError.base(this, 'constructor',
      'Multiple attempts to set the state of this Result');
};
goog.inherits(goog.result.SimpleResult.StateError, goog.debug.Error);


/** @override */
goog.result.SimpleResult.prototype.getState = function() {
  return this.state_;
};


/** @override */
goog.result.SimpleResult.prototype.getValue = function() {
  return this.value_;
};


/** @override */
goog.result.SimpleResult.prototype.getError = function() {
  return this.error_;
};


/**
 * Attaches handlers to be called when the value of this Result is available.
 *
 * @param {!function(this:T, !goog.result.SimpleResult)} handler The function
 *     called when the value is available. The function is passed the Result
 *     object as the only argument.
 * @param {T=} opt_scope Optional scope for the handler.
 * @template T
 * @override
 */
goog.result.SimpleResult.prototype.wait = function(handler, opt_scope) {
  if (this.isPending_()) {
    this.handlers_.push({
      callback: handler,
      scope: opt_scope || null
    });
  } else {
    handler.call(opt_scope, this);
  }
};


/**
 * Sets the value of this Result, changing the state.
 *
 * @param {*} value The value to set for this Result.
 */
goog.result.SimpleResult.prototype.setValue = function(value) {
  if (this.isPending_()) {
    this.value_ = value;
    this.state_ = goog.result.Result.State.SUCCESS;
    this.callHandlers_();
  } else if (!this.isCanceled()) {
    // setValue is a no-op if this Result has been canceled.
    throw new goog.result.SimpleResult.StateError();
  }
};


/**
 * Sets the Result to be an error Result.
 *
 * @param {*=} opt_error Optional error slug to set for this Result.
 */
goog.result.SimpleResult.prototype.setError = function(opt_error) {
  if (this.isPending_()) {
    this.error_ = opt_error;
    this.state_ = goog.result.Result.State.ERROR;
    this.callHandlers_();
  } else if (!this.isCanceled()) {
    // setError is a no-op if this Result has been canceled.
    throw new goog.result.SimpleResult.StateError();
  }
};


/**
 * Calls the handlers registered for this Result.
 *
 * @private
 */
goog.result.SimpleResult.prototype.callHandlers_ = function() {
  var handlers = this.handlers_;
  this.handlers_ = [];
  for (var n = 0; n < handlers.length; n++) {
    var handlerEntry = handlers[n];
    handlerEntry.callback.call(handlerEntry.scope, this);
  }
};


/**
 * @return {boolean} Whether the Result is pending.
 * @private
 */
goog.result.SimpleResult.prototype.isPending_ = function() {
  return this.state_ == goog.result.Result.State.PENDING;
};


/**
 * Cancels the Result.
 *
 * @return {boolean} Whether the result was canceled. It will not be canceled if
 *    the result was already canceled or has already resolved.
 * @override
 */
goog.result.SimpleResult.prototype.cancel = function() {
  // cancel is a no-op if the result has been resolved.
  if (this.isPending_()) {
    this.setError(new goog.result.Result.CancelError());
    return true;
  }
  return false;
};


/** @override */
goog.result.SimpleResult.prototype.isCanceled = function() {
  return this.state_ == goog.result.Result.State.ERROR &&
         this.error_ instanceof goog.result.Result.CancelError;
};


/** @override */
goog.result.SimpleResult.prototype.then = function(
    opt_onFulfilled, opt_onRejected, opt_context) {
  var resolve, reject;
  // Copy the resolvers to outer scope, so that they are available
  // when the callback to wait() fires (which may be synchronous).
  var promise = new goog.Promise(function(res, rej) {
    resolve = res;
    reject = rej;
  });
  this.wait(function(result) {
    if (result.isCanceled()) {
      promise.cancel();
    } else if (result.getState() == goog.result.Result.State.SUCCESS) {
      resolve(result.getValue());
    } else if (result.getState() == goog.result.Result.State.ERROR) {
      reject(result.getError());
    }
  });
  return promise.then(opt_onFulfilled, opt_onRejected, opt_context);
};


/**
 * Creates a SimpleResult that fires when the given promise resolves.
 * Use only during migration to Promises.
 * @param {!goog.Promise.<?>} promise
 * @return {!goog.result.Result}
 */
goog.result.SimpleResult.fromPromise = function(promise) {
  var result = new goog.result.SimpleResult();
  promise.then(result.setValue, result.setError, result);
  return result;
};
