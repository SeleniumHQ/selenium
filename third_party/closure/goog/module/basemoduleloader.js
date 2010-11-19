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
 * @fileoverview The base class for module loading.
 *
 */

goog.provide('goog.module.BaseModuleLoader');

goog.require('goog.Disposable');
goog.require('goog.debug.Logger');
goog.require('goog.module.AbstractModuleLoader');



/**
 * A class that loads Javascript modules.
 * @constructor
 * @extends {goog.Disposable}
 * @implements {goog.module.AbstractModuleLoader}
 */
goog.module.BaseModuleLoader = function() {
  goog.Disposable.call(this);
};
goog.inherits(goog.module.BaseModuleLoader, goog.Disposable);


/**
 * A logger.
 * @type {goog.debug.Logger}
 * @protected
 */
goog.module.BaseModuleLoader.prototype.logger = goog.debug.Logger.getLogger(
    'goog.module.BaseModuleLoader');


/**
 * Whether debug mode is enabled.
 * @type {boolean}
 * @private
 */
goog.module.BaseModuleLoader.prototype.debugMode_ = false;


/**
 * The postfix to check for in code received from the server before it is
 * evaluated on the client.
 * @type {?string}
 * @private
 */
goog.module.BaseModuleLoader.prototype.codePostfix_ = null;


/**
 * Gets the debug mode for the loader.
 * @return {boolean} debugMode Whether the debug mode is enabled.
 */
goog.module.BaseModuleLoader.prototype.getDebugMode = function() {
  return this.debugMode_;
};


/**
 * Sets the debug mode for the loader.
 * @param {boolean} debugMode Whether the debug mode is enabled.
 */
goog.module.BaseModuleLoader.prototype.setDebugMode = function(debugMode) {
  this.debugMode_ = debugMode;
};


/**
 * Set the postfix to check for when we receive code from the server.
 * @param {string} codePostfix The postfix.
 */
goog.module.BaseModuleLoader.prototype.setCodePostfix = function(
    codePostfix) {
  this.codePostfix_ = codePostfix;
};


/** @inheritDoc */
goog.module.BaseModuleLoader.prototype.loadModules = function(
    ids, moduleInfoMap, opt_successFn, opt_errorFn, opt_timeoutFn,
    opt_forceReload) {
  this.loadModulesInternal(ids, moduleInfoMap, opt_successFn, opt_errorFn,
      opt_timeoutFn, opt_forceReload);
};


/**
 * Loads a list of JavaScript modules.
 * @param {Array.<string>} ids The module ids in dependency order.
 * @param {Object} moduleInfoMap A mapping from module id to ModuleInfo object.
 * @param {?function()=} opt_successFn The callback if module loading is a
 *     success.
 * @param {?function(number)=} opt_errorFn The callback if module loading is in
 *     error.
 * @param {?function()=} opt_timeoutFn The callback if module loading times out.
 * @param {boolean=} opt_forceReload Whether to bypass cache while loading the
 *     module.
 * @protected
 */
goog.module.BaseModuleLoader.prototype.loadModulesInternal = function(
    ids, moduleInfoMap, opt_successFn, opt_errorFn, opt_timeoutFn,
    opt_forceReload) {
  // Should be overridden by the derived class.
};


/**
 * Evaluate the JS code.
 * @param {Array.<string>} moduleIds The module ids.
 * @param {string} jsCode The JS code.
 * @return {boolean} Whether the JS code was evaluated successfully.
 */
goog.module.BaseModuleLoader.prototype.evaluateCode = function(
    moduleIds, jsCode) {
  var success = true;
  try {
    if (this.validateCodePostfix_(jsCode)) {
      goog.globalEval(jsCode);
    } else {
      success = false;
    }
  } catch (e) {
    success = false;
    // TODO(user): Consider throwing an exception here.
    this.logger.warning('Loaded incomplete code for module(s): ' +
        moduleIds, e);
  }

  return success;
};


/**
 * Handles a successful response to a request for one or more modules.
 * @param {string} jsCode the JS code.
 * @param {Array.<string>} moduleIds The ids of the modules requested.
 * @param {function()} successFn The callback for success.
 * @param {function(?number)} errorFn The callback for error.
 */
goog.module.BaseModuleLoader.prototype.handleRequestSuccess = function(
    jsCode, moduleIds, successFn, errorFn) {
  this.logger.info('Code loaded for module(s): ' + moduleIds);

  var success = this.evaluateCode(moduleIds, jsCode);
  if (!success) {
    this.handleRequestError(moduleIds, errorFn, null);
  } else if (success && successFn) {
    successFn();
  }
};


/**
 * Handles an error during a request for one or more modules.
 * @param {Array.<string>} moduleIds The ids of the modules requested.
 * @param {function(?number)} errorFn The function to call on failure.
 * @param {?number} status The response status.
 */
goog.module.BaseModuleLoader.prototype.handleRequestError = function(
    moduleIds, errorFn, status) {
  this.logger.warning('Request failed for module(s): ' + moduleIds);

  if (errorFn) {
    errorFn(status);
  }
};


/**
 * Handles a timeout during a request for one or more modules.
 * @param {Array.<string>} moduleIds The ids of the modules requested.
 * @param {function()} timeoutFn The function to call on timeout.
 */
goog.module.BaseModuleLoader.prototype.handleRequestTimeout = function(
    moduleIds, timeoutFn) {
  this.logger.warning('Request timed out for module(s): ' + moduleIds);

  if (timeoutFn) {
    timeoutFn();
  }
};


/**
 * Validate the js code received from the server.
 * @param {string} jsCode The JS code.
 * @return {boolean} TRUE iff the jsCode is valid.
 * @private
 */
goog.module.BaseModuleLoader.prototype.validateCodePostfix_ = function(
    jsCode) {
  return this.codePostfix_ ?
      goog.string.endsWith(jsCode, this.codePostfix_) : true;
};
