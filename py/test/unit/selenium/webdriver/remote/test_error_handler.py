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


@pytest.mark.parametrize('code', ErrorCode.NO_SUCH_ELEMENT)
def test_raises_exception_for_no_such_element(handler, code):
    with pytest.raises(exceptions.NoSuchElementException):
        handler.check_response({'status': code, 'value': 'foo'})


@pytest.mark.parametrize('code', ErrorCode.NO_SUCH_FRAME)
def test_raises_exception_for_no_such_frame(handler, code):
    with pytest.raises(exceptions.NoSuchFrameException):
        handler.check_response({'status': code, 'value': 'foo'})


@pytest.mark.parametrize('code', ErrorCode.UNKNOWN_COMMAND)
def test_raises_exception_for_unknown_command(handler, code):
    with pytest.raises(exceptions.WebDriverException):
        handler.check_response({'status': code, 'value': 'foo'})


@pytest.mark.parametrize('code', ErrorCode.STALE_ELEMENT_REFERENCE)
def test_raises_exception_for_stale_element_reference(handler, code):
    with pytest.raises(exceptions.StaleElementReferenceException):
        handler.check_response({'status': code, 'value': 'foo'})


@pytest.mark.parametrize('code', ErrorCode.ELEMENT_NOT_VISIBLE)
def test_raises_exception_for_element_not_visible(handler, code):
    with pytest.raises(exceptions.ElementNotVisibleException):
        handler.check_response({'status': code, 'value': 'foo'})


@pytest.mark.parametrize('code', ErrorCode.INVALID_ELEMENT_STATE)
def test_raises_exception_for_invalid_element_state(handler, code):
    with pytest.raises(exceptions.InvalidElementStateException):
        handler.check_response({'status': code, 'value': 'foo'})


@pytest.mark.parametrize('code', ErrorCode.UNKNOWN_ERROR)
def test_raises_exception_for_unknown_error(handler, code):
    with pytest.raises(exceptions.WebDriverException):
        handler.check_response({'status': code, 'value': 'foo'})


@pytest.mark.parametrize('code', ErrorCode.ELEMENT_IS_NOT_SELECTABLE)
def test_raises_exception_for_element_not_selectable(handler, code):
    with pytest.raises(exceptions.ElementNotSelectableException):
        handler.check_response({'status': code, 'value': 'foo'})


@pytest.mark.parametrize('code', ErrorCode.JAVASCRIPT_ERROR)
def test_raises_exception_for_javascript_error(handler, code):
    with pytest.raises(exceptions.JavascriptException):
        handler.check_response({'status': code, 'value': 'foo'})


@pytest.mark.parametrize('code', ErrorCode.XPATH_LOOKUP_ERROR)
def test_raises_exception_for_xpath_lookup_error(handler, code):
    with pytest.raises(exceptions.WebDriverException):
        handler.check_response({'status': code, 'value': 'foo'})


@pytest.mark.parametrize('code', ErrorCode.TIMEOUT)
def test_raises_exception_for_timeout(handler, code):
    with pytest.raises(exceptions.TimeoutException):
        handler.check_response({'status': code, 'value': 'foo'})


@pytest.mark.parametrize('code', ErrorCode.NO_SUCH_WINDOW)
def test_raises_exception_for_no_such_window(handler, code):
    with pytest.raises(exceptions.NoSuchWindowException):
        handler.check_response({'status': code, 'value': 'foo'})


@pytest.mark.parametrize('code', ErrorCode.INVALID_COOKIE_DOMAIN)
def test_raises_exception_for_invalid_cookie_domain(handler, code):
    with pytest.raises(exceptions.InvalidCookieDomainException):
        handler.check_response({'status': code, 'value': 'foo'})


@pytest.mark.parametrize('code', ErrorCode.UNABLE_TO_SET_COOKIE)
def test_raises_exception_for_unable_to_set_cookie(handler, code):
    with pytest.raises(exceptions.UnableToSetCookieException):
        handler.check_response({'status': code, 'value': 'foo'})


@pytest.mark.parametrize('code', ErrorCode.UNEXPECTED_ALERT_OPEN)
def test_raises_exception_for_unexpected_alert_open(handler, code):
    with pytest.raises(exceptions.UnexpectedAlertPresentException):
        handler.check_response({'status': code, 'value': 'foo'})


@pytest.mark.parametrize('code', ErrorCode.NO_ALERT_OPEN)
def test_raises_exception_for_no_alert_open(handler, code):
    with pytest.raises(exceptions.NoAlertPresentException):
        handler.check_response({'status': code, 'value': 'foo'})


@pytest.mark.parametrize('code', ErrorCode.SCRIPT_TIMEOUT)
def test_raises_exception_for_script_timeout(handler, code):
    with pytest.raises(exceptions.TimeoutException):
        handler.check_response({'status': code, 'value': 'foo'})


@pytest.mark.parametrize('code', ErrorCode.INVALID_ELEMENT_COORDINATES)
def test_raises_exception_for_invalid_element_coordinates(handler, code):
    with pytest.raises(exceptions.WebDriverException):
        handler.check_response({'status': code, 'value': 'foo'})


@pytest.mark.parametrize('code', ErrorCode.IME_NOT_AVAILABLE)
def test_raises_exception_for_ime_not_available(handler, code):
    with pytest.raises(exceptions.ImeNotAvailableException):
        handler.check_response({'status': code, 'value': 'foo'})


@pytest.mark.parametrize('code', ErrorCode.IME_ENGINE_ACTIVATION_FAILED)
def test_raises_exception_for_ime_activation_failed(handler, code):
    with pytest.raises(exceptions.ImeActivationFailedException):
        handler.check_response({'status': code, 'value': 'foo'})


@pytest.mark.parametrize('code', ErrorCode.INVALID_SELECTOR)
def test_raises_exception_for_invalid_selector(handler, code):
    with pytest.raises(exceptions.InvalidSelectorException):
        handler.check_response({'status': code, 'value': 'foo'})


@pytest.mark.parametrize('code', ErrorCode.SESSION_NOT_CREATED)
def test_raises_exception_for_session_not_created(handler, code):
    with pytest.raises(exceptions.SessionNotCreatedException):
        handler.check_response({'status': code, 'value': 'foo'})


@pytest.mark.parametrize('code', ErrorCode.MOVE_TARGET_OUT_OF_BOUNDS)
def test_raises_exception_for_move_target_out_of_bounds(handler, code):
    with pytest.raises(exceptions.MoveTargetOutOfBoundsException):
        handler.check_response({'status': code, 'value': 'foo'})


@pytest.mark.parametrize('code', ErrorCode.INVALID_XPATH_SELECTOR)
def test_raises_exception_for_invalid_xpath_selector(handler, code):
    with pytest.raises(exceptions.InvalidSelectorException):
        handler.check_response({'status': code, 'value': 'foo'})


@pytest.mark.parametrize('code', ErrorCode.INVALID_XPATH_SELECTOR_RETURN_TYPER)
def test_raises_exception_for_invalid_xpath_selector_return_typer(handler, code):
    with pytest.raises(exceptions.InvalidSelectorException):
        handler.check_response({'status': code, 'value': 'foo'})


@pytest.mark.parametrize('code', ErrorCode.ELEMENT_NOT_INTERACTABLE)
def test_raises_exception_for_element_not_interactable(handler, code):
    with pytest.raises(exceptions.ElementNotInteractableException):
        handler.check_response({'status': code, 'value': 'foo'})


@pytest.mark.parametrize('code', ErrorCode.INSECURE_CERTIFICATE)
def test_raises_exception_for_insecure_certificate(handler, code):
    with pytest.raises(exceptions.InsecureCertificateException):
        handler.check_response({'status': code, 'value': 'foo'})


@pytest.mark.parametrize('code', ErrorCode.INVALID_ARGUMENT)
def test_raises_exception_for_invalid_argument(handler, code):
    with pytest.raises(exceptions.InvalidArgumentException):
        handler.check_response({'status': code, 'value': 'foo'})


@pytest.mark.parametrize('code', ErrorCode.INVALID_COORDINATES)
def test_raises_exception_for_invalid_coordinates(handler, code):
    with pytest.raises(exceptions.InvalidCoordinatesException):
        handler.check_response({'status': code, 'value': 'foo'})


@pytest.mark.parametrize('code', ErrorCode.INVALID_SESSION_ID)
def test_raises_exception_for_invalid_session_id(handler, code):
    with pytest.raises(exceptions.InvalidSessionIdException):
        handler.check_response({'status': code, 'value': 'foo'})


@pytest.mark.parametrize('code', ErrorCode.NO_SUCH_COOKIE)
def test_raises_exception_for_no_such_cookie(handler, code):
    with pytest.raises(exceptions.NoSuchCookieException):
        handler.check_response({'status': code, 'value': 'foo'})


@pytest.mark.parametrize('code', ErrorCode.UNABLE_TO_CAPTURE_SCREEN)
def test_raises_exception_for_unable_to_capture_screen_exception(handler, code):
    with pytest.raises(exceptions.ScreenshotException):
        handler.check_response({'status': code, 'value': 'foo'})


@pytest.mark.parametrize('code', ErrorCode.ELEMENT_CLICK_INTERCEPTED)
def test_raises_exception_for_element_click_intercepted(handler, code):
    with pytest.raises(exceptions.ElementClickInterceptedException):
        handler.check_response({'status': code, 'value': 'foo'})


@pytest.mark.parametrize('code', ErrorCode.UNKNOWN_METHOD)
def test_raises_exception_for_unknown_method(handler, code):
    with pytest.raises(exceptions.UnknownMethodException):
        handler.check_response({'status': code, 'value': 'foo'})


@pytest.mark.parametrize('code', ErrorCode.METHOD_NOT_ALLOWED)
def test_raises_exception_for_method_not_allowed(handler, code):
    with pytest.raises(exceptions.WebDriverException):
        handler.check_response({'status': code, 'value': 'foo'})
