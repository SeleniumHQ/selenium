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

goog.provide('safaridriver.message.MessageTarget');

goog.require('goog.debug.Logger');
goog.require('safaridriver.message');
goog.require('webdriver.EventEmitter');



/**
 * Emits events whenever a {@link safaridriver.message.Message} is received.
 * The message type will be used as the emitted event type, and the message
 * and original event that delivered the message will be included as arguments.
 * @param {!(SafariEventTarget|EventTarget)} source The object that should be
 *     used as the source of messages.
 * @constructor
 * @extends {webdriver.EventEmitter}
 */
safaridriver.message.MessageTarget = function(source) {
  goog.base(this);

  /**
   * @type {!(SafariEventTarget|EventTarget)}
   * @private
   */
  this.source_ = source;

  /**
   * @type {!goog.debug.Logger}
   * @private
   */
  this.log_ = goog.debug.Logger.getLogger(
      'safaridriver.message.MessageTarget');

  /**
   * @type {function(this: safaridriver.message.MessageTarget,
   *                 !(SafariExtensionMessageEvent|MessageEvent))}
   * @private
   */
  this.boundOnMessage_ = goog.bind(this.onMessage_, this);

  this.source_.addEventListener('message', this.boundOnMessage_, true);
};
goog.inherits(safaridriver.message.MessageTarget, webdriver.EventEmitter);


/**
 * @param {(string|!goog.debug.Logger)} nameOrLogger The logger to use, or its
 *     name.
 */
safaridriver.message.MessageTarget.prototype.setLogger = function(
    nameOrLogger) {
  this.log_ = goog.isString(nameOrLogger) ?
      goog.debug.Logger.getLogger((/** @type {string} */nameOrLogger)) :
      (/** @type {!goog.debug.Logger} */nameOrLogger);
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
  this.log_.log(level, msg, opt_error);
};


/**
 * @param {!(SafariExtensionMessageEvent|MessageEvent)} e The message event.
 * @private
 */
safaridriver.message.MessageTarget.prototype.onMessage_ = function(e) {
  try {
    var message = safaridriver.message.fromEvent(e);
  } catch (ex) {
    var name = e.name ? e.name + ': ' : '';
    this.log(
        'Unable to parse message: ' + name +
            JSON.stringify(e.message || e.data),
        goog.debug.Logger.Level.SEVERE,
        ex);
    return;
  }

  this.emit(message.getType(), message, e);
};
