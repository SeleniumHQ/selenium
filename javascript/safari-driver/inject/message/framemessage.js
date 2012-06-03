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
 * @fileoverview Defines messages related to frame handling.
 */

goog.provide('safaridriver.inject.message.Activate');
goog.provide('safaridriver.inject.message.ActivateFrame');
goog.provide('safaridriver.inject.message.ReactivateFrame');

goog.require('safaridriver.message');
goog.require('safaridriver.message.CommandMessage');


/**
 * Message used to signal when a new frame has, or should, activate itself as
 * the target for future commands.
 * @param {!safaridriver.Command} command The command associated with this
 *     message.
 * @constructor
 * @extends {safaridriver.message.CommandMessage}
 */
safaridriver.inject.message.Activate = function(command) {
  goog.base(this, command);

  this.setType(safaridriver.inject.message.Activate.TYPE);
};
goog.inherits(safaridriver.inject.message.Activate,
    safaridriver.message.CommandMessage);


/**
 * @type {string}
 * @const
 */
safaridriver.inject.message.Activate.TYPE = 'activate';


/**
 * @param {!Object.<*>} data The JSON record object to create the message from.
 * @return {!safaridriver.inject.message.Activate} The new message.
 * @private
 */
safaridriver.inject.message.Activate.fromData_ = function(data) {
  var commandMessage = safaridriver.message.CommandMessage.fromData(data);
  return new safaridriver.inject.message.Activate(
      commandMessage.getCommand());
};


/**
 * Message used to inform the top frame that one of its descendants has been
 * activated.
 * @param {!safaridriver.Command} command The command associated with this
 *     message.
 * @constructor
 * @extends {safaridriver.message.CommandMessage}
 */
safaridriver.inject.message.ActivateFrame = function(command) {
  goog.base(this, command);

  this.setType(safaridriver.inject.message.ActivateFrame.TYPE);
};
goog.inherits(safaridriver.inject.message.ActivateFrame,
    safaridriver.message.CommandMessage);


/**
 * @type {string}
 * @const
 */
safaridriver.inject.message.ActivateFrame.TYPE = 'activate-frame';


/**
 * @param {!Object.<*>} data The JSON record object to create the message from.
 * @return {!safaridriver.inject.message.ActivateFrame} The new message.
 * @private
 */
safaridriver.inject.message.ActivateFrame.fromData_ = function(data) {
  var commandMessage = safaridriver.message.CommandMessage.fromData(data);
  return new safaridriver.inject.message.ActivateFrame(
      commandMessage.getCommand());
};


/**
 * Message sent to instruct a frame that has just finished loading that it was
 * previously active, should re-activate itself, and should send a load message
 * to the extension.
 * @constructor
 * @extends {safaridriver.message.Message}
 */
safaridriver.inject.message.ReactivateFrame = function() {
  goog.base(this, safaridriver.inject.message.ReactivateFrame.TYPE);
};
goog.inherits(safaridriver.inject.message.ReactivateFrame,
    safaridriver.message.Message);


/**
 * @type {string}
 * @const
 */
safaridriver.inject.message.ReactivateFrame.TYPE = 'reactivate-frame';


/**
 *
 * @param {!Object.<*>} data The JSON record object to create the message from.
 * @return {!safaridriver.inject.message.ReactivateFrame} The new message.
 * @private
 */
safaridriver.inject.message.ReactivateFrame.fromData_ = function(data) {
  return new safaridriver.inject.message.ReactivateFrame();
};


safaridriver.message.registerMessageType(
    safaridriver.inject.message.Activate.TYPE,
    safaridriver.inject.message.Activate.fromData_);
safaridriver.message.registerMessageType(
    safaridriver.inject.message.ActivateFrame.TYPE,
    safaridriver.inject.message.ActivateFrame.fromData_);
safaridriver.message.registerMessageType(
    safaridriver.inject.message.ReactivateFrame.TYPE,
    safaridriver.inject.message.ReactivateFrame.fromData_);
