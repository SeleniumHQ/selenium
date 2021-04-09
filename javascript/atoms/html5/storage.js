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
 * @fileoverview Atoms for accessing HTML5 web storage maps (localStorage,
 * sessionStorage). These storage objects store each item as a key-value
 * mapping pair.
 *
 */

goog.provide('bot.storage');
goog.provide('bot.storage.Storage');

goog.require('bot');
goog.require('bot.Error');
goog.require('bot.ErrorCode');
goog.require('bot.html5');


/**
 * A factory method to create a wrapper to access the HTML5 localStorage
 * object.
 * Note: We are not using Closure from goog.storage,
 * Closure uses "window" object directly, which may not always be
 * defined (for example in firefox extensions).
 * We use bot.window() from bot.js instead to keep track of the window or frame
 * is currently being used for command execution. The implementation is
 * otherwise similar to the implementation in the Closure library
 * (goog.storage.mechansim.HTML5LocalStorage).
 *
 * @param {Window=} opt_window The window whose storage to access;
 *     defaults to the main window.
 * @return {!bot.storage.Storage} The wrapper Storage object.
 */
bot.storage.getLocalStorage = function(opt_window) {
  var win = opt_window || bot.getWindow();

  if (!bot.html5.isSupported(bot.html5.API.LOCAL_STORAGE, win)) {
    throw new bot.Error(bot.ErrorCode.UNKNOWN_ERROR, 'Local storage undefined');
  }
  var storageMap = win.localStorage;
  return new bot.storage.Storage(storageMap);
};


/**
 * A factory method to create a wrapper to access the HTML5 sessionStorage
 * object.
 *
 * @param {Window=} opt_window The window whose storage to access;
 *     defaults to the main window.
 * @return {!bot.storage.Storage} The wrapper Storage object.
 */
bot.storage.getSessionStorage = function(opt_window) {
  var win = opt_window || bot.getWindow();

  if (bot.html5.isSupported(bot.html5.API.SESSION_STORAGE, win)) {
    var storageMap = win.sessionStorage;
    return new bot.storage.Storage(storageMap);
  }
  throw new bot.Error(bot.ErrorCode.UNKNOWN_ERROR,
      'Session storage undefined');
};



/**
 * Provides a wrapper object to the HTML5 web storage object.
 * @constructor
 *
 * @param {Storage} storageMap HTML5 storage object e.g. localStorage,
 *     sessionStorage.
 */
bot.storage.Storage = function(storageMap) {
  /**
   * Member variable to access the assigned HTML5 storage object.
   * @private {Storage}
   * @const
   */
  this.storageMap_ = storageMap;
};


/**
 * Sets the value item of a key/value pair in the Storage object.
 * If the value given is null, the string 'null' will be inserted
 * instead.
 *
 * @param {string} key The key of the item.
 * @param {*} value The value of the item.
 */
bot.storage.Storage.prototype.setItem = function(key, value) {
  try {
    // Note: Ideally, browsers should set a null value. But the browsers
    // report arbitrarily. Firefox returns <null>, while Chrome reports
    // the string "null". We are setting the value to the string "null".
    this.storageMap_.setItem(key, value + '');
  } catch (e) {
    throw new bot.Error(bot.ErrorCode.UNKNOWN_ERROR, e.message);
  }
};


/**
 * Returns the value item of a key in the Storage object.
 *
 * @param {string} key The key of the returned value.
 * @return {?string} The mapped value if present in the storage object,
 *     otherwise null. If a null value  was inserted for a given
 *     key, then the string 'null' is returned.
 */
bot.storage.Storage.prototype.getItem = function(key) {
  var value = this.storageMap_.getItem(key);
  return /** @type {?string} */ (value);
};


/**
 * Returns an array of keys of all keys of the Storage object.
 *
 * @return {!Array.<string>} The array of stored keys..
 */
bot.storage.Storage.prototype.keySet = function() {
  var keys = [];
  var length = this.size();
  for (var i = 0; i < length; i++) {
    keys[i] = this.storageMap_.key(i);
  }
  return keys;
};


/**
 * Removes an item with a given key.
 *
 * @param {string} key The key item of the key/value pair.
 * @return {?string} The removed value if present, otherwise null.
 */
bot.storage.Storage.prototype.removeItem = function(key) {
  var value = this.getItem(key);
  this.storageMap_.removeItem(key);
  return value;
};


/**
 * Removes all items.
 */
bot.storage.Storage.prototype.clear = function() {
  this.storageMap_.clear();
};


/**
 * Returns the number of items in the Storage object.
 *
 * @return {number} The number of the key/value pairs.
 */
bot.storage.Storage.prototype.size = function() {
  return this.storageMap_.length;
};


/**
 * Returns the key item of the key/value pairs in the Storage object
 * of a given index.
 *
 * @param {number} index The index of the key/value pair list.
 * @return {?string} The key item of a given index.
 */
bot.storage.Storage.prototype.key = function(index) {
  return this.storageMap_.key(index);
};


/**
 * Returns HTML5 storage object of the wrapper Storage object
 *
 * @return {Storage} The storageMap attribute.
 */
bot.storage.Storage.prototype.getStorageMap = function() {
  return this.storageMap_;
};
