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
 * @fileoverview Wrapper for an IndexedDB index.
 *
 */


goog.provide('goog.db.Index');

goog.require('goog.async.Deferred');
goog.require('goog.db.Error');
goog.require('goog.debug');



/**
 * Creates an IDBIndex wrapper object. Indexes are associated with object
 * stores and provide methods for looking up objects based on their non-key
 * properties. Should not be created directly, access through the object store
 * it belongs to.
 * @see goog.db.ObjectStore#getIndex
 *
 * @param {!IDBIndex} index Underlying IDBIndex object.
 * @constructor
 */
goog.db.Index = function(index) {
  /**
   * Underlying IndexedDB index object.
   *
   * @type {!IDBIndex}
   * @private
   */
  this.index_ = index;
};


/**
 * @return {string} Name of the index.
 */
goog.db.Index.prototype.getName = function() {
  return this.index_.name;
};


/**
 * @return {string} Key path of the index.
 */
goog.db.Index.prototype.getKeyPath = function() {
  return this.index_.keyPath;
};


/**
 * @return {boolean} True if the index enforces that there is only one object
 *     for each unique value it indexes on.
 */
goog.db.Index.prototype.isUnique = function() {
  return this.index_.unique;
};


/**
 * Helper function for get and getKey.
 *
 * @param {string} fn Function name to call on the index to get the request.
 * @param {string} msg Message to give to the error.
 * @param {!Object} value Value to look up in the index.
 * @return {!goog.async.Deferred} The resulting deferred object.
 * @private
 */
goog.db.Index.prototype.get_ = function(fn, msg, value) {
  var d = new goog.async.Deferred();
  var request;
  try {
    request = this.index_[fn](value);
  } catch (err) {
    msg += ' with value ' + goog.debug.deepExpose(value);
    d.errback(new goog.db.Error(err.code, msg));
    return d;
  }
  request.onsuccess = function(ev) {
    d.callback(ev.target.result);
  };
  request.onerror = function(ev) {
    msg += ' with value ' + goog.debug.deepExpose(value);
    d.errback(new goog.db.Error(
        (/** @type {IDBRequest} */ (ev.target)).errorCode,
        msg));
  };
  return d;
};


/**
 * Fetches a single object from the object store. Even if there are multiple
 * objects that match the given value, this method will get only one of them.
 *
 * @param {!Object} value Value to look up in the index.
 * @return {!goog.async.Deferred} The deferred object that matches the value.
 */
goog.db.Index.prototype.get = function(value) {
  return this.get_('get', 'getting from index ' + this.getName(), value);
};


/**
 * Looks up a single object from the object store and gives back the key that
 * it's listed under in the object store. Even if there are multiple objects
 * that match the given value, this method will only get one of their keys.
 *
 * @param {!Object} value Value to look up in the index.
 * @return {!goog.async.Deferred} The deferred key for the object that matches
 *     the value.
 */
goog.db.Index.prototype.getKey = function(value) {
  return this.get_('getKey', 'getting key from index ' + this.getName(), value);
};


/**
 * Helper function for getAll and getAllKeys.
 *
 * @param {string} fn Function name to call on the index to get the request.
 * @param {string} msg Message to give to the error.
 * @param {!Object=} opt_value Value to look up in the index.
 * @return {!goog.async.Deferred} The resulting deferred array of objects.
 * @private
 */
goog.db.Index.prototype.getAll_ = function(fn, msg, opt_value) {
  // This is the most common use of IDBKeyRange. If more specific uses of
  // cursors are needed then a full wrapper should be created.
  var IDBKeyRange = goog.global.IDBKeyRange || goog.global.webkitIDBKeyRange;
  var d = new goog.async.Deferred();
  var request;
  try {
    if (opt_value) {
      request = this.index_[fn](IDBKeyRange.bound(opt_value, opt_value));
    } else {
      request = this.index_[fn]();
    }
  } catch (err) {
    if (opt_value) {
      msg += ' for value ' + goog.debug.deepExpose(opt_value);
    }
    d.errback(new goog.db.Error(err.code, msg));
    return d;
  }
  var result = [];
  request.onsuccess = function(ev) {
    var cursor = ev.target.result;
    if (cursor) {
      result.push(cursor.value);
      cursor['continue']();
    } else {
      d.callback(result);
    }
  };
  request.onerror = function(ev) {
    if (opt_value) {
      msg += ' for value ' + goog.debug.deepExpose(opt_value);
    }
    d.errback(new goog.db.Error(
        (/** @type {IDBRequest} */ (ev.target)).errorCode,
        msg));
  };
  return d;
};


/**
 * Gets all indexed objects. If the value is provided, gets all indexed objects
 * that match the value instead.
 *
 * @param {!Object=} opt_value Value to look up in the index.
 * @return {!goog.async.Deferred} A deferred array of objects that match the
 *     value.
 */
goog.db.Index.prototype.getAll = function(opt_value) {
  return this.getAll_(
      'openCursor',
      'getting all from index ' + this.getName(),
      opt_value);
};


/**
 * Gets the keys to look up all the indexed objects. If the value is provided,
 * gets all keys for objects that match the value instead.
 *
 * @param {!Object=} opt_value Value to look up in the index.
 * @return {!goog.async.Deferred} A deferred array of keys for objects that
 *     match the value.
 */
goog.db.Index.prototype.getAllKeys = function(opt_value) {
  return this.getAll_(
      'openKeyCursor',
      'getting all keys from index ' + this.getName(),
      opt_value);
};
