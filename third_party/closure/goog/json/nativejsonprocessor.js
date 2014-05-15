// Copyright 2012 The Closure Library Authors. All Rights Reserved.
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
 * @fileoverview Defines a class for parsing JSON using the browser's built in
 * JSON library.
 */

goog.provide('goog.json.NativeJsonProcessor');

goog.require('goog.asserts');
goog.require('goog.json');
goog.require('goog.json.Processor');



/**
 * A class that parses and stringifies JSON using the browser's built-in JSON
 * library, if it is avaliable.
 *
 * Note that the native JSON api has subtle differences across browsers, so
 * use this implementation with care.  See json_test#assertSerialize
 * for details on the differences from goog.json.
 *
 * This implementation is signficantly faster than goog.json, at least on
 * Chrome.  See json_perf.html for a perf test showing the difference.
 *
 * @param {?goog.json.Replacer=} opt_replacer An optional replacer to use during
 *     serialization.
 * @param {?goog.json.Reviver=} opt_reviver An optional reviver to use during
 *     parsing.
 * @constructor
 * @implements {goog.json.Processor}
 */
goog.json.NativeJsonProcessor = function(opt_replacer, opt_reviver) {
  goog.asserts.assert(goog.isDef(goog.global['JSON']), 'JSON not defined');

  /**
   * @type {goog.json.Replacer|null|undefined}
   * @private
   */
  this.replacer_ = opt_replacer;

  /**
   * @type {goog.json.Reviver|null|undefined}
   * @private
   */
  this.reviver_ = opt_reviver;
};


/** @override */
goog.json.NativeJsonProcessor.prototype.stringify = function(object) {
  return goog.global['JSON'].stringify(object, this.replacer_);
};


/** @override */
goog.json.NativeJsonProcessor.prototype.parse = function(s) {
  return goog.global['JSON'].parse(s, this.reviver_);
};
