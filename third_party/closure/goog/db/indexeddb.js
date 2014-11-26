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
 * @fileoverview Wrapper for an IndexedDB database.
 *
 */


goog.provide('goog.db.IndexedDb');

goog.require('goog.async.Deferred');
goog.require('goog.db.Error');
goog.require('goog.db.ObjectStore');
goog.require('goog.db.Transaction');
goog.require('goog.events.Event');
goog.require('goog.events.EventHandler');
goog.require('goog.events.EventTarget');



/**
 * Creates an IDBDatabase wrapper object. The database object has methods for
 * setting the version to change the structure of the database and for creating
 * transactions to get or modify the stored records. Should not be created
 * directly, call {@link goog.db.openDatabase} to set up the connection.
 *
 * @param {!IDBDatabase} db Underlying IndexedDB database object.
 * @constructor
 * @extends {goog.events.EventTarget}
 * @final
 */
goog.db.IndexedDb = function(db) {
  goog.db.IndexedDb.base(this, 'constructor');

  /**
   * Underlying IndexedDB database object.
   *
   * @type {!IDBDatabase}
   * @private
   */
  this.db_ = db;

  /**
   * Internal event handler that listens to IDBDatabase events.
   * @type {!goog.events.EventHandler<!goog.db.IndexedDb>}
   * @private
   */
  this.eventHandler_ = new goog.events.EventHandler(this);

  this.eventHandler_.listen(
      this.db_,
      goog.db.IndexedDb.EventType.ABORT,
      goog.bind(
          this.dispatchEvent,
          this,
          goog.db.IndexedDb.EventType.ABORT));
  this.eventHandler_.listen(
      this.db_,
      goog.db.IndexedDb.EventType.ERROR,
      this.dispatchError_);
  this.eventHandler_.listen(
      this.db_,
      goog.db.IndexedDb.EventType.VERSION_CHANGE,
      this.dispatchVersionChange_);
  this.eventHandler_.listen(
      this.db_,
      goog.db.IndexedDb.EventType.CLOSE,
      goog.bind(
          this.dispatchEvent,
          this,
          goog.db.IndexedDb.EventType.CLOSE));
};
goog.inherits(goog.db.IndexedDb, goog.events.EventTarget);


/**
 * True iff the database connection is open.
 *
 * @type {boolean}
 * @private
 */
goog.db.IndexedDb.prototype.open_ = true;


/**
 * Dispatches a wrapped error event based on the given event.
 *
 * @param {Event} ev The error event given to the underlying IDBDatabase.
 * @private
 */
goog.db.IndexedDb.prototype.dispatchError_ = function(ev) {
  this.dispatchEvent({
    type: goog.db.IndexedDb.EventType.ERROR,
    errorCode: /** @type {IDBRequest} */ (ev.target).errorCode
  });
};


/**
 * Dispatches a wrapped version change event based on the given event.
 *
 * @param {Event} ev The version change event given to the underlying
 *     IDBDatabase.
 * @private
 */
goog.db.IndexedDb.prototype.dispatchVersionChange_ = function(ev) {
  this.dispatchEvent(new goog.db.IndexedDb.VersionChangeEvent(
      ev.oldVersion, ev.newVersion));
};


/**
 * Closes the database connection. Metadata queries can still be made after this
 * method is called, but otherwise this wrapper should not be used further.
 */
goog.db.IndexedDb.prototype.close = function() {
  if (this.open_) {
    this.db_.close();
    this.open_ = false;
  }
};


/**
 * @return {boolean} Whether a connection is open and the database can be used.
 */
goog.db.IndexedDb.prototype.isOpen = function() {
  return this.open_;
};


/**
 * @return {string} The name of this database.
 */
goog.db.IndexedDb.prototype.getName = function() {
  return this.db_.name;
};


/**
 * @return {string} The current database version.
 */
goog.db.IndexedDb.prototype.getVersion = function() {
  return this.db_.version;
};


/**
 * @return {DOMStringList} List of object stores in this database.
 */
goog.db.IndexedDb.prototype.getObjectStoreNames = function() {
  return this.db_.objectStoreNames;
};


/**
 * Creates an object store in this database. Can only be called inside a
 * {@link goog.db.UpgradeNeededCallback} or the callback for the Deferred
 * returned from #setVersion.
 *
 * @param {string} name Name for the new object store.
 * @param {Object=} opt_params Options object. The available options are:
 *     keyPath, which is a string and determines what object attribute
 *     to use as the key when storing objects in this object store; and
 *     autoIncrement, which is a boolean, which defaults to false and determines
 *     whether the object store should automatically generate keys for stored
 *     objects. If keyPath is not provided and autoIncrement is false, then all
 *     insert operations must provide a key as a parameter.
 * @return {!goog.db.ObjectStore} The newly created object store.
 * @throws {goog.db.Error} If there's a problem creating the object store.
 */
goog.db.IndexedDb.prototype.createObjectStore = function(name, opt_params) {
  try {
    return new goog.db.ObjectStore(this.db_.createObjectStore(
        name, opt_params));
  } catch (ex) {
    throw goog.db.Error.fromException(ex, 'creating object store ' + name);
  }
};


/**
 * Deletes an object store. Can only be called inside a
 * {@link goog.db.UpgradeNeededCallback} or the callback for the Deferred
 * returned from #setVersion.
 *
 * @param {string} name Name of the object store to delete.
 * @throws {goog.db.Error} If there's a problem deleting the object store.
 */
goog.db.IndexedDb.prototype.deleteObjectStore = function(name) {
  try {
    this.db_.deleteObjectStore(name);
  } catch (ex) {
    throw goog.db.Error.fromException(ex, 'deleting object store ' + name);
  }
};


/**
 * Updates the version of the database and returns a Deferred transaction.
 * The database's structure can be changed inside this Deferred's callback, but
 * nowhere else. This means adding or deleting object stores, and adding or
 * deleting indexes. The version change will not succeed unless there are no
 * other connections active for this database anywhere. A new database
 * connection should be opened after the version change is finished to pick
 * up changes.
 *
 * This is deprecated, and only supported on Chrome prior to version 25. New
 * applications should use the version parameter to {@link goog.db.openDatabase}
 * instead.
 *
 * @param {string} version The new version of the database.
 * @return {!goog.async.Deferred} The deferred transaction for changing the
 *     version.
 */
goog.db.IndexedDb.prototype.setVersion = function(version) {
  var self = this;
  var d = new goog.async.Deferred();
  var request = this.db_.setVersion(version);
  request.onsuccess = function(ev) {
    // the transaction is in the result field (the transaction field is null
    // for version change requests)
    d.callback(new goog.db.Transaction(ev.target.result, self));
  };
  request.onerror = function(ev) {
    // If a version change is blocked, onerror and onblocked may both fire.
    // Check d.hasFired() to avoid an AlreadyCalledError.
    if (!d.hasFired()) {
      d.errback(goog.db.Error.fromRequest(ev.target, 'setting version'));
    }
  };
  request.onblocked = function(ev) {
    // If a version change is blocked, onerror and onblocked may both fire.
    // Check d.hasFired() to avoid an AlreadyCalledError.
    if (!d.hasFired()) {
      d.errback(new goog.db.Error.VersionChangeBlockedError());
    }
  };
  return d;
};


/**
 * Creates a new transaction.
 *
 * @param {!Array<string>} storeNames A list of strings that contains the
 *     transaction's scope, the object stores that this transaction can operate
 *     on.
 * @param {goog.db.Transaction.TransactionMode=} opt_mode The mode of the
 *     transaction. If not present, the default is READ_ONLY. For VERSION_CHANGE
 *     transactions call {@link goog.db.IndexedDB#setVersion} instead.
 * @return {!goog.db.Transaction} The wrapper for the newly created transaction.
 * @throws {goog.db.Error} If there's a problem creating the transaction.
 */
goog.db.IndexedDb.prototype.createTransaction = function(storeNames, opt_mode) {
  try {
    // IndexedDB on Chrome 22+ requires that opt_mode not be passed rather than
    // be explicitly passed as undefined.
    var transaction = opt_mode ?
        this.db_.transaction(storeNames, opt_mode) :
        this.db_.transaction(storeNames);
    return new goog.db.Transaction(transaction, this);
  } catch (ex) {
    throw goog.db.Error.fromException(ex, 'creating transaction');
  }
};


/** @override */
goog.db.IndexedDb.prototype.disposeInternal = function() {
  goog.db.IndexedDb.base(this, 'disposeInternal');
  this.eventHandler_.dispose();
};


/**
 * Event types fired by a database.
 *
 * @enum {string} The event types for the web socket.
 */
goog.db.IndexedDb.EventType = {

  /**
   * Fired when a transaction is aborted and the event bubbles to its database.
   */
  ABORT: 'abort',

  /**
   * Fired when the database connection is forcibly closed by the browser,
   * without an explicit call to IDBDatabase#close. This behavior is not in the
   * spec yet but will be added since it is necessary, see
   * https://www.w3.org/Bugs/Public/show_bug.cgi?id=22540.
   */
  CLOSE: 'close',

  /**
   * Fired when a transaction has an error.
   */
  ERROR: 'error',

  /**
   * Fired when someone (possibly in another window) is attempting to modify the
   * structure of the database. Since a change can only be made when there are
   * no active database connections, this usually means that the database should
   * be closed so that the other client can make its changes.
   */
  VERSION_CHANGE: 'versionchange'
};



/**
 * Event representing a (possibly attempted) change in the database structure.
 *
 * At time of writing, no Chrome versions support oldVersion or newVersion. See
 * http://crbug.com/153122.
 *
 * @param {number} oldVersion The previous version of the database.
 * @param {number} newVersion The version the database is being or has been
 *     updated to.
 * @constructor
 * @extends {goog.events.Event}
 * @final
 */
goog.db.IndexedDb.VersionChangeEvent = function(oldVersion, newVersion) {
  goog.db.IndexedDb.VersionChangeEvent.base(
      this, 'constructor', goog.db.IndexedDb.EventType.VERSION_CHANGE);

  /**
   * The previous version of the database.
   * @type {number}
   */
  this.oldVersion = oldVersion;

  /**
   * The version the database is being or has been updated to.
   * @type {number}
   */
  this.newVersion = newVersion;
};
goog.inherits(goog.db.IndexedDb.VersionChangeEvent, goog.events.Event);
