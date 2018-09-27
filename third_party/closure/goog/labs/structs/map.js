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
 * @fileoverview A map data structure that offers a convenient API to
 * manipulate a key, value map. The key must be a string.
 *
 * This implementation also ensure that you can use keys that would
 * not be usable using a normal object literal {}. Some examples
 * include __proto__ (all newer browsers), toString/hasOwnProperty (IE
 * <= 8).
 * @author chrishenry@google.com (Chris Henry)
 */

goog.provide('goog.labs.structs.Map');

goog.require('goog.array');
goog.require('goog.asserts');
goog.require('goog.object');



/**
 * Creates a new map.
 * @constructor
 * @struct
 * @final
 */
goog.labs.structs.Map = function() {
  // clear() initializes the map to the empty state.
  this.clear();
};


/**
 * @type {function(this: Object, string): boolean}
 * @private
 */
goog.labs.structs.Map.objectPropertyIsEnumerable_ =
    Object.prototype.propertyIsEnumerable;


/**
 * @type {function(this: Object, string): boolean}
 * @private
 */
goog.labs.structs.Map.objectHasOwnProperty_ = Object.prototype.hasOwnProperty;


/**
 * Primary backing store of this map.
 * @type {!Object}
 * @private
 */
goog.labs.structs.Map.prototype.map_;


/**
 * Secondary backing store for keys. The index corresponds to the
 * index for secondaryStoreValues_.
 * @type {!Array<string>}
 * @private
 */
goog.labs.structs.Map.prototype.secondaryStoreKeys_;


/**
 * Secondary backing store for keys. The index corresponds to the
 * index for secondaryStoreValues_.
 * @type {!Array<*>}
 * @private
 */
goog.labs.structs.Map.prototype.secondaryStoreValues_;


/**
 * @private {number}
 */
goog.labs.structs.Map.prototype.count_;


/**
 * Adds the (key, value) pair, overriding previous entry with the same
 * key, if any.
 * @param {string} key The key.
 * @param {*} value The value.
 */
goog.labs.structs.Map.prototype.set = function(key, value) {
  this.assertKeyIsString_(key);

  var newKey = !this.hasKeyInPrimaryStore_(key);
  this.map_[key] = value;

  // __proto__ is not settable on object.
  if (key == '__proto__' ||
      // Shadows for built-in properties are not enumerable in IE <= 8 .
      (!goog.labs.structs.Map.BrowserFeature.OBJECT_CREATE_SUPPORTED &&
       !goog.labs.structs.Map.objectPropertyIsEnumerable_.call(
           this.map_, key))) {
    delete this.map_[key];
    var index = goog.array.indexOf(this.secondaryStoreKeys_, key);
    if ((newKey = index < 0)) {
      index = this.secondaryStoreKeys_.length;
    }

    this.secondaryStoreKeys_[index] = key;
    this.secondaryStoreValues_[index] = value;
  }

  if (newKey) this.count_++;
};


/**
 * Gets the value for the given key.
 * @param {string} key The key whose value we want to retrieve.
 * @param {*=} opt_default The default value to return if the key does
 *     not exist in the map, default to undefined.
 * @return {*} The value corresponding to the given key, or opt_default
 *     if the key does not exist in this map.
 */
goog.labs.structs.Map.prototype.get = function(key, opt_default) {
  this.assertKeyIsString_(key);

  if (this.hasKeyInPrimaryStore_(key)) {
    return this.map_[key];
  }

  var index = goog.array.indexOf(this.secondaryStoreKeys_, key);
  return index >= 0 ? this.secondaryStoreValues_[index] : opt_default;
};


/**
 * Removes the map entry with the given key.
 * @param {string} key The key to remove.
 * @return {boolean} True if the entry is removed.
 */
goog.labs.structs.Map.prototype.remove = function(key) {
  this.assertKeyIsString_(key);

  if (this.hasKeyInPrimaryStore_(key)) {
    this.count_--;
    delete this.map_[key];
    return true;
  } else {
    var index = goog.array.indexOf(this.secondaryStoreKeys_, key);
    if (index >= 0) {
      this.count_--;
      goog.array.removeAt(this.secondaryStoreKeys_, index);
      goog.array.removeAt(this.secondaryStoreValues_, index);
      return true;
    }
  }
  return false;
};


/**
 * Adds the content of the map to this map. If a new entry uses a key
 * that already exists in this map, the existing key is replaced.
 * @param {!goog.labs.structs.Map} map The map to add.
 */
goog.labs.structs.Map.prototype.addAll = function(map) {
  goog.array.forEach(
      map.getKeys(), function(key) { this.set(key, map.get(key)); }, this);
};


/**
 * @return {boolean} True if the map is empty.
 */
goog.labs.structs.Map.prototype.isEmpty = function() {
  return !this.count_;
};


/**
 * @return {number} The number of the entries in this map.
 */
goog.labs.structs.Map.prototype.getCount = function() {
  return this.count_;
};


/**
 * @param {string} key The key to check.
 * @return {boolean} True if the map contains the given key.
 */
goog.labs.structs.Map.prototype.containsKey = function(key) {
  this.assertKeyIsString_(key);
  return this.hasKeyInPrimaryStore_(key) ||
      goog.array.contains(this.secondaryStoreKeys_, key);
};


/**
 * Whether the map contains the given value. The comparison is done
 * using !== comparator. Also returns true if the passed value is NaN
 * and a NaN value exists in the map.
 * @param {*} value Value to check.
 * @return {boolean} True if the map contains the given value.
 */
goog.labs.structs.Map.prototype.containsValue = function(value) {
  var found = goog.object.some(this.map_, function(v, k) {
    return this.hasKeyInPrimaryStore_(k) && goog.object.is(v, value);
  }, this);
  return found || goog.array.contains(this.secondaryStoreValues_, value);
};


/**
 * @return {!Array<string>} An array of all the keys contained in this map.
 */
goog.labs.structs.Map.prototype.getKeys = function() {
  var keys;
  if (goog.labs.structs.Map.BrowserFeature.OBJECT_KEYS_SUPPORTED) {
    keys = goog.array.clone(Object.keys(this.map_));
  } else {
    keys = [];
    for (var key in this.map_) {
      if (goog.labs.structs.Map.objectHasOwnProperty_.call(this.map_, key)) {
        keys.push(key);
      }
    }
  }

  goog.array.extend(keys, this.secondaryStoreKeys_);
  return keys;
};


/**
 * @return {!Array<*>} An array of all the values contained in this map.
 *     There may be duplicates.
 */
goog.labs.structs.Map.prototype.getValues = function() {
  var values = [];
  var keys = this.getKeys();
  for (var i = 0; i < keys.length; i++) {
    values.push(this.get(keys[i]));
  }
  return values;
};


/**
 * @return {!Array<Array<?>>} An array of entries. Each entry is of the
 *     form [key, value]. Do not rely on consistent ordering of entries.
 */
goog.labs.structs.Map.prototype.getEntries = function() {
  var entries = [];
  var keys = this.getKeys();
  for (var i = 0; i < keys.length; i++) {
    var key = keys[i];
    entries.push([key, this.get(key)]);
  }
  return entries;
};


/**
 * Clears the map to the initial state.
 */
goog.labs.structs.Map.prototype.clear = function() {
  this.map_ = goog.labs.structs.Map.BrowserFeature.OBJECT_CREATE_SUPPORTED ?
      Object.create(null) :
      {};
  this.secondaryStoreKeys_ = [];
  this.secondaryStoreValues_ = [];
  this.count_ = 0;
};


/**
 * Clones this map.
 * @return {!goog.labs.structs.Map} The clone of this map.
 */
goog.labs.structs.Map.prototype.clone = function() {
  var map = new goog.labs.structs.Map();
  map.addAll(this);
  return map;
};


/**
 * @param {string} key The key to check.
 * @return {boolean} True if the given key has been added successfully
 *     to the primary store.
 * @private
 */
goog.labs.structs.Map.prototype.hasKeyInPrimaryStore_ = function(key) {
  // New browsers that support Object.create do not allow setting of
  // __proto__. In other browsers, hasOwnProperty will return true for
  // __proto__ for object created with literal {}, so we need to
  // special case it.
  if (key == '__proto__') {
    return false;
  }

  if (goog.labs.structs.Map.BrowserFeature.OBJECT_CREATE_SUPPORTED) {
    return key in this.map_;
  }

  return goog.labs.structs.Map.objectHasOwnProperty_.call(this.map_, key);
};


/**
 * Asserts that the given key is a string.
 * @param {string} key The key to check.
 * @private
 */
goog.labs.structs.Map.prototype.assertKeyIsString_ = function(key) {
  goog.asserts.assert(goog.isString(key), 'key must be a string.');
};


/**
 * Browser feature enum necessary for map.
 * @enum {boolean}
 */
goog.labs.structs.Map.BrowserFeature = {
  // TODO(chrishenry): Replace with goog.userAgent detection.
  /**
   * Whether Object.create method is supported.
   */
  OBJECT_CREATE_SUPPORTED: !!Object.create,

  /**
   * Whether Object.keys method is supported.
   */
  OBJECT_KEYS_SUPPORTED: !!Object.keys
};
