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
*
*
 */

goog.provide('goog.module');

goog.require('goog.array');
goog.require('goog.module.Loader');

/**
 * Wrapper of goog.module.Loader.require() for use in modules.
 * See method goog.module.Loader.require() for
 * explanation of params.
 *
 * @param {string} module The name of the module. Usually, the value
 *     is defined as a constant whose name starts with MOD_.
 * @param {number} symbol The ID of the symbol. Usually, the value is
 *     defined as a constant whose name starts with SYM_.
 * @param {Function} callback This function will be called with the
 *     resolved symbol as the argument once the module is loaded.
 */
goog.module.require = function(module, symbol, callback) {
  goog.module.Loader.getInstance().require(module, symbol, callback);
};


/**
 * Wrapper of goog.module.Loader.provide() for use in modules
 * See method goog.module.Loader.provide() for explanation of params.
 *
 * @param {string} module The name of the module. Cf. parameter module
 *     of method require().
 * @param {number=} opt_symbol The symbol being defined, or nothing when all
 *     symbols of the module are defined. Cf. parameter symbol of method
 *     require().
 * @param {Object=} opt_object The object bound to the symbol, or nothing when
 *     all symbols of the module are defined.
 */
goog.module.provide = function(module, opt_symbol, opt_object) {
  goog.module.Loader.getInstance().provide(
      module, opt_symbol, opt_object);
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
goog.module.initLoader = function(urlBase, opt_urlFunction) {
  goog.module.Loader.getInstance().init(urlBase, opt_urlFunction);
};


/**
 * Produces a function that delegates all its arguments to a
 * dynamically loaded function. This is used to export dynamically
 * loaded functions.
 *
 * @param {string} module The module to load from.
 * @param {number} symbol The symbol to load from the module. This
 *     symbol must resolve to a function.
 * @return {!Function} A function that forwards all its arguments to
 *     the dynamically loaded function specified by module and symbol.
 */
goog.module.loaderCall = function(module, symbol) {
  return function() {
    var args = arguments;
    goog.module.require(module, symbol, function(f) {
      f.apply(null, args);
    });
  };
};


/**
 * Requires symbols for multiple modules, and invokes a final callback
 * on the condition that all of them are loaded. I.e. a barrier for
 * loading of multiple symbols. If no symbols are required, the
 * final callback is called immediately.
 *
 * @param {Array.<Object>} symbolRequests A
 *     list of tuples of module, symbol, callback (analog to the arguments
 *     to require(), above). These will each be require()d
 *     individually. NOTE: This argument will be modified during execution
 *     of the function.
 * @param {Function} finalCb A function that is called when all
 *     required symbols are loaded.
 */
goog.module.requireMultipleSymbols = function(symbolRequests, finalCb) {
  var I = symbolRequests.length;
  if (I == 0) {
    finalCb();
  } else {
    for (var i = 0; i < I; ++i) {
      goog.module.requireMultipleSymbolsHelper_(symbolRequests, i, finalCb);
    }
  }
};


/**
 * Used by requireMultipleSymbols() to load each required symbol and
 * keep track how many are loaded, and finally invoke the barrier
 * callback when they are all done.
 *
 * @param {Array.<Object>} symbolRequests Same as in
 *     requireMultipleSymbols().
 * @param {number} i The single module that is required in this invocation.
 * @param {Function} finalCb Same as in requireMultipleSymbols().
 * @private
 */
goog.module.requireMultipleSymbolsHelper_ = function(symbolRequests, i,
                                                     finalCb) {
  var r = symbolRequests[i];
  var module = r[0];
  var symbol = r[1];
  var symbolCb = r[2];
  goog.module.require(module, symbol, function() {
    symbolCb.apply(this, arguments);
    symbolRequests[i] = null;
    if (goog.array.every(symbolRequests, goog.module.isNull_)) {
      finalCb();
    }
  });
};


/**
 * Checks if the given element is null.
 *
 * @param {Object} el The element to check if null.
 * @param {number} i The index of the element.
 * @param {Array.<Object>} arr The array that contains the element.
 * @return {boolean} TRUE iff the element is null.
 * @private
 */
goog.module.isNull_ = function(el, i, arr) {
  return el == null;
};
