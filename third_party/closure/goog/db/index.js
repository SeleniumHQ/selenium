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
 */


goog.provide('goog.db.Index');

goog.require('goog.async.Deferred');
goog.require('goog.db.Cursor');
goog.require('goog.db.Error');
goog.require('goog.db.KeyRange');
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
 * @final
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
 * @return {*} Key path of the index.
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
 * @param {!IDBKeyType} key The key to look up in the index.
 * @return {!goog.async.Deferred} The resulting deferred object.
 * @private
 */
goog.db.Index.prototype.get_ = function(fn, msg, key) {
  var d = new goog.async.Deferred();
  var request;
  try {
    request = this.index_[fn](key);
  } catch (err) {
    msg += ' with key ' + goog.debug.deepExpose(key);
    d.errback(goog.db.Error.fromException(err, msg));
    return d;
  }
  request.onsuccess = function(ev) { d.callback(ev.target.result); };
  request.onerror = function(ev) {
    msg += ' with key ' + goog.debug.deepExpose(key);
    d.errback(goog.db.Error.fromRequest(ev.target, msg));
  };
  return d;
};


/**
 * Fetches a single object from the object store. Even if there are multiple
 * objects that match the given key, this method will get only one of them.
 *
 * @param {!IDBKeyType} key Key to look up in the index.
 * @return {!goog.async.Deferred} The deferred object for the given record.
 */
goog.db.Index.prototype.get = function(key) {
  return this.get_('get', 'getting from index ' + this.getName(), key);
};


/**
 * Looks up a single object from the object store and gives back the key that
 * it's listed under in the object store. Even if there are multiple records
 * that match the given key, this method returns the first.
 *
 * @param {!IDBKeyType} key Key to look up in the index.
 * @return {!goog.async.Deferred} The deferred key for the record that matches
 *     the key.
 */
goog.db.Index.prototype.getKey = function(key) {
  return this.get_('getKey', 'getting key from index ' + this.getName(), key);
};


/**
 * Returns the values matching `opt_key` up to `opt_count`.
 *
 * If `obt_key` is a `KeyRange`, returns all keys in that range. If it is
 * `undefined`, returns all known keys.
 *
 * @param {!IDBKeyType|!goog.db.KeyRange=} opt_key Key or KeyRange to look up in
 *     the index.
 * @param {number=} opt_count The number records to return
 * @return {!goog.async.Deferred} A deferred array of objects that match the
 *     key.
 */
goog.db.Index.prototype.getAll = function(opt_key, opt_count) {
  return this.getAll_(
      'getAll', 'getting all from index ' + this.getName(), opt_key, opt_count);
};


/**
 * Returns the keys matching `opt_key` up to `opt_count`.
 *
 * If `obt_key` is a `KeyRange`, returns all keys in that range. If it is
 * `undefined`, returns all known keys.
 *
 * @param {!IDBKeyType|!goog.db.KeyRange=} opt_key Key or KeyRange to look up in
 *     the index.
 * @param {number=} opt_count The number records to return
 * @return {!goog.async.Deferred} A deferred array of keys for objects that
 *     match the key.
 */
goog.db.Index.prototype.getAllKeys = function(opt_key, opt_count) {
  return this.getAll_(
      'getAllKeys', 'getting all keys index ' + this.getName(), opt_key,
      opt_count);
};


/**
 * Helper function for native `getAll` and `getAllKeys` on `IDBObjectStore` that
 * takes in `IDBKeyRange` as params.
 *
 * Returns the result of the native method in a `Deferred` object.
 *
 * @param {string} fn Function name to call on the index to get the request.
 * @param {string} msg Message to give to the error.
 * @param {!IDBKeyType|!goog.db.KeyRange|undefined} keyOrRange
 *     Key or KeyRange to look up in the index.
 * @param {number|undefined} count The number records to return
 * @return {!goog.async.Deferred} The resulting deferred array of objects.
 * @private
 */
goog.db.Index.prototype.getAll_ = function(fn, msg, keyOrRange, count) {
  var nativeRange;
  if (keyOrRange === undefined) {
    nativeRange = undefined;
  } else if (keyOrRange instanceof goog.db.KeyRange) {
    nativeRange = keyOrRange.range();
  } else {
    nativeRange = goog.db.KeyRange.only(keyOrRange).range();
  }

  var d = new goog.async.Deferred();
  var request;
  try {
    request = this.index_[fn](nativeRange, count);
  } catch (err) {
    msg += ' for range ' +
        (nativeRange ? goog.debug.deepExpose(nativeRange) : '<all>');
    d.errback(goog.db.Error.fromException(err, msg));
    return d;
  }
  request.onsuccess = function() {
    d.callback(request.result);
  };
  request.onerror = function(ev) {
    msg += ' for range ' +
        (nativeRange ? goog.debug.deepExpose(nativeRange) : '<all>');
    d.errback(goog.db.Error.fromRequest(ev.target, msg));
  };
  return d;
};


/**
 * Opens a cursor over the specified key range. Returns a cursor object which is
 * able to iterate over the given range.
 *
 * Example usage:
 *
 * <code>
 *  var cursor = index.openCursor(goog.db.KeyRange.bound('a', 'c'));
 *
 *  var key = goog.events.listen(
 *      cursor, goog.db.Cursor.EventType.NEW_DATA,
 *      function() {
 *        // Do something with data.
 *        cursor.next();
 *      });
 *
 *  goog.events.listenOnce(
 *      cursor, goog.db.Cursor.EventType.COMPLETE,
 *      function() {
 *        // Clean up listener, and perform a finishing operation on the data.
 *        goog.events.unlistenByKey(key);
 *      });
 * </code>
 *
 * @param {!goog.db.KeyRange=} opt_range The key range. If undefined iterates
 *     over the whole object store.
 * @param {!goog.db.Cursor.Direction=} opt_direction The direction. If undefined
 *     moves in a forward direction with duplicates.
 * @return {!goog.db.Cursor} The cursor.
 * @throws {!goog.db.Error} If there was a problem opening the cursor.
 */
goog.db.Index.prototype.openCursor = function(opt_range, opt_direction) {
  return goog.db.Cursor.openCursor(this.index_, opt_range, opt_direction);
};
