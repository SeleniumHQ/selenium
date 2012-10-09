// Copyright 2012 Selenium committers
// Copyright 2012 Software Freedom Conservancy
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
//     You may obtain a copy of the License at
//
// http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview The base module responsible for bootstrapping the Closure
 * library and providing a means of loading Closure-based modules.
 *
 * Each script loaded by this module will be granted access to this module's
 * {@code require} function; all required non-native modules must be specified
 * relative to <em>this</em> module.
 *
 * This module will load all scripts from the "lib" subdirectory, unless the
 * SELENIUM_DEV_MODE environment variable has been set to 1, in which case all
 * scripts will be loaded from the Selenium client containing this script.
 */

'use strict';

var fs = require('fs'),
    path = require('path'),
    vm = require('vm');


/**
 * @type {string} Path to Closure's base file, relative to this module.
 * @const
 */
var CLOSURE_BASE_FILE_PATH = (function() {
  var relativePath = isDevMode() ?
      '../../../third_party/closure/goog/base.js' :
      './lib/goog/base.js';
  return path.join(__dirname, relativePath);
})();


/**
 * The protected context to host the Closure library.
 * @type {!Object}
 * @const
 */
var CLOSURE = vm.createContext({
  console: console,
  setTimeout: setTimeout,
  setInterval: setInterval,
  clearTimeout: clearTimeout,
  clearInterval: clearInterval,
  process: process,
  require: require,
  Buffer: Buffer,
  CLOSURE_IMPORT_SCRIPT: function(src) {
    src = path.join(path.dirname(CLOSURE_BASE_FILE_PATH), src);
    loadScript(src);
    return true;
  }
});


loadScript(CLOSURE_BASE_FILE_PATH);
if (isDevMode()) {
  loadScript(path.join(__dirname, '../../../javascript/deps.js'));

  exports.closure = CLOSURE;
}


function isDevMode() {
  return process.env['SELENIUM_DEV_MODE'] === '1';
}


/**
 * Synchronously loads a script into the protected Closure context.
 * @param {string} src Path to the file to load.
 */
function loadScript(src) {
  var contents = fs.readFileSync(src, 'utf8');
  vm.runInContext(contents, CLOSURE, src);
}


/**
 * Loads a symbol by name from the protected Closure context.
 * @param {string} symbol The symbol to load.
 * @return {*} The loaded symbol.
 * @throws {Error} If the symbol has not been defined.
 */
exports.require = function(symbol) {
  CLOSURE.goog.require(symbol);
  return CLOSURE.goog.getObjectByName(symbol);
};
