// Copyright 2007 Google Inc.
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
 * @fileoverview A LinkedMap datastructure that is accessed using key/value
 * pairs like an ordinary Map, but which guarantees a consistent iteration
 * order over its entries. The iteration order is either insertion order (the
 * default) or ordered from most recent to least recent use. By setting a fixed
 * size, the LRU version of the LinkedMap makes an effective object cache. This
 * data structure is similar to Java's LinkedHashMap.
 */


goog.provide('goog.structs.LinkedMap');

goog.require('goog.array');
goog.require('goog.structs.Map');


/**
 * Class for a LinkedMap datastructure, which combines O(1) map access for
 * key/value pairs with a linked list for a consistent iteration order. Sample
 * usage:
 *
 * <pre>
 * var m = new LinkedMap();
 * m.set('param1', 'A');
 * m.set('param2', 'B');
 * m.set('param3', 'C');
 * alert(m.getKeys()); // param1, param2, param3
 *
 * var c = new LinkedMap(5, true);
 * for (var i = 0; i < 10; i++) {
 *   c.set('entry' + i, false);
 * }
 * alert(c.getKeys()); // entry9, entry8, entry7, entry6, entry5
 *
 * c.set('entry5', true);
 * c.set('entry1', false);
 * alert(c.getKeys()); // entry1, entry5, entry9, entry8, entry7
 * </pre>
 *
 * @param {number} opt_maxCount The maximum number of objects to store in the
 *     LinkedMap. If unspecified or 0, there is no maximum.
 * @param {boolean} opt_cache When set, the LinkedMap stores items in order from
 *     most recently used to least recently used, instead of insertion order.
 * @constructor
 */
goog.structs.LinkedMap = function(opt_maxCount, opt_cache) {
  /**
   * The maximum number of entries to allow, or 0 if there is no limit.
   * @type {number}
   * @private
   */
  this.maxCount_ = opt_maxCount || 0;

  /**
   *
   * @type {boolean}
   * @private
   */
  this.cache_ = !!opt_cache;

  this.map_ = new goog.structs.Map();

  this.head_ = new goog.structs.LinkedMap.Node_(null);
  this.head_.next = this.head_.prev = this.head_;
};


/**
 * Retrieves the value for a given key. If this is a caching LinkedMap, the
 * entry will become the most recently used.
 * @param {string} key The key to retrieve the value for.
 * @param {*} opt_val A default value that will be returned if the key is
 *     not found, defaults to undefined.
 * @return {*} The retrieved value.
 */
goog.structs.LinkedMap.prototype.get = function(key, opt_val) {
  var node = this.map_.get(key);
  if (node) {
    if (this.cache_) {
      node.remove();
      this.insert_(node);
    }
    return node.value;
  }
  return opt_val;
};


/**
 * Sets a value for a given key. If this is a caching LinkedMap, this entry
 * will become the most recently used.
 * @param {string} key The key to retrieve the value for.
 * @param {*} value A default value that will be returned if the key is
 *     not found.
 */
goog.structs.LinkedMap.prototype.set = function(key, value) {
  var node = this.map_.get(key);
  if (node) {
    node.value = value;
    if (this.cache_) {
      node.remove();
      this.insert_(node);
    }
  } else {
    node = new goog.structs.LinkedMap.Node_(key, value);
    this.map_.set(key, node);
    this.insert_(node);
  }
};


/**
 * Returns the value of the first node without making any modifications.
 * @return {*} The value of the first node or undefined if the map is empty.
 */
goog.structs.LinkedMap.prototype.peek = function() {
  return this.head_.next.value;
};


/**
 * Removes a value from the LinkedMap based on its key.
 * @param {string} key The key to remove.
 * @return {boolean} True if the entry was removed, false if the key was not
 *     found.
 */
goog.structs.LinkedMap.prototype.remove = function(key) {
  var node = this.map_.get(key);
  if (node) {
    node.remove();
    this.map_.remove(key);
    return true;
  }

  return false;
};


/**
 * @return {number} The number of items currently in the LinkedMap.
 */
goog.structs.LinkedMap.prototype.getCount = function() {
  return this.map_.getCount();
};


/**
 * @return {boolean} True if the cache is empty, false if it contains any items.
 */
goog.structs.LinkedMap.prototype.isEmpty = function() {
  return this.map_.isEmpty();
};


/**
 * Sets the maximum number of entries allowed in this object, truncating any
 * excess objects if necessary.
 * @param {number} maxCount The new maximum number of entries to allow.
 */
goog.structs.LinkedMap.prototype.setMaxCount = function(maxCount) {
  this.maxCount_ = maxCount;
  this.truncate_();
};


/**
 * @return {Array.<string>} The list of the keys in the appropriate order for
 *     this LinkedMap.
 */
goog.structs.LinkedMap.prototype.getKeys = function() {
  return this.map(function(val, key) {
    return key;
  });
};


/**
 * @return {Array} The list of the values in the appropriate order for
 *     this LinkedMap.
 */
goog.structs.LinkedMap.prototype.getValues = function() {
  return this.map(function(val, key) {
    return val;
  });
};


/**
 * Tests whether a provided value is currently in the LinkedMap. This does not
 * affect item ordering in cache-style LinkedMaps.
 * @param {Object} value The value to check for presence of.
 * @return {boolean} True if the value is in the LinkedMap, false otherwise.
 */
goog.structs.LinkedMap.prototype.contains = function(value) {
  return goog.array.some(this.list_, function(el) {
    return el.getValue() == value;
  });
};


/**
 * Tests whether a provided key is currently in the LinkedMap. This does not
 * affect item ordering in cache-style LinkedMaps.
 * @param {Object} key The key to check for presence of.
 * @return {boolean} True if the key is in the LinkedMap, false otherwise.
 */
goog.structs.LinkedMap.prototype.containsKey = function(key) {
  return this.map_.containsKey(key);
};


/**
 * Removes all entries in this object.
 */
goog.structs.LinkedMap.prototype.clear = function() {
  this.map_.clear();
  // Drop references to the linked list entries and let the garbage collector
  // sort the dead.
  this.head_.next = this.head_.prev = this.head_;
};


/**
 * Call a function on each item in the LinkedMap.
 *
 * @see goog.structs.forEach
 * @param {Function} f The function to call for each item. The function takes
 *     three arguments: the value, the key, and the LinkedMap.
 * @param {Object} opt_obj The object context to use as "this" for the function.
 */
goog.structs.LinkedMap.prototype.forEach = function(f, opt_obj) {
  for (var n = this.head_.next; n != this.head_; n = n.next) {
    f.call(opt_obj, n.value, n.key, this);
  }
};


/**
 * Call a function on each item in the LinkedMap and return the results of
 * those calls in an array.
 *
 * @see goog.structs.map
 * @param {Function} f The function to call for each item. The function takes
 *     three arguments: the value, the key, and the LinkedMap.
 * @param {Object} opt_obj The object context to use as "this" for the function.
 */
goog.structs.LinkedMap.prototype.map = function(f, opt_obj) {
  var rv = [];
  for (var n = this.head_.next; n != this.head_; n = n.next) {
    rv.push(f.call(opt_obj, n.value, n.key, this));
  }
  return rv;
};


/**
 * Call a function on each item in the LinkedMap and return true if any of those
 * function calls returns a true-like value.
 *
 * @see goog.structs.some
 * @param {Function} f The function to call for each item. The function takes
 *     three arguments: the value, the key, and the LinkedMap, and returns a
 *     boolean.
 * @param {Object} opt_obj The object context to use as "this" for the function.
 * @return {boolean} True if f evaluates to true for at least one item in the
 *     LinkedMap, false otherwise.
 */
goog.structs.LinkedMap.prototype.some = function(f, opt_obj) {
  for (var n = this.head_.next; n != this.head_; n = n.next) {
    if (f.call(opt_obj, n.value, n.key, this)) {
      return true;
    }
  }
  return false;
};


/**
 * Call a function on each item in the LinkedMap and return true only if every
 * function call returns a true-like value.
 *
 * @see goog.structs.some
 * @param {Function} f The function to call for each item. The function takes
 *     three arguments: the value, the key, and the Cache, and returns a
 *     boolean.
 * @param {Object} opt_obj The object context to use as "this" for the function.
 * @return {boolean} True if f evaluates to true for every item in the Cache,
 *     false otherwise.
 */
goog.structs.LinkedMap.prototype.every = function(f, opt_obj) {
  for (var n = this.head_.next; n != this.head_; n = n.next) {
    if (!f.call(opt_obj, n.value, n.key, this)) {
      return false;
    }
  }
  return true;
};


/**
 * Appends a node to the list. LinkedMaps in cache mode add new nodes to
 * the head of the list, otherwise they are appended to the tail. If there is a
 * maximum size, the list will be truncated if necessary.
 *
 * @param {goog.structs.LinkedMap.Node_} node The item to insert.
 * @private
 */
goog.structs.LinkedMap.prototype.insert_ = function(node) {
  if (this.cache_) {
    node.next = this.head_.next;
    node.prev = this.head_;

    this.head_.next = node;
    node.next.prev = node;
  } else {
    node.prev = this.head_.prev;
    node.next = this.head_;

    this.head_.prev = node;
    node.prev.next = node;
  }

  this.truncate_();
};


/**
 * Removes elements from the LinkedMap if the maximum count has been exceeded.
 * the head of the list, otherwise they are appended to the tail. If there is a
 * maximum size, the list will be truncated if necessary.
 * @private
 */
goog.structs.LinkedMap.prototype.truncate_ = function() {
  if (this.maxCount_) {
    for (var i = this.map_.getCount(); i > this.maxCount_; i--) {
      var node = this.cache_ ? this.head_.prev : this.head_.next;
      node.remove();
      this.map_.remove(node.key);
    }
  }
};


/**
 * Internal class for a doubly-linked list node containing a key/value pair.
 * @param {string} key The key.
 * @param {*} value The value.
 * @constructor
 * @private
 */
goog.structs.LinkedMap.Node_ = function(key, value) {
  this.key = key;
  this.value = value;
};


/**
 * The next node in the list.
 * @type {goog.structs.LinkedMap.Node_}
 */
goog.structs.LinkedMap.Node_.prototype.next;


/**
 * The previous node in the list.
 * @type {goog.structs.LinkedMap.Node_}
 */
goog.structs.LinkedMap.Node_.prototype.prev;


/**
 * Causes this node to remove itself rom the list.
 */
goog.structs.LinkedMap.Node_.prototype.remove = function() {
  this.prev.next = this.next;
  this.next.prev = this.prev;

  this.prev = this.next = null;
};
