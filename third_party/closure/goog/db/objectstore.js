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
 * @fileoverview Wrapper for an IndexedDB object store.
 *
 */


goog.provide('goog.db.ObjectStore');

goog.require('goog.async.Deferred');
goog.require('goog.db.Cursor');
goog.require('goog.db.Error');
goog.require('goog.db.Index');
goog.require('goog.debug');
goog.require('goog.events');



/**
 * Creates an IDBObjectStore wrapper object. Object stores have methods for
 * storing and retrieving records, and are accessed through a transaction
 * object. They also have methods for creating indexes associated with the
 * object store. They can only be created when setting the version of the
 * database. Should not be created directly, access object stores through
 * transactions.
 * @see goog.db.IndexedDb#setVersion
 * @see goog.db.Transaction#objectStore
 *
 * @param {!IDBObjectStore} store The backing IndexedDb object.
 * @constructor
 *
 * TODO(user): revisit msg in exception and errors in this class. In newer
 *     Chrome (v22+) the error/request come with a DOM error string that is
 *     already very descriptive.
 */
goog.db.ObjectStore = function(store) {
  /**
   * Underlying IndexedDB object store object.
   *
   * @type {!IDBObjectStore}
   * @private
   */
  this.store_ = store;
};


/**
 * @return {string} The name of the object store.
 */
goog.db.ObjectStore.prototype.getName = function() {
  return this.store_.name;
};


/**
 * Helper function for put and add.
 *
 * @param {string} fn Function name to call on the object store.
 * @param {string} msg Message to give to the error.
 * @param {*} value Value to insert into the object store.
 * @param {IDBKeyType=} opt_key The key to use.
 * @return {!goog.async.Deferred} The resulting deferred request.
 * @private
 */
goog.db.ObjectStore.prototype.insert_ = function(fn, msg, value, opt_key) {
  // TODO(user): refactor wrapping an IndexedDB request in a Deferred by
  // creating a higher-level abstraction for it (mostly affects here and
  // goog.db.Index)
  var d = new goog.async.Deferred();
  var request;
  try {
    // put or add with (value, undefined) throws an error, so we need to check
    // for undefined ourselves
    if (opt_key) {
      request = this.store_[fn](value, opt_key);
    } else {
      request = this.store_[fn](value);
    }
  } catch (ex) {
    msg += goog.debug.deepExpose(value);
    if (opt_key) {
      msg += ', with key ' + goog.debug.deepExpose(opt_key);
    }
    d.errback(goog.db.Error.fromException(ex, msg));
    return d;
  }
  request.onsuccess = function(ev) {
    d.callback();
  };
  var self = this;
  request.onerror = function(ev) {
    msg += goog.debug.deepExpose(value);
    if (opt_key) {
      msg += ', with key ' + goog.debug.deepExpose(opt_key);
    }
    d.errback(goog.db.Error.fromRequest(ev.target, msg));
  };
  return d;
};


/**
 * Adds an object to the object store. Replaces existing objects with the
 * same key.
 *
 * @param {*} value The value to put.
 * @param {IDBKeyType=} opt_key The key to use. Cannot be used if the
 *     keyPath was specified for the object store. If the keyPath was not
 *     specified but autoIncrement was not enabled, it must be used.
 * @return {!goog.async.Deferred} The deferred put request.
 */
goog.db.ObjectStore.prototype.put = function(value, opt_key) {
  return this.insert_(
      'put',
      'putting into ' + this.getName() + ' with value',
      value,
      opt_key);
};


/**
 * Adds an object to the object store. Requires that there is no object with
 * the same key already present.
 *
 * @param {*} value The value to add.
 * @param {IDBKeyType=} opt_key The key to use. Cannot be used if the
 *     keyPath was specified for the object store. If the keyPath was not
 *     specified but autoIncrement was not enabled, it must be used.
 * @return {!goog.async.Deferred} The deferred add request.
 */
goog.db.ObjectStore.prototype.add = function(value, opt_key) {
  return this.insert_(
      'add',
      'adding into ' + this.getName() + ' with value ',
      value,
      opt_key);
};


/**
 * Removes an object from the store. No-op if there is no object present with
 * the given key.
 *
 * @param {IDBKeyType} key The key to remove objects under.
 * @return {!goog.async.Deferred} The deferred remove request.
 */
goog.db.ObjectStore.prototype.remove = function(key) {
  var d = new goog.async.Deferred();
  var request;
  try {
    request = this.store_['delete'](key);
  } catch (err) {
    var msg = 'removing from ' + this.getName() + ' with key ' +
        goog.debug.deepExpose(key);
    d.errback(goog.db.Error.fromException(err, msg));
    return d;
  }
  request.onsuccess = function(ev) {
    d.callback();
  };
  var self = this;
  request.onerror = function(ev) {
    var msg = 'removing from ' + self.getName() + ' with key ' +
        goog.debug.deepExpose(key);
    d.errback(goog.db.Error.fromRequest(ev.target, msg));
  };
  return d;
};


/**
 * Gets an object from the store. If no object is present with that key
 * the result is {@code undefined}.
 *
 * @param {IDBKeyType} key The key to look up.
 * @return {!goog.async.Deferred} The deferred get request.
 */
goog.db.ObjectStore.prototype.get = function(key) {
  var d = new goog.async.Deferred();
  var request;
  try {
    request = this.store_.get(key);
  } catch (err) {
    var msg = 'getting from ' + this.getName() + ' with key ' +
        goog.debug.deepExpose(key);
    d.errback(goog.db.Error.fromException(err, msg));
    return d;
  }
  request.onsuccess = function(ev) {
    d.callback(ev.target.result);
  };
  var self = this;
  request.onerror = function(ev) {
    var msg = 'getting from ' + self.getName() + ' with key ' +
        goog.debug.deepExpose(key);
    d.errback(goog.db.Error.fromRequest(ev.target, msg));
  };
  return d;
};


/**
 * Gets all objects from the store and returns them as an array.
 *
 * @param {!goog.db.KeyRange=} opt_range The key range. If undefined iterates
 *     over the whole object store.
 * @param {!goog.db.Cursor.Direction=} opt_direction The direction. If undefined
 *     moves in a forward direction with duplicates.
 * @return {!goog.async.Deferred} The deferred getAll request.
 */
goog.db.ObjectStore.prototype.getAll = function(opt_range, opt_direction) {
  var d = new goog.async.Deferred();
  var cursor;
  try {
    cursor = this.openCursor(opt_range, opt_direction);
  } catch (err) {
    d.errback(err);
    return d;
  }

  var result = [];
  var key = goog.events.listen(
      cursor, goog.db.Cursor.EventType.NEW_DATA, function() {
        result.push(cursor.getValue());
        cursor.next();
      });

  goog.events.listenOnce(cursor, [
    goog.db.Cursor.EventType.ERROR,
    goog.db.Cursor.EventType.COMPLETE
  ], function(evt) {
    cursor.dispose();
    if (evt.type == goog.db.Cursor.EventType.COMPLETE) {
      d.callback(result);
    } else {
      d.errback();
    }
  });
  return d;
};


/**
 * Opens a cursor over the specified key range. Returns a cursor object which is
 * able to iterate over the given range.
 *
 * Example usage:
 *
 * <code>
 *  var cursor = objectStore.openCursor(goog.db.Range.bound('a', 'c'));
 *
 *  var key = goog.events.listen(
 *      cursor, goog.db.Cursor.EventType.NEW_DATA, function() {
 *    // Do something with data.
 *    cursor.next();
 *  });
 *
 *  goog.events.listenOnce(
 *      cursor, goog.db.Cursor.EventType.COMPLETE, function() {
 *    // Clean up listener, and perform a finishing operation on the data.
 *    goog.events.unlistenByKey(key);
 *  });
 * </code>
 *
 * @param {!goog.db.KeyRange=} opt_range The key range. If undefined iterates
 *     over the whole object store.
 * @param {!goog.db.Cursor.Direction=} opt_direction The direction. If undefined
 *     moves in a forward direction with duplicates.
 * @return {!goog.db.Cursor} The cursor.
 * @throws {goog.db.Error} If there was a problem opening the cursor.
 */
goog.db.ObjectStore.prototype.openCursor = function(opt_range, opt_direction) {
  return goog.db.Cursor.openCursor(this.store_, opt_range, opt_direction);
};


/**
 * Deletes all objects from the store.
 *
 * @return {!goog.async.Deferred} The deferred clear request.
 */
goog.db.ObjectStore.prototype.clear = function() {
  var msg = 'clearing store ' + this.getName();
  var d = new goog.async.Deferred();
  var request;
  try {
    request = this.store_.clear();
  } catch (err) {
    d.errback(goog.db.Error.fromException(err, msg));
    return d;
  }
  request.onsuccess = function(ev) {
    d.callback();
  };
  request.onerror = function(ev) {
    d.errback(goog.db.Error.fromRequest(ev.target, msg));
  };
  return d;
};


/**
 * Creates an index in this object store. Can only be called inside the callback
 * for the Deferred returned from goog.db.IndexedDb#setVersion.
 *
 * @param {string} name Name of the index to create.
 * @param {string} keyPath Attribute to index on.
 * @param {!Object=} opt_parameters Optional parameters object. The only
 *     available option is unique, which defaults to false. If unique is true,
 *     the index will enforce that there is only ever one object in the object
 *     store for each unique value it indexes on.
 * @return {goog.db.Index} The newly created, wrapped index.
 * @throws {goog.db.Error} In case of an error creating the index.
 */
goog.db.ObjectStore.prototype.createIndex = function(
    name, keyPath, opt_parameters) {
  try {
    return new goog.db.Index(this.store_.createIndex(
        name, keyPath, opt_parameters));
  } catch (ex) {
    var msg = 'creating new index ' + name + ' with key path ' + keyPath;
    throw goog.db.Error.fromException(ex, msg);
  }
};


/**
 * Gets an index.
 *
 * @param {string} name Name of the index to fetch.
 * @return {goog.db.Index} The requested wrapped index.
 * @throws {goog.db.Error} In case of an error getting the index.
 */
goog.db.ObjectStore.prototype.getIndex = function(name) {
  try {
    return new goog.db.Index(this.store_.index(name));
  } catch (ex) {
    var msg = 'getting index ' + name;
    throw goog.db.Error.fromException(ex, msg);
  }
};


/**
 * Deletes an index from the object store. Can only be called inside the
 * callback for the Deferred returned from goog.db.IndexedDb#setVersion.
 *
 * @param {string} name Name of the index to delete.
 * @throws {goog.db.Error} In case of an error deleting the index.
 */
goog.db.ObjectStore.prototype.deleteIndex = function(name) {
  try {
    this.store_.deleteIndex(name);
  } catch (ex) {
    var msg = 'deleting index ' + name;
    throw goog.db.Error.fromException(ex, msg);
  }
};


/**
 * Gets number of records within a key range.
 *
 * @param {!goog.db.KeyRange=} opt_range The key range. If undefined, this will
 *     count all records in the object store.
 * @return {!goog.async.Deferred} The deferred number of records.
 */
goog.db.ObjectStore.prototype.count = function(opt_range) {
  var request;
  var d = new goog.async.Deferred();

  try {
    var range = opt_range ? opt_range.range() : null;
    request = this.store_.count(range);
  } catch (ex) {
    d.errback(goog.db.Error.fromException(ex, this.getName()));
  }
  request.onsuccess = function(ev) {
    d.callback(ev.target.result);
  };
  request.onerror = function(ev) {
    d.errback(goog.db.Error.fromRequest(ev.target, this.getName()));
  };
  return d;
};

