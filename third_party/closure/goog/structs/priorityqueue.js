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
 * @fileoverview Datastructure: Priority Queue.
 *
 *
 * This file provides the implementation of a Priority Queue. Smaller priorities
 * move to the front of the queue. If two values have the same priority,
 * it is arbitrary which value will come to the front of the queue first.
 */

// TODO(user): Should this rely on natural ordering via some Comparable
//     interface?


goog.provide('goog.structs.PriorityQueue');

goog.require('goog.structs');
goog.require('goog.structs.Heap');



/**
 * Class for Priority Queue datastructure.
 *
 * @constructor
 * @extends {goog.structs.Heap}
 */
goog.structs.PriorityQueue = function() {
  goog.structs.Heap.call(this);
};
goog.inherits(goog.structs.PriorityQueue, goog.structs.Heap);


/**
 * Puts the specified value in the queue.
 * @param {*} priority The priority of the value.
 * @param {*} value The value.
 */
goog.structs.PriorityQueue.prototype.enqueue = function(priority, value) {
  this.insert(priority, value);
};


/**
 * Retrieves and removes the head of this queue.
 * @return {*} The element at the head of this queue. Returns
 *     undefined if the queue is empty.
 */
goog.structs.PriorityQueue.prototype.dequeue = function() {
  return this.remove();
};
