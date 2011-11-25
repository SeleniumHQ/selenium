// Copyright 2006 The Closure Library Authors. All Rights Reserved.
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
 * @param {*=} opt_map Map or Object to initialize the map with.
 * @param {...*} var_args If 2 or more arguments are present then they
 *     will be used as key-value pairs.
 * @constructor
 */
goog.structs.Map = function(opt_map, var_args) {

  /**
   * Underlying JS object used to implement the map.
   * @type {!Object}
   * @private
   */
  this.map_ = {};

  if (goog.structs.Map.PRESERVE_NON_STRING_KEYS) {
    /**
     * A map of internal keys that are numeric and should be cast back to a
     * number on retrieval.
     *
     * A previous implementation had optimizations for IE6's bad GC.  However,
     * the keys weren't correctly cast to strings so people started to depend on
     * the behavior of numeric keys in tests.
     *
     * To ensure backwards compatibility this part remains, but it would be nice
     * to strip out entirely.  See http://b/5622311.
     *
     * @type {!Object}
     * @private
     */
    this.numericKeyMap_ = {};
  }

  var argLength = arguments.length;

  if (argLength > 1) {
    if (argLength % 2) {
      throw Error('Uneven number of arguments');
    }
    for (var i = 0; i < argLength; i += 2) {
      this.set(arguments[i], arguments[i + 1]);
    }
  } else if (opt_map) {
    this.addAll(/** @type {Object} */ (opt_map));
  }
};


/**
 * @define {boolean} Whether to preserve non-string keys, even though the docs
 *     state that keys are cast to a string.
 */
goog.structs.Map.PRESERVE_NON_STRING_KEYS = true;


/**
 * The prefix to mark keys with.
 * @type {string}
 * @const
 */
goog.structs.Map.KEY_PREFIX = ':';


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
  var rv = [];
  for (var key in this.map_) {
    if (goog.structs.Map.isKey_(key)) {
      rv.push(this.map_[key]);
    }
  }
  return rv;
};


/**
 * Returns the keys of the map.
 * @return {!Array.<string>} Array of string values.
 */
goog.structs.Map.prototype.getKeys = function() {
  var rv = [];
  for (var key in this.map_) {
    if (goog.structs.Map.isKey_(key)) {
      rv.push(this.getKey_(key));
    }
  }
  return rv;
};


/**
 * Whether the map contains the given key.
 * @param {*} key The key to check for.
 * @return {boolean} Whether the map contains the key.
 */
goog.structs.Map.prototype.containsKey = function(key) {
  return goog.structs.Map.makeKey_(key) in this.map_;
};


/**
 * Whether the map contains the given value. This is O(n).
 * @param {*} val The value to check for.
 * @return {boolean} Whether the map contains the value.
 */
goog.structs.Map.prototype.containsValue = function(val) {
  for (var key in this.map_) {
    if (goog.structs.Map.isKey_(key) &&
        this.map_[key] == val) {
      return true;
    }
  }
  return false;
};


/**
 * Whether this map is equal to the argument map.
 * @param {goog.structs.Map} otherMap The map against which to test equality.
 * @param {function(*, *) : boolean=} opt_equalityFn Optional equality function
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

  for (var key in this.map_) {
    key = this.getKey_(key);
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
  this.count_ = 0;
  this.version_ = 0;
  if (goog.structs.Map.PRESERVE_NON_STRING_KEYS) {
    this.numericKeyMap_ = {};
  }
};


/**
 * Removes a key-value pair based on the key. This is O(logN) amortized due to
 * updating the keys array whenever the count becomes half the size of the keys
 * in the keys array.
 * @param {*} key  The key to remove.
 * @return {boolean} Whether object was removed.
 */
goog.structs.Map.prototype.remove = function(key) {
  var internalKey = goog.structs.Map.makeKey_(key);
  if (goog.object.remove(this.map_, internalKey)) {
    if (goog.structs.Map.PRESERVE_NON_STRING_KEYS) {
      delete this.numericKeyMap_[internalKey];
    }
    this.count_--;
    this.version_++;
    return true;
  }
  return false;
};


/**
 * Returns the value for the given key.  If the key is not found and the default
 * value is not given this will return {@code undefined}.
 * @param {*} key The key to get the value for.
 * @param {*=} opt_val The value to return if no item is found for the given
 *     key, defaults to undefined.
 * @return {*} The value for the given key.
 */
goog.structs.Map.prototype.get = function(key, opt_val) {
  var internalKey = goog.structs.Map.makeKey_(key);
  if (internalKey in this.map_) {
    return this.map_[internalKey];
  }
  return opt_val;
};


/**
 * Adds a key-value pair to the map.
 * @param {*} key The key.
 * @param {*} value The value to add.
 */
goog.structs.Map.prototype.set = function(key, value) {
  var internalKey = goog.structs.Map.makeKey_(key);
  if (!(internalKey in this.map_)) {
    this.version_++;
    this.count_++;
    if (goog.structs.Map.PRESERVE_NON_STRING_KEYS && goog.isNumber(key)) {
      this.numericKeyMap_[internalKey] = true;
    }
  }
  this.map_[internalKey] = value;
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
  for (var key in this.map_) {
    transposed.set(this.map_[key], this.getKey_(key));
  }
  return transposed;
};


/**
 * @return {!Object} Object representation of the map.
 */
goog.structs.Map.prototype.toObject = function() {
  var res = {};
  for (var key in this.map_) {
    if (goog.structs.Map.isKey_(key)) {
      res[this.getKey_(key)] = this.map_[key];
    }
  }
  return res;
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
 * @param {boolean=} opt_keys True to iterate over the keys. False to iterate
 *     over the values.  The default value is false.
 * @return {!goog.iter.Iterator} An iterator over the values or keys in the map.
 */
goog.structs.Map.prototype.__iterator__ = function(opt_keys) {
  var i = 0;
  var keys = this.getKeys();
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
      return opt_keys ? key : map[goog.structs.Map.makeKey_(key)];
    }
  };
  return newIter;
};


/**
 * Gets the key part of a string.
 * @param {string} s Key string in the form ":foo".
 * @return {string} "foo".
 * @private
 */
goog.structs.Map.prototype.getKey_ = function(s) {
  var key = s.substring(1);
  if (goog.structs.Map.PRESERVE_NON_STRING_KEYS) {
    // NOTE(user): Yes, this is gross.  We lie to the compiler because we need
    // to maintain backwards compatibility with a previous bug.  See comment
    // associated with numericKeyMap_.
    return /** @type {string} */ (this.numericKeyMap_[s] ? Number(key) : key);
  } else {
    return key;
  }
};


/**
 * Checks to see if a string is a valid map key
 * @param {string} s Key to test.
 * @return {boolean} Whether string is a valid key.
 * @private
 */
goog.structs.Map.isKey_ = function(s) {
  return s.charAt(0) == goog.structs.Map.KEY_PREFIX;
};


/**
 * Makes a key string, i.e. "foo" -> ":foo"
 * @param {*} s Key to convert, non string keys will be cast.
 * @return {string} Key string.
 * @private
 */
goog.structs.Map.makeKey_ = function(s) {
  return goog.structs.Map.KEY_PREFIX + s;
};
