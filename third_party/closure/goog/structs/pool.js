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
 * @fileoverview Datastructure: Pool.
 *
 *
 * A generic class for handling pools of objects.
 * When an object is released, it is attempted to be reused.
 */


goog.provide('goog.structs.Pool');

goog.require('goog.Disposable');
goog.require('goog.structs.Queue');
goog.require('goog.structs.Set');



/**
 * A generic pool class. If min is greater than max, an error is thrown.
 * @param {number=} opt_minCount Min. number of objects (Default: 0).
 * @param {number=} opt_maxCount Max. number of objects (Default: 10).
 * @constructor
 * @extends {goog.Disposable}
 * @template T
 */
goog.structs.Pool = function(opt_minCount, opt_maxCount) {
  goog.Disposable.call(this);

  /**
   * Minimum number of objects allowed
   * @private {number}
   */
  this.minCount_ = opt_minCount || 0;

  /**
   * Maximum number of objects allowed
   * @private {number}
   */
  this.maxCount_ = opt_maxCount || 10;

  // Make sure that the max and min constraints are valid.
  if (this.minCount_ > this.maxCount_) {
    throw Error(goog.structs.Pool.ERROR_MIN_MAX_);
  }

  /**
   * Set used to store objects that are currently in the pool and available
   * to be used.
   * @private {goog.structs.Queue<T>}
   */
  this.freeQueue_ = new goog.structs.Queue();

  /**
   * Set used to store objects that are currently in the pool and in use.
   * @private {goog.structs.Set<T>}
   */
  this.inUseSet_ = new goog.structs.Set();

  /**
   * The minimum delay between objects being made available, in milliseconds. If
   * this is 0, no minimum delay is enforced.
   * @protected {number}
   */
  this.delay = 0;

  /**
   * The time of the last object being made available, in milliseconds since the
   * epoch (i.e., the result of Date#toTime). If this is null, no access has
   * occurred yet.
   * @protected {number?}
   */
  this.lastAccess = null;

  // Make sure that the minCount constraint is satisfied.
  this.adjustForMinMax();
};
goog.inherits(goog.structs.Pool, goog.Disposable);


/**
 * Error to throw when the max/min constraint is attempted to be invalidated.
 * I.e., when it is attempted for maxCount to be less than minCount.
 * @type {string}
 * @private
 */
goog.structs.Pool.ERROR_MIN_MAX_ =
    '[goog.structs.Pool] Min can not be greater than max';


/**
 * Error to throw when the Pool is attempted to be disposed and it is asked to
 * make sure that there are no objects that are in use (i.e., haven't been
 * released).
 * @type {string}
 * @private
 */
goog.structs.Pool.ERROR_DISPOSE_UNRELEASED_OBJS_ =
    '[goog.structs.Pool] Objects not released';


/**
 * Sets the minimum count of the pool.
 * If min is greater than the max count of the pool, an error is thrown.
 * @param {number} min The minimum count of the pool.
 */
goog.structs.Pool.prototype.setMinimumCount = function(min) {
  // Check count constraints.
  if (min > this.maxCount_) {
    throw Error(goog.structs.Pool.ERROR_MIN_MAX_);
  }
  this.minCount_ = min;

  // Adjust the objects in the pool as needed.
  this.adjustForMinMax();
};


/**
 * Sets the maximum count of the pool.
 * If max is less than the min count of the pool, an error is thrown.
 * @param {number} max The maximum count of the pool.
 */
goog.structs.Pool.prototype.setMaximumCount = function(max) {
  // Check count constraints.
  if (max < this.minCount_) {
    throw Error(goog.structs.Pool.ERROR_MIN_MAX_);
  }
  this.maxCount_ = max;

  // Adjust the objects in the pool as needed.
  this.adjustForMinMax();
};


/**
 * Sets the minimum delay between objects being returned by getObject, in
 * milliseconds. This defaults to zero, meaning that no minimum delay is
 * enforced and objects may be used as soon as they're available.
 * @param {number} delay The minimum delay, in milliseconds.
 */
goog.structs.Pool.prototype.setDelay = function(delay) {
  this.delay = delay;
};


/**
 * @return {T|undefined} A new object from the pool if there is one available,
 *     otherwise undefined.
 */
goog.structs.Pool.prototype.getObject = function() {
  var time = goog.now();
  if (goog.isDefAndNotNull(this.lastAccess) &&
      time - this.lastAccess < this.delay) {
    return undefined;
  }

  var obj = this.removeFreeObject_();
  if (obj) {
    this.lastAccess = time;
    this.inUseSet_.add(obj);
  }

  return obj;
};


/**
 * Returns an object to the pool of available objects so that it can be reused.
 * @param {T} obj The object to return to the pool of free objects.
 * @return {boolean} Whether the object was found in the Pool's set of in-use
 *     objects (in other words, whether any action was taken).
 */
goog.structs.Pool.prototype.releaseObject = function(obj) {
  if (this.inUseSet_.remove(obj)) {
    this.addFreeObject(obj);
    return true;
  }
  return false;
};


/**
 * Removes a free object from the collection of objects that are free so that it
 * can be used.
 *
 * NOTE: This method does not mark the returned object as in use.
 *
 * @return {T|undefined} The object removed from the free collection, if there
 *     is one available. Otherwise, undefined.
 * @private
 */
goog.structs.Pool.prototype.removeFreeObject_ = function() {
  var obj;
  while (this.getFreeCount() > 0) {
    obj = this.freeQueue_.dequeue();

    if (!this.objectCanBeReused(obj)) {
      this.adjustForMinMax();
    } else {
      break;
    }
  }

  if (!obj && this.getCount() < this.maxCount_) {
    obj = this.createObject();
  }

  return obj;
};


/**
 * Adds an object to the collection of objects that are free. If the object can
 * not be added, then it is disposed.
 *
 * @param {T} obj The object to add to collection of free objects.
 */
goog.structs.Pool.prototype.addFreeObject = function(obj) {
  this.inUseSet_.remove(obj);
  if (this.objectCanBeReused(obj) && this.getCount() < this.maxCount_) {
    this.freeQueue_.enqueue(obj);
  } else {
    this.disposeObject(obj);
  }
};


/**
 * Adjusts the objects held in the pool to be within the min/max constraints.
 *
 * NOTE: It is possible that the number of objects in the pool will still be
 * greater than the maximum count of objects allowed. This will be the case
 * if no more free objects can be disposed of to get below the minimum count
 * (i.e., all objects are in use).
 */
goog.structs.Pool.prototype.adjustForMinMax = function() {
  var freeQueue = this.freeQueue_;

  // Make sure the at least the minimum number of objects are created.
  while (this.getCount() < this.minCount_) {
    freeQueue.enqueue(this.createObject());
  }

  // Make sure no more than the maximum number of objects are created.
  while (this.getCount() > this.maxCount_ && this.getFreeCount() > 0) {
    this.disposeObject(freeQueue.dequeue());
  }
};


/**
 * Should be overridden by sub-classes to return an instance of the object type
 * that is expected in the pool.
 * @return {T} The created object.
 */
goog.structs.Pool.prototype.createObject = function() {
  return {};
};


/**
 * Should be overridden to dispose of an object. Default implementation is to
 * remove all its members, which should render it useless. Calls the object's
 * {@code dispose()} method, if available.
 * @param {T} obj The object to dispose.
 */
goog.structs.Pool.prototype.disposeObject = function(obj) {
  if (typeof obj.dispose == 'function') {
    obj.dispose();
  } else {
    for (var i in obj) {
      obj[i] = null;
    }
  }
};


/**
 * Should be overridden to determine whether an object has become unusable and
 * should not be returned by getObject(). Calls the object's
 * {@code canBeReused()}  method, if available.
 * @param {T} obj The object to test.
 * @return {boolean} Whether the object can be reused.
 */
goog.structs.Pool.prototype.objectCanBeReused = function(obj) {
  if (typeof obj.canBeReused == 'function') {
    return obj.canBeReused();
  }
  return true;
};


/**
 * Returns true if the given object is in the pool.
 * @param {T} obj The object to check the pool for.
 * @return {boolean} Whether the pool contains the object.
 */
goog.structs.Pool.prototype.contains = function(obj) {
  return this.freeQueue_.contains(obj) || this.inUseSet_.contains(obj);
};


/**
 * Returns the number of objects currently in the pool.
 * @return {number} Number of objects currently in the pool.
 */
goog.structs.Pool.prototype.getCount = function() {
  return this.freeQueue_.getCount() + this.inUseSet_.getCount();
};


/**
 * Returns the number of objects currently in use in the pool.
 * @return {number} Number of objects currently in use in the pool.
 */
goog.structs.Pool.prototype.getInUseCount = function() {
  return this.inUseSet_.getCount();
};


/**
 * Returns the number of objects currently free in the pool.
 * @return {number} Number of objects currently free in the pool.
 */
goog.structs.Pool.prototype.getFreeCount = function() {
  return this.freeQueue_.getCount();
};


/**
 * Determines if the pool contains no objects.
 * @return {boolean} Whether the pool contains no objects.
 */
goog.structs.Pool.prototype.isEmpty = function() {
  return this.freeQueue_.isEmpty() && this.inUseSet_.isEmpty();
};


/**
 * Disposes of the pool and all objects currently held in the pool.
 * @override
 * @protected
 */
goog.structs.Pool.prototype.disposeInternal = function() {
  goog.structs.Pool.superClass_.disposeInternal.call(this);
  if (this.getInUseCount() > 0) {
    throw Error(goog.structs.Pool.ERROR_DISPOSE_UNRELEASED_OBJS_);
  }
  delete this.inUseSet_;

  // Call disposeObject on each object held by the pool.
  var freeQueue = this.freeQueue_;
  while (!freeQueue.isEmpty()) {
    this.disposeObject(freeQueue.dequeue());
  }
  delete this.freeQueue_;
};
