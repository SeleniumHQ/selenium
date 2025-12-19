// Copyright 2017 The Closure Library Authors. All Rights Reserved.
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
 * @package
 * @supported IE 10+ and other browsers. IE 8 and IE 9 could be supported by
 * by making anti-clobbering support optional.
 */

goog.module('goog.html.sanitizer.ElementWeakMap');
goog.module.declareLegacyNamespace();

var noclobber = goog.require('goog.html.sanitizer.noclobber');

// We also need to check if WeakMap has been polyfilled, because we want to use
// ElementWeakMap instead of the polyfill.
/** @const {boolean} */
var NATIVE_WEAKMAP_SUPPORTED = typeof WeakMap != 'undefined' &&
    WeakMap.toString().indexOf('[native code]') != -1;

/** @const {string} */
var DATA_ATTRIBUTE_NAME_PREFIX = 'data-elementweakmap-index-';

// Increased every time a new ElementWeakMap is constructed, to guarantee
// that each weakmap uses a different attribute name.
var weakMapCount = 0;

/**
 * A weakmap-like implementation for browsers that don't support native WeakMap.
 * It uses a data attribute on the key element for O(1) lookups.
 * @template T
 * @constructor
 */
var ElementWeakMap = function() {
  /** @private {!Array<!Element>} */
  this.keys_ = [];

  /** @private {!Array<!T>} */
  this.values_ = [];

  /** @private @const {string} */
  this.dataAttributeName_ = DATA_ATTRIBUTE_NAME_PREFIX + weakMapCount++;
};

/**
 * Stores a `elementKey` -> `value` mapping.
 * @param {!Element} elementKey
 * @param {!T} value
 * @return {!ElementWeakMap}
 */
ElementWeakMap.prototype.set = function(elementKey, value) {
  if (noclobber.hasElementAttribute(elementKey, this.dataAttributeName_)) {
    var itemIndex = parseInt(
        noclobber.getElementAttribute(elementKey, this.dataAttributeName_), 10);
    this.values_[itemIndex] = value;
  } else {
    var itemIndex = this.values_.push(value) - 1;
    noclobber.setElementAttribute(
        elementKey, this.dataAttributeName_, itemIndex.toString());
    this.keys_.push(elementKey);
  }
  return this;
};

/**
 * Gets the value previously stored for `elementKey`, or undefined if no
 * value was stored for such key.
 * @param {!Element} elementKey
 * @return {!Element|undefined}
 */
ElementWeakMap.prototype.get = function(elementKey) {
  if (!noclobber.hasElementAttribute(elementKey, this.dataAttributeName_)) {
    return undefined;
  }
  var itemIndex = parseInt(
      noclobber.getElementAttribute(elementKey, this.dataAttributeName_), 10);
  return this.values_[itemIndex];
};

/** Clears the map. */
ElementWeakMap.prototype.clear = function() {
  this.keys_.forEach(function(el) {
    noclobber.removeElementAttribute(el, this.dataAttributeName_);
  }, this);
  this.keys_ = [];
  this.values_ = [];
};

/**
 * Returns either this weakmap adapter or the native weakmap implmentation, if
 * available.
 * @return {!ElementWeakMap|!WeakMap}
 */
ElementWeakMap.newWeakMap = function() {
  return NATIVE_WEAKMAP_SUPPORTED ? new WeakMap() : new ElementWeakMap();
};

exports = ElementWeakMap;
