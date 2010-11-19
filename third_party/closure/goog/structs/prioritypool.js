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
 * @fileoverview Datastructure: Priority Pool.
 *
 *
 * An extending of Pool that handles queueing and prioritization.
 */


goog.provide('goog.structs.PriorityPool');

goog.require('goog.structs.Pool');
goog.require('goog.structs.PriorityQueue');



/**
 * A generic pool class. If max is greater than min, an error is thrown.
 * @param {number=} opt_minCount Min. number of objects (Default: 1).
 * @param {number=} opt_maxCount Max. number of objects (Default: 10).
 * @constructor
 * @extends {goog.structs.Pool}
 */
goog.structs.PriorityPool = function(opt_minCount, opt_maxCount) {
  /**
   * Queue of requests for pool objects.
   * @type {goog.structs.PriorityQueue}
   * @private
   */
  this.requestQueue_ = new goog.structs.PriorityQueue();

  // Must break convention of putting the super-class's constructor first. This
  // is because the super-class constructor calls adjustForMinMax, which this
  // class overrides. In this class's implementation, it assumes that there
  // is a requestQueue_, and will error if not present.
  goog.structs.Pool.call(this, opt_minCount, opt_maxCount);
};
goog.inherits(goog.structs.PriorityPool, goog.structs.Pool);


/**
 * Default priority for pool objects requests.
 * @type {number}
 * @private
 */
goog.structs.PriorityPool.DEFAULT_PRIORITY_ = 100;


/**
 * Get a new object from the the pool, if there is one available, otherwise
 * return undefined.
 * @param {Function=} opt_callback The function to callback when an object is
 *     available. This could be immediately. If this is not present, then an
 *     object is immediately returned if available, or undefined if not.
 * @param {*=} opt_priority The priority of the request.
 * @return {Object|undefined} The new object from the pool if there is one
 *     available and a callback is not given. Otherwise, undefined.
 */
goog.structs.PriorityPool.prototype.getObject = function(opt_callback,
                                                        opt_priority) {
  if (!opt_callback) {
    return goog.structs.PriorityPool.superClass_.getObject.call(this);
  }

  var priority = opt_priority || goog.structs.PriorityPool.DEFAULT_PRIORITY_;
  this.requestQueue_.enqueue(priority, opt_callback);

  // Handle all requests.
  this.handleQueueRequests_();

  return undefined;
};


/**
 * Handles the request queue. Tries to fires off as many queued requests as
 * possible.
 * @private
 */
goog.structs.PriorityPool.prototype.handleQueueRequests_ = function() {
  var requestQueue = this.requestQueue_;
  while (requestQueue.getCount() > 0) {
    var obj = this.getObject();

    if (!obj) {
      return;
    } else {
      var requestCallback = requestQueue.dequeue();
      requestCallback.apply(this, [obj]);
    }
  }
};


/**
 * Adds an object to the collection of objects that are free. If the object can
 * not be added, then it is disposed.
 *
 * NOTE: This method does not remove the object from the in use collection.
 *
 * @param {Object} obj The object to add to the collection of free objects.
 */
goog.structs.PriorityPool.prototype.addFreeObject = function(obj) {
  goog.structs.PriorityPool.superClass_.addFreeObject.call(this, obj);

  // Handle all requests.
  this.handleQueueRequests_();
};


/**
 * Adjusts the objects held in the pool to be within the min/max constraints.
 *
 * NOTE: It is possible that the number of objects in the pool will still be
 * greater than the maximum count of objects allowed. This will be the case
 * if no more free objects can be disposed of to get below the minimum count
 * (i.e., all objects are in use).
 */
goog.structs.PriorityPool.prototype.adjustForMinMax = function() {
  goog.structs.PriorityPool.superClass_.adjustForMinMax.call(this);

  // Handle all requests.
  this.handleQueueRequests_();
};


/**
 * Disposes of the pool.
 */
goog.structs.PriorityPool.prototype.disposeInternal = function() {
  goog.structs.PriorityPool.superClass_.disposeInternal.call(this);
  this.requestQueue_.clear();
  this.requestQueue_ = null;
};
