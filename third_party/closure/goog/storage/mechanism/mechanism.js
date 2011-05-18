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
 * @fileoverview Abstract interface for storing and retrieving data using
 * some persistence mechanism.
 *
 */

goog.provide('goog.storage.mechanism.Mechanism');



/**
 * Basic interface for all storage mechanisms.
 *
 * @constructor
 */
goog.storage.mechanism.Mechanism = function() {};


/**
 * Set a value for a key.
 *
 * @param {string} key The key to set.
 * @param {string} value The string to save.
 */
goog.storage.mechanism.Mechanism.prototype.set = goog.abstractMethod;


/**
 * Get the value stored under a key.
 *
 * @param {string} key The key to get.
 * @return {?string} The corresponding value, null if not found.
 */
goog.storage.mechanism.Mechanism.prototype.get = goog.abstractMethod;


/**
 * Remove a key and its value.
 *
 * @param {string} key The key to remove.
 */
goog.storage.mechanism.Mechanism.prototype.remove = goog.abstractMethod;
