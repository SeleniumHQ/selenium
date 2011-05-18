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
 * @fileoverview Provides data persistence using HTML5 local storage mechanism.
 *
 */

goog.provide('goog.storage.mechanism.HTML5LocalStorage');

goog.require('goog.asserts');
goog.require('goog.iter.Iterator');
goog.require('goog.iter.StopIteration');
goog.require('goog.storage.mechanism.ErrorCode');
goog.require('goog.storage.mechanism.IterableMechanism');



/**
 * Provides a storage mechanism that uses HTML5 local storage.
 *
 * @constructor
 * @extends {goog.storage.mechanism.IterableMechanism}
 */
goog.storage.mechanism.HTML5LocalStorage = function() {
  goog.base(this);
};
goog.inherits(goog.storage.mechanism.HTML5LocalStorage,
              goog.storage.mechanism.IterableMechanism);


/**
 * Determines whether or not the mechanism is available.
 * It works only if localStorage is in the window scope.
 *
 * @return {boolean} True if the mechanism is available.
 */
goog.storage.mechanism.HTML5LocalStorage.prototype.isAvailable = function() {
  /** @preserveTry */
  try {
    // May throw a security exception if localStorage is disabled.
    return !!window.localStorage.getItem;
  } catch (e) {}
  return false;
};


/** @inheritDoc */
goog.storage.mechanism.HTML5LocalStorage.prototype.set = function(key, value) {
  /** @preserveTry */
  try {
    // May throw an exception if storage quota is exceeded.
    window.localStorage.setItem(key, value);
  } catch (e) {
    throw goog.storage.mechanism.ErrorCode.QUOTA_EXCEEDED;
  }
};


/** @inheritDoc */
goog.storage.mechanism.HTML5LocalStorage.prototype.get = function(key) {
  // According to W3C specs, values can be of any type. Since we only save
  // strings, any other type is a storage error. If we returned nulls for
  // such keys, i.e., treated them as non-existent, this would lead to a
  // paradox where a key exists, but it does not when it is retrieved.
  // http://www.w3.org/TR/2009/WD-webstorage-20091029/#the-storage-interface
  var value = window.localStorage.getItem(key);
  if (goog.isString(value) || goog.isNull(value)) {
    return value;
  }
  throw goog.storage.mechanism.ErrorCode.INVALID_VALUE;
};


/** @inheritDoc */
goog.storage.mechanism.HTML5LocalStorage.prototype.remove = function(key) {
  window.localStorage.removeItem(key);
};


/** @inheritDoc */
goog.storage.mechanism.HTML5LocalStorage.prototype.getCount = function() {
  return window.localStorage.length;
};


/** @inheritDoc */
goog.storage.mechanism.HTML5LocalStorage.prototype.__iterator__ = function(
    opt_keys) {
  var i = 0;
  var newIter = new goog.iter.Iterator;
  newIter.next = function() {
    if (i >= window.localStorage.length) {
      throw goog.iter.StopIteration;
    }
    var key = goog.asserts.assertString(window.localStorage.key(i++));
    if (opt_keys) {
      return key;
    }
    var value = window.localStorage.getItem(key);
    // The value must exist and be a string, otherwise it is a storage error.
    if (goog.isString(value)) {
      return value;
    }
    throw goog.storage.mechanism.ErrorCode.INVALID_VALUE;
  };
  return newIter;
};


/** @inheritDoc */
goog.storage.mechanism.HTML5LocalStorage.prototype.clear = function() {
  window.localStorage.clear();
};
