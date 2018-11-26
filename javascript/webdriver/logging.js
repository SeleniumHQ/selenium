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
 * @fileoverview Defines WebDriver's logging system. The logging system is
 * broken into major components: local and remote logging.
 *
 * The local logging API, which is anchored by the
 * {@link webdriver.logging.Logger Logger} class, is similar to Java's
 * logging API. Loggers, retrieved by {@link webdriver.logging.getLogger}, use
 * hierarchical, dot-delimited namespaces
 * (e.g. "" > "webdriver" > "webdriver.logging"). Recorded log messages are
 * represented by the {@link webdriver.logging.LogRecord LogRecord} class. You
 * can capture log records by
 * {@linkplain webdriver.logging.Logger#addHandler attaching} a handler function
 * to the desired logger. For convenience, you can quickly enable logging to
 * the console by simply calling
 * {@link webdriver.logging.installConsoleHandler()}.
 *
 * The [remote logging API](https://github.com/SeleniumHQ/selenium/wiki/Logging)
 * allows you to retrieve logs from a remote WebDriver server. This API uses the
 * {@link Preferences} class to define desired log levels prior to create a
 * WebDriver session:
 *
 *     var prefs = new webdriver.logging.Preferences();
 *     prefs.setLevel(webdriver.logging.Type.BROWSER,
 *                    webdriver.logging.Level.DEBUG);
 *
 *     var caps = webdriver.Capabilities.chrome();
 *     caps.setLoggingPrefs(prefs);
 *     // ...
 *
 * Remote log entries are represented by the {@link Entry} class and may be
 * retrieved via {@link webdriver.WebDriver.Logs}:
 *
 *     driver.manage().logs().get(webdriver.logging.Type.BROWSER)
 *         .then(function(entries) {
 *            entries.forEach(function(entry) {
 *              console.log('[%s] %s', entry.level.name, entry.message);
 *            });
 *         });
 *
 * **NOTE:** Only a few browsers support the remote logging API (notably
 * Firefox and Chrome). Firefox supports basic logging functionality, while
 * Chrome exposes robust
 * [performance logging](https://sites.google.com/a/chromium.org/chromedriver/logging)
 * options. Remote logging is still considered a non-standard feature, and the
 * APIs exposed by this module for it are non-frozen. Once logging is officially
 * defined by the [W3C WebDriver spec](http://www.w3.org/TR/webdriver/), this
 * module will be updated to use a consistent API for local and remote logging.
 */

goog.module('webdriver.logging');
goog.module.declareLegacyNamespace();

var LogManager = goog.require('goog.debug.LogManager');
var LogRecord = goog.require('goog.debug.LogRecord');
var Logger = goog.require('goog.debug.Logger');
var googString = goog.require('goog.string');

var padNumber = googString.padNumber;

/** @const */
exports.LogRecord = LogRecord;


/** @const */
exports.Logger = Logger;


/** @const */
exports.Level = Logger.Level;


/**
 * DEBUG is a message level for debugging messages and has the same log level
 * as the {@link Logger.Level.CONFIG} message level.
 * @const {!Logger.Level}
 */
Logger.Level.DEBUG = new Logger.Level('DEBUG', Logger.Level.CONFIG.value);


/**
 * Finds a named logger.
 *
 * @param {string=} opt_name The dot-delimited logger name, such as
 *     "webdriver.logging.Logger". Defaults to the name of the root logger.
 * @return {!Logger} The named logger.
 */
function getLogger(opt_name) {
  return LogManager.getLogger(opt_name || Logger.ROOT_LOGGER_NAME);
}
exports.getLogger = getLogger;


/**
 * Logs all messages to the Console API.
 */
function consoleHandler(record) {
  if (typeof console === 'undefined' || !console) {
    return;
  }
  record = /** @type {!LogRecord} */(record);
  var timestamp = new Date(record.getMillis());
  var msg =
      '[' + timestamp.getUTCFullYear() + '-' +
      padNumber(timestamp.getUTCMonth() + 1, 2) + '-' +
      padNumber(timestamp.getUTCDate(), 2) + 'T' +
      padNumber(timestamp.getUTCHours(), 2) + ':' +
      padNumber(timestamp.getUTCMinutes(), 2) + ':' +
      padNumber(timestamp.getUTCSeconds(), 2) + 'Z]' +
      '[' + record.getLevel().name + ']' +
      '[' + record.getLoggerName() + '] ' +
      record.getMessage();

  var level = record.getLevel().value;
  if (level >= Logger.Level.SEVERE.value) {
    console.error(msg);
  } else if (level >= Logger.Level.WARNING.value) {
    console.warn(msg);
  } else {
    console.log(msg);
  }
}


/**
 * Adds the console handler to the given logger. The console handler will log
 * all messages using the JavaScript Console API.
 *
 * @param {Logger=} opt_logger The logger to add the handler to; defaults
 *     to the root logger.
 * @see exports.removeConsoleHandler
 */
exports.addConsoleHandler = function(opt_logger) {
  var logger = opt_logger || getLogger();
  logger.addHandler(consoleHandler);
};


/**
 * Installs the console log handler on the root logger.
 * @see exports.addConsoleHandler
 */
exports.installConsoleHandler = function() {
  exports.addConsoleHandler();
};


/**
 * Removes the console log handler from the given logger.
 *
 * @param {Logger=} opt_logger The logger to remove the handler from; defaults
 *     to the root logger.
 * @see exports.addConsoleHandler
 */
exports.removeConsoleHandler = function(opt_logger) {
  var logger = opt_logger || getLogger();
  logger.removeHandler(consoleHandler);
};


/**
 * Converts a level name or value to a {@link webdriver.logging.Level} value.
 * If the name/value is not recognized, {@link webdriver.logging.Level.ALL}
 * will be returned.
 * @param {(number|string)} nameOrValue The log level name, or value, to
 *     convert .
 * @return {!Logger.Level} The converted level.
 */
function getLevel(nameOrValue) {
  // DEBUG is not a predefined Closure log level, but maps to CONFIG. Since
  // DEBUG is a predefined level for the WebDriver protocol, we prefer it over
  // CONFIG.
  if ('DEBUG' === nameOrValue || Logger.Level.DEBUG.value === nameOrValue) {
    return Logger.Level.DEBUG;
  } else if (goog.isString(nameOrValue)) {
    return Logger.Level.getPredefinedLevel(/** @type {string} */(nameOrValue))
        || Logger.Level.ALL;
  } else {
    return Logger.Level.getPredefinedLevelByValue(
        /** @type {number} */(nameOrValue)) || Logger.Level.ALL;
  }
}
exports.getLevel = getLevel;


/**
 * Normalizes a {@link Logger.Level} to one of the distinct values recognized
 * by WebDriver's wire protocol.
 * @param {!Logger.Level} level The input level.
 * @return {!Logger.Level} The normalized level.
 */
function normalizeLevel(level) {
  if (level.value <= Logger.Level.ALL.value) {          // ALL is 0.
    return Logger.Level.ALL;

  } else if (level.value === Logger.Level.OFF.value) {  // OFF is Infinity
    return Logger.Level.OFF;

  } else if (level.value < Logger.Level.INFO.value) {
    return Logger.Level.DEBUG;

  } else if (level.value < Logger.Level.WARNING.value) {
    return Logger.Level.INFO;

  } else if (level.value < Logger.Level.SEVERE.value) {
    return Logger.Level.WARNING;

  } else {
    return Logger.Level.SEVERE;
  }
}


/**
 * Common log types.
 * @enum {string}
 */
var Type = {
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
exports.Type = Type;


/**
 * Describes the log preferences for a WebDriver session.
 * @final
 */
var Preferences = goog.defineClass(null, {
  /** @constructor */
  constructor: function() {
    /** @private {!Object.<string, Logger.Level>} */
    this.prefs_ = {};
  },

  /**
   * Sets the desired logging level for a particular log type.
   * @param {(string|Type)} type The log type.
   * @param {!Logger.Level} level The desired log level.
   */
  setLevel: function(type, level) {
    this.prefs_[type] = normalizeLevel(level);
  },

  /**
   * Converts this instance to its JSON representation.
   * @return {!Object.<string, string>} The JSON representation of this set of
   *     preferences.
   */
  toJSON: function() {
    var obj = {};
    for (var type in this.prefs_) {
      if (this.prefs_.hasOwnProperty(type)) {
        obj[type] = this.prefs_[type].name;
      }
    }
    return obj;
  }
});
exports.Preferences = Preferences;


/**
 * A single log entry recorded by a WebDriver component, such as a remote
 * WebDriver server.
 * @final
 */
var Entry = goog.defineClass(null, {
  /**
   * @param {(!Logger.Level|string)} level The entry level.
   * @param {string} message The log message.
   * @param {number=} opt_timestamp The time this entry was generated, in
   *     milliseconds since 0:00:00, January 1, 1970 UTC. If omitted, the
   *     current time will be used.
   * @param {string=} opt_type The log type, if known.
   * @constructor
   */
  constructor: function(level, message, opt_timestamp, opt_type) {

    /** @type {!Logger.Level} */
    this.level = goog.isString(level) ? getLevel(level) : level;

    /** @type {string} */
    this.message = message;

    /** @type {number} */
    this.timestamp = goog.isNumber(opt_timestamp) ? opt_timestamp : goog.now();

    /** @type {string} */
    this.type = opt_type || '';
  },

  statics: {
    /**
     * Converts a {@link goog.debug.LogRecord} into a
     * {@link webdriver.logging.Entry}.
     * @param {!LogRecord} logRecord The record to convert.
     * @param {string=} opt_type The log type.
     * @return {!Entry} The converted entry.
     */
    fromClosureLogRecord: function(logRecord, opt_type) {
      return new Entry(
          normalizeLevel(/** @type {!Logger.Level} */(logRecord.getLevel())),
          '[' + logRecord.getLoggerName() + '] ' + logRecord.getMessage(),
          logRecord.getMillis(),
          opt_type);
    }
  },

  /**
   * @return {{level: string, message: string, timestamp: number,
   *           type: string}} The JSON representation of this entry.
   */
  toJSON: function() {
    return {
      'level': this.level.name,
      'message': this.message,
      'timestamp': this.timestamp,
      'type': this.type
    };
  }
});
exports.Entry = Entry;
