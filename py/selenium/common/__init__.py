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

from .exceptions import (
    ElementClickInterceptedException,
    ElementNotInteractableException,
    ElementNotSelectableException,
    ElementNotVisibleException,
    ImeActivationFailedException,
    ImeNotAvailableException,
    InsecureCertificateException,
    InvalidArgumentException,
    InvalidCookieDomainException,
    InvalidCoordinatesException,
    InvalidElementStateException,
    InvalidSelectorException,
    InvalidSessionIdException,
    InvalidSwitchToTargetException,
    JavascriptException,
    MoveTargetOutOfBoundsException,
    NoAlertPresentException,
    NoSuchAttributeException,
    NoSuchCookieException,
    NoSuchDriverException,
    NoSuchElementException,
    NoSuchFrameException,
    NoSuchShadowRootException,
    NoSuchWindowException,
    ScreenshotException,
    SessionNotCreatedException,
    StaleElementReferenceException,
    TimeoutException,
    UnableToSetCookieException,
    UnexpectedAlertPresentException,
    UnexpectedTagNameException,
    UnknownMethodException,
    WebDriverException,
)

__all__ = [
    "WebDriverException",
    "InvalidSwitchToTargetException",
    "NoSuchFrameException",
    "NoSuchWindowException",
    "NoSuchElementException",
    "NoSuchAttributeException",
    "NoSuchDriverException",
    "NoSuchShadowRootException",
    "StaleElementReferenceException",
    "InvalidElementStateException",
    "UnexpectedAlertPresentException",
    "NoAlertPresentException",
    "ElementNotVisibleException",
    "ElementNotInteractableException",
    "ElementNotSelectableException",
    "InvalidCookieDomainException",
    "UnableToSetCookieException",
    "TimeoutException",
    "MoveTargetOutOfBoundsException",
    "UnexpectedTagNameException",
    "InvalidSelectorException",
    "ImeNotAvailableException",
    "ImeActivationFailedException",
    "InvalidArgumentException",
    "JavascriptException",
    "NoSuchCookieException",
    "ScreenshotException",
    "ElementClickInterceptedException",
    "InsecureCertificateException",
    "InvalidCoordinatesException",
    "InvalidSessionIdException",
    "SessionNotCreatedException",
    "UnknownMethodException",
]
