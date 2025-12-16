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
 */

goog.provide('goog.module.ModuleLoader');

goog.require('goog.Timer');
goog.require('goog.array');
goog.require('goog.asserts');
goog.require('goog.dom');
goog.require('goog.dom.safe');
goog.require('goog.events');
goog.require('goog.events.Event');
goog.require('goog.events.EventHandler');
goog.require('goog.events.EventId');
goog.require('goog.events.EventTarget');
goog.require('goog.functions');
goog.require('goog.html.TrustedResourceUrl');
goog.require('goog.labs.userAgent.browser');
goog.require('goog.log');
goog.require('goog.module.AbstractModuleLoader');
goog.require('goog.net.BulkLoader');
goog.require('goog.net.EventType');
goog.require('goog.net.jsloader');
goog.require('goog.userAgent');
goog.require('goog.userAgent.product');



/**
 * A class that loads JavaScript modules.
 * @constructor
 * @extends {goog.events.EventTarget}
 * @implements {goog.module.AbstractModuleLoader}
 */
goog.module.ModuleLoader = function() {
  goog.module.ModuleLoader.base(this, 'constructor');

  /**
   * Event handler for managing handling events.
   * @type {goog.events.EventHandler<!goog.module.ModuleLoader>}
   * @private
   */
  this.eventHandler_ = new goog.events.EventHandler(this);
  this.registerDisposable(this.eventHandler_);

  /**
   * A map from module IDs to goog.module.ModuleLoader.LoadStatus.
   * @type {!Object<Array<string>, goog.module.ModuleLoader.LoadStatus>}
   * @private
   */
  this.loadingModulesStatus_ = {};
};
goog.inherits(goog.module.ModuleLoader, goog.events.EventTarget);


/**
 * A logger.
 * @type {goog.log.Logger}
 * @protected
 */
goog.module.ModuleLoader.prototype.logger =
    goog.log.getLogger('goog.module.ModuleLoader');


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
 * Whether to load modules with non-async script tags.
 * @type {boolean}
 * @private
 */
goog.module.ModuleLoader.prototype.useScriptTags_ = false;


/**
 * @return {boolean} Whether sourceURL affects stack traces.
 */
goog.module.ModuleLoader.supportsSourceUrlStackTraces = function() {
  return goog.userAgent.product.CHROME ||
      (goog.labs.userAgent.browser.isFirefox() &&
       goog.labs.userAgent.browser.isVersionOrHigher('36'));
};


/**
 * @return {boolean} Whether sourceURL affects the debugger.
 */
goog.module.ModuleLoader.supportsSourceUrlDebugger = function() {
  return goog.userAgent.product.CHROME || goog.userAgent.GECKO;
};


/**
 * URLs have a browser-dependent max character limit. IE9-IE11 are the lowest
 * common denominators for what we support - with a limit of 4043:
 * https://stackoverflow.com/questions/417142/what-is-the-maximum-length-of-a-url-in-different-browsers#31250734
 * If the URL constructed by the loader exceeds this limit, we will try to split
 * it into multiple requests.
 * TODO(user): Make this configurable since not all users care about IE.
 * @const {number}
 * @private
 */
goog.module.ModuleLoader.URL_MAX_LENGTH_ = 4043;


/**
 * Error code for javascript syntax and network errors.
 * TODO(user): Detect more accurate error info.
 * @const {number}
 * @private
 */
goog.module.ModuleLoader.SYNTAX_OR_NETWORK_ERROR_CODE_ = -1;



/**
 * @param {!goog.html.TrustedResourceUrl} url The url to be loaded.
 * @return {!HTMLScriptElement}
 * @private
 */
goog.module.ModuleLoader.createScriptElement_ = function(url) {
  const script = goog.dom.createElement(goog.dom.TagName.SCRIPT);
  goog.dom.safe.setScriptSrc(script, url);

  // Set scriptElt.async = false to guarantee
  // that scripts are loaded in parallel but executed in the insertion order.
  // For more details, check
  // https://developer.mozilla.org/en-US/docs/Web/HTML/Element/script
  script.async = false;
  return script;
};


/**
 * @param {!goog.html.TrustedResourceUrl} url The url to be pre-loaded.
 * @return {!HTMLLinkElement}
 * @private
 */
goog.module.ModuleLoader.createPreloadScriptElement_ = function(url) {
  const link = goog.dom.createElement(goog.dom.TagName.LINK);
  goog.dom.safe.setLinkHrefAndRel(link, url, 'preload');
  link.as = 'script';
  return link;
};


/**
 * Gets the debug mode for the loader.
 * @return {boolean} Whether the debug mode is enabled.
 */
goog.module.ModuleLoader.prototype.getDebugMode = function() {
  return this.debugMode_;
};


/**
 * @param {boolean} useScriptTags Whether or not to use script tags
 *     (with async=false) for loading.
 */
goog.module.ModuleLoader.prototype.setUseScriptTags = function(useScriptTags) {
  this.useScriptTags_ = useScriptTags;
};


/**
 * Gets whether we're using non-async script tags for loading.
 * @return {boolean} Whether or not we're using non-async script tags for
 *     loading.
 */
goog.module.ModuleLoader.prototype.getUseScriptTags = function() {
  return this.useScriptTags_;
};


/**
 * Sets whether we're using non-async script tags for loading.
 * @param {boolean} debugMode Whether the debug mode is enabled.
 */
goog.module.ModuleLoader.prototype.setDebugMode = function(debugMode) {
  this.debugMode_ = debugMode;
};


/**
 * When enabled, we will add a sourceURL comment to the end of all scripts
 * to mark their origin.
 *
 * On WebKit, stack traces will reflect the sourceURL comment, so this is
 * useful for debugging webkit stack traces in production.
 *
 * Notice that in debug mode, we will use source url injection + eval rather
 * then appending script nodes to the DOM, because the scripts will load far
 * faster.  (Appending script nodes is very slow, because we can't parallelize
 * the downloading and evaling of the script).
 *
 * The cost of appending sourceURL information is negligible when compared to
 * the cost of evaling the script. Almost all clients will want this on.
 *
 * TODO(nicksantos): Turn this on by default. We may want to turn this off
 * for clients that inject their own sourceURL.
 *
 * @param {boolean} enabled Whether source url injection is enabled.
 */
goog.module.ModuleLoader.prototype.setSourceUrlInjection = function(enabled) {
  this.sourceUrlInjection_ = enabled;
};


/**
 * @return {boolean} Whether we're using source url injection.
 * @private
 */
goog.module.ModuleLoader.prototype.usingSourceUrlInjection_ = function() {
  return this.sourceUrlInjection_ ||
      (this.getDebugMode() &&
       goog.module.ModuleLoader.supportsSourceUrlStackTraces());
};


/** @override */
goog.module.ModuleLoader.prototype.loadModules = function(
    ids, moduleInfoMap, opt_successFn, opt_errorFn, opt_timeoutFn,
    opt_forceReload) {
  var loadStatus = this.loadingModulesStatus_[ids] ||
      goog.module.ModuleLoader.LoadStatus.createForIds_(ids, moduleInfoMap);
  loadStatus.loadRequested = true;
  if (loadStatus.successFn && opt_successFn) {
    // If there already exists a success function, chain it before the passed
    // success functon.
    loadStatus.successFn =
        goog.functions.sequence(loadStatus.successFn, opt_successFn);
  } else {
    loadStatus.successFn = opt_successFn || loadStatus.successFn;
  }
  loadStatus.errorFn = opt_errorFn || null;

  if (!this.loadingModulesStatus_[ids]) {
    // Modules were not prefetched.
    this.loadingModulesStatus_[ids] = loadStatus;
    this.downloadModules_(ids);
    // TODO(user): Need to handle timeouts in the module loading code.
  } else if (this.getUseScriptTags()) {
    // We started prefetching but we used <link rel="preload".../> tags, so we
    // rely on the browser to reconcile the (existing) prefetch request and the
    // script tag we're about to insert.
    this.downloadModules_(ids);
  } else if (loadStatus.responseTexts != null) {
    // Modules prefetch is complete.
    this.evaluateCode_(ids);
  }
  // Otherwise modules prefetch is in progress, and these modules will be
  // executed after the prefetch is complete.
};


/**
 * Evaluate the JS code.
 * @param {Array<string>} moduleIds The module ids.
 * @private
 */
goog.module.ModuleLoader.prototype.evaluateCode_ = function(moduleIds) {
  this.dispatchEvent(
      new goog.module.ModuleLoader.RequestSuccessEvent(moduleIds));

  goog.log.info(this.logger, 'evaluateCode ids:' + moduleIds);
  var loadStatus = this.loadingModulesStatus_[moduleIds];
  var uris = loadStatus.requestUris;
  var texts = loadStatus.responseTexts;
  var error = null;
  try {
    if (this.usingSourceUrlInjection_()) {
      for (var i = 0; i < uris.length; i++) {
        var uri = uris[i];
        goog.globalEval(texts[i] + ' //# sourceURL=' + uri);
      }
    } else {
      goog.globalEval(texts.join('\n'));
    }
  } catch (e) {
    error = e;
    // TODO(user): Consider throwing an exception here.
    goog.log.warning(
        this.logger, 'Loaded incomplete code for module(s): ' + moduleIds, e);
  }

  this.dispatchEvent(new goog.module.ModuleLoader.EvaluateCodeEvent(moduleIds));

  if (error) {
    this.handleErrorHelper_(
        moduleIds, loadStatus.errorFn, null /* status */, error);
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
 * @param {Array<string>} moduleIds The ids of the modules requested.
 * @private
 */
goog.module.ModuleLoader.prototype.handleSuccess_ = function(
    bulkLoader, moduleIds) {
  goog.log.info(this.logger, 'Code loaded for module(s): ' + moduleIds);

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
goog.module.ModuleLoader.prototype.prefetchModule = function(id, moduleInfo) {
  // Do not prefetch in debug mode
  if (this.getDebugMode()) {
    return;
  }
  goog.log.info(this.logger, `Prefetching module: ${id}`);
  var loadStatus = this.loadingModulesStatus_[[id]];
  if (loadStatus) {
    return;
  }
  var moduleInfoMap = {};
  moduleInfoMap[id] = moduleInfo;
  loadStatus =
      goog.module.ModuleLoader.LoadStatus.createForIds_([id], moduleInfoMap);
  this.loadingModulesStatus_[[id]] = loadStatus;
  if (this.getUseScriptTags()) {
    const links = [];
    const insertPos = document.head || document.documentElement;
    for (var i = 0; i < loadStatus.trustedRequestUris.length; i++) {
      const link = goog.module.ModuleLoader.createPreloadScriptElement_(
          loadStatus.trustedRequestUris[i]);
      links.push(link);
      insertPos.insertBefore(link, insertPos.firstChild);
    }
    loadStatus.successFn = () => {
      for (var i = 0; i < links.length; i++) {
        const link = links[i];
        goog.dom.removeNode(link);
      }
    };
  } else {
    this.downloadModules_([id]);
  }
};


/**
 * Downloads a list of JavaScript modules.
 *
 * @param {?Array<string>} ids The module ids in dependency order.
 * @private
 */
goog.module.ModuleLoader.prototype.downloadModules_ = function(ids) {
  const debugMode = this.getDebugMode();
  const sourceUrlInjection = this.usingSourceUrlInjection_();
  const useScriptTags = this.getUseScriptTags();
  if ((debugMode + sourceUrlInjection + useScriptTags) > 1) {
    const effectiveFlag = useScriptTags ?
        'useScriptTags' :
        (debugMode && !sourceUrlInjection) ? 'debug' : 'sourceUrlInjection';
    goog.log.warning(
        this.logger,
        `More than one of debugMode (set to ${debugMode}), ` +
            `useScriptTags (set to ${useScriptTags}), ` +
            `and sourceUrlInjection (set to ${sourceUrlInjection}) ` +
            `is enabled. Proceeding with download as if ` +
            `${effectiveFlag} is set to true and the rest to false.`);
  }
  const loadStatus = goog.asserts.assert(this.loadingModulesStatus_[ids]);

  if (useScriptTags) {
    this.loadWithNonAsyncScriptTag_(loadStatus, ids);
  } else if (debugMode && !sourceUrlInjection) {
    // In debug mode use <script> tags rather than XHRs to load the files.
    // This makes it possible to debug and inspect stack traces more easily.
    // It's also possible to use it to load JavaScript files that are hosted on
    // another domain.
    // The scripts need to load serially, so this is much slower than parallel
    // script loads with source url injection.
    goog.net.jsloader.safeLoadMany(loadStatus.trustedRequestUris);
  } else {
    goog.log.info(
        this.logger,
        'downloadModules ids:' + ids + ' uris:' + loadStatus.requestUris);

    var bulkLoader = new goog.net.BulkLoader(loadStatus.requestUris);

    var eventHandler = this.eventHandler_;
    eventHandler.listen(
        bulkLoader, goog.net.EventType.SUCCESS,
        goog.bind(this.handleSuccess_, this, bulkLoader, ids));
    eventHandler.listen(
        bulkLoader, goog.net.EventType.ERROR,
        goog.bind(this.handleError_, this, bulkLoader, ids));
    bulkLoader.load();
  }
};


/**
 * Downloads a list of script URIS using <script async=false.../>, which
 * guarantees executuion order.
 * @param {!goog.module.ModuleLoader.LoadStatus} loadStatus The load status
 *     object for this module-load.
 *  @param {?Array<string>} ids The module ids in dependency order.
 * @private
 */
goog.module.ModuleLoader.prototype.loadWithNonAsyncScriptTag_ = function(
    loadStatus, ids) {
  goog.log.info(this.logger, `Loading initiated for: ${ids}`);
  if (loadStatus.trustedRequestUris.length == 0) {
    if (loadStatus.successFn) {
      loadStatus.successFn();
      return;
    }
  }

  // We'll execute the success callback when the last script enqueed reaches
  // onLoad.
  let lastScript = null;
  const insertPos = document.head || document.documentElement;

  for (var i = 0; i < loadStatus.trustedRequestUris.length; i++) {
    const url = loadStatus.trustedRequestUris[i];
    const urlLength = loadStatus.requestUris[i].length;
    goog.asserts.assert(
        urlLength <= goog.module.ModuleLoader.URL_MAX_LENGTH_,
        `Module url length is ${urlLength}, which is greater than limit of ` +
            `${goog.module.ModuleLoader.URL_MAX_LENGTH_}. This should never ` +
            `happen.`);

    const scriptElement = goog.module.ModuleLoader.createScriptElement_(url);

    scriptElement.onload = () => {
      scriptElement.onload = null;
      scriptElement.onerror = null;
      goog.dom.removeNode(scriptElement);
      if (scriptElement == lastScript) {
        goog.log.info(this.logger, `Loading complete for: ${ids}`);
        lastScript = null;
        if (loadStatus.successFn) {
          loadStatus.successFn();
        }
      }
    };

    scriptElement.onerror = () => {
      goog.log.error(
          this.logger, `Network error when loading module(s): ${ids}`);
      scriptElement.onload = null;
      scriptElement.onerror = null;
      goog.dom.removeNode(scriptElement);
      this.handleErrorHelper_(
          ids, loadStatus.errorFn,
          goog.module.ModuleLoader.SYNTAX_OR_NETWORK_ERROR_CODE_);
      if (lastScript == scriptElement) {
        lastScript = null;
      } else {
        goog.log.error(
            this.logger,
            `Dependent requests were made in parallel with failed request ` +
                `for module(s) "${ids}". Non-recoverable out-of-order ` +
                `execution may occur.`);
      }
    };
    lastScript = scriptElement;
    insertPos.insertBefore(scriptElement, insertPos.firstChild);
  }
};


/**
 * Handles an error during a request for one or more modules.
 * @param {goog.net.BulkLoader} bulkLoader The bulk loader.
 * @param {Array<string>} moduleIds The ids of the modules requested.
 * @param {!goog.net.BulkLoader.LoadErrorEvent} event The load error event.
 * @private
 */
goog.module.ModuleLoader.prototype.handleError_ = function(
    bulkLoader, moduleIds, event) {
  var loadStatus = this.loadingModulesStatus_[moduleIds];
  // The bulk loader doesn't cancel other requests when a request fails. We will
  // delete the loadStatus in the first failure, so it will be undefined in
  // subsequent errors.
  if (loadStatus) {
    delete this.loadingModulesStatus_[moduleIds];
    this.handleErrorHelper_(moduleIds, loadStatus.errorFn, event.status);
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
 * @param {Array<string>} moduleIds The ids of the modules requested.
 * @param {?function(?number)} errorFn The function to call on failure.
 * @param {?number} status The response status.
 * @param {!Error=} opt_error The error encountered, if available.
 * @private
 */
goog.module.ModuleLoader.prototype.handleErrorHelper_ = function(
    moduleIds, errorFn, status, opt_error) {
  this.dispatchEvent(new goog.module.ModuleLoader.RequestErrorEvent(
      moduleIds, status, opt_error));

  goog.log.warning(this.logger, 'Request failed for module(s): ' + moduleIds);

  if (errorFn) {
    errorFn(status);
  }
};


/**
 * Events dispatched by the ModuleLoader.
 * @const
 */
goog.module.ModuleLoader.EventType = {
  /**
   * @const {!goog.events.EventId<
   *     !goog.module.ModuleLoader.EvaluateCodeEvent>} Called after the code for
   *     a module is evaluated.
   */
  EVALUATE_CODE:
      new goog.events.EventId(goog.events.getUniqueId('evaluateCode')),

  /**
   * @const {!goog.events.EventId<
   *     !goog.module.ModuleLoader.RequestSuccessEvent>} Called when the
   *     BulkLoader finishes successfully.
   */
  REQUEST_SUCCESS:
      new goog.events.EventId(goog.events.getUniqueId('requestSuccess')),

  /**
   * @const {!goog.events.EventId<
   *     !goog.module.ModuleLoader.RequestErrorEvent>} Called when the
   *     BulkLoader fails, or code loading fails.
   */
  REQUEST_ERROR:
      new goog.events.EventId(goog.events.getUniqueId('requestError'))
};



/**
 * @param {Array<string>} moduleIds The ids of the modules being evaluated.
 * @constructor
 * @extends {goog.events.Event}
 * @final
 * @protected
 */
goog.module.ModuleLoader.EvaluateCodeEvent = function(moduleIds) {
  goog.module.ModuleLoader.EvaluateCodeEvent.base(
      this, 'constructor', goog.module.ModuleLoader.EventType.EVALUATE_CODE);

  /**
   * @type {Array<string>}
   */
  this.moduleIds = moduleIds;
};
goog.inherits(goog.module.ModuleLoader.EvaluateCodeEvent, goog.events.Event);



/**
 * @param {Array<string>} moduleIds The ids of the modules being evaluated.
 * @constructor
 * @extends {goog.events.Event}
 * @final
 * @protected
 */
goog.module.ModuleLoader.RequestSuccessEvent = function(moduleIds) {
  goog.module.ModuleLoader.RequestSuccessEvent.base(
      this, 'constructor', goog.module.ModuleLoader.EventType.REQUEST_SUCCESS);

  /**
   * @type {Array<string>}
   */
  this.moduleIds = moduleIds;
};
goog.inherits(goog.module.ModuleLoader.RequestSuccessEvent, goog.events.Event);



/**
 * @param {?Array<string>} moduleIds The ids of the modules being evaluated.
 * @param {?number} status The response status.
 * @param {!Error=} opt_error The error encountered, if available.
 * @constructor
 * @extends {goog.events.Event}
 * @final
 * @protected
 */
goog.module.ModuleLoader.RequestErrorEvent = function(
    moduleIds, status, opt_error) {
  goog.module.ModuleLoader.RequestErrorEvent.base(
      this, 'constructor', goog.module.ModuleLoader.EventType.REQUEST_ERROR);

  /**
   * @type {?Array<string>}
   */
  this.moduleIds = moduleIds;

  /** @type {?number} */
  this.status = status;

  /** @type {?Error} */
  this.error = opt_error || null;
};
goog.inherits(goog.module.ModuleLoader.RequestErrorEvent, goog.events.Event);



/**
 * A class that keeps the state of the module during the loading process. It is
 * used to save loading information between modules download and evaluation.
 *  @param {!Array<!goog.html.TrustedResourceUrl>} trustedRequestUris the uris
 containing the modules implementing ids.

 * @constructor
 * @final
 */
goog.module.ModuleLoader.LoadStatus = function(trustedRequestUris) {
  /**
   * The request uris.
   * @final {!Array<string>}
   */
  this.requestUris =
      goog.array.map(trustedRequestUris, goog.html.TrustedResourceUrl.unwrap);

  /**
   * A TrustedResourceUrl version of `this.requestUris`
   * @final {!Array<!goog.html.TrustedResourceUrl>}
   */
  this.trustedRequestUris = trustedRequestUris;

  /**
   * The response texts.
   * @type {?Array<string>}
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


/**
 * Creates a `LoadStatus` object for tracking state during the loading of the
 * modules indexed in `ids`.
 *
 * @param {?Array<string>} ids the ids for this module load in dependency
 *   order.
 * @param {!Object<string, !goog.module.ModuleInfo>} moduleInfoMap A mapping
 *     from module id to ModuleInfo object.
 * @return {!goog.module.ModuleLoader.LoadStatus}
 * @private
 */
goog.module.ModuleLoader.LoadStatus.createForIds_ = function(
    ids, moduleInfoMap) {
  if (!ids) {
    return new goog.module.ModuleLoader.LoadStatus([]);
  }
  const trustedRequestUris = [];
  for (var i = 0; i < ids.length; i++) {
    goog.array.extend(trustedRequestUris, moduleInfoMap[ids[i]].getUris());
  }
  return new goog.module.ModuleLoader.LoadStatus(trustedRequestUris);
};
