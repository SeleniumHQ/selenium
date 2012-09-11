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
 * @fileoverview The module loader for loading modules across the network.
 *
 * Browsers do not guarantee that scripts appended to the document
 * are executed in the order they are added. For production mode, we use
 * XHRs to load scripts, because they do not have this problem and they
 * have superior mechanisms for handling failure. However, XHR-evaled
 * scripts are harder to debug.
 *
 * In debugging mode, we use normal script tags. In order to make this work,
 * we load the scripts in serial: we do not execute script B to the document
 * until we are certain that script A is finished loading.
 *
 */

goog.provide('goog.module.ModuleLoader');

goog.require('goog.Timer');
goog.require('goog.array');
goog.require('goog.debug.Logger');
goog.require('goog.events');
goog.require('goog.events.Event');
goog.require('goog.events.EventHandler');
goog.require('goog.events.EventTarget');
goog.require('goog.module.AbstractModuleLoader');
goog.require('goog.net.BulkLoader');
goog.require('goog.net.EventType');
goog.require('goog.net.jsloader');



/**
 * A class that loads Javascript modules.
 * @constructor
 * @extends {goog.events.EventTarget}
 * @implements {goog.module.AbstractModuleLoader}
 */
goog.module.ModuleLoader = function() {
  goog.base(this);

  /**
   * Event handler for managing handling events.
   * @type {goog.events.EventHandler}
   * @private
   */
  this.eventHandler_ = new goog.events.EventHandler(this);

  /**
   * A map from module IDs to goog.module.ModuleLoader.LoadStatus.
   * @type {!Object.<Array.<string>, goog.module.ModuleLoader.LoadStatus>}
   * @private
   */
  this.loadingModulesStatus_ = {};
};
goog.inherits(goog.module.ModuleLoader, goog.events.EventTarget);


/**
 * A logger.
 * @type {goog.debug.Logger}
 * @protected
 */
goog.module.ModuleLoader.prototype.logger = goog.debug.Logger.getLogger(
    'goog.module.ModuleLoader');


/**
 * Whether debug mode is enabled.
 * @type {boolean}
 * @private
 */
goog.module.ModuleLoader.prototype.debugMode_ = false;


/**
 * Whether source url injection is enabled.
 * @type {boolean}
 * @private
 */
goog.module.ModuleLoader.prototype.sourceUrlInjection_ = false;


/**
 * Gets the debug mode for the loader.
 * @return {boolean} debugMode Whether the debug mode is enabled.
 */
goog.module.ModuleLoader.prototype.getDebugMode = function() {
  return this.debugMode_;
};


/**
 * Sets the debug mode for the loader.
 * @param {boolean} debugMode Whether the debug mode is enabled.
 */
goog.module.ModuleLoader.prototype.setDebugMode = function(debugMode) {
  this.debugMode_ = debugMode;
};


/**
 * When enabled, we will add a sourceURL comment to the end of all scripts
 * to mark their origin.
 *
 * Notice that in most cases, this is far superior to debug mode, because
 * the scripts will load faster on most browsers. (Debug mode is very slow.
 * See the comment at the top of this file.)
 *
 * On WebKit, stack traces will refect the sourceURL comment, so this is also
 * useful for debugging webkit stack traces in production.
 *
 * There is some performance overhead to doing this.
 *
 * TODO(nicksantos): Measure the performance cost, and figure out a decision
 * tree for when users should turn this on. I'm not sure if most users are
 * sophisticated enough to know whether they want this or not, because
 * there are a couple different trade-offs involved. We might want to make
 * debug mode do this on browsers that support sourceURL.
 *
 * @param {boolean} enabled Whether source url injection is enabled.
 * @see http://bugzilla.mozilla.org/show_bug.cgi?id=583083
 */
goog.module.ModuleLoader.prototype.setSourceUrlInjection = function(enabled) {
  this.sourceUrlInjection_ = enabled;
};


/** @return {boolean} Whether we're using source url injection. */
goog.module.ModuleLoader.prototype.usingSourceUrlInjection = function() {
  return this.sourceUrlInjection_;
};


/** @override */
goog.module.ModuleLoader.prototype.loadModules = function(
    ids, moduleInfoMap, opt_successFn, opt_errorFn, opt_timeoutFn,
    opt_forceReload) {
  var loadStatus = this.loadingModulesStatus_[ids] ||
      new goog.module.ModuleLoader.LoadStatus();
  loadStatus.loadRequested = true;
  loadStatus.successFn = opt_successFn || null;
  loadStatus.errorFn = opt_errorFn || null;

  if (!this.loadingModulesStatus_[ids]) {
    // Modules were not prefetched.
    this.loadingModulesStatus_[ids] = loadStatus;
    this.downloadModules_(ids, moduleInfoMap);
    // TODO(user): Need to handle timeouts in the module loading code.
  } else if (goog.isDefAndNotNull(loadStatus.responseTexts)) {
    // Modules prefetch is complete.
    this.evaluateCode_(ids);
  }
  // Otherwise modules prefetch is in progress, and these modules will be
  // executed after the prefetch is complete.
};


/**
 * Evaluate the JS code.
 * @param {Array.<string>} moduleIds The module ids.
 * @private
 */
goog.module.ModuleLoader.prototype.evaluateCode_ = function(moduleIds) {
  this.dispatchEvent(new goog.module.ModuleLoader.Event(
      goog.module.ModuleLoader.EventType.REQUEST_SUCCESS, moduleIds));

  this.logger.info('evaluateCode ids:' + moduleIds);
  var success = true;
  var loadStatus = this.loadingModulesStatus_[moduleIds];
  var uris = loadStatus.requestUris;
  var texts = loadStatus.responseTexts;
  try {
    if (this.usingSourceUrlInjection()) {
      for (var i = 0; i < uris.length; i++) {
        var uri = uris[i];
        goog.globalEval(texts[i] + ' //@ sourceURL=' + uri);
      }
    } else {
      goog.globalEval(texts.join('\n'));
    }
  } catch (e) {
    success = false;
    // TODO(user): Consider throwing an exception here.
    this.logger.warning('Loaded incomplete code for module(s): ' +
        moduleIds, e);
  }

  this.dispatchEvent(
      new goog.module.ModuleLoader.Event(
          goog.module.ModuleLoader.EventType.EVALUATE_CODE, moduleIds));

  if (!success) {
    this.handleErrorHelper_(moduleIds, loadStatus.errorFn, null /* status */);
  } else if (loadStatus.successFn) {
    loadStatus.successFn();
  }
  delete this.loadingModulesStatus_[moduleIds];
};


/**
 * Handles a successful response to a request for prefetch or load one or more
 * modules.
 *
 * @param {goog.net.BulkLoader} bulkLoader The bulk loader.
 * @param {Array.<string>} moduleIds The ids of the modules requested.
 * @private
 */
goog.module.ModuleLoader.prototype.handleSuccess_ = function(
    bulkLoader, moduleIds) {
  this.logger.info('Code loaded for module(s): ' + moduleIds);

  var loadStatus = this.loadingModulesStatus_[moduleIds];
  loadStatus.responseTexts = bulkLoader.getResponseTexts();

  if (loadStatus.loadRequested) {
    this.evaluateCode_(moduleIds);
  }

  // NOTE: A bulk loader instance is used for loading a set of module ids.
  // Once these modules have been loaded successfully or in error the bulk
  // loader should be disposed as it is not needed anymore. A new bulk loader
  // is instantiated for any new modules to be loaded. The dispose is called
  // on a timer so that the bulkloader has a chance to release its
  // objects.
  goog.Timer.callOnce(bulkLoader.dispose, 5, bulkLoader);
};


/** @override */
goog.module.ModuleLoader.prototype.prefetchModule = function(
    id, moduleInfo) {
  // Do not prefetch in debug mode.
  if (this.getDebugMode()) {
    return;
  }
  var loadStatus = this.loadingModulesStatus_[[id]];
  if (loadStatus) {
    return;
  }

  var moduleInfoMap = {};
  moduleInfoMap[id] = moduleInfo;
  this.loadingModulesStatus_[[id]] = new goog.module.ModuleLoader.LoadStatus();
  this.downloadModules_([id], moduleInfoMap);
};


/**
 * Downloads a list of JavaScript modules.
 *
 * @param {Array.<string>} ids The module ids in dependency order.
 * @param {Object} moduleInfoMap A mapping from module id to ModuleInfo object.
 * @private
 */
goog.module.ModuleLoader.prototype.downloadModules_ = function(
    ids, moduleInfoMap) {
  var uris = [];
  for (var i = 0; i < ids.length; i++) {
    goog.array.extend(uris, moduleInfoMap[ids[i]].getUris());
  }
  this.logger.info('downloadModules ids:' + ids + ' uris:' + uris);

  if (this.getDebugMode()) {
    // In debug mode use <script> tags rather than XHRs to load the files.
    // This makes it possible to debug and inspect stack traces more easily.
    // It's also possible to use it to load JavaScript files that are hosted on
    // another domain.
    goog.net.jsloader.loadMany(uris);
  } else {
    var loadStatus = this.loadingModulesStatus_[ids];
    loadStatus.requestUris = uris;

    var bulkLoader = new goog.net.BulkLoader(uris);

    var eventHandler = this.eventHandler_;
    eventHandler.listen(
        bulkLoader,
        goog.net.EventType.SUCCESS,
        goog.bind(this.handleSuccess_, this, bulkLoader, ids),
        false,
        null);
    eventHandler.listen(
        bulkLoader,
        goog.net.EventType.ERROR,
        goog.bind(this.handleError_, this, bulkLoader, ids),
        false,
        null);
    bulkLoader.load();
  }
};


/**
 * Handles an error during a request for one or more modules.
 * @param {goog.net.BulkLoader} bulkLoader The bulk loader.
 * @param {Array.<string>} moduleIds The ids of the modules requested.
 * @param {number} status The response status.
 * @private
 */
goog.module.ModuleLoader.prototype.handleError_ = function(
    bulkLoader, moduleIds, status) {
  var loadStatus = this.loadingModulesStatus_[moduleIds];
  // The bulk loader doesn't cancel other requests when a request fails. We will
  // delete the loadStatus in the first failure, so it will be undefined in
  // subsequent errors.
  if (loadStatus) {
    delete this.loadingModulesStatus_[moduleIds];
    this.handleErrorHelper_(moduleIds, loadStatus.errorFn, status);
  }

  // NOTE: A bulk loader instance is used for loading a set of module ids. Once
  // these modules have been loaded successfully or in error the bulk loader
  // should be disposed as it is not needed anymore. A new bulk loader is
  // instantiated for any new modules to be loaded. The dispose is called
  // on another thread so that the bulkloader has a chance to release its
  // objects.
  goog.Timer.callOnce(bulkLoader.dispose, 5, bulkLoader);
};


/**
 * Handles an error during a request for one or more modules.
 * @param {Array.<string>} moduleIds The ids of the modules requested.
 * @param {?function(?number)} errorFn The function to call on failure.
 * @param {?number} status The response status.
 * @private
 */
goog.module.ModuleLoader.prototype.handleErrorHelper_ = function(
    moduleIds, errorFn, status) {
  this.dispatchEvent(
      new goog.module.ModuleLoader.Event(
          goog.module.ModuleLoader.EventType.REQUEST_ERROR, moduleIds));

  this.logger.warning('Request failed for module(s): ' + moduleIds);

  if (errorFn) {
    errorFn(status);
  }
};


/** @override */
goog.module.ModuleLoader.prototype.disposeInternal = function() {
  goog.module.ModuleLoader.superClass_.disposeInternal.call(this);

  this.eventHandler_.dispose();
  this.eventHandler_ = null;
};


/**
 * @enum {string}
 */
goog.module.ModuleLoader.EventType = {
  /** Called after the code for a module is evaluated. */
  EVALUATE_CODE: goog.events.getUniqueId('evaluateCode'),

  /** Called when the BulkLoader finishes successfully. */
  REQUEST_SUCCESS: goog.events.getUniqueId('requestSuccess'),

  /** Called when the BulkLoader fails, or code loading fails. */
  REQUEST_ERROR: goog.events.getUniqueId('requestError')
};



/**
 * @param {goog.module.ModuleLoader.EventType} type The type.
 * @param {Array.<string>} moduleIds The ids of the modules being evaluated.
 * @constructor
 * @extends {goog.events.Event}
 */
goog.module.ModuleLoader.Event = function(type, moduleIds) {
  goog.base(this, type);

  /**
   * @type {Array.<string>}
   */
  this.moduleIds = moduleIds;
};
goog.inherits(goog.module.ModuleLoader.Event, goog.events.Event);



/**
 * A class that keeps the state of the module during the loading process. It is
 * used to save loading information between modules download and evaluation.
 * @constructor
 */
goog.module.ModuleLoader.LoadStatus = function() {
  /**
   * The request uris.
   * @type {Array.<string>}
   */
  this.requestUris = null;

  /**
   * The response texts.
   * @type {Array.<string>}
   */
  this.responseTexts = null;

  /**
   * Whether loadModules was called for the set of modules referred by this
   * status.
   * @type {boolean}
   */
  this.loadRequested = false;

  /**
   * Success callback.
   * @type {?function()}
   */
  this.successFn = null;

  /**
   * Error callback.
   * @type {?function(?number)}
   */
  this.errorFn = null;
};
