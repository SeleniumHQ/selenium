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
 * @fileoverview Defines a class for parsing JSON using eval.
 */

goog.provide('goog.json.EvalJsonProcessor');

goog.require('goog.json');
goog.require('goog.json.Processor');
goog.require('goog.json.Serializer');



/**
 * A class that parses and stringifies JSON using eval (as implemented in
 * goog.json).
 * Adapts {@code goog.json} to the {@code goog.json.Processor} interface.
 *
 * @param {?goog.json.Replacer=} opt_replacer An optional replacer to use during
 *     serialization.
 * @param {?boolean=} opt_useUnsafeParsing Whether to use goog.json.unsafeParse
 *     for parsing. Safe parsing is very slow on large strings. On the other
 *     hand, unsafe parsing uses eval() without checking whether the string is
 *     valid, so it should only be used if you trust the source of the string.
 * @constructor
 * @implements {goog.json.Processor}
 */
goog.json.EvalJsonProcessor = function(opt_replacer, opt_useUnsafeParsing) {
  /**
   * @type {goog.json.Serializer}
   * @private
   */
  this.serializer_ = new goog.json.Serializer(opt_replacer);

  /**
   * @type {function(string): *}
   * @private
   */
  this.parser_ = opt_useUnsafeParsing ? goog.json.unsafeParse : goog.json.parse;
};


/** @override */
goog.json.EvalJsonProcessor.prototype.stringify = function(object) {
  return this.serializer_.serialize(object);
};


/** @override */
goog.json.EvalJsonProcessor.prototype.parse = function(s) {
  return this.parser_(s);
};
