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

/**
 * Error codes and utilities for working with errors as defined by the
 * W3C WebDriver protocol.
 * @see https://w3c.github.io/webdriver/webdriver-spec.html#handling-errors
 */

/**
 * Error codes from the W3C WebDriver protocol.
 * Maps to the standard HTTP and WebDriver error status codes.
 * @see https://w3c.github.io/webdriver/webdriver-spec.html#response-status-codes
 */
export enum ErrorCode {
    SUCCESS = 0,
    NO_SUCH_ELEMENT = 7,
    NO_SUCH_FRAME = 8,
    UNKNOWN_COMMAND = 9,
    UNSUPPORTED_OPERATION = 9,
    STALE_ELEMENT_REFERENCE = 10,
    ELEMENT_NOT_VISIBLE = 11,
    INVALID_ELEMENT_STATE = 12,
    UNKNOWN_ERROR = 13,
    ELEMENT_NOT_SELECTABLE = 15,
    JAVASCRIPT_ERROR = 17,
    XPATH_LOOKUP_ERROR = 19,
    TIMEOUT = 21,
    NO_SUCH_WINDOW = 23,
    INVALID_COOKIE_DOMAIN = 24,
    UNABLE_TO_SET_COOKIE = 25,
    UNEXPECTED_ALERT_OPEN = 26,
    NO_SUCH_ALERT = 27,
    SCRIPT_TIMEOUT = 28,
    INVALID_ELEMENT_COORDINATES = 29,
    IME_NOT_AVAILABLE = 30,
    IME_ENGINE_ACTIVATION_FAILED = 31,
    INVALID_SELECTOR_ERROR = 32,
    SESSION_NOT_CREATED = 33,
    MOVE_TARGET_OUT_OF_BOUNDS = 34,
    SQL_DATABASE_ERROR = 35,
    INVALID_XPATH_SELECTOR = 51,
    INVALID_XPATH_SELECTOR_RETURN_TYPE = 52,
    INVALID_ARGUMENT = 61,
    METHOD_NOT_ALLOWED = 405,
}

/**
 * Status strings enumerated in the W3C WebDriver protocol.
 * These are the standard error state names used when returning
 * error responses over the WebDriver protocol.
 * @see https://w3c.github.io/webdriver/webdriver-spec.html#handling-errors
 */
export enum ErrorState {
    ElementNotSelectable = 'element not selectable',
    ElementNotVisible = 'element not visible',
    InvalidArgument = 'invalid argument',
    InvalidCookieDomain = 'invalid cookie domain',
    InvalidElementCoordinates = 'invalid element coordinates',
    InvalidElementState = 'invalid element state',
    InvalidSelector = 'invalid selector',
    InvalidSessionId = 'invalid session id',
    JavaScriptError = 'javascript error',
    MoveTargetOutOfBounds = 'move target out of bounds',
    NoSuchAlert = 'no such alert',
    NoSuchElement = 'no such element',
    NoSuchFrame = 'no such frame',
    NoSuchWindow = 'no such window',
    ScriptTimeout = 'script timeout',
    SessionNotCreated = 'session not created',
    StaleElementReference = 'stale element reference',
    Timeout = 'timeout',
    UnableToSetCookie = 'unable to set cookie',
    UnexpectedAlertOpen = 'unexpected alert open',
    UnknownCommand = 'unknown command',
    UnknownError = 'unknown error',
    UnknownMethod = 'unknown method',
    UnsupportedOperation = 'unsupported operation',
}

/**
 * Maps error codes to their corresponding state strings.
 * Used to determine the proper error state when creating a WebDriverError.
 */
const CODE_TO_STATE = new Map<ErrorCode, ErrorState>([
    [ErrorCode.ELEMENT_NOT_SELECTABLE, ErrorState.ElementNotSelectable],
    [ErrorCode.ELEMENT_NOT_VISIBLE, ErrorState.ElementNotVisible],
    [ErrorCode.IME_ENGINE_ACTIVATION_FAILED, ErrorState.UnknownError],
    [ErrorCode.IME_NOT_AVAILABLE, ErrorState.UnknownError],
    [ErrorCode.INVALID_COOKIE_DOMAIN, ErrorState.InvalidCookieDomain],
    [ErrorCode.INVALID_ELEMENT_COORDINATES, ErrorState.InvalidElementCoordinates],
    [ErrorCode.INVALID_ELEMENT_STATE, ErrorState.InvalidElementState],
    [ErrorCode.INVALID_SELECTOR_ERROR, ErrorState.InvalidSelector],
    [ErrorCode.INVALID_XPATH_SELECTOR, ErrorState.InvalidSelector],
    [ErrorCode.INVALID_XPATH_SELECTOR_RETURN_TYPE, ErrorState.InvalidSelector],
    [ErrorCode.JAVASCRIPT_ERROR, ErrorState.JavaScriptError],
    [ErrorCode.METHOD_NOT_ALLOWED, ErrorState.UnsupportedOperation],
    [ErrorCode.MOVE_TARGET_OUT_OF_BOUNDS, ErrorState.MoveTargetOutOfBounds],
    [ErrorCode.NO_SUCH_ALERT, ErrorState.NoSuchAlert],
    [ErrorCode.NO_SUCH_ELEMENT, ErrorState.NoSuchElement],
    [ErrorCode.NO_SUCH_FRAME, ErrorState.NoSuchFrame],
    [ErrorCode.NO_SUCH_WINDOW, ErrorState.NoSuchWindow],
    [ErrorCode.SCRIPT_TIMEOUT, ErrorState.ScriptTimeout],
    [ErrorCode.SESSION_NOT_CREATED, ErrorState.SessionNotCreated],
    [ErrorCode.STALE_ELEMENT_REFERENCE, ErrorState.StaleElementReference],
    [ErrorCode.TIMEOUT, ErrorState.Timeout],
    [ErrorCode.UNABLE_TO_SET_COOKIE, ErrorState.UnableToSetCookie],
    [ErrorCode.UNEXPECTED_ALERT_OPEN, ErrorState.UnexpectedAlertOpen],
    [ErrorCode.UNKNOWN_ERROR, ErrorState.UnknownError],
    [ErrorCode.UNSUPPORTED_OPERATION, ErrorState.UnknownCommand],
]);

/**
 * Converts an error state string to a proper TypeScript error name.
 * Example: 'element not visible' -> 'ElementNotVisibleError'
 *
 * @param state The error state string
 * @returns The formatted error name
 */
function stateToErrorName(state: ErrorState): string {
    // Split state on whitespace, capitalize each word, and rejoin
    const words = state.split(/\s+/);
    const capitalizedName = words
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join('');

    // Ensure the name ends with 'Error'
    return capitalizedName.endsWith('Error') ? capitalizedName : `${capitalizedName}Error`;
}

/**
 * Represents an error returned from a WebDriver command.
 * This class encapsulates both the error code and the descriptive state
 * according to the W3C WebDriver protocol specification.
 *
 * @example
 * throw new WebDriverError(ErrorCode.NO_SUCH_ELEMENT, 'Element with id "foo" not found');
 */
export class WebDriverError extends Error {
    /**
     * The error code from the WebDriver protocol.
     */
    readonly code: ErrorCode;

    /**
     * The error state string from the W3C WebDriver protocol.
     * This is a human-readable description of the error type.
     */
    readonly state: ErrorState;

    constructor(code: ErrorCode, message?: string) {
        // Determine the state from the code mapping
        const state = CODE_TO_STATE.get(code) ?? ErrorState.UnknownError;

        // Generate a proper error name from the state
        const name = stateToErrorName(state);

        // Call Error constructor with message
        super(message ?? '');

        // Set error properties
        this.name = name;
        this.code = code;
        this.state = state;

        // Maintain proper prototype chain for instanceof checks
        Object.setPrototypeOf(this, WebDriverError.prototype);
    }
}
