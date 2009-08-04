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
 * @fileoverview Datastructure: Circular Buffer
 *
 * Implements a buffer with a maximum size. New entries override the oldest
 * entries when the maximum size has been reached.
 */


goog.provide('goog.structs.CircularBuffer');


/**
 * Class for CircularBuffer.
 * @param {number} opt_maxSize The maximum size of the buffer.
 * @constructor
 */
goog.structs.CircularBuffer = function(opt_maxSize) {
  /**
   * Maximum size of the the circular array structure.
   * @type {number}
   * @private
   */
  this.maxSize_ = opt_maxSize || 100;

  /**
   * Underlying array for the CircularBuffer.
   * @type {Array}
   * @private
   */
  this.buff_ = [];
};


/**
 * Index of the next element in the circular array structure.
 * @type {number}
 * @private
 */
goog.structs.CircularBuffer.prototype.nextPtr_ = 0;


/**
 * Adds an item to the buffer. May remove the oldest item if the buffer is at
 * max size.
 * @param {*} item The item to add.
 */
goog.structs.CircularBuffer.prototype.add = function(item) {
  this.buff_[this.nextPtr_] = item;
  this.nextPtr_ = (this.nextPtr_ + 1) % this.maxSize_;
};


/**
 * Returns the item at the specified index.
 * @param {number} index The index of the item. The index of an item can change
 *     after calls to add if the buffer is at maximum size.
 */
goog.structs.CircularBuffer.prototype.get = function(index) {
  index = this.normalizeIndex_(index);
  return this.buff_[index];
};


/**
 * Sets the item at the specified index.
 * @param {number} index The index of the item. The index of an item can change
 *     after calls to add if the buffer is at maximum size.
 * @param {*} item The item to add.
 */
goog.structs.CircularBuffer.prototype.set = function(index, item) {
  index = this.normalizeIndex_(index);
  this.buff_[index] = item;
};


/**
 * Returns the current number of items in the buffer.
 * @return {number} the current number of items in the buffer.
 */
goog.structs.CircularBuffer.prototype.getCount = function() {
  return this.buff_.length;
};


/**
 * @return {boolean} Whether the buffer is empty.
 */
goog.structs.CircularBuffer.prototype.isEmpty = function() {
  return this.buff_.length == 0;
};


/**
 * Empties the current buffer.
 */
goog.structs.CircularBuffer.prototype.clear = function() {
  this.buff_.length = 0;
  this.nextPtr_ = 0;
};


/**
 * @return {Array} The values in the buffer.
 */
goog.structs.CircularBuffer.prototype.getValues = function() {
  // getNewestValues returns all the values if the maxCount parameter is the
  // count
  return this.getNewestValues(this.getCount());
};


/**
 * Returns the newest values in the buffer up to count.
 * @param {number} maxCount The maximum numer of values to get. Should be a
 *     positive number.
 * @return {Array} The newest values in the buffer up to count.
 */
goog.structs.CircularBuffer.prototype.getNewestValues = function(maxCount) {
  var l = this.getCount();
  var start = this.getCount() - maxCount;
  var rv = [];
  for (var i = start; i < l; i++) {
    rv[i] = this.get(i);
  }
  return rv;
};


/**
 * @return {Array} The indexes in the buffer.
 */
goog.structs.CircularBuffer.prototype.getKeys = function() {
  var rv = [];
  var l = this.getCount();
  for (var i = 0; i < l; i++) {
    rv[i] = i;
  }
  return rv;
};


/**
 * Whether the buffer contains the key/index.
 * @param {number} key The key/index to check for.
 * @return {boolean} Whether the buffer contains the key/index.
 */
goog.structs.CircularBuffer.prototype.containsKey = function(key) {
  return key < this.getCount();
};


/**
 * Whether the buffer contains the given value.
 * @param {*} value The value to check for.
 * @return {boolean} Whether the buffer contains the given value.
 */
goog.structs.CircularBuffer.prototype.containsValue = function(value) {
  var l = this.getCount();
  for (var i = 0; i < l; i++) {
    if (this.get(i) == value) {
      return true;
    }
  }
  return false;
};


/**
 * Returns the last item inserted into the buffer.
 * @return {*} The last item inserted into the buffer, or null if the buffer is
 *     empty.
 */
goog.structs.CircularBuffer.prototype.getLast = function() {
  if (this.getCount() == 0) {
    return null;
  }
  return this.get(this.getCount() - 1);
};


/**
 * Helper function to convert an index in the number space of oldest to most
 * newest items in the array to the position that the element will be in the
 * underlying array.
 * @param {number} index The index of the item.
 * @private
 */
goog.structs.CircularBuffer.prototype.normalizeIndex_ = function(index) {
  if (index >= this.buff_.length) {
    throw Error('Out of bounds exception');
  }

  if (this.buff_.length < this.maxSize_) {
    return index;
  }

  return (this.nextPtr_ + Number(index)) % this.maxSize_;
};
