// Copyright 2009 The Closure Library Authors. All Rights Reserved.
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
 * @fileoverview Data structure for set of strings.
 *
 *
 * This class implements a set data structure for strings. Adding and removing
 * is O(1). It doesn't contain any bloat from {@link goog.structs.Set}, i.e.
 * it isn't optimized for IE6 garbage collector (see the description of
 * {@link goog.structs.Map#keys_} for details), and it distinguishes its
 * elements by their string value not by hash code.
 * The implementation assumes that no new keys are added to Object.prototype.
 */

goog.provide('goog.structs.StringSet');

goog.require('goog.asserts');
goog.require('goog.iter');



/**
 * Creates a set of strings.
 * @param {!Array<?>=} opt_elements Elements to add to the set. The non-string
 *     items will be converted to strings, so 15 and '15' will mean the same.
 * @constructor
 * @final
 */
goog.structs.StringSet = function(opt_elements) {
  /**
   * An object storing the escaped elements of the set in its keys.
   * @type {!Object}
   * @private
   */
  this.elements_ = {};

  if (opt_elements) {
    for (var i = 0; i < opt_elements.length; i++) {
      this.elements_[goog.structs.StringSet.encode_(opt_elements[i])] = null;
    }
  }

  goog.asserts.assertObjectPrototypeIsIntact();
};


/**
 * Empty object. Referring to it is faster than creating a new empty object in
 * {@code goog.structs.StringSet.encode_}.
 * @const {!Object}
 * @private
 */
goog.structs.StringSet.EMPTY_OBJECT_ = {};


/**
 * The '__proto__' and the '__count__' keys aren't enumerable in Firefox, and
 * 'toString', 'valueOf', 'constructor', etc. aren't enumerable in IE so they
 * have to be escaped before they are added to the internal object.
 * NOTE: When a new set is created, 50-80% of the CPU time is spent in encode.
 * @param {*} element The element to escape.
 * @return {*} The escaped element or the element itself if it doesn't have to
 *     be escaped.
 * @private
 */
goog.structs.StringSet.encode_ = function(element) {
  return element in goog.structs.StringSet.EMPTY_OBJECT_ ||
          String(element).charCodeAt(0) == 32 ?
      ' ' + element :
      element;
};


/**
 * Inverse function of {@code goog.structs.StringSet.encode_}.
 * NOTE: forEach would be 30% faster in FF if the compiler inlined decode.
 * @param {string} key The escaped element used as the key of the internal
 *     object.
 * @return {string} The unescaped element.
 * @private
 */
goog.structs.StringSet.decode_ = function(key) {
  return key.charCodeAt(0) == 32 ? key.substr(1) : key;
};


/**
 * Adds a single element to the set.
 * @param {*} element The element to add. It will be converted to string.
 */
goog.structs.StringSet.prototype.add = function(element) {
  this.elements_[goog.structs.StringSet.encode_(element)] = null;
};


/**
 * Adds a the elements of an array to this set.
 * @param {!Array<?>} arr The array to add the elements of.
 */
goog.structs.StringSet.prototype.addArray = function(arr) {
  for (var i = 0; i < arr.length; i++) {
    this.elements_[goog.structs.StringSet.encode_(arr[i])] = null;
  }
};


/**
 * Adds the elements which are in {@code set1} but not in {@code set2} to this
 * set.
 * @param {!goog.structs.StringSet} set1 First set.
 * @param {!goog.structs.StringSet} set2 Second set.
 * @private
 */
goog.structs.StringSet.prototype.addDifference_ = function(set1, set2) {
  for (var key in set1.elements_) {
    if (!(key in set2.elements_)) {
      this.elements_[key] = null;
    }
  }
};


/**
 * Adds a the elements of a set to this set.
 * @param {!goog.structs.StringSet} stringSet The set to add the elements of.
 */
goog.structs.StringSet.prototype.addSet = function(stringSet) {
  for (var key in stringSet.elements_) {
    this.elements_[key] = null;
  }
};


/**
 * Removes all elements of the set.
 */
goog.structs.StringSet.prototype.clear = function() {
  this.elements_ = {};
};


/**
 * @return {!goog.structs.StringSet} Clone of the set.
 */
goog.structs.StringSet.prototype.clone = function() {
  var ret = new goog.structs.StringSet;
  ret.addSet(this);
  return ret;
};


/**
 * Tells if the set contains the given element.
 * @param {*} element The element to check.
 * @return {boolean} Whether it is in the set.
 */
goog.structs.StringSet.prototype.contains = function(element) {
  return goog.structs.StringSet.encode_(element) in this.elements_;
};


/**
 * Tells if the set contains all elements of the array.
 * @param {!Array<?>} arr The elements to check.
 * @return {boolean} Whether they are in the set.
 */
goog.structs.StringSet.prototype.containsArray = function(arr) {
  for (var i = 0; i < arr.length; i++) {
    if (!(goog.structs.StringSet.encode_(arr[i]) in this.elements_)) {
      return false;
    }
  }
  return true;
};


/**
 * Tells if this set has the same elements as the given set.
 * @param {!goog.structs.StringSet} stringSet The other set.
 * @return {boolean} Whether they have the same elements.
 */
goog.structs.StringSet.prototype.equals = function(stringSet) {
  return this.isSubsetOf(stringSet) && stringSet.isSubsetOf(this);
};


/**
 * Calls a function for each element in the set.
 * @param {function(string, undefined, !goog.structs.StringSet)} f The function
 *     to call for every element. It takes the element, undefined (because sets
 *     have no notion of keys), and the set.
 * @param {Object=} opt_obj The object to be used as the value of 'this'
 *     within {@code f}.
 */
goog.structs.StringSet.prototype.forEach = function(f, opt_obj) {
  for (var key in this.elements_) {
    f.call(opt_obj, goog.structs.StringSet.decode_(key), undefined, this);
  }
};


/**
 * Counts the number of elements in the set in linear time.
 * NOTE: getCount is always called at most once per set instance in google3.
 * If this usage pattern won't change, the linear getCount implementation is
 * better, because
 * <li>populating a set and getting the number of elements in it takes the same
 * amount of time as keeping a count_ member up to date and getting its value;
 * <li>if getCount is not called, adding and removing elements have no overhead.
 * @return {number} The number of elements in the set.
 */
goog.structs.StringSet.prototype.getCount = Object.keys ? function() {
  return Object.keys(this.elements_).length;
} : function() {
  var count = 0;
  for (var key in this.elements_) {
    count++;
  }
  return count;
};


/**
 * Calculates the difference of two sets.
 * @param {!goog.structs.StringSet} stringSet The set to subtract from this set.
 * @return {!goog.structs.StringSet} {@code this} minus {@code stringSet}.
 */
goog.structs.StringSet.prototype.getDifference = function(stringSet) {
  var ret = new goog.structs.StringSet;
  ret.addDifference_(this, stringSet);
  return ret;
};


/**
 * Calculates the intersection of this set with another set.
 * @param {!goog.structs.StringSet} stringSet The set to take the intersection
 *     with.
 * @return {!goog.structs.StringSet} A new set with the common elements.
 */
goog.structs.StringSet.prototype.getIntersection = function(stringSet) {
  var ret = new goog.structs.StringSet;
  for (var key in this.elements_) {
    if (key in stringSet.elements_) {
      ret.elements_[key] = null;
    }
  }
  return ret;
};


/**
 * Calculates the symmetric difference of two sets.
 * @param {!goog.structs.StringSet} stringSet The other set.
 * @return {!goog.structs.StringSet} A new set with the elements in exactly one
 *     of {@code this} and {@code stringSet}.
 */
goog.structs.StringSet.prototype.getSymmetricDifference = function(stringSet) {
  var ret = new goog.structs.StringSet;
  ret.addDifference_(this, stringSet);
  ret.addDifference_(stringSet, this);
  return ret;
};


/**
 * Calculates the union of this set and another set.
 * @param {!goog.structs.StringSet} stringSet The set to take the union with.
 * @return {!goog.structs.StringSet} A new set with the union of elements.
 */
goog.structs.StringSet.prototype.getUnion = function(stringSet) {
  var ret = this.clone();
  ret.addSet(stringSet);
  return ret;
};


/**
 * @return {!Array<string>} The elements of the set.
 */
goog.structs.StringSet.prototype.getValues = Object.keys ? function() {
  // Object.keys was introduced in JavaScript 1.8.5, Array#map in 1.6.
  return Object.keys(this.elements_).map(goog.structs.StringSet.decode_, this);
} : function() {
  var ret = [];
  for (var key in this.elements_) {
    ret.push(goog.structs.StringSet.decode_(key));
  }
  return ret;
};


/**
 * Tells if this set and the given set are disjoint.
 * @param {!goog.structs.StringSet} stringSet The other set.
 * @return {boolean} True iff they don't have common elements.
 */
goog.structs.StringSet.prototype.isDisjoint = function(stringSet) {
  for (var key in this.elements_) {
    if (key in stringSet.elements_) {
      return false;
    }
  }
  return true;
};


/**
 * @return {boolean} Whether the set is empty.
 */
goog.structs.StringSet.prototype.isEmpty = function() {
  for (var key in this.elements_) {
    return false;
  }
  return true;
};


/**
 * Tells if this set is the subset of the given set.
 * @param {!goog.structs.StringSet} stringSet The other set.
 * @return {boolean} Whether this set if the subset of that.
 */
goog.structs.StringSet.prototype.isSubsetOf = function(stringSet) {
  for (var key in this.elements_) {
    if (!(key in stringSet.elements_)) {
      return false;
    }
  }
  return true;
};


/**
 * Tells if this set is the superset of the given set.
 * @param {!goog.structs.StringSet} stringSet The other set.
 * @return {boolean} Whether this set if the superset of that.
 */
goog.structs.StringSet.prototype.isSupersetOf = function(stringSet) {
  return stringSet.isSubsetOf(this);
};


/**
 * Removes a single element from the set.
 * @param {*} element The element to remove.
 * @return {boolean} Whether the element was in the set.
 */
goog.structs.StringSet.prototype.remove = function(element) {
  var key = goog.structs.StringSet.encode_(element);
  if (key in this.elements_) {
    delete this.elements_[key];
    return true;
  }
  return false;
};


/**
 * Removes all elements of the given array from this set.
 * @param {!Array<?>} arr The elements to remove.
 */
goog.structs.StringSet.prototype.removeArray = function(arr) {
  for (var i = 0; i < arr.length; i++) {
    delete this.elements_[goog.structs.StringSet.encode_(arr[i])];
  }
};


/**
 * Removes all elements of the given set from this set.
 * @param {!goog.structs.StringSet} stringSet The set of elements to remove.
 */
goog.structs.StringSet.prototype.removeSet = function(stringSet) {
  for (var key in stringSet.elements_) {
    delete this.elements_[key];
  }
};


/**
 * Returns an iterator that iterates over the elements in the set.
 * NOTE: creating the iterator copies the whole set so use {@link #forEach} when
 * possible.
 * @param {boolean=} opt_keys Ignored for sets.
 * @return {!goog.iter.Iterator} An iterator over the elements in the set.
 */
goog.structs.StringSet.prototype.__iterator__ = function(opt_keys) {
  return goog.iter.toIterator(this.getValues());
};
