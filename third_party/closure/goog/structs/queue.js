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
 * @fileoverview Datastructure: Queue.
 *
*
 *
 * This file provides the implementation of a FIFO Queue structure.
 * API is similar to that of com.google.common.collect.IntQueue
 */

goog.provide('goog.structs.Queue');

goog.require('goog.array');



/**
 * Class for FIFO Queue data structure.
 *
 * @constructor
 */
goog.structs.Queue = function() {
  this.elements_ = [];
};


/**
 * The index of the next element to be removed from the queue.
 * @private
 * @type {number}
 */
goog.structs.Queue.prototype.head_ = 0;


/**
 * The index at which the next element would be added to the queue.
 * @private
 * @type {number}
 */
goog.structs.Queue.prototype.tail_ = 0;


/**
 * Puts the specified element on this queue.
 * @param {*} element The element to be added to the queue.
 */
goog.structs.Queue.prototype.enqueue = function(element) {
  this.elements_[this.tail_++] = element;
};


/**
 * Retrieves and removes the head of this queue.
 * @return {*} The element at the head of this queue. Returns undefined if the
 *     queue is empty.
 */
goog.structs.Queue.prototype.dequeue = function() {
  if (this.head_ == this.tail_) {
    return undefined;
  }
  var result = this.elements_[this.head_];
  delete this.elements_[this.head_];
  this.head_++;
  return result;
};


/**
 * Retrieves but does not remove the head of this queue.
 * @return {*} The element at the head of this queue. Returns undefined if the
 *     queue is empty.
 */
goog.structs.Queue.prototype.peek = function() {
  if (this.head_ == this.tail_) {
    return undefined;
  }
  return this.elements_[this.head_];
};


/**
 * Returns the number of elements in this queue.
 * @return {number} The number of elements in this queue.
 */
goog.structs.Queue.prototype.getCount = function() {
  return this.tail_ - this.head_;
};


/**
 * Returns true if this queue contains no elements.
 * @return {boolean} true if this queue contains no elements.
 */
goog.structs.Queue.prototype.isEmpty = function() {
  return this.tail_ - this.head_ == 0;
};


/**
 * Removes all elements from the queue.
 */
goog.structs.Queue.prototype.clear = function() {
  this.elements_.length = 0;
  this.head_ = 0;
  this.tail_ = 0;
};


/**
 * Returns true if the given value is in the queue.
 * @param {*} obj The value to look for.
 * @return {boolean} Whether the object is in the queue.
 */
goog.structs.Queue.prototype.contains = function(obj) {
  return goog.array.contains(this.elements_, obj);
};


/**
 * Removes the first occurrence of a particular value from the queue.
 * @param {*} obj Object to remove.
 * @return {boolean} True if an element was removed.
 */
goog.structs.Queue.prototype.remove = function(obj) {
  var index = goog.array.indexOf(this.elements_, obj);
  if (index < 0) {
    return false;
  }
  if (index == this.head_) {
    this.dequeue();
  } else {
    goog.array.removeAt(this.elements_, index);
    this.tail_--;
  }
  return true;
};


/**
 * Returns all the values in the queue.
 * @return {Array} An array of the values in the queue.
 */
goog.structs.Queue.prototype.getValues = function() {
  return this.elements_.slice(this.head_, this.tail_);
};
