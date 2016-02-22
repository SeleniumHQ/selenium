// Copyright 2013 The Closure Library Authors.
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
 * @fileoverview A nodejs script for dynamically requiring Closure within
 * nodejs.
 *
 * Example of usage:
 * <code>
 * require('./bootstrap/nodejs')
 * goog.require('goog.ui.Component')
 * </code>
 *
 * This loads goog.ui.Component in the global scope.
 *
 * If you want to load custom libraries, you can require the custom deps file
 * directly. If your custom libraries introduce new globals, you may
 * need to run goog.nodeGlobalRequire to get them to load correctly.
 *
 * <code>
 * require('./path/to/my/deps.js')
 * goog.bootstrap.nodeJs.nodeGlobalRequire('./path/to/my/base.js')
 * goog.require('my.Class')
 * </code>
 *
 * @author nick@medium.com (Nick Santos)
 *
 * @nocompile
 */


var fs = require('fs');
var path = require('path');
var vm = require('vm');


/**
 * The goog namespace in the global scope.
 */
global.goog = {};


/**
 * Imports a script using Node's require() API.
 *
 * @param {string} src The script source.
 * @param {string=} opt_sourceText The optional source text to evaluate.
 * @return {boolean} True if the script was imported, false otherwise.
 */
global.CLOSURE_IMPORT_SCRIPT = function(src, opt_sourceText) {
  // Sources are always expressed relative to closure's base.js, but
  // require() is always relative to the current source.
  if (opt_sourceText === undefined) {
      require('./../' + src);
  } else {
      eval(opt_sourceText);
  }
  return true;
};


/**
 * Loads a file when using Closure's goog.require() API with goog.modules.
 *
 * @param {string} src The file source.
 * @return {string} The file contents.
 */

global.CLOSURE_LOAD_FILE_SYNC = function(src) {
  return fs.readFileSync(
      path.resolve(__dirname, '..', src), { encoding: 'utf-8' });
};


// Declared here so it can be used to require base.js
function nodeGlobalRequire(file) {
  vm.runInThisContext.call(
      global, fs.readFileSync(file), file);
}


// Load Closure's base.js into memory.  It is assumed base.js is in the
// directory above this directory given this script's location in
// bootstrap/nodejs.js.
nodeGlobalRequire(path.resolve(__dirname, '..', 'base.js'));


/**
 * Bootstraps a file into the global scope.
 *
 * This is strictly for cases where normal require() won't work,
 * because the file declares global symbols with 'var' that need to
 * be added to the global scope.
 * @suppress {missingProvide}
 *
 * @param {string} file The path to the file.
 */
goog.nodeGlobalRequire = nodeGlobalRequire;

