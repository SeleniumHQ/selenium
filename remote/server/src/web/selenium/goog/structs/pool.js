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
 * @fileoverview Datastructure: Pool
 *
 * A generic class for handling pools of objects.
 * When an object is released, it is attempted to be reused.
 */


goog.provide('goog.structs.Pool');

goog.require('goog.Disposable');
goog.require('goog.iter');
goog.require('goog.structs.Queue');
goog.require('goog.structs.Set');


/**
 * A generic pool class. If max is greater than min, an error is thrown.
 * @param {number} opt_minCount Min. number of objects (Default: 1).
 * @param {number} opt_maxCount Max. number of objects (Default: 10).
 * @constructor
 * @extends goog.Disposable
 */
goog.structs.Pool = function(opt_minCount, opt_maxCount) {
  goog.Disposable.call(this);

  /**
   * Minimum number of objects allowed
   * @type {number}
   * @private
   */
  this.minCount_ = opt_minCount || 0;

  /**
   * Maximum number of objects allowed
   * @type {number}
   * @private
   */
  this.maxCount_ = opt_maxCount || 10;

  // Make sure that the max and min constraints are valid.
  if (this.minCount_ > this.maxCount_) {
    throw Error(goog.structs.Pool.ERROR_MIN_MAX_);
  }

  /**
   * Set used to store objects that are currently in the pool and available
   * to be used.
   * @type {goog.structs.Set}
   * @private
   */
  this.freeQueue_ = new goog.structs.Queue();

  /**
   * Set used to store objects that are currently in the pool and in use.
   * @type {goog.structs.Set}
   * @private
   */
  this.inUseSet_ = new goog.structs.Set();

  // Make sure that the minCount constraint is satisfied.
  this.adjustForMinMax();


  var magicProps = {canBeReused: 0};
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
 * If max is less than the max count of the pool, an error is thrown.
 * @param {number} max The maximium count of the pool.
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
 * Get a new object from the the pool, if there is one available, otherwise
 * return null.
 * @return {Object} The new object from the pool if there is one available,
 *     otherwise undefined.
 */
goog.structs.Pool.prototype.getObject = function() {
  var obj = this.removeFreeObject_();
  if (obj) {
    this.inUseSet_.add(obj);
  }

  return obj;
};


/**
 * Release the space in the pol heald by a given object in, i.e. remove it from
 * the pool and free up its space.
 * @param {Object} obj The object to release.
 * @return {boolean} TRUE iff the object was removed. Otherwise, FALSE.
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
 * @return {Object|undefined} The object removed from the free collection, if
 *     there is one available. Otherwise, undefined.
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
 * @param {Object} obj The object to add to colllection of free objects.
 */
goog.structs.Pool.prototype.addFreeObject = function(obj) {
  this.inUseSet_.remove(obj)
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
 * Should be overriden by sub-classes to return an instance of the object type
 * that is expected in the pool.
 * @return {Object} The created object.
 */
goog.structs.Pool.prototype.createObject = function() {
  return {};
};


/**
 * Should be overriden to dispose of an object, default implementation is to
 * remove all it's members which should render it useless. Calls the object's
 * dispose method, if available.
 * @param {Object} obj The object to dispose.
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
 * Should be overriden to determine if an object has become unusable and should
 * not be returned by getObject(). Calls the object's can beReused method,
 * if available.
 * @param {Object} obj The object to test.
 * @return {boolean} TRUE iff the object can be reused. Otherwise, FALSE.
 */
goog.structs.Pool.prototype.objectCanBeReused = function(obj) {
  if (typeof obj.canBeReused == 'function') {
    return obj.canBeReused();
  }
  return true;
};


/**
 * Returns true if the given object is in the pool
 * @param {Object} obj The object to test if the pool contains.
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
 * Determins if the pool contains no objects.
 * @return {boolean} TRUE iff the pool contains no objects. Otherwise, FALSE.
 */
goog.structs.Pool.prototype.isEmpty = function() {
  return this.freeQueue_.isEmpty() && this.inUseSet_.isEmpty();
};


/**
 * Disposes the pool and all objects currently held in the pool.
 */
goog.structs.Pool.prototype.dispose = function() {
  if (!this.getDisposed()) {
    goog.structs.Pool.superClass_.dispose.call(this);
    if (this.getInUseCount() > 0) {
      throw Error(goog.structs.Pool.ERROR_DISPOSE_UNRELEASED_OBJS_);
    }

    // Call disposeObject on each object held by the pool.
    goog.iter.forEach(this.inUseSet_, this.disposeObject, this);
    this.inUseSet_.clear();
    this.inUseSet_ = null;

    var freeQueue = this.freeQueue_;
    while (!freeQueue.isEmpty()) {
      this.disposeObject(freeQueue.dequeue());
    }
    this.freeQueue_ = null;
  }
};
