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
 * @fileoverview Creates a pool of XhrIo objects to use. This allows multiple
 * XhrIo objects to be grouped together and requests will use next available
 * XhrIo object.
 *
 */

goog.provide('goog.net.XhrIoPool');

goog.require('goog.net.XhrIo');
goog.require('goog.structs');
goog.require('goog.structs.PriorityPool');



/**
 * A pool of XhrIo objects.
 * @param {goog.structs.Map=} opt_headers Map of default headers to add to every
 *     request.
 * @param {number=} opt_minCount Minimum number of objects (Default: 1).
 * @param {number=} opt_maxCount Maximum number of objects (Default: 10).
 * @constructor
 * @extends {goog.structs.PriorityPool}
 */
goog.net.XhrIoPool = function(opt_headers, opt_minCount, opt_maxCount) {
  goog.structs.PriorityPool.call(this, opt_minCount, opt_maxCount);

  /**
   * Map of default headers to add to every request.
   * @type {goog.structs.Map|undefined}
   * @private
   */
  this.headers_ = opt_headers;
};
goog.inherits(goog.net.XhrIoPool, goog.structs.PriorityPool);


/**
 * Creates an instance of an XhrIo object to use in the pool.
 * @return {goog.net.XhrIo} The created object.
 * @override
 */
goog.net.XhrIoPool.prototype.createObject = function() {
  var xhrIo = new goog.net.XhrIo();
  var headers = this.headers_;
  if (headers) {
    goog.structs.forEach(headers, function(value, key) {
      xhrIo.headers.set(key, value);
    });
  }
  return xhrIo;
};


/**
 * Determine if an object has become unusable and should not be used.
 * @param {Object} obj The object to test.
 * @return {boolean} Whether the object can be reused, which is true if the
 *     object is not disposed and not active.
 * @override
 */
goog.net.XhrIoPool.prototype.objectCanBeReused = function(obj) {
  // An active XhrIo object should never be used.
  var xhr = /** @type {goog.net.XhrIo} */ (obj);
  return !xhr.isDisposed() && !xhr.isActive();
};
