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

'use strict'

describe('error', function () {
  let assert = require('assert')
  let error = require('../../lib/error')

  describe('checkResponse', function () {
    it('defaults to WebDriverError if type is unrecognized', function () {
      assert.throws(
        () => error.checkResponse({ error: 'foo', message: 'hi there' }),
        (e) => {
          assert.strictEqual(e.constructor, error.WebDriverError)
          return true
        }
      )
    })

    it('does not throw if error property is not a string', function () {
      let resp = { error: 123, message: 'abc123' }
      let out = error.checkResponse(resp)
      assert.strictEqual(out, resp)
    })

    test('unknown error', error.WebDriverError)
    test('element not interactable', error.ElementNotInteractableError)
    test('element not selectable', error.ElementNotSelectableError)
    test('insecure certificate', error.InsecureCertificateError)
    test('invalid argument', error.InvalidArgumentError)
    test('invalid cookie domain', error.InvalidCookieDomainError)
    test('invalid coordinates', error.InvalidCoordinatesError)
    test('invalid element state', error.InvalidElementStateError)
    test('invalid selector', error.InvalidSelectorError)
    test('invalid session id', error.NoSuchSessionError)
    test('javascript error', error.JavascriptError)
    test('move target out of bounds', error.MoveTargetOutOfBoundsError)
    test('no such alert', error.NoSuchAlertError)
    test('no such cookie', error.NoSuchCookieError)
    test('no such element', error.NoSuchElementError)
    test('no such frame', error.NoSuchFrameError)
    test('no such window', error.NoSuchWindowError)
    test('script timeout', error.ScriptTimeoutError)
    test('session not created', error.SessionNotCreatedError)
    test('stale element reference', error.StaleElementReferenceError)
    test('timeout', error.TimeoutError)
    test('unable to set cookie', error.UnableToSetCookieError)
    test('unable to capture screen', error.UnableToCaptureScreenError)
    test('unexpected alert open', error.UnexpectedAlertOpenError)
    test('unknown command', error.UnknownCommandError)
    test('unknown method', error.UnknownMethodError)
    test('unsupported operation', error.UnsupportedOperationError)

    function test(status, expectedType) {
      it(`"${status}" => ${expectedType.name}`, function () {
        assert.throws(
          () => error.checkResponse({ error: status, message: 'oops' }),
          (e) => {
            assert.strictEqual(expectedType, e.constructor)
            assert.strictEqual(e.message, 'oops')
            return true
          }
        )
      })
    }
  })

  describe('encodeError', function () {
    describe('defaults to an unknown error', function () {
      it('for a generic error value', function () {
        runTest('hi', 'unknown error', 'hi')
        runTest(1, 'unknown error', '1')
        runTest({}, 'unknown error', '[object Object]')
      })

      it('for a generic Error object', function () {
        runTest(Error('oops'), 'unknown error', 'oops')
        runTest(TypeError('bad value'), 'unknown error', 'bad value')
      })
    })

    test(error.WebDriverError, 'unknown error')
    test(error.ElementClickInterceptedError, 'element click intercepted')
    test(error.ElementNotSelectableError, 'element not selectable')
    test(error.InsecureCertificateError, 'insecure certificate')
    test(error.InvalidArgumentError, 'invalid argument')
    test(error.InvalidCookieDomainError, 'invalid cookie domain')
    test(error.InvalidElementStateError, 'invalid element state')
    test(error.InvalidSelectorError, 'invalid selector')
    test(error.NoSuchSessionError, 'invalid session id')
    test(error.JavascriptError, 'javascript error')
    test(error.MoveTargetOutOfBoundsError, 'move target out of bounds')
    test(error.NoSuchAlertError, 'no such alert')
    test(error.NoSuchCookieError, 'no such cookie')
    test(error.NoSuchElementError, 'no such element')
    test(error.NoSuchFrameError, 'no such frame')
    test(error.NoSuchWindowError, 'no such window')
    test(error.ScriptTimeoutError, 'script timeout')
    test(error.SessionNotCreatedError, 'session not created')
    test(error.StaleElementReferenceError, 'stale element reference')
    test(error.TimeoutError, 'timeout')
    test(error.UnableToSetCookieError, 'unable to set cookie')
    test(error.UnableToCaptureScreenError, 'unable to capture screen')
    test(error.UnexpectedAlertOpenError, 'unexpected alert open')
    test(error.UnknownCommandError, 'unknown command')
    test(error.UnknownMethodError, 'unknown method')
    test(error.UnsupportedOperationError, 'unsupported operation')

    function test(ctor, code) {
      it(`${ctor.name} => "${code}"`, () => {
        runTest(new ctor('oops'), code, 'oops')
      })
    }

    function runTest(err, code, message) {
      let obj = error.encodeError(err)
      assert.strictEqual(obj['error'], code)
      assert.strictEqual(obj['message'], message)
    }
  })

  describe('throwDecodedError', function () {
    it('defaults to WebDriverError if type is unrecognized', function () {
      assert.throws(
        () => error.throwDecodedError({ error: 'foo', message: 'hi there' }),
        (e) => {
          assert.strictEqual(e.constructor, error.WebDriverError)
          return true
        }
      )
    })

    it('throws generic error if encoded data is not valid', function () {
      assert.throws(
        () => error.throwDecodedError({ error: 123, message: 'abc123' }),
        (e) => {
          assert.strictEqual(e.constructor, error.WebDriverError)
          return true
        }
      )

      assert.throws(
        () => error.throwDecodedError('null'),
        (e) => {
          assert.strictEqual(e.constructor, error.WebDriverError)
          return true
        }
      )

      assert.throws(
        () => error.throwDecodedError(''),
        (e) => {
          assert.strictEqual(e.constructor, error.WebDriverError)
          return true
        }
      )
    })

    test('unknown error', error.WebDriverError)
    test('element click intercepted', error.ElementClickInterceptedError)
    test('element not selectable', error.ElementNotSelectableError)
    test('insecure certificate', error.InsecureCertificateError)
    test('invalid argument', error.InvalidArgumentError)
    test('invalid cookie domain', error.InvalidCookieDomainError)
    test('invalid coordinates', error.InvalidCoordinatesError)
    test('invalid element state', error.InvalidElementStateError)
    test('invalid selector', error.InvalidSelectorError)
    test('invalid session id', error.NoSuchSessionError)
    test('javascript error', error.JavascriptError)
    test('move target out of bounds', error.MoveTargetOutOfBoundsError)
    test('no such alert', error.NoSuchAlertError)
    test('no such cookie', error.NoSuchCookieError)
    test('no such element', error.NoSuchElementError)
    test('no such frame', error.NoSuchFrameError)
    test('no such window', error.NoSuchWindowError)
    test('script timeout', error.ScriptTimeoutError)
    test('session not created', error.SessionNotCreatedError)
    test('stale element reference', error.StaleElementReferenceError)
    test('timeout', error.TimeoutError)
    test('unable to set cookie', error.UnableToSetCookieError)
    test('unable to capture screen', error.UnableToCaptureScreenError)
    test('unexpected alert open', error.UnexpectedAlertOpenError)
    test('unknown command', error.UnknownCommandError)
    test('unknown method', error.UnknownMethodError)
    test('unsupported operation', error.UnsupportedOperationError)

    it('leaves remoteStacktrace empty if not in encoding', function () {
      assert.throws(
        () =>
          error.throwDecodedError({
            error: 'session not created',
            message: 'oops',
          }),
        (e) => {
          assert.strictEqual(e.constructor, error.SessionNotCreatedError)
          assert.strictEqual(e.message, 'oops')
          assert.strictEqual(e.remoteStacktrace, '')
          return true
        }
      )
    })

    function test(status, expectedType) {
      it(`"${status}" => ${expectedType.name}`, function () {
        assert.throws(
          () =>
            error.throwDecodedError({
              error: status,
              message: 'oops',
              stacktrace: 'some-stacktrace',
            }),
          (e) => {
            assert.strictEqual(e.constructor, expectedType)
            assert.strictEqual(e.message, 'oops')
            assert.strictEqual(e.remoteStacktrace, 'some-stacktrace')
            return true
          }
        )
      })
    }

    describe('remote stack trace decoding', function () {
      test('stacktrace')
      test('stackTrace')

      function test(key) {
        it(`encoded as "${key}"`, function () {
          let data = { error: 'unknown command', message: 'oops' }
          data[key] = 'some-stacktrace'
          assert.throws(
            () => error.throwDecodedError(data),
            (e) => {
              assert.strictEqual(e.remoteStacktrace, 'some-stacktrace')
              return true
            }
          )
        })
      }
    })
  })

  describe('checkLegacyResponse', function () {
    it('does not throw for success', function () {
      let resp = { status: error.ErrorCode.SUCCESS }
      assert.strictEqual(resp, error.checkLegacyResponse(resp))
    })

    test('NO_SUCH_SESSION', error.NoSuchSessionError)
    test('NO_SUCH_ELEMENT', error.NoSuchElementError)
    test('NO_SUCH_FRAME', error.NoSuchFrameError)
    test('UNKNOWN_COMMAND', error.UnsupportedOperationError)
    test('UNSUPPORTED_OPERATION', error.UnsupportedOperationError)
    test('STALE_ELEMENT_REFERENCE', error.StaleElementReferenceError)
    test('INVALID_ELEMENT_STATE', error.InvalidElementStateError)
    test('UNKNOWN_ERROR', error.WebDriverError)
    test('ELEMENT_NOT_SELECTABLE', error.ElementNotSelectableError)
    test('JAVASCRIPT_ERROR', error.JavascriptError)
    test('XPATH_LOOKUP_ERROR', error.InvalidSelectorError)
    test('TIMEOUT', error.TimeoutError)
    test('NO_SUCH_WINDOW', error.NoSuchWindowError)
    test('INVALID_COOKIE_DOMAIN', error.InvalidCookieDomainError)
    test('UNABLE_TO_SET_COOKIE', error.UnableToSetCookieError)
    test('UNEXPECTED_ALERT_OPEN', error.UnexpectedAlertOpenError)
    test('NO_SUCH_ALERT', error.NoSuchAlertError)
    test('SCRIPT_TIMEOUT', error.ScriptTimeoutError)
    test('INVALID_ELEMENT_COORDINATES', error.InvalidCoordinatesError)
    test('INVALID_SELECTOR_ERROR', error.InvalidSelectorError)
    test('SESSION_NOT_CREATED', error.SessionNotCreatedError)
    test('MOVE_TARGET_OUT_OF_BOUNDS', error.MoveTargetOutOfBoundsError)
    test('INVALID_XPATH_SELECTOR', error.InvalidSelectorError)
    test('INVALID_XPATH_SELECTOR_RETURN_TYPE', error.InvalidSelectorError)
    test('ELEMENT_NOT_INTERACTABLE', error.ElementNotInteractableError)
    test('INVALID_ARGUMENT', error.InvalidArgumentError)
    test('UNABLE_TO_CAPTURE_SCREEN', error.UnableToCaptureScreenError)
    test('ELEMENT_CLICK_INTERCEPTED', error.ElementClickInterceptedError)
    test('METHOD_NOT_ALLOWED', error.UnsupportedOperationError)

    describe('UnexpectedAlertOpenError', function () {
      it('includes alert text from the response object', function () {
        let response = {
          status: error.ErrorCode.UNEXPECTED_ALERT_OPEN,
          value: {
            message: 'hi',
            alert: { text: 'alert text here' },
          },
        }
        assert.throws(
          () => error.checkLegacyResponse(response),
          (e) => {
            assert.strictEqual(error.UnexpectedAlertOpenError, e.constructor)
            assert.strictEqual(e.message, 'hi')
            assert.strictEqual(e.getAlertText(), 'alert text here')
            return true
          }
        )
      })

      it('uses an empty string if alert text omitted', function () {
        let response = {
          status: error.ErrorCode.UNEXPECTED_ALERT_OPEN,
          value: {
            message: 'hi',
          },
        }
        assert.throws(
          () => error.checkLegacyResponse(response),
          (e) => {
            assert.strictEqual(error.UnexpectedAlertOpenError, e.constructor)
            assert.strictEqual(e.message, 'hi')
            assert.strictEqual(e.getAlertText(), '')
            return true
          }
        )
      })
    })

    function test(codeKey, expectedType) {
      it(`${codeKey} => ${expectedType.name}`, function () {
        let code = error.ErrorCode[codeKey]
        let resp = { status: code, value: { message: 'hi' } }
        assert.throws(
          () => error.checkLegacyResponse(resp),
          (e) => {
            assert.strictEqual(expectedType, e.constructor)
            assert.strictEqual(e.message, 'hi')
            return true
          }
        )
      })
    }
  })
})
