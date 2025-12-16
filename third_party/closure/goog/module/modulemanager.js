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
 * @fileoverview A default implementation for managing JavaScript code modules.
 * @enhanceable
 */

goog.provide('goog.module.ModuleManager');
goog.provide('goog.module.ModuleManager.CallbackType');
goog.provide('goog.module.ModuleManager.FailureType');

goog.require('goog.array');
goog.require('goog.asserts');
goog.require('goog.async.Deferred');
goog.require('goog.debug.Trace');
goog.require('goog.disposable.IDisposable');
goog.require('goog.disposeAll');
goog.require('goog.loader.AbstractModuleManager');
goog.require('goog.loader.activeModuleManager');
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
 * @extends {goog.loader.AbstractModuleManager}
 * @implements {goog.disposable.IDisposable}
 * @struct
 */
goog.module.ModuleManager = function() {
  goog.module.ModuleManager.base(this, 'constructor');

  /**
   * A mapping from module id to ModuleInfo object.
   * @protected {!Object<string, !goog.module.ModuleInfo>}
   */
  this.moduleInfoMap = {};

  // TODO (malteubl): Switch this to a reentrant design.
  /**
   * The ids of the currently loading modules. If batch mode is disabled, then
   * this array will never contain more than one element at a time.
   * @type {!Array<string>}
   * @private
   */
  this.loadingModuleIds_ = [];

  /**
   * The requested ids of the currently loading modules. This does not include
   * module dependencies that may also be loading.
   * @type {!Array<string>}
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
   * @type {!Array<!Array<string>>}
   * @private
   */
  this.requestedModuleIdsQueue_ = [];

  /**
   * The ids of the currently loading modules which have been initiated by user
   * actions.
   * @type {!Array<string>}
   * @private
   */
  this.userInitiatedLoadingModuleIds_ = [];

  /**
   * A map of callback types to the functions to call for the specified
   * callback type.
   * @type {!Object<!goog.loader.AbstractModuleManager.CallbackType,
   *     !Array<!Function>>}
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
   * @type {!goog.module.ModuleInfo}
   * @private
   */
  this.baseModuleInfo_ = new goog.module.ModuleInfo([], '');

  /**
   * The module that is currently loading, or null if not loading anything.
   * @type {?goog.module.ModuleInfo}
   * @private
   */
  this.currentlyLoadingModule_ = this.baseModuleInfo_;

  /**
   * The id of the last requested initial module. When it loaded
   * the deferred in `this.initialModulesLoaded_` resolves.
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
   * @private {?goog.log.Logger}
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
   * @private {boolean}
   */
  this.isDisposed_ = false;
};
goog.inherits(goog.module.ModuleManager, goog.loader.AbstractModuleManager);


/**
 * The type of callbacks that can be registered with the module manager,.
 * @enum {string}
 */
goog.module.ModuleManager.CallbackType =
    goog.loader.AbstractModuleManager.CallbackType;


/**
 * The possible reasons for a module load failure callback being fired.
 * @enum {number}
 */
goog.module.ModuleManager.FailureType =
    goog.loader.AbstractModuleManager.FailureType;


/**
 * A non-HTTP status code indicating a corruption in loaded module.
 * This should be used by a ModuleLoader as a replacement for the HTTP code
 * given to the error handler function to indicated that the module was
 * corrupted.
 * This will set the forceReload flag on the loadModules method when retrying
 * module loading.
 * @type {number}
 */
goog.module.ModuleManager.CORRUPT_RESPONSE_STATUS_CODE =
    goog.loader.AbstractModuleManager.CORRUPT_RESPONSE_STATUS_CODE;


/** @return {!goog.loader.AbstractModuleManager} */
goog.module.ModuleManager.getInstance = function() {
  return goog.loader.activeModuleManager.get();
};


/** @override */
goog.module.ModuleManager.prototype.setBatchModeEnabled = function(enabled) {
  this.batchModeEnabled_ = enabled;
};


/** @override */
goog.module.ModuleManager.prototype.setConcurrentLoadingEnabled = function(
    enabled) {
  this.concurrentLoadingEnabled_ = enabled;
};


/** @override */
goog.module.ModuleManager.prototype.setAllModuleInfo = function(infoMap) {
  for (var id in infoMap) {
    this.moduleInfoMap[id] = new goog.module.ModuleInfo(infoMap[id], id);
  }
  if (!this.initialModulesLoaded_.hasFired()) {
    this.initialModulesLoaded_.callback();
  }
  this.maybeFinishBaseLoad_();
};


/** @override */
goog.module.ModuleManager.prototype.setAllModuleInfoString = function(
    opt_info, opt_loadingModuleIds) {
  // Check for legacy direct-from-prototype usage.
  if (!(this instanceof goog.module.ModuleManager)) {
    this.setAllModuleInfoString(opt_info, opt_loadingModuleIds);
    return;
  }
  if (typeof (opt_info) !== 'string') {
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
    this.moduleInfoMap[id] = new goog.module.ModuleInfo(deps, id);
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


/** @override */
goog.module.ModuleManager.prototype.getModuleInfo = function(id) {
  return this.moduleInfoMap[id];
};


/** @override */
goog.module.ModuleManager.prototype.setModuleTrustedUris = function(
    moduleUriMap) {
  for (var id in moduleUriMap) {
    this.moduleInfoMap[id].setTrustedUris(moduleUriMap[id]);
  }
};


/** @override */
goog.module.ModuleManager.prototype.setModuleContext = function(context) {
  goog.module.ModuleManager.base(this, 'setModuleContext', context);
  this.maybeFinishBaseLoad_();
};


/** @override */
goog.module.ModuleManager.prototype.isActive = function() {
  return this.loadingModuleIds_.length > 0;
};


/** @override */
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
        active ? goog.loader.AbstractModuleManager.CallbackType.ACTIVE :
                 goog.loader.AbstractModuleManager.CallbackType.IDLE);

    // Flip the last active value.
    this.lastActive_ = active;
  }

  // Check if the module manager is user active i.e., there are user initiated
  // modules being loaded or queued up to be loaded.
  var userLastActive = this.userLastActive_;
  var userActive = this.isUserActive();
  if (userActive != userLastActive) {
    this.executeCallbacks_(
        userActive ?
            goog.loader.AbstractModuleManager.CallbackType.USER_ACTIVE :
            goog.loader.AbstractModuleManager.CallbackType.USER_IDLE);

    // Flip the last user active value.
    this.userLastActive_ = userActive;
  }
};


/** @override */
goog.module.ModuleManager.prototype.preloadModule = function(id, opt_timeout) {
  var d = new goog.async.Deferred();
  window.setTimeout(
      goog.bind(this.addLoadModule_, this, id, d), opt_timeout || 0);
  return d;
};


/** @override */
goog.module.ModuleManager.prototype.prefetchModule = function(id) {
  var moduleInfo = this.getModuleInfo(id);
  if (moduleInfo.isLoaded() || this.isModuleLoading(id)) {
    throw new Error('Module load already requested: ' + id);
  } else if (this.batchModeEnabled_) {
    throw new Error('Modules prefetching is not supported in batch mode');
  } else {
    var idWithDeps = this.getNotYetLoadedTransitiveDepIds_(id);
    for (var i = 0; i < idWithDeps.length; i++) {
      this.getLoader().prefetchModule(
          idWithDeps[i], this.moduleInfoMap[idWithDeps[i]]);
    }
  }
};


/**
 * Loads a single module for use with a given deferred.
 *
 * @param {string} id The id of the module to load.
 * @param {!goog.async.Deferred} d A deferred object.
 * @private
 */
goog.module.ModuleManager.prototype.addLoadModule_ = function(id, d) {
  var moduleInfo = this.getModuleInfo(id);
  if (moduleInfo.isLoaded()) {
    d.callback(this.getModuleContext());
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
 * @param {!Array<string>} ids The id of the module to load.
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
      d.callback(this.getModuleContext());
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
 * @param {!goog.async.Deferred} d A deferred object.
 * @private
 */
goog.module.ModuleManager.prototype.registerModuleLoadCallbacks_ = function(
    id, moduleInfo, userInitiated, d) {
  moduleInfo.registerCallback(d.callback, d);
  moduleInfo.registerErrback(function(err) {
    d.errback(Error(err));
  });
  // If it's already loading, we don't have to do anything besides handle
  // if it was user initiated
  if (this.isModuleLoading(id)) {
    if (userInitiated) {
      goog.log.fine(
          this.logger_, 'User initiated module already loading: ' + id);
      this.addUserInitiatedLoadingModule_(id);
      this.dispatchActiveIdleChangeIfNeeded_();
    }
  } else {
    if (userInitiated) {
      goog.log.fine(this.logger_, 'User initiated module load: ' + id);
      this.addUserInitiatedLoadingModule_(id);
    } else {
      goog.log.fine(this.logger_, 'Initiating module load: ' + id);
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
 * @param {!Array<string>} ids The ids of the modules to load.
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
 * @param {!Array<string>} ids The ids of the modules to load.
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

  goog.log.fine(this.logger_, 'Loading module(s): ' + idsToLoadImmediately);

  if (this.concurrentLoadingEnabled_) {
    goog.array.extend(this.loadingModuleIds_, idsToLoadImmediately);
  } else {
    this.loadingModuleIds_ = idsToLoadImmediately;
  }

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
      this.getLoader().loadModules, goog.asserts.assert(this.getLoader()),
      goog.array.clone(idsToLoadImmediately),
      goog.asserts.assert(this.moduleInfoMap), null,
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
 * @param {!Array<string>} ids The ids that need to be loaded.
 * @return {!Array<string>} The ids to load, including dependencies.
 * @throws {!Error} If the module is already loaded.
 * @private
 */
goog.module.ModuleManager.prototype.processModulesForLoad_ = function(ids) {
  ids = goog.array.filter(ids, (id) => {
    let moduleInfo = this.moduleInfoMap[id];
    if (moduleInfo.isLoaded()) {
      goog.global.setTimeout(
          () => new Error('Module already loaded: ' + id), 0);
      return false;
    }
    return true;
  });

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
    goog.log.fine(
        this.logger_, 'Must load ' + idToLoad + ' module before ' + ids);

    // Insert the requested module id and any other not-yet-loaded prereqs
    // that it has at the front of the queue.
    var queuedModules = goog.array.map(idsWithDeps, function(id) {
      return [id];
    });
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
  var requestedModuleSet = goog.object.createSet(this.requestedModuleIds_);
  // NOTE(user): We want the earliest occurrence of a module, not the first
  // dependency we find. Therefore we strip duplicates at the end rather than
  // during.  See the tests for concrete examples.
  var ids = [];
  if (!requestedModuleSet[id]) {
    ids.push(id);
  }
  var depIdLookupList = [id];
  // BFS by iterating through dependencies and enqueuing their respective
  // dependencies into the lookup list.
  for (var i = 0; i < depIdLookupList.length; i++) {
    var depIds = this.getModuleInfo(depIdLookupList[i]).getDependencies();
    for (var j = depIds.length - 1; j >= 0; j--) {
      var depId = depIds[j];
      if (!this.getModuleInfo(depId).isLoaded() && !requestedModuleSet[depId]) {
        ids.push(depId);
        depIdLookupList.push(depId);
      }
    }
  }

  // Leaf dependencies should come before others. Please refer to test cases for
  // exact order.
  ids.reverse();
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
          goog.loader.AbstractModuleManager.FailureType.INIT_ERROR);
    }

    this.dispatchActiveIdleChangeIfNeeded_();
  }
};


/** @override */
goog.module.ModuleManager.prototype.setLoaded = function() {
  if (!this.currentlyLoadingModule_) {
    goog.log.error(
        this.logger_, 'setLoaded called while no module is actively loading');
    return;
  }

  var id = this.currentlyLoadingModule_.getId();

  if (this.isDisposed()) {
    goog.log.warning(
        this.logger_, 'Module loaded after module manager was disposed: ' + id);
    return;
  }

  goog.log.fine(this.logger_, 'Module loaded: ' + id);

  var error =
      this.moduleInfoMap[id].onLoad(goog.bind(this.getModuleContext, this));
  if (error) {
    this.dispatchModuleLoadFailed_(
        goog.loader.AbstractModuleManager.FailureType.INIT_ERROR);
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

  this.currentlyLoadingModule_ = null;
  goog.debug.Trace.stopTracer(this.loadTracer_);
};


/** @override */
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


/** @override */
goog.module.ModuleManager.prototype.execOnLoad = function(
    moduleId, fn, opt_handler, opt_noLoad, opt_userInitiated,
    opt_preferSynchronous) {
  var moduleInfo = this.moduleInfoMap[moduleId];
  var callbackWrapper;

  if (moduleInfo.isLoaded()) {
    goog.log.fine(this.logger_, moduleId + ' module already loaded');
    // Call async so that code paths don't change between loaded and unloaded
    // cases.
    callbackWrapper = new goog.module.ModuleLoadCallback(fn, opt_handler);
    if (opt_preferSynchronous) {
      callbackWrapper.execute(this.getModuleContext());
    } else {
      window.setTimeout(goog.bind(callbackWrapper.execute, callbackWrapper), 0);
    }
  } else if (this.isModuleLoading(moduleId)) {
    goog.log.fine(this.logger_, moduleId + ' module already loading');
    callbackWrapper = moduleInfo.registerCallback(fn, opt_handler);
    if (opt_userInitiated) {
      goog.log.fine(
          this.logger_, 'User initiated module already loading: ' + moduleId);
      this.addUserInitiatedLoadingModule_(moduleId);
      this.dispatchActiveIdleChangeIfNeeded_();
    }
  } else {
    goog.log.fine(this.logger_, 'Registering callback for module: ' + moduleId);
    callbackWrapper = moduleInfo.registerCallback(fn, opt_handler);
    if (!opt_noLoad) {
      if (opt_userInitiated) {
        goog.log.fine(this.logger_, 'User initiated module load: ' + moduleId);
        this.addUserInitiatedLoadingModule_(moduleId);
      }
      goog.log.fine(this.logger_, 'Initiating module load: ' + moduleId);
      this.loadModulesOrEnqueue_([moduleId]);
    }
  }
  return callbackWrapper;
};


/** @override */
goog.module.ModuleManager.prototype.load = function(
    moduleId, opt_userInitiated) {
  return this.loadModulesOrEnqueueIfNotLoadedOrLoading_(
      [moduleId], opt_userInitiated)[moduleId];
};


/** @override */
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


/** @override */
goog.module.ModuleManager.prototype.beforeLoadModuleCode = function(id) {
  this.loadTracer_ =
      goog.debug.Trace.startTracer('Module Load: ' + id, 'Module Load');
  if (this.currentlyLoadingModule_) {
    goog.log.error(
        this.logger_,
        'beforeLoadModuleCode called with module "' + id + '" while module "' +
            this.currentlyLoadingModule_.getId() + '" is loading');
  }
  this.currentlyLoadingModule_ = this.getModuleInfo(id);
};


/** @override */
goog.module.ModuleManager.prototype.registerInitializationCallback = function(
    fn, opt_handler) {
  if (!this.currentlyLoadingModule_) {
    goog.log.error(this.logger_, 'No module is currently loading');
  } else {
    this.currentlyLoadingModule_.registerEarlyCallback(fn, opt_handler);
  }
};


/** @override */
goog.module.ModuleManager.prototype.registerLateInitializationCallback =
    function(fn, opt_handler) {
  if (!this.currentlyLoadingModule_) {
    goog.log.error(this.logger_, 'No module is currently loading');
  } else {
    this.currentlyLoadingModule_.registerCallback(fn, opt_handler);
  }
};


/** @override */
goog.module.ModuleManager.prototype.setModuleConstructor = function(fn) {
  if (!this.currentlyLoadingModule_) {
    goog.log.error(this.logger_, 'No module is currently loading');
    return;
  }
  this.currentlyLoadingModule_.setModuleConstructor(fn);
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
        goog.loader.AbstractModuleManager.FailureType.UNAUTHORIZED);
    // Drop any additional module requests.
    this.requestedModuleIdsQueue_.length = 0;
  } else if (status == 410) {
    // The requested module js is old and not available.
    this.requeueBatchOrDispatchFailure_(
        goog.loader.AbstractModuleManager.FailureType.OLD_CODE_GONE);
    this.loadNextModules_();
  } else if (this.consecutiveFailures_ >= 3) {
    goog.log.info(
        this.logger_,
        'Aborting after failure to load: ' + this.loadingModuleIds_);
    this.requeueBatchOrDispatchFailure_(
        goog.loader.AbstractModuleManager.FailureType.CONSECUTIVE_FAILURES);
    this.loadNextModules_();
  } else {
    goog.log.info(
        this.logger_,
        'Retrying after failure to load: ' + this.loadingModuleIds_);
    var forceReload = status ==
        goog.loader.AbstractModuleManager.CORRUPT_RESPONSE_STATUS_CODE;
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
      goog.loader.AbstractModuleManager.FailureType.TIMEOUT);
  this.loadNextModules_();
};


/**
 * Requeues batch loads that had more than one requested module
 * (i.e. modules that were not included as dependencies) as separate loads or
 * if there was only one requested module, fails that module with the received
 * cause.
 * @param {!goog.loader.AbstractModuleManager.FailureType} cause The reason for
 *     the failure.
 * @private
 */
goog.module.ModuleManager.prototype.requeueBatchOrDispatchFailure_ = function(
    cause) {
  // The load failed, so if there are more than one requested modules, then we
  // need to retry each one as a separate load. Otherwise, if there is only one
  // requested module, remove it and its dependencies from the queue.
  if (this.requestedLoadingModuleIds_.length > 1) {
    var queuedModules =
        goog.array.map(this.requestedLoadingModuleIds_, function(id) {
          return [id];
        });
    this.requestedModuleIdsQueue_ =
        queuedModules.concat(this.requestedModuleIdsQueue_);
  } else {
    this.dispatchModuleLoadFailed_(cause);
  }
};


/**
 * Handles when a module load failed.
 * @param {!goog.loader.AbstractModuleManager.FailureType} cause The reason for
 *     the failure.
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
      this.callbackMap_[goog.loader.AbstractModuleManager.CallbackType.ERROR];
  if (errorCallbacks) {
    for (var i = 0; i < errorCallbacks.length; i++) {
      var callback = errorCallbacks[i];
      for (var j = 0; j < idsToCancel.length; j++) {
        callback(
            goog.loader.AbstractModuleManager.CallbackType.ERROR,
            idsToCancel[j], cause);
      }
    }
  }

  // Call the errbacks on the module info.
  for (var i = 0; i < failedIds.length; i++) {
    if (this.moduleInfoMap[failedIds[i]]) {
      this.moduleInfoMap[failedIds[i]].onError(cause);
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
    var nextIds =
        goog.array.filter(this.requestedModuleIdsQueue_.shift(), function(id) {
          return !this.getModuleInfo(id).isLoaded();
        }, this);
    if (nextIds.length > 0) {
      this.loadModules_(nextIds);
      return;
    }
  }

  // Dispatch an active/idle change if needed.
  this.dispatchActiveIdleChangeIfNeeded_();
};


/** @override */
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
 * @param {!goog.loader.AbstractModuleManager.CallbackType} type The callback
 *     type.
 * @param {!Function} fn The callback function.
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
 * @param {!goog.loader.AbstractModuleManager.CallbackType} type The callback
 *     type.
 * @private
 */
goog.module.ModuleManager.prototype.executeCallbacks_ = function(type) {
  var callbacks = this.callbackMap_[type];
  for (var i = 0; callbacks && i < callbacks.length; i++) {
    callbacks[i](type);
  }
};


/** @override */
goog.module.ModuleManager.prototype.dispose = function() {
  // Dispose of each ModuleInfo object.
  goog.disposeAll(
      goog.object.getValues(this.moduleInfoMap), this.baseModuleInfo_);
  this.moduleInfoMap = {};
  this.loadingModuleIds_ = [];
  this.requestedLoadingModuleIds_ = [];
  this.userInitiatedLoadingModuleIds_ = [];
  this.requestedModuleIdsQueue_ = [];
  this.callbackMap_ = {};
  this.isDisposed_ = true;
};

/** @override */
goog.module.ModuleManager.prototype.isDisposed = function() {
  return this.isDisposed_;
};

goog.loader.activeModuleManager.setDefault(function() {
  return new goog.module.ModuleManager();
});
