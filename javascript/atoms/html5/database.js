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
 * @fileoverview Atoms for executing SQL queries on web client database.
 *
 */

goog.provide('bot.storage.database');
goog.provide('bot.storage.database.ResultSet');

goog.require('bot');
goog.require('bot.Error');
goog.require('bot.ErrorCode');


/**
 * Opens the database to access its contents. This function will create the
 * database if it does not exist. For details,
 * @see http://www.w3.org/TR/webdatabase/#databases
 *
 * @param {string} databaseName The name of the database.
 * @param {string=} opt_version The expected database version to be opened;
 *     defaults to the empty string.
 * @param {string=} opt_displayName The name to be displayed to the user;
 *     defaults to the databaseName.
 * @param {number=} opt_size The estimated initial quota size of the database;
 *     default value is 5MB.
 * @param {!Window=} opt_window The window associated with the database;
 *     defaults to the main window.
 * @return {!Database} The object to access the web database.
 *
 */
bot.storage.database.openOrCreate = function(databaseName, opt_version,
    opt_displayName, opt_size, opt_window) {
  var version = opt_version || '';
  var displayName = opt_displayName || (databaseName + 'name');
  var size = opt_size || 5 * 1024 * 1024;
  var win = opt_window || bot.getWindow();

  return win.openDatabase(databaseName, version, displayName, size);
};


/**
 * It executes a single SQL query on a given web database storage.
 *
 * @param {string} databaseName The name of the database.
 * @param {string} query The SQL statement.
 * @param {!Array.<*>} args Arguments needed for the SQL statement.
 * @param {!function(!SQLTransaction, !bot.storage.database.ResultSet)}
 *     queryResultCallback Callback function to be invoked on successful query
 *     statement execution.
 * @param {!function(!SQLError)} txErrorCallback
 *     Callback function to be invoked on transaction (commit) failure.
 * @param {!function()=} opt_txSuccessCallback
 *     Callback function to be invoked on successful transaction execution.
 * @param {function(!SQLTransaction, !SQLError)=} opt_queryErrorCallback
 *     Callback function to be invoked on successful query statement execution.
 * @see http://www.w3.org/TR/webdatabase/#executing-sql-statements
 */
bot.storage.database.executeSql = function(databaseName, query, args,
    queryResultCallback, txErrorCallback, opt_txSuccessCallback,
    opt_queryErrorCallback) {

  var db;

  try {
    db = bot.storage.database.openOrCreate(databaseName);
  } catch (e) {
    throw new bot.Error(bot.ErrorCode.UNKNOWN_ERROR, e.message);
  }

  var queryCallback = function(tx, result) {
    var wrappedResult = new bot.storage.database.ResultSet(result);
    queryResultCallback(tx, wrappedResult);
  };

  var transactionCallback = function(tx) {
    tx.executeSql(query, args, queryCallback, opt_queryErrorCallback);
  };

  db.transaction(transactionCallback, txErrorCallback,
      opt_txSuccessCallback);
};



/**
 * A wrapper of the SQLResultSet object returned by the SQL statement.
 *
 * @param {!SQLResultSet} sqlResultSet The original SQLResultSet object.
 * @constructor
 */
bot.storage.database.ResultSet = function(sqlResultSet) {

  /**
   * The database rows retuned from the SQL query.
   * @type {!Array.<*>}
   */
  this.rows = [];
  for (var i = 0; i < sqlResultSet.rows.length; i++) {
    this.rows[i] = sqlResultSet.rows.item(i);
  }

  /**
   * The number of rows that were changed by the SQL statement
   * @type {number}
   */
  this.rowsAffected = sqlResultSet.rowsAffected;

  /**
   * The row ID of the row that the SQLResultSet object's SQL statement
   * inserted into the database, if the statement inserted a row; else
   * it is assigned to -1. Originally, accessing insertId attribute of
   * a SQLResultSet object returns the exception INVALID_ACCESS_ERR
   * if no rows are inserted.
   * @type {number}
   */
  this.insertId = -1;
  try {
    this.insertId = sqlResultSet.insertId;
  } catch (error) {
    // If accessing sqlResultSet.insertId results in INVALID_ACCESS_ERR
    // exception, this.insertId will be assigned to -1.
  }
};
