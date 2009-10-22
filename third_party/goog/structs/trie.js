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
 * @fileoverview Datastructure: Trie
 *
 * This file provides the implementation of a trie data structure.  A trie is a
 * data structure that stores key / value pairs in a prefix tree.  See:
 *     http://en.wikipedia.org/wiki/Trie
 *
 */


goog.provide('goog.structs.Trie');

goog.require('goog.structs');
goog.require('goog.object');


/**
 * Class for a Trie datastructure.  Trie data structures are made out of trees
 * of Trie classes.
 *
 * @param {Object} opt_trie Optional goog.structs.Trie or Object to initialize
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
 * @type {string|undefined}
 */
goog.structs.Trie.prototype.value_ = undefined;


/**
 * Sets the given key / value pair in the trie.  O(L), where L is the length
 * of the key.
 * @param {string} key The key.
 * @param {*} value The value.
 */
goog.structs.Trie.prototype.set = function(key, value) {
  this.setOrAdd_(key, value, false);
};


/**
 * Adds the given key / value pair in the trie.  Throw an exception if the key
 * already exists in the trie.  O(L), where L is the length of the key.
 * @param {string} key The key.
 * @param {*} value The value.
 */
goog.structs.Trie.prototype.add = function(key, value) {
  this.setOrAdd_(key, value, true);
};


/**
 * Helper function for set and add.  Sets / adds the given key / value pair in
 * the trie.  If opt_add is true, then throws an exception if the key
 * already exists in the trie.  O(L), where L is the length of the key.
 * @param {string} key The key.
 * @param {*} value The value.
 * @param {boolean} opt_add Throw exception if key is already in the trie.
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
 * Adds multiple key value pairs from another goog.structs.Trie or Object.
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
 * @param {Array.<string>} allValues Array to place values in to.
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
 * @param {string} opt_prefix Find only keys with this optional prefix.
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
 * @param {string} keySoFar The partual key (prefix) traversed so far.
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
 * @return {boolean} Returns true iff the trie contains key.
 */
goog.structs.Trie.prototype.containsKey = function(key) {
  return this.get(key) !== undefined;
};


/**
 * Checks to see if a certain value is in the trie.  Worst case is O(N) where
 * N is the number of nodes in the trie.
 * @param {*} value A value that may be in the trie.
 * @return {boolean} Returns true iff the trie contains the value.
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
 * (This could be optimized by storing a weight (count below) in every node.)
 * @return {number} The nuber of pairs.
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
