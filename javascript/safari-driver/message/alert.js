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
 * @fileoverview Defines the "alert" message.
 */

goog.provide('safaridriver.message.Alert');

goog.require('safaridriver.message');
goog.require('safaridriver.message.Message');



/**
 * Message sent to the extension when an alert is intercepted by an injected
 * script.
 * @param {string} message The alert message.
 * @param {boolean} blocksUiThread Whether the action associated with this
 *     message will block the UI thread if not blocked.
 * @constructor
 * @extends {safaridriver.message.Message}
 */
safaridriver.message.Alert = function(message, blocksUiThread) {
  goog.base(this, safaridriver.message.Alert.TYPE);
  this.setField('message', message);
  this.setField('blocksUiThread', blocksUiThread);
};
goog.inherits(safaridriver.message.Alert, safaridriver.message.Message);


/**
 * @type {string}
 * @const
 */
safaridriver.message.Alert.TYPE = 'alert';


/**
 * @param {!Object.<*>} data The data object to convert.
 * @return {!safaridriver.message.Alert} The new message.
 * @throws {Error} If the data object does not define a valid message.
 * @private
 */
safaridriver.message.Alert.fromData_ = function(data) {
  var message = data['message'];
  var blocksUiThread = data['blocksUiThread'];
  if (!goog.isString(message) || !goog.isBoolean(blocksUiThread)) {
    throw safaridriver.message.throwInvalidMessageError(data);
  }
  return new safaridriver.message.Alert(message, blocksUiThread);
};


/** @return {string} The alert message. */
safaridriver.message.Alert.prototype.getMessage = function() {
  return /** @type {string} */ (this.getField('message'));
};


/**
 * @return {boolean} Whether the action associated with this message will block
 *     the UI thread if not blocked.
 */
safaridriver.message.Alert.prototype.blocksUiThread = function() {
  return /** @type {boolean} */ (this.getField('blocksUiThread'));
};


safaridriver.message.registerMessageType(
    safaridriver.message.Alert.TYPE,
    safaridriver.message.Alert.fromData_);
