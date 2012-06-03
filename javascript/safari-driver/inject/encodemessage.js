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
 * @fileoverview Defines the encode message type.
 */

goog.provide('safaridriver.inject.EncodeMessage');

goog.require('safaridriver.message');


/**
 * A {@link safaridriver.message.Type.ENCODE} message.
 * @param {string} id The ID from the command this is a response to.
 * @param {string} xpath The XPath locator for the element to encode.
 * @constructor
 * @extends {safaridriver.message.Message}
 */
safaridriver.inject.EncodeMessage = function(id, xpath) {
  goog.base(this, safaridriver.inject.EncodeMessage.TYPE);

  this.setField(safaridriver.inject.EncodeMessage.Field_.ID, id);
  this.setField(safaridriver.inject.EncodeMessage.Field_.XPATH, xpath);
};
goog.inherits(safaridriver.inject.EncodeMessage,
    safaridriver.message.Message);


/**
 * @type {string}
 * @const
 */
safaridriver.inject.EncodeMessage.TYPE = 'encode';


/**
 * @enum {string}
 * @private
 */
safaridriver.inject.EncodeMessage.Field_ = {
  ID: 'id',
  XPATH: 'xpath'
};


/**
 * @param {!Object.<*>} data The data object to convert.
 * @return {!safaridriver.inject.EncodeMessage} The new message.
 * @throws {Error} If the data object does not define a valid message.
 * @private
 */
safaridriver.inject.EncodeMessage.fromData_ = function(data) {
  var id = data[safaridriver.inject.EncodeMessage.Field_.ID];
  var xpath = data[safaridriver.inject.EncodeMessage.Field_.XPATH];
  if (!goog.isString(id) || !goog.isString(xpath)) {
    throw Error('Invalid message: ' + JSON.stringify(data));
  }
  return new safaridriver.inject.EncodeMessage(id, xpath);
};


/** @return {string} This response's ID. */
safaridriver.inject.EncodeMessage.prototype.getId = function() {
  return (/** @type {string} */this.getField(
      safaridriver.inject.EncodeMessage.Field_.ID));
};


/** @return {string} The XPath locator of the element to encode. */
safaridriver.inject.EncodeMessage.prototype.getXPath = function() {
  return (/** @type {string} */this.getField(
      safaridriver.inject.EncodeMessage.Field_.XPATH));
};


safaridriver.message.registerMessageType(
    safaridriver.inject.EncodeMessage.TYPE,
    safaridriver.inject.EncodeMessage.fromData_);
