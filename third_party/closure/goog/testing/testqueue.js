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
 * @fileoverview Generic queue for writing unit tests.
 */

goog.provide('goog.testing.TestQueue');



/**
 * Generic queue for writing unit tests
 * @constructor
 */
goog.testing.TestQueue = function() {
  /**
   * Events that have accumulated
   * @type {Array<Object>}
   * @private
   */
  this.events_ = [];
};


/**
 * Adds a new event onto the queue.
 * @param {Object} event The event to queue.
 */
goog.testing.TestQueue.prototype.enqueue = function(event) {
  this.events_.push(event);
};


/**
 * Returns whether the queue is empty.
 * @return {boolean} Whether the queue is empty.
 */
goog.testing.TestQueue.prototype.isEmpty = function() {
  return this.events_.length == 0;
};


/**
 * Gets the next event from the queue. Throws an exception if the queue is
 * empty.
 * @param {string=} opt_comment Comment if the queue is empty.
 * @return {Object} The next event from the queue.
 */
goog.testing.TestQueue.prototype.dequeue = function(opt_comment) {
  if (this.isEmpty()) {
    throw Error('Handler is empty: ' + opt_comment);
  }
  return this.events_.shift();
};
