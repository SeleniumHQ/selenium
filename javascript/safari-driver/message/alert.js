// Copyright 2012 Selenium committers
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
 * @constructor
 * @extends {safaridriver.message.Message}
 */
safaridriver.message.Alert = function(message) {
  goog.base(this, safaridriver.message.Alert.TYPE);
  this.setField('message', message);
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
  if (!goog.isString(message)) {
    throw Error('Invalid message: ' + JSON.stringify(data));
  }
  return new safaridriver.message.Alert(message);
};


/** @return {string} The alert message. */
safaridriver.message.Alert.prototype.getMessage = function() {
  return (/** @type {string} */this.getField('message'));
};


safaridriver.message.registerMessageType(
    safaridriver.message.Alert.TYPE,
    safaridriver.message.Alert.fromData_);
