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
 * @fileoverview Utilities for working with errors as defined by WebDriver's
 * wire protocol: https://github.com/SeleniumHQ/selenium/wiki/JsonWireProtocol
 */

/**
 * Error codes from the Selenium WebDriver protocol:
 * https://github.com/SeleniumHQ/selenium/wiki/JsonWireProtocol#response-status-codes
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
 * @see https://w3c.github.io/webdriver/webdriver-spec.html#handling-errors
 */
export enum State {
  ELEMENT_NOT_SELECTABLE = 'element not selectable',
  ELEMENT_NOT_VISIBLE = 'element not visible',
  INVALID_ARGUMENT = 'invalid argument',
  INVALID_COOKIE_DOMAIN = 'invalid cookie domain',
  INVALID_ELEMENT_COORDINATES = 'invalid element coordinates',
  INVALID_ELEMENT_STATE = 'invalid element state',
  INVALID_SELECTOR = 'invalid selector',
  INVALID_SESSION_ID = 'invalid session id',
  JAVASCRIPT_ERROR = 'javascript error',
  MOVE_TARGET_OUT_OF_BOUNDS = 'move target out of bounds',
  NO_SUCH_ALERT = 'no such alert',
  NO_SUCH_ELEMENT = 'no such element',
  NO_SUCH_FRAME = 'no such frame',
  NO_SUCH_WINDOW = 'no such window',
  SCRIPT_TIMEOUT = 'script timeout',
  SESSION_NOT_CREATED = 'session not created',
  STALE_ELEMENT_REFERENCE = 'stale element reference',
  TIMEOUT = 'timeout',
  UNABLE_TO_SET_COOKIE = 'unable to set cookie',
  UNEXPECTED_ALERT_OPEN = 'unexpected alert open',
  UNKNOWN_COMMAND = 'unknown command',
  UNKNOWN_ERROR = 'unknown error',
  UNKNOWN_METHOD = 'unknown method',
  UNSUPPORTED_OPERATION = 'unsupported operation',
}

/**
 * A map of error codes to state string.
 */
const CODE_TO_STATE: Record<number, State> = {
  [ErrorCode.ELEMENT_NOT_SELECTABLE]: State.ELEMENT_NOT_SELECTABLE,
  [ErrorCode.ELEMENT_NOT_VISIBLE]: State.ELEMENT_NOT_VISIBLE,
  [ErrorCode.IME_ENGINE_ACTIVATION_FAILED]: State.UNKNOWN_ERROR,
  [ErrorCode.IME_NOT_AVAILABLE]: State.UNKNOWN_ERROR,
  [ErrorCode.INVALID_COOKIE_DOMAIN]: State.INVALID_COOKIE_DOMAIN,
  [ErrorCode.INVALID_ELEMENT_COORDINATES]: State.INVALID_ELEMENT_COORDINATES,
  [ErrorCode.INVALID_ELEMENT_STATE]: State.INVALID_ELEMENT_STATE,
  [ErrorCode.INVALID_SELECTOR_ERROR]: State.INVALID_SELECTOR,
  [ErrorCode.INVALID_XPATH_SELECTOR]: State.INVALID_SELECTOR,
  [ErrorCode.INVALID_XPATH_SELECTOR_RETURN_TYPE]: State.INVALID_SELECTOR,
  [ErrorCode.JAVASCRIPT_ERROR]: State.JAVASCRIPT_ERROR,
  [ErrorCode.METHOD_NOT_ALLOWED]: State.UNSUPPORTED_OPERATION,
  [ErrorCode.MOVE_TARGET_OUT_OF_BOUNDS]: State.MOVE_TARGET_OUT_OF_BOUNDS,
  [ErrorCode.NO_SUCH_ALERT]: State.NO_SUCH_ALERT,
  [ErrorCode.NO_SUCH_ELEMENT]: State.NO_SUCH_ELEMENT,
  [ErrorCode.NO_SUCH_FRAME]: State.NO_SUCH_FRAME,
  [ErrorCode.NO_SUCH_WINDOW]: State.NO_SUCH_WINDOW,
  [ErrorCode.SCRIPT_TIMEOUT]: State.SCRIPT_TIMEOUT,
  [ErrorCode.SESSION_NOT_CREATED]: State.SESSION_NOT_CREATED,
  [ErrorCode.STALE_ELEMENT_REFERENCE]: State.STALE_ELEMENT_REFERENCE,
  [ErrorCode.TIMEOUT]: State.TIMEOUT,
  [ErrorCode.UNABLE_TO_SET_COOKIE]: State.UNABLE_TO_SET_COOKIE,
  [ErrorCode.UNEXPECTED_ALERT_OPEN]: State.UNEXPECTED_ALERT_OPEN,
  [ErrorCode.UNKNOWN_ERROR]: State.UNKNOWN_ERROR,
  [ErrorCode.UNSUPPORTED_OPERATION]: State.UNKNOWN_COMMAND,
};

/**
 * Represents an error returned from a WebDriver command request.
 */
export class BotError extends Error {
  /**
   * This error's status code.
   */
  code: ErrorCode;

  /**
   * The W3C WebDriver state string for this error.
   */
  state: State;

  /**
   * Flag used for duck-typing when this code is embedded in a Firefox extension.
   * This is required since an Error thrown in one component and then reported
   * to another will fail instanceof checks in the second component.
   */
  isAutomationError: boolean = true;

  constructor(code: ErrorCode, message?: string) {
    super(message || '');

    this.code = code;
    this.state = CODE_TO_STATE[code] || State.UNKNOWN_ERROR;

    let name = this.state.replace(/((?:^|\s+)[a-z])/g, (str) => {
      return str.toUpperCase().replace(/^[\s\xa0]+/g, '');
    });

    const l = name.length - 'Error'.length;
    if (l < 0 || name.indexOf('Error', l) !== l) {
      name += 'Error';
    }

    this.name = name;

    // Generate a stacktrace for our custom error
    const template = new Error(this.message);
    template.name = this.name;
    this.stack = template.stack || '';
  }
}
