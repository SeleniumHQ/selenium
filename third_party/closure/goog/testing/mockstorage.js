// Copyright 2011 The Closure Library Authors. All Rights Reserved.
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
 * @fileoverview Provides a JS storage class implementing the HTML5 Storage
 * interface.
 */


goog.setTestOnly('goog.testing.MockStorage');
goog.provide('goog.testing.MockStorage');


goog.require('goog.structs.Map');



/**
 * A JS storage instance, implementing the HTML5 Storage interface.
 * See http://www.w3.org/TR/webstorage/ for details.
 *
 * @constructor
 * @implements {Storage}
 * @final
 */
goog.testing.MockStorage = function() {
  /**
   * The underlying storage object.
   * @type {goog.structs.Map}
   * @private
   */
  this.store_ = new goog.structs.Map();

  /**
   * The number of elements in the storage.
   * @type {number}
   */
  this.length = 0;
};


/**
 * Sets an item to the storage.
 * @param {string} key Storage key.
 * @param {*} value Storage value. Must be convertible to string.
 * @override
 */
goog.testing.MockStorage.prototype.setItem = function(key, value) {
  this.store_.set(key, String(value));
  this.length = this.store_.getCount();
};


/**
 * Gets an item from the storage.  The item returned is the "structured clone"
 * of the value from setItem.  In practice this means it's the value cast to a
 * string.
 * @param {string} key Storage key.
 * @return {?string} Storage value for key; null if does not exist.
 * @override
 */
goog.testing.MockStorage.prototype.getItem = function(key) {
  var val = this.store_.get(key);
  // Enforce that getItem returns string values.
  return (val != null) ? /** @type {string} */ (val) : null;
};


/**
 * Removes and item from the storage.
 * @param {string} key Storage key.
 * @override
 */
goog.testing.MockStorage.prototype.removeItem = function(key) {
  this.store_.remove(key);
  this.length = this.store_.getCount();
};


/**
 * Clears the storage.
 * @override
 */
goog.testing.MockStorage.prototype.clear = function() {
  this.store_.clear();
  this.length = 0;
};


/**
 * Returns the key at the given index.
 * @param {number} index The index for the key.
 * @return {?string} Key at the given index, null if not found.
 * @override
 */
goog.testing.MockStorage.prototype.key = function(index) {
  return this.store_.getKeys()[index] || null;
};
