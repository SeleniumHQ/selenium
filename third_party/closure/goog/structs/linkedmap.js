// Copyright 2007 The Closure Library Authors. All Rights Reserved.
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
 * @fileoverview A LinkedMap data structure that is accessed using key/value
 * pairs like an ordinary Map, but which guarantees a consistent iteration
 * order over its entries. The iteration order is either insertion order (the
 * default) or ordered from most recent to least recent use. By setting a fixed
 * size, the LRU version of the LinkedMap makes an effective object cache. This
 * data structure is similar to Java's LinkedHashMap.
 *
 * @author brenneman@google.com (Shawn Brenneman)
 */


goog.provide('goog.structs.LinkedMap');

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
 * @param {number=} opt_maxCount The maximum number of objects to store in the
 *     LinkedMap. If unspecified or 0, there is no maximum.
 * @param {boolean=} opt_cache When set, the LinkedMap stores items in order
 *     from most recently used to least recently used, instead of insertion
 *     order.
 * @param {function(string, VALUE)=} opt_evictionCallback Called with the
 *     removed stringified key as the first argument and value as the second
 *     argument after the key was evicted from the LRU because the max count
 *     was reached.
 * @constructor
 * @template KEY, VALUE
 */
goog.structs.LinkedMap = function(
    opt_maxCount, opt_cache, opt_evictionCallback) {
  /**
   * The maximum number of entries to allow, or null if there is no limit.
   * @private {?number}
   */
  this.maxCount_ = opt_maxCount || null;

  /** @private @const {boolean} */
  this.cache_ = !!opt_cache;

  /** @private {function(string, VALUE)|undefined} */
  this.evictionCallback_ = opt_evictionCallback;

  /**
   * @private @const {!goog.structs.Map<string,
   *     goog.structs.LinkedMap.Node_<string, VALUE>>}
   */
  this.map_ = new goog.structs.Map();

  this.head_ = new goog.structs.LinkedMap.Node_('', undefined);
  this.head_.next = this.head_.prev = this.head_;
};


/**
 * Finds a node and updates it to be the most recently used.
 * @param {string} key The key of the node.
 * @return {goog.structs.LinkedMap.Node_<string, VALUE>} The node or null if not
 *     found.
 * @private
 */
goog.structs.LinkedMap.prototype.findAndMoveToTop_ = function(key) {
  var node = this.map_.get(key);
  if (node) {
    if (this.cache_) {
      node.remove();
      this.insert_(node);
    }
  }
  return node;
};


/**
 * Retrieves the value for a given key. If this is a caching LinkedMap, the
 * entry will become the most recently used.
 * @param {string} key The key to retrieve the value for.
 * @param {VALUE=} opt_val A default value that will be returned if the key is
 *     not found, defaults to undefined.
 * @return {VALUE} The retrieved value.
 */
goog.structs.LinkedMap.prototype.get = function(key, opt_val) {
  var node = this.findAndMoveToTop_(key);
  return node ? node.value : opt_val;
};


/**
 * Retrieves the value for a given key without updating the entry to be the
 * most recently used.
 * @param {string} key The key to retrieve the value for.
 * @param {VALUE=} opt_val A default value that will be returned if the key is
 *     not found.
 * @return {VALUE} The retrieved value.
 */
goog.structs.LinkedMap.prototype.peekValue = function(key, opt_val) {
  var node = this.map_.get(key);
  return node ? node.value : opt_val;
};


/**
 * Sets a value for a given key. If this is a caching LinkedMap, this entry
 * will become the most recently used.
 * @param {string} key Key with which the specified value is to be associated.
 * @param {VALUE} value Value to be associated with the specified key.
 */
goog.structs.LinkedMap.prototype.set = function(key, value) {
  var node = this.findAndMoveToTop_(key);
  if (node) {
    node.value = value;
  } else {
    node = new goog.structs.LinkedMap.Node_(key, value);
    this.map_.set(key, node);
    this.insert_(node);
  }
};


/**
 * Returns the value of the first node without making any modifications.
 * @return {VALUE} The value of the first node or undefined if the map is empty.
 */
goog.structs.LinkedMap.prototype.peek = function() {
  return this.head_.next.value;
};


/**
 * Returns the value of the last node without making any modifications.
 * @return {VALUE} The value of the last node or undefined if the map is empty.
 */
goog.structs.LinkedMap.prototype.peekLast = function() {
  return this.head_.prev.value;
};


/**
 * Removes the first node from the list and returns its value.
 * @return {VALUE} The value of the popped node, or undefined if the map was
 *     empty.
 */
goog.structs.LinkedMap.prototype.shift = function() {
  return this.popNode_(this.head_.next);
};


/**
 * Removes the last node from the list and returns its value.
 * @return {VALUE} The value of the popped node, or undefined if the map was
 *     empty.
 */
goog.structs.LinkedMap.prototype.pop = function() {
  return this.popNode_(this.head_.prev);
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
    this.removeNode(node);
    return true;
  }
  return false;
};


/**
 * Removes a node from the {@code LinkedMap}. It can be overridden to do
 * further cleanup such as disposing of the node value.
 * @param {!goog.structs.LinkedMap.Node_<string, VALUE>} node The node to
 *     remove.
 * @protected
 */
goog.structs.LinkedMap.prototype.removeNode = function(node) {
  node.remove();
  this.map_.remove(node.key);
};


/**
 * @return {number} The number of items currently in the LinkedMap. Sub classes
 *     may override this to change how items are counted (e.g. to introduce
 *     per item weight). Truncation will always proceed as long as the count
 *     returned from this method is higher than the max count for this map.
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
 * Sets a callback that fires when an entry is evicted because max entry
 * count is reached. The callback is called with the removed stringified key
 * as the first argument and value as the second argument after the key was
 * evicted from the LRU because the max count was reached.
 * @param {function(string, VALUE)} evictionCallback
 */
goog.structs.LinkedMap.prototype.setEvictionCallback = function(
    evictionCallback) {
  this.evictionCallback_ = evictionCallback;
};


/**
 * Sets the maximum number of entries allowed in this object, truncating any
 * excess objects if necessary.
 * @param {number} maxCount The new maximum number of entries to allow.
 */
goog.structs.LinkedMap.prototype.setMaxCount = function(maxCount) {
  this.maxCount_ = maxCount || null;
  if (this.maxCount_ != null) {
    this.truncate_(this.maxCount_);
  }
};


/**
 * @return {!Array<string>} The list of the keys in the appropriate order for
 *     this LinkedMap.
 */
goog.structs.LinkedMap.prototype.getKeys = function() {
  return this.map(function(val, key) { return key; });
};


/**
 * @return {!Array<VALUE>} The list of the values in the appropriate order for
 *     this LinkedMap.
 */
goog.structs.LinkedMap.prototype.getValues = function() {
  return this.map(function(val, key) { return val; });
};


/**
 * Tests whether a provided value is currently in the LinkedMap. This does not
 * affect item ordering in cache-style LinkedMaps.
 * @param {VALUE} value The value to check for.
 * @return {boolean} Whether the value is in the LinkedMap.
 */
goog.structs.LinkedMap.prototype.contains = function(value) {
  return this.some(function(el) { return el == value; });
};


/**
 * Tests whether a provided key is currently in the LinkedMap. This does not
 * affect item ordering in cache-style LinkedMaps.
 * @param {string} key The key to check for.
 * @return {boolean} Whether the key is in the LinkedMap.
 */
goog.structs.LinkedMap.prototype.containsKey = function(key) {
  return this.map_.containsKey(key);
};


/**
 * Removes all entries in this object.
 */
goog.structs.LinkedMap.prototype.clear = function() {
  this.truncate_(0);
};


/**
 * Calls a function on each item in the LinkedMap.
 *
 * @see goog.structs.forEach
 * @param {function(this:T, VALUE, KEY, goog.structs.LinkedMap<KEY, VALUE>)} f
 * @param {T=} opt_obj The value of "this" inside f.
 * @template T
 */
goog.structs.LinkedMap.prototype.forEach = function(f, opt_obj) {
  for (var n = this.head_.next; n != this.head_; n = n.next) {
    f.call(opt_obj, n.value, n.key, this);
  }
};


/**
 * Calls a function on each item in the LinkedMap and returns the results of
 * those calls in an array.
 *
 * @see goog.structs.map
 * @param {function(this:T, VALUE, KEY,
 *         goog.structs.LinkedMap<KEY, VALUE>): RESULT} f
 *     The function to call for each item. The function takes
 *     three arguments: the value, the key, and the LinkedMap.
 * @param {T=} opt_obj The object context to use as "this" for the
 *     function.
 * @return {!Array<RESULT>} The results of the function calls for each item in
 *     the LinkedMap.
 * @template T,RESULT
 */
goog.structs.LinkedMap.prototype.map = function(f, opt_obj) {
  var rv = [];
  for (var n = this.head_.next; n != this.head_; n = n.next) {
    rv.push(f.call(opt_obj, n.value, n.key, this));
  }
  return rv;
};


/**
 * Calls a function on each item in the LinkedMap and returns true if any of
 * those function calls returns a true-like value.
 *
 * @see goog.structs.some
 * @param {function(this:T, VALUE, KEY,
 *         goog.structs.LinkedMap<KEY, VALUE>):boolean} f
 *     The function to call for each item. The function takes
 *     three arguments: the value, the key, and the LinkedMap, and returns a
 *     boolean.
 * @param {T=} opt_obj The object context to use as "this" for the
 *     function.
 * @return {boolean} Whether f evaluates to true for at least one item in the
 *     LinkedMap.
 * @template T
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
 * Calls a function on each item in the LinkedMap and returns true only if every
 * function call returns a true-like value.
 *
 * @see goog.structs.some
 * @param {function(this:T, VALUE, KEY,
 *         goog.structs.LinkedMap<KEY, VALUE>):boolean} f
 *     The function to call for each item. The function takes
 *     three arguments: the value, the key, and the Cache, and returns a
 *     boolean.
 * @param {T=} opt_obj The object context to use as "this" for the
 *     function.
 * @return {boolean} Whether f evaluates to true for every item in the Cache.
 * @template T
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
 * Appends a node to the list. LinkedMap in cache mode adds new nodes to
 * the head of the list, otherwise they are appended to the tail. If there is a
 * maximum size, the list will be truncated if necessary.
 *
 * @param {goog.structs.LinkedMap.Node_<string, VALUE>} node The item to insert.
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

  if (this.maxCount_ != null) {
    this.truncate_(this.maxCount_);
  }
};


/**
 * Removes elements from the LinkedMap if the given count has been exceeded.
 * In cache mode removes nodes from the tail of the list. Otherwise removes
 * nodes from the head.
 * @param {number} count Number of elements to keep.
 * @private
 */
goog.structs.LinkedMap.prototype.truncate_ = function(count) {
  while (this.getCount() > count) {
    var toRemove = this.cache_ ? this.head_.prev : this.head_.next;
    this.removeNode(toRemove);
    if (this.evictionCallback_) {
      this.evictionCallback_(toRemove.key, toRemove.value);
    }
  }
};


/**
 * Removes the node from the LinkedMap if it is not the head, and returns
 * the node's value.
 * @param {!goog.structs.LinkedMap.Node_<string, VALUE>} node The item to
 *     remove.
 * @return {VALUE} The value of the popped node.
 * @private
 */
goog.structs.LinkedMap.prototype.popNode_ = function(node) {
  if (this.head_ != node) {
    this.removeNode(node);
  }
  return node.value;
};



/**
 * Internal class for a doubly-linked list node containing a key/value pair.
 * @param {KEY} key The key.
 * @param {VALUE} value The value.
 * @constructor
 * @template KEY, VALUE
 * @private
 */
goog.structs.LinkedMap.Node_ = function(key, value) {
  /** @type {KEY} */
  this.key = key;

  /** @type {VALUE} */
  this.value = value;
};


/**
 * The next node in the list.
 * @type {!goog.structs.LinkedMap.Node_<KEY, VALUE>}
 */
goog.structs.LinkedMap.Node_.prototype.next;


/**
 * The previous node in the list.
 * @type {!goog.structs.LinkedMap.Node_<KEY, VALUE>}
 */
goog.structs.LinkedMap.Node_.prototype.prev;


/**
 * Causes this node to remove itself from the list.
 */
goog.structs.LinkedMap.Node_.prototype.remove = function() {
  this.prev.next = this.next;
  this.next.prev = this.prev;

  delete this.prev;
  delete this.next;
};
