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
 * @fileoverview Wrapper for a IndexedDB cursor.
 *
 */


goog.provide('goog.db.Cursor');

goog.require('goog.async.Deferred');
goog.require('goog.db.Error');
goog.require('goog.db.KeyRange');
goog.require('goog.debug');
goog.require('goog.events.EventTarget');



/**
 * Creates a new IDBCursor wrapper object. Should not be created directly,
 * access cursor through object store.
 * @see goog.db.ObjectStore#openCursor
 *
 * @constructor
 * @extends {goog.events.EventTarget}
 * @final
 */
goog.db.Cursor = function() {
  goog.db.Cursor.base(this, 'constructor');
};
goog.inherits(goog.db.Cursor, goog.events.EventTarget);


/**
 * Underlying IndexedDB cursor object.
 *
 * @type {IDBCursor}
 * @private
 */
goog.db.Cursor.prototype.cursor_ = null;


/**
 * Advances the cursor to the next position along its direction. When new data
 * is available, the NEW_DATA event will be fired. If the cursor has reached the
 * end of the range it will fire the COMPLETE event. If opt_key is specified it
 * will advance to the key it matches in its direction.
 *
 * This wraps the native #continue method on the underlying object.
 *
 * @param {IDBKeyType=} opt_key The optional key to advance to.
 */
goog.db.Cursor.prototype.next = function(opt_key) {
  if (opt_key) {
    this.cursor_['continue'](opt_key);
  } else {
    this.cursor_['continue']();
  }
};


/**
 * Updates the value at the current position of the cursor in the object store.
 * If the cursor points to a value that has just been deleted, a new value is
 * created.
 *
 * @param {*} value The value to be stored.
 * @return {!goog.async.Deferred} The resulting deferred request.
 */
goog.db.Cursor.prototype.update = function(value) {
  var msg = 'updating via cursor with value ';
  var d = new goog.async.Deferred();
  var request;

  try {
    request = this.cursor_.update(value);
  } catch (err) {
    msg += goog.debug.deepExpose(value);
    d.errback(goog.db.Error.fromException(err, msg));
    return d;
  }
  request.onsuccess = function(ev) { d.callback(); };
  request.onerror = function(ev) {
    msg += goog.debug.deepExpose(value);
    d.errback(goog.db.Error.fromRequest(ev.target, msg));
  };
  return d;
};


/**
 * Deletes the value at the cursor's position, without changing the cursor's
 * position. Once the value is deleted, the cursor's value is set to null.
 *
 * @return {!goog.async.Deferred} The resulting deferred request.
 */
goog.db.Cursor.prototype.remove = function() {
  var msg = 'deleting via cursor';
  var d = new goog.async.Deferred();
  var request;

  try {
    request = this.cursor_['delete']();
  } catch (err) {
    d.errback(goog.db.Error.fromException(err, msg));
    return d;
  }
  request.onsuccess = function(ev) { d.callback(); };
  request.onerror = function(ev) {
    d.errback(goog.db.Error.fromRequest(ev.target, msg));
  };
  return d;
};


/**
 * @return {*} The value for the value at the cursor's position. Undefined
 *     if no current value, or null if value has just been deleted.
 */
goog.db.Cursor.prototype.getValue = function() {
  return this.cursor_['value'];
};


/**
 * @return {IDBKeyType} The key for the value at the cursor's position. If
 *     the cursor is outside its range, this is undefined.
 */
goog.db.Cursor.prototype.getKey = function() {
  return this.cursor_.key;
};


/**
 * Opens a value cursor from IDBObjectStore or IDBIndex over the specified key
 * range. Returns a cursor object which is able to iterate over the given range.
 * @param {!(IDBObjectStore|IDBIndex)} source Data source to open cursor.
 * @param {!goog.db.KeyRange=} opt_range The key range. If undefined iterates
 *     over the whole data source.
 * @param {!goog.db.Cursor.Direction=} opt_direction The direction. If undefined
 *     moves in a forward direction with duplicates.
 * @return {!goog.db.Cursor} The cursor.
 * @throws {goog.db.Error} If there was a problem opening the cursor.
 */
goog.db.Cursor.openCursor = function(source, opt_range, opt_direction) {
  var cursor = new goog.db.Cursor();
  var request;

  try {
    var range = opt_range ? opt_range.range() : null;
    if (opt_direction) {
      request = source.openCursor(range, opt_direction);
    } else {
      request = source.openCursor(range);
    }
  } catch (ex) {
    cursor.dispose();
    throw goog.db.Error.fromException(ex, source.name);
  }
  request.onsuccess = function(e) {
    cursor.cursor_ = e.target.result || null;
    if (cursor.cursor_) {
      cursor.dispatchEvent(goog.db.Cursor.EventType.NEW_DATA);
    } else {
      cursor.dispatchEvent(goog.db.Cursor.EventType.COMPLETE);
    }
  };
  request.onerror = function(e) {
    cursor.dispatchEvent(goog.db.Cursor.EventType.ERROR);
  };
  return cursor;
};


/**
 * Possible cursor directions.
 * @see http://www.w3.org/TR/IndexedDB/#idl-def-IDBCursor
 *
 * @enum {string}
 */
goog.db.Cursor.Direction = {
  NEXT: 'next',
  NEXT_NO_DUPLICATE: 'nextunique',
  PREV: 'prev',
  PREV_NO_DUPLICATE: 'prevunique'
};


/**
 * Event types that the cursor can dispatch. COMPLETE events are dispatched when
 * a cursor is depleted of values, a NEW_DATA event if there is new data
 * available, and ERROR if an error occurred.
 *
 * @enum {string}
 */
goog.db.Cursor.EventType = {
  COMPLETE: 'c',
  ERROR: 'e',
  NEW_DATA: 'n'
};
