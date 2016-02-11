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

describe('error', function() {
  let assert = require('assert');
  let error = require('../error');

  describe('checkResponse', function() {
    it('defaults to WebDriverError if type is unrecognized', function() {
      assert.throws(
          () => error.checkResponse({error: 'foo', message: 'hi there'}),
          (e) => {
            assert.equal(e.constructor, error.WebDriverError);
            assert.equal(e.code, error.ErrorCode.UNKNOWN_ERROR);
            return true;
          });
    });

    it('does not throw if error property is not a string', function() {
      let resp = {error: 123, message: 'abc123'};
      let out = error.checkResponse(resp);
      assert.strictEqual(out, resp);
    });

    test('unknown error', error.WebDriverError);
    test('element not selectable', error.ElementNotSelectableError);
    test('element not visible', error.ElementNotVisibleError);
    test('invalid argument', error.InvalidArgumentError);
    test('invalid cookie domain', error.InvalidCookieDomainError);
    test('invalid element coordinates', error.InvalidElementCoordinatesError);
    test('invalid element state', error.InvalidElementStateError);
    test('invalid selector', error.InvalidSelectorError);
    test('invalid session id', error.InvalidSessionIdError);
    test('javascript error', error.JavascriptError);
    test('move target out of bounds', error.MoveTargetOutOfBoundsError);
    test('no such alert', error.NoSuchAlertError);
    test('no such element', error.NoSuchElementError);
    test('no such frame', error.NoSuchFrameError);
    test('no such window', error.NoSuchWindowError);
    test('script timeout', error.ScriptTimeoutError);
    test('session not created', error.SessionNotCreatedError);
    test('stale element reference', error.StaleElementReferenceError);
    test('timeout', error.TimeoutError);
    test('unable to set cookie', error.UnableToSetCookieError);
    test('unable to capture screen', error.UnableToCaptureScreenError);
    test('unexpected alert open', error.UnexpectedAlertOpenError);
    test('unknown command', error.UnknownCommandError);
    test('unknown method', error.UnknownMethodError);
    test('unsupported operation', error.UnsupportedOperationError);

    function test(status, expectedType) {
      it(`"${status}" => ${expectedType.name}`, function() {
        assert.throws(
            () => error.checkResponse({error: status, message: 'oops'}),
            (e) => {
              assert.equal(expectedType, e.constructor);
              assert.equal(e.message, 'oops');
              return true;
            });
      });
    }
  });

  describe('checkLegacyResponse', function() {
    it('does not throw for success', function() {
      let resp = {status: error.ErrorCode.SUCCESS};
      assert.strictEqual(resp, error.checkLegacyResponse(resp));
    });

    test('NO_SUCH_ELEMENT', error.NoSuchElementError);
    test('NO_SUCH_FRAME', error.NoSuchFrameError);
    test('UNKNOWN_COMMAND', error.UnsupportedOperationError);
    test('UNSUPPORTED_OPERATION', error.UnsupportedOperationError);
    test('STALE_ELEMENT_REFERENCE', error.StaleElementReferenceError);
    test('ELEMENT_NOT_VISIBLE', error.ElementNotVisibleError);
    test('INVALID_ELEMENT_STATE', error.InvalidElementStateError);
    test('UNKNOWN_ERROR', error.WebDriverError);
    test('ELEMENT_NOT_SELECTABLE', error.ElementNotSelectableError);
    test('JAVASCRIPT_ERROR', error.JavascriptError);
    test('XPATH_LOOKUP_ERROR', error.InvalidSelectorError);
    test('TIMEOUT', error.TimeoutError);
    test('NO_SUCH_WINDOW', error.NoSuchWindowError);
    test('INVALID_COOKIE_DOMAIN', error.InvalidCookieDomainError);
    test('UNABLE_TO_SET_COOKIE', error.UnableToSetCookieError);
    test('UNEXPECTED_ALERT_OPEN', error.UnexpectedAlertOpenError);
    test('NO_SUCH_ALERT', error.NoSuchAlertError);
    test('SCRIPT_TIMEOUT', error.ScriptTimeoutError);
    test('INVALID_ELEMENT_COORDINATES', error.InvalidElementCoordinatesError);
    test('INVALID_SELECTOR_ERROR', error.InvalidSelectorError);
    test('SESSION_NOT_CREATED', error.SessionNotCreatedError);
    test('MOVE_TARGET_OUT_OF_BOUNDS', error.MoveTargetOutOfBoundsError);
    test('INVALID_XPATH_SELECTOR', error.InvalidSelectorError);
    test('INVALID_XPATH_SELECTOR_RETURN_TYPE', error.InvalidSelectorError);
    test('METHOD_NOT_ALLOWED', error.UnsupportedOperationError);

    function test(codeKey, expectedType) {
      it(`${codeKey} => ${expectedType.name}`, function() {
        let code = error.ErrorCode[codeKey];
        let resp = {status: code, value: {message: 'hi'}};
        assert.throws(
            () => error.checkLegacyResponse(resp),
            (e) => {
              assert.equal(expectedType, e.constructor);
              assert.equal(e.message, 'hi');
              return true;
            });
      });
    }
  });

  describe('WebDriverError types provide a legacy error code', function() {
    check(error.WebDriverError, 'UNKNOWN_ERROR');
    check(error.ElementNotSelectableError, 'ELEMENT_NOT_SELECTABLE');
    check(error.ElementNotVisibleError, 'ELEMENT_NOT_VISIBLE');
    check(error.InvalidArgumentError, 'UNKNOWN_ERROR');
    check(error.InvalidCookieDomainError, 'INVALID_COOKIE_DOMAIN');
    check(error.InvalidElementCoordinatesError, 'INVALID_ELEMENT_COORDINATES');
    check(error.InvalidElementStateError, 'INVALID_ELEMENT_STATE');
    check(error.InvalidSelectorError, 'INVALID_SELECTOR_ERROR');
    check(error.InvalidSessionIdError, 'UNKNOWN_ERROR');
    check(error.JavascriptError, 'JAVASCRIPT_ERROR');
    check(error.MoveTargetOutOfBoundsError, 'MOVE_TARGET_OUT_OF_BOUNDS');
    check(error.NoSuchAlertError, 'NO_SUCH_ALERT');
    check(error.NoSuchElementError, 'NO_SUCH_ELEMENT');
    check(error.NoSuchFrameError, 'NO_SUCH_FRAME');
    check(error.NoSuchWindowError, 'NO_SUCH_WINDOW');
    check(error.ScriptTimeoutError, 'SCRIPT_TIMEOUT');
    check(error.SessionNotCreatedError, 'SESSION_NOT_CREATED');
    check(error.StaleElementReferenceError, 'STALE_ELEMENT_REFERENCE');
    check(error.TimeoutError, 'TIMEOUT');
    check(error.UnableToSetCookieError, 'UNABLE_TO_SET_COOKIE');
    check(error.UnableToCaptureScreenError, 'UNKNOWN_ERROR');
    check(error.UnexpectedAlertOpenError, 'UNEXPECTED_ALERT_OPEN');
    check(error.UnknownCommandError, 'UNKNOWN_COMMAND');
    check(error.UnknownMethodError, 'UNSUPPORTED_OPERATION');
    check(error.UnsupportedOperationError, 'UNSUPPORTED_OPERATION');

    function check(ctor, codeKey) {
      it(`${ctor.name} => ${codeKey}`, function() {
        let code = error.ErrorCode[codeKey];
        let e = new ctor();
        assert.equal(typeof e.code, 'number');
        assert.equal(e.code, code);
      });
    }
  });
});
