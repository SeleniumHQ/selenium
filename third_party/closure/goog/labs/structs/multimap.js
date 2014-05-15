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
 * @fileoverview A collection similar to
 * {@code goog.labs.structs.Map}, but also allows associating multiple
 * values with a single key.
 *
 * This implementation ensures that you can use any string keys.
 *
 */

goog.provide('goog.labs.structs.Multimap');

goog.require('goog.array');
goog.require('goog.labs.object');
goog.require('goog.labs.structs.Map');



/**
 * Creates a new multimap.
 * @constructor
 */
goog.labs.structs.Multimap = function() {
  this.clear();
};


/**
 * The backing map.
 * @type {!goog.labs.structs.Map}
 * @private
 */
goog.labs.structs.Multimap.prototype.map_;


/**
 * @type {number}
 * @private
 */
goog.labs.structs.Multimap.prototype.count_ = 0;


/**
 * Clears the multimap.
 */
goog.labs.structs.Multimap.prototype.clear = function() {
  this.count_ = 0;
  this.map_ = new goog.labs.structs.Map();
};


/**
 * Clones this multimap.
 * @return {!goog.labs.structs.Multimap} A multimap that contains all
 *     the mapping this multimap has.
 */
goog.labs.structs.Multimap.prototype.clone = function() {
  var map = new goog.labs.structs.Multimap();
  map.addAllFromMultimap(this);
  return map;
};


/**
 * Adds the given (key, value) pair to the map. The (key, value) pair
 * is guaranteed to be added.
 * @param {string} key The key to add.
 * @param {*} value The value to add.
 */
goog.labs.structs.Multimap.prototype.add = function(key, value) {
  var values = this.map_.get(key);
  if (!values) {
    this.map_.set(key, (values = []));
  }

  values.push(value);
  this.count_++;
};


/**
 * Stores a collection of values to the given key. Does not replace
 * existing (key, value) pairs.
 * @param {string} key The key to add.
 * @param {!Array.<*>} values The values to add.
 */
goog.labs.structs.Multimap.prototype.addAllValues = function(key, values) {
  goog.array.forEach(values, function(v) {
    this.add(key, v);
  }, this);
};


/**
 * Adds the contents of the given map/multimap to this multimap.
 * @param {!(goog.labs.structs.Map|goog.labs.structs.Multimap)} map The
 *     map to add.
 */
goog.labs.structs.Multimap.prototype.addAllFromMultimap = function(map) {
  goog.array.forEach(map.getEntries(), function(entry) {
    this.add(entry[0], entry[1]);
  }, this);
};


/**
 * Replaces all the values for the given key with the given values.
 * @param {string} key The key whose values are to be replaced.
 * @param {!Array.<*>} values The new values. If empty, this is
 *     equivalent to {@code removaAll(key)}.
 */
goog.labs.structs.Multimap.prototype.replaceValues = function(key, values) {
  this.removeAll(key);
  this.addAllValues(key, values);
};


/**
 * Gets the values correspond to the given key.
 * @param {string} key The key to retrieve.
 * @return {!Array.<*>} An array of values corresponding to the given
 *     key. May be empty. Note that the ordering of values are not
 *     guaranteed to be consistent.
 */
goog.labs.structs.Multimap.prototype.get = function(key) {
  var values = /** @type {Array.<string>} */ (this.map_.get(key));
  return values ? goog.array.clone(values) : [];
};


/**
 * Removes a single occurrence of (key, value) pair.
 * @param {string} key The key to remove.
 * @param {*} value The value to remove.
 * @return {boolean} Whether any matching (key, value) pair is removed.
 */
goog.labs.structs.Multimap.prototype.remove = function(key, value) {
  var values = /** @type {Array.<string>} */ (this.map_.get(key));
  if (!values) {
    return false;
  }

  var removed = goog.array.removeIf(values, function(v) {
    return goog.labs.object.is(value, v);
  });

  if (removed) {
    this.count_--;
    if (values.length == 0) {
      this.map_.remove(key);
    }
  }
  return removed;
};


/**
 * Removes all values corresponding to the given key.
 * @param {string} key The key whose values are to be removed.
 * @return {boolean} Whether any value is removed.
 */
goog.labs.structs.Multimap.prototype.removeAll = function(key) {
  // We have to first retrieve the values from the backing map because
  // we need to keep track of count (and correctly calculates the
  // return value). values may be undefined.
  var values = this.map_.get(key);
  if (this.map_.remove(key)) {
    this.count_ -= values.length;
    return true;
  }

  return false;
};


/**
 * @return {boolean} Whether the multimap is empty.
 */
goog.labs.structs.Multimap.prototype.isEmpty = function() {
  return !this.count_;
};


/**
 * @return {number} The count of (key, value) pairs in the map.
 */
goog.labs.structs.Multimap.prototype.getCount = function() {
  return this.count_;
};


/**
 * @param {string} key The key to check.
 * @param {string} value The value to check.
 * @return {boolean} Whether the (key, value) pair exists in the multimap.
 */
goog.labs.structs.Multimap.prototype.containsEntry = function(key, value) {
  var values = /** @type {Array.<string>} */ (this.map_.get(key));
  if (!values) {
    return false;
  }

  var index = goog.array.findIndex(values, function(v) {
    return goog.labs.object.is(v, value);
  });
  return index >= 0;
};


/**
 * @param {string} key The key to check.
 * @return {boolean} Whether the multimap contains at least one (key,
 *     value) pair with the given key.
 */
goog.labs.structs.Multimap.prototype.containsKey = function(key) {
  return this.map_.containsKey(key);
};


/**
 * @param {*} value The value to check.
 * @return {boolean} Whether the multimap contains at least one (key,
 *     value) pair with the given value.
 */
goog.labs.structs.Multimap.prototype.containsValue = function(value) {
  return goog.array.some(this.map_.getValues(),
      function(values) {
        return goog.array.some(/** @type {Array} */ (values), function(v) {
          return goog.labs.object.is(v, value);
        });
      });
};


/**
 * @return {!Array.<string>} An array of unique keys.
 */
goog.labs.structs.Multimap.prototype.getKeys = function() {
  return this.map_.getKeys();
};


/**
 * @return {!Array.<*>} An array of values. There may be duplicates.
 */
goog.labs.structs.Multimap.prototype.getValues = function() {
  return goog.array.flatten(this.map_.getValues());
};


/**
 * @return {!Array.<!Array>} An array of entries. Each entry is of the
 *     form [key, value].
 */
goog.labs.structs.Multimap.prototype.getEntries = function() {
  var keys = this.getKeys();
  var entries = [];
  for (var i = 0; i < keys.length; i++) {
    var key = keys[i];
    var values = this.get(key);
    for (var j = 0; j < values.length; j++) {
      entries.push([key, values[j]]);
    }
  }
  return entries;
};
