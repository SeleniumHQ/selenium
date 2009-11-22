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
 * @fileoverview Datastructure: Hash Map.
 *
 *
 * This file contains an implementation of a Map structure. It implements a lot
 * of the methods used in goog.structs so those functions work on hashes.  For
 * convenience with common usage the methods accept any type for the key, though
 * internally they will be cast to strings.
 */


goog.provide('goog.structs.Map');

goog.require('goog.iter.Iterator');
goog.require('goog.iter.StopIteration');
goog.require('goog.object');
goog.require('goog.structs');


/**
 * Class for Hash Map datastructure.
 * @param {Object} opt_map Map or Object to initialize the map with.
 * @param {Object} var_args If 2 or more arguments are present then they will be
 *     used as key-value pairs.
 * @constructor
 */
goog.structs.Map = function(opt_map, var_args) {

  /**
   * Underlying JS object used to implement the map.
   * @type {!Object}
   * @private
   */
  this.map_ = {};

  /**
   * An array of keys. This is necessary for two reasons:
   *   1. Iterating the keys using for (var key in this.map_) allocates an
   *      object for every key in IE which is really bad for IE6 GC perf.
   *   2. Without a side data structure, we would need to escape all the keys
   *      as that would be the only way we could tell during iteration if the
   *      key was an internal key or a property of the object.
   *
   * This array can contain deleted keys so it's necessary to check the map
   * as well to see if the key is still in the map (this doesn't require a
   * memory allocation in IE).
   * @type {!Array.<string>}
   * @private
   */
  this.keys_ = [];

  var argLength = arguments.length;

  if (argLength > 1) {
    if (argLength % 2) {
      throw Error('Uneven number of arguments');
    }
    for (var i = 0; i < argLength; i += 2) {
      this.set(arguments[i], arguments[i + 1]);
    }
  } else if (opt_map) {
    this.addAll(opt_map);
  }
};


/**
 * The number of key value pairs in the map.
 * @private
 * @type {number}
 */
goog.structs.Map.prototype.count_ = 0;


/**
 * Version used to detect changes while iterating.
 * @private
 * @type {number}
 */
goog.structs.Map.prototype.version_ = 0;

/**
 * @return {number} The number of key-value pairs in the map.
 */
goog.structs.Map.prototype.getCount = function() {
  return this.count_;
};


/**
 * Returns the values of the map.
 * @return {!Array} The values in the map.
 */
goog.structs.Map.prototype.getValues = function() {
  this.cleanupKeysArray_();

  var rv = [];
  for (var i = 0; i < this.keys_.length; i++) {
    var key = this.keys_[i];
    rv.push(this.map_[key]);
  }
  return rv;
};


/**
 * Returns the keys of the map.
 * @return {!Array.<string>} Array of string values.
 */
goog.structs.Map.prototype.getKeys = function() {
  this.cleanupKeysArray_();
  return /** @type {!Array.<string>} */ (this.keys_.concat());
};


/**
 * Whether the map contains the given key.
 * @param {*} key The key to check for.
 * @return {boolean} Whether the map contains the key.
 */
goog.structs.Map.prototype.containsKey = function(key) {
  return goog.structs.Map.hasKey_(this.map_, key);
};


/**
 * Whether the map contains the given value. This is O(n).
 * @param {*} val The value to check for.
 * @return {boolean} Whether the map contains the value.
 */
goog.structs.Map.prototype.containsValue = function(val) {
  for (var i = 0; i < this.keys_.length; i++) {
    var key = this.keys_[i];
    if (goog.structs.Map.hasKey_(this.map_, key) && this.map_[key] == val) {
      return true;
    }
  }
  return false;
};


/**
 * Whether this map is equal to the argument map.
 * @param {goog.structs.Map} otherMap The map against which to test equality.
 * @param {function(*, *) : boolean} opt_equalityFn Optional equality function
 *     to test equality of values. If not specified, this will test whether
 *     the values contained in each map are identical objects.
 * @return {boolean} Whether the maps are equal.
 */
goog.structs.Map.prototype.equals = function(otherMap, opt_equalityFn) {
  if (this === otherMap) {
    return true;
  }

  if (this.count_ != otherMap.getCount()) {
    return false;
  }

  var equalityFn = opt_equalityFn || goog.structs.Map.defaultEquals;

  this.cleanupKeysArray_();
  for (var key, i = 0; key = this.keys_[i]; i++) {
    if (!equalityFn(this.get(key), otherMap.get(key))) {
      return false;
    }
  }

  return true;
};


/**
 * Default equality test for values.
 * @param {*} a The first value.
 * @param {*} b The second value.
 * @return {boolean} Whether a and b reference the same object.
 */
goog.structs.Map.defaultEquals = function(a, b) {
  return a === b;
};


/**
 * @return {boolean} Whether the map is empty.
 */
goog.structs.Map.prototype.isEmpty = function() {
  return this.count_ == 0;
};


/**
 * Removes all key-value pairs from the map.
 */
goog.structs.Map.prototype.clear = function() {
  this.map_ = {};
  this.keys_.length = 0;
  this.count_ = 0;
  this.version_ = 0;
};

/**
 * Removes a key-value pair based on the key. This is O(logN) amortized due to
 * updating the keys array whenever the count becomes half the size of the keys
 * in the keys array.
 * @param {*} key  The key to remove.
 * @return {boolean} Whether object was removed.
 */
goog.structs.Map.prototype.remove = function(key) {
  if (goog.structs.Map.hasKey_(this.map_, key)) {
    delete this.map_[key];
    this.count_--;
    this.version_++;

    // clean up the keys array if the threshhold is hit
    if (this.keys_.length > 2 * this.count_) {
      this.cleanupKeysArray_();
    }

    return true;
  }
  return false;
};


/**
 * Cleans up the temp keys array by removing entries that are no longer in the
 * map.
 * @private
 */
goog.structs.Map.prototype.cleanupKeysArray_ = function() {
  if (this.count_ != this.keys_.length) {
    // First remove keys that are no longer in the map.
    var srcIndex = 0;
    var destIndex = 0;
    while (srcIndex < this.keys_.length) {
      var key = this.keys_[srcIndex];
      if (goog.structs.Map.hasKey_(this.map_, key)) {
        this.keys_[destIndex++] = key;
      }
      srcIndex++;
    }
    this.keys_.length = destIndex;
  }

  if (this.count_ != this.keys_.length) {
    // If the count still isn't correct, that means we have duplicates. This can
    // happen when the same key is added and removed multiple times. Now we have
    // to allocate one extra Object to remove the duplicates. This could have
    // been done in the first pass, but in the common case, we can avoid
    // allocating an extra object by only doing this when necessary.
    var seen = {};
    var srcIndex = 0;
    var destIndex = 0;
    while (srcIndex < this.keys_.length) {
      var key = this.keys_[srcIndex];
      if (!(goog.structs.Map.hasKey_(seen, key))) {
        this.keys_[destIndex++] = key;
        seen[key] = 1;
      }
      srcIndex++;
    }
    this.keys_.length = destIndex;
  }
};


/**
 * Returns the value for the given key.  If the key is not found and the default
 * value is not given this will return {@code undefined}.
 * @param {*} key The key to get the value for.
 * @param {*} opt_val The value to return if no item is found for the given key,
 *     defaults to undefined.
 * @return {*} The value for the given key.
 */
goog.structs.Map.prototype.get = function(key, opt_val) {
  if (goog.structs.Map.hasKey_(this.map_, key)) {
    return this.map_[key];
  }
  return opt_val;
};


/**
 * Adds a key-value pair to the map.
 * @param {*} key The key.
 * @param {*} value The value to add.
 */
goog.structs.Map.prototype.set = function(key, value) {
  if (!(goog.structs.Map.hasKey_(this.map_, key))) {
    this.count_++;
    this.keys_.push(key);
    // Only change the version if we add a new key.
    this.version_++;
  }
  this.map_[key] = value;
};


/**
 * Adds multiple key-value pairs from another goog.structs.Map or Object.
 * @param {Object} map  Object containing the data to add.
 */
goog.structs.Map.prototype.addAll = function(map) {
  var keys, values;
  if (map instanceof goog.structs.Map) {
    keys = map.getKeys();
    values = map.getValues();
  } else {
    keys = goog.object.getKeys(map);
    values = goog.object.getValues(map);
  }
  // we could use goog.array.forEach here but I don't want to introduce that
  // dependency just for this.
  for (var i = 0; i < keys.length; i++) {
    this.set(keys[i], values[i]);
  }
};


/**
 * Clones a map and returns a new map.
 * @return {!goog.structs.Map} A new map with the same key-value pairs.
 */
goog.structs.Map.prototype.clone = function() {
  return new goog.structs.Map(this);
};


/**
 * Returns a new map in which all the keys and values are interchanged
 * (keys become values and values become keys). If multiple keys map to the
 * same value, the chosen transposed value is implementation-dependent.
 *
 * It acts very similarly to {goog.object.transpose(Object)}.
 *
 * @return {!goog.structs.Map} The transposed map.
 */
goog.structs.Map.prototype.transpose = function() {
  var transposed = new goog.structs.Map();
  for (var i = 0; i < this.keys_.length; i++) {
    var key = this.keys_[i];
    var value = this.map_[key];
    transposed.set(value, key);
  }

  return transposed;
};


/**
 * Returns an iterator that iterates over the keys in the map.  Removal of keys
 * while iterating might have undesired side effects.
 * @return {!goog.iter.Iterator} An iterator over the keys in the map.
 */
goog.structs.Map.prototype.getKeyIterator = function() {
  return this.__iterator__(true);
};


/**
 * Returns an iterator that iterates over the values in the map.  Removal of
 * keys while iterating might have undesired side effects.
 * @return {!goog.iter.Iterator} An iterator over the values in the map.
 */
goog.structs.Map.prototype.getValueIterator = function() {
  return this.__iterator__(false);
};


/**
 * Returns an iterator that iterates over the values or the keys in the map.
 * This throws an exception if the map was mutated since the iterator was
 * created.
 * @param {boolean} opt_keys True to iterate over the keys. False to iterate
 *     over the values.  The default value is false.
 * @return {!goog.iter.Iterator} An iterator over the values or keys in the map.
 */
goog.structs.Map.prototype.__iterator__ = function(opt_keys) {
  // Clean up keys to minimize the risk of iterating over dead keys.
  this.cleanupKeysArray_();

  var i = 0;
  var keys = this.keys_;
  var map = this.map_;
  var version = this.version_;
  var selfObj = this;

  var newIter = new goog.iter.Iterator;
  newIter.next = function() {
    while (true) {
      if (version != selfObj.version_) {
        throw Error('The map has changed since the iterator was created');
      }
      if (i >= keys.length) {
        throw goog.iter.StopIteration;
      }
      var key = keys[i++];
      return opt_keys ? key : map[key];
    }
  };
  return newIter;
};


/**
 * Safe way to test for hasOwnProperty.  It even allows testing for
 * 'hasOwnProperty'.
 * @param {Object} obj The object to test for presence of the given key.
 * @param {*} key The key to check for.
 * @return {boolean} Whether the object has the key.
 * @private
 */
goog.structs.Map.hasKey_ = function(obj, key) {
  return Object.prototype.hasOwnProperty.call(obj, key);
};


/**
 * Returns the number of key-value pairs in a map.
 * @param {Object} map The map-like object.
 * @return {number} The number of values in the map.
 *
 * @deprecated Use the instance {@code getCount} method on your object instead.
 *     If your object is a plain JavaScript Object used as a map you can also
 *     use {@code goog.object.getCount}.
 */
goog.structs.Map.getCount = function(map) {
  return goog.structs.getCount(map);
};


/**
 * Returns the values of the map.
 * @param {Object} map The map-like object.
 * @return {!Array} The values in the map.
 *
 * @deprecated Use the instance {@code getValues} method on your object instead.
 *     If your object is a plain JavaScript Object used as a map you can also
 *     use {@code goog.object.getValues}.
 */
goog.structs.Map.getValues = function(map) {
  return goog.structs.getValues(map);
};


/**
 * Returns the keys of the map.
 * @param {Object} map The map-like object.
 * @return {!Array.<string>} Array of string values.
 *
 * @deprecated Use the instance {@code getKeys} method on your object instead.
 *     If your object is a plain JavaScript Object used as a map you can also
 *     use {@code goog.object.getKeys}.
 */
goog.structs.Map.getKeys = function(map) {
  if (typeof map.getKeys == 'function') {
    return map.getKeys();
  }
  var rv = [];
  if (goog.isArrayLike(map)) {
    for (var i = 0; i < map.length; i++) {
      rv.push(i);
    }
  } else { // Object
    return goog.object.getKeys(map);
  }
  return rv;
};


/**
 * Whether the map contains the given key.
 * @param {Object} map The map-like object.
 * @param {*} key The key to check for.
 * @return {boolean} Whether the map contains the key.
 *
 * @deprecated Use the instance {@code containsKey} method on your object
 *     instead.  If your object is a plain JavaScript object you can use the
 *     {@code in} operator.
 */
goog.structs.Map.containsKey = function(map, key) {
  if (typeof map.containsKey == 'function') {
    return map.containsKey(key);
  }
  if (goog.isArrayLike(map)) {
    return Number(key) < map.length;
  }
  // Object
  return goog.object.containsKey(map, key);
};


/**
 * Whether the map contains the given value.  This is O(n) and uses equals (==)
 * to test.
 * @param {Object} map The map-like object.
 * @param {*} val The value to check for.
 * @return {boolean} Whether the map contains the value.
 *
 * @deprecated Use the instance {@code containsValue} method on your object
 *     instead. If your object is a plain JavaScript Object used as a map you
 *     can also use {@code goog.object.containsValue}.
 */
goog.structs.Map.containsValue = function(map, val) {
  return goog.structs.contains(map, val);
};


/**
 * Whether the map is empty.
 * @param {Object} map The map-like object.
 * @return {boolean} Whether the map is empty.
 *
 * @deprecated Use the instance {@code isEmpty} method on your object instead.
 *     If your object is a plain JavaScript Object used as a map you can also
 *     use {@code goog.object.isEmpty}.
 */
goog.structs.Map.isEmpty = function(map) {
  return goog.structs.isEmpty(map);
};


/**
 * Removes all key-value pairs from the map.
 * @param {Object} map The map-like object.
 *
 * @deprecated Use the instance {@code clear} method on your object instead.
 *     If your object is a plain JavaScript Object used as a map you can also
 *     use {@code goog.object.clear}.
 */
goog.structs.Map.clear = function(map) {
  goog.structs.clear(map);
};


/**
 * Removes a key-value pair based on the key.
 * @param {Object} map The map-like object.
 * @param {*} key The key to remove.
 * @return {boolean} Whether the map contained the key.
 *
 * @deprecated Use the instance {@code remove} method on your object instead.
 *     If your object is a plain JavaScript Object used as a map you can use
 *     the {@code delete} operator.
 */
goog.structs.Map.remove = function(map, key) {
  if (typeof map.remove == 'function') {
    return map.remove(key);
  }
  if (goog.isArrayLike(map)) {
    return goog.array.removeAt(
        (/** @type {goog.array.ArrayLike} */ map), Number(key));
  }
  // Object
  return goog.object.remove(map, key);
};


/**
 * Adds a key-value pair to the map. This throws an exception if the key is
 * already in use. Use set if you want to change an existing pair.
 * @param {Object} map The map-like object.
 * @param {*} key The key to add.
 * @param {*} val The value to add.
 *
 * @deprecated Use the instance {@code add} method on your object instead. If
 *     your object is a plain JavaScript Object used as a map you can use
 *     {@code map[key] = val}.
 */
goog.structs.Map.add = function(map, key, val) {
  if (typeof map.add == 'function') {
    map.add(key, val);
  } else if (goog.structs.Map.containsKey(map, key)) {
    throw Error('The collection already contains the key "' + key + '"');
  } else {
    goog.structs.Map.set(map, key, val);
  }
};


/**
 * Returns the value for the given key.
 * @param {Object} map The map-like object.
 * @param {*} key The key to get the value for.
 * @param {*} opt_val The value to return if no item is found for the
 *     given key. Defaults to undefined.
 * @return {*} The value for the given key.
 *
 * @deprecated Use the instance {@code get} method on your object instead. If
 *     your object is a plain JavaScript Object used as a map you can use
 *     {@code map[key]} or {@code key in map ? map[key] : opt_val}.
 *
 */
goog.structs.Map.get = function(map, key, opt_val) {
  if (typeof map.get == 'function') {
    return map.get(key, opt_val);
  }
  if (goog.structs.Map.containsKey(map, key)) {
    return map[key];
  }
  return opt_val;
};


/**
 * Sets the value for the given key.
 * @param {Object} map The map-like object.
 * @param {*} key The key to set the value for.
 * @param {*} val The value to add.
 *
 * @deprecated Use the instance {@code set} method on your object instead. If
 *     your object is a plain JavaScript Object used as a map you can use
 *     {@code map[key] = val}.
 */
goog.structs.Map.set = function(map, key, val) {
  if (typeof map.set == 'function') {
    map.set(key, val);
  } else {
    map[key] = val;
  }
};
