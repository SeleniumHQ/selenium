# Licensed to the Software Freedom Conservancy (SFC) under one
# or more contributor license agreements.  See the NOTICE file
# distributed with this work for additional information
# regarding copyright ownership.  The SFC licenses this file
# to you under the Apache License, Version 2.0 (the
# "License"); you may not use this file except in compliance
# with the License.  You may obtain a copy of the License at
#
#   http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing,
# software distributed under the License is distributed on an
# "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
# KIND, either express or implied.  See the License for the
# specific language governing permissions and limitations
# under the License.

import pytest

from selenium.common import exceptions
from selenium.webdriver.remote.errorhandler import ErrorCode, ErrorHandler


@pytest.fixture
def handler():
    yield ErrorHandler()


def test_does_not_raise_exception_on_success(handler):
    assert handler.check_response({'status': ErrorCode.SUCCESS}) is None
    assert handler.check_response({}) is None


def test_raises_exception_for_no_such_element(handler):
    with pytest.raises(exceptions.NoSuchElementException):
        handler.check_response({'status': ErrorCode.NO_SUCH_ELEMENT, 'value': 'foo'})


def test_raises_exception_for_no_such_frame(handler):
    with pytest.raises(exceptions.NoSuchFrameException):
        handler.check_response({'status': ErrorCode.NO_SUCH_FRAME, 'value': 'foo'})


def test_raises_exception_for_unknown_command(handler):
    with pytest.raises(exceptions.WebDriverException):
        handler.check_response({'status': ErrorCode.UNKNOWN_COMMAND, 'value': 'foo'})


def test_raises_exception_for_stale_element_reference(handler):
    with pytest.raises(exceptions.StaleElementReferenceException):
        handler.check_response({'status': ErrorCode.STALE_ELEMENT_REFERENCE, 'value': 'foo'})


def test_raises_exception_for_element_not_visible(handler):
    with pytest.raises(exceptions.ElementNotVisibleException):
        handler.check_response({'status': ErrorCode.ELEMENT_NOT_VISIBLE, 'value': 'foo'})


def test_raises_exception_for_invalid_element_state(handler):
    with pytest.raises(exceptions.InvalidElementStateException):
        handler.check_response({'status': ErrorCode.INVALID_ELEMENT_STATE, 'value': 'foo'})


def test_raises_exception_for_unknown_error(handler):
    with pytest.raises(exceptions.WebDriverException):
        handler.check_response({'status': ErrorCode.UNKNOWN_ERROR, 'value': 'foo'})


def test_raises_exception_for_element_not_selectable(handler):
    with pytest.raises(exceptions.ElementNotSelectableException):
        handler.check_response({'status': ErrorCode.ELEMENT_IS_NOT_SELECTABLE, 'value': 'foo'})


def test_raises_exception_for_javascript_error(handler):
    with pytest.raises(exceptions.JavascriptException):
        handler.check_response({'status': ErrorCode.JAVASCRIPT_ERROR, 'value': 'foo'})


def test_raises_exception_for_xpath_lookup_error(handler):
    with pytest.raises(exceptions.WebDriverException):
        handler.check_response({'status': ErrorCode.XPATH_LOOKUP_ERROR, 'value': 'foo'})


def test_raises_exception_for_timeout(handler):
    with pytest.raises(exceptions.TimeoutException):
        handler.check_response({'status': ErrorCode.TIMEOUT, 'value': 'foo'})


def test_raises_exception_for_no_such_window(handler):
    with pytest.raises(exceptions.NoSuchWindowException):
        handler.check_response({'status': ErrorCode.NO_SUCH_WINDOW, 'value': 'foo'})


def test_raises_exception_for_invalid_cookie_domain(handler):
    with pytest.raises(exceptions.InvalidCookieDomainException):
        handler.check_response({'status': ErrorCode.INVALID_COOKIE_DOMAIN, 'value': 'foo'})


def test_raises_exception_for_unable_to_set_cookie(handler):
    with pytest.raises(exceptions.UnableToSetCookieException):
        handler.check_response({'status': ErrorCode.UNABLE_TO_SET_COOKIE, 'value': 'foo'})


def test_raises_exception_for_unexpected_alert_open(handler):
    with pytest.raises(exceptions.UnexpectedAlertPresentException):
        handler.check_response({'status': ErrorCode.UNEXPECTED_ALERT_OPEN, 'value': 'foo'})


def test_raises_exception_for_no_alert_open(handler):
    with pytest.raises(exceptions.NoAlertPresentException):
        handler.check_response({'status': ErrorCode.NO_ALERT_OPEN, 'value': 'foo'})


def test_raises_exception_for_script_timeout(handler):
    with pytest.raises(exceptions.TimeoutException):
        handler.check_response({'status': ErrorCode.SCRIPT_TIMEOUT, 'value': 'foo'})


def test_raises_exception_for_invalid_element_coordinates(handler):
    with pytest.raises(exceptions.WebDriverException):
        handler.check_response({'status': ErrorCode.INVALID_ELEMENT_COORDINATES, 'value': 'foo'})


def test_raises_exception_for_ime_not_available(handler):
    with pytest.raises(exceptions.ImeNotAvailableException):
        handler.check_response({'status': ErrorCode.IME_NOT_AVAILABLE, 'value': 'foo'})


def test_raises_exception_for_ime_activation_failed(handler):
    with pytest.raises(exceptions.ImeActivationFailedException):
        handler.check_response({'status': ErrorCode.IME_ENGINE_ACTIVATION_FAILED, 'value': 'foo'})


def test_raises_exception_for_invalid_selector(handler):
    with pytest.raises(exceptions.InvalidSelectorException):
        handler.check_response({'status': ErrorCode.INVALID_SELECTOR, 'value': 'foo'})


def test_raises_exception_for_session_not_created(handler):
    with pytest.raises(exceptions.SessionNotCreatedException):
        handler.check_response({'status': ErrorCode.SESSION_NOT_CREATED, 'value': 'foo'})


def test_raises_exception_for_move_target_out_of_bounds(handler):
    with pytest.raises(exceptions.MoveTargetOutOfBoundsException):
        handler.check_response({'status': ErrorCode.MOVE_TARGET_OUT_OF_BOUNDS, 'value': 'foo'})


def test_raises_exception_for_invalid_xpath_selector(handler):
    with pytest.raises(exceptions.InvalidSelectorException):
        handler.check_response({'status': ErrorCode.INVALID_XPATH_SELECTOR, 'value': 'foo'})


def test_raises_exception_for_invalid_xpath_selector_return_typer(handler):
    with pytest.raises(exceptions.InvalidSelectorException):
        handler.check_response({'status': ErrorCode.INVALID_XPATH_SELECTOR_RETURN_TYPER, 'value': 'foo'})


def test_raises_exception_for_element_not_interactable(handler):
    with pytest.raises(exceptions.ElementNotInteractableException):
        handler.check_response({'status': ErrorCode.ELEMENT_NOT_INTERACTABLE, 'value': 'foo'})


def test_raises_exception_for_insecure_certificate(handler):
    with pytest.raises(exceptions.InsecureCertificateException):
        handler.check_response({'status': ErrorCode.INSECURE_CERTIFICATE, 'value': 'foo'})


def test_raises_exception_for_invalid_argument(handler):
    with pytest.raises(exceptions.InvalidArgumentException):
        handler.check_response({'status': ErrorCode.INVALID_ARGUMENT, 'value': 'foo'})


def test_raises_exception_for_invalid_coordinates(handler):
    with pytest.raises(exceptions.InvalidCoordinatesException):
        handler.check_response({'status': ErrorCode.INVALID_COORDINATES, 'value': 'foo'})


def test_raises_exception_for_invalid_session_id(handler):
    with pytest.raises(exceptions.InvalidSessionIdException):
        handler.check_response({'status': ErrorCode.INVALID_SESSION_ID, 'value': 'foo'})


def test_raises_exception_for_no_such_cookie(handler):
    with pytest.raises(exceptions.NoSuchCookieException):
        handler.check_response({'status': ErrorCode.NO_SUCH_COOKIE, 'value': 'foo'})


def test_raises_exception_for_unable_to_capture_screen_exception(handler):
    with pytest.raises(exceptions.ScreenshotException):
        handler.check_response({'status': ErrorCode.UNABLE_TO_CAPTURE_SCREEN, 'value': 'foo'})


def test_raises_exception_for_element_click_intercepted(handler):
    with pytest.raises(exceptions.ElementClickInterceptedException):
        handler.check_response({'status': ErrorCode.ELEMENT_CLICK_INTERCEPTED, 'value': 'foo'})


def test_raises_exception_for_unknown_method(handler):
    with pytest.raises(exceptions.UnknownMethodException):
        handler.check_response({'status': ErrorCode.UNKNOWN_METHOD, 'value': 'foo'})


def test_raises_exception_for_method_not_allowed(handler):
    with pytest.raises(exceptions.WebDriverException):
        handler.check_response({'status': ErrorCode.METHOD_NOT_ALLOWED, 'value': 'foo'})


def test_relays_exception_stacktrace(handler):
    import json
    stacktrace = {'lineNumber': 100, 'fileName': 'egg', 'methodName': 'ham', 'className': 'Spam'}
    value = {'stacktrace': [stacktrace],
             'message': 'very bad',
             'error': ErrorCode.UNKNOWN_METHOD}
    response = {'status': 400, 'value': json.dumps({'value': value})}
    with pytest.raises(exceptions.UnknownMethodException) as e:
        handler.check_response(response)

    assert 'Spam.ham' in e.value.stacktrace[0]


def test_handle_errors_better(handler):
    import json
    response = {"status": 500,
                "value": json.dumps({"value": {
                    "message": "Could not start a new session. No Node supports the required capabilities: Capabilities {browserName: chrome, goog:chromeOptions: {args: [headless, silent], extensions: [], w3c: false}}, Capabilities {browserName: chrome, goog:chromeOptions: {args: [headless, silent], extensions: [], w3c: false}, version: }\nBuild info: version: '4.0.0-beta-3', revision: '5d108f9a67'\nSystem info: host: '9315f0a993d2', ip: '172.17.0.8', os.name: 'Linux', os.arch: 'amd64', os.version: '5.8.0-44-generic', java.version: '1.8.0_282'\nDriver info: driver.version: unknown"
                }
                })
                }
    with pytest.raises(exceptions.WebDriverException) as e:
        handler.check_response(response)

    assert "Could not start a new session." in e.value.msg
