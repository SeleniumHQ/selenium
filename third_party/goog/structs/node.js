// Copyright 2006 Google Inc.
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
 * @fileoverview Generic immutable node object to be used in collections.
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
