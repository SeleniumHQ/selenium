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
 * @fileoverview Wrappers for the HTML5 IndexedDB. The wrappers export nearly
 * the same interface as the standard API, but return goog.async.Deferred
 * objects instead of request objects and use Closure events. The wrapper works
 * and has been tested on Chrome version 22+. It may work on older Chrome
 * versions, but they aren't explicitly supported.
 *
 * Example usage:
 *
 *  <code>
 *  goog.db.openDatabase('mydb', 1, function(ev, db, tx) {
 *    db.createObjectStore('mystore');
 *  }).addCallback(function(db) {
 *    var putTx = db.createTransaction(
 *        [],
 *        goog.db.Transaction.TransactionMode.READ_WRITE);
 *    var store = putTx.objectStore('mystore');
 *    store.put('value', 'key');
 *    goog.listen(putTx, goog.db.Transaction.EventTypes.COMPLETE, function() {
 *      var getTx = db.createTransaction([]);
 *      var request = getTx.objectStore('mystore').get('key');
 *      request.addCallback(function(result) {
 *        ...
 *      });
 *  });
 *  </code>
 *
 */


goog.provide('goog.db');
goog.provide('goog.db.BlockedCallback');
goog.provide('goog.db.UpgradeNeededCallback');

goog.require('goog.asserts');
goog.require('goog.async.Deferred');
goog.require('goog.db.Error');
goog.require('goog.db.IndexedDb');
goog.require('goog.db.Transaction');


/**
 * The IndexedDB factory object.
 *
 * @type {IDBFactory}
 * @private
 */
goog.db.indexedDb_ = goog.global.indexedDB || goog.global.mozIndexedDB ||
    goog.global.webkitIndexedDB || goog.global.moz_indexedDB;


/**
 * A callback that's called if a blocked event is received. When a database is
 * supposed to be deleted or upgraded (i.e. versionchange), and there are open
 * connections to this database, a block event will be fired to prevent the
 * operations from going through until all such open connections are closed.
 * This callback can be used to notify users that they should close other tabs
 * that have open connections, or to close the connections manually. Databases
 * can also listen for the {@link goog.db.IndexedDb.EventType.VERSION_CHANGE}
 * event to automatically close themselves when they're blocking such
 * operations.
 *
 * This is passed a VersionChangeEvent that has the version of the database
 * before it was deleted, and "null" as the new version.
 *
 * @typedef {function(!goog.db.IndexedDb.VersionChangeEvent)}
 */
goog.db.BlockedCallback;


/**
 * A callback that's called when opening a database whose internal version is
 * lower than the version passed to {@link goog.db.openDatabase}.
 *
 * This callback is passed three arguments: a VersionChangeEvent with both the
 * old version and the new version of the database; the database that's being
 * opened, for which you can create and delete object stores; and the version
 * change transaction, with which you can abort the version change.
 *
 * Note that the transaction is not active, which means that it can't be used to
 * make changes to the database. However, since there is a transaction running,
 * you can't create another one via {@link goog.db.IndexedDb.createTransaction}.
 * This means that it's not possible to manipulate the database other than
 * creating or removing object stores in this callback.
 *
 * @typedef {function(!goog.db.IndexedDb.VersionChangeEvent,
 *                    !goog.db.IndexedDb,
 *                    !goog.db.Transaction)}
 */
goog.db.UpgradeNeededCallback;


/**
 * Opens a database connection and wraps it.
 *
 * @param {string} name The name of the database to open.
 * @param {number=} opt_version The expected version of the database. If this is
 *     larger than the actual version, opt_onUpgradeNeeded will be called
 *     (possibly after opt_onBlocked; see {@link goog.db.BlockedCallback}). If
 *     this is passed, opt_onUpgradeNeeded must be passed as well.
 * @param {goog.db.UpgradeNeededCallback=} opt_onUpgradeNeeded Called if
 *     opt_version is greater than the old version of the database. If
 *     opt_version is passed, this must be passed as well.
 * @param {goog.db.BlockedCallback=} opt_onBlocked Called if there are active
 *     connections to the database.
 * @return {!goog.async.Deferred} The deferred database object.
 */
goog.db.openDatabase = function(
    name, opt_version, opt_onUpgradeNeeded, opt_onBlocked) {
  goog.asserts.assert(
      goog.isDef(opt_version) == goog.isDef(opt_onUpgradeNeeded),
      'opt_version must be passed to goog.db.openDatabase if and only if ' +
          'opt_onUpgradeNeeded is also passed');

  var d = new goog.async.Deferred();
  var openRequest = opt_version ? goog.db.indexedDb_.open(name, opt_version) :
                                  goog.db.indexedDb_.open(name);
  openRequest.onsuccess = function(ev) {
    var db = new goog.db.IndexedDb(ev.target.result);
    d.callback(db);
  };
  openRequest.onerror = function(ev) {
    var msg = 'opening database ' + name;
    d.errback(goog.db.Error.fromRequest(ev.target, msg));
  };
  openRequest.onupgradeneeded = function(ev) {
    if (!opt_onUpgradeNeeded) return;
    var db = new goog.db.IndexedDb(ev.target.result);
    opt_onUpgradeNeeded(
        new goog.db.IndexedDb.VersionChangeEvent(ev.oldVersion, ev.newVersion),
        db, new goog.db.Transaction(ev.target.transaction, db));
  };
  openRequest.onblocked = function(ev) {
    if (opt_onBlocked) {
      opt_onBlocked(
          new goog.db.IndexedDb.VersionChangeEvent(
              ev.oldVersion, ev.newVersion));
    }
  };
  return d;
};


/**
 * Deletes a database once all open connections have been closed.
 *
 * @param {string} name The name of the database to delete.
 * @param {goog.db.BlockedCallback=} opt_onBlocked Called if there are active
 *     connections to the database.
 * @return {!goog.async.Deferred} A deferred object that will fire once the
 *     database is deleted.
 */
goog.db.deleteDatabase = function(name, opt_onBlocked) {
  var d = new goog.async.Deferred();
  var deleteRequest = goog.db.indexedDb_.deleteDatabase(name);
  deleteRequest.onsuccess = function(ev) { d.callback(); };
  deleteRequest.onerror = function(ev) {
    var msg = 'deleting database ' + name;
    d.errback(goog.db.Error.fromRequest(ev.target, msg));
  };
  deleteRequest.onblocked = function(ev) {
    if (opt_onBlocked) {
      opt_onBlocked(
          new goog.db.IndexedDb.VersionChangeEvent(
              ev.oldVersion, ev.newVersion));
    }
  };
  return d;
};
