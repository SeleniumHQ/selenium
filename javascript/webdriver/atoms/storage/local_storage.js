// Licensed to the Software Freedom Conservancy (SFC) under one
// or more contributor license agreements.  See the NOTICE file
// distributed with this work for additional information
// regarding copyright ownership.  The SFC licenses this file
// to you under the Apache License, Version 2.0 (the
// "License"); you may not use this file except in compliance
// with the License.  You may obtain a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing,
// software distributed under the License is distributed on an
// "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
// KIND, either express or implied.  See the License for the
// specific language governing permissions and limitations
// under the License.

/**
 * @fileoverview Utility functions for accessing HTML5 localStorage object.
 * These functions are wrapper of the functions of individual method of
 * bot.storage.Storage class. An extra redirection is used to define
 * individual functional unit (atom) for injecting in Webdriver.
 */

goog.provide('webdriver.atoms.storage.local');

goog.require('bot.storage');


/**
 * Utility function to set the value of a key/value pair in localStorage.
 * @param {string} key The key of the item.
 * @param {*} value The value of the item.
 */
webdriver.atoms.storage.local.setItem = function(key, value) {
  bot.storage.getLocalStorage().setItem(key, value);
};


/**
 * Returns the value item of a key in the localStorage object.
 * @param {string} key The key of the returned value.
 * @return {?string} The mapped value if present in the localStorage object,
 *     otherwise null.
 */
webdriver.atoms.storage.local.getItem = function(key) {
  return bot.storage.getLocalStorage().getItem(key);
};


/**
 * Returns an array of keys of all keys of the localStorage object.
 * @return {Array.<string>} The array of stored keys.
 */
webdriver.atoms.storage.local.keySet = function() {
  return bot.storage.getLocalStorage().keySet();
};


/**
 * Removes an item with a given key.
 * @param {string} key The key of the key/value pair.
 * @return {?string} The removed value if present, otherwise null.
 */
webdriver.atoms.storage.local.removeItem = function(key) {
  return bot.storage.getLocalStorage().removeItem(key);
};


/**
 * Removes all items from the localStorage object.
 */
webdriver.atoms.storage.local.clear = function() {
  bot.storage.getLocalStorage().clear();
};


/**
 * Returns the number of items in the localStorage object.
 * @return {number} The number of the key/value pairs.
 */
webdriver.atoms.storage.local.size = function() {
  return bot.storage.getLocalStorage().size();
};


/**
 * Returns the key item of the key/value pairs in the localStorage object
 * of a given index.
 * @param {number} index The index of the key/value pair list.
 * @return {?string} The key item of a given index.
 */
webdriver.atoms.storage.local.key = function(index) {
  return bot.storage.getLocalStorage().key(index);
};

