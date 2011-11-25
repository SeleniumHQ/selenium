// Copyright 2008 The Closure Library Authors. All Rights Reserved.
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
 * @fileoverview This file implements a store for goog.debug.Logger data.
 */

goog.provide('goog.gears.LogStore');
goog.provide('goog.gears.LogStore.Query');

goog.require('goog.async.Delay');
goog.require('goog.debug.LogManager');
goog.require('goog.debug.LogRecord');
goog.require('goog.debug.Logger');
goog.require('goog.debug.Logger.Level');
goog.require('goog.gears.BaseStore');
goog.require('goog.gears.BaseStore.SchemaType');
goog.require('goog.json');



/**
 * Implements a store for goog.debug.Logger data.
 * @param {goog.gears.Database} database Database.
 * @param {?string=} opt_tableName Name of logging table to use.
 * @extends {goog.gears.BaseStore}
 * @constructor
 */
goog.gears.LogStore = function(database, opt_tableName) {
  goog.gears.BaseStore.call(this, database);

  /**
   * Name of log table.
   * @type {string}
   */
  var tableName = opt_tableName || goog.gears.LogStore.DEFAULT_TABLE_NAME_;
  this.tableName_ = tableName;

  // Override BaseStore schema attribute.
  this.schema = [
    {
      type: goog.gears.BaseStore.SchemaType.TABLE,
      name: tableName,
      columns: [
        // Unique ID.
        'id INTEGER PRIMARY KEY AUTOINCREMENT',
        // Timestamp.
        'millis BIGINT',
        // #goog.debug.Logger.Level value.
        'level INTEGER',
        // Message.
        'msg TEXT',
        // Name of logger object.
        'logger TEXT',
        // Serialized error object.
        'exception TEXT',
        // Full exception text.
        'exceptionText TEXT'
      ]
    },
    {
      type: goog.gears.BaseStore.SchemaType.INDEX,
      name: tableName + 'MillisIndex',
      isUnique: false,
      tableName: tableName,
      columns: ['millis']
    },
    {
      type: goog.gears.BaseStore.SchemaType.INDEX,
      name: tableName + 'LevelIndex',
      isUnique: false,
      tableName: tableName,
      columns: ['level']
    }
  ];

  /**
   * Buffered log records not yet flushed to DB.
   * @type {Array.<goog.debug.LogRecord>}
   * @private
   */
  this.records_ = [];

  /**
   * Save the publish handler so it can be removed.
   * @type {Function}
   * @private
   */
  this.publishHandler_ = goog.bind(this.addLogRecord, this);
};
goog.inherits(goog.gears.LogStore, goog.gears.BaseStore);


/** @override */
goog.gears.LogStore.prototype.version = 1;


/**
 * Whether we are currently capturing logger output.
 * @type {boolean}
 * @private
 */
goog.gears.LogStore.prototype.isCapturing_ = false;


/**
 * Size of buffered log data messages.
 * @type {number}
 * @private
 */
goog.gears.LogStore.prototype.bufferSize_ = 0;


/**
 * Scheduler for pruning action.
 * @type {goog.async.Delay?}
 * @private
 */
goog.gears.LogStore.prototype.delay_ = null;


/**
 * Use this to protect against recursive flushing.
 * @type {boolean}
 * @private
 */
goog.gears.LogStore.prototype.isFlushing_ = false;


/**
 * Logger.
 * @type {goog.debug.Logger}
 * @private
 */
goog.gears.LogStore.prototype.logger_ =
    goog.debug.Logger.getLogger('goog.gears.LogStore');


/**
  * Default value for how many records we keep when pruning.
  * @type {number}
  * @private
  */
goog.gears.LogStore.DEFAULT_PRUNE_KEEPER_COUNT_ = 1000;


/**
  * Default value for how often to auto-prune (10 minutes).
  * @type {number}
  * @private
  */
goog.gears.LogStore.DEFAULT_AUTOPRUNE_INTERVAL_MILLIS_ = 10 * 60 * 1000;


/**
  * The name for the log table.
  * @type {string}
  * @private
  */
goog.gears.LogStore.DEFAULT_TABLE_NAME_ = 'GoogGearsDebugLogStore';


/**
  * Max message bytes to buffer before flushing to database.
  * @type {number}
  * @private
  */
goog.gears.LogStore.MAX_BUFFER_BYTES_ = 200000;


/**
 * Flush buffered log records.
 */
goog.gears.LogStore.prototype.flush = function() {
  if (this.isFlushing_ || !this.getDatabaseInternal()) {
    return;
  }
  this.isFlushing_ = true;

  // Grab local copy of records so database can log during this process.
  this.logger_.info('flushing ' + this.records_.length + ' records');
  var records = this.records_;
  this.records_ = [];

  for (var i = 0; i < records.length; i++) {
    var record = records[i];
    var exception = record.getException();
    var serializedException = exception ? goog.json.serialize(exception) : '';
    var statement = 'INSERT INTO ' + this.tableName_ +
        ' (millis, level, msg, logger, exception, exceptionText)' +
        ' VALUES (?, ?, ?, ?, ?, ?)';
    this.getDatabaseInternal().execute(statement,
        record.getMillis(), record.getLevel().value, record.getMessage(),
        record.getLoggerName(), serializedException,
        record.getExceptionText() || '');
  }

  this.isFlushing_ = false;
};


/**
 * Create new delay object for auto-pruning. Does not stop or
 * start auto-pruning, call #startAutoPrune and #startAutoPrune for that.
 * @param {?number=} opt_count Number of records of recent hitory to keep.
 * @param {?number=} opt_interval Milliseconds to wait before next pruning.
 */
goog.gears.LogStore.prototype.createAutoPruneDelay = function(
    opt_count, opt_interval) {
  if (this.delay_) {
    this.delay_.dispose();
    this.delay_ = null;
  }
  var interval = typeof opt_interval == 'number' ?
      opt_interval : goog.gears.LogStore.DEFAULT_AUTOPRUNE_INTERVAL_MILLIS_;
  var listener = goog.bind(this.autoPrune_, this, opt_count);
  this.delay_ = new goog.async.Delay(listener, interval);
};


/**
 * Enable periodic pruning. As a side effect, this also flushes the memory
 * buffer.
 */
goog.gears.LogStore.prototype.startAutoPrune = function() {
  if (!this.delay_) {
    this.createAutoPruneDelay(
        goog.gears.LogStore.DEFAULT_PRUNE_KEEPER_COUNT_,
        goog.gears.LogStore.DEFAULT_AUTOPRUNE_INTERVAL_MILLIS_);
  }
  this.delay_.fire();
};


/**
 * Disable scheduled pruning.
 */
goog.gears.LogStore.prototype.stopAutoPrune = function() {
  if (this.delay_) {
    this.delay_.stop();
  }
};


/**
 * @return {boolean} True iff auto prune timer is active.
 */
goog.gears.LogStore.prototype.isAutoPruneActive = function() {
  return !!this.delay_ && this.delay_.isActive();
};


/**
 * Prune, and schedule next pruning.
 * @param {?number=} opt_count Number of records of recent hitory to keep.
 * @private
 */
goog.gears.LogStore.prototype.autoPrune_ = function(opt_count) {
  this.pruneBeforeCount(opt_count);
  this.delay_.start();
};


/**
 * Keep some number of most recent log records and delete all older ones.
 * @param {?number=} opt_count Number of records of recent history to keep. If
 *     unspecified, we use #goog.gears.LogStore.DEFAULT_PRUNE_KEEPER_COUNT_.
 *     Pass in 0 to delete all log records.
 */
goog.gears.LogStore.prototype.pruneBeforeCount = function(opt_count) {
  if (!this.getDatabaseInternal()) {
    return;
  }
  var count = typeof opt_count == 'number' ?
      opt_count : goog.gears.LogStore.DEFAULT_PRUNE_KEEPER_COUNT_;
  this.logger_.info('pruning before ' + count + ' records ago');
  this.flush();
  this.getDatabaseInternal().execute('DELETE FROM ' + this.tableName_ +
      ' WHERE id <= ((SELECT MAX(id) FROM ' + this.tableName_ + ') - ?)',
      count);
};


/**
 * Delete log record #id and all older records.
 * @param {number} sequenceNumber ID before which we delete all records.
 */
goog.gears.LogStore.prototype.pruneBeforeSequenceNumber =
    function(sequenceNumber) {
  if (!this.getDatabaseInternal()) {
    return;
  }
  this.logger_.info('pruning before sequence number ' + sequenceNumber);
  this.flush();
  this.getDatabaseInternal().execute(
      'DELETE FROM ' + this.tableName_ + ' WHERE id <= ?',
      sequenceNumber);
};


/**
 * Whether we are currently capturing logger output.
 * @return {boolean} Whether we are currently capturing logger output.
 */
goog.gears.LogStore.prototype.isCapturing = function() {
  return this.isCapturing_;
};


/**
 * Sets whether we are currently capturing logger output.
 * @param {boolean} capturing Whether to capture logger output.
 */
goog.gears.LogStore.prototype.setCapturing = function(capturing) {
  if (capturing != this.isCapturing_) {
    this.isCapturing_ = capturing;

    // Attach or detach handler from the root logger.
    var rootLogger = goog.debug.LogManager.getRoot();
    if (capturing) {
      rootLogger.addHandler(this.publishHandler_);
      this.logger_.info('enabled');
    } else {
      this.logger_.info('disabling');
      rootLogger.removeHandler(this.publishHandler_);
    }
  }
};


/**
 * Adds a log record.
 * @param {goog.debug.LogRecord} logRecord the LogRecord.
 */
goog.gears.LogStore.prototype.addLogRecord = function(logRecord) {
  this.records_.push(logRecord);
  this.bufferSize_ += logRecord.getMessage().length;
  var exceptionText = logRecord.getExceptionText();
  if (exceptionText) {
    this.bufferSize_ += exceptionText.length;
  }
  if (this.bufferSize_ >= goog.gears.LogStore.MAX_BUFFER_BYTES_) {
    this.flush();
  }
};


/**
 * Select log records.
 * @param {goog.gears.LogStore.Query} query Query object.
 * @return {Array.<goog.debug.LogRecord>} Selected logs in descending
 *     order of creation time.
 */
goog.gears.LogStore.prototype.select = function(query) {
  if (!this.getDatabaseInternal()) {
    // This should only occur if we've been disposed.
    return [];
  }
  this.flush();

  // TODO(user) Perhaps have Query object build this SQL string so we can
  // omit unneeded WHERE clauses.
  var statement =
      'SELECT id, millis, level, msg, logger, exception, exceptionText' +
      ' FROM ' + this.tableName_ +
      ' WHERE level >= ? AND millis >= ? AND millis <= ?' +
      ' AND msg like ? and logger like ?' +
      ' ORDER BY id DESC LIMIT ?';
  var rows = this.getDatabaseInternal().queryObjectArray(statement,
      query.level.value, query.minMillis, query.maxMillis,
      query.msgLike, query.loggerLike, query.limit);

  var result = Array(rows.length);
  for (var i = rows.length - 1; i >= 0; i--) {
    var row = rows[i];

    // Parse fields, allowing for invalid values.
    var sequenceNumber = Number(row['id']) || 0;
    var level = goog.debug.Logger.Level.getPredefinedLevelByValue(
        Number(row['level']) || 0);
    var msg = row['msg'] || '';
    var loggerName = row['logger'] || '';
    var millis = Number(row['millis']) || 0;
    var serializedException = row['exception'];
    var exception = serializedException ?
        goog.json.parse(serializedException) : null;
    var exceptionText = row['exceptionText'] || '';

    // Create record.
    var record = new goog.debug.LogRecord(level, msg, loggerName,
        millis, sequenceNumber);
    if (exception) {
      record.setException(exception);
      record.setExceptionText(exceptionText);
    }

    result[i] = record;
  }
  return result;
};


/** @override */
goog.gears.LogStore.prototype.disposeInternal = function() {
  this.flush();

  goog.gears.LogStore.superClass_.disposeInternal.call(this);

  if (this.delay_) {
    this.delay_.dispose();
    this.delay_ = null;
  }
};



/**
 * Query to select log records.
 * @constructor
 */
goog.gears.LogStore.Query = function() {
};


/**
 * Minimum logging level.
 * @type {goog.debug.Logger.Level}
 */
goog.gears.LogStore.Query.prototype.level = goog.debug.Logger.Level.ALL;


/**
 * Minimum timestamp, inclusive.
 * @type {number}
 */
goog.gears.LogStore.Query.prototype.minMillis = -1;


/**
 * Maximum timestamp, inclusive.
 * @type {number}
 */
goog.gears.LogStore.Query.prototype.maxMillis = Infinity;


/**
 * Message 'like' pattern.
 * See http://www.sqlite.org/lang_expr.html#likeFunc for 'like' syntax.
 * @type {string}
 */
goog.gears.LogStore.Query.prototype.msgLike = '%';


/**
 * Logger name 'like' pattern.
 * See http://www.sqlite.org/lang_expr.html#likeFunc for 'like' syntax.
 * @type {string}
 */
goog.gears.LogStore.Query.prototype.loggerLike = '%';


/**
 * Max # recent records to return. -1 means no limit.
 * @type {number}
 */
goog.gears.LogStore.Query.prototype.limit = -1;
