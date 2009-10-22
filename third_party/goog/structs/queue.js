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
 * @fileoverview Datastructure: Queue
 *
 * This file provides the implementation of a FIFO Queue structure.
 * API is similar to that of com.google.common.collect.IntQueue
 */


goog.provide('goog.structs.Queue');

goog.require('goog.structs');


/**
 * Class for FIFO Queue datastructure.
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
  this.elements_ = [];
  this.head_ = 0;
  this.tail_ = 0;
};


/**
 * Returns true if the given value is in the queue.
 * @param {*} obj The value to look for.
 * @return {boolean} Whether the object is in the queue.
 */
goog.structs.Queue.prototype.contains = function(obj) {
  return goog.structs.contains(this.elements_);
};


/**
 * Removes the first occurance of a particular value from the queue.
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
  var ret = [];
  for (var i = this.head_; i < this.tail_; i++) {
    ret.push(this.elements_[i]);
  }
  return ret;
};
