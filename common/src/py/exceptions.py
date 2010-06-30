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

class ErrorInResponseException(Exception):
    """An error has occurred on the server side.

    This may happen when communicating with the firefox extension
    or the remote driver server."""
    def __init__(self, response, msg):
        Exception.__init__(self, msg)
        self.response = response

class InvalidSwitchToTargetException(Exception):
    """The frame or window target to be switched doesn't exist."""
    def __init__(self, msg=None):
        Exception.__init__(self, msg)

class NoSuchFrameException(InvalidSwitchToTargetException):
    def __init__(self, msg=None):
        InvalidSwitchToTargetException.__init__(self, msg)

class NoSuchWindowException(InvalidSwitchToTargetException):
    def __init__(self, msg=None):
        InvalidSwitchToTargetException.__init__(self, msg)

class NoSuchElementException(Exception):
    """find_element_by_* can't find the element."""
    def __init__(self, msg=None):
        Exception.__init__(self, msg)

class NoSuchAttributeException(Exception):
    """find_element_by_* can't find the element."""
    def __init__(self, msg=None):
        Exception.__init__(self, msg)

class StaleElementReferenceException(Exception):
    def __init__(self, msg=None):
        Exception.__init__(self, msg)

class ElementNotVisibleException(Exception):
    def __init__(self, msg=None):
        Exception.__init__(self, msg)

class InvalidElementStateException(Exception):
    def __init__(self, msg=None):
        Exception.__init__(self, msg)

class ElementNotSelectableException(Exception):
    def __init__(self, msg=None):
        Exception.__init__(self, msg)

class InvalidCookieDomainException(Exception):
    def __init__(self, msg=None):
        Exception.__init__(self, msg)

class UnableToSetCookieException(Exception):
    def __init__(self, msg=None):
        Exception.__init__(self, msg)

class RemoteDriverServerException(Exception):
    def __init__(self, msg=None):
        Exception.__init__(self, msg)
