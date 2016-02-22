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
 * @fileoverview Defines the LogDb class, which manages the logging Web SQL
 * database.
 */

goog.provide('safaridriver.extension.LogDb');

goog.require('goog.log');
goog.require('goog.object');
goog.require('webdriver.logging');
goog.require('webdriver.promise');


/**
 * Manages the logging database.
 * @param {boolean=} opt_noReset Whether to skip resetting the database and
 *     removing all logging entries.
 * @throws {Error} If the logging database cannot be opened.
 * @constructor
 */
safaridriver.extension.LogDb = function(opt_noReset) {

  /** @private {goog.log.Logger} */
  this.log_ = goog.log.getLogger('safaridriver.extension.LogDb');

  /**
   * Buffered log entries that have not been committed to the database yet.
   * @private {!Array.<!webdriver.logging.Entry>}
   */
  this.buffer_ = [];

  var db = openDatabase(
      safaridriver.extension.LogDb.NAME_,
      safaridriver.extension.LogDb.VERSION_,
      safaridriver.extension.LogDb.DISPLAY_NAME_,
      safaridriver.extension.LogDb.MAX_SIZE_);

  if (!db) {
    throw Error('Failed to open log database');
  }

  /** @private {!Database} */
  this.db_ = /** @type {!Database} */ (db);

  /** @private {!webdriver.promise.Promise} */
  this.ready_ = this.transaction_(function(tx) {
    if (!opt_noReset) {
      tx.executeSql('DROP TABLE IF EXISTS logs;');
    }
    tx.executeSql(
        'CREATE TABLE IF NOT EXISTS logs ' +
        '(type TEXT, level NUMBER, message TEXT, time NUMBER);');
  });

  /** @private {!Object.<string, !webdriver.logging.Level>} */
  this.prefs_ = {};
};
goog.addSingletonGetter(safaridriver.extension.LogDb);


/**
 * The log database name.
 * @private {string}
 * @const
 */
safaridriver.extension.LogDb.NAME_ = 'safaridriver.logs';


/**
 * The database schema version
 * @private {string}
 * @const
 */
safaridriver.extension.LogDb.VERSION_ = '1.0';


/**
 * The database display name.
 * @private {string}
 * @const
 */
safaridriver.extension.LogDb.DISPLAY_NAME_ = 'SafariDriver Logs';


/**
 * The maximum database size, in MB.
 * @private {number}
 * @const
 */
safaridriver.extension.LogDb.MAX_SIZE_ = 1024 * 1024 * 16;


/**
 * How many log entries to buffer before committing to the database. This is
 * used to reduce the number of SQL transactions that must be creatd.
 * @private {number}
 * @const
 */
safaridriver.extension.LogDb.BUFFER_SIZE_ = 200;


/**
 * Sets the logging preferences. For each log type, only messages logged at the
 * registered level or higher will be saved. All messages will be saved for an
 * individual type if no preferences are specified.
 * @param {!Object.<string, !webdriver.logging.Level>} prefs The desired logging
 *     preferences.
 */
safaridriver.extension.LogDb.prototype.setPreferences = function(prefs) {
  this.prefs_ = prefs;

  // Prune existing entries logged below the desired level. This is necessary
  // since the driver logs during start up before preferences are set by the
  // user.
  var self = this;
  this.buffer_ = this.buffer_.filter(function(entry) {
    var level = self.prefs_[entry.type];
    return !level || entry.level.value >= level.value;
  });

  this.transaction_(function(tx) {
    goog.object.forEach(self.prefs_, function(minLevel, type) {
      tx.executeSql(
          'DELETE FROM logs WHERE type = ? and level < ?',
          [type, minLevel.value]);
    });
  });
};


/**
 * Executes a transaction.
 * @param {!function(SQLTransaction)} fn The transaction function.
 * @param {boolean=} opt_readonly Whether to execute a read-only transaction.
 * @return {!webdriver.promise.Promise} A promise that will resolve when the
 *     transaction has completed. Transaction failures will be logged, but
 *     never propagated to this promise (the promise will never be
 *     rejected).
 * @private
 */
safaridriver.extension.LogDb.prototype.transaction_ = function(
    fn, opt_readonly) {
  var log = this.log_;
  var d = webdriver.promise.defer();
  var onError = function(error) {
    goog.log.warning(log, 'SQL transaction failed', error);
    d.fulfill();
  };

  if (opt_readonly) {
    this.db_.readTransaction(fn, onError, d.fulfill);
  } else {
    this.db_.transaction(fn, onError, d.fulfill);
  }
  return d.promise;
};


/**
 * @return {!webdriver.promise.Promise} A promise that will resolve when the
 *     logging database has initialized.
 */
safaridriver.extension.LogDb.prototype.isReady = function() {
  return this.ready_;
};


/**
 * Saves a list of entries to the DB.
 * @param {!Array.<!webdriver.logging.Entry>} entries The entries to save.
 */
safaridriver.extension.LogDb.prototype.save = function(entries) {
  var self = this;
  entries = entries.filter(function(entry) {
    var level = self.prefs_[entry.type];
    return !level || entry.level.value >= level.value;
  });

  this.buffer_ = this.buffer_.concat(entries);
  if (this.buffer_.length >= safaridriver.extension.LogDb.BUFFER_SIZE_) {
    this.transaction_(function(tx) {
      self.buffer_.forEach(function(entry) {
        tx.executeSql(
            'INSERT INTO logs (type, level, message, time) VALUES (?,?,?,?);',
            [entry.type, entry.level.value, entry.message, entry.timestamp]);
      });
      self.buffer_ = [];
    });
  }
};


/**
 * Retrieves logs from the database.
 * @param {string=} opt_type The log type to fetch. If omitted, all records
 *     will be retrieved.
 * @param {boolean=} opt_prune Whether to prune all entries from the cache
 *     upon retrieval.
 * @return {!webdriver.promise.Promise.<!Array.<!webdriver.logging.Entry>>} A
 *     promise that will be resolved with a list of log entries.
 */
safaridriver.extension.LogDb.prototype.get = function(opt_type, opt_prune) {
  var readonly = !opt_prune;
  var d = webdriver.promise.defer();

  var bufferedEntries = [];
  var remainingEntries = [];
  this.buffer_.forEach(function(entry) {
    if (!opt_type || entry.type === opt_type) {
      bufferedEntries.push(entry);
    } else {
      remainingEntries.push(entry);
    }
  });

  if (opt_prune) {
    this.buffer_ = remainingEntries;
  }

  var self = this;
  this.transaction_(function(tx) {
    var sql = 'SELECT type, level, message, time FROM logs';
    var args = [];
    if (opt_type) {
      sql += ' WHERE type = ?';
      args.push(opt_type);
    }
    sql += ' ORDER BY time ASC';

    tx.executeSql(sql, args, function(tx, result) {
      var entries = [];
      for (var i = 0, n = result.rows.length; i < n; ++i) {
        var row = result.rows.item(i);
        entries.push(new webdriver.logging.Entry(
            /** @type {string} */ (row['level']),
            /** @type {string} */ (row['message']),
            /** @type {number} */ (row['time']),
            /** @type {string} */ (row['type'])));
      }
      // Assume buffered entries are in sorted order and all occur
      // after those in the DB (otherwise they would already have been
      // committed.
      d.fulfill(entries.concat(bufferedEntries));
    }, function(tx, error) {
      d.reject(error);
    });

    if (opt_prune) {
      self.remove_(tx, opt_type);
    }
  }, readonly);
  return d.promise;
};


/**
 * Removes all logs entries of the specified type.
 * @param {!SQLTransaction} tx The transaction to use.
 * @param {string=} opt_type The type of log to remove.
 * @param {webdriver.logging.Level=} opt_level The minimum level for all
 *     preserved entries.
 * @private
 */
safaridriver.extension.LogDb.prototype.remove_ = function(
    tx, opt_type, opt_level) {
  var sql = 'DELETE FROM logs';
  var where = [];
  var args = [];
  if (opt_type) {
    where.push('type = ?');
    args.push(opt_type);
  }
  if (opt_level) {
    where.push('level < ?');
    args.push(opt_level.value);
  }
  if (where.length) {
    sql += ' WHERE ' + where.join(' and ');
  }
  sql += ';';
  var log = this.log_;
  tx.executeSql(sql, args, undefined, function(tx, error) {
    // SQLError does not extend Error, so the closure compiler will not let
    // us pass it as the second parameter to this logging call. Work around
    // by adding the details to the failure message.
    goog.log.warning(log,
        'Failed to prune entries from DB: (' + error.code + ') ' +
        error.message);
  });
};
