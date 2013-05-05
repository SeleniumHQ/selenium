// Copyright 2013 Selenium committers
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

/**
 * @fileoverview Defines the "log" message.
 */

goog.provide('safaridriver.message.Log');

goog.require('safaridriver.message');
goog.require('safaridriver.message.Message');
goog.require('webdriver.logging');



/**
 * Message used to pass log entries between components.
 * @param {string} type The log type.
 * @param {!webdriver.logging.Entry} entry The log entry.
 * @constructor
 * @extends {safaridriver.message.Message}
 */
safaridriver.message.Log = function(type, entry) {
  goog.base(this, safaridriver.message.Log.TYPE);
  this.setField('logType', type);

  /** @private {!webdriver.logging.Entry} */
  this.entry_ = entry;
};
goog.inherits(safaridriver.message.Log, safaridriver.message.Message);


/**
 * @type {string}
 * @const
 */
safaridriver.message.Log.TYPE = 'log';


/**
 * @param {!Object.<*>} data The data object to convert.
 * @return {!safaridriver.message.Log} The new message.
 * @throws {Error} If the data object does not define a valid message.
 * @private
 */
safaridriver.message.Log.fromData_ = function(data) {
  var type = data['logType'];
  var entry = data['entry'];
  if (!goog.isString(type) ||
      !goog.isString(entry['level']) ||
      !goog.isString(entry['message']) ||
      !goog.isNumber(entry['timestamp'])) {
    throw safaridriver.message.throwInvalidMessageError(data);
  }
  return new safaridriver.message.Log(
      type,
      new webdriver.logging.Entry(
          entry['level'], entry['message'], entry['timestamp']));
};


/** @override */
safaridriver.message.Log.prototype.toJSON = function() {
  this.setField('entry', this.entry_.toJSON());
  return goog.base(this, 'toJSON');
};


/** @override */
safaridriver.message.Log.prototype.send = function(target) {
  this.setField('entry', this.entry_.toJSON());
  goog.base(this, 'send', target);
};


/** @override */
safaridriver.message.Log.prototype.sendSync = function(target) {
  this.setField('entry', this.entry_.toJSON());
  goog.base(this, 'sendSync', target);
};


/** @return {string} The log entry type. */
safaridriver.message.Log.prototype.getLogType = function() {
  return /** @type {string} */ (this.getField('logType'));
};


/** @return {!webdriver.logging.Entry} The log entry. */
safaridriver.message.Log.prototype.getEntry = function() {
  return this.entry_;
};


safaridriver.message.registerMessageType(
  safaridriver.message.Log.TYPE,
  safaridriver.message.Log.fromData_);
