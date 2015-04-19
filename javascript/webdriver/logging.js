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

goog.module('webdriver.logging');
goog.module.declareLegacyNamespace();

var Objects = goog.require('goog.object');


/**
 * Logging levels.
 * @enum {{value: number, name: string}}
 */
var Level = {
  ALL: {value: Number.MIN_VALUE, name: 'ALL'},
  DEBUG: {value: 700, name: 'DEBUG'},
  INFO: {value: 800, name: 'INFO'},
  WARNING: {value: 900, name: 'WARNING'},
  SEVERE: {value: 1000, name: 'SEVERE'},
  OFF: {value: Number.MAX_VALUE, name: 'OFF'}
};
exports.Level = Level;


/**
 * Converts a level name or value to a {@link webdriver.logging.Level} value.
 * If the name/value is not recognized, {@link webdriver.logging.Level.ALL}
 * will be returned.
 * @param {(number|string)} nameOrValue The log level name, or value, to
 *     convert .
 * @return {!Level} The converted level.
 */
function getLevel(nameOrValue) {
  var predicate = goog.isString(nameOrValue) ?
      function(val) { return val.name === nameOrValue; } :
      function(val) { return val.value === nameOrValue; };

  return Objects.findValue(Level, predicate) || Level.ALL;
}
exports.getLevel = getLevel;


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
    /** @private {!Object.<string, Level>} */
    this.prefs_ = {};
  },

  /**
   * Sets the desired logging level for a particular log type.
   * @param {(string|Type)} type The log type.
   * @param {!Level} level The desired log level.
   */
  setLevel: function(type, level) {
    this.prefs_[type] = level;
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
 * A single log entry.
 * @final
 */
var Entry = goog.defineClass(null, {
  /**
   * @param {(!Level|string)} level The entry level.
   * @param {string} message The log message.
   * @param {number=} opt_timestamp The time this entry was generated, in
   *     milliseconds since 0:00:00, January 1, 1970 UTC. If omitted, the
   *     current time will be used.
   * @param {string=} opt_type The log type, if known.
   * @constructor
   */
  constructor: function(level, message, opt_timestamp, opt_type) {

    /** @type {!Level} */
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
     * @param {!goog.debug.LogRecord} logRecord The record to convert.
     * @param {string=} opt_type The log type.
     * @return {!Entry} The converted entry.
     */
    fromClosureLogRecord: function(logRecord, opt_type) {
      var closureLevel = logRecord.getLevel();
      var level = Level.SEVERE;

      if (closureLevel.value <= Level.DEBUG.value) {
        level = Level.DEBUG;
      } else if (closureLevel.value <= Level.INFO.value) {
        level = Level.INFO;
      } else if (closureLevel.value <= Level.WARNING.value) {
        level = Level.WARNING;
      }

      return new Entry(
          level,
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
