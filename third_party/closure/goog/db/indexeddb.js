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
goog.require('goog.db.Error.VersionChangeBlockedError');
goog.require('goog.db.ObjectStore');
goog.require('goog.db.Transaction');
goog.require('goog.db.Transaction.TransactionMode');



/**
 * Creates an IDBDatabase wrapper object. The database object has methods for
 * setting the version to change the structure of the database and for creating
 * transactions to get or modify the stored records. Should not be created
 * directly, call {@link goog.db.openDatabase} to set up the connection.
 *
 * @param {!IDBDatabase} db Underlying IndexedDB database object.
 * @constructor
 */
goog.db.IndexedDb = function(db) {
  /**
   * Underlying IndexedDB database object.
   *
   * @type {!IDBDatabase}
   * @private
   */
  this.db_ = db;
};


/**
 * True iff the database connection is open.
 *
 * @type {boolean}
 * @private
 */
goog.db.IndexedDb.prototype.open_ = true;


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
 * @return {Array} List of object stores in this database.
 */
goog.db.IndexedDb.prototype.getObjectStoreNames = function() {
  return this.db_.objectStoreNames;
};


/**
 * Creates an object store in this database. Can only be called inside the
 * callback for the Deferred returned from #setVersion.
 *
 * @param {string} name Name for the new object store.
 * @param {Object=} opt_params Options object. The available options are:
 *     keyPath, which is a string and determines what object attribute
 *     to use as the key when storing objects in this object store; and
 *     autoIncrement, which is a boolean, which defaults to false and determines
 *     whether the object store should automatically generate keys for stored
 *     objects. If keyPath is not provided and autoIncrement is false, then all
 *     insert operations must provide a key as a parameter.
 * @return {goog.db.ObjectStore} The newly created object store.
 * @throws {goog.db.Error} If there's a problem creating the object store.
 */
goog.db.IndexedDb.prototype.createObjectStore = function(name, opt_params) {
  try {
    return new goog.db.ObjectStore(this.db_.createObjectStore(
        name, opt_params));
  } catch (ex) {
    throw new goog.db.Error(ex.code, 'creating object store ' + name);
  }
};


/**
 * Deletes an object store. Can only be called inside the callback for the
 * Deferred returned from #setVersion.
 *
 * @param {string} name Name of the object store to delete.
 * @throws {goog.db.Error} If there's a problem deleting the object store.
 */
goog.db.IndexedDb.prototype.deleteObjectStore = function(name) {
  try {
    this.db_.deleteObjectStore(name);
  } catch (ex) {
    throw new goog.db.Error(ex.code, 'deleting object store ' + name);
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
 * @param {string} version The new version of the database.
 * @return {!goog.async.Deferred} The deferred transaction for changing the
 *     version.
 */
goog.db.IndexedDb.prototype.setVersion = function(version) {
  var d = new goog.async.Deferred();
  var request = this.db_.setVersion(version);
  request.onsuccess = function(ev) {
    // the transaction is in the result field (the transaction field is null
    // for version change requests)
    d.callback(new goog.db.Transaction(ev.target.result));
  };
  request.onerror = function(ev) {
    d.errback(new goog.db.Error(ev.target.errorCode, 'setting version'));
  };
  request.onblocked = function(ev) {
    d.errback(new goog.db.Error.VersionChangeBlockedError());
  };
  return d;
};


/**
 * Creates a new transaction.
 *
 * @param {!Array.<string>} storeNames A list of strings that contains the
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
    return new goog.db.Transaction(this.db_.transaction(storeNames, opt_mode));
  } catch (err) {
    throw new goog.db.Error(err.code, 'creating transaction');
  }
};
