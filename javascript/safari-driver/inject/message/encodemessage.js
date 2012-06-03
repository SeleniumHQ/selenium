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

goog.provide('safaridriver.inject.message.Encode');

goog.require('safaridriver.message');


/**
 * A {@link safaridriver.message.Type.ENCODE} message.
 * @param {string} id The ID from the command this is a response to.
 * @param {string} xpath The XPath locator for the element to encode.
 * @constructor
 * @extends {safaridriver.message.Message}
 */
safaridriver.inject.message.Encode = function(id, xpath) {
  goog.base(this, safaridriver.inject.message.Encode.TYPE);

  this.setField(safaridriver.inject.message.Encode.Field_.ID, id);
  this.setField(safaridriver.inject.message.Encode.Field_.XPATH, xpath);
};
goog.inherits(safaridriver.inject.message.Encode,
    safaridriver.message.Message);


/**
 * @type {string}
 * @const
 */
safaridriver.inject.message.Encode.TYPE = 'encode';


/**
 * @enum {string}
 * @private
 */
safaridriver.inject.message.Encode.Field_ = {
  ID: 'id',
  XPATH: 'xpath'
};


/**
 * @param {!Object.<*>} data The data object to convert.
 * @return {!safaridriver.inject.message.Encode} The new message.
 * @throws {Error} If the data object does not define a valid message.
 * @private
 */
safaridriver.inject.message.Encode.fromData_ = function(data) {
  var id = data[safaridriver.inject.message.Encode.Field_.ID];
  var xpath = data[safaridriver.inject.message.Encode.Field_.XPATH];
  if (!goog.isString(id) || !goog.isString(xpath)) {
    throw Error('Invalid message: ' + JSON.stringify(data));
  }
  return new safaridriver.inject.message.Encode(id, xpath);
};


/** @return {string} This response's ID. */
safaridriver.inject.message.Encode.prototype.getId = function() {
  return (/** @type {string} */this.getField(
      safaridriver.inject.message.Encode.Field_.ID));
};


/** @return {string} The XPath locator of the element to encode. */
safaridriver.inject.message.Encode.prototype.getXPath = function() {
  return (/** @type {string} */this.getField(
      safaridriver.inject.message.Encode.Field_.XPATH));
};


safaridriver.message.registerMessageType(
    safaridriver.inject.message.Encode.TYPE,
    safaridriver.inject.message.Encode.fromData_);
