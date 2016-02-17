// Copyright 2011 The Closure Library Authors. All Rights Reserved.
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
 * @fileoverview Provides a convenient API for data persistence with data
 * expiration and user-initiated expired key collection.
 *
 */

goog.provide('goog.storage.CollectableStorage');

goog.require('goog.array');
goog.require('goog.iter');
goog.require('goog.storage.ErrorCode');
goog.require('goog.storage.ExpiringStorage');
goog.require('goog.storage.RichStorage');



/**
 * Provides a storage with expiring keys and a collection method.
 *
 * @param {!goog.storage.mechanism.IterableMechanism} mechanism The underlying
 *     storage mechanism.
 * @constructor
 * @struct
 * @extends {goog.storage.ExpiringStorage}
 */
goog.storage.CollectableStorage = function(mechanism) {
  goog.storage.CollectableStorage.base(this, 'constructor', mechanism);
};
goog.inherits(goog.storage.CollectableStorage, goog.storage.ExpiringStorage);


/**
 * Iterate over keys and returns those that expired.
 *
 * @param {goog.iter.Iterable} keys keys to iterate over.
 * @param {boolean=} opt_strict Also return invalid keys.
 * @return {!Array<string>} Keys of values that expired.
 * @private
 */
goog.storage.CollectableStorage.prototype.getExpiredKeys_ = function(
    keys, opt_strict) {
  var keysToRemove = [];
  goog.iter.forEach(keys, function(key) {
    // Get the wrapper.
    var wrapper;
    /** @preserveTry */
    try {
      wrapper = goog.storage.CollectableStorage.prototype.getWrapper.call(
          this, key, true);
    } catch (ex) {
      if (ex == goog.storage.ErrorCode.INVALID_VALUE) {
        // Bad wrappers are removed in strict mode.
        if (opt_strict) {
          keysToRemove.push(key);
        }
        // Skip over bad wrappers and continue.
        return;
      }
      // Unknown error, escalate.
      throw ex;
    }
    if (!goog.isDef(wrapper)) {
      // A value for a given key is no longer available. Clean it up.
      keysToRemove.push(key);
      return;
    }
    // Remove expired objects.
    if (goog.storage.ExpiringStorage.isExpired(wrapper)) {
      keysToRemove.push(key);
      // Continue with the next key.
      return;
    }
    // Objects which can't be decoded are removed in strict mode.
    if (opt_strict) {
      /** @preserveTry */
      try {
        goog.storage.RichStorage.Wrapper.unwrap(wrapper);
      } catch (ex) {
        if (ex == goog.storage.ErrorCode.INVALID_VALUE) {
          keysToRemove.push(key);
          // Skip over bad wrappers and continue.
          return;
        }
        // Unknown error, escalate.
        throw ex;
      }
    }
  }, this);
  return keysToRemove;
};


/**
 * Cleans up the storage by removing expired keys.
 *
 * @param {goog.iter.Iterable} keys List of all keys.
 * @param {boolean=} opt_strict Also remove invalid keys.
 * @return {!Array<string>} a list of expired keys.
 * @protected
 */
goog.storage.CollectableStorage.prototype.collectInternal = function(
    keys, opt_strict) {
  var keysToRemove = this.getExpiredKeys_(keys, opt_strict);
  goog.array.forEach(keysToRemove, function(key) {
    goog.storage.CollectableStorage.prototype.remove.call(this, key);
  }, this);
  return keysToRemove;
};


/**
 * Cleans up the storage by removing expired keys.
 *
 * @param {boolean=} opt_strict Also remove invalid keys.
 */
goog.storage.CollectableStorage.prototype.collect = function(opt_strict) {
  this.collectInternal(
      /** @type {goog.storage.mechanism.IterableMechanism} */ (this.mechanism)
          .__iterator__(true),
      opt_strict);
};
