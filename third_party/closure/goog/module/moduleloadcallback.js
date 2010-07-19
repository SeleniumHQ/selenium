// Copyright 2008 The Closure Library Authors. All Rights Reserved.
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
 * @fileoverview A simple callback mechanism for notification about module
 * loads. Should be considered package-private to goog.module.
 *
*
*
*
*
 */

goog.provide('goog.module.ModuleLoadCallback');

goog.require('goog.debug.errorHandlerWeakDep');


/**
 * Class used to encapsulate the callbacks to be called when a module loads.
 * @param {Function} fn Callback function.
 * @param {Object=} opt_handler Optional handler under whose scope to execute
 *     the callback.
 * @constructor
 */
goog.module.ModuleLoadCallback = function(fn, opt_handler) {
  /**
   * Callback function.
   * @type {Function}
   * @private
   */
  this.fn_ = fn;

  /**
   * Optional handler under whose scope to execute the callback.
   * @type {Object|undefined}
   * @private
   */
  this.handler_ = opt_handler;
};


/**
 * Installs exception protection for the module callback entry point using the
 * given error handler. The error handler will receive exceptions that happen
 * during the module load sequence.
 *
 * @param {goog.debug.ErrorHandler} errorHandler Error handler with which to
 *     protect the entry point.
 * @param {boolean=} opt_tracers Whether to install tracers around the browser
 *     event entry point.
 */
goog.module.ModuleLoadCallback.protectModuleLoadSequence = function(
    errorHandler, opt_tracers) {
  // NOTE(nicksantos): I do like being able to protect different entry
  // points with different error handlers (so, in this case, goog.module
  // goog.events and goog.net all have different functions for registering
  // a protector). But in practice, i'm not sure if people are actually
  // using the functionality. It might be better to have a global registry
  // for all entry points that need to be protected.
  goog.module.ModuleLoadCallback.prototype.execute =
      errorHandler.protectEntryPoint(
          goog.module.ModuleLoadCallback.prototype.execute, opt_tracers);
};


/**
 * Completes the operation and calls the callback function if appropriate.
 * @param {*} context The module context.
 */
goog.module.ModuleLoadCallback.prototype.execute = function(context) {
  if (this.fn_) {
    this.fn_.call(this.handler_ || null, context);
    this.handler_ = null;
    this.fn_ = null;
  }
};


/**
 * Abort the callback, but not the actual module load.
 */
goog.module.ModuleLoadCallback.prototype.abort = function() {
  this.fn_ = null;
  this.handler_ = null;
};
