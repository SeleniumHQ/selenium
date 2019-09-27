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
 * @fileoverview Interface for storing, retieving and scanning data using some
 * persistence mechanism.
 *
 */

goog.provide('goog.storage.mechanism.IterableMechanism');

goog.require('goog.array');
goog.require('goog.asserts');
goog.require('goog.iter');
goog.require('goog.storage.mechanism.Mechanism');



/**
 * Interface for all iterable storage mechanisms.
 *
 * @constructor
 * @struct
 * @extends {goog.storage.mechanism.Mechanism}
 */
goog.storage.mechanism.IterableMechanism = function() {
  goog.storage.mechanism.IterableMechanism.base(this, 'constructor');
};
goog.inherits(
    goog.storage.mechanism.IterableMechanism, goog.storage.mechanism.Mechanism);


/**
 * Get the number of stored key-value pairs.
 *
 * Could be overridden in a subclass, as the default implementation is not very
 * efficient - it iterates over all keys.
 *
 * @return {number} Number of stored elements.
 */
goog.storage.mechanism.IterableMechanism.prototype.getCount = function() {
  var count = 0;
  goog.iter.forEach(this.__iterator__(true), function(key) {
    goog.asserts.assertString(key);
    count++;
  });
  return count;
};


/**
 * Returns an iterator that iterates over the elements in the storage. Will
 * throw goog.iter.StopIteration after the last element.
 *
 * @param {boolean=} opt_keys True to iterate over the keys. False to iterate
 *     over the values.  The default value is false.
 * @return {!goog.iter.Iterator} The iterator.
 */
goog.storage.mechanism.IterableMechanism.prototype.__iterator__ =
    goog.abstractMethod;


/**
 * Remove all key-value pairs.
 *
 * Could be overridden in a subclass, as the default implementation is not very
 * efficient - it iterates over all keys.
 */
goog.storage.mechanism.IterableMechanism.prototype.clear = function() {
  // This converts the keys to an array first because otherwise
  // removing while iterating results in unstable ordering of keys and
  // can skip keys or terminate early.
  var keys = goog.iter.toArray(this.__iterator__(true));
  var selfObj = this;
  goog.array.forEach(keys, function(key) { selfObj.remove(key); });
};
