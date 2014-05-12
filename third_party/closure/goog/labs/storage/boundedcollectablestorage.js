// Copyright 2013 The Closure Library Authors. All Rights Reserved.
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
 * expiration and number of items limit.
 *
 * Setting and removing values keeps a max number of items invariant.
 * Collecting values can be user initiated. If oversize, first removes
 * expired items, if still oversize than removes the oldest items until a size
 * constraint is fulfilled.
 *
 */

goog.provide('goog.labs.storage.BoundedCollectableStorage');

goog.require('goog.array');
goog.require('goog.asserts');
goog.require('goog.iter');
goog.require('goog.storage.CollectableStorage');
goog.require('goog.storage.ErrorCode');
goog.require('goog.storage.ExpiringStorage');


goog.scope(function() {
var storage = goog.labs.storage;



/**
 * Provides a storage with bounded number of elements, expiring keys and
 * a collection method.
 *
 * @param {!goog.storage.mechanism.IterableMechanism} mechanism The underlying
 *     storage mechanism.
 * @param {number} maxItems Maximum number of items in storage.
 * @constructor
 * @extends {goog.storage.CollectableStorage}
 * @final
 */
storage.BoundedCollectableStorage = function(mechanism, maxItems) {
  storage.BoundedCollectableStorage.base(this, 'constructor', mechanism);

  /**
   * A maximum number of items that should be stored.
   * @private {number}
   */
  this.maxItems_ = maxItems;
};
goog.inherits(storage.BoundedCollectableStorage,
              goog.storage.CollectableStorage);


/**
 * An item key used to store a list of keys.
 * @const
 * @private
 */
storage.BoundedCollectableStorage.KEY_LIST_KEY_ = 'bounded-collectable-storage';


/**
 * Recreates a list of keys in order of creation.
 *
 * @return {!Array.<string>} a list of unexpired keys.
 * @private
 */
storage.BoundedCollectableStorage.prototype.rebuildIndex_ = function() {
  var keys = [];
  goog.iter.forEach(this.mechanism.__iterator__(true), function(key) {
    if (storage.BoundedCollectableStorage.KEY_LIST_KEY_ == key) {
      return;
    }

    var wrapper;
    /** @preserveTry */
    try {
      wrapper = this.getWrapper(key, true);
    } catch (ex) {
      if (ex == goog.storage.ErrorCode.INVALID_VALUE) {
        // Skip over bad wrappers and continue.
        return;
      }
      // Unknown error, escalate.
      throw ex;
    }
    goog.asserts.assert(wrapper);

    var creationTime = goog.storage.ExpiringStorage.getCreationTime(wrapper);
    keys.push({key: key, created: creationTime});
  }, this);

  goog.array.sort(keys, function(a, b) {
    return a.created - b.created;
  });

  return goog.array.map(keys, function(v) {
    return v.key;
  });
};


/**
 * Gets key list from a local storage. If an item does not exist,
 * may recreate it.
 *
 * @param {boolean} rebuild Whether to rebuild a index if no index item exists.
 * @return {!Array.<string>} a list of keys if index exist, otherwise undefined.
 * @private
 */
storage.BoundedCollectableStorage.prototype.getKeys_ = function(rebuild) {
  var keys = storage.BoundedCollectableStorage.superClass_.get.call(this,
      storage.BoundedCollectableStorage.KEY_LIST_KEY_) || null;
  if (!keys || !goog.isArray(keys)) {
    if (rebuild) {
      keys = this.rebuildIndex_();
    } else {
      keys = [];
    }
  }
  return /** @type {!Array.<string>} */ (keys);
};


/**
 * Saves a list of keys in a local storage.
 *
 * @param {Array.<string>} keys a list of keys to save.
 * @private
 */
storage.BoundedCollectableStorage.prototype.setKeys_ = function(keys) {
  storage.BoundedCollectableStorage.superClass_.set.call(this,
      storage.BoundedCollectableStorage.KEY_LIST_KEY_, keys);
};


/**
 * Remove subsequence from a sequence.
 *
 * @param {!Array.<string>} keys is a sequence.
 * @param {!Array.<string>} keysToRemove subsequence of keys, the order must
 *     be kept.
 * @return {!Array.<string>} a keys sequence after removing keysToRemove.
 * @private
 */
storage.BoundedCollectableStorage.removeSubsequence_ =
    function(keys, keysToRemove) {
  if (keysToRemove.length == 0) {
    return goog.array.clone(keys);
  }
  var keysToKeep = [];
  var keysIdx = 0;
  var keysToRemoveIdx = 0;

  while (keysToRemoveIdx < keysToRemove.length && keysIdx < keys.length) {
    var key = keysToRemove[keysToRemoveIdx];
    while (keysIdx < keys.length && keys[keysIdx] != key) {
      keysToKeep.push(keys[keysIdx]);
      ++keysIdx;
    }
    ++keysToRemoveIdx;
  }

  goog.asserts.assert(keysToRemoveIdx == keysToRemove.length);
  goog.asserts.assert(keysIdx < keys.length);
  return goog.array.concat(keysToKeep, goog.array.slice(keys, keysIdx + 1));
};


/**
 * Keeps the number of items in storage under maxItems. Removes elements in the
 * order of creation.
 *
 * @param {!Array.<string>} keys a list of keys in order of creation.
 * @param {number} maxSize a number of items to keep.
 * @return {!Array.<string>} keys left after removing oversize data.
 * @private
 */
storage.BoundedCollectableStorage.prototype.collectOversize_ =
    function(keys, maxSize) {
  if (keys.length <= maxSize) {
    return goog.array.clone(keys);
  }
  var keysToRemove = goog.array.slice(keys, 0, keys.length - maxSize);
  goog.array.forEach(keysToRemove, function(key) {
    storage.BoundedCollectableStorage.superClass_.remove.call(this, key);
  }, this);
  return storage.BoundedCollectableStorage.removeSubsequence_(
      keys, keysToRemove);
};


/**
 * Cleans up the storage by removing expired keys.
 *
 * @param {boolean=} opt_strict Also remove invalid keys.
 * @override
 */
storage.BoundedCollectableStorage.prototype.collect =
    function(opt_strict) {
  var keys = this.getKeys_(true);
  var keysToRemove = this.collectInternal(keys, opt_strict);
  keys = storage.BoundedCollectableStorage.removeSubsequence_(
      keys, keysToRemove);
  this.setKeys_(keys);
};


/**
 * Ensures that we keep only maxItems number of items in a local storage.
 * @param {boolean=} opt_skipExpired skip removing expired items first.
 * @param {boolean=} opt_strict Also remove invalid keys.
 */
storage.BoundedCollectableStorage.prototype.collectOversize =
    function(opt_skipExpired, opt_strict) {
  var keys = this.getKeys_(true);
  if (!opt_skipExpired) {
    var keysToRemove = this.collectInternal(keys, opt_strict);
    keys = storage.BoundedCollectableStorage.removeSubsequence_(
        keys, keysToRemove);
  }
  keys = this.collectOversize_(keys, this.maxItems_);
  this.setKeys_(keys);
};


/**
 * Set an item in the storage.
 *
 * @param {string} key The key to set.
 * @param {*} value The value to serialize to a string and save.
 * @param {number=} opt_expiration The number of miliseconds since epoch
 *     (as in goog.now()) when the value is to expire. If the expiration
 *     time is not provided, the value will persist as long as possible.
 * @override
 */
storage.BoundedCollectableStorage.prototype.set =
    function(key, value, opt_expiration) {
  storage.BoundedCollectableStorage.base(
      this, 'set', key, value, opt_expiration);
  var keys = this.getKeys_(true);
  goog.array.remove(keys, key);

  if (goog.isDef(value)) {
    keys.push(key);
    if (keys.length >= this.maxItems_) {
      var keysToRemove = this.collectInternal(keys);
      keys = storage.BoundedCollectableStorage.removeSubsequence_(
          keys, keysToRemove);
      keys = this.collectOversize_(keys, this.maxItems_);
    }
  }
  this.setKeys_(keys);
};


/**
 * Remove an item from the data storage.
 *
 * @param {string} key The key to remove.
 * @override
 */
storage.BoundedCollectableStorage.prototype.remove = function(key) {
  storage.BoundedCollectableStorage.base(this, 'remove', key);

  var keys = this.getKeys_(false);
  if (goog.isDef(keys)) {
    goog.array.remove(keys, key);
    this.setKeys_(keys);
  }
};

});  // goog.scope
