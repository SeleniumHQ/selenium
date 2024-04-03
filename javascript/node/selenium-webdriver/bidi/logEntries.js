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

'use strict'

/**
 * Represents a base log entry.
 * Desribed in https://w3c.github.io/webdriver-bidi/#types-log-logentry.
 */
class BaseLogEntry {
  /**
   * Creates a new instance of BaseLogEntry.
   * @param {string} level - The log level.
   * @param {string} text - The log text.
   * @param {number} timeStamp - The log timestamp.
   * @param {string} stackTrace - The log stack trace.
   */
  constructor(level, text, timeStamp, stackTrace) {
    this._level = level
    this._text = text
    this._timeStamp = timeStamp
    this._stackTrace = stackTrace
  }

  /**
   * Gets the log level.
   * @returns {string} The log level.
   */
  get level() {
    return this._level
  }

  /**
   * Gets the log text.
   * @returns {string} The log text.
   */
  get text() {
    return this._text
  }

  /**
   * Gets the log timestamp.
   * @returns {number} The log timestamp.
   */
  get timeStamp() {
    return this._timeStamp
  }

  /**
   * Gets the log stack trace.
   * @returns {string} The log stack trace.
   */
  get stackTrace() {
    return this._stackTrace
  }
}

/**
 * Represents a generic log entry.
 * @class
 * @extends BaseLogEntry
 */
class GenericLogEntry extends BaseLogEntry {
  /**
   * Creates an instance of GenericLogEntry.
   * @param {string} level - The log level.
   * @param {string} text - The log text.
   * @param {Date} timeStamp - The log timestamp.
   * @param {string} type - The log type.
   * @param {string} stackTrace - The log stack trace.
   */
  constructor(level, text, timeStamp, type, stackTrace) {
    super(level, text, timeStamp, stackTrace)
    this._type = type
  }

  /**
   * Gets the log type.
   * @returns {string} The log type.
   */
  get type() {
    return this._type
  }
}

/**
 * Represents a log entry for console logs.
 * @class
 * @extends GenericLogEntry
 */
class ConsoleLogEntry extends GenericLogEntry {
  constructor(level, text, timeStamp, type, method, realm, args, stackTrace) {
    super(level, text, timeStamp, type, stackTrace)
    this._method = method
    this._realm = realm
    this._args = args
  }

  /**
   * Gets the method associated with the log entry.
   * @returns {string} The method associated with the log entry.
   */
  get method() {
    return this._method
  }

  /**
   * Gets the realm associated with the log entry.
   * @returns {string} The realm associated with the log entry.
   */
  get realm() {
    return this._realm
  }

  /**
   * Gets the arguments associated with the log entry.
   * @returns {Array} The arguments associated with the log entry.
   */
  get args() {
    return this._args
  }
}

/**
 * Represents a log entry for JavaScript logs.
 * @class
 * @extends GenericLogEntry
 */
class JavascriptLogEntry extends GenericLogEntry {
  constructor(level, text, timeStamp, type, stackTrace) {
    super(level, text, timeStamp, type, stackTrace)
  }
}

// PUBLIC API

module.exports = {
  BaseLogEntry,
  GenericLogEntry,
  ConsoleLogEntry,
  JavascriptLogEntry,
}
