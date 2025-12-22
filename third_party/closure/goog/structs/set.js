/**
 * @license
 * Copyright The Closure Library Authors.
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Datastructure: Set.
 *
 *
 * This class implements a set data structure. Adding and removing is O(1). It
 * supports both object and primitive values. Be careful because you can add
 * both 1 and new Number(1), because these are not the same. You can even add
 * multiple new Number(1) because these are not equal.
 */


goog.provide('goog.structs.Set');

goog.require('goog.structs');
goog.require('goog.structs.Collection');
goog.require('goog.structs.Map');
goog.requireType('goog.iter.Iterator');
goog.require('goog.utils');

/**
 * A set that can contain both primitives and objects.  Adding and removing
 * elements is O(1).  Primitives are treated as identical if they have the same
 * type and convert to the same string.  Objects are treated as identical only
 * if they are references to the same object.  WARNING: A goog.structs.Set can
 * contain both 1 and (new Number(1)), because they are not the same.  WARNING:
 * Adding (new Number(1)) twice will yield two distinct elements, because they
 * are two different objects.  WARNING: Any object that is added to a
 * goog.structs.Set will be modified!  Because goog.getUid() is used to
 * identify objects, every object in the set will be mutated.
 * @param {Array<T>|Object<?,T>=} opt_values Initial values to start with.
 * @constructor
 * @implements {goog.structs.Collection<T>}
 * @implements {Iterable<T>}
 * @final
 * @template T
 * @deprecated This type is misleading: use ES6 Set instead.
 */
goog.structs.Set = function(opt_values) {
  'use strict';
  this.map_ = new goog.structs.Map();


  /**
   * The number of items in this set.
   * @const {number}
   */
  this.size = 0;

  if (opt_values) {
    this.addAll(opt_values);
  }
};

/**
 * A function that returns a unique id.
 * @private @const {function(?Object): number}
 */
goog.structs.Set.getUid_ = goog.utils.getUid;


/**
 * Obtains a unique key for an element of the set.  Primitives will yield the
 * same key if they have the same type and convert to the same string.  Object
 * references will yield the same key only if they refer to the same object.
 * @param {*} val Object or primitive value to get a key for.
 * @return {string} A unique key for this value/object.
 * @private
 */
goog.structs.Set.getKey_ = function(val) {
  'use strict';
  var type = typeof val;
  if (type == 'object' && val || type == 'function') {
    return 'o' + goog.structs.Set.getUid_(/** @type {Object} */ (val));
  } else {
    return type.slice(0, 1) + val;
  }
};


/**
 * @return {number} The number of elements in the set.
 * @override
 * @deprecated Use the `size` property instead, for alignment with ES6 Set.
 */
goog.structs.Set.prototype.getCount = function() {
  'use strict';
  return this.map_.size;
};


/**
 * Add a primitive or an object to the set.
 * @param {T} element The primitive or object to add.
 * @override
 */
goog.structs.Set.prototype.add = function(element) {
  'use strict';
  this.map_.set(goog.structs.Set.getKey_(element), element);
  this.setSizeInternal_(this.map_.size);
};


/**
 * Adds all the values in the given collection to this set.
 * @param {Array<T>|goog.structs.Collection<T>|Object<?,T>} col A collection
 *     containing the elements to add.
 * @deprecated Use `goog.collections.sets.addAll(thisSet, col)` instead,
 *     converting Objects to their values using `Object.values`, for alignment
 *     with ES6 Set.
 */
goog.structs.Set.prototype.addAll = function(col) {
  'use strict';
  var values = goog.structs.getValues(col);
  var l = values.length;
  for (var i = 0; i < l; i++) {
    this.add(values[i]);
  }
  this.setSizeInternal_(this.map_.size);
};


/**
 * Removes all values in the given collection from this set.
 * @param {Array<T>|goog.structs.Collection<T>|Object<?,T>} col A collection
 *     containing the elements to remove.
 * @deprecated Use `goog.collections.sets.removeAll(thisSet, col)` instead,
 *     converting Objects to their values using `Object.values`, for alignment
 *     with ES6 Set.
 */
goog.structs.Set.prototype.removeAll = function(col) {
  'use strict';
  var values = goog.structs.getValues(col);
  var l = values.length;
  for (var i = 0; i < l; i++) {
    this.remove(values[i]);
  }
  this.setSizeInternal_(this.map_.size);
};


/**
 * Removes the given element from this set.
 * @param {T} element The primitive or object to remove.
 * @return {boolean} Whether the element was found and removed.
 */
goog.structs.Set.prototype.delete = function(element) {
  'use strict';
  const rv = this.map_.remove(goog.structs.Set.getKey_(element));
  this.setSizeInternal_(this.map_.size);
  return rv;
};

/**
 * Removes the given element from this set.
 * @param {T} element The primitive or object to remove.
 * @return {boolean} Whether the element was found and removed.
 * @override
 * @deprecated Use `delete`, for alignment with ES6 Set.
 */
goog.structs.Set.prototype.remove = function(element) {
  'use strict';
  return this.delete(element);
};


/**
 * Removes all elements from this set.
 */
goog.structs.Set.prototype.clear = function() {
  'use strict';
  this.map_.clear();
  this.setSizeInternal_(0);
};


/**
 * Tests whether this set is empty.
 * @return {boolean} True if there are no elements in this set.
 * @deprecated Use the size property and compare against 0, for alignment with
 *     ES6 Set.
 */
goog.structs.Set.prototype.isEmpty = function() {
  'use strict';
  return this.map_.size === 0;
};


/**
 * Tests whether this set contains the given element.
 * @param {T} element The primitive or object to test for.
 * @return {boolean} True if this set contains the given element.
 */
goog.structs.Set.prototype.has = function(element) {
  'use strict';
  return this.map_.containsKey(goog.structs.Set.getKey_(element));
};

/**
 * Tests whether this set contains the given element.
 * @param {T} element The primitive or object to test for.
 * @return {boolean} True if this set contains the given element.
 * @override
 * @deprecated Use `has` instead, for alignment with ES6 Set.
 */
goog.structs.Set.prototype.contains = function(element) {
  'use strict';
  return this.map_.containsKey(goog.structs.Set.getKey_(element));
};


/**
 * Tests whether this set contains all the values in a given collection.
 * Repeated elements in the collection are ignored, e.g.  (new
 * goog.structs.Set([1, 2])).containsAll([1, 1]) is True.
 * @param {goog.structs.Collection<T>|Object} col A collection-like object.
 * @return {boolean} True if the set contains all elements.
 * @deprecated Use `goog.collections.sets.hasAll(thisSet, col)`, converting
 *     Objects to arrays using Object.values, for alignment with ES6 Set.
 */
goog.structs.Set.prototype.containsAll = function(col) {
  'use strict';
  return goog.structs.every(col, this.contains, this);
};


/**
 * Finds all values that are present in both this set and the given collection.
 * @param {Array<S>|Object<?,S>} col A collection.
 * @return {!goog.structs.Set<T|S>} A new set containing all the values
 *     (primitives or objects) present in both this set and the given
 *     collection.
 * @template S
 * @deprecated Use `goog.collections.sets.intersection(thisSet, col)`,
 *     converting Objects to arrays using Object.values, instead for alignment
 *     with ES6 Set.
 */
goog.structs.Set.prototype.intersection = function(col) {
  'use strict';
  var result = new goog.structs.Set();

  var values = goog.structs.getValues(col);
  for (var i = 0; i < values.length; i++) {
    var value = values[i];
    if (this.contains(value)) {
      result.add(value);
    }
  }

  return result;
};


/**
 * Finds all values that are present in this set and not in the given
 * collection.
 * @param {Array<T>|goog.structs.Collection<T>|Object<?,T>} col A collection.
 * @return {!goog.structs.Set} A new set containing all the values
 *     (primitives or objects) present in this set but not in the given
 *     collection.
 */
goog.structs.Set.prototype.difference = function(col) {
  'use strict';
  var result = this.clone();
  result.removeAll(col);
  return result;
};


/**
 * Returns an array containing all the elements in this set.
 * @return {!Array<T>} An array containing all the elements in this set.
 * @deprecated Use `Array.from(set.values())` instead, for alignment with ES6
 *     Set.
 */
goog.structs.Set.prototype.getValues = function() {
  'use strict';
  return this.map_.getValues();
};

/**
 * @returns {!IteratorIterable<T>} An ES6 Iterator that iterates over the values
 *     in the set.
 */
goog.structs.Set.prototype.values = function() {
  'use strict';
  return this.map_.values();
};

/**
 * Creates a shallow clone of this set.
 * @return {!goog.structs.Set<T>} A new set containing all the same elements as
 *     this set.
 * @deprecated Use `new Set(thisSet.values())` for alignment with ES6 Set.
 */
goog.structs.Set.prototype.clone = function() {
  'use strict';
  return new goog.structs.Set(this);
};


/**
 * Tests whether the given collection consists of the same elements as this set,
 * regardless of order, without repetition.  Primitives are treated as equal if
 * they have the same type and convert to the same string; objects are treated
 * as equal if they are references to the same object.  This operation is O(n).
 * @param {goog.structs.Collection<T>|Object} col A collection.
 * @return {boolean} True if the given collection consists of the same elements
 *     as this set, regardless of order, without repetition.
 * @deprecated Use `goog.collections.equals(thisSet, col)`, converting Objects
 *     to arrays using Object.values,  instead for alignment with ES6 Set.
 */
goog.structs.Set.prototype.equals = function(col) {
  'use strict';
  return this.getCount() == goog.structs.getCount(col) && this.isSubsetOf(col);
};


/**
 * Tests whether the given collection contains all the elements in this set.
 * Primitives are treated as equal if they have the same type and convert to the
 * same string; objects are treated as equal if they are references to the same
 * object.  This operation is O(n).
 * @param {goog.structs.Collection<T>|Object} col A collection.
 * @return {boolean} True if this set is a subset of the given collection.
 * @deprecated Use `goog.collections.isSubsetOf(thisSet, col)`, converting
 *     Objects to arrays using Object.values, instead for alignment with ES6
 *     Set.
 */
goog.structs.Set.prototype.isSubsetOf = function(col) {
  'use strict';
  var colCount = goog.structs.getCount(col);
  if (this.getCount() > colCount) {
    return false;
  }
  if (!(col instanceof goog.structs.Set) && colCount > 5) {
    // Convert to a goog.structs.Set so that goog.structs.contains runs in
    // O(1) time instead of O(n) time.
    col = new goog.structs.Set(col);
  }
  return goog.structs.every(this, function(value) {
    'use strict';
    return goog.structs.contains(col, value);
  });
};


/**
 * Returns an iterator that iterates over the elements in this set.
 * @param {boolean=} opt_keys This argument is ignored.
 * @return {!goog.iter.Iterator} An iterator over the elements in this set.
 * @deprecated Call `values` and use native iteration, for alignment with ES6
 *     Set.
 */
goog.structs.Set.prototype.__iterator__ = function(opt_keys) {
  'use strict';
  return this.map_.__iterator__(false);
};

/**
 * @return {!IteratorIterable<T>} An ES6 Iterator that iterates over the values
 *     in the set.
 */
goog.structs.Set.prototype[Symbol.iterator] = function() {
  return this.values();
};

/**
 * Assigns to the size property to isolate supressions of const assignment
 * to only where they are needed.
 * @param {number} newSize The size to update to.
 * @private
 */
goog.structs.Set.prototype.setSizeInternal_ = function(newSize) {
  /** @suppress {const} */
  this.size = newSize;
};
