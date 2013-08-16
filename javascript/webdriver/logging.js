// Copyright 2013 Selenium comitters
// Copyright 2013 Software Freedom Conservancy
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

goog.provide('webdriver.logging');
goog.provide('webdriver.logging.Preferences');

goog.require('goog.object');


/**
 * Log level names from WebDriver's JSON wire protocol.
 * @enum {string}
 */
webdriver.logging.LevelName = {
  ALL: 'ALL',
  DEBUG: 'DEBUG',
  INFO: 'INFO',
  WARNING: 'WARNING',
  SEVERE: 'SEVERE',
  OFF: 'OFF'
};


/**
 * Logging levels.
 * @enum {{value: number, name: webdriver.logging.LevelName}}
 */
webdriver.logging.Level = {
  ALL: {value: Number.MIN_VALUE, name: webdriver.logging.LevelName.ALL},
  DEBUG: {value: 700, name: webdriver.logging.LevelName.DEBUG},
  INFO: {value: 800, name: webdriver.logging.LevelName.INFO},
  WARNING: {value: 900, name: webdriver.logging.LevelName.WARNING},
  SEVERE: {value: 1000, name: webdriver.logging.LevelName.SEVERE},
  OFF: {value: Number.MAX_VALUE, name: webdriver.logging.LevelName.OFF}
};


/**
 * Converts a level name or value to a {@link webdriver.logging.Level} value.
 * If the name/value is not recognized, {@link webdriver.logging.Level.ALL}
 * will be returned.
 * @param {(number|string)} nameOrValue The log level name, or value, to
 *     convert .
 * @return {!webdriver.logging.Level} The converted level.
 */
webdriver.logging.getLevel = function(nameOrValue) {
  var predicate = goog.isString(nameOrValue) ?
      function(val) { return val.name === nameOrValue; } :
      function(val) { return val.value === nameOrValue; };

  return goog.object.findValue(webdriver.logging.Level, predicate) ||
      webdriver.logging.Level.ALL;
};


/**
 * Common log types.
 * @enum {string}
 */
webdriver.logging.Type = {
  /** Logs originating from the browser. */
  BROWSER: 'browser',
  /** Logs from a WebDriver client. */
  CLIENT: 'client',
  /** Logs from a WebDriver implementation. */
  DRIVER: 'driver',
  /** Logs related to performance. */
  PERFORMANCE: 'performance',
  /** Logs from the remote server. */
  SERVER: 'server'
};


/**
 * A hash describing log preferences.
 * @typedef {Object.<webdriver.logging.Type, webdriver.logging.LevelName>}
 */
webdriver.logging.Preferences;


/**
 * A single log entry.
 * @param {(!webdriver.logging.Level|string)} level The entry level.
 * @param {string} message The log message.
 * @param {number=} opt_timestamp The time this entry was generated, in
 *     milliseconds since 0:00:00, January 1, 1970 UTC. If omitted, the
 *     current time will be used.
 * @param {string=} opt_type The log type, if known.
 * @constructor
 */
webdriver.logging.Entry = function(level, message, opt_timestamp, opt_type) {

  /** @type {!webdriver.logging.Level} */
  this.level =
      goog.isString(level) ? webdriver.logging.getLevel(level) : level;

  /** @type {string} */
  this.message = message;

  /** @type {number} */
  this.timestamp = goog.isNumber(opt_timestamp) ? opt_timestamp : goog.now();

  /** @type {string} */
  this.type = opt_type || '';
};


/**
 * @return {{level: string, message: string, timestamp: number,
 *           type: string}} The JSON representation of this entry.
 */
webdriver.logging.Entry.prototype.toJSON = function() {
  return {
    'level': this.level.name,
    'message': this.message,
    'timestamp': this.timestamp,
    'type': this.type
  };
};


/**
 * Converts a {@link goog.debug.LogRecord} into a
 * {@link webdriver.logging.Entry}.
 * @param {!goog.debug.LogRecord} logRecord The record to convert.
 * @param {string=} opt_type The log type.
 * @return {!webdriver.logging.Entry} The converted entry.
 */
webdriver.logging.Entry.fromClosureLogRecord = function(logRecord, opt_type) {
  var closureLevel = logRecord.getLevel();
  var level = webdriver.logging.Level.SEVERE;

  if (closureLevel.value <= webdriver.logging.Level.DEBUG.value) {
    level = webdriver.logging.Level.DEBUG;
  } else if (closureLevel.value <= webdriver.logging.Level.INFO.value) {
    level = webdriver.logging.Level.INFO;
  } else if (closureLevel.value <= webdriver.logging.Level.WARNING.value) {
    level = webdriver.logging.Level.WARNING;
  }

  return new webdriver.logging.Entry(
      level,
      '[' + logRecord.getLoggerName() + '] ' + logRecord.getMessage(),
      logRecord.getMillis(),
      opt_type);
};
