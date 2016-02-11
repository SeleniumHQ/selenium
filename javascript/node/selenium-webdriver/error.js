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

'use strict';

/**
 * The base WebDriver error type. This error type is only used directly when a
 * more appropriate category is not defined for the offending error.
 */
class WebDriverError extends Error {
  /** @param {string=} opt_error the error message, if any. */
  constructor(opt_error) {
    super(opt_error);

    /** @override */
    this.name = this.constructor.name;
  }

  /**
   * @return {number} the legacy numeric code for this class of error.
   * @deprecated
   */
  static get code() {
    return ErrorCode.UNKNOWN_ERROR;
  }

  /**
   * @return {number} the legacy numeric code for this class of error.
   * @deprecated
   */
  get code() {
    return this.constructor.code;
  }
}


/**
 * An attempt was made to select an element that cannot be selected.
 */
class ElementNotSelectableError extends WebDriverError {
  /** @param {string=} opt_error the error message, if any. */
  constructor(opt_error) {
    super(opt_error);
  }

  /** @override */
  static get code() {
    return ErrorCode.ELEMENT_NOT_SELECTABLE;
  }
}


/**
 * An element command could not be completed because the element is not visible
 * on the page.
 */
class ElementNotVisibleError extends WebDriverError {
  /** @param {string=} opt_error the error message, if any. */
  constructor(opt_error) {
    super(opt_error);
  }

  /** @override */
  static get code() {
    return ErrorCode.ELEMENT_NOT_VISIBLE;
  }
}


/**
 * The arguments passed to a command are either invalid or malformed.
 */
class InvalidArgumentError extends WebDriverError {
  /** @param {string=} opt_error the error message, if any. */
  constructor(opt_error) {
    super(opt_error);
  }
}


/**
 * An illegal attempt was made to set a cookie under a different domain than
 * the current page.
 */
class InvalidCookieDomainError extends WebDriverError {
  /** @param {string=} opt_error the error message, if any. */
  constructor(opt_error) {
    super(opt_error);
  }

  /** @override */
  static get code() {
    return ErrorCode.INVALID_COOKIE_DOMAIN;
  }
}


/**
 * The coordinates provided to an interactions operation are invalid.
 */
class InvalidElementCoordinatesError extends WebDriverError {
  /** @param {string=} opt_error the error message, if any. */
  constructor(opt_error) {
    super(opt_error);
  }

  /** @override */
  static get code() {
    return ErrorCode.INVALID_ELEMENT_COORDINATES;
  }
}


/**
 * An element command could not be completed because the element is in an
 * invalid state, e.g. attempting to click an element that is no longer attached
 * to the document.
 */
class InvalidElementStateError extends WebDriverError {
  /** @param {string=} opt_error the error message, if any. */
  constructor(opt_error) {
    super(opt_error);
  }

  /** @override */
  static get code() {
    return ErrorCode.INVALID_ELEMENT_STATE;
  }
}


/**
 * Argument was an invalid selector.
 */
class InvalidSelectorError extends WebDriverError {
  /** @param {string=} opt_error the error message, if any. */
  constructor(opt_error) {
    super(opt_error);
  }

  /** @override */
  static get code() {
    return ErrorCode.INVALID_SELECTOR_ERROR;
  }
}


/**
 * Occurs if the given session id is not in the list of active sessions, meaning
 * the session either does not exist or that it’s not active.
 */
class InvalidSessionIdError extends WebDriverError {
  /** @param {string=} opt_error the error message, if any. */
  constructor(opt_error) {
    super(opt_error);
  }
}


/**
 * An error occurred while executing JavaScript supplied by the user.
 */
class JavascriptError extends WebDriverError {
  /** @param {string=} opt_error the error message, if any. */
  constructor(opt_error) {
    super(opt_error);
  }

  /** @override */
  static get code() {
    return ErrorCode.JAVASCRIPT_ERROR;
  }
}


/**
 * The target for mouse interaction is not in the browser’s viewport and cannot
 * be brought into that viewport.
 */
class MoveTargetOutOfBoundsError extends WebDriverError {
  /** @param {string=} opt_error the error message, if any. */
  constructor(opt_error) {
    super(opt_error);
  }

  /** @override */
  static get code() {
    return ErrorCode.MOVE_TARGET_OUT_OF_BOUNDS;
  }
}


/**
 * An attempt was made to operate on a modal dialog when one was not open.
 */
class NoSuchAlertError extends WebDriverError {
  /** @param {string=} opt_error the error message, if any. */
  constructor(opt_error) {
    super(opt_error);
  }

  /** @override */
  static get code() {
    return ErrorCode.NO_SUCH_ALERT;
  }
}


/**
 * An element could not be located on the page using the given search
 * parameters.
 */
class NoSuchElementError extends WebDriverError {
  /** @param {string=} opt_error the error message, if any. */
  constructor(opt_error) {
    super(opt_error);
  }

  /** @override */
  static get code() {
    return ErrorCode.NO_SUCH_ELEMENT;
  }
}


/**
 * A request to switch to a frame could not be satisfied because the frame
 * could not be found.
 */
class NoSuchFrameError extends WebDriverError {
  /** @param {string=} opt_error the error message, if any. */
  constructor(opt_error) {
    super(opt_error);
  }

  /** @override */
  static get code() {
    return ErrorCode.NO_SUCH_FRAME;
  }
}


/**
 * A request to switch to a window could not be satisfied because the window
 * could not be found.
 */
class NoSuchWindowError extends WebDriverError {
  /** @param {string=} opt_error the error message, if any. */
  constructor(opt_error) {
    super(opt_error);
  }

  /** @override */
  static get code() {
    return ErrorCode.NO_SUCH_WINDOW;
  }
}


/**
 * A script did not complete before its timeout expired.
 */
class ScriptTimeoutError extends WebDriverError {
  /** @param {string=} opt_error the error message, if any. */
  constructor(opt_error) {
    super(opt_error);
  }

  /** @override */
  static get code() {
    return ErrorCode.SCRIPT_TIMEOUT;
  }
}


/**
 * A new session could not be created.
 */
class SessionNotCreatedError extends WebDriverError {
  /** @param {string=} opt_error the error message, if any. */
  constructor(opt_error) {
    super(opt_error);
  }

  /** @override */
  static get code() {
    return ErrorCode.SESSION_NOT_CREATED;
  }
}



/**
 * An element command failed because the referenced element is no longer
 * attached to the DOM.
 */
class StaleElementReferenceError extends WebDriverError {
  /** @param {string=} opt_error the error message, if any. */
  constructor(opt_error) {
    super(opt_error);
  }

  /** @override */
  static get code() {
    return ErrorCode.STALE_ELEMENT_REFERENCE;
  }
}


/**
 * An operation did not complete before its timeout expired.
 */
class TimeoutError extends WebDriverError {
  /** @param {string=} opt_error the error message, if any. */
  constructor(opt_error) {
    super(opt_error);
  }

  /** @override */
  static get code() {
    return ErrorCode.TIMEOUT;
  }
}


/**
 * A request to set a cookie’s value could not be satisfied.
 */
class UnableToSetCookieError extends WebDriverError {
  /** @param {string=} opt_error the error message, if any. */
  constructor(opt_error) {
    super(opt_error);
  }

  /** @override */
  static get code() {
    return ErrorCode.UNABLE_TO_SET_COOKIE;
  }
}


/**
 * A screen capture operation was not possible.
 */
class UnableToCaptureScreenError extends WebDriverError {
  /** @param {string=} opt_error the error message, if any. */
  constructor(opt_error) {
    super(opt_error);
  }
}


/**
 * A modal dialog was open, blocking this operation.
 */
class UnexpectedAlertOpenError extends WebDriverError {
  /**
   * @param {string=} opt_error the error message, if any.
   * @param {string=} opt_text the text of the open dialog, if available.
   */
  constructor(opt_error, opt_text) {
    super(opt_error);

    /** @private {(string|undefined)} */
    this.text_ = opt_text;
  }

  /** @override */
  static get code() {
    return ErrorCode.UNEXPECTED_ALERT_OPEN;
  }

  /**
   * @return {(string|undefined)} The text displayed with the unhandled alert,
   *     if available.
   */
  getAlertText() {
    return this.text_;
  }
}


/**
 * A command could not be executed because the remote end is not aware of it.
 */
class UnknownCommandError extends WebDriverError {
  /** @param {string=} opt_error the error message, if any. */
  constructor(opt_error) {
    super(opt_error);
  }

  /** @override */
  static get code() {
    return ErrorCode.UNSUPPORTED_OPERATION;
  }
}


/**
 * The requested command matched a known URL but did not match an method for
 * that URL.
 */
class UnknownMethodError extends WebDriverError {
  /** @param {string=} opt_error the error message, if any. */
  constructor(opt_error) {
    super(opt_error);
  }

  /** @override */
  static get code() {
    return ErrorCode.UNSUPPORTED_OPERATION;
  }
}


/**
 * Reports an unsupport operation.
 */
class UnsupportedOperationError extends WebDriverError {
  /** @param {string=} opt_error the error message, if any. */
  constructor(opt_error) {
    super(opt_error);
  }

  /** @override */
  static get code() {
    return ErrorCode.UNSUPPORTED_OPERATION;
  }
}

// TODO(jleyba): Define UnknownError as an alias of WebDriverError?


/**
 * Enum of legacy error codes.
 * TODO: remove this when all code paths have been switched to the new error
 * types.
 * @deprecated
 * @enum {number}
 */
const ErrorCode = {
  SUCCESS: 0,
  NO_SUCH_ELEMENT: 7,
  NO_SUCH_FRAME: 8,
  UNKNOWN_COMMAND: 9,
  UNSUPPORTED_OPERATION: 9,
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
  UNEXPECTED_ALERT_OPEN: 26,
  NO_SUCH_ALERT: 27,
  SCRIPT_TIMEOUT: 28,
  INVALID_ELEMENT_COORDINATES: 29,
  IME_NOT_AVAILABLE: 30,
  IME_ENGINE_ACTIVATION_FAILED: 31,
  INVALID_SELECTOR_ERROR: 32,
  SESSION_NOT_CREATED: 33,
  MOVE_TARGET_OUT_OF_BOUNDS: 34,
  SQL_DATABASE_ERROR: 35,
  INVALID_XPATH_SELECTOR: 51,
  INVALID_XPATH_SELECTOR_RETURN_TYPE: 52,
  METHOD_NOT_ALLOWED: 405
};


const LEGACY_ERROR_CODE_TO_TYPE = new Map([
    [ErrorCode.NO_SUCH_ELEMENT, NoSuchElementError],
    [ErrorCode.NO_SUCH_FRAME, NoSuchFrameError],
    [ErrorCode.UNSUPPORTED_OPERATION, UnsupportedOperationError],
    [ErrorCode.STALE_ELEMENT_REFERENCE, StaleElementReferenceError],
    [ErrorCode.ELEMENT_NOT_VISIBLE, ElementNotVisibleError],
    [ErrorCode.INVALID_ELEMENT_STATE, InvalidElementStateError],
    [ErrorCode.UNKNOWN_ERROR, WebDriverError],
    [ErrorCode.ELEMENT_NOT_SELECTABLE, ElementNotSelectableError],
    [ErrorCode.JAVASCRIPT_ERROR, JavascriptError],
    [ErrorCode.XPATH_LOOKUP_ERROR, InvalidSelectorError],
    [ErrorCode.TIMEOUT, TimeoutError],
    [ErrorCode.NO_SUCH_WINDOW, NoSuchWindowError],
    [ErrorCode.INVALID_COOKIE_DOMAIN, InvalidCookieDomainError],
    [ErrorCode.UNABLE_TO_SET_COOKIE, UnableToSetCookieError],
    [ErrorCode.UNEXPECTED_ALERT_OPEN, UnexpectedAlertOpenError],
    [ErrorCode.NO_SUCH_ALERT, NoSuchAlertError],
    [ErrorCode.SCRIPT_TIMEOUT, ScriptTimeoutError],
    [ErrorCode.INVALID_ELEMENT_COORDINATES, InvalidElementCoordinatesError],
    [ErrorCode.INVALID_SELECTOR_ERROR, InvalidSelectorError],
    [ErrorCode.SESSION_NOT_CREATED, SessionNotCreatedError],
    [ErrorCode.MOVE_TARGET_OUT_OF_BOUNDS, MoveTargetOutOfBoundsError],
    [ErrorCode.INVALID_XPATH_SELECTOR, InvalidSelectorError],
    [ErrorCode.INVALID_XPATH_SELECTOR_RETURN_TYPE, InvalidSelectorError],
    [ErrorCode.METHOD_NOT_ALLOWED, UnsupportedOperationError]]);


const ERROR_CODE_TO_TYPE = new Map([
    ['unknown error', WebDriverError],
    ['element not selectable', ElementNotSelectableError],
    ['element not visible', ElementNotVisibleError],
    ['invalid argument', InvalidArgumentError],
    ['invalid cookie domain', InvalidCookieDomainError],
    ['invalid element coordinates', InvalidElementCoordinatesError],
    ['invalid element state', InvalidElementStateError],
    ['invalid selector', InvalidSelectorError],
    ['invalid session id', InvalidSessionIdError],
    ['javascript error', JavascriptError],
    ['move target out of bounds', MoveTargetOutOfBoundsError],
    ['no such alert', NoSuchAlertError],
    ['no such element', NoSuchElementError],
    ['no such frame', NoSuchFrameError],
    ['no such window', NoSuchWindowError],
    ['script timeout', ScriptTimeoutError],
    ['session not created', SessionNotCreatedError],
    ['stale element reference', StaleElementReferenceError],
    ['timeout', TimeoutError],
    ['unable to set cookie', UnableToSetCookieError],
    ['unable to capture screen', UnableToCaptureScreenError],
    ['unexpected alert open', UnexpectedAlertOpenError],
    ['unknown command', UnknownCommandError],
    ['unknown method', UnknownMethodError],
    ['unsupported operation', UnsupportedOperationError]]);


/**
 * Checks a response object from a server that adheres to the W3C WebDriver
 * protocol.
 * @param {*} data The response data to check.
 * @return {*} The response data if it was not an encoded error.
 * @throws {WebDriverError} the decoded error, if present in the data object.
 * @see https://w3c.github.io/webdriver/webdriver-spec.html#protocol
 */
function checkResponse(data) {
  if (data && typeof data.error === 'string') {
    let ctor = ERROR_CODE_TO_TYPE.get(data.error) || WebDriverError;
    throw new ctor(data.message);
  }
  return data;
}


/**
 * Checks a legacy response from the Selenium 2.0 wire protocol for an error.
 * @param {*} responseObj the response object to check.
 * @return {*} responseObj the original response if it does not define an error.
 * @throws {WebDriverError} if the response object defines an error.
 */
function checkLegacyResponse(responseObj) {
  // Handle the legacy Selenium error response format.
  if (responseObj
      && typeof responseObj === 'object'
      && typeof responseObj['status'] === 'number'
      && responseObj['status'] !== 0) {
    let status = responseObj['status'];
    let ctor = LEGACY_ERROR_CODE_TO_TYPE.get(status) || WebDriverError;

    let value = responseObj['value'];

    if (!value || typeof value !== 'object') {
      throw new ctor(value + '');
    } else {
      throw new ctor(value['message'] + '');
    }
  }
  return responseObj;
}


// PUBLIC API


exports.ErrorCode = ErrorCode;

exports.WebDriverError = WebDriverError;
exports.ElementNotSelectableError = ElementNotSelectableError;
exports.ElementNotVisibleError = ElementNotVisibleError;
exports.InvalidArgumentError = InvalidArgumentError;
exports.InvalidCookieDomainError = InvalidCookieDomainError;
exports.InvalidElementCoordinatesError = InvalidElementCoordinatesError;
exports.InvalidElementStateError = InvalidElementStateError;
exports.InvalidSelectorError = InvalidSelectorError;
exports.InvalidSessionIdError = InvalidSessionIdError;
exports.JavascriptError = JavascriptError;
exports.MoveTargetOutOfBoundsError = MoveTargetOutOfBoundsError;
exports.NoSuchAlertError = NoSuchAlertError;
exports.NoSuchElementError = NoSuchElementError;
exports.NoSuchFrameError = NoSuchFrameError;
exports.NoSuchWindowError = NoSuchWindowError;
exports.ScriptTimeoutError = ScriptTimeoutError;
exports.SessionNotCreatedError = SessionNotCreatedError;
exports.StaleElementReferenceError = StaleElementReferenceError;
exports.TimeoutError = TimeoutError;
exports.UnableToSetCookieError = UnableToSetCookieError;
exports.UnableToCaptureScreenError = UnableToCaptureScreenError;
exports.UnexpectedAlertOpenError = UnexpectedAlertOpenError;
exports.UnknownCommandError = UnknownCommandError;
exports.UnknownMethodError = UnknownMethodError;
exports.UnsupportedOperationError = UnsupportedOperationError;

exports.checkResponse = checkResponse;
exports.checkLegacyResponse = checkLegacyResponse;
