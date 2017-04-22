# encoding: utf-8
#
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

module Selenium
  module WebDriver
    module Error
      class WebDriverError < StandardError; end

      #
      # An attempt was made to select an element that cannot be selected.
      #

      class ElementNotSelectableError < WebDriverError; end

      #
      # An element command could not be completed because the element is
      # not visible on the page.
      #

      class ElementNotVisibleError < WebDriverError; end

      #
      # The arguments passed to a command are either invalid or malformed.
      #

      class InvalidArgumentError < WebDriverError; end

      #
      # An illegal attempt was made to set a cookie under a different
      # domain than the current page.
      #

      class InvalidCookieDomainError < WebDriverError; end

      #
      # The coordinates provided to an interactions operation are invalid.
      #

      class InvalidElementCoordinatesError < WebDriverError; end

      #
      # An element command could not be completed because the element is
      # in an invalid state, e.g. attempting to click an element that is no
      # longer attached to the document.
      #

      class InvalidElementStateError < WebDriverError; end

      #
      # Argument was an invalid selector.
      #

      class InvalidSelectorError < WebDriverError; end

      #
      # Occurs if the given session id is not in the list of active sessions,
      # meaning the session either does not exist or that it's not active.
      #

      class InvalidSessionIdError < WebDriverError; end

      #
      # An error occurred while executing JavaScript supplied by the user.
      #

      class JavascriptError < WebDriverError; end

      #
      # The target for mouse interaction is not in the browser's viewport and
      # cannot be brought into that viewport.
      #

      class MoveTargetOutOfBoundsError < WebDriverError; end

      #
      # An attempt was made to operate on a modal dialog when one was not open.
      #

      class NoSuchAlertError < WebDriverError; end

      #
      # An element could not be located on the page using the given
      # search parameters.
      #

      class NoSuchElementError < WebDriverError; end

      #
      # A request to switch to a frame could not be satisfied because the
      # frame could not be found.
      #

      class NoSuchFrameError < WebDriverError; end

      #
      # A request to switch to a window could not be satisfied because the
      # window could not be found.
      #

      class NoSuchWindowError < WebDriverError; end

      #
      # A script did not complete before its timeout expired.
      #

      class ScriptTimeoutError < WebDriverError; end

      #
      # A new session could not be created.
      #

      class SessionNotCreatedError < WebDriverError; end

      #
      # An element command failed because the referenced element is no longer
      # attached to the DOM.
      #

      class StaleElementReferenceError < WebDriverError; end

      #
      # An operation did not complete before its timeout expired.
      #

      class TimeoutError < WebDriverError; end

      #
      # A request to set a cookie's value could not be satisfied.
      #

      class UnableToSetCookieError < WebDriverError; end

      #
      # A screen capture was made impossible.
      #

      class UnableToCaptureScreenError < WebDriverError; end

      #
      # A modal dialog was open, blocking this operation.
      #

      class UnexpectedAlertOpenError < WebDriverError; end

      #
      # An unknown error occurred in the remote end while processing
      # the command.
      #

      class UnknownError < WebDriverError; end

      #
      # The requested command matched a known URL but did not match a
      # method for that URL.
      #

      class UnknownMethodError < WebDriverError; end

      #
      # Indicates that a command that should have executed properly cannot be supported for some reason.
      #

      class UnsupportedOperationError < WebDriverError; end

      #
      # Indicates that the Element Click command could not be completed because the element receiving the events
      # is obscuring the element that was requested clicked.
      #

      class ElementClickInterceptedError < WebDriverError; end

      #
      # Indicates that a command could not be completed because the element is not pointer or keyboard interactable.
      #

      class ElementNotInteractableError < WebDriverError; end

      # aliased for backwards compatibility
      NoAlertPresentError       = NoSuchAlertError
      ScriptTimeOutError        = ScriptTimeoutError
      ObsoleteElementError      = StaleElementReferenceError
      UnhandledError            = UnknownError
      UnexpectedJavascriptError = JavascriptError
      NoAlertOpenError          = NoAlertPresentError
      ElementNotDisplayedError  = ElementNotVisibleError
    end # Error
  end # WebDriver
end # Selenium
