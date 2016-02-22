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
 * @fileoverview Defines the "log" message.
 */

goog.provide('safaridriver.message.Log');

goog.require('safaridriver.message');
goog.require('safaridriver.message.Message');
goog.require('webdriver.logging');



/**
 * Message used to pass log entries between components.
 * @param {!Array.<!webdriver.logging.Entry>} entries The log entries.
 * @constructor
 * @extends {safaridriver.message.Message}
 */
safaridriver.message.Log = function(entries) {
  goog.base(this, safaridriver.message.Log.TYPE);

  /** @private {!Array.<!webdriver.logging.Entry>} */
  this.entries_ = entries;
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
  var rawEntries = data['entries'];
  if (!goog.isArray(rawEntries)) {
    throw safaridriver.message.throwInvalidMessageError(data);
  }

  var entries = rawEntries.map(function(rawEntry) {
    if (!goog.isString(rawEntry['type']) ||
        !goog.isString(rawEntry['level']) ||
        !goog.isString(rawEntry['message']) ||
        !goog.isNumber(rawEntry['timestamp'])) {
      throw safaridriver.message.throwInvalidMessageError(data);
    }
    return new webdriver.logging.Entry(
        rawEntry['level'], rawEntry['message'],
        rawEntry['timestamp'], rawEntry['type']);
  });
  return new safaridriver.message.Log(entries);
};


/** @private */
safaridriver.message.Log.prototype.serialized_ = false;


/** @private */
safaridriver.message.Log.prototype.serializeEntries_ = function() {
  if (!this.serialized_) {
    this.setField('entries', this.entries_.map(function(entry) {
      return entry.toJSON();
    }));
    this.serialized_ = true;
  }
};


/** @override */
safaridriver.message.Log.prototype.toJSON = function() {
  this.serializeEntries_();
  return goog.base(this, 'toJSON');
};


/** @override */
safaridriver.message.Log.prototype.send = function(target) {
  this.serializeEntries_();
  goog.base(this, 'send', target);
};


/** @override */
safaridriver.message.Log.prototype.sendSync = function(target) {
  this.serializeEntries_();
  goog.base(this, 'sendSync', target);
};


/** @return {!Array.<!webdriver.logging.Entry>} The log entries. */
safaridriver.message.Log.prototype.getEntries = function() {
  return this.entries_;
};


safaridriver.message.registerMessageType(
  safaridriver.message.Log.TYPE,
  safaridriver.message.Log.fromData_);
