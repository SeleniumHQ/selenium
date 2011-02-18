# Copyright 2008-2009 WebDriver committers
# Copyright 2008-2009 Google Inc.
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

"""Exceptions that may happen in all the webdriver code."""
class WebDriverException(Exception):
    def __init__(self, msg=None):
        Exception.__init__(self, msg)

class ErrorInResponseException(WebDriverException):
    """An error has occurred on the server side.

    This may happen when communicating with the firefox extension
    or the remote driver server."""
    def __init__(self, response, msg):
        WebDriverException.__init__(self, msg)
        self.response = response

class InvalidSwitchToTargetException(WebDriverException):
    """The frame or window target to be switched doesn't exist."""
    pass

class NoSuchFrameException(InvalidSwitchToTargetException):
    pass

class NoSuchWindowException(InvalidSwitchToTargetException):
    pass

class NoSuchElementException(WebDriverException):
    """find_element_by_* can't find the element."""
    pass

class NoSuchAttributeException(WebDriverException):
    """find_element_by_* can't find the element."""
    pass

class StaleElementReferenceException(WebDriverException):
    pass

class InvalidElementStateException(WebDriverException):
    pass

class ElementNotVisibleException(InvalidElementStateException):
    pass

class ElementNotSelectableException(InvalidElementStateException):
    pass

class InvalidCookieDomainException(WebDriverException):
    pass

class UnableToSetCookieException(WebDriverException):
    pass

class RemoteDriverServerException(WebDriverException):
    pass

class TimeoutException(WebDriverException):
    pass
