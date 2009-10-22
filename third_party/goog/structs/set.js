// Copyright 2006 Google Inc.
// All Rights Reserved.
// 
// Redistribution and use in source and binary forms, with or without
// modification, are permitted provided that the following conditions
// are met:
// 
//  * Redistributions of source code must retain the above copyright
//    notice, this list of conditions and the following disclaimer.
//  * Redistributions in binary form must reproduce the above copyright
//    notice, this list of conditions and the following disclaimer in
//    the documentation and/or other materials provided with the
//    distribution.
// 
// THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
// "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
// LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS
// FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE
// COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT,
// INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING,
// BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
// LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
// CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT
// LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN
// ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
// POSSIBILITY OF SUCH DAMAGE. 

/**
 * @fileoverview Datastructure: Set
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
 * Class for Set datastructure
 *
 * @param {goog.structs.Set} opt_set Initial values to start with.
 * @constructor
 */
goog.structs.Set = function(opt_set) {
  this.map_ = new goog.structs.Map;
  if (opt_set) {
    this.addAll(opt_set)
  }
};


/**
 * This is used to get the key or the hash. We are not using getHashCode
 * because it only works with objects
 * @param {*} val Object or primitive value to get a key for.
 * @return {string} A unique key for this value/object.
 * @private
 */
goog.structs.Set.getKey_ = function(val) {
  var type = typeof val;
  if (type == 'object') {
    return 'o' + goog.getHashCode(val);
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
  var values = goog.structs.Set.getValues(set);
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
  var values = goog.structs.Set.getValues(set);
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
 * Removes all objects from the set.
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
 * Find all elements present in both of 2 sets.
 * @param {Array|Object} set The set or array to test against.
 * @return {goog.structs.Set} A new set containing all elements present in both
 *     this object and specified set.
 */
goog.structs.Set.prototype.intersection = function(set) {
  var result = new goog.structs.Set();

  var values = goog.structs.Set.getValues(set);
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
  return this.map_.getValues()
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
 *                   the set in arbitrary order.
 */
goog.structs.Set.prototype.equals = function(col) {
  return this.getCount() != goog.structs.getCount(col) ?
      false : this.isSubsetOf(col);
};


/**
 * Decides if the input collection contains all elements of this set.
 * Its time complexity is O(|col|) and uses equals (==) to test the existence
 * of the elements.
 * @param {Object} col A collection-like object.
 * @return {boolean} True if the set is the subset of the collection.
 */
goog.structs.Set.prototype.isSubsetOf = function(col) {
  var colCount = goog.structs.getCount(col);
  if (this.getCount() > colCount) {
    return false;
  }
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


/**
 * The number of keys in the set.
 * @param {Object} col The collection-like object.
 * @return {number} The number of keys in the set.
 */
goog.structs.Set.getCount = function(col) {
  return goog.structs.getCount(col);
};


/**
 * This returns the values of the set
 * @param {Object} col The collection-like object.
 * @return {Array} The values in the set.
 */
goog.structs.Set.getValues = function(col) {
  return goog.structs.getValues(col);
};


/**
 * Whether the collection contains the given value. This is O(n) and uses
 * equals (==) to test the existence
 * @param {Object} col The collection-like object.
 * @param {Object} val The value to check for.
 * @return {boolean} True if the set contains the value.
 */
goog.structs.Set.contains = function(col, val) {
  return goog.structs.contains(col, val);
};


/**
 * Whether the collection is empty.
 * @param {Object} col The collection-like object.
 * @return {boolean} True if empty.
 */
goog.structs.Set.isEmpty = function(col) {
  return goog.structs.isEmpty(col);
};


/**
 * Removes all the elements from the collection
 * @param {Object} col The collection-like object.
 */
goog.structs.Set.clear = function(col) {
  goog.structs.clear(col);
};


/**
 * Removes a value from the collection. This is O(n) in some implementations
 * and then uses equal (==) to find the element.
 * @param {Object} col The collection-like object.
 * @param {*} val The element to remove.
 * @return {boolean} True if an element was removed.
 */
goog.structs.Set.remove = function(col, val) {
  if (typeof col.remove == 'function') {
    return col.remove(val);
  } else if (goog.isArrayLike(col)) {
    return goog.array.remove(col, val);
  } else {
    // this removes based on value not on key.
    var l = col.length;
    for (var key in col) {
      if (col[key] == val) {
        delete col[key];
        return true;
      }
    }
    return false;
  }
};


/**
 * Adds a value to the collection
 *
 * @throws {Exception} If the collection does not have an add method or is not
 *                     array like.
 *
 * @param {Object} col The collection like object.
 * @param {*} val The value to add.
 *
 */
goog.structs.Set.add = function(col, val) {
  if (typeof col.add == 'function') {
    col.add(val);
  } else if (goog.isArrayLike(col)) {
    col[col.length] = val; // don't use push because push is not a requirement
                           // for an object to be array like
  } else {
    throw Error('The collection does not know how to add "' + val + '"');
  }
};
