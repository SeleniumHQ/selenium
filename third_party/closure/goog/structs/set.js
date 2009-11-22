// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

// Copyright 2006 Google Inc. All Rights Reserved.

/**
 * @fileoverview Datastructure: Set.
 *
 *
 * This class implements a set data structure. Adding and removing is O(1). It
 * supports both object and primitive values. Be careful because you can add
 * both 1 and new Number(1), beacuse these are not the same. You can even add
 * multiple new Number(1) because these are not equal.
 */


goog.provide('goog.structs.Set');

goog.require('goog.structs');
goog.require('goog.structs.Map');


/**
 * Class for Set datastructure.
 *
 * @param {Array|Object} opt_values Initial values to start with.
 * @constructor
 */
goog.structs.Set = function(opt_values) {
  this.map_ = new goog.structs.Map;
  if (opt_values) {
    this.addAll(opt_values);
  }
};


/**
 * This is used to get the key or the hash. We are not using getHashCode
 * because it only works with objects.
 * @param {*} val Object or primitive value to get a key for.
 * @return {string} A unique key for this value/object.
 * @private
 */
goog.structs.Set.getKey_ = function(val) {
  var type = typeof val;
  if (type == 'object' && val || type == 'function') {
    return 'o' + goog.getHashCode(/** @type {Object} */ (val));
  } else {
    return type.substr(0, 1) + val;
  }
};


/**
 * @return {number} The number of objects in the Set.
 */
goog.structs.Set.prototype.getCount = function() {
  return this.map_.getCount();
};


/**
 * Add an object to the set.
 * @param {*} obj The object to add.
 */
goog.structs.Set.prototype.add = function(obj) {
  this.map_.set(goog.structs.Set.getKey_(obj), obj);
};


/**
 * Adds all objects from one goog.structs.Set to the current one. This can
 * take an array as well.
 * @param {Array|Object} set The set or array to add objects from.
 */
goog.structs.Set.prototype.addAll = function(set) {
  var values = goog.structs.getValues(set);
  var l = values.length;
  for (var i = 0; i < l; i++) {
    this.add(values[i]);
  }
};


/**
 * Removes all objects in one goog.structs.Set from the current one. This can
 * take an array as well.
 * @param {Array|Object} set The set or array to remove objects from.
 */
goog.structs.Set.prototype.removeAll = function(set) {
  var values = goog.structs.getValues(set);
  var l = values.length;
  for (var i = 0; i < l; i++) {
    this.remove(values[i]);
  }
};


/**
 * Removes an object from the set.
 * @param {*} obj The object to remove.
 * @return {boolean} Whether object was removed.
 */
goog.structs.Set.prototype.remove = function(obj) {
  return this.map_.remove(goog.structs.Set.getKey_(obj));
};


/**
 * Removes all objects from the set.
 */
goog.structs.Set.prototype.clear = function() {
  this.map_.clear();
};


/**
 * Whether the set contains no objects.
 * @return {boolean} True if there are no objects in the goog.structs.Set.
 */
goog.structs.Set.prototype.isEmpty = function() {
  return this.map_.isEmpty();
};


/**
 * Whether the goog.structs.Set contains an object or not.
 * @param {*} obj The object to test for.
 * @return {boolean} True if the set contains the object.
 */
goog.structs.Set.prototype.contains = function(obj) {
  return this.map_.containsKey(goog.structs.Set.getKey_(obj));
};


/**
 * Whether the goog.structs.Set contains all elements of the collection.
 * Ignores identical elements, e.g. set([1, 2]) contains [1, 1].
 * @param {Object} col A collection-like object.
 * @return {boolean} True if the set contains all elements.
 */
goog.structs.Set.prototype.containsAll = function(col) {
  return goog.structs.every(col, this.contains, this);
};


/**
 * Find all elements present in both this and the given set.
 * @param {Array|Object} set The set or array to test against.
 * @return {goog.structs.Set} A new set containing all elements present in both
 *     this object and specified set.
 */
goog.structs.Set.prototype.intersection = function(set) {
  var result = new goog.structs.Set();

  var values = goog.structs.getValues(set);
  for (var i = 0; i < values.length; i++) {
    var value = values[i];
    if (this.contains(value)) {
      result.add(value);
    }
  }

  return result;
};


/**
 * Inserts the objects in the set into a new Array.
 * @return {Array} An array of all the values in the Set.
 */
goog.structs.Set.prototype.getValues = function() {
  return this.map_.getValues();
};


/**
 * Does a shallow clone of the goog.structs.Set.
 * @return {goog.structs.Set} The cloned Set.
 */
goog.structs.Set.prototype.clone = function() {
  return new goog.structs.Set(this);
};


/**
 * Compares this set with the input collection for equality.
 * Its time complexity is O(|col|) and uses equals (==) to test the existence
 * of the elements.
 * @param {Object} col A collection-like object.
 * @return {boolean} True if the collection consists of the same elements as
 *     the set in arbitrary order.
 */
goog.structs.Set.prototype.equals = function(col) {
  return this.getCount() == goog.structs.getCount(col) && this.isSubsetOf(col);
};


/**
 * Decides if the input collection contains all elements of this set.
 * Its time complexity is O(|col|) and uses equals (==) to test the existence
 * of the elements.
 * @param {Object} col A collection-like object.
 * @return {boolean} True if the set is a subset of the collection.
 */
goog.structs.Set.prototype.isSubsetOf = function(col) {
  var colCount = goog.structs.getCount(col);
  if (this.getCount() > colCount) {
    return false;
  }
  // TODO Find the minimal collection size where the conversion makes
  // the contains() method faster.
  if (!(col instanceof goog.structs.Set) && colCount > 5) {
    // Make the goog.structs.contains(col, value) faster if necessary.
    col = new goog.structs.Set(col);
  }
  return goog.structs.every(this, function(value) {
    return goog.structs.contains(col, value);
  });
};


/**
 * Returns an iterator that iterates over the elements in the set.
 * @param {boolean} opt_keys Ignored for sets.
 * @return {goog.iter.Iterator} An iterator over the elements in the set.
 */
goog.structs.Set.prototype.__iterator__ = function(opt_keys) {
  return this.map_.__iterator__(false);
};
