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
 * @fileoverview Provides factory methods for selecting the best storage
 * mechanism, depending on availability and needs.
 *
 */

goog.provide('goog.storage.mechanism.mechanismfactory');

goog.require('goog.storage.mechanism.HTML5LocalStorage');
goog.require('goog.storage.mechanism.IEUserData');
goog.require('goog.storage.mechanism.PrefixedMechanism');


/**
 * The key to shared userData storage.
 * @type {string}
 */
goog.storage.mechanism.mechanismfactory.USER_DATA_SHARED_KEY =
    'UserDataSharedStore';


/**
 * Returns the best local storage mechanism, or null if unavailable.
 * Local storage means that the database is placed on user's computer.
 * The key-value database is shared between all the code paths that
 * request it, so an optional namespace can be used to provide separation
 * and avoid key collisions.
 *
 * @param {string=} opt_namespace Restricts the visibility to given namespace.
 * @return {?goog.storage.mechanism.Mechanism} Created mechanism or null.
 */
goog.storage.mechanism.mechanismfactory.create = function(opt_namespace) {
  var storage = new goog.storage.mechanism.HTML5LocalStorage();
  if (storage.isAvailable()) {
    if (opt_namespace) {
      return new goog.storage.mechanism.PrefixedMechanism(
          storage, opt_namespace);
    } else {
      return storage;
    }
  }
  storage = new goog.storage.mechanism.IEUserData(opt_namespace ||
      goog.storage.mechanism.mechanismfactory.USER_DATA_SHARED_KEY);
  if (storage.isAvailable()) {
    return storage;
  }
  return null;
};
