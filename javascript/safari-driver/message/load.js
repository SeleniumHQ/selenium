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
 * @fileoverview Defines the "load" and "unload" messages.
 */

goog.provide('safaridriver.message.BaseLoadMessage');
goog.provide('safaridriver.message.Load');
goog.provide('safaridriver.message.PendingFrame');
goog.provide('safaridriver.message.Unload');

goog.require('safaridriver.message');
goog.require('safaridriver.message.Message');



/**
 * The base class for messages that are related to "load" and "unload" events.
 * @param {string} type The message type.
 * @param {boolean=} opt_isFrame Whether this message is related to a frame
 *     rather than the top window.
 * @constructor
 * @extends {safaridriver.message.Message}
 */
safaridriver.message.BaseLoadMessage = function(type, opt_isFrame) {
  goog.base(this, type);
  this.setField(safaridriver.message.BaseLoadMessage.IS_FRAME_FIELD_,
      !!opt_isFrame);
};
goog.inherits(safaridriver.message.BaseLoadMessage,
    safaridriver.message.Message);


/**
 * @type {string}
 * @const
 * @private
 */
safaridriver.message.BaseLoadMessage.IS_FRAME_FIELD_ = 'isFrame';


/**
 * @return {boolean} Whether this message is from a frame or the top window.
 */
safaridriver.message.BaseLoadMessage.prototype.isFrame = function() {
  return !!this.getField(safaridriver.message.BaseLoadMessage.IS_FRAME_FIELD_);
};


/**
 * Defines a new load message.
 * @param {string} type The type of message.
 * @return {function(new:safaridriver.message.BaseLoadMessage, boolean=):
 *          safaridriver.message.BaseLoadMessage} The new message constructor.
 */
safaridriver.message.BaseLoadMessage.defineLoadMessageType = function(type) {
  /**
   * @param {boolean=} opt_isFrame Whether this message is related to a frame
   *     rather than the top window.
   * @constructor
   * @extends {safaridriver.message.BaseLoadMessage}
   */
  var loadCtor = function(opt_isFrame) {
    goog.base(this, type, opt_isFrame);
  };
  goog.inherits(loadCtor, safaridriver.message.BaseLoadMessage);

  /**
   * @type {string}
   * @const
   */
  loadCtor.TYPE = type;

  /**
   * @param {!Object.<*>} data The JSON object to load from.
   * @return {!safaridriver.message.BaseLoadMessage} The new message.
   */
  function fromData(data) {
    var isFrame = !!data[safaridriver.message.BaseLoadMessage.IS_FRAME_FIELD_];
    return new loadCtor(isFrame);
  }

  safaridriver.message.registerMessageType(type, fromData);
  return loadCtor;
};



/**
 * @param {boolean=} opt_isFrame Whether this message is related to a frame
 *     rather than the top window.
 * @constructor
 * @extends {safaridriver.message.BaseLoadMessage}
 */
safaridriver.message.Load =
    safaridriver.message.BaseLoadMessage.defineLoadMessageType('load');



/**
 * Message used to query the extension if the sending tab has an active frame
 * that is currently loading. This message may only be sent synchronously.
 * @param {boolean=} opt_isFrame Whether this message is related to a frame
 *     rather than the top window.
 * @constructor
 * @extends {safaridriver.message.BaseLoadMessage}
 */
safaridriver.message.PendingFrame =
    safaridriver.message.BaseLoadMessage.defineLoadMessageType('pendingFrame');


/** @override */
safaridriver.message.PendingFrame.prototype.send = function() {
  throw Error('This message may only be sent synchronously.');
};



/**
 * @param {boolean=} opt_isFrame Whether this message is related to a frame
 *     rather than the top window.
 * @constructor
 * @extends {safaridriver.message.BaseLoadMessage}
 */
safaridriver.message.Unload =
    safaridriver.message.BaseLoadMessage.defineLoadMessageType('unload');
