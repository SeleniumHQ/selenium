// Copyright 2010 WebDriver committers
// Copyright 2010 Google Inc.
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
 * @fileoverview Utilities for working with errors as defined by WebDriver's
 * wire protocol: http://code.google.com/p/selenium/wiki/JsonWireProtocol.
 */

goog.provide('bot.Error');
goog.provide('bot.ErrorCode');

goog.require('goog.object');


/**
 * Error codes from the WebDriver wire protocol:
 * http://code.google.com/p/selenium/wiki/JsonWireProtocol#Response_Status_Codes
 *
 * @enum {number}
 */
bot.ErrorCode = {
  SUCCESS: 0,  // Included for completeness

  NO_SUCH_ELEMENT: 7,
  NO_SUCH_FRAME: 8,
  UNKNOWN_COMMAND: 9,
  UNSUPPORTED_OPERATION: 9,  // Alias.
  STALE_ELEMENT_REFERENCE: 10,
  ELEMENT_NOT_VISIBLE: 11,
  INVALID_ELEMENT_STATE: 12,
  UNKNOWN_ERROR: 13,
  ELEMENT_NOT_SELECTABLE: 15,
  JAVASCRIPT_ERROR: 17,
  XPATH_LOOKUP_ERROR: 19,
  TIMEOUT: 21,
  NO_SUCH_WINDOW: 23,
  INVALID_COOKIE_DOMAIN: 24,
  UNABLE_TO_SET_COOKIE: 25,
  MODAL_DIALOG_OPENED: 26,
  NO_MODAL_DIALOG_OPEN: 27,
  SCRIPT_TIMEOUT: 28,
  INVALID_ELEMENT_COORDINATES: 29,
  IME_NOT_AVAILABLE: 30,
  IME_ENGINE_ACTIVATION_FAILED: 31,
  INVALID_SELECTOR_ERROR: 32,
  SESSION_NOT_CREATED: 33,
  MOVE_TARGET_OUT_OF_BOUNDS: 34,
  SQL_DATABASE_ERROR: 35
};



/**
 * Error extension that includes error status codes from the WebDriver wire
 * protocol:
 * http://code.google.com/p/selenium/wiki/JsonWireProtocol#Response_Status_Codes
 *
 * @param {!bot.ErrorCode} code The error's status code.
 * @param {string=} opt_message Optional error message.
 * @constructor
 * @extends {Error}
 */
bot.Error = function(code, opt_message) {

  /**
   * This error's status code.
   * @type {!bot.ErrorCode}
   */
  this.code = code;

  /** @override */
  this.message = opt_message || '';

  /** @override */
  this.name = (/**@type {string}*/ bot.Error.NAMES_[code] ||
      bot.Error.NAMES_[bot.ErrorCode.UNKNOWN_ERROR]);

  // Generate a stacktrace for our custom error; ensure the error has our
  // custom name and message so the stack prints correctly in all browsers.
  var template = new Error(this.message);
  template.name = this.name;

  /** @override */
  this.stack = template.stack || '';
};
goog.inherits(bot.Error, Error);


/**
 * A map of error codes to error names.
 * @type {!Object.<string>}
 * @const
 * @private
 */
bot.Error.NAMES_ = goog.object.create(
    bot.ErrorCode.NO_SUCH_ELEMENT, 'NoSuchElementError',
    bot.ErrorCode.NO_SUCH_FRAME, 'NoSuchFrameError',
    bot.ErrorCode.UNKNOWN_COMMAND, 'UnknownCommandError',
    bot.ErrorCode.STALE_ELEMENT_REFERENCE, 'StaleElementReferenceError',
    bot.ErrorCode.ELEMENT_NOT_VISIBLE, 'ElementNotVisibleError',
    bot.ErrorCode.INVALID_ELEMENT_STATE, 'InvalidElementStateError',
    bot.ErrorCode.UNKNOWN_ERROR, 'UnknownError',
    bot.ErrorCode.ELEMENT_NOT_SELECTABLE, 'ElementNotSelectableError',
    bot.ErrorCode.XPATH_LOOKUP_ERROR, 'XPathLookupError',
    bot.ErrorCode.NO_SUCH_WINDOW, 'NoSuchWindowError',
    bot.ErrorCode.INVALID_COOKIE_DOMAIN, 'InvalidCookieDomainError',
    bot.ErrorCode.UNABLE_TO_SET_COOKIE, 'UnableToSetCookieError',
    bot.ErrorCode.MODAL_DIALOG_OPENED, 'ModalDialogOpenedError',
    bot.ErrorCode.NO_MODAL_DIALOG_OPEN, 'NoModalDialogOpenError',
    bot.ErrorCode.SCRIPT_TIMEOUT, 'ScriptTimeoutError',
    bot.ErrorCode.INVALID_SELECTOR_ERROR, 'InvalidSelectorError',
    bot.ErrorCode.SQL_DATABASE_ERROR, 'SqlDatabaseError',
    bot.ErrorCode.MOVE_TARGET_OUT_OF_BOUNDS, 'MoveTargetOutOfBoundsError');


/**
 * Flag used for duck-typing when this code is embedded in a Firefox extension.
 * This is required since an Error thrown in one component and then reported
 * to another will fail instanceof checks in the second component.
 * @type {boolean}
 */
bot.Error.prototype.isAutomationError = true;


if (goog.DEBUG) {
  /** @return {string} The string representation of this error. */
  bot.Error.prototype.toString = function() {
    return this.name + ': ' + this.message;
  };
}
