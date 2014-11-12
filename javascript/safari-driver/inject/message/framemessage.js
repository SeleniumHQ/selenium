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
goog.require('safaridriver.message.BaseCommandMessage');



/**
 * Message used to signal when a new frame has, or should, activate itself as
 * the target for future commands.
 * @param {!safaridriver.Command} command The command associated with this
 *     message.
 * @constructor
 * @extends {safaridriver.message.BaseCommandMessage}
 */
safaridriver.inject.message.Activate =
    safaridriver.message.BaseCommandMessage.defineCommandMessageType(
        'activate');



/**
 * Message used to inform the top frame that one of its descendants has been
 * activated.
 * @param {!safaridriver.Command} command The command associated with this
 *     message.
 * @constructor
 * @extends {safaridriver.message.BaseCommandMessage}
 */
safaridriver.inject.message.ActivateFrame =
    safaridriver.message.BaseCommandMessage.defineCommandMessageType(
        'activate-frame');



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
    safaridriver.inject.message.ReactivateFrame.TYPE,
    safaridriver.inject.message.ReactivateFrame.fromData_);
