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

from typing import Any
from typing import Dict
from typing import Type

from selenium.common.exceptions import ElementClickInterceptedException
from selenium.common.exceptions import ElementNotInteractableException
from selenium.common.exceptions import ElementNotSelectableException
from selenium.common.exceptions import ElementNotVisibleException
from selenium.common.exceptions import ImeActivationFailedException
from selenium.common.exceptions import ImeNotAvailableException
from selenium.common.exceptions import InsecureCertificateException
from selenium.common.exceptions import InvalidArgumentException
from selenium.common.exceptions import InvalidCookieDomainException
from selenium.common.exceptions import InvalidCoordinatesException
from selenium.common.exceptions import InvalidElementStateException
from selenium.common.exceptions import InvalidSelectorException
from selenium.common.exceptions import InvalidSessionIdException
from selenium.common.exceptions import JavascriptException
from selenium.common.exceptions import MoveTargetOutOfBoundsException
from selenium.common.exceptions import NoAlertPresentException
from selenium.common.exceptions import NoSuchCookieException
from selenium.common.exceptions import NoSuchElementException
from selenium.common.exceptions import NoSuchFrameException
from selenium.common.exceptions import NoSuchShadowRootException
from selenium.common.exceptions import NoSuchWindowException
from selenium.common.exceptions import ScreenshotException
from selenium.common.exceptions import SessionNotCreatedException
from selenium.common.exceptions import StaleElementReferenceException
from selenium.common.exceptions import TimeoutException
from selenium.common.exceptions import UnableToSetCookieException
from selenium.common.exceptions import UnexpectedAlertPresentException
from selenium.common.exceptions import UnknownMethodException
from selenium.common.exceptions import WebDriverException


ErrorCode = {
    "SUCCESS": (0,),
    "NO_SUCH_ELEMENT": (7, "no such element", NoSuchElementException),
    "NO_SUCH_FRAME": (8, "no such frame", NoSuchFrameException),
    "NO_SUCH_SHADOW_ROOT": ("no such shadow root", NoSuchShadowRootException),
    "STALE_ELEMENT_REFERENCE": (
        10,
        "stale element reference",
        StaleElementReferenceException,
    ),
    "ELEMENT_NOT_VISIBLE": (11, "element not visible", ElementNotVisibleException),
    "INVALID_ELEMENT_STATE": (
        12,
        "invalid element state",
        InvalidElementStateException,
    ),
    "UNKNOWN_ERROR": (13, "unknown error", WebDriverException),
    "ELEMENT_IS_NOT_SELECTABLE": (
        15,
        "element not selectable",
        ElementNotSelectableException,
    ),
    "JAVASCRIPT_ERROR": (17, "javascript error", JavascriptException),
    "TIMEOUT": (21, "timeout", TimeoutException),
    "NO_SUCH_WINDOW": (23, "no such window", NoSuchWindowException),
    "INVALID_COOKIE_DOMAIN": (
        24,
        "invalid cookie domain",
        InvalidCookieDomainException,
    ),
    "UNABLE_TO_SET_COOKIE": (25, "unable to set cookie", UnableToSetCookieException),
    "UNEXPECTED_ALERT_OPEN": (
        26,
        "unexpected alert open",
        UnexpectedAlertPresentException,
    ),
    "NO_ALERT_OPEN": (27, "no such alert", NoAlertPresentException),
    "SCRIPT_TIMEOUT": (28, "script timeout", TimeoutException),
    "IME_NOT_AVAILABLE": (30, "ime not available", ImeNotAvailableException),
    "IME_ENGINE_ACTIVATION_FAILED": (
        31,
        "ime engine activation failed",
        ImeActivationFailedException,
    ),
    "INVALID_SELECTOR": (32, "invalid selector", InvalidSelectorException),
    "SESSION_NOT_CREATED": (33, "session not created", SessionNotCreatedException),
    "MOVE_TARGET_OUT_OF_BOUNDS": (
        34,
        "move target out of bounds",
        MoveTargetOutOfBoundsException,
    ),
    "INVALID_XPATH_SELECTOR": (51, "invalid selector", InvalidSelectorException),
    "INVALID_XPATH_SELECTOR_RETURN_TYPER": (
        52,
        "invalid selector",
        InvalidSelectorException,
    ),
    "ELEMENT_NOT_INTERACTABLE": (
        60,
        "element not interactable",
        ElementNotInteractableException,
    ),
    "INSECURE_CERTIFICATE": ("insecure certificate", InsecureCertificateException),
    "INVALID_ARGUMENT": (61, "invalid argument", InvalidArgumentException),
    "INVALID_COORDINATES": ("invalid coordinates", InvalidCoordinatesException),
    "INVALID_SESSION_ID": ("invalid session id", InvalidSessionIdException),
    "NO_SUCH_COOKIE": (62, "no such cookie", NoSuchCookieException),
    "UNABLE_TO_CAPTURE_SCREEN": (63, "unable to capture screen", ScreenshotException),
    "ELEMENT_CLICK_INTERCEPTED": (
        64,
        "element click intercepted",
        ElementClickInterceptedException,
    ),
    "UNKNOWN_METHOD": ("unknown method exception", UnknownMethodException),
    "METHOD_NOT_ALLOWED": (405, "unsupported operation", None),
    "UNKNOWN_COMMAND": (9, "unknown command", None),
    "INVALID_ELEMENT_COORDINATES": (29, "invalid element coordinates", None),
    "XPATH_LOOKUP_ERROR": (19, "invalid selector", None),
}


class ErrorHandler:
    """Handles errors returned by the WebDriver server."""

    def check_response(self, response: Dict[str, Any]) -> None:
        """Checks that a JSON response from the WebDriver does not have an
        error.

        :Args:
         - response - The JSON response from the WebDriver server as a dictionary
           object.

        :Raises: If the response contains an error message.
        """
        status = response.get("status", None)
        if not status or status == ErrorCode.get("SUCCESS"):
            return
        value = None
        message = response.get("message", "")
        screen: str = response.get("screen", "")
        stacktrace = None
        if isinstance(status, int):
            value_json = response.get("value", None)
            if value_json and isinstance(value_json, str):
                import json

                try:
                    value = json.loads(value_json)
                    if len(value) == 1:
                        value = value["value"]
                    status = value.get("error", None)
                    if not status:
                        status = value.get("status", ErrorCode.get("UNKNOWN_ERROR"))
                        message = value.get("value") or value.get("message")
                        if not isinstance(message, str):
                            value = message
                            message = message.get("message")
                    else:
                        message = value.get("message", None)
                except ValueError:
                    pass

        exception_class: Type[WebDriverException]
        for key, value in ErrorCode.items():
            if status in value:
                exception_class = value[-1]
                break
        if not exception_class:
            exception_class = WebDriverException

        if not value:
            value = response["value"]
        if isinstance(value, str):
            raise exception_class(value)
        if message == "" and "message" in value:
            message = value["message"]

        screen = None  # type: ignore[assignment]
        if "screen" in value:
            screen = value["screen"]

        stacktrace = None
        st_value = value.get("stackTrace") or value.get("stacktrace")
        if st_value:
            if isinstance(st_value, str):
                stacktrace = st_value.split("\n")
            else:
                stacktrace = []
                try:
                    for frame in st_value:
                        line = frame.get("lineNumber", "")
                        file = frame.get("fileName", "<anonymous>")
                        if line:
                            file = f"{file}:{line}"
                        meth = frame.get("methodName", "<anonymous>")
                        if "className" in frame:
                            meth = f"{frame['className']}.{meth}"
                        msg = "    at %s (%s)"
                        msg = msg % (meth, file)
                        stacktrace.append(msg)
                except TypeError:
                    pass
        if exception_class == UnexpectedAlertPresentException:
            alert_text = None
            if "data" in value:
                alert_text = value["data"].get("text")
            elif "alert" in value:
                alert_text = value["alert"].get("text")
            raise exception_class(message, screen, stacktrace, alert_text)  # type: ignore[call-arg]  # mypy is not smart enough here
        raise exception_class(message, screen, stacktrace)
