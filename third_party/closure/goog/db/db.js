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
 * and has been tested on Chrome version 18+. Though they should work in theory,
 * the wrapper tests fail in strange, non-deterministic ways on Firefox 6,
 * unfortunately.
 *
 * Example usage:
 *
 *  <code>
 *  goog.db.openDatabase('mydb').addCallback(function(db) {
 *    return db.setVersion('1.0').addCallback(function(tx) {
 *      db.createObjectStore('mystore');
 *      // restart to see our structure changes
 *      return goog.db.openDatabase('mydb');
 *    });
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

goog.require('goog.async.Deferred');
goog.require('goog.db.Error');
goog.require('goog.db.IndexedDb');


/**
 * Opens a database connection and wraps it.
 *
 * @param {string} name The name of the database to open.
 * @return {!goog.async.Deferred} The deferred database object.
 */
goog.db.openDatabase = function(name) {
  var indexedDb = goog.global.indexedDB || goog.global.mozIndexedDB ||
      goog.global.webkitIndexedDB || goog.global.moz_indexedDB;

  var d = new goog.async.Deferred();
  var openRequest = indexedDb.open(name);
  openRequest.onsuccess = function(ev) {
    var db = new goog.db.IndexedDb(ev.target.result);
    d.callback(db);
  };
  openRequest.onerror = function(ev) {
    var msg = 'opening database ' + name;
    d.errback(new goog.db.Error(ev.target.code, msg));
  };
  return d;
};
