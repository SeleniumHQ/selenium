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
    def __init__(self, msg=None, screen=None, stacktrace=None):
        self.msg = msg
        self.screen = screen
        self.stacktrace = stacktrace

    def __str__(self):
        exception_msg = "Message: %s " % repr(self.msg)
        if self.screen is not None:
            exception_msg = "%s; Screenshot: available via screen " \
                % exception_msg
        if self.stacktrace is not None:
            exception_msg = "%s; Stacktrace: %s " \
                % (exception_msg, str(self.stacktrace))
        return exception_msg

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
    """Indicates that a reference to an element is now "stale" --- the
    element no longer appears on the DOM of the page."""
    pass

class InvalidElementStateException(WebDriverException):
    pass

class NoAlertPresentException(WebDriverException):
    pass

class ElementNotVisibleException(InvalidElementStateException):
    """Thrown to indicate that although an element is present on the
    DOM, it is not visible, and so is not able to be interacted
    with."""
    pass

class ElementNotSelectableException(InvalidElementStateException):
    pass

class InvalidCookieDomainException(WebDriverException):
    """Thrown when attempting to add a cookie under a different domain
    than the current URL."""
    pass

class UnableToSetCookieException(WebDriverException):
    """Thrown when a driver fails to set a cookie."""
    pass

class RemoteDriverServerException(WebDriverException):
    pass

class TimeoutException(WebDriverException):
    """Thrown when a command does not complete in enough time."""
    pass

class MoveTargetOutOfBoundsException(WebDriverException):
    """Indicates that the target provided to the actions move() method is invalid"""
    pass

class UnexpectedTagNameException(WebDriverException):
    """Thrown when a support class did not get an expected web element"""
    pass

class InvalidSelectorException(NoSuchElementException):
    """ Thrown when the selector which is used to find an element does not return
    a WebElement. Currently this only happens when the selector is an xpath
    expression is used which is either syntactically invalid (i.e. it is not a
    xpath expression) or the expression does not select WebElements
    (e.g. "count(//input)").
    """
    pass

class ImeNotAvailableException(WebDriverException):
    """
    Indicates that IME support is not available. This exception is thrown for every IME-related
    method call if IME support is not available on the machine.
    """
    pass

class ImeActivationFailedException(WebDriverException):
    """ Indicates that activating an IME engine has failed. """
    pass
