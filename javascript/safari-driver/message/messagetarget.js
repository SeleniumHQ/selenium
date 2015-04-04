// Licensed to the Software Freedom Conservancy (SFC) under one
// or more contributor license agreements.  See the NOTICE file
// distributed with this work for additional information
// regarding copyright ownership.  The SFC licenses this file
// to you under the Apache License, Version 2.0 (the
// "License"); you may not use this file except in compliance
// with the License.  You may obtain a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing,
// software distributed under the License is distributed on an
// "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
// KIND, either express or implied.  See the License for the
// specific language governing permissions and limitations
// under the License.

goog.provide('safaridriver.message.MessageTarget');

goog.require('bot.json');
goog.require('goog.log');
goog.require('safaridriver.message');
goog.require('safaridriver.message.Message');
goog.require('webdriver.EventEmitter');



/**
 * Emits events whenever a {@link safaridriver.message.Message} is received.
 * The message type will be used as the emitted event type, and the message
 * and original event that delivered the message will be included as arguments.
 * @param {!(SafariEventTarget|EventTarget)} source The object that should be
 *     used as the source of messages.
 * @param {boolean=} opt_consumeMessages Whether message events should have
 *     their propagation chain halted when received by this listener.
 * @constructor
 * @extends {webdriver.EventEmitter}
 */
safaridriver.message.MessageTarget = function(source, opt_consumeMessages) {
  goog.base(this);

  /** @private {!(SafariEventTarget|EventTarget)} */
  this.source_ = source;

  /** @private {goog.debug.Logger} */
  this.log_ = goog.log.getLogger('safaridriver.message.MessageTarget');

  /**
   * @private {function(this: safaridriver.message.MessageTarget,
   *                    !(SafariExtensionMessageEvent|MessageEvent.<*>))}
   */
  this.boundOnMessage_ = goog.bind(this.onMessage_, this);

  /** @private {boolean} */
  this.consumeMessages_ = !!opt_consumeMessages;

  this.source_.addEventListener('message', this.boundOnMessage_, true);
  this.source_.addEventListener(
      safaridriver.message.Message.SYNCHRONOUS_DOM_MESSAGE_EVENT_TYPE,
      this.boundOnMessage_, true);
};
goog.inherits(safaridriver.message.MessageTarget, webdriver.EventEmitter);


/**
 * @param {(string|goog.log.Logger)} nameOrLogger The logger to use, or its
 *     name.
 */
safaridriver.message.MessageTarget.prototype.setLogger = function(
    nameOrLogger) {
  this.log_ = goog.isString(nameOrLogger) ?
      goog.log.getLogger(/** @type {string} */ (nameOrLogger)) :
      /** @type {goog.log.Logger} */ (nameOrLogger);
};


/**
 * Removes all listeners from this instance and stops listening for messages
 * from this listener's source object.
 */
safaridriver.message.MessageTarget.prototype.dispose = function() {
  this.removeAllListeners();
  this.source_.removeEventListener('message', this.boundOnMessage_, true);
};


/**
 * @param {string} msg The message to log.
 * @param {goog.debug.Logger.Level=} opt_level The message level. Defaults to
 *     {@link goog.debug.Logger.Level.INFO}.
 * @param {Error=} opt_error An error to log with the message.
 */
safaridriver.message.MessageTarget.prototype.log = function(msg, opt_level,
    opt_error) {
  var level = opt_level || goog.debug.Logger.Level.INFO;
  goog.log.log(this.log_, level, msg, opt_error);
};


/**
 * Logs a configuration message.
 * @param {string} msg The message to log.
 * @param {Error=} opt_error An error to log with the message.
 */
safaridriver.message.MessageTarget.prototype.logConfig = function(
    msg, opt_error) {
  this.log(msg, goog.debug.Logger.Level.CONFIG, opt_error);
};


/**
 * Logs a warning message.
 * @param {string} msg The message to log.
 * @param {Error=} opt_error An error to log with the message.
 */
safaridriver.message.MessageTarget.prototype.logWarn = function(
    msg, opt_error) {
  this.log(msg, goog.debug.Logger.Level.WARNING, opt_error);
};


/**
 * Logs a severe message.
 * @param {string} msg The message to log.
 * @param {Error=} opt_error An error to log with the message.
 */
safaridriver.message.MessageTarget.prototype.logSevere = function(
    msg, opt_error) {
  this.log(msg, goog.debug.Logger.Level.SEVERE, opt_error);
};


/**
 * @param {!(SafariExtensionMessageEvent|MessageEvent.<*>)} e The message event.
 * @private
 */
safaridriver.message.MessageTarget.prototype.onMessage_ = function(e) {
  try {
    var message = safaridriver.message.fromEvent(e);
  } catch (ex) {
    return;
  }

  if (this.consumeMessages_) {
    e.stopImmediatePropagation();
  }
  this.emit(message.getType(), message, e);
};
