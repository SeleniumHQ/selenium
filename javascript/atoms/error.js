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

goog.require('goog.debug.Error');
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
  NO_SUCH_WINDOW: 23,
  INVALID_COOKIE_DOMAIN: 24,
  UNABLE_TO_SET_COOKIE: 25,
  MODAL_DIALOG_OPENED: 26,
  MODAL_DIALOG_OPEN: 27,
  SCRIPT_TIMEOUT: 28,
  INVALID_SELECTOR_ERROR: 32
};



/**
 * Error extension that includes error status codes from the WebDriver wire
 * protocol:
 * http://code.google.com/p/selenium/wiki/JsonWireProtocol#Response_Status_Codes
 *
 * @param {!bot.ErrorCode} code The error's status code.
 * @param {string} opt_message Optional error message.
 * @constructor
 * @extends {goog.debug.Error}
 */
bot.Error = function(code, opt_message) {
  goog.base(this, opt_message);

  /**
   * This error's status code.
   * @type {!bot.ErrorCode}
   */
  this.code = code;

  /** @inheritDoc */
  this.name = (/**@type {string}*/ bot.Error.NAMES_[code] ||
      bot.Error.NAMES_[bot.ErrorCode.UNKNOWN_ERROR]);
};
goog.inherits(bot.Error, goog.debug.Error);


/**
 * A map of error codes to error names.
 * @type {Object.<bot.ErrorCode, String>}
 * @const
 * @private
 */
bot.Error.NAMES_ = goog.object.transpose({
  'NoSuchElementError': bot.ErrorCode.NO_SUCH_ELEMENT,
  'NoSuchFrameError': bot.ErrorCode.NO_SUCH_FRAME,
  'UnknownCommandError': bot.ErrorCode.UNKNOWN_COMMAND,
  'StaleElementReferenceError': bot.ErrorCode.STALE_ELEMENT_REFERENCE,
  'ElementNotVisibleError': bot.ErrorCode.ELEMENT_NOT_VISIBLE,
  'InvalidElementStateError': bot.ErrorCode.INVALID_ELEMENT_STATE,
  'UnknownError': bot.ErrorCode.UNKNOWN_ERROR,
  'ElementNotSelectableError': bot.ErrorCode.ELEMENT_NOT_SELECTABLE,
  'XPathLookupError': bot.ErrorCode.XPATH_LOOKUP_ERROR,
  'NoSuchWindowError': bot.ErrorCode.NO_SUCH_WINDOW,
  'InvalidCookieDomainError': bot.ErrorCode.INVALID_COOKIE_DOMAIN,
  'UnableToSetCookieError': bot.ErrorCode.UNABLE_TO_SET_COOKIE,
  'ModalDialogOpenedError': bot.ErrorCode.MODAL_DIALOG_OPENED,
  'ModalDialogOpenError': bot.ErrorCode.MODAL_DIALOG_OPEN,
  'ScriptTimeoutError': bot.ErrorCode.SCRIPT_TIMEOUT
});


/**
 * Flag used for duck-typing when this code is embedded in a Firefox extension.
 * This is required since an Error thrown in one component and the reported
 * to another will fail instanceof checks in the second component.
 * @type {boolean}
 */
bot.Error.prototype.isAutomationError = true;


if (goog.DEBUG) {
  /** @return {string} The string representation of this error. */
  bot.Error.prototype.toString = function() {
    return '[' + this.name + '] ' + this.message;
  };
}
