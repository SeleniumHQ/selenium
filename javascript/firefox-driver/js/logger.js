// Copyright 2012 Software Freedom Conservancy
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/** @fileoverview Defines Loggers for the Firefox driver. */

goog.provide('fxdriver.logging.Logger');
goog.provide('fxdriver.logging.Loggers');
goog.provide('fxdriver.logging.LogEntry');
goog.provide('fxdriver.logging.LogLevel');
goog.provide('fxdriver.logging.LogType');

goog.require('fxdriver.files.File');
goog.require('goog.array');
goog.require('goog.object');

/**
 * A single log entry.
 * @constructor
 * @param {number} timestamp
 * @param {!fxdriver.logging.LogLevel} level
 * @param {string} message
 */
fxdriver.logging.LogEntry = function(level, message) {
  /** @type {number} */
  this.timestamp = new Date().getTime();

  /** @type {!LogLevel} */
  this.level = level;

  /** @type {string} */
  this.message = message;
};


/**
 * A logger for a single type of log message.
 * @constructor
 */
fxdriver.logging.Logger = function() {
  /**
   * Temporary file containing log entries as per-line JSON-stringified
   * fxdriver.logger.LogEntry-s.
   * @type {!fxdriver.files.File}
   * @private
   */
  this.logFile_ = fxdriver.files.createTempFile('log', '.txt');
};

/**
 * Logs message to the logger.
 * @param {!fxdriver.logging.LogLevel} level
 * @param {*} message
 */
fxdriver.logging.Logger.prototype.log = function(level, message) {
  if (typeof(message) != 'string') {
    message = JSON.stringify(message);
  }
  var logEntry = JSON.stringify(new fxdriver.logging.LogEntry(level.name, message));
  logEntry = logEntry.replace(/\n/g, '');
  this.logFile_.append(logEntry + '\n');
};

/**
 * Gets the log entries.
 * @return {!Array<!fxdriver.logging.LogEntry>>} All logged entries.
 */
fxdriver.logging.Logger.prototype.getLog = function() {
  var file = this.logFile_.read().trim().split('\n').join(',\n');
  return JSON.parse('[' + file + ']');
};


/**
 * A set of loggers, each logging a different log type.
 * @constructor
 */
fxdriver.logging.Loggers = function() {
  /**
   * type {!Object.<string, !fxdriver.logging.Logger>}
   * @private
   */
  this.loggers_ = {};

  /**
   * type {!Array.<string>}
   * @private
   */
  this.logTypesToIgnore_ = [];
}

/**
 * Turns any subsequent calls to log with the passed logType in to no-ops.
 *
 * @param {string} logType to ignore.
 */
fxdriver.logging.Loggers.prototype.ignoreLogType = function(logType) {
  this.logTypesToIgnore_.push(logType);
};

/**
 * Log message of type logType.
 * @param {*} message
 * @param {!fxdriver.logging.LogLevel} level
 * @param {string} logType
 */
fxdriver.logging.Loggers.prototype.log = function(message, level, logType) {
  if (goog.array.contains(this.logTypesToIgnore_, logType)) {
    return;
  }
  if (!this.loggers_[logType]) {
    this.loggers_[logType] = new fxdriver.logging.Logger();
  }
  this.loggers_[logType].log(level, message);
};

/**
 * Get log for a given log type.
 *
 * @param {string} logType The log type.
 * @return {!Array<!fxdriver.logging.LogEntry>>} Log entries for the type.
 */
fxdriver.logging.Loggers.prototype.getLog = function(logType) {
  if (logType in this.loggers_) {
    return this.loggers_[logType].getLog();
  }
  return [];
};

/**
 * Get available log types.
 *
 * @return {!Array.<String>} Available log types.
 */
fxdriver.logging.Loggers.prototype.getAvailableLogTypes = function() {
  var result = [];
  var index = 0;
  var logTypesToIgnore = this.logTypesToIgnore_;
  goog.object.forEach(fxdriver.logging.LogType, function(value, key) {
    if (!goog.object.containsValue(logTypesToIgnore, value)) {
      result[index++] = value;
    }
  });
  return result;
};


/**
 * Logging levels.
 * @enum {{number,string}}
 */
fxdriver.logging.LogLevel = {
  ALL: { value: -Math.pow(2, 31), name: 'ALL' },
  DEBUG: { value: 500, name: 'DEBUG' },
  INFO: { value: 800, name: 'INFO' },
  WARNING: { value: 900, name: 'WARNING' },
  SEVERE: { value: 1000, name: 'SEVERE' },
  OFF: { value: Math.pow(2, 31) - 1, name: 'OFF' }
};


/**
 * Types of logs.
 * @enum {string}
 */
fxdriver.logging.LogType = {
  BROWSER: 'browser',
  DRIVER: 'driver',
  PROFILER: 'profiler'
};
