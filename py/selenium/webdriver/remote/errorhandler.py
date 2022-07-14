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


from typing import Any, Dict, Type


from selenium.common.exceptions import (ElementClickInterceptedException,
                                        ElementNotInteractableException,
                                        ElementNotSelectableException,
                                        ElementNotVisibleException,
                                        InsecureCertificateException,
                                        InvalidCoordinatesException,
                                        InvalidElementStateException,
                                        InvalidSessionIdException,
                                        InvalidSelectorException,
                                        ImeNotAvailableException,
                                        ImeActivationFailedException,
                                        InvalidArgumentException,
                                        InvalidCookieDomainException,
                                        JavascriptException,
                                        MoveTargetOutOfBoundsException,
                                        NoSuchCookieException,
                                        NoSuchElementException,
                                        NoSuchFrameException,
                                        NoSuchShadowRootException,
                                        NoSuchWindowException,
                                        NoAlertPresentException,
                                        ScreenshotException,
                                        SessionNotCreatedException,
                                        StaleElementReferenceException,
                                        TimeoutException,
                                        UnableToSetCookieException,
                                        UnexpectedAlertPresentException,
                                        UnknownMethodException,
                                        WebDriverException)


class ErrorCode:
    """
    Error codes defined in the WebDriver wire protocol.
    """
    # Keep in sync with org.openqa.selenium.remote.ErrorCodes and errorcodes.h
    NO_SUCH_ELEMENT: str = 'no such element'
    NO_SUCH_FRAME: str = 'no such frame'
    NO_SUCH_SHADOW_ROOT: str = "no such shadow root"
    UNKNOWN_COMMAND: str = 'unknown command'
    STALE_ELEMENT_REFERENCE: str = 'stale element reference'
    ELEMENT_NOT_VISIBLE: str = 'element not visible'
    INVALID_ELEMENT_STATE: str = 'invalid element state'
    UNKNOWN_ERROR: str = 'unknown error'
    ELEMENT_IS_NOT_SELECTABLE: str = 'element not selectable'
    JAVASCRIPT_ERROR: str = 'javascript error'
    XPATH_LOOKUP_ERROR: str = 'invalid selector'
    TIMEOUT: str = 'timeout'
    NO_SUCH_WINDOW: str = 'no such window'
    INVALID_COOKIE_DOMAIN: str = 'invalid cookie domain'
    UNABLE_TO_SET_COOKIE: str = 'unable to set cookie'
    UNEXPECTED_ALERT_OPEN: str = 'unexpected alert open'
    NO_ALERT_OPEN: str = 'no such alert'
    SCRIPT_TIMEOUT: str = 'script timeout'
    INVALID_ELEMENT_COORDINATES: str = 'invalid element coordinates'
    IME_NOT_AVAILABLE: str = 'ime not available'
    IME_ENGINE_ACTIVATION_FAILED: str = 'ime engine activation failed'
    INVALID_SELECTOR: str = 'invalid selector'
    SESSION_NOT_CREATED: str = 'session not created'
    MOVE_TARGET_OUT_OF_BOUNDS: str = 'move target out of bounds'
    INVALID_XPATH_SELECTOR: str = 'invalid selector'
    INVALID_XPATH_SELECTOR_RETURN_TYPER: str = 'invalid selector'

    ELEMENT_NOT_INTERACTABLE: str = 'element not interactable'
    INSECURE_CERTIFICATE: str = 'insecure certificate'
    INVALID_ARGUMENT: str = 'invalid argument'
    INVALID_COORDINATES: str = 'invalid coordinates'
    INVALID_SESSION_ID: str = 'invalid session id'
    NO_SUCH_COOKIE: str = 'no such cookie'
    UNABLE_TO_CAPTURE_SCREEN: str = 'unable to capture screen'
    ELEMENT_CLICK_INTERCEPTED: str = 'element click intercepted'
    UNKNOWN_METHOD: str = 'unknown method exception'

    METHOD_NOT_ALLOWED: str = 'unsupported operation'


class ErrorHandler:
    """
    Handles errors returned by the WebDriver server.
    """

    def check_response(self, response: Dict[str, Any]) -> None:
        """
        Checks that a JSON response from the WebDriver does not have an error.

        :Args:
         - response - The JSON response from the WebDriver server as a dictionary
           object.

        :Raises: If the response contains an error message.
        """
        status = response.get('status', None)
        if not status:  # covers `0` implicitly.
            return
        value = None
        message = response.get("message", "")
        screen: str = response.get("screen", "")
        stacktrace = None
        if isinstance(status, int):
            value_json = response.get('value', None)
            if value_json and isinstance(value_json, str):
                import json
                try:
                    value = json.loads(value_json)
                    if len(value.keys()) == 1:
                        value = value['value']
                    status = value.get('error', None)
                    if not status:
                        status = value.get("status", ErrorCode.UNKNOWN_ERROR)
                        message = value.get("value") or value.get("message")
                        if not isinstance(message, str):
                            value = message
                            message = message.get('message')
                    else:
                        message = value.get('message', None)
                except ValueError:
                    pass

        exception_class: Type[WebDriverException]
        if status == ErrorCode.NO_SUCH_ELEMENT:
            exception_class = NoSuchElementException
        elif status == ErrorCode.NO_SUCH_FRAME:
            exception_class = NoSuchFrameException
        elif status == ErrorCode.NO_SUCH_SHADOW_ROOT:
            exception_class = NoSuchShadowRootException
        elif status == ErrorCode.NO_SUCH_WINDOW:
            exception_class = NoSuchWindowException
        elif status == ErrorCode.STALE_ELEMENT_REFERENCE:
            exception_class = StaleElementReferenceException
        elif status == ErrorCode.ELEMENT_NOT_VISIBLE:
            exception_class = ElementNotVisibleException
        elif status == ErrorCode.INVALID_ELEMENT_STATE:
            exception_class = InvalidElementStateException
        elif status in (ErrorCode.INVALID_SELECTOR,
                        ErrorCode.INVALID_XPATH_SELECTOR,
                        ErrorCode.INVALID_XPATH_SELECTOR_RETURN_TYPER):
            exception_class = InvalidSelectorException
        elif status == ErrorCode.ELEMENT_IS_NOT_SELECTABLE:
            exception_class = ElementNotSelectableException
        elif status == ErrorCode.ELEMENT_NOT_INTERACTABLE:
            exception_class = ElementNotInteractableException
        elif status == ErrorCode.INVALID_COOKIE_DOMAIN:
            exception_class = InvalidCookieDomainException
        elif status == ErrorCode.UNABLE_TO_SET_COOKIE:
            exception_class = UnableToSetCookieException
        elif status == ErrorCode.TIMEOUT:
            exception_class = TimeoutException
        elif status == ErrorCode.SCRIPT_TIMEOUT:
            exception_class = TimeoutException
        elif status == ErrorCode.UNKNOWN_ERROR:
            exception_class = WebDriverException
        elif status == ErrorCode.UNEXPECTED_ALERT_OPEN:
            exception_class = UnexpectedAlertPresentException
        elif status == ErrorCode.NO_ALERT_OPEN:
            exception_class = NoAlertPresentException
        elif status == ErrorCode.IME_NOT_AVAILABLE:
            exception_class = ImeNotAvailableException
        elif status == ErrorCode.IME_ENGINE_ACTIVATION_FAILED:
            exception_class = ImeActivationFailedException
        elif status == ErrorCode.MOVE_TARGET_OUT_OF_BOUNDS:
            exception_class = MoveTargetOutOfBoundsException
        elif status == ErrorCode.JAVASCRIPT_ERROR:
            exception_class = JavascriptException
        elif status == ErrorCode.SESSION_NOT_CREATED:
            exception_class = SessionNotCreatedException
        elif status == ErrorCode.INVALID_ARGUMENT:
            exception_class = InvalidArgumentException
        elif status == ErrorCode.NO_SUCH_COOKIE:
            exception_class = NoSuchCookieException
        elif status == ErrorCode.UNABLE_TO_CAPTURE_SCREEN:
            exception_class = ScreenshotException
        elif status == ErrorCode.ELEMENT_CLICK_INTERCEPTED:
            exception_class = ElementClickInterceptedException
        elif status == ErrorCode.INSECURE_CERTIFICATE:
            exception_class = InsecureCertificateException
        elif status == ErrorCode.INVALID_COORDINATES:
            exception_class = InvalidCoordinatesException
        elif status == ErrorCode.INVALID_SESSION_ID:
            exception_class = InvalidSessionIdException
        elif status == ErrorCode.UNKNOWN_METHOD:
            exception_class = UnknownMethodException
        else:
            exception_class = WebDriverException
        if not value:
            value = response['value']
        if isinstance(value, str):
            raise exception_class(value)
        if message == "" and 'message' in value:
            message = value['message']

        if 'screen' in value:
            screen = value['screen']

        st_value = value.get('stacktrace')
        if st_value:
            if isinstance(st_value, str):
                stacktrace = st_value.split('\n')
            else:
                stacktrace = []
                try:
                    for frame in st_value:
                        line = frame.get("lineNumber", "")
                        file = frame.get("fileName", "<anonymous>")
                        if line:
                            file = f"{file}:{line}"
                        meth = frame.get('methodName', '<anonymous>')
                        if 'className' in frame:
                            meth = f"{frame['className']}.{meth}"
                        msg = "    at %s (%s)"
                        msg = msg % (meth, file)
                        stacktrace.append(msg)
                except TypeError:
                    pass
        if exception_class == UnexpectedAlertPresentException:
            alert_text = None
            if 'data' in value:
                alert_text = value['data'].get('text')
            elif 'alert' in value:
                alert_text = value['alert'].get('text')
            raise exception_class(message, screen, stacktrace, alert_text)  # type: ignore[call-arg]
        raise exception_class(message, screen, stacktrace)
