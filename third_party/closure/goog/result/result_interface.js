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
 */

goog.provide('goog.result.Result');

goog.require('goog.debug.Error');



/**
 * A Result object represents a value returned by an asynchronous
 * operation at some point in the future (e.g. a network fetch). This is akin
 * to a 'Promise' or a 'Future' in other languages and frameworks.
 *
 * @interface
 */
goog.result.Result = function() {};


/**
 * Attaches handlers to be called when the value of this Result is available.
 *
 * @param {!function(!goog.result.Result)} handler The function called when
 *     the value is available. The function is passed the Result object as the
 *     only argument.
 */
goog.result.Result.prototype.wait = function(handler) {};


/**
 * The States this object can be in.
 *
 * @enum {string}
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
 * @param {string=} opt_msg The error message for CancelError.
 * @extends {goog.debug.Error}
 */
goog.result.Result.CancelError = function(opt_msg) {
  var msg = opt_msg || 'Result canceled';
  goog.base(this, msg);
};
goog.inherits(goog.result.Result.CancelError, goog.debug.Error);
