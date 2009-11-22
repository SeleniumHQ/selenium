// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

// Copyright 2008 Google Inc. All Rights Reserved.

/**
 * @fileoverview Defines the goog.module.ModuleInfo class.
 *
 */

goog.provide('goog.module.ModuleInfo');
goog.provide('goog.module.ModuleInfo.Callback');

goog.require('goog.Disposable');
goog.require('goog.module.BaseModule');


/**
 * A ModuleInfo object is used by the ModuleManager to hold information about a
 * module of js code that may or may not yet be loaded into the environment.
 *
 * @param {Array.<string>} deps Ids of the modules that must be loaded before
 *     this one. The ids must be in dependency order (i.e. if the ith module
 *     depends on the jth module, then i > j).
 * @constructor
 * @extends {goog.Disposable}
 */
goog.module.ModuleInfo = function(deps) {
  goog.Disposable.call(this);

  /**
   * A list of the ids of the modules that must be loaded before this module.
   * @type {Array.<string>}
   * @private
   */
  this.deps_ = deps;

  /**
   * Callbacks to execute once this module is loaded.
   * @type {Array.<goog.module.ModuleInfo.Callback>}
   * @private
   */
  this.onloadCallbacks_ = [];

  /**
   * Callbacks to execute if the module load errors.
   * @type {Array.<goog.module.ModuleInfo.Callback>}
   * @private
   */
  this.onErrorCallbacks_ = [];

  /**
   * Early callbacks to execute once this module is loaded. Called after
   * module initialization but before regular onload callbacks.
   * @type {Array.<goog.module.ModuleInfo.Callback>}
   * @private
   */
  this.earlyOnloadCallbacks_ = [];
};
goog.inherits(goog.module.ModuleInfo, goog.Disposable);


/**
 * The uris that can be used to retrieve this module's code.
 * @type {Array.<string>?}
 * @private
 */
goog.module.ModuleInfo.prototype.uris_ = null;


/**
 * The constructor to use to instantiate the module object after the module
 * code is loaded. This must be either goog.module.BaseModule or a subclass of
 * it.
 * @type {Function}
 * @private
 */
goog.module.ModuleInfo.prototype.moduleConstructor_ = goog.module.BaseModule;


/**
 * The module object. This will be null until the module is loaded.
 * @type {goog.module.BaseModule?}
 * @private
 */
goog.module.ModuleInfo.prototype.module_ = null;


/**
 * Gets the dependencies of this module.
 * @return {Array.<string>} The ids of the modules that this module depends on.
 */
goog.module.ModuleInfo.prototype.getDependencies = function() {
  return this.deps_;
};


/**
 * Sets the uris of this module.
 * @param {Array.<string>} uris Uris for this module's code.
 */
goog.module.ModuleInfo.prototype.setUris = function(uris) {
  this.uris_ = uris;
};


/**
 * Gets the uris of this module.
 * @return {Array.<string>?} Uris for this module's code.
 */
goog.module.ModuleInfo.prototype.getUris = function() {
  return this.uris_;
};


/**
 * Sets the constructor to use to instantiate the module object after the
 * module code is loaded.
 * @param {Function} constructor The constructor of a goog.module.BaseModule
 *     subclass.
 */
goog.module.ModuleInfo.prototype.setModuleConstructor = function(
    constructor) {
  this.moduleConstructor_ = constructor;
};


/**
 * Registers a function that should be called after the module is loaded. These
 * early callbacks are called after {@link Module#initialize} is called but
 * before the other callbacks are called.
 * @param {Function} fn A callback function that takes a single argument which
 *    is the module context.
 * @param {Object} opt_handler Optional handler under whose scope to execute
 *     the callback.
 * @return {goog.module.ModuleInfo.Callback} Reference to the callback
 *     object.
 */
goog.module.ModuleInfo.prototype.registerEarlyCallback = function(
    fn, opt_handler) {
  return this.registerCallback_(this.earlyOnloadCallbacks_, fn, opt_handler);
};


/**
 * Registers a function that should be called after the module is loaded.
 * @param {Function} fn A callback function that takes a single argument which
 *    is the module context.
 * @param {Object} opt_handler Optional handler under whose scope to execute
 *     the callback.
 * @return {goog.module.ModuleInfo.Callback} Reference to the callback
 *     object.
 */
goog.module.ModuleInfo.prototype.registerCallback = function(
    fn, opt_handler) {
  return this.registerCallback_(this.onloadCallbacks_, fn, opt_handler);
};


/**
 * Registers a function that should be called if the module load fails.
 * @param {Function} fn A callback function that takes a single argument which
 *    is the module context.
 * @param {Object} opt_handler Optional handler under whose scope to execute
 *     the callback.
 * @return {goog.module.ModuleInfo.Callback} Reference to the callback
 *     object.
 */
goog.module.ModuleInfo.prototype.registerErrback = function(
    fn, opt_handler) {
  return this.registerCallback_(this.onErrorCallbacks_, fn, opt_handler);
};


/**
 * Registers a function that should be called after the module is loaded.
 * @param {Array.<goog.module.ModuleInfo.Callback>} callbacks The array to
 *     add the callback to.
 * @param {Function} fn A callback function that takes a single argument which
 *     is the module context.
 * @param {Object} opt_handler Optional handler under whose scope to execute
 *     the callback.
 * @return {goog.module.ModuleInfo.Callback} Reference to the callback
 *     object.
 * @private
 */
goog.module.ModuleInfo.prototype.registerCallback_ = function(
    callbacks, fn, opt_handler) {
  var callback = new goog.module.ModuleInfo.Callback(fn, opt_handler);
  callbacks.push(callback);
  return callback;
};


/**
 * Determines whether the module has been loaded.
 * @return {boolean} Whether the module has been loaded.
 */
goog.module.ModuleInfo.prototype.isLoaded = function() {
  return !!this.module_;
};


/**
 * Gets the module.
 * @return {goog.module.BaseModule?} The module if it has been loaded.
 *     Otherwise, null.
 */
goog.module.ModuleInfo.prototype.getModule = function() {
  return this.module_;
};


/**
 * Sets this module as loaded.
 * @param {function() : Object} contextProvider A function that provides the
 *     module context.
 */
goog.module.ModuleInfo.prototype.onLoad = function(contextProvider) {
  // Instantiate and initialize the module object.
  var module = new this.moduleConstructor_;
  module.initialize(contextProvider());

  // Keep an internal reference to the module.
  this.module_ = module;

  // Fire any early callbacks that were waiting for the module to be loaded.
  this.callCallbacks_(this.earlyOnloadCallbacks_, contextProvider());

  // Fire any callbacks that were waiting for the module to be loaded.
  this.callCallbacks_(this.onloadCallbacks_, contextProvider());

  // Clear the errbacks.
  this.onErrorCallbacks_.length = 0;
};


/**
 * Calls the error callbacks for the module.
 * @param {goog.module.ModuleManager.FailureType} cause What caused the error.
 */
goog.module.ModuleInfo.prototype.onError = function(cause) {
  this.callCallbacks_(this.onErrorCallbacks_, cause);
  this.earlyOnloadCallbacks_.length = 0;
  this.onloadCallbacks_.length = 0;
};

/**
 * Helper to call the callbacks after module load.
 * @param {Array.<goog.module.ModuleInfo.Callback>} callbacks The callbacks
 *     to call and then clear.
 * @param {Object} context The module context.
 * @private
 */
goog.module.ModuleInfo.prototype.callCallbacks_ = function(callbacks, context) {
  // Call each callback in the order they were registered
  for (var i = 0; i < callbacks.length; i++) {
    callbacks[i].execute(context);
  }

  // Clear the list of callbacks.
  callbacks.length = 0;
};


/** @inheritDoc */
goog.module.ModuleInfo.prototype.disposeInternal = function() {
  goog.module.ModuleInfo.superClass_.disposeInternal.call(this);

  if (this.module_) {
    this.module_.dispose();
  }
};


/**
 * Class used to encapsulate the callbacks to be called when a module loads.
 * @param {Function} fn Callback function.
 * @param {Object} opt_handler Optional handler under whose scope to execute
 *     the callback.
 * @constructor
 */
goog.module.ModuleInfo.Callback = function(fn, opt_handler) {
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
 * Completes the operation and calls the callback function if appropriate.
 * @param {Object} context The module context.
 */
goog.module.ModuleInfo.Callback.prototype.execute = function(context) {
  if (this.fn_) {
    this.fn_.call(this.handler_ || null, context);
    this.handler_ = null;
    this.fn_ = null;
  }
};


/**
 * Abort the callback, but not the actual module load.
 */
goog.module.ModuleInfo.Callback.prototype.abort = function() {
  this.fn_ = null;
  this.handler_ = null;
};
