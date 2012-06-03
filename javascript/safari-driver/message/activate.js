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
 * @fileoverview Defines the "activate" and "deactivate" message types.
 */

goog.provide('safaridriver.message.ActivateMessage');

goog.require('safaridriver.message');
goog.require('safaridriver.message.Message');


/**
 * Simple message used to signal when a new frame has, or should, activate
 * itself as the target for future commands.
 * @constructor
 * @extends {safaridriver.message.Message}
 */
safaridriver.message.ActivateMessage = function() {
  goog.base(this, safaridriver.message.ActivateMessage.TYPE);
};
goog.inherits(safaridriver.message.ActivateMessage,
    safaridriver.message.Message);


/**
 * @type {string}
 * @const
 */
safaridriver.message.ActivateMessage.TYPE = 'activate';


/**
 *
 * @param {!Object.<*>} data The JSON record object to create the message from.
 * @return {!safaridriver.message.ActivateMessage} The new message.
 * @private
 */
safaridriver.message.ActivateMessage.fromData_ = function(data) {
  return new safaridriver.message.ActivateMessage();
};


safaridriver.message.registerMessageType(
    safaridriver.message.ActivateMessage.TYPE,
    safaridriver.message.ActivateMessage.fromData_);
