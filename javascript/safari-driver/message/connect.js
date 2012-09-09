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
 * @fileoverview Defines the "connect" message.
 */

goog.provide('safaridriver.message.Connect');

goog.require('safaridriver.message');
goog.require('safaridriver.message.Message');



/**
 * Message sent from the web page to the injected script, which then forwards
 * it to the global page, to request that the SafariDriver open a WebSocket
 * connection to a WebDriver client.
 * @param {string} url The URL for the WebSocket server to connect to.
 * @constructor
 * @extends {safaridriver.message.Message}
 */
safaridriver.message.Connect = function(url) {
  goog.base(this, safaridriver.message.Connect.TYPE);
  this.setField(safaridriver.message.Connect.URL_FIELD_, url);
};
goog.inherits(safaridriver.message.Connect,
    safaridriver.message.Message);


/**
 * @type {string}
 * @const
 */
safaridriver.message.Connect.TYPE = 'connect';


/**
 * @type {string}
 * @const
 * @private
 */
safaridriver.message.Connect.URL_FIELD_ = 'url';


/**
 * Creates a connect message from a raw data object.
 * @param {!Object.<*>} data The data object to convert.
 * @return {!safaridriver.message.Connect} The new message.
 * @throws {Error} If the data object does not define a valid message.
 * @private
 */
safaridriver.message.Connect.fromData_ = function(data) {
  var url = data[safaridriver.message.Connect.URL_FIELD_];
  if (!goog.isString(url)) {
    throw Error('Invalid connect message: ' + JSON.stringify(data));
  }
  return new safaridriver.message.Connect(url);
};


/** @return {string} The URL for the WebSocket server to connect to. */
safaridriver.message.Connect.prototype.getUrl = function() {
  return (/** @type {string} */ this.getField(
      safaridriver.message.Connect.URL_FIELD_));
};


safaridriver.message.registerMessageType(
    safaridriver.message.Connect.TYPE,
    safaridriver.message.Connect.fromData_);
