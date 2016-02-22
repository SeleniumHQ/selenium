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
 * @fileoverview Provides a convenient API for data persistence using a selected
 * data storage mechanism.
 *
 */

goog.provide('goog.storage.Storage');

goog.require('goog.json');
goog.require('goog.storage.ErrorCode');



/**
 * The base implementation for all storage APIs.
 *
 * @param {!goog.storage.mechanism.Mechanism} mechanism The underlying
 *     storage mechanism.
 * @constructor
 * @struct
 */
goog.storage.Storage = function(mechanism) {
  /**
   * The mechanism used to persist key-value pairs.
   *
   * @protected {goog.storage.mechanism.Mechanism}
   */
  this.mechanism = mechanism;
};


/**
 * Sets an item in the data storage.
 *
 * @param {string} key The key to set.
 * @param {*} value The value to serialize to a string and save.
 */
goog.storage.Storage.prototype.set = function(key, value) {
  if (!goog.isDef(value)) {
    this.mechanism.remove(key);
    return;
  }
  this.mechanism.set(key, goog.json.serialize(value));
};


/**
 * Gets an item from the data storage.
 *
 * @param {string} key The key to get.
 * @return {*} Deserialized value or undefined if not found.
 */
goog.storage.Storage.prototype.get = function(key) {
  var json;
  try {
    json = this.mechanism.get(key);
  } catch (e) {
    // If, for any reason, the value returned by a mechanism's get method is not
    // a string, an exception is thrown.  In this case, we must fail gracefully
    // instead of propagating the exception to clients.  See b/8095488 for
    // details.
    return undefined;
  }
  if (goog.isNull(json)) {
    return undefined;
  }
  /** @preserveTry */
  try {
    return goog.json.parse(json);
  } catch (e) {
    throw goog.storage.ErrorCode.INVALID_VALUE;
  }
};


/**
 * Removes an item from the data storage.
 *
 * @param {string} key The key to remove.
 */
goog.storage.Storage.prototype.remove = function(key) {
  this.mechanism.remove(key);
};
