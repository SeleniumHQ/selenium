# Copyright 2010 WebDriver committers
# Copyright 2010 Google Inc.
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

from selenium.common.exceptions import ElementNotSelectableException
from selenium.common.exceptions import ElementNotVisibleException
from selenium.common.exceptions import InvalidCookieDomainException
from selenium.common.exceptions import InvalidElementStateException
from selenium.common.exceptions import InvalidSelectiorException
from selenium.common.exceptions import ImeNotAvailableException
from selenium.common.exceptions import ImeActivationFailedException
from selenium.common.exceptions import NoSuchElementException
from selenium.common.exceptions import NoSuchFrameException
from selenium.common.exceptions import NoSuchWindowException
from selenium.common.exceptions import StaleElementReferenceException
from selenium.common.exceptions import UnableToSetCookieException
from selenium.common.exceptions import NoAlertPresentException
from selenium.common.exceptions import ErrorInResponseException
from selenium.common.exceptions import TimeoutException
from selenium.common.exceptions import WebDriverException


class ErrorCode(object):
    """
    Error codes defined in the WebDriver wire protocol.
    """
    # Keep in sync with org.openqa.selenium.remote.ErrorCodes and errorcodes.h
    SUCCESS = 0
    NO_SUCH_ELEMENT = 7
    NO_SUCH_FRAME = 8
    UNKNOWN_COMMAND = 9
    STALE_ELEMENT_REFERENCE = 10
    ELEMENT_NOT_VISIBLE = 11
    INVALID_ELEMENT_STATE = 12
    UNKNOWN_ERROR = 13
    ELEMENT_IS_NOT_SELECTABLE = 15
    JAVASCRIPT_ERROR = 17
    XPATH_LOOKUP_ERROR = 19
    TIMEOUT = 21
    NO_SUCH_WINDOW = 23
    INVALID_COOKIE_DOMAIN = 24
    UNABLE_TO_SET_COOKIE = 25
    UNEXPECTED_ALERT_OPEN = 26
    NO_ALERT_OPEN = 27
    SCRIPT_TIMEOUT = 28
    INVALID_ELEMENT_COORDINATES = 29
    IME_NOT_AVAILABLE = 30;
    IME_ENGINE_ACTIVATION_FAILED = 31
    INVALID_SELECTOR = 32
    MOVE_TARGET_OUT_OF_BOUNDS = 34
    INVALID_XPATH_SELECTOR = 51
    INVALID_XPATH_SELECTOR_RETURN_TYPER = 52
    METHOD_NOT_ALLOWED = 405


class ErrorHandler(object):
    """
    Handles errors returned by the WebDriver server.
    """
    def check_response(self, response):
        """
        Checks that a JSON response from the WebDriver does not have an error.
        
        :Args:
         - response - The JSON response from the WebDriver server as a dictionary
           object.
        
        :Raises: If the response contains an error message.
        """
        status = response['status']
        if status == ErrorCode.SUCCESS:
            return
        exception_class = ErrorInResponseException
        if status == ErrorCode.NO_SUCH_ELEMENT:
            exception_class = NoSuchElementException
        elif status == ErrorCode.NO_SUCH_FRAME:
            exception_class = NoSuchFrameException
        elif status == ErrorCode.NO_SUCH_WINDOW:
            exception_class = NoSuchWindowException
        elif status == ErrorCode.STALE_ELEMENT_REFERENCE:
            exception_class = StaleElementReferenceException
        elif status == ErrorCode.ELEMENT_NOT_VISIBLE:
            exception_class = ElementNotVisibleException
        elif status == ErrorCode.INVALID_ELEMENT_STATE:
            exception_class = WebDriverException
        elif status == ErrorCode.INVALID_SELECTOR \
                or status == ErrorCode.INVALID_XPATH_SELECTOR \
                or status == ErrorCode.INVALID_XPATH_SELECTOR_RETURN_TYPER:
            exception_class = InvalidSelectiorException
        elif status == ErrorCode.ELEMENT_IS_NOT_SELECTABLE:
            exception_class = ElementNotSelectableException
        elif status == ErrorCode.INVALID_COOKIE_DOMAIN:
            exception_class = WebDriverException
        elif status == ErrorCode.UNABLE_TO_SET_COOKIE:
            exception_class = WebDriverException
        elif status == ErrorCode.TIMEOUT:
            exception_class = TimeoutException
        elif status == ErrorCode.SCRIPT_TIMEOUT:
            exception_class = TimeoutException
        elif status == ErrorCode.UNKNOWN_ERROR:
            exception_class = WebDriverException
        elif status == ErrorCode.NO_ALERT_OPEN:
            exception_class = NoAlertPresentException
        elif status == ErrorCode.IME_NOT_AVAILABLE:
            exception_class = ImeNotAvailableException
        elif status == ErrorCode.IME_ENGINE_ACTIVATION_FAILED:
            exception_class = ErrorCode.ImeActivationFailedException
        else:
            exception_class = WebDriverException
        value = response['value']
        if type(value) is str:
            if exception_class == ErrorInResponseException:
                raise exception_class(response, value)
            raise exception_class(value)
        message = ''
        if 'message' in value:
            message = value['message']

        screen = None
        if 'screen' in value:
            screen = value['screen']

        stacktrace = None
        if 'stackTrace' in value and value['stackTrace']:
            zeroeth = ''
            try:
                zeroeth = value['stackTrace'][0]
            except:
                pass
            if zeroeth.has_key('methodName'):
                stacktrace = "Method %s threw an error in %s" % \
                    (zeroeth['methodName'],
                    self._value_or_default(zeroeth, 'fileName', '[No file name]'))
        if exception_class == ErrorInResponseException:
            raise exception_class(response, message)
        raise exception_class(message, screen, stacktrace)

    def _value_or_default(self, obj, key, default):
      return obj[key] if obj.has_key(key) else default
