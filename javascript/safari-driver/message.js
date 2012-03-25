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
goog.provide('safaridriver.message.Message');
goog.provide('safaridriver.message.ResponseMessage');
goog.provide('safaridriver.message.Type');

goog.require('safaridriver.Command');


/**
 * Message types used by the SafariDriver extension.
 * @enum {string}
 */
safaridriver.message.Type = {

  /**
   * Message sent from an injected script to a child frame to indicate that
   * frame should activate itself with the global page.
   */
  ACTIVATE: 'activate',

  /**
   * Message sent by the global page when there is a command for the injected
   * script to execute.
   */
  COMMAND: 'command',

  /**
   * Message sent by an injected script to the global page to indicate it should
   * open a WebSocket connection to a WebDriver client. The data for this
   * message will be the URI for the WebSocket.
   */
  CONNECT: 'connect',

  /**
   * Message sent by the injected page in response to a global page command.
   */
  RESPONSE: 'response'
};


/**
 * Base class for messages exchanged between components of the SafariDriver.
 * may either be exchanged between the extension's global page and injected
 * script, or the injected script and web page content.
 * @param {!safaridriver.message.Type} type The message type.
 * @constructor
 * @private
 */
safaridriver.message.Message = function(type) {

  /**
   * The JSON data associated with this message.
   * @type {!Object.<*>}
   * @private
   */
  this.data_ = {};

  this.data_[safaridriver.message.Message.Field.SOURCE] =
      safaridriver.message.Message.SOURCE;
  this.data_[safaridriver.message.Message.Field.MESSAGE] = type;
};


/**
 * The standard fields in a {@link safaridriver.message.Message}.
 * @enum {string}
 */
safaridriver.message.Message.Field = {
  SOURCE: 'source',
  MESSAGE: 'message'
};


/**
 * The constant value for the
 * {@link safaridriver.message.Message.Field.SOURCE} field.
 * @type {string}
 * @const
 */
safaridriver.message.Message.SOURCE = 'webdriver';


/**
 * Creates a {@link safaridriver.message.Message} from a message event.
 * @param {!(SafariExtensionMessageEvent|MessageEvent)} event The raw event to
 *     convert to a message.
 * @return {!safaridriver.message.Message} The new message.
 * @throws {Error} If the event does not conform to the message protocol.
 */
safaridriver.message.Message.fromEvent = function(event) {
  var data = event.message || event.data;

  if (!goog.isObject(data) ||
      data[safaridriver.message.Message.Field.SOURCE] !==
          safaridriver.message.Message.SOURCE) {
    throw Error('Invalid message: ' + JSON.stringify(data));
  }

  switch(data[safaridriver.message.Message.Field.MESSAGE]) {
    case safaridriver.message.Type.COMMAND:
      return safaridriver.message.CommandMessage.fromData_(data);

    case safaridriver.message.Type.CONNECT:
      return safaridriver.message.ConnectMessage.fromData_(data);

    case safaridriver.message.Type.RESPONSE:
      return safaridriver.message.ResponseMessage.fromData_(data);

    default:
      throw Error('Unknown message type: ' + JSON.stringify(data));
  }
};


/**
 * Sets a field in this message's data.
 * @param {string} name The name of the field.
 * @param {*} value The field value; should be a JSON compatible value.
 */
safaridriver.message.Message.prototype.setField = function(name, value) {
  if (name === safaridriver.message.Message.Field.MESSAGE ||
      name === safaridriver.message.Message.Field.SOURCE) {
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
 * @return {string} This message's type.
 */
safaridriver.message.Message.prototype.getType = function() {
  return (/** @type {string} */this.getField(
      safaridriver.message.Message.Field.MESSAGE));
};


/**
 * Tests whether this message has the givne {@code type}.
 * @param {!safaridriver.message.Type} type The type to test for.
 * @return {boolean} Whether this message is of the given type.
 */
safaridriver.message.Message.prototype.isType = function(type) {
  return this.getField(safaridriver.message.Message.Field.MESSAGE) === type;
};


/**
 * Sends this message.
 * @param {{dispatchMessage: function(string, *)}} opt_dispatcher The object to
 *     dispatch this message to; only required if running inside the
 *     SafariDriver extension.
 */
safaridriver.message.Message.prototype.send = function(opt_dispatcher) {
  if (!goog.getObjectByName('safari')) {
    window.postMessage(this.data_, '*');
  } else if (!opt_dispatcher) {
    throw Error('No dispatcher provided!');
  } else {
    opt_dispatcher.dispatchMessage(this.getType(), this.data_);
  }
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
safaridriver.message.CommandMessage.prototype.send = function(opt_dispatcher) {
  // When sending a message, Safari does not use a serialize all data fields
  // like normal JSON (e.g., it ignores our toJSON() method). So we must
  // manually set the command field right before sending the message.
  this.setField(safaridriver.message.CommandMessage.COMMAND_FIELD_,
      this.command_.toJSON());
  goog.base(this, 'send', opt_dispatcher);
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
 * A {@link safaridriver.message.Type.RESPONSE} message.
 * @param {string} id The ID from the command this is a response to.
 * @param {!webdriver.CommandResponse} responseObj The raw response object.
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
 * @return {!webdriver.CommandResponse} The raw response encoded in this
 *     message.
 */
safaridriver.message.ResponseMessage.prototype.getResponse = function() {
  return (/** @type {!webdriver.CommandResponse} */this.getField(
      safaridriver.message.ResponseMessage.Field_.RESPONSE));
};
