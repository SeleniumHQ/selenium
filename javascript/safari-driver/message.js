// Copyright 2012 Software Freedom Conservancy. All Rights Reserved.
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
 * @fileoverview Defines the messages exchanged between the extension global
 * page and injected scripts.
 */

goog.provide('safaridriver.message');
goog.provide('safaridriver.message.CommandMessage');
goog.provide('safaridriver.message.ConnectMessage');
goog.provide('safaridriver.message.EncodeMessage');
goog.provide('safaridriver.message.Message');
goog.provide('safaridriver.message.ResponseMessage');
goog.provide('safaridriver.message.Type');

goog.require('safaridriver.Command');


/**
 * @define {(string|number)} Compile time constant that may be used to identify
 *     where messages originate from. We permit strings or numbers since the
 *     Selenium build system currently does not support constant string
 *     expressions. TODO(jleyba): Fix this.
 */
safaridriver.message.ORIGIN = 'webdriver';


/**
 * Message types used by the SafariDriver extension.
 * @enum {string}
 */
safaridriver.message.Type = {
  ACTIVATE: 'activate',
  COMMAND: 'command',
  CONNECT: 'connect',
  DEACTIVATE: 'deactivate',
  ENCODE: 'encode',
  LOAD: 'load',
  RESPONSE: 'response',
  UNLOAD: 'unload'
};


/**
 * Creates a {@link safaridriver.message.Message} from a message event.
 * @param {!(SafariExtensionMessageEvent|MessageEvent)} event The raw event to
 *     convert to a message.
 * @return {!safaridriver.message.Message} The new message.
 * @throws {Error} If the event does not conform to the message protocol.
 */
safaridriver.message.fromEvent = function(event) {
  var data = event.message || event.data;
  if (goog.isString(data)) {
    data = JSON.parse(data);
  }

  if (!goog.isObject(data) ||
      (!goog.isString(data[safaridriver.message.Message.Field.ORIGIN]) &&
          !goog.isNumber(data[safaridriver.message.Message.Field.ORIGIN]))) {
    throw Error('Invalid message: ' + JSON.stringify(data));
  }

  var message;
  switch(data[safaridriver.message.Message.Field.TYPE]) {
    case safaridriver.message.Type.COMMAND:
      message = safaridriver.message.CommandMessage.fromData_(data);
      break;

    case safaridriver.message.Type.CONNECT:
      message = safaridriver.message.ConnectMessage.fromData_(data);
      break;

    case safaridriver.message.Type.ENCODE:
      message = safaridriver.message.EncodeMessage.fromData_(data);
      break;

    case safaridriver.message.Type.RESPONSE:
      message = safaridriver.message.ResponseMessage.fromData_(data);
      break;

    case safaridriver.message.Type.ACTIVATE:
    case safaridriver.message.Type.LOAD:
    case safaridriver.message.Type.UNLOAD:
      message = safaridriver.message.Message.fromData_(data);
      break;

    default:
      throw Error('Unknown message type: ' + JSON.stringify(data));
  }

  var origin = (/** @type {(string|number)} */
      data[safaridriver.message.Message.Field.ORIGIN]);
  message.setOrigin(origin);
  return message;
};


/**
 * Base class for messages exchanged between components of the SafariDriver.
 * may either be exchanged between the extension's global page and injected
 * script, or the injected script and web page content.
 * @param {!safaridriver.message.Type} type The message type.
 * @constructor
 */
safaridriver.message.Message = function(type) {

  /**
   * The JSON data associated with this message.
   * @type {!Object.<*>}
   * @private
   */
  this.data_ = {};

  this.data_[safaridriver.message.Message.Field.ORIGIN] =
      safaridriver.message.ORIGIN;
  this.data_[safaridriver.message.Message.Field.TYPE] = type;
};


/**
 * The standard fields in a {@link safaridriver.message.Message}.
 * @enum {string}
 */
safaridriver.message.Message.Field = {
  ORIGIN: 'origin',
  TYPE: 'type'
};


/**
 * Creates a generic message from a raw data object.
 * @param {!Object.<*>} data The data object to convert.
 * @return {!safaridriver.message.Message} The new message.
 * @private
 */
safaridriver.message.Message.fromData_ = function(data) {
  var type = (/** @type {safaridriver.message.Type} */ data[
      safaridriver.message.Message.Field.TYPE]);
  return new safaridriver.message.Message(type);
};


/**
 * Sets a field in this message's data.
 * @param {string} name The name of the field.
 * @param {*} value The field value; should be a JSON compatible value.
 */
safaridriver.message.Message.prototype.setField = function(name, value) {
  if (name === safaridriver.message.Message.Field.TYPE) {
    throw Error('The specified field may not be overridden: ' + name);
  }
  this.data_[name] = value;
};


/**
 * Returns the value of the given field.
 * @param {string} name The name of the field.
 * @return {*} The field value, or {@code undefined} if it is not set.
 */
safaridriver.message.Message.prototype.getField = function(name) {
  return this.data_[name];
};


/**
 * Sets the origin for this message.
 * @param {(string|number)} origin The new origin.
 */
safaridriver.message.Message.prototype.setOrigin = function(origin) {
  this.setField(safaridriver.message.Message.Field.ORIGIN, origin);
};


/**
 * @return {(string|number)} This message's origin.
 */
safaridriver.message.Message.prototype.getOrigin = function() {
  return (/** @type {(string|number)} */this.getField(
      safaridriver.message.Message.Field.ORIGIN));
};


/**
 * @return {boolean} Whether this message originated from the same context as
 *     this script.
 */
safaridriver.message.Message.prototype.isSameOrigin = function() {
  return this.getOrigin() === safaridriver.message.ORIGIN;
};


/**
 * @return {string} This message's type.
 */
safaridriver.message.Message.prototype.getType = function() {
  return (/** @type {string} */this.getField(
      safaridriver.message.Message.Field.TYPE));
};


/**
 * Tests whether this message has the givne {@code type}.
 * @param {!safaridriver.message.Type} type The type to test for.
 * @return {boolean} Whether this message is of the given type.
 */
safaridriver.message.Message.prototype.isType = function(type) {
  return this.getField(safaridriver.message.Message.Field.TYPE) === type;
};


/**
 * Sends this message to the given target.
 * @param {!(SafariContentBrowserTabProxy|SafariWebPageProxy|Window)} target
 *     The object to send this message to.
 */
safaridriver.message.Message.prototype.send = function(target) {
  this.setOrigin(safaridriver.message.ORIGIN);
  if (target.postMessage) {
    (/** @type {!Window} */target).postMessage(this.data_, '*');
  } else {
    (/** @type {!(SafariContentBrowserTabProxy|SafariWebPageProxy)} */
        target).dispatchMessage(this.getType(), this.data_);
  }
};


/**
 * Sends this message synchronously to the proved tab proxy.
 * @param {!SafariContentBrowserTabProxy} proxy The proxy to send this message
 *     to.
 */
safaridriver.message.Message.prototype.sendSync = function(proxy) {
  // Create a beforeload event, which is required by the canLoad function.
  var stubEvent = document.createEvent('Events');
  stubEvent.initEvent('beforeload', false, false);
  proxy.canLoad(stubEvent, this.data_);
  // TODO(jleyba): Handle the synchronous response.
};


/** @return {!Object.<*>} The JSON representation of this message. */
safaridriver.message.Message.prototype.toJSON = function() {
  return this.data_;
};


/** @override */
safaridriver.message.Message.prototype.toString = function() {
  return JSON.stringify(this);
};


////////////////////////////////////////////////////////////////////////////////


/**
 * A {@link safaridriver.message.Type.COMMAND} message. Sent either from the
 * extension's global page to the injected script, or the injected script to
 * web page.
 * @param {!safaridriver.Command} command The command for this message.
 * @constructor
 * @extends {safaridriver.message.Message}
 */
safaridriver.message.CommandMessage = function(command) {
  goog.base(this, safaridriver.message.Type.COMMAND);

  /**
   * @type {!safaridriver.Command}
   * @private
   */
  this.command_ = command;
};
goog.inherits(safaridriver.message.CommandMessage,
    safaridriver.message.Message);


/**
 * @type {string}
 * @const
 * @private
 */
safaridriver.message.CommandMessage.COMMAND_FIELD_ = 'command';


/**
 * Creates a command message from a raw data boject.
 * @param {!Object.<*>} data The data object to convert.
 * @return {!safaridriver.message.CommandMessage} The new message.
 * @throws {Error} If the data object does not define a valid message.
 * @private
 */
safaridriver.message.CommandMessage.fromData_ = function(data) {
  var command = data[safaridriver.message.CommandMessage.COMMAND_FIELD_];
  if (!goog.isObject(command)) {
    throw Error('Invalid command message: ' + JSON.stringify(data));
  }
  command = safaridriver.Command.fromJSONObject(command);
  if (!command) {
    throw Error('Invalid command message: ' + JSON.stringify(data));
  }
  return new safaridriver.message.CommandMessage(command);
};


/** @return {!safaridriver.Command} The command for this message. */
safaridriver.message.CommandMessage.prototype.getCommand = function() {
  return this.command_;
};


/** @override */
safaridriver.message.CommandMessage.prototype.toJSON = function() {
  this.setField(safaridriver.message.CommandMessage.COMMAND_FIELD_,
      this.command_.toJSON());
  return goog.base(this, 'toJSON');
};


/** @override */
safaridriver.message.CommandMessage.prototype.send = function(opt_proxy) {
  // When sending a message, Safari does not serialize all data fields
  // like normal JSON (e.g., it ignores our toJSON() method). So we must
  // manually set the command field right before sending the message.
  this.setField(safaridriver.message.CommandMessage.COMMAND_FIELD_,
      this.command_.toJSON());
  goog.base(this, 'send', opt_proxy);
};


////////////////////////////////////////////////////////////////////////////////


/**
 * A {@link safaridriver.message.Type.CONNECT} message. Sent from the web page
 * to the injected script, which then forwards it to the global page, to
 * request that the SafariDriver open a WebSocket connection to a WebDriver
 * client.
 * @param {string} url The URL for the WebSocket server to connect to.
 * @constructor
 * @extends {safaridriver.message.Message}
 */
safaridriver.message.ConnectMessage = function(url) {
  goog.base(this, safaridriver.message.Type.CONNECT);
  this.setField(safaridriver.message.ConnectMessage.URL_FIELD_, url);
};
goog.inherits(safaridriver.message.ConnectMessage,
    safaridriver.message.Message);


/**
 * @type {string}
 * @const
 * @private
 */
safaridriver.message.ConnectMessage.URL_FIELD_ = 'url';


/**
 * Creates a connect message from a raw data object.
 * @param {!Object.<*>} data The data object to convert.
 * @return {!safaridriver.message.ConnectMessage} The new message.
 * @throws {Error} If the data object does not define a valid message.
 * @private
 */
safaridriver.message.ConnectMessage.fromData_ = function(data) {
  var url = data[safaridriver.message.ConnectMessage.URL_FIELD_];
  if (!goog.isString(url)) {
    throw Error('Invalid connect message: ' + JSON.stringify(data));
  }
  return new safaridriver.message.ConnectMessage(url);
};


/** @return {string} The URL for the WebSocket server to connect to. */
safaridriver.message.ConnectMessage.prototype.getUrl = function() {
  return (/** @type {string} */ this.getField(
      safaridriver.message.ConnectMessage.URL_FIELD_));
};


////////////////////////////////////////////////////////////////////////////////


/**
 * A {@link safaridriver.message.Type.ENCODE} message.
 * @param {string} id The ID from the command this is a response to.
 * @param {string} xpath The XPath locator for the element to encode.
 * @constructor
 * @extends {safaridriver.message.Message}
 */
safaridriver.message.EncodeMessage = function(id, xpath) {
  goog.base(this, safaridriver.message.Type.ENCODE);

  this.setField(safaridriver.message.EncodeMessage.Field_.ID, id);
  this.setField(safaridriver.message.EncodeMessage.Field_.XPATH, xpath);
};
goog.inherits(safaridriver.message.EncodeMessage,
    safaridriver.message.Message);


/**
 * @enum {string}
 * @private
 */
safaridriver.message.EncodeMessage.Field_ = {
  ID: 'id',
  XPATH: 'xpath'
};


/**
 * @param {!Object.<*>} data The data object to convert.
 * @return {!safaridriver.message.EncodeMessage} The new message.
 * @throws {Error} If the data object does not define a valid message.
 * @private
 */
safaridriver.message.EncodeMessage.fromData_ = function(data) {
  var id = data[safaridriver.message.EncodeMessage.Field_.ID];
  var xpath = data[safaridriver.message.EncodeMessage.Field_.XPATH];
  if (!goog.isString(id) || !goog.isString(xpath)) {
    throw Error('Invalid message: ' + JSON.stringify(data));
  }
  return new safaridriver.message.EncodeMessage(id, xpath);
};


/** @return {string} This response's ID. */
safaridriver.message.EncodeMessage.prototype.getId = function() {
  return (/** @type {string} */this.getField(
      safaridriver.message.EncodeMessage.Field_.ID));
};


/** @return {string} The XPath locator of the element to encode. */
safaridriver.message.EncodeMessage.prototype.getXPath = function() {
  return (/** @type {string} */this.getField(
      safaridriver.message.EncodeMessage.Field_.XPATH));
};


////////////////////////////////////////////////////////////////////////////////


/**
 * A {@link safaridriver.message.Type.RESPONSE} message.
 * @param {string} id The ID from the command this is a response to.
 * @param {!bot.response.ResponseObject} responseObj The raw response object.
 * @constructor
 * @extends {safaridriver.message.Message}
 */
safaridriver.message.ResponseMessage = function(id, responseObj) {
  goog.base(this, safaridriver.message.Type.RESPONSE);

  this.setField(safaridriver.message.ResponseMessage.Field_.ID, id);
  this.setField(safaridriver.message.ResponseMessage.Field_.RESPONSE,
      responseObj);
};
goog.inherits(safaridriver.message.ResponseMessage,
    safaridriver.message.Message);


/**
 * Fields in a response message.
 * @enum {string}
 * @private
 */
safaridriver.message.ResponseMessage.Field_ = {
  ID: 'id',
  RESPONSE: 'response'
};


/**
 * Creates a response message from a raw data object.
 * @param {!Object.<*>} data The data object to convert.
 * @return {!safaridriver.message.ResponseMessage} The new message.
 * @throws {Error} If the data object does not define a valid message.
 * @private
 */
safaridriver.message.ResponseMessage.fromData_ = function(data) {
  var id = data[safaridriver.message.ResponseMessage.Field_.ID];
  var response = data[safaridriver.message.ResponseMessage.Field_.RESPONSE];
  if (!goog.isString(id) || !goog.isObject(response)) {
    throw Error('Invalid response message: ' + JSON.stringify(data));
  }
  return new safaridriver.message.ResponseMessage(id, response);
};


/**
 * @return {string} This response's ID.
 */
safaridriver.message.ResponseMessage.prototype.getId = function() {
  return (/** @type {string} */this.getField(
      safaridriver.message.ResponseMessage.Field_.ID));
};


/**
 * @return {!bot.response.ResponseObject} The raw response encoded in this
 *     message.
 */
safaridriver.message.ResponseMessage.prototype.getResponse = function() {
  return (/** @type {!bot.response.ResponseObject} */this.getField(
      safaridriver.message.ResponseMessage.Field_.RESPONSE));
};
