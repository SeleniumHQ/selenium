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
 * @fileoverview Datastructure: Trie.
 *
*
 *
 * This file provides the implementation of a trie data structure.  A trie is a
 * data structure that stores key/value pairs in a prefix tree.  See:
 *     http://en.wikipedia.org/wiki/Trie
 */


goog.provide('goog.structs.Trie');

goog.require('goog.object');
goog.require('goog.structs');



/**
 * Class for a Trie datastructure.  Trie data structures are made out of trees
 * of Trie classes.
 *
 * @param {Object=} opt_trie Optional goog.structs.Trie or Object to initialize
 *    trie with.
 * @constructor
 */
goog.structs.Trie = function(opt_trie) {
  /**
   * This trie's child nodes.
   * @private
   * @type {Object.<goog.structs.Trie>}
   */
  this.childNodes_ = {};

  if (opt_trie) {
    this.setAll(opt_trie);
  }
};


/**
 * This trie's value.  For the base trie, this will be the value of the
 * empty key, if defined.
 * @private
 * @type {*}
 */
goog.structs.Trie.prototype.value_ = undefined;


/**
 * Sets the given key/value pair in the trie.  O(L), where L is the length
 * of the key.
 * @param {string} key The key.
 * @param {*} value The value.
 */
goog.structs.Trie.prototype.set = function(key, value) {
  this.setOrAdd_(key, value, false);
};


/**
 * Adds the given key/value pair in the trie.  Throw an exception if the key
 * already exists in the trie.  O(L), where L is the length of the key.
 * @param {string} key The key.
 * @param {*} value The value.
 */
goog.structs.Trie.prototype.add = function(key, value) {
  this.setOrAdd_(key, value, true);
};


/**
 * Helper function for set and add.  Adds the given key/value pair to
 * the trie, or, if the key already exists, sets the value of the key. If
 * opt_add is true, then throws an exception if the key already has a value in
 * the trie.  O(L), where L is the length of the key.
 * @param {string} key The key.
 * @param {*} value The value.
 * @param {boolean=} opt_add Throw exception if key is already in the trie.
 * @private
 */
goog.structs.Trie.prototype.setOrAdd_ = function(key, value, opt_add) {
  var node = this;
  for (var characterPosition = 0; characterPosition < key.length;
       characterPosition++) {
    var currentCharacter = key.charAt(characterPosition);
    if (!node.childNodes_[currentCharacter]) {
      node.childNodes_[currentCharacter] = new goog.structs.Trie();
    }
    node = node.childNodes_[currentCharacter];
  }
  if (opt_add && node.value_ !== undefined) {
    throw Error('The collection already contains the key "' + key + '"');
  } else {
    node.value_ = value;
  }
};


/**
 * Adds multiple key/value pairs from another goog.structs.Trie or Object.
 * O(N) where N is the number of nodes in the trie.
 * @param {Object|goog.structs.Trie} trie Object containing the data to add.
 */
goog.structs.Trie.prototype.setAll = function(trie) {
  var keys = goog.structs.getKeys(trie);
  var values = goog.structs.getValues(trie);

  for (var i = 0; i < keys.length; i++) {
    this.set(keys[i], values[i]);
  }
};


/**
 * Retrieves a value from the trie given a key.  O(L), where L is the length of
 * the key.
 * @param {string} key The key to retrieve from the trie.
 * @return {*} The value of the key in the trie, or undefined if the trie does
 *     not contain this key.
 */
goog.structs.Trie.prototype.get = function(key) {
  var node = this;
  for (var characterPosition = 0; characterPosition < key.length;
       characterPosition++) {
    var currentCharacter = key.charAt(characterPosition);
    if (!node.childNodes_[currentCharacter]) {
      return undefined;
    }
    node = node.childNodes_[currentCharacter];
  }
  return node.value_;
};


/**
 * Retrieves all values from the trie that correspond to prefixes of the given
 * input key. O(L), where L is the length of the key.
 *
 * @param {string} key The key to use for lookup. The given key as well as all
 *     prefixes of the key are retrieved.
 * @param {?number=} opt_keyStartIndex Optional position in key to start lookup
 *     from. Defaults to 0 if not specified.
 * @return {Object} Map of end index of matching prefixes and corresponding
 *     values. Empty if no match found.
 */
goog.structs.Trie.prototype.getKeyAndPrefixes = function(key,
                                                         opt_keyStartIndex) {
  var node = this;
  var matches = {};
  var characterPosition = opt_keyStartIndex || 0;

  if (node.value_ !== undefined) {
    matches[characterPosition] = node.value_;
  }

  for (; characterPosition < key.length; characterPosition++) {
    var currentCharacter = key.charAt(characterPosition);
    if (!(currentCharacter in node.childNodes_)) {
      break;
    }
    node = node.childNodes_[currentCharacter];
    if (node.value_ !== undefined) {
      matches[characterPosition] = node.value_;
    }
  }

  return matches;
};


/**
 * Gets the values of the trie.  Not returned in any reliable order.  O(N) where
 * N is the number of nodes in the trie.  Calls getValuesInternal_.
 * @return {Array} The values in the trie.
 */
goog.structs.Trie.prototype.getValues = function() {
  var allValues = [];
  this.getValuesInternal_(allValues);
  return allValues;
};


/**
 * Gets the values of the trie.  Not returned in any reliable order.  O(N) where
 * N is the number of nodes in the trie.  Builds the values as it goes.
 * @param {Array.<string>} allValues Array to place values into.
 * @private
 */
goog.structs.Trie.prototype.getValuesInternal_ = function(allValues) {
  if (this.value_ !== undefined) {
    allValues.push(this.value_);
  }
  for (var childNode in this.childNodes_) {
    this.childNodes_[childNode].getValuesInternal_(allValues);
  }
};


/**
 * Gets the keys of the trie.  Not returned in any reliable order.  O(N) where
 * N is the number of nodes in the trie (or prefix subtree).
 * @param {string=} opt_prefix Find only keys with this optional prefix.
 * @return {Array} The keys in the trie.
 */
goog.structs.Trie.prototype.getKeys = function(opt_prefix) {
  var allKeys = [];
  if (opt_prefix) {
    // Traverse to the given prefix, then call getKeysInternal_ to dump the
    // keys below that point.
    var node = this;
    for (var characterPosition = 0; characterPosition < opt_prefix.length;
        characterPosition++) {
      var currentCharacter = opt_prefix.charAt(characterPosition);
      if (!node.childNodes_[currentCharacter]) {
        return [];
      }
      node = node.childNodes_[currentCharacter];
    }
    node.getKeysInternal_(opt_prefix, allKeys);
  } else {
    this.getKeysInternal_('', allKeys);
  }
  return allKeys;
};


/**
 * Private method to get keys from the trie.  Builds the keys as it goes.
 * @param {string} keySoFar The partial key (prefix) traversed so far.
 * @param {Array} allKeys The partially built array of keys seen so far.
 * @private
 */
goog.structs.Trie.prototype.getKeysInternal_ = function(keySoFar, allKeys) {
  if (this.value_ !== undefined) {
    allKeys.push(keySoFar);
  }
  for (var childNode in this.childNodes_) {
    this.childNodes_[childNode].getKeysInternal_(keySoFar + childNode, allKeys);
  }
};


/**
 * Checks to see if a certain key is in the trie.  O(L), where L is the length
 * of the key.
 * @param {string} key A key that may be in the trie.
 * @return {boolean} Whether the trie contains key.
 */
goog.structs.Trie.prototype.containsKey = function(key) {
  return this.get(key) !== undefined;
};


/**
 * Checks to see if a certain value is in the trie.  Worst case is O(N) where
 * N is the number of nodes in the trie.
 * @param {*} value A value that may be in the trie.
 * @return {boolean} Whether the trie contains the value.
 */
goog.structs.Trie.prototype.containsValue = function(value) {
  if (this.value_ === value) {
    return true;
  }
  for (var childNode in this.childNodes_) {
    if (this.childNodes_[childNode].containsValue(value)) {
      return true;
    }
  }
  return false;
};


/**
 * Completely empties a trie of all keys and values.  ~O(1)
 */
goog.structs.Trie.prototype.clear = function() {
  this.childNodes_ = {};
  this.value_ = undefined;
};


/**
 * Removes a key from the trie or throws an exception if the key is not in the
 * trie.  O(L), where L is the length of the key.
 * @param {string} key A key that should be removed from the trie.
 * @return {*} The value whose key was removed.
 */
goog.structs.Trie.prototype.remove = function(key) {
  var node = this;
  var parents = [];
  for (var characterPosition = 0; characterPosition < key.length;
       characterPosition++) {
    var currentCharacter = key.charAt(characterPosition);
    if (!node.childNodes_[currentCharacter]) {
      throw Error('The collection does not have the key "' + key + '"');
    }

    // Archive the current parent and child name (key in childNodes_) so that
    // we may remove the following node and its parents if they are empty.
    parents.push([node, currentCharacter]);

    node = node.childNodes_[currentCharacter];
  }
  var oldValue = node.value_;
  delete node.value_;

  while (parents.length > 0) {
    var currentParentAndCharacter = parents.pop();
    var currentParent = currentParentAndCharacter[0];
    var currentCharacter = currentParentAndCharacter[1];
    if (goog.object.isEmpty(
        currentParent.childNodes_[currentCharacter].childNodes_)) {
      // If we have no child nodes, then remove this node.
      delete currentParent.childNodes_[currentCharacter];
    } else {
      // No point of traversing back any further, since we can't remove this
      // path.
      break;
    }
  }
  return oldValue;
};


/**
 * Clones a trie and returns a new trie.  O(N), where N is the number of nodes
 * in the trie.
 * @return {goog.structs.Trie} A new goog.structs.Trie with the same key value
 *     pairs.
 */
goog.structs.Trie.prototype.clone = function() {
  return new goog.structs.Trie(this);
};


/**
 * Returns the number of key value pairs in the trie.  O(N), where N is the
 * number of nodes in the trie.
 * TODO: This could be optimized by storing a weight (count below) in every
 * node.
 * @return {number} The number of pairs.
 */
goog.structs.Trie.prototype.getCount = function() {
  return goog.structs.getCount(this.getValues());
};


/**
 * Returns true if this trie contains no elements.  ~O(1).
 * @return {boolean} True iff this trie contains no elements.
 */
goog.structs.Trie.prototype.isEmpty = function() {
  return this.value_ === undefined && goog.structs.isEmpty(this.childNodes_);
};
