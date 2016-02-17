// Copyright 2006 The Closure Library Authors. All Rights Reserved.
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
 *
 * @fileoverview This class supports the dynamic loading of compiled
 * javascript modules at runtime, as descibed in the designdoc.
 *
 *   <http://go/js_modules_design>
 *
 */

goog.provide('goog.module.Loader');

goog.require('goog.Timer');
goog.require('goog.array');
goog.require('goog.asserts');
goog.require('goog.dom');
goog.require('goog.dom.TagName');
/** @suppress {extraRequire} */
goog.require('goog.module');
goog.require('goog.object');



/**
 * The dynamic loading functionality is defined as a class. The class
 * will be used as singleton. There is, however, a two step
 * initialization procedure because parameters need to be passed to
 * the goog.module.Loader instance.
 *
 * @constructor
 * @final
 */
goog.module.Loader = function() {
  /**
   * Map of module name/array of {symbol name, callback} pairs that are pending
   * to be loaded.
   * @type {Object}
   * @private
   */
  this.pending_ = {};

  /**
   * Provides associative access to each module and the symbols of each module
   * that have aready been loaded (one lookup for the module, another lookup
   * on the module for the symbol).
   * @type {Object}
   * @private
   */
  this.modules_ = {};

  /**
   * Map of module name to module url. Used to avoid fetching the same URL
   * twice by keeping track of in-flight URLs.
   * Note: this allows two modules to be bundled into the same file.
   * @type {Object}
   * @private
   */
  this.pendingModuleUrls_ = {};

  /**
   * The base url to load modules from. This property will be set in init().
   * @type {?string}
   * @private
   */
  this.urlBase_ = null;

  /**
   * Array of modules that have been requested before init() was called.
   * If require() is called before init() was called, the required
   * modules can obviously not yet be loaded, because their URL is
   * unknown. The modules that are requested before init() are
   * therefore stored in this array, and they are loaded at init()
   * time.
   * @type {Array<string>}
   * @private
   */
  this.pendingBeforeInit_ = [];
};
goog.addSingletonGetter(goog.module.Loader);


/**
 * Wrapper of goog.module.Loader.require() for use in modules.
 * See method goog.module.Loader.require() for
 * explanation of params.
 *
 * @param {string} module The name of the module. Usually, the value
 *     is defined as a constant whose name starts with MOD_.
 * @param {number|string} symbol The ID of the symbol. Usually, the value is
 *     defined as a constant whose name starts with SYM_.
 * @param {Function} callback This function will be called with the
 *     resolved symbol as the argument once the module is loaded.
 */
goog.module.Loader.require = function(module, symbol, callback) {
  goog.module.Loader.getInstance().require(module, symbol, callback);
};


/**
 * Wrapper of goog.module.Loader.provide() for use in modules
 * See method goog.module.Loader.provide() for explanation of params.
 *
 * @param {string} module The name of the module. Cf. parameter module
 *     of method require().
 * @param {number|string=} opt_symbol The symbol being defined, or nothing
 *     when all symbols of the module are defined. Cf. parameter symbol of
 *     method require().
 * @param {Object=} opt_object The object bound to the symbol, or nothing when
 *     all symbols of the module are defined.
 */
goog.module.Loader.provide = function(module, opt_symbol, opt_object) {
  goog.module.Loader.getInstance().provide(module, opt_symbol, opt_object);
};


/**
 * Wrapper of init() so that we only need to export this single
 * identifier instead of three. See method goog.module.Loader.init() for
 * explanation of param.
 *
 * @param {string} urlBase The URL of the base library.
 * @param {Function=} opt_urlFunction Function that creates the URL for the
 *     module file. It will be passed the base URL for module files and the
 *     module name and should return the fully-formed URL to the module file to
 *     load.
 */
goog.module.Loader.init = function(urlBase, opt_urlFunction) {
  goog.module.Loader.getInstance().init(urlBase, opt_urlFunction);
};


/**
 * Produces a function that delegates all its arguments to a
 * dynamically loaded function. This is used to export dynamically
 * loaded functions.
 *
 * @param {string} module The module to load from.
 * @param {number|string} symbol The ID of the symbol to load from the module.
 *     This symbol must resolve to a function.
 * @return {!Function} A function that forwards all its arguments to
 *     the dynamically loaded function specified by module and symbol.
 */
goog.module.Loader.loaderCall = function(module, symbol) {
  return function() {
    var args = arguments;
    goog.module.Loader.require(
        module, symbol, function(f) { f.apply(null, args); });
  };
};


/**
 * Creates a full URL to the compiled module code given a base URL and a
 * module name. By default it's urlBase + '_' + module + '.js'.
 * @param {string} urlBase URL to the module files.
 * @param {string} module Module name.
 * @return {string} The full url to the module binary.
 * @private
 */
goog.module.Loader.prototype.getModuleUrl_ = function(urlBase, module) {
  return urlBase + '_' + module + '.js';
};


/**
 * The globally exported name of the load callback. Matches the
 * definition in the js_modular_binary() BUILD rule.
 * @type {string}
 */
goog.module.Loader.LOAD_CALLBACK = '__gjsload__';


/**
 * Loads the module by evaluating the javascript text in the current
 * scope. Uncompiled, base identifiers are visible in the global scope;
 * when compiled they are visible in the closure of the anonymous
 * namespace. Notice that this cannot be replaced by the global eval,
 * because the global eval isn't in the scope of the anonymous
 * namespace function that the jscompiled code lives in.
 *
 * @param {string} t_ The javascript text to evaluate. IMPORTANT: The
 *   name of the identifier is chosen so that it isn't compiled and
 *   hence cannot shadow compiled identifiers in the surrounding scope.
 * @private
 */
goog.module.Loader.loaderEval_ = function(t_) {
  eval(t_);
};


/**
 * Initializes the Loader to be fully functional. Also executes load
 * requests that were received before initialization. Must be called
 * exactly once, with the URL of the base library. Module URLs are
 * derived from the URL of the base library by inserting the module
 * name, preceded by a period, before the .js prefix of the base URL.
 *
 * @param {string} baseUrl The URL of the base library.
 * @param {Function=} opt_urlFunction Function that creates the URL for the
 *     module file. It will be passed the base URL for module files and the
 *     module name and should return the fully-formed URL to the module file to
 *     load.
 */
goog.module.Loader.prototype.init = function(baseUrl, opt_urlFunction) {
  // For the use by the module wrappers, loaderEval_ is exported to
  // the page. Note that, despite the name, this is not part of the
  // API, so it is here and not in api_app.js. Cf. BUILD. Note this is
  // done before the first load requests are sent.
  goog.exportSymbol(
      goog.module.Loader.LOAD_CALLBACK, goog.module.Loader.loaderEval_);

  this.urlBase_ = baseUrl.replace(/\.js$/, '');
  if (opt_urlFunction) {
    this.getModuleUrl_ = opt_urlFunction;
  }

  goog.array.forEach(
      this.pendingBeforeInit_, function(module) { this.load_(module); }, this);
  goog.array.clear(this.pendingBeforeInit_);
};


/**
 * Requests the loading of a symbol from a module. When the module is
 * loaded, the requested symbol will be passed as argument to the
 * function callback.
 *
 * @param {string} module The name of the module. Usually, the value
 *     is defined as a constant whose name starts with MOD_.
 * @param {number|string} symbol The ID of the symbol. Usually, the value is
 *     defined as a constant whose name starts with SYM_.
 * @param {Function} callback This function will be called with the
 *     resolved symbol as the argument once the module is loaded.
 */
goog.module.Loader.prototype.require = function(module, symbol, callback) {
  var pending = this.pending_;
  var modules = this.modules_;
  if (modules[module]) {
    // already loaded
    callback(modules[module][symbol]);
  } else if (pending[module]) {
    // loading is pending from another require of the same module
    pending[module].push([symbol, callback]);
  } else {
    // not loaded, and not requested
    pending[module] = [[symbol, callback]];  // Yes, really [[ ]].
    // Defer loading to initialization if Loader is not yet
    // initialized, otherwise load the module.
    if (goog.isString(this.urlBase_)) {
      this.load_(module);
    } else {
      this.pendingBeforeInit_.push(module);
    }
  }
};


/**
 * Registers a symbol in a loaded module. When called without symbol,
 * registers the module to be fully loaded and executes all callbacks
 * from pending require() callbacks for this module.
 *
 * @param {string} module The name of the module. Cf. parameter module
 *     of method require().
 * @param {number|string=} opt_symbol The symbol being defined, or nothing when
 *     all symbols of the module are defined. Cf. parameter symbol of method
 *     require().
 * @param {Object=} opt_object The object bound to the symbol, or nothing when
 *     all symbols of the module are defined.
 */
goog.module.Loader.prototype.provide = function(
    module, opt_symbol, opt_object) {
  var modules = this.modules_;
  var pending = this.pending_;
  if (!modules[module]) {
    modules[module] = {};
  }
  if (opt_object) {
    // When an object is provided, just register it.
    modules[module][opt_symbol] = opt_object;
  } else if (pending[module]) {
    // When no object is provided, and there are pending require()
    // callbacks for this module, execute them.
    for (var i = 0; i < pending[module].length; ++i) {
      var symbol = pending[module][i][0];
      var callback = pending[module][i][1];
      callback(modules[module][symbol]);
    }
    delete pending[module];
    delete this.pendingModuleUrls_[module];
  }
};


/**
 * Starts to load a module. Assumes that init() was called.
 *
 * @param {string} module The name of the module.
 * @private
 */
goog.module.Loader.prototype.load_ = function(module) {
  // NOTE(user): If the module request happens inside a click handler
  // (presumably inside any user event handler, but the onload event
  // handler is fine), IE will load the script but not execute
  // it. Thus we break out of the current flow of control before we do
  // the load. For the record, for IE it would have been enough to
  // just defer the assignment to src. Safari doesn't execute the
  // script if the assignment to src happens *after* the script
  // element is inserted into the DOM.
  goog.Timer.callOnce(function() {
    // The module might have been registered in the interim (if fetched as part
    // of another module fetch because they share the same url)
    if (this.modules_[module]) {
      return;
    }

    goog.asserts.assertString(this.urlBase_);
    var url = this.getModuleUrl_(this.urlBase_, module);

    // Check if specified URL is already in flight
    var urlInFlight = goog.object.containsValue(this.pendingModuleUrls_, url);
    this.pendingModuleUrls_[module] = url;
    if (urlInFlight) {
      return;
    }

    var s = goog.dom.createDom(
        goog.dom.TagName.SCRIPT, {'type': 'text/javascript', 'src': url});
    document.body.appendChild(s);
  }, 0, this);
};
