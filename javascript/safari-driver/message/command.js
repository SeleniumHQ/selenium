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
 * @fileoverview Defines messages for (command, response) pairs.
 */

goog.provide('safaridriver.message.BaseCommandMessage');
goog.provide('safaridriver.message.Command');
goog.provide('safaridriver.message.Response');

goog.require('safaridriver.Command');
goog.require('safaridriver.message');
goog.require('safaridriver.message.Message');



/**
 * Base class for messages that contain a {@link safaridriver.Command} in their
 * payload.
 * @param {string} type The message type.
 * @param {!safaridriver.Command} command The command for this message.
 * @constructor
 * @extends {safaridriver.message.Message}
 */
safaridriver.message.BaseCommandMessage = function(type, command) {
  goog.base(this, type);

  /**
   * @type {!safaridriver.Command}
   * @private
   */
  this.command_ = command;
};
goog.inherits(safaridriver.message.BaseCommandMessage,
    safaridriver.message.Message);


/**
 * @type {string}
 * @const
 * @private
 */
safaridriver.message.BaseCommandMessage.COMMAND_FIELD_ = 'command';


/** @return {!safaridriver.Command} The command for this message. */
safaridriver.message.BaseCommandMessage.prototype.getCommand = function() {
  return this.command_;
};


/** @override */
safaridriver.message.BaseCommandMessage.prototype.toJSON = function() {
  this.setField(safaridriver.message.BaseCommandMessage.COMMAND_FIELD_,
      this.command_.toJSON());
  return goog.base(this, 'toJSON');
};


/** @override */
safaridriver.message.BaseCommandMessage.prototype.send = function(opt_proxy) {
  // When sending a message, Safari does not serialize all data fields
  // like normal JSON (e.g., it ignores our toJSON() method). So we must
  // manually set the command field right before sending the message.
  this.setField(safaridriver.message.BaseCommandMessage.COMMAND_FIELD_,
      this.command_.toJSON());
  goog.base(this, 'send', opt_proxy);
};


/**
 * Defines a new command message.
 * @param {string} type The type of message.
 * @return {function(new:safaridriver.message.BaseCommandMessage,
 *     !safaridriver.Command): safaridriver.message.BaseCommandMessage} The new
 *     message constructor.
 */
safaridriver.message.BaseCommandMessage.defineCommandMessageType = function(
    type) {
  /**
   * @param {!safaridriver.Command} command The command for this message.
   * @constructor
   * @extends {safaridriver.message.BaseCommandMessage}
   */
  var cmdCtor = function(command) {
    goog.base(this, type, command);
  };
  goog.inherits(cmdCtor, safaridriver.message.BaseCommandMessage);

  /**
   * @type {string}
   * @const
   */
  cmdCtor.TYPE = type;

  /**
   * @param {!Object.<*>} data The JSON object to load from.
   * @return {!safaridriver.message.BaseCommandMessage} The new message.
   */
  function fromData(data) {
    var command = data[safaridriver.message.BaseCommandMessage.COMMAND_FIELD_];
    if (!goog.isObject(command)) {
      throw Error('Invalid command message: ' + JSON.stringify(data));
    }
    command = safaridriver.Command.fromJSONObject(command);
    if (!command) {
      throw Error('Invalid command message: ' + JSON.stringify(data));
    }
    return new cmdCtor(command);
  }

  safaridriver.message.registerMessageType(type, fromData);
  return cmdCtor;
};



/**
 * Message used to pass {@link safaridriver.Command} objects between the various
 * components of the extension.
 * @param {!safaridriver.Command} command The command for this message.
 * @constructor
 * @extends {safaridriver.message.BaseCommandMessage}
 */
safaridriver.message.Command =
    safaridriver.message.BaseCommandMessage.defineCommandMessageType(
        'command');



/**
 * Message used to pass {@link bot.response.ResponseObject}s between the
 * various components of the extension.
 * @param {string} id The ID from the command this is a response to.
 * @param {!bot.response.ResponseObject} responseObj The raw response object.
 * @constructor
 * @extends {safaridriver.message.Message}
 */
safaridriver.message.Response = function(id, responseObj) {
  goog.base(this, safaridriver.message.Response.TYPE);

  this.setField(safaridriver.message.Response.Field_.ID, id);
  this.setField(safaridriver.message.Response.Field_.RESPONSE,
      responseObj);
};
goog.inherits(safaridriver.message.Response,
    safaridriver.message.Message);


/**
 * @type {string}
 * @const
 */
safaridriver.message.Response.TYPE = 'response';


/**
 * Fields in a response message.
 * @enum {string}
 * @private
 */
safaridriver.message.Response.Field_ = {
  ID: 'id',
  RESPONSE: 'response'
};


/**
 * Creates a response message from a raw data object.
 * @param {!Object.<*>} data The data object to convert.
 * @return {!safaridriver.message.Response} The new message.
 * @throws {Error} If the data object does not define a valid message.
 * @private
 */
safaridriver.message.Response.fromData_ = function(data) {
  var id = data[safaridriver.message.Response.Field_.ID];
  var response = data[safaridriver.message.Response.Field_.RESPONSE];
  if (!goog.isString(id) || !goog.isObject(response)) {
    throw Error('Invalid response message: ' + JSON.stringify(data));
  }
  return new safaridriver.message.Response(id, response);
};


/**
 * @return {string} This response's ID.
 */
safaridriver.message.Response.prototype.getId = function() {
  return (/** @type {string} */this.getField(
      safaridriver.message.Response.Field_.ID));
};


/**
 * @return {!bot.response.ResponseObject} The raw response encoded in this
 *     message.
 */
safaridriver.message.Response.prototype.getResponse = function() {
  return (/** @type {!bot.response.ResponseObject} */this.getField(
      safaridriver.message.Response.Field_.RESPONSE));
};


safaridriver.message.registerMessageType(
    safaridriver.message.Response.TYPE,
    safaridriver.message.Response.fromData_);
