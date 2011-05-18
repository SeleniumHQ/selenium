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
 * @fileoverview Provides a convenient API for data persistence with expiration.
 *
 */

goog.provide('goog.storage.ExpiringStorage');

goog.require('goog.storage.RichStorage');
goog.require('goog.storage.mechanism.Mechanism');



/**
 * Provides a storage with expirning keys.
 *
 * @param {goog.storage.mechanism.Mechanism} mechanism The underlying
 *     storage mechanism.
 * @constructor
 * @extends {goog.storage.RichStorage}
 */
goog.storage.ExpiringStorage = function(mechanism) {
  goog.base(this, mechanism);
};
goog.inherits(goog.storage.ExpiringStorage, goog.storage.RichStorage);


/**
 * Metadata key under which the expiration time is stored.
 *
 * @type {string}
 * @protected
 */
goog.storage.ExpiringStorage.EXPIRATION_TIME_KEY = 'expiration';


/**
 * Metadata key under which the creation time is stored.
 *
 * @type {string}
 * @protected
 */
goog.storage.ExpiringStorage.CREATION_TIME_KEY = 'creation';


/**
 * Checks if the data item has expired.
 *
 * @param {Object} wrapper The wrapper.
 * @return {boolean} True if the item has expired.
 * @protected
 */
goog.storage.ExpiringStorage.isExpired = function(wrapper) {
  var creation = wrapper[goog.storage.ExpiringStorage.CREATION_TIME_KEY];
  var expiration = wrapper[goog.storage.ExpiringStorage.EXPIRATION_TIME_KEY];
  return expiration && expiration < goog.now() ||
         creation && creation > goog.now();
};


/**
 * Set an item in the storage.
 *
 * @param {string} key The key to set.
 * @param {*} value The value to serialize to a string and save.
 * @param {number=} opt_expiration The number of miliseconds since epoch
 *     (as in goog.now()) when the value is to expire. If the expiration
 *     time is not provided, the value will persist as long as possible.
 */
goog.storage.ExpiringStorage.prototype.set = function(
    key, value, opt_expiration) {
  var wrapper = goog.storage.RichStorage.Wrapper.wrapIfNecessary(value);
  if (wrapper) {
    if (opt_expiration) {
      if (opt_expiration < goog.now()) {
        goog.storage.ExpiringStorage.prototype.remove.call(this, key);
        return;
      }
      wrapper[goog.storage.ExpiringStorage.EXPIRATION_TIME_KEY] =
          opt_expiration;
    }
    wrapper[goog.storage.ExpiringStorage.CREATION_TIME_KEY] = goog.now();
  }
  goog.base(this, 'set', key, wrapper);
};


/** @inheritDoc */
goog.storage.ExpiringStorage.prototype.get = function(key) {
  var wrapper = this.getWrapper(key);
  if (!wrapper) {
    return undefined;
  }
  if (goog.storage.ExpiringStorage.isExpired(wrapper)) {
    goog.storage.ExpiringStorage.prototype.remove.call(this, key);
    return undefined;
  }
  return goog.storage.RichStorage.Wrapper.unwrap(wrapper);
};
