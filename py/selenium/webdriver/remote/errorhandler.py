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
from typing import Union
from typing import Sequence
from typing import List

from selenium.common.exceptions import ElementClickInterceptedException
from selenium.common.exceptions import ElementNotInteractableException
from selenium.common.exceptions import ElementNotSelectableException
from selenium.common.exceptions import ElementNotVisibleException
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

import json

ERROR_TO_EXC_MAPPING: Dict[str, Type[WebDriverException]] = {
    'element click intercepted': ElementClickInterceptedException,
    'element not interactable': ElementNotInteractableException,
    'insecure certificate': InsecureCertificateException,
    'invalid argument': InvalidArgumentException,
    'invalid cookie domain': InvalidCookieDomainException,
    'invalid element state': InvalidElementStateException,
    'invalid selector': InvalidSelectorException,
    'invalid session id': InvalidSessionIdException,
    'javascript error': JavascriptException,
    'move target out of bounds': MoveTargetOutOfBoundsException,
    'no such alert': NoAlertPresentException,
    'no such cookie': NoSuchCookieException,
    'no such element': NoSuchElementException,
    'no such frame': NoSuchFrameException,
    'no such window': NoSuchWindowException,
    'no such shadow root': NoSuchShadowRootException,
    'script timeout': TimeoutException,
    'session not created': SessionNotCreatedException,
    'stale element reference': StaleElementReferenceException,
    'detached shadow root': NoSuchShadowRootException,
    'timeout': TimeoutException,
    'unable to set cookie': UnableToSetCookieException,
    'unable to capture screen': ScreenshotException,
    'unexpected alert open': UnexpectedAlertPresentException,
    'unknown command': UnknownMethodException,
    'unknown error': WebDriverException,
    'unknown method': UnknownMethodException,
    'unsupported operation': UnknownMethodException,
    'element not visible': ElementNotVisibleException,
    'element not selectable': ElementNotSelectableException,
    'invalid coordinates': InvalidCoordinatesException,
}


def format_stacktrace(original: Union[None, str, Sequence]) -> List[str]:
    if not original:
        return []
    if isinstance(original, str):
        return original.split('\n')

    result: List[str] = []
    try:
        for frame in original:
            if not isinstance(frame, dict):
                continue

            line = frame.get('lineNumber', '')
            file = frame.get('fileName', '<anonymous>')
            if line:
                file = f'{file}:{line}'
            meth = frame.get('methodName', '<anonymous>')
            if 'className' in frame:
                meth = f'{frame["className"]}.{meth}'
            result.append(f'    at {meth} ({file})')
    except TypeError:
        pass
    return result


class ErrorHandler:
    """Handles errors returned by the WebDriver server."""

    def check_response(self, response: Dict[str, Any]) -> None:
        """Checks that a JSON response from the WebDriver does not have an
        error.

        :Args:
         - response - The JSON response from the WebDriver server as a dictionary
           object. The format is expected to be {'value': {message body}}

        :Raises: If the response contains an error message.
        """

        payload_dict = response
        if type(response) != dict:
            try:
                payload_dict = json.loads(response)
            except (json.JSONDecodeError, TypeError):
                return
        if not isinstance(payload_dict, dict):
            return

        payload_dict = payload_dict.get("value")
        if payload_dict is None:
            # invalid response
            return

        error = payload_dict.get('error')

        if not error:
            return
        message = payload_dict.get('message', error)

        exception_class: Type[WebDriverException] = ERROR_TO_EXC_MAPPING.get(
            error, WebDriverException
        )

        # backtrace from remote in Ruby
        stacktrace = None
        st_value = payload_dict.get('stacktrace', '')
        if st_value == '':
            # backword compatibility
            st_value = payload_dict.get('stackTrace', '')
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
        if exception_class is UnexpectedAlertPresentException:
            raise UnexpectedAlertPresentException(
                msg=message,
                stacktrace=format_stacktrace(stacktrace),
                alert_text=payload_dict.get('data'),
            )
        raise exception_class(msg=message, stacktrace=stacktrace)
