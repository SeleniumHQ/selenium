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
 * @fileoverview Generic immutable node object to be used in collections.
 *
 */


goog.provide('goog.structs.Node');


/**
 * A generic immutable node. This can be used in various collections that
 * require a node object for its item (such as a heap).
 * @param {*} key Key.
 * @param {*} value Vaue.
 * @constructor
 */
goog.structs.Node = function(key, value) {
  /**
   * The key.
   * @type {*}
   * @private
   */
  this.key_ = key;

  /**
   * The value.
   * @type {*}
   * @private
   */
  this.value_ = value;
};


/**
 * Gets the key.
 * @return {*} The key.
 */
goog.structs.Node.prototype.getKey = function() {
  return this.key_;
};


/**
 * Gets the value.
 * @return {*} The value.
 */
goog.structs.Node.prototype.getValue = function() {
  return this.value_;
};


/**
 * Clones a node and returns a new node.
 * @return {goog.structs.Node} A new goog.structs.Node with the same key value
 *     pair.
 */
goog.structs.Node.prototype.clone = function() {
  return new goog.structs.Node(this.key_, this.value_);
};
