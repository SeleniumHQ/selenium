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
   * @return {string} the code for this class of error.
   * @see https://w3c.github.io/webdriver/webdriver-spec.html#handling-errors
   */
  static get code() {
    return 'unknown error';
  }

  /**
   * @return {string} the code for this class of error.
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
    return 'element not selectable';
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
    return 'element not visible';
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

  /** @override */
  static get code() {
    return 'invalid argument';
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
    return 'invalid cookie domain';
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
    return 'invalid element coordinates';
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
    return 'invalid element state';
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
    return 'invalid selector';
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

  /** @override */
  static get code() {
    return 'invalid session id';
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
    return 'javascript error';
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
    return 'move target out of bounds';
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
    return 'no such alert';
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
    return 'no such element';
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
    return 'no such frame';
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
    return 'no such window';
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
    return 'script timeout  ';
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
    return 'session not created';
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
    return 'stale element reference';
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
    return 'timeout';
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
    return 'unable to set cookie';
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

  /** @override */
  static get code() {
    return 'unable to capture screen';
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
    return 'unexpected alert open';
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
    return 'unknown command';
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
    return 'unknown method';
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
    return 'unsupported operation';
  }
}

// TODO(jleyba): Define UnknownError as an alias of WebDriverError?


const LEGACY_ERROR_CODE_TO_CLASS = new Map();
LEGACY_ERROR_CODE_TO_CLASS.set(7, NoSuchElementError);
LEGACY_ERROR_CODE_TO_CLASS.set(8, NoSuchFrameError);
LEGACY_ERROR_CODE_TO_CLASS.set(9, UnknownCommandError);
LEGACY_ERROR_CODE_TO_CLASS.set(10, StaleElementReferenceError);
LEGACY_ERROR_CODE_TO_CLASS.set(11, ElementNotVisibleError);
LEGACY_ERROR_CODE_TO_CLASS.set(12, InvalidElementStateError);
LEGACY_ERROR_CODE_TO_CLASS.set(13, WebDriverError);
LEGACY_ERROR_CODE_TO_CLASS.set(15, ElementNotSelectableError);
LEGACY_ERROR_CODE_TO_CLASS.set(17, JavascriptError);
LEGACY_ERROR_CODE_TO_CLASS.set(19, InvalidSelectorError);
LEGACY_ERROR_CODE_TO_CLASS.set(21, TimeoutError);
LEGACY_ERROR_CODE_TO_CLASS.set(23, NoSuchWindowError);
LEGACY_ERROR_CODE_TO_CLASS.set(24, InvalidCookieDomainError);
LEGACY_ERROR_CODE_TO_CLASS.set(25, UnableToSetCookieError);
LEGACY_ERROR_CODE_TO_CLASS.set(26, UnexpectedAlertOpenError);
LEGACY_ERROR_CODE_TO_CLASS.set(27, NoSuchAlertError);
LEGACY_ERROR_CODE_TO_CLASS.set(28, ScriptTimeoutError);
LEGACY_ERROR_CODE_TO_CLASS.set(29, InvalidElementCoordinatesError);
LEGACY_ERROR_CODE_TO_CLASS.set(32, InvalidSelectorError);
LEGACY_ERROR_CODE_TO_CLASS.set(33, SessionNotCreatedError);
LEGACY_ERROR_CODE_TO_CLASS.set(34, MoveTargetOutOfBoundsError);
LEGACY_ERROR_CODE_TO_CLASS.set(51, InvalidSelectorError);
LEGACY_ERROR_CODE_TO_CLASS.set(52, InvalidSelectorError);
LEGACY_ERROR_CODE_TO_CLASS.set(405, UnknownCommandError);


const REGISTRY = new Map();
function registerError(ctor) {
  REGISTRY.set(ctor.code, ctor);
}
registerError(WebDriverError);
registerError(ElementNotSelectableError);
registerError(ElementNotVisibleError);
registerError(InvalidArgumentError);
registerError(InvalidCookieDomainError);
registerError(InvalidElementCoordinatesError);
registerError(InvalidElementStateError);
registerError(InvalidSelectorError);
registerError(InvalidSessionIdError);
registerError(JavascriptError);
registerError(MoveTargetOutOfBoundsError);
registerError(NoSuchAlertError);
registerError(NoSuchElementError);
registerError(NoSuchFrameError);
registerError(NoSuchWindowError);
registerError(ScriptTimeoutError);
registerError(SessionNotCreatedError);
registerError(StaleElementReferenceError);
registerError(TimeoutError);
registerError(UnableToSetCookieError);
registerError(UnableToCaptureScreenError);
registerError(UnexpectedAlertOpenError);
registerError(UnknownCommandError);
registerError(UnknownMethodError);
registerError(UnsupportedOperationError);



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
    let ctor = REGISTRY.get(data.error) || WebDriverError;
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
    let ctor = LEGACY_ERROR_CODE_TO_CLASS.get(status) || WebDriverError;

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


/**
 * Enum of legacy error codes.
 * TODO: remove this when all code paths have been switched to the new error
 * types.
 * @deprecated
 * @enum {number}
 */
exports.ErrorCode = {
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
