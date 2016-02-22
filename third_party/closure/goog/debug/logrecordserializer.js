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
 * @fileoverview Static methods for serializing and deserializing log
 * messages.  These methods are deliberately kept separate from logrecord.js
 * and logger.js because they add dependencies on goog.json and goog.object.
 *
 */

goog.provide('goog.debug.logRecordSerializer');

goog.require('goog.debug.LogRecord');
goog.require('goog.debug.Logger');
goog.require('goog.json');
goog.require('goog.object');


/**
 * Enumeration of object keys used when serializing a log message.
 * @enum {string}
 * @private
 */
goog.debug.logRecordSerializer.Param_ = {
  TIME: 't',
  LEVEL_NAME: 'ln',
  LEVEL_VALUE: 'lv',
  MSG: 'm',
  LOGGER_NAME: 'n',
  SEQUENCE_NUMBER: 's',
  EXCEPTION: 'e'
};


/**
 * Serializes a LogRecord to a JSON string.  Note that any associated
 * exception is likely to be lost.
 * @param {goog.debug.LogRecord} record The record to serialize.
 * @return {string} Serialized JSON string of the log message.
 */
goog.debug.logRecordSerializer.serialize = function(record) {
  var param = goog.debug.logRecordSerializer.Param_;
  return goog.json.serialize(goog.object.create(
      param.TIME, record.getMillis(),
      param.LEVEL_NAME, record.getLevel().name,
      param.LEVEL_VALUE, record.getLevel().value,
      param.MSG, record.getMessage(),
      param.LOGGER_NAME, record.getLoggerName(),
      param.SEQUENCE_NUMBER, record.getSequenceNumber(),
      param.EXCEPTION, record.getException() && record.getException().message));
};


/**
 * Deserializes a JSON-serialized LogRecord.
 * @param {string} s The JSON serialized record.
 * @return {!goog.debug.LogRecord} The deserialized record.
 */
goog.debug.logRecordSerializer.parse = function(s) {
  return goog.debug.logRecordSerializer.reconstitute_(goog.json.parse(s));
};


/**
 * Deserializes a JSON-serialized LogRecord.  Use this only if you're
 * naive enough to blindly trust any JSON formatted input that comes
 * your way.
 * @param {string} s The JSON serialized record.
 * @return {!goog.debug.LogRecord} The deserialized record.
 */
goog.debug.logRecordSerializer.unsafeParse = function(s) {
  return goog.debug.logRecordSerializer.reconstitute_(goog.json.unsafeParse(s));
};


/**
 * Common reconsitution method for for parse and unsafeParse.
 * @param {Object} o The JSON object.
 * @return {!goog.debug.LogRecord} The reconstituted record.
 * @private
 */
goog.debug.logRecordSerializer.reconstitute_ = function(o) {
  var param = goog.debug.logRecordSerializer.Param_;
  var level = goog.debug.logRecordSerializer.getLevel_(
      o[param.LEVEL_NAME], o[param.LEVEL_VALUE]);

  var ret = new goog.debug.LogRecord(level, o[param.MSG],
      o[param.LOGGER_NAME], o[param.TIME], o[param.SEQUENCE_NUMBER]);
  var exceptionMessage = o[param.EXCEPTION];
  if (goog.isDefAndNotNull(exceptionMessage)) {
    ret.setException(new Error(exceptionMessage));
  }
  return ret;
};


/**
 * @param {string} name The name of the log level to return.
 * @param {number} value The numeric value of the log level to return.
 * @return {!goog.debug.Logger.Level} Returns a goog.debug.Logger.Level with
 *     the specified name and value.  If the name and value match a predefined
 *     log level, that instance will be returned, otherwise a new one will be
 *     created.
 * @private
 */
goog.debug.logRecordSerializer.getLevel_ = function(name, value) {
  var level = goog.debug.Logger.Level.getPredefinedLevel(name);
  return level && level.value == value ?
      level : new goog.debug.Logger.Level(name, value);
};
