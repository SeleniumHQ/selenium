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
from selenium.webdriver.remote.errorhandler import ERROR_TO_EXC_MAPPING
from selenium.webdriver.remote.errorhandler import ErrorHandler


@pytest.fixture
def handler():
    yield ErrorHandler()


def test_does_not_raise_exception_on_success(handler):
    assert handler.check_response({"status": 0}) is None
    assert handler.check_response({}) is None


@pytest.mark.parametrize("error", ["no such element"])
def test_raises_exception_for_no_such_element(handler, error):
    with pytest.raises(exceptions.NoSuchElementException):
        handler.check_response({"value": {"error": error, "message": "error message", "stacktrace": ""}})


@pytest.mark.parametrize("error", ["no such frame"])
def test_raises_exception_for_no_such_frame(handler, error):
    with pytest.raises(exceptions.NoSuchFrameException):
        handler.check_response({"value": {"error": error, "message": "error message", "stacktrace": ""}})

@pytest.mark.parametrize("error",["unknown command"])
def test_raises_exception_for_unknown_command(handler, error):
    with pytest.raises(exceptions.WebDriverException):
        handler.check_response({"value": {"error": error, "message": "error message", "stacktrace": ""}})

@pytest.mark.parametrize("error", ["stale element reference"])
def test_raises_exception_for_stale_element_reference(handler, error):
    with pytest.raises(exceptions.StaleElementReferenceException):
        handler.check_response({"value": {"error": error, "message": "error message", "stacktrace": ""}})


@pytest.mark.parametrize("error", ["element not visible"])
def test_raises_exception_for_element_not_visible(handler, error):
    with pytest.raises(exceptions.ElementNotVisibleException):
        handler.check_response({"value": {"error": error, "message": "error message", "stacktrace": ""}})


@pytest.mark.parametrize("error", ["invalid element state"])
def test_raises_exception_for_invalid_element_state(handler, error):
    with pytest.raises(exceptions.InvalidElementStateException):
        handler.check_response({"value": {"error": error, "message": "error message", "stacktrace": ""}})


@pytest.mark.parametrize("error", ["unknown error"])
def test_raises_exception_for_unknown_error(handler, error):
    with pytest.raises(exceptions.WebDriverException):
        handler.check_response({"value": {"error": error, "message": "error message", "stacktrace": ""}})


@pytest.mark.parametrize("error", ["element not selectable"])
def test_raises_exception_for_element_not_selectable(handler, error):
    with pytest.raises(exceptions.ElementNotSelectableException):
        handler.check_response({"value": {"error": error, "message": "error message", "stacktrace": ""}})


@pytest.mark.parametrize("error", ["javascript error"])
def test_raises_exception_for_javascript_error(handler, error):
    with pytest.raises(exceptions.JavascriptException):
        handler.check_response({"value": {"error": error, "message": "error message", "stacktrace": ""}})


@pytest.mark.parametrize("error", ["timeout"])
def test_raises_exception_for_timeout(handler, error):
    with pytest.raises(exceptions.TimeoutException):
        handler.check_response({"value": {"error": error, "message": "error message", "stacktrace": ""}})


@pytest.mark.parametrize("error", ["no such window"])
def test_raises_exception_for_no_such_window(handler, error):
    with pytest.raises(exceptions.NoSuchWindowException):
        handler.check_response({"value": {"error": error, "message": "error message", "stacktrace": ""}})


@pytest.mark.parametrize("error", ["invalid cookie domain"])
def test_raises_exception_for_invalid_cookie_domain(handler, error):
    with pytest.raises(exceptions.InvalidCookieDomainException):
        handler.check_response({"value": {"error": error, "message": "error message", "stacktrace": ""}})


@pytest.mark.parametrize("error", ["unable to set cookie"])
def test_raises_exception_for_unable_to_set_cookie(handler, error):
    with pytest.raises(exceptions.UnableToSetCookieException):
        handler.check_response({"value": {"error": error, "message": "error message", "stacktrace": ""}})


@pytest.mark.parametrize("error", ["unexpected alert open"])
def test_raises_exception_for_unexpected_alert_open(handler, error):
    with pytest.raises(exceptions.UnexpectedAlertPresentException):
        handler.check_response({"value": {"error": error, "message": "error message", "stacktrace": ""}})


@pytest.mark.parametrize("error", ["no such alert"])
def test_raises_exception_for_no_alert_open(handler, error):
    with pytest.raises(exceptions.NoAlertPresentException):
        handler.check_response({"value": {"error": error, "message": "error message", "stacktrace": ""}})


@pytest.mark.parametrize("error", ["script timeout"])
def test_raises_exception_for_script_timeout(handler, error):
    with pytest.raises(exceptions.TimeoutException):
        handler.check_response({"value": {"error": error, "message": "error message", "stacktrace": ""}})

@pytest.mark.parametrize("error", ["invalid selector"])
def test_raises_exception_for_invalid_selector(handler, error):
    with pytest.raises(exceptions.InvalidSelectorException):
        handler.check_response({"value": {"error": error, "message": "error message", "stacktrace": ""}})


@pytest.mark.parametrize("error", ["session not created"])
def test_raises_exception_for_session_not_created(handler, error):
    with pytest.raises(exceptions.SessionNotCreatedException):
        handler.check_response({"value": {"error": error, "message": "error message", "stacktrace": ""}})


@pytest.mark.parametrize("error", ["move target out of bounds"])
def test_raises_exception_for_move_target_out_of_bounds(handler, error):
    with pytest.raises(exceptions.MoveTargetOutOfBoundsException):
        handler.check_response({"value": {"error": error, "message": "error message", "stacktrace": ""}})


@pytest.mark.parametrize("error", ["invalid selector"])
def test_raises_exception_for_invalid_xpath_selector(handler, error):
    with pytest.raises(exceptions.InvalidSelectorException):
        handler.check_response({"value": {"error": error, "message": "error message", "stacktrace": ""}})


@pytest.mark.parametrize("error", ["element not interactable"])
def test_raises_exception_for_element_not_interactable(handler, error):
    with pytest.raises(exceptions.ElementNotInteractableException):
        handler.check_response({"value": {"error": error, "message": "error message", "stacktrace": ""}})


@pytest.mark.parametrize("error", ["insecure certificate"])
def test_raises_exception_for_insecure_certificate(handler, error):
    with pytest.raises(exceptions.InsecureCertificateException):
        handler.check_response({"value": {"error": error, "message": "error message", "stacktrace": ""}})


@pytest.mark.parametrize("error", ["invalid argument"])
def test_raises_exception_for_invalid_argument(handler, error):
    with pytest.raises(exceptions.InvalidArgumentException):
        handler.check_response({"value": {"error": error, "message": "error message", "stacktrace": ""}})


@pytest.mark.parametrize("error", ["invalid coordinates"])
def test_raises_exception_for_invalid_coordinates(handler, error):
    with pytest.raises(exceptions.InvalidCoordinatesException):
        handler.check_response({"value": {"error": error, "message": "error message", "stacktrace": ""}})


@pytest.mark.parametrize("error", ["invalid session id"])
def test_raises_exception_for_invalid_session_id(handler, error):
    with pytest.raises(exceptions.InvalidSessionIdException):
        handler.check_response({"value": {"error": error, "message": "error message", "stacktrace": ""}})


@pytest.mark.parametrize("error", ["no such cookie"])
def test_raises_exception_for_no_such_cookie(handler, error):
    with pytest.raises(exceptions.NoSuchCookieException):
        handler.check_response({"value": {"error": error, "message": "error message", "stacktrace": ""}})


@pytest.mark.parametrize("error", ["unable to capture screen"])
def test_raises_exception_for_unable_to_capture_screen_exception(handler, error):
    with pytest.raises(exceptions.ScreenshotException):
        handler.check_response({"value": {"error": error, "message": "error message", "stacktrace": ""}})


@pytest.mark.parametrize("error", ["element click intercepted"])
def test_raises_exception_for_element_click_intercepted(handler, error):
    with pytest.raises(exceptions.ElementClickInterceptedException):
        handler.check_response({"value": {"error": error, "message": "error message", "stacktrace": ""}})


@pytest.mark.parametrize("error", ["unknown method"])
def test_raises_exception_for_unknown_method(handler, error):
    with pytest.raises(exceptions.UnknownMethodException):
        handler.check_response({"value": {"error": error, "message": "error message", "stacktrace": ""}})


@pytest.mark.parametrize("key", ["stackTrace", "stacktrace"])
def test_relays_exception_stacktrace(handler, key):
    import json

    stacktrace = {"lineNumber": 100, "fileName": "egg", "methodName": "ham", "className": "Spam"}
    value = {key: [stacktrace], "message": "very bad", "error": "unknown method"}
    response = {"status": 400, "value": value}
    with pytest.raises(exceptions.UnknownMethodException) as e:
        handler.check_response(response)

    assert "Spam.ham" in e.value.stacktrace[0]


def test_handle_errors_better(handler):
    response = {
        "value": {
            "error": "session not created",
            "message": "Could not start a new session. No Node supports the required capabilities: Capabilities {browserName: chrome, goog:chromeOptions: {args: [headless, silent], extensions: [], w3c: false}}, Capabilities {browserName: chrome, goog:chromeOptions: {args: [headless, silent], extensions: [], w3c: false}, version: }\nBuild info: version: '4.0.0-beta-3', revision: '5d108f9a67'\nSystem info: host: '9315f0a993d2', ip: '172.17.0.8', os.name: 'Linux', os.arch: 'amd64', os.version: '5.8.0-44-generic', java.version: '1.8.0_282'\nDriver info: driver.version: unknown",
            "stacktrace": ""
        },
    }
    with pytest.raises(exceptions.WebDriverException) as e:
        handler.check_response(response)

    assert "Could not start a new session." in e.value.msg
