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
 * @fileoverview Defines an interface that represents a Result.
 *
 * NOTE: goog.result is soft deprecated - we expect to replace this and
 * {@link goog.async.Deferred} with {@link goog.Promise}.
 */

goog.provide('goog.result.Result');

goog.require('goog.Thenable');



/**
 * A Result object represents a value returned by an asynchronous
 * operation at some point in the future (e.g. a network fetch). This is akin
 * to a 'Promise' or a 'Future' in other languages and frameworks.
 *
 * @interface
 * @extends {goog.Thenable}
 * @deprecated Use {@link goog.Promise} instead - http://go/promisemigration
 */
goog.result.Result = function() {};


/**
 * Attaches handlers to be called when the value of this Result is available.
 * Handlers are called in the order they were added by wait.
 *
 * @param {function(this:T, !goog.result.Result)} handler The function called
 *     when the value is available. The function is passed the Result object as
 *     the only argument.
 * @param {T=} opt_scope Optional scope for the handler.
 * @template T
 */
goog.result.Result.prototype.wait = function(handler, opt_scope) {};


/**
 * The States this object can be in.
 *
 * @enum {string}
 * @deprecated Use {@link goog.Promise} instead - http://go/promisemigration
 */
goog.result.Result.State = {
  /** The operation was a success and the value is available. */
  SUCCESS: 'success',

  /** The operation resulted in an error. */
  ERROR: 'error',

  /** The operation is incomplete and the value is not yet available. */
  PENDING: 'pending'
};


/**
 * @return {!goog.result.Result.State} The state of this Result.
 */
goog.result.Result.prototype.getState = function() {};


/**
 * @return {*} The value of this Result. Will return undefined if the Result is
 *     pending or was an error.
 */
goog.result.Result.prototype.getValue = function() {};


/**
 * @return {*} The error slug for this Result. Will return undefined if the
 *     Result was a success, the error slug was not set, or if the Result is
 *     pending.
 */
goog.result.Result.prototype.getError = function() {};


/**
 * Cancels the current Result, invoking the canceler function, if set.
 *
 * @return {boolean} Whether the Result was canceled.
 */
goog.result.Result.prototype.cancel = function() {};


/**
 * @return {boolean} Whether this Result was canceled.
 */
goog.result.Result.prototype.isCanceled = function() {};



/**
 * The value to be passed to the error handlers invoked upon cancellation.
 * @constructor
 * @extends {Error}
 * @final
 * @deprecated Use {@link goog.Promise} instead - http://go/promisemigration
 */
goog.result.Result.CancelError = function() {
  // Note that this does not derive from goog.debug.Error in order to prevent
  // stack trace capture and reduce the amount of garbage generated during a
  // cancel() operation.
};
goog.inherits(goog.result.Result.CancelError, Error);
