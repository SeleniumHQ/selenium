// Copyright 2012 The Closure Library Authors. All Rights Reserved.
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
 * @fileoverview Provides a fake storage mechanism for testing.
 */

goog.provide('goog.testing.storage.FakeMechanism');
goog.setTestOnly('goog.testing.storage.FakeMechanism');

goog.require('goog.storage.mechanism.IterableMechanism');
goog.require('goog.structs.Map');



/**
 * Creates a fake iterable mechanism.
 *
 * @constructor
 * @extends {goog.storage.mechanism.IterableMechanism}
 */
goog.testing.storage.FakeMechanism = function() {
  /**
   * @type {goog.structs.Map}
   * @private
   */
  this.storage_ = new goog.structs.Map();
};
goog.inherits(goog.testing.storage.FakeMechanism,
    goog.storage.mechanism.IterableMechanism);


/** @override */
goog.testing.storage.FakeMechanism.prototype.set = function(key, value) {
  this.storage_.set(key, value);
};


/** @override */
goog.testing.storage.FakeMechanism.prototype.get = function(key) {
  return /** @type {?string} */ (
      this.storage_.get(key, null /* default value */));
};


/** @override */
goog.testing.storage.FakeMechanism.prototype.remove = function(key) {
  this.storage_.remove(key);
};


/** @override */
goog.testing.storage.FakeMechanism.prototype.__iterator__ = function(opt_keys) {
  return this.storage_.__iterator__(opt_keys);
};
