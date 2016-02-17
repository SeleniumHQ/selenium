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
 * @fileoverview A singleton object for managing Javascript code modules.
 *
 */

goog.provide('goog.module.ModuleManager');
goog.provide('goog.module.ModuleManager.CallbackType');
goog.provide('goog.module.ModuleManager.FailureType');

goog.require('goog.Disposable');
goog.require('goog.array');
goog.require('goog.asserts');
goog.require('goog.async.Deferred');
goog.require('goog.debug.Trace');
/** @suppress {extraRequire} */
goog.require('goog.dispose');
goog.require('goog.log');
/** @suppress {extraRequire} */
goog.require('goog.module');
goog.require('goog.module.ModuleInfo');
goog.require('goog.module.ModuleLoadCallback');
goog.require('goog.object');



/**
 * The ModuleManager keeps track of all modules in the environment.
 * Since modules may not have their code loaded, we must keep track of them.
 * @constructor
 * @extends {goog.Disposable}
 * @struct
 */
goog.module.ModuleManager = function() {
  goog.module.ModuleManager.base(this, 'constructor');

  /**
   * A mapping from module id to ModuleInfo object.
   * @private {Object<string, !goog.module.ModuleInfo>}
   */
  this.moduleInfoMap_ = {};

  // TODO (malteubl): Switch this to a reentrant design.
  /**
   * The ids of the currently loading modules. If batch mode is disabled, then
   * this array will never contain more than one element at a time.
   * @type {Array<string>}
   * @private
   */
  this.loadingModuleIds_ = [];

  /**
   * The requested ids of the currently loading modules. This does not include
   * module dependencies that may also be loading.
   * @type {Array<string>}
   * @private
   */
  this.requestedLoadingModuleIds_ = [];

  // TODO(user): Make these and other arrays that are used as sets be
  // actual sets.
  /**
   * All module ids that have ever been requested. In concurrent loading these
   * are the ones to subtract from future requests.
   * @type {!Array<string>}
   * @private
   */
  this.requestedModuleIds_ = [];

  /**
   * A queue of the ids of requested but not-yet-loaded modules. The zero
   * position is the front of the queue. This is a 2-D array to group modules
   * together with other modules that should be batch loaded with them, if
   * batch loading is enabled.
   * @type {Array<Array<string>>}
   * @private
   */
  this.requestedModuleIdsQueue_ = [];

  /**
   * The ids of the currently loading modules which have been initiated by user
   * actions.
   * @type {Array<string>}
   * @private
   */
  this.userInitiatedLoadingModuleIds_ = [];

  /**
   * A map of callback types to the functions to call for the specified
   * callback type.
   * @type {Object<goog.module.ModuleManager.CallbackType, Array<Function>>}
   * @private
   */
  this.callbackMap_ = {};

  /**
   * Module info for the base module (the one that contains the module
   * manager code), which we set as the loading module so one can
   * register initialization callbacks in the base module.
   *
   * The base module is considered loaded when #setAllModuleInfo is called or
   * #setModuleContext is called, whichever comes first.
   *
   * @type {goog.module.ModuleInfo}
   * @private
   */
  this.baseModuleInfo_ = new goog.module.ModuleInfo([], '');

  /**
   * The module that is currently loading, or null if not loading anything.
   * @type {goog.module.ModuleInfo}
   * @private
   */
  this.currentlyLoadingModule_ = this.baseModuleInfo_;

  /**
   * The id of the last requested initial module. When it loaded
   * the deferred in {@code this.initialModulesLoaded_} resolves.
   * @private {?string}
   */
  this.lastInitialModuleId_ = null;

  /**
   * Deferred for when all initial modules have loaded. We currently block
   * sending additional module requests until this deferred resolves. In a
   * future optimization it may be possible to use the initial modules as
   * seeds for the module loader "requested module ids" and start making new
   * requests even sooner.
   * @private {!goog.async.Deferred}
   */
  this.initialModulesLoaded_ = new goog.async.Deferred();

  /**
   * A logger.
   * @private {goog.log.Logger}
   */
  this.logger_ = goog.log.getLogger('goog.module.ModuleManager');

  /**
   * Whether the batch mode (i.e. the loading of multiple modules with just one
   * request) has been enabled.
   * @private {boolean}
   */
  this.batchModeEnabled_ = false;

  /**
   * Whether the module requests may be sent out of order.
   * @private {boolean}
   */
  this.concurrentLoadingEnabled_ = false;

  /**
   * A loader for the modules that implements loadModules(ids, moduleInfoMap,
   * opt_successFn, opt_errorFn, opt_timeoutFn, opt_forceReload) method.
   * @private {goog.module.AbstractModuleLoader}
   */
  this.loader_ = null;

  // TODO(user): Remove tracer.
  /**
   * Tracer that measures how long it takes to load a module.
   * @private {?number}
   */
  this.loadTracer_ = null;

  /**
   * The number of consecutive failures that have happened upon module load
   * requests.
   * @private {number}
   */
  this.consecutiveFailures_ = 0;

  /**
   * Determines if the module manager was just active before the processing of
   * the last data.
   * @private {boolean}
   */
  this.lastActive_ = false;

  /**
   * Determines if the module manager was just user active before the processing
   * of the last data. The module manager is user active if any of the
   * user-initiated modules are loading or queued up to load.
   * @private {boolean}
   */
  this.userLastActive_ = false;

  /**
   * The module context needed for module initialization.
   * @private {Object}
   */
  this.moduleContext_ = null;
};
goog.inherits(goog.module.ModuleManager, goog.Disposable);
goog.addSingletonGetter(goog.module.ModuleManager);


/**
* The type of callbacks that can be registered with the module manager,.
* @enum {string}
*/
goog.module.ModuleManager.CallbackType = {
  /**
   * Fired when an error has occurred.
   */
  ERROR: 'error',

  /**
   * Fired when it becomes idle and has no more module loads to process.
   */
  IDLE: 'idle',

  /**
   * Fired when it becomes active and has module loads to process.
   */
  ACTIVE: 'active',

  /**
   * Fired when it becomes idle and has no more user-initiated module loads to
   * process.
   */
  USER_IDLE: 'userIdle',

  /**
   * Fired when it becomes active and has user-initiated module loads to
   * process.
   */
  USER_ACTIVE: 'userActive'
};


/**
 * A non-HTTP status code indicating a corruption in loaded module.
 * This should be used by a ModuleLoader as a replacement for the HTTP code
 * given to the error handler function to indicated that the module was
 * corrupted.
 * This will set the forceReload flag on the loadModules method when retrying
 * module loading.
 * @type {number}
 */
goog.module.ModuleManager.CORRUPT_RESPONSE_STATUS_CODE = 8001;


/**
 * Sets the batch mode as enabled or disabled for the module manager.
 * @param {boolean} enabled Whether the batch mode is to be enabled or not.
 */
goog.module.ModuleManager.prototype.setBatchModeEnabled = function(enabled) {
  this.batchModeEnabled_ = enabled;
};


/**
 * Sets the concurrent loading mode as enabled or disabled for the module
 * manager. Requires a moduleloader implementation that supports concurrent
 * loads. The default {@see goog.module.ModuleLoader} does not.
 * @param {boolean} enabled
 */
goog.module.ModuleManager.prototype.setConcurrentLoadingEnabled = function(
    enabled) {
  this.concurrentLoadingEnabled_ = enabled;
};


/**
 * Sets the module info for all modules. Should only be called once.
 *
 * @param {Object<Array<string>>} infoMap An object that contains a mapping
 *    from module id (String) to list of required module ids (Array).
 */
goog.module.ModuleManager.prototype.setAllModuleInfo = function(infoMap) {
  for (var id in infoMap) {
    this.moduleInfoMap_[id] = new goog.module.ModuleInfo(infoMap[id], id);
  }
  if (!this.initialModulesLoaded_.hasFired()) {
    this.initialModulesLoaded_.callback();
  }
  this.maybeFinishBaseLoad_();
};


/**
 * Sets the module info for all modules. Should only be called once. Also
 * marks modules that are currently being loaded.
 *
 * @param {string=} opt_info A string representation of the module dependency
 *      graph, in the form: module1:dep1,dep2/module2:dep1,dep2 etc.
 *     Where depX is the base-36 encoded position of the dep in the module list.
 * @param {Array<string>=} opt_loadingModuleIds A list of moduleIds that
 *     are currently being loaded.
 */
goog.module.ModuleManager.prototype.setAllModuleInfoString = function(
    opt_info, opt_loadingModuleIds) {
  if (!goog.isString(opt_info)) {
    // The call to this method is generated in two steps, the argument is added
    // after some of the compilation passes.  This means that the initial code
    // doesn't have any arguments and causes compiler errors.  We make it
    // optional to satisfy this constraint.
    return;
  }

  var modules = opt_info.split('/');
  var moduleIds = [];

  // Split the string into the infoMap of id->deps
  for (var i = 0; i < modules.length; i++) {
    var parts = modules[i].split(':');
    var id = parts[0];
    var deps;
    if (parts[1]) {
      deps = parts[1].split(',');
      for (var j = 0; j < deps.length; j++) {
        var index = parseInt(deps[j], 36);
        goog.asserts.assert(
            moduleIds[index], 'No module @ %s, dep of %s @ %s', index, id, i);
        deps[j] = moduleIds[index];
      }
    } else {
      deps = [];
    }
    moduleIds.push(id);
    this.moduleInfoMap_[id] = new goog.module.ModuleInfo(deps, id);
  }
  if (opt_loadingModuleIds && opt_loadingModuleIds.length) {
    goog.array.extend(this.loadingModuleIds_, opt_loadingModuleIds);
    // The last module in the list of initial modules. When it has loaded all
    // initial modules have loaded.
    this.lastInitialModuleId_ =
        /** @type {?string}  */ (goog.array.peek(opt_loadingModuleIds));
  } else {
    if (!this.initialModulesLoaded_.hasFired()) {
      this.initialModulesLoaded_.callback();
    }
  }
  this.maybeFinishBaseLoad_();
};


/**
 * Gets a module info object by id.
 * @param {string} id A module identifier.
 * @return {!goog.module.ModuleInfo} The module info.
 */
goog.module.ModuleManager.prototype.getModuleInfo = function(id) {
  return this.moduleInfoMap_[id];
};


/**
 * Sets the module uris.
 *
 * @param {Object} moduleUriMap The map of id/uris pairs for each module.
 */
goog.module.ModuleManager.prototype.setModuleUris = function(moduleUriMap) {
  for (var id in moduleUriMap) {
    this.moduleInfoMap_[id].setUris(moduleUriMap[id]);
  }
};


/**
 * Gets the application-specific module loader.
 * @return {goog.module.AbstractModuleLoader} An object that has a
 *     loadModules(ids, moduleInfoMap, opt_successFn, opt_errFn,
 *         opt_timeoutFn, opt_forceReload) method.
 */
goog.module.ModuleManager.prototype.getLoader = function() {
  return this.loader_;
};


/**
 * Sets the application-specific module loader.
 * @param {goog.module.AbstractModuleLoader} loader An object that has a
 *     loadModules(ids, moduleInfoMap, opt_successFn, opt_errFn,
 *         opt_timeoutFn, opt_forceReload) method.
 */
goog.module.ModuleManager.prototype.setLoader = function(loader) {
  this.loader_ = loader;
};


/**
 * Gets the module context to use to initialize the module.
 * @return {Object} The context.
 */
goog.module.ModuleManager.prototype.getModuleContext = function() {
  return this.moduleContext_;
};


/**
 * Sets the module context to use to initialize the module.
 * @param {Object} context The context.
 */
goog.module.ModuleManager.prototype.setModuleContext = function(context) {
  this.moduleContext_ = context;
  this.maybeFinishBaseLoad_();
};


/**
 * Determines if the ModuleManager is active
 * @return {boolean} TRUE iff the ModuleManager is active (i.e., not idle).
 */
goog.module.ModuleManager.prototype.isActive = function() {
  return this.loadingModuleIds_.length > 0;
};


/**
 * Determines if the ModuleManager is user active
 * @return {boolean} TRUE iff the ModuleManager is user active (i.e., not idle).
 */
goog.module.ModuleManager.prototype.isUserActive = function() {
  return this.userInitiatedLoadingModuleIds_.length > 0;
};


/**
 * Dispatches an ACTIVE or IDLE event if necessary.
 * @private
 */
goog.module.ModuleManager.prototype.dispatchActiveIdleChangeIfNeeded_ =
    function() {
  var lastActive = this.lastActive_;
  var active = this.isActive();
  if (active != lastActive) {
    this.executeCallbacks_(
        active ? goog.module.ModuleManager.CallbackType.ACTIVE :
                 goog.module.ModuleManager.CallbackType.IDLE);

    // Flip the last active value.
    this.lastActive_ = active;
  }

  // Check if the module manager is user active i.e., there are user initiated
  // modules being loaded or queued up to be loaded.
  var userLastActive = this.userLastActive_;
  var userActive = this.isUserActive();
  if (userActive != userLastActive) {
    this.executeCallbacks_(
        userActive ? goog.module.ModuleManager.CallbackType.USER_ACTIVE :
                     goog.module.ModuleManager.CallbackType.USER_IDLE);

    // Flip the last user active value.
    this.userLastActive_ = userActive;
  }
};


/**
 * Preloads a module after a short delay.
 *
 * @param {string} id The id of the module to preload.
 * @param {number=} opt_timeout The number of ms to wait before adding the
 *     module id to the loading queue (defaults to 0 ms). Note that the module
 *     will be loaded asynchronously regardless of the value of this parameter.
 * @return {!goog.async.Deferred} A deferred object.
 */
goog.module.ModuleManager.prototype.preloadModule = function(id, opt_timeout) {
  var d = new goog.async.Deferred();
  window.setTimeout(
      goog.bind(this.addLoadModule_, this, id, d), opt_timeout || 0);
  return d;
};


/**
 * Prefetches a JavaScript module and its dependencies, which means that the
 * module will be downloaded, but not evaluated. To complete the module load,
 * the caller should also call load or execOnLoad after prefetching the module.
 *
 * @param {string} id The id of the module to prefetch.
 */
goog.module.ModuleManager.prototype.prefetchModule = function(id) {
  var moduleInfo = this.getModuleInfo(id);
  if (moduleInfo.isLoaded() || this.isModuleLoading(id)) {
    throw Error('Module load already requested: ' + id);
  } else if (this.batchModeEnabled_) {
    throw Error('Modules prefetching is not supported in batch mode');
  } else {
    var idWithDeps = this.getNotYetLoadedTransitiveDepIds_(id);
    for (var i = 0; i < idWithDeps.length; i++) {
      this.loader_.prefetchModule(
          idWithDeps[i], this.moduleInfoMap_[idWithDeps[i]]);
    }
  }
};


/**
 * Loads a single module for use with a given deferred.
 *
 * @param {string} id The id of the module to load.
 * @param {goog.async.Deferred} d A deferred object.
 * @private
 */
goog.module.ModuleManager.prototype.addLoadModule_ = function(id, d) {
  var moduleInfo = this.getModuleInfo(id);
  if (moduleInfo.isLoaded()) {
    d.callback(this.moduleContext_);
    return;
  }

  this.registerModuleLoadCallbacks_(id, moduleInfo, false, d);
  if (!this.isModuleLoading(id)) {
    this.loadModulesOrEnqueue_([id]);
  }
};


/**
 * Loads a list of modules or, if some other module is currently being loaded,
 * appends the ids to the queue of requested module ids. Registers callbacks a
 * module that is currently loading and returns a fired deferred for a module
 * that is already loaded.
 *
 * @param {Array<string>} ids The id of the module to load.
 * @param {boolean=} opt_userInitiated If the load is a result of a user action.
 * @return {!Object<string, !goog.async.Deferred>} A mapping from id (String)
 *     to deferred objects that will callback or errback when the load for that
 *     id is finished.
 * @private
 */
goog.module.ModuleManager.prototype.loadModulesOrEnqueueIfNotLoadedOrLoading_ =
    function(ids, opt_userInitiated) {
  var uniqueIds = [];
  goog.array.removeDuplicates(ids, uniqueIds);
  var idsToLoad = [];
  var deferredMap = {};
  for (var i = 0; i < uniqueIds.length; i++) {
    var id = uniqueIds[i];
    var moduleInfo = this.getModuleInfo(id);
    if (!moduleInfo) {
      throw new Error('Unknown module: ' + id);
    }
    var d = new goog.async.Deferred();
    deferredMap[id] = d;
    if (moduleInfo.isLoaded()) {
      d.callback(this.moduleContext_);
    } else {
      this.registerModuleLoadCallbacks_(id, moduleInfo, !!opt_userInitiated, d);
      if (!this.isModuleLoading(id)) {
        idsToLoad.push(id);
      }
    }
  }

  // If there are ids to load, load them, otherwise, they are all loading or
  // loaded.
  if (idsToLoad.length > 0) {
    this.loadModulesOrEnqueue_(idsToLoad);
  }
  return deferredMap;
};


/**
 * Registers the callbacks and handles logic if it is a user initiated module
 * load.
 *
 * @param {string} id The id of the module to possibly load.
 * @param {!goog.module.ModuleInfo} moduleInfo The module identifier for the
 *     given id.
 * @param {boolean} userInitiated If the load was user initiated.
 * @param {goog.async.Deferred} d A deferred object.
 * @private
 */
goog.module.ModuleManager.prototype.registerModuleLoadCallbacks_ = function(
    id, moduleInfo, userInitiated, d) {
  moduleInfo.registerCallback(d.callback, d);
  moduleInfo.registerErrback(function(err) { d.errback(Error(err)); });
  // If it's already loading, we don't have to do anything besides handle
  // if it was user initiated
  if (this.isModuleLoading(id)) {
    if (userInitiated) {
      goog.log.info(
          this.logger_, 'User initiated module already loading: ' + id);
      this.addUserInitiatedLoadingModule_(id);
      this.dispatchActiveIdleChangeIfNeeded_();
    }
  } else {
    if (userInitiated) {
      goog.log.info(this.logger_, 'User initiated module load: ' + id);
      this.addUserInitiatedLoadingModule_(id);
    } else {
      goog.log.info(this.logger_, 'Initiating module load: ' + id);
    }
  }
};


/**
 * Initiates loading of a list of modules or, if a module is currently being
 * loaded, appends the modules to the queue of requested module ids.
 *
 * The caller should verify that the requested modules are not already loaded or
 * loading. {@link #loadModulesOrEnqueueIfNotLoadedOrLoading_} is a more lenient
 * alternative to this method.
 *
 * @param {Array<string>} ids The ids of the modules to load.
 * @private
 */
goog.module.ModuleManager.prototype.loadModulesOrEnqueue_ = function(ids) {
  // With concurrent loading we always just send off the request.
  if (this.concurrentLoadingEnabled_) {
    // For now we wait for initial modules to have downloaded as this puts the
    // loader in a good state for calculating the needed deps of additional
    // loads.
    // TODO(user): Make this wait unnecessary.
    this.initialModulesLoaded_.addCallback(
        goog.bind(this.loadModules_, this, ids));
  } else {
    if (goog.array.isEmpty(this.loadingModuleIds_)) {
      this.loadModules_(ids);
    } else {
      this.requestedModuleIdsQueue_.push(ids);
      this.dispatchActiveIdleChangeIfNeeded_();
    }
  }
};


/**
 * Gets the amount of delay to wait before sending a request for more modules.
 * If a certain module request fails, we backoff a little bit and try again.
 * @return {number} Delay, in ms.
 * @private
 */
goog.module.ModuleManager.prototype.getBackOff_ = function() {
  // 5 seconds after one error, 20 seconds after 2.
  return Math.pow(this.consecutiveFailures_, 2) * 5000;
};


/**
 * Loads a list of modules and any of their not-yet-loaded prerequisites.
 * If batch mode is enabled, the prerequisites will be loaded together with the
 * requested modules and all requested modules will be loaded at the same time.
 *
 * The caller should verify that the requested modules are not already loaded
 * and that no modules are currently loading before calling this method.
 *
 * @param {Array<string>} ids The ids of the modules to load.
 * @param {boolean=} opt_isRetry If the load is a retry of a previous load
 *     attempt.
 * @param {boolean=} opt_forceReload Whether to bypass cache while loading the
 *     module.
 * @private
 */
goog.module.ModuleManager.prototype.loadModules_ = function(
    ids, opt_isRetry, opt_forceReload) {
  if (!opt_isRetry) {
    this.consecutiveFailures_ = 0;
  }

  // Not all modules may be loaded immediately if batch mode is not enabled.
  var idsToLoadImmediately = this.processModulesForLoad_(ids);

  goog.log.info(this.logger_, 'Loading module(s): ' + idsToLoadImmediately);
  this.loadingModuleIds_ = idsToLoadImmediately;

  if (this.batchModeEnabled_) {
    this.requestedLoadingModuleIds_ = ids;
  } else {
    // If batch mode is disabled, we treat each dependency load as a separate
    // load.
    this.requestedLoadingModuleIds_ = goog.array.clone(idsToLoadImmediately);
  }

  // Dispatch an active/idle change if needed.
  this.dispatchActiveIdleChangeIfNeeded_();

  if (goog.array.isEmpty(idsToLoadImmediately)) {
    // All requested modules and deps have been either loaded already or have
    // already been requested.
    return;
  }

  this.requestedModuleIds_.push.apply(
      this.requestedModuleIds_, idsToLoadImmediately);

  var loadFn = goog.bind(
      this.loader_.loadModules, this.loader_,
      goog.array.clone(idsToLoadImmediately), this.moduleInfoMap_, null,
      goog.bind(
          this.handleLoadError_, this, this.requestedLoadingModuleIds_,
          idsToLoadImmediately),
      goog.bind(this.handleLoadTimeout_, this), !!opt_forceReload);

  var delay = this.getBackOff_();
  if (delay) {
    window.setTimeout(loadFn, delay);
  } else {
    loadFn();
  }
};


/**
 * Processes a list of module ids for loading. Checks if any of the modules are
 * already loaded and then gets transitive deps. Queues any necessary modules
 * if batch mode is not enabled. Returns the list of ids that should be loaded.
 *
 * @param {Array<string>} ids The ids that need to be loaded.
 * @return {!Array<string>} The ids to load, including dependencies.
 * @throws {Error} If the module is already loaded.
 * @private
 */
goog.module.ModuleManager.prototype.processModulesForLoad_ = function(ids) {
  for (var i = 0; i < ids.length; i++) {
    var moduleInfo = this.moduleInfoMap_[ids[i]];
    if (moduleInfo.isLoaded()) {
      throw Error('Module already loaded: ' + ids[i]);
    }
  }

  // Build a list of the ids of this module and any of its not-yet-loaded
  // prerequisite modules in dependency order.
  var idsWithDeps = [];
  for (var i = 0; i < ids.length; i++) {
    idsWithDeps =
        idsWithDeps.concat(this.getNotYetLoadedTransitiveDepIds_(ids[i]));
  }
  goog.array.removeDuplicates(idsWithDeps);

  if (!this.batchModeEnabled_ && idsWithDeps.length > 1) {
    var idToLoad = idsWithDeps.shift();
    goog.log.info(
        this.logger_, 'Must load ' + idToLoad + ' module before ' + ids);

    // Insert the requested module id and any other not-yet-loaded prereqs
    // that it has at the front of the queue.
    var queuedModules =
        goog.array.map(idsWithDeps, function(id) { return [id]; });
    this.requestedModuleIdsQueue_ =
        queuedModules.concat(this.requestedModuleIdsQueue_);
    return [idToLoad];
  } else {
    return idsWithDeps;
  }
};


/**
 * Builds a list of the ids of the not-yet-loaded modules that a particular
 * module transitively depends on, including itself.
 *
 * @param {string} id The id of a not-yet-loaded module.
 * @return {!Array<string>} An array of module ids in dependency order that's
 *     guaranteed to end with the provided module id.
 * @private
 */
goog.module.ModuleManager.prototype.getNotYetLoadedTransitiveDepIds_ = function(
    id) {
  // NOTE(user): We want the earliest occurrance of a module, not the first
  // dependency we find. Therefore we strip duplicates at the end rather than
  // during.  See the tests for concrete examples.
  var ids = [];
  if (!goog.array.contains(this.requestedModuleIds_, id)) {
    ids.push(id);
  }
  var depIds = goog.array.clone(this.getModuleInfo(id).getDependencies());
  while (depIds.length) {
    var depId = depIds.pop();
    if (!this.getModuleInfo(depId).isLoaded() &&
        !goog.array.contains(this.requestedModuleIds_, depId)) {
      ids.unshift(depId);
      // We need to process direct dependencies first.
      Array.prototype.unshift.apply(
          depIds, this.getModuleInfo(depId).getDependencies());
    }
  }
  goog.array.removeDuplicates(ids);
  return ids;
};


/**
 * If we are still loading the base module, consider the load complete.
 * @private
 */
goog.module.ModuleManager.prototype.maybeFinishBaseLoad_ = function() {
  if (this.currentlyLoadingModule_ == this.baseModuleInfo_) {
    this.currentlyLoadingModule_ = null;
    var error =
        this.baseModuleInfo_.onLoad(goog.bind(this.getModuleContext, this));
    if (error) {
      this.dispatchModuleLoadFailed_(
          goog.module.ModuleManager.FailureType.INIT_ERROR);
    }

    this.dispatchActiveIdleChangeIfNeeded_();
  }
};


/**
 * Records that a module was loaded. Also initiates loading the next module if
 * any module requests are queued. This method is called by code that is
 * generated and appended to each dynamic module's code at compilation time.
 *
 * @param {string} id A module id.
 */
goog.module.ModuleManager.prototype.setLoaded = function(id) {
  if (this.isDisposed()) {
    goog.log.warning(
        this.logger_, 'Module loaded after module manager was disposed: ' + id);
    return;
  }

  goog.log.info(this.logger_, 'Module loaded: ' + id);

  var error =
      this.moduleInfoMap_[id].onLoad(goog.bind(this.getModuleContext, this));
  if (error) {
    this.dispatchModuleLoadFailed_(
        goog.module.ModuleManager.FailureType.INIT_ERROR);
  }

  // Remove the module id from the user initiated set if it existed there.
  goog.array.remove(this.userInitiatedLoadingModuleIds_, id);

  // Remove the module id from the loading modules if it exists there.
  goog.array.remove(this.loadingModuleIds_, id);

  if (goog.array.isEmpty(this.loadingModuleIds_)) {
    // No more modules are currently being loaded (e.g. arriving later in the
    // same HTTP response), so proceed to load the next module in the queue.
    this.loadNextModules_();
  }

  if (this.lastInitialModuleId_ && id == this.lastInitialModuleId_) {
    if (!this.initialModulesLoaded_.hasFired()) {
      this.initialModulesLoaded_.callback();
    }
  }

  // Dispatch an active/idle change if needed.
  this.dispatchActiveIdleChangeIfNeeded_();
};


/**
 * Gets whether a module is currently loading or in the queue, waiting to be
 * loaded.
 * @param {string} id A module id.
 * @return {boolean} TRUE iff the module is loading.
 */
goog.module.ModuleManager.prototype.isModuleLoading = function(id) {
  if (goog.array.contains(this.loadingModuleIds_, id)) {
    return true;
  }
  for (var i = 0; i < this.requestedModuleIdsQueue_.length; i++) {
    if (goog.array.contains(this.requestedModuleIdsQueue_[i], id)) {
      return true;
    }
  }
  return false;
};


/**
 * Requests that a function be called once a particular module is loaded.
 * Client code can use this method to safely call into modules that may not yet
 * be loaded. For consistency, this method always calls the function
 * asynchronously -- even if the module is already loaded. Initiates loading of
 * the module if necessary, unless opt_noLoad is true.
 *
 * @param {string} moduleId A module id.
 * @param {Function} fn Function to execute when the module has loaded.
 * @param {Object=} opt_handler Optional handler under whose scope to execute
 *     the callback.
 * @param {boolean=} opt_noLoad TRUE iff not to initiate loading of the module.
 * @param {boolean=} opt_userInitiated TRUE iff the loading of the module was
 *     user initiated.
 * @param {boolean=} opt_preferSynchronous TRUE iff the function should be
 *     executed synchronously if the module has already been loaded.
 * @return {!goog.module.ModuleLoadCallback} A callback wrapper that exposes
 *     an abort and execute method.
 */
goog.module.ModuleManager.prototype.execOnLoad = function(
    moduleId, fn, opt_handler, opt_noLoad, opt_userInitiated,
    opt_preferSynchronous) {
  var moduleInfo = this.moduleInfoMap_[moduleId];
  var callbackWrapper;

  if (moduleInfo.isLoaded()) {
    goog.log.info(this.logger_, moduleId + ' module already loaded');
    // Call async so that code paths don't change between loaded and unloaded
    // cases.
    callbackWrapper = new goog.module.ModuleLoadCallback(fn, opt_handler);
    if (opt_preferSynchronous) {
      callbackWrapper.execute(this.moduleContext_);
    } else {
      window.setTimeout(goog.bind(callbackWrapper.execute, callbackWrapper), 0);
    }
  } else if (this.isModuleLoading(moduleId)) {
    goog.log.info(this.logger_, moduleId + ' module already loading');
    callbackWrapper = moduleInfo.registerCallback(fn, opt_handler);
    if (opt_userInitiated) {
      goog.log.info(
          this.logger_, 'User initiated module already loading: ' + moduleId);
      this.addUserInitiatedLoadingModule_(moduleId);
      this.dispatchActiveIdleChangeIfNeeded_();
    }
  } else {
    goog.log.info(this.logger_, 'Registering callback for module: ' + moduleId);
    callbackWrapper = moduleInfo.registerCallback(fn, opt_handler);
    if (!opt_noLoad) {
      if (opt_userInitiated) {
        goog.log.info(this.logger_, 'User initiated module load: ' + moduleId);
        this.addUserInitiatedLoadingModule_(moduleId);
      }
      goog.log.info(this.logger_, 'Initiating module load: ' + moduleId);
      this.loadModulesOrEnqueue_([moduleId]);
    }
  }
  return callbackWrapper;
};


/**
 * Loads a module, returning a goog.async.Deferred for keeping track of the
 * result.
 *
 * @param {string} moduleId A module id.
 * @param {boolean=} opt_userInitiated If the load is a result of a user action.
 * @return {goog.async.Deferred} A deferred object.
 */
goog.module.ModuleManager.prototype.load = function(
    moduleId, opt_userInitiated) {
  return this.loadModulesOrEnqueueIfNotLoadedOrLoading_(
      [moduleId], opt_userInitiated)[moduleId];
};


/**
 * Loads a list of modules, returning a goog.async.Deferred for keeping track of
 * the result.
 *
 * @param {Array<string>} moduleIds A list of module ids.
 * @param {boolean=} opt_userInitiated If the load is a result of a user action.
 * @return {!Object<string, !goog.async.Deferred>} A mapping from id (String)
 *     to deferred objects that will callback or errback when the load for that
 *     id is finished.
 */
goog.module.ModuleManager.prototype.loadMultiple = function(
    moduleIds, opt_userInitiated) {
  return this.loadModulesOrEnqueueIfNotLoadedOrLoading_(
      moduleIds, opt_userInitiated);
};


/**
 * Ensures that the module with the given id is listed as a user-initiated
 * module that is being loaded. This method guarantees that a module will never
 * get listed more than once.
 * @param {string} id Identifier of the module.
 * @private
 */
goog.module.ModuleManager.prototype.addUserInitiatedLoadingModule_ = function(
    id) {
  if (!goog.array.contains(this.userInitiatedLoadingModuleIds_, id)) {
    this.userInitiatedLoadingModuleIds_.push(id);
  }
};


/**
 * Method called just before a module code is loaded.
 * @param {string} id Identifier of the module.
 */
goog.module.ModuleManager.prototype.beforeLoadModuleCode = function(id) {
  this.loadTracer_ =
      goog.debug.Trace.startTracer('Module Load: ' + id, 'Module Load');
  if (this.currentlyLoadingModule_) {
    goog.log.error(
        this.logger_, 'beforeLoadModuleCode called with module "' + id +
            '" while module "' + this.currentlyLoadingModule_.getId() +
            '" is loading');
  }
  this.currentlyLoadingModule_ = this.getModuleInfo(id);
};


/**
 * Method called just after module code is loaded
 * @param {string} id Identifier of the module.
 */
goog.module.ModuleManager.prototype.afterLoadModuleCode = function(id) {
  if (!this.currentlyLoadingModule_ ||
      id != this.currentlyLoadingModule_.getId()) {
    goog.log.error(
        this.logger_, 'afterLoadModuleCode called with module "' + id +
            '" while loading module "' +
            (this.currentlyLoadingModule_ &&
             this.currentlyLoadingModule_.getId()) +
            '"');
  }
  this.currentlyLoadingModule_ = null;
  goog.debug.Trace.stopTracer(this.loadTracer_);
};


/**
 * Register an initialization callback for the currently loading module. This
 * should only be called by script that is executed during the evaluation of
 * a module's javascript. This is almost equivalent to calling the function
 * inline, but ensures that all the code from the currently loading module
 * has been loaded. This makes it cleaner and more robust than calling the
 * function inline.
 *
 * If this function is called from the base module (the one that contains
 * the module manager code), the callback is held until #setAllModuleInfo
 * is called, or until #setModuleContext is called, whichever happens first.
 *
 * @param {Function} fn A callback function that takes a single argument
 *    which is the module context.
 * @param {Object=} opt_handler Optional handler under whose scope to execute
 *     the callback.
 */
goog.module.ModuleManager.prototype.registerInitializationCallback = function(
    fn, opt_handler) {
  if (!this.currentlyLoadingModule_) {
    goog.log.error(this.logger_, 'No module is currently loading');
  } else {
    this.currentlyLoadingModule_.registerEarlyCallback(fn, opt_handler);
  }
};


/**
 * Register a late initialization callback for the currently loading module.
 * Callbacks registered via this function are executed similar to
 * {@see registerInitializationCallback}, but they are fired after all
 * initialization callbacks are called.
 *
 * @param {Function} fn A callback function that takes a single argument
 *    which is the module context.
 * @param {Object=} opt_handler Optional handler under whose scope to execute
 *     the callback.
 */
goog.module.ModuleManager.prototype.registerLateInitializationCallback =
    function(fn, opt_handler) {
  if (!this.currentlyLoadingModule_) {
    goog.log.error(this.logger_, 'No module is currently loading');
  } else {
    this.currentlyLoadingModule_.registerCallback(fn, opt_handler);
  }
};


/**
 * Sets the constructor to use for the module object for the currently
 * loading module. The constructor should derive from
 * {@see goog.module.BaseModule}.
 * @param {Function} fn The constructor function.
 */
goog.module.ModuleManager.prototype.setModuleConstructor = function(fn) {
  if (!this.currentlyLoadingModule_) {
    goog.log.error(this.logger_, 'No module is currently loading');
    return;
  }
  this.currentlyLoadingModule_.setModuleConstructor(fn);
};


/**
 * The possible reasons for a module load failure callback being fired.
 * @enum {number}
 */
goog.module.ModuleManager.FailureType = {
  /** 401 Status. */
  UNAUTHORIZED: 0,

  /** Error status (not 401) returned multiple times. */
  CONSECUTIVE_FAILURES: 1,

  /** Request timeout. */
  TIMEOUT: 2,

  /** 410 status, old code gone. */
  OLD_CODE_GONE: 3,

  /** The onLoad callbacks failed. */
  INIT_ERROR: 4
};


/**
 * Handles a module load failure.
 *
 * @param {!Array<string>} requestedLoadingModuleIds Modules ids that were
 *     requested in failed request. Does not included calculated dependencies.
 * @param {!Array<string>} requestedModuleIdsWithDeps All module ids requested
 *     in the failed request including all dependencies.
 * @param {?number} status The error status.
 * @private
 */
goog.module.ModuleManager.prototype.handleLoadError_ = function(
    requestedLoadingModuleIds, requestedModuleIdsWithDeps, status) {
  this.consecutiveFailures_++;
  // Module manager was not designed to be reentrant. Reinstate the instance
  // var with actual value when request failed (Other requests may have
  // started already.)
  this.requestedLoadingModuleIds_ = requestedLoadingModuleIds;
  // Pretend we never requested the failed modules.
  goog.array.forEach(
      requestedModuleIdsWithDeps,
      goog.partial(goog.array.remove, this.requestedModuleIds_), this);

  if (status == 401) {
    // The user is not logged in. They've cleared their cookies or logged out
    // from another window.
    goog.log.info(this.logger_, 'Module loading unauthorized');
    this.dispatchModuleLoadFailed_(
        goog.module.ModuleManager.FailureType.UNAUTHORIZED);
    // Drop any additional module requests.
    this.requestedModuleIdsQueue_.length = 0;
  } else if (status == 410) {
    // The requested module js is old and not available.
    this.requeueBatchOrDispatchFailure_(
        goog.module.ModuleManager.FailureType.OLD_CODE_GONE);
    this.loadNextModules_();
  } else if (this.consecutiveFailures_ >= 3) {
    goog.log.info(
        this.logger_,
        'Aborting after failure to load: ' + this.loadingModuleIds_);
    this.requeueBatchOrDispatchFailure_(
        goog.module.ModuleManager.FailureType.CONSECUTIVE_FAILURES);
    this.loadNextModules_();
  } else {
    goog.log.info(
        this.logger_,
        'Retrying after failure to load: ' + this.loadingModuleIds_);
    var forceReload =
        status == goog.module.ModuleManager.CORRUPT_RESPONSE_STATUS_CODE;
    this.loadModules_(this.requestedLoadingModuleIds_, true, forceReload);
  }
};


/**
 * Handles a module load timeout.
 * @private
 */
goog.module.ModuleManager.prototype.handleLoadTimeout_ = function() {
  goog.log.info(
      this.logger_, 'Aborting after timeout: ' + this.loadingModuleIds_);
  this.requeueBatchOrDispatchFailure_(
      goog.module.ModuleManager.FailureType.TIMEOUT);
  this.loadNextModules_();
};


/**
 * Requeues batch loads that had more than one requested module
 * (i.e. modules that were not included as dependencies) as separate loads or
 * if there was only one requested module, fails that module with the received
 * cause.
 * @param {goog.module.ModuleManager.FailureType} cause The reason for the
 *     failure.
 * @private
 */
goog.module.ModuleManager.prototype.requeueBatchOrDispatchFailure_ = function(
    cause) {
  // The load failed, so if there are more than one requested modules, then we
  // need to retry each one as a separate load. Otherwise, if there is only one
  // requested module, remove it and its dependencies from the queue.
  if (this.requestedLoadingModuleIds_.length > 1) {
    var queuedModules = goog.array.map(
        this.requestedLoadingModuleIds_, function(id) { return [id]; });
    this.requestedModuleIdsQueue_ =
        queuedModules.concat(this.requestedModuleIdsQueue_);
  } else {
    this.dispatchModuleLoadFailed_(cause);
  }
};


/**
 * Handles when a module load failed.
 * @param {goog.module.ModuleManager.FailureType} cause The reason for the
 *     failure.
 * @private
 */
goog.module.ModuleManager.prototype.dispatchModuleLoadFailed_ = function(
    cause) {
  var failedIds = this.requestedLoadingModuleIds_;
  this.loadingModuleIds_.length = 0;
  // If any pending modules depend on the id that failed,
  // they need to be removed from the queue.
  var idsToCancel = [];
  for (var i = 0; i < this.requestedModuleIdsQueue_.length; i++) {
    var dependentModules = goog.array.filter(
        this.requestedModuleIdsQueue_[i],
        /**
         * Returns true if the requestedId has dependencies on the modules that
         * just failed to load.
         * @param {string} requestedId The module to check for dependencies.
         * @return {boolean} True if the module depends on failed modules.
         */
        function(requestedId) {
          var requestedDeps =
              this.getNotYetLoadedTransitiveDepIds_(requestedId);
          return goog.array.some(failedIds, function(id) {
            return goog.array.contains(requestedDeps, id);
          });
        },
        this);
    goog.array.extend(idsToCancel, dependentModules);
  }

  // Also insert the ids that failed to load as ids to cancel.
  for (var i = 0; i < failedIds.length; i++) {
    goog.array.insert(idsToCancel, failedIds[i]);
  }

  // Remove ids to cancel from the queues.
  for (var i = 0; i < idsToCancel.length; i++) {
    for (var j = 0; j < this.requestedModuleIdsQueue_.length; j++) {
      goog.array.remove(this.requestedModuleIdsQueue_[j], idsToCancel[i]);
    }
    goog.array.remove(this.userInitiatedLoadingModuleIds_, idsToCancel[i]);
  }

  // Call the functions for error notification.
  var errorCallbacks =
      this.callbackMap_[goog.module.ModuleManager.CallbackType.ERROR];
  if (errorCallbacks) {
    for (var i = 0; i < errorCallbacks.length; i++) {
      var callback = errorCallbacks[i];
      for (var j = 0; j < idsToCancel.length; j++) {
        callback(
            goog.module.ModuleManager.CallbackType.ERROR, idsToCancel[j],
            cause);
      }
    }
  }

  // Call the errbacks on the module info.
  for (var i = 0; i < failedIds.length; i++) {
    if (this.moduleInfoMap_[failedIds[i]]) {
      this.moduleInfoMap_[failedIds[i]].onError(cause);
    }
  }

  // Clear the requested loading module ids.
  this.requestedLoadingModuleIds_.length = 0;

  this.dispatchActiveIdleChangeIfNeeded_();
};


/**
 * Loads the next modules on the queue.
 * @private
 */
goog.module.ModuleManager.prototype.loadNextModules_ = function() {
  while (this.requestedModuleIdsQueue_.length) {
    // Remove modules that are already loaded.
    var nextIds = goog.array.filter(
        this.requestedModuleIdsQueue_.shift(),
        /** @param {string} id The module id. */
        function(id) { return !this.getModuleInfo(id).isLoaded(); }, this);
    if (nextIds.length > 0) {
      this.loadModules_(nextIds);
      return;
    }
  }

  // Dispatch an active/idle change if needed.
  this.dispatchActiveIdleChangeIfNeeded_();
};


/**
 * The function to call if the module manager is in error.
 * @param
 * {goog.module.ModuleManager.CallbackType|Array<goog.module.ModuleManager.CallbackType>}
 * types
 *  The callback type.
 * @param {Function} fn The function to register as a callback.
 */
goog.module.ModuleManager.prototype.registerCallback = function(types, fn) {
  if (!goog.isArray(types)) {
    types = [types];
  }

  for (var i = 0; i < types.length; i++) {
    this.registerCallback_(types[i], fn);
  }
};


/**
 * Register a callback for the specified callback type.
 * @param {goog.module.ModuleManager.CallbackType} type The callback type.
 * @param {Function} fn The callback function.
 * @private
 */
goog.module.ModuleManager.prototype.registerCallback_ = function(type, fn) {
  var callbackMap = this.callbackMap_;
  if (!callbackMap[type]) {
    callbackMap[type] = [];
  }
  callbackMap[type].push(fn);
};


/**
 * Call the callback functions of the specified type.
 * @param {goog.module.ModuleManager.CallbackType} type The callback type.
 * @private
 */
goog.module.ModuleManager.prototype.executeCallbacks_ = function(type) {
  var callbacks = this.callbackMap_[type];
  for (var i = 0; callbacks && i < callbacks.length; i++) {
    callbacks[i](type);
  }
};


/** @override */
goog.module.ModuleManager.prototype.disposeInternal = function() {
  goog.module.ModuleManager.base(this, 'disposeInternal');

  // Dispose of each ModuleInfo object.
  goog.disposeAll(
      goog.object.getValues(this.moduleInfoMap_), this.baseModuleInfo_);
  this.moduleInfoMap_ = null;
  this.loadingModuleIds_ = null;
  this.requestedLoadingModuleIds_ = null;
  this.userInitiatedLoadingModuleIds_ = null;
  this.requestedModuleIdsQueue_ = null;
  this.callbackMap_ = null;
};
