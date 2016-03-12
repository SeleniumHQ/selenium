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
      class UnsupportedOperationError < WebDriverError; end

      class IndexOutOfBoundsError < WebDriverError; end          # 1
      class NoCollectionError < WebDriverError; end              # 2
      class NoStringError < WebDriverError; end                  # 3
      class NoStringLengthError < WebDriverError; end            # 4
      class NoStringWrapperError < WebDriverError; end           # 5
      class NoSuchDriverError < WebDriverError; end              # 6

      #
      # An element could not be located on the page using the given search
      # parameters.
      #

      class NoSuchElementError < WebDriverError; end             # 7

      #
      # A request to switch to a frame could not be satisfied because the
      # frame could not be found.
      #

      class NoSuchFrameError < WebDriverError; end               # 8
      class UnknownCommandError < WebDriverError; end            # 9


      #
      # Indicates that a reference to an element is now "stale" - the element
      # no longer appears in the DOM of the page.
      #

      class StaleElementReferenceError < WebDriverError; end     # 10

      #
      # Raised to indicate that although an element is present on the DOM,
      # it is not visible, and so is not able to be interacted with.
      #

      class ElementNotVisibleError < WebDriverError; end         # 11

      #
      # Raised when an interaction could not be performed because the element
      # is in an invalid state (e.g. attempting to click a disabled element).
      #

      class InvalidElementStateError < WebDriverError; end       # 12

      #
      # An unknown server-side error occurred while processing the command.
      #

      class UnknownError < WebDriverError; end                   # 13
      class ExpectedError < WebDriverError; end                  # 14

      #
      # An attempt was made to select an element that cannot be selected.
      #

      class ElementNotSelectableError < WebDriverError; end      # 15
      class NoSuchDocumentError < WebDriverError; end            # 16

      #
      # An error occurred while executing user supplied JavaScript.
      #

      class JavascriptError < WebDriverError; end                # 17
      class NoScriptResultError < WebDriverError; end            # 18

      #
      # An error occurred while searching for an element by XPath.
      #

      class XPathLookupError < WebDriverError; end               # 19
      class NoSuchCollectionError < WebDriverError; end          # 20

      #
      # Raised when a command does not complete in enough time.
      #

      class TimeOutError < WebDriverError; end                   # 21
      class NullPointerError < WebDriverError; end               # 22
      class NoSuchWindowError < WebDriverError; end              # 23

      #
      # Raised when attempting to add a cookie under a different domain than
      # the current URL.
      #

      class InvalidCookieDomainError < WebDriverError; end       # 24

      #
      # Raised when a driver fails to set a cookie.
      #

      class UnableToSetCookieError < WebDriverError; end         # 25

      #
      # Raised when an alert dialog is present that has not been dealt with.
      #
      class UnhandledAlertError < WebDriverError; end            # 26

      #
      # Indicates that a user has tried to access an alert when one is not present.
      #

      class NoAlertPresentError < WebDriverError; end            # 27

      #
      # A script did not complete before its timeout expired.
      #

      class ScriptTimeOutError < WebDriverError; end             # 28

      #
      # The coordinates provided to an interactions operation are invalid.
      #

      class InvalidElementCoordinatesError < WebDriverError; end # 29

      #
      # Indicates that IME support is not available. This exception is rasied
      # for every IME-related method call if IME support is not available on
      # the machine.
      #

      class IMENotAvailableError < WebDriverError; end           # 30

      #
      # Indicates that activating an IME engine has failed.
      #

      class IMEEngineActivationFailedError < WebDriverError; end # 31

      #
      # Argument was an invalid selector (e.g. XPath/CSS).
      #

      class InvalidSelectorError < WebDriverError; end           # 32

      #
      # A new session could not be created.
      #

      class SessionNotCreatedError < WebDriverError; end         # 33

      #
      # Indicates that the target provided to the actions #move method is
      # invalid, e.g. outside of the bounds of the window.
      #

      class MoveTargetOutOfBoundsError < WebDriverError; end     # 34

      # @api private
      Errors = [
        IndexOutOfBoundsError,          # 1
        NoCollectionError,              # 2
        NoStringError,                  # 3
        NoStringLengthError,            # 4
        NoStringWrapperError,           # 5
        NoSuchDriverError,              # 6
        NoSuchElementError,             # 7
        NoSuchFrameError,               # 8
        UnknownCommandError,            # 9
        StaleElementReferenceError,     # 10
        ElementNotVisibleError,         # 11
        InvalidElementStateError,       # 12
        UnknownError,                   # 13
        ExpectedError,                  # 14
        ElementNotSelectableError,      # 15
        NoSuchDocumentError,            # 16
        JavascriptError,                # 17
        NoScriptResultError,            # 18
        XPathLookupError,               # 19
        NoSuchCollectionError,          # 20
        TimeOutError,                   # 21
        NullPointerError,               # 22
        NoSuchWindowError,              # 23
        InvalidCookieDomainError,       # 24
        UnableToSetCookieError,         # 25
        UnhandledAlertError,            # 26
        NoAlertPresentError,            # 27
        ScriptTimeOutError,             # 28
        InvalidElementCoordinatesError, # 29
        IMENotAvailableError,           # 30
        IMEEngineActivationFailedError, # 31
        InvalidSelectorError,           # 32
        SessionNotCreatedError,         # 33
        MoveTargetOutOfBoundsError      # 34
      ]

      class << self
        def for_code(code)
          return if [nil, 0].include? code
          return Errors[code - 1] if code.is_a? Fixnum

          klass_name = code.split(' ').map(&:capitalize).join
          Error.const_get("#{klass_name.gsub('Error','')}Error")
        rescue NameError
          WebDriverError
        end
      end

    end # Error
  end # WebDriver
end # Selenium
