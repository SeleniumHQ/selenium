# frozen_string_literal: true

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
    module Error # rubocop:disable Metrics/ModuleLength

      #
      # Returns exception from code (Integer - OSS, String - W3C).
      # @param [Integer, String, nil] code
      #

      def self.for_code(code)
        case code
        when nil, 0
          nil
        when Integer
          Object.const_get(ERRORS.fetch(code).to_s)
        when String
          klass_name = code.split(' ').map(&:capitalize).join.sub(/Error$/, '')
          const_get("#{klass_name}Error", false)
        end
      rescue KeyError, NameError
        WebDriverError
      end

      class WebDriverError < StandardError; end

      class IndexOutOfBoundsError < WebDriverError; end # 1
      class NoCollectionError < WebDriverError; end # 2
      class NoStringError < WebDriverError; end # 3
      class NoStringLengthError < WebDriverError; end # 4
      class NoStringWrapperError < WebDriverError; end # 5
      class NoSuchDriverError < WebDriverError; end # 6

      #
      # An element could not be located on the page using the given search parameters.
      #

      class NoSuchElementError < WebDriverError; end # 7

      #
      # A command to switch to a frame could not be satisfied because the frame could not be found.
      #

      class NoSuchFrameError < WebDriverError; end # 8

      #
      # A command could not be executed because the remote end is not aware of it.
      #

      class UnknownCommandError < WebDriverError; end # 9

      #
      # A command failed because the referenced element is no longer attached to the DOM.
      #

      class StaleElementReferenceError < WebDriverError; end # 10

      #
      # Raised to indicate that although an element is present on the DOM, it is not visible, and
      # so is not able to be interacted with.
      #

      class ElementNotVisibleError < WebDriverError; end # 11

      #
      # The target element is in an invalid state, rendering it impossible to interact with, for
      # example if you click a disabled element.
      #

      class InvalidElementStateError < WebDriverError; end # 12

      #
      # An unknown error occurred in the remote end while processing the command.
      #

      class UnknownError < WebDriverError; end # 13
      class ExpectedError < WebDriverError; end # 14

      #
      # An attempt was made to select an element that cannot be selected.
      #

      class ElementNotSelectableError < WebDriverError; end # 15
      class NoSuchDocumentError < WebDriverError; end # 16

      #
      # An error occurred while executing JavaScript supplied by the user.
      #

      class JavascriptError < WebDriverError; end # 17
      class NoScriptResultError < WebDriverError; end # 18

      #
      # An error occurred while searching for an element by XPath.
      #

      class XPathLookupError < WebDriverError; end # 19
      class NoSuchCollectionError < WebDriverError; end # 20

      #
      # An operation did not complete before its timeout expired.
      #

      class TimeOutError < WebDriverError; end # 21

      class NullPointerError < WebDriverError; end # 22
      class NoSuchWindowError < WebDriverError; end # 23

      #
      # An illegal attempt was made to set a cookie under a different domain than the current page.
      #

      class InvalidCookieDomainError < WebDriverError; end # 24

      #
      # A command to set a cookie's value could not be satisfied.
      #

      class UnableToSetCookieError < WebDriverError; end # 25

      #
      # Raised when an alert dialog is present that has not been dealt with.
      #
      class UnhandledAlertError < WebDriverError; end # 26

      #
      # An attempt was made to operate on a modal dialog when one was not open:
      #
      #   * W3C dialect is NoSuchAlertError
      #   * OSS dialect is NoAlertPresentError
      #
      # We want to allow clients to rescue NoSuchAlertError as a superclass for
      # dialect-agnostic implementation, so NoAlertPresentError should inherit from it.
      #

      class NoSuchAlertError < WebDriverError; end
      class NoAlertPresentError < NoSuchAlertError; end # 27

      #
      # A script did not complete before its timeout expired.
      #

      class ScriptTimeOutError < WebDriverError; end # 28

      #
      # The coordinates provided to an interactions operation are invalid.
      #

      class InvalidElementCoordinatesError < WebDriverError; end # 29

      #
      # Indicates that IME support is not available. This exception is rasied for every IME-related
      # method call if IME support is not available on the machine.
      #

      class IMENotAvailableError < WebDriverError; end # 30

      #
      # Indicates that activating an IME engine has failed.
      #

      class IMEEngineActivationFailedError < WebDriverError; end # 31

      #
      # Argument was an invalid selector.
      #

      class InvalidSelectorError < WebDriverError; end # 32

      #
      # A new session could not be created.
      #

      class SessionNotCreatedError < WebDriverError; end # 33

      #
      # The target for mouse interaction is not in the browser's viewport and cannot be brought
      # into that viewport.
      #

      class MoveTargetOutOfBoundsError < WebDriverError; end # 34

      #
      # Indicates that the XPath selector is invalid
      #

      class InvalidXpathSelectorError < WebDriverError; end
      class InvalidXpathSelectorReturnTyperError < WebDriverError; end

      #
      # A command could not be completed because the element is not pointer or keyboard
      # interactable.
      #

      class ElementNotInteractableError < WebDriverError; end

      #
      # A command could not be completed because TLS certificate is expired
      # or invalid.
      #

      class InsecureCertificateError < WebDriverError; end

      #
      # The arguments passed to a command are either invalid or malformed.
      #

      class InvalidArgumentError < WebDriverError; end

      #
      # No cookie matching the given path name was found amongst the associated cookies of the
      # current browsing context's active document.
      #

      class NoSuchCookieError < WebDriverError; end

      #
      # A screen capture was made impossible.
      #

      class UnableToCaptureScreenError < WebDriverError; end

      #
      # Occurs if the given session id is not in the list of active sessions, meaning the session
      # either does not exist or that it's not active.
      #

      class InvalidSessionIdError < WebDriverError; end

      #
      # A modal dialog was open, blocking this operation.
      #

      class UnexpectedAlertOpenError < WebDriverError; end

      #
      # The requested command matched a known URL but did not match an method for that URL.
      #

      class UnknownMethodError < WebDriverError; end

      #
      # The Element Click command could not be completed because the element receiving the events
      # is obscuring the element that was requested clicked.
      #

      class ElementClickInterceptedError < WebDriverError; end

      #
      # Indicates that a command that should have executed properly cannot be supported for some
      # reason.
      #

      class UnsupportedOperationError < WebDriverError; end

      # Aliases for OSS dialect.
      ScriptTimeoutError  = Class.new(ScriptTimeOutError)
      TimeoutError        = Class.new(TimeOutError)
      NoAlertOpenError    = Class.new(NoAlertPresentError)

      # Aliases for backwards compatibility.
      ObsoleteElementError      = Class.new(StaleElementReferenceError)
      UnhandledError            = Class.new(UnknownError)
      UnexpectedJavascriptError = Class.new(JavascriptError)
      ElementNotDisplayedError  = Class.new(ElementNotVisibleError)

      #
      # @api private
      #

      ERRORS = {
        1 => IndexOutOfBoundsError,
        2 => NoCollectionError,
        3 => NoStringError,
        4 => NoStringLengthError,
        5 => NoStringWrapperError,
        6 => NoSuchDriverError,
        7 => NoSuchElementError,
        8 => NoSuchFrameError,
        9 => UnknownCommandError,
        10 => StaleElementReferenceError,
        11 => ElementNotVisibleError,
        12 => InvalidElementStateError,
        13 => UnknownError,
        14 => ExpectedError,
        15 => ElementNotSelectableError,
        16 => NoSuchDocumentError,
        17 => JavascriptError,
        18 => NoScriptResultError,
        19 => XPathLookupError,
        20 => NoSuchCollectionError,
        21 => TimeOutError,
        22 => NullPointerError,
        23 => NoSuchWindowError,
        24 => InvalidCookieDomainError,
        25 => UnableToSetCookieError,
        26 => UnhandledAlertError,
        27 => NoAlertPresentError,
        28 => ScriptTimeOutError,
        29 => InvalidElementCoordinatesError,
        30 => IMENotAvailableError,
        31 => IMEEngineActivationFailedError,
        32 => InvalidSelectorError,
        33 => SessionNotCreatedError,
        34 => MoveTargetOutOfBoundsError,
        # The following are W3C-specific errors,
        # they don't really need error codes, we just make them up!
        51 => InvalidXpathSelectorError,
        52 => InvalidXpathSelectorReturnTyperError,
        60 => ElementNotInteractableError,
        61 => InvalidArgumentError,
        62 => NoSuchCookieError,
        63 => UnableToCaptureScreenError
      }.freeze

      DEPRECATED_ERRORS = {
        IndexOutOfBoundsError: nil,
        NoCollectionError: nil,
        NoStringError: nil,
        NoStringLengthError: nil,
        NoStringWrapperError: nil,
        NoSuchDriverError: nil,
        ElementNotVisibleError: ElementNotInteractableError,
        InvalidElementStateError: ElementNotInteractableError,
        ElementNotSelectableError: ElementNotInteractableError,
        ExpectedError: nil,
        NoSuchDocumentError: nil,
        NoScriptResultError: nil,
        XPathLookupError: InvalidSelectorError,
        NoSuchCollectionError: nil,
        UnhandledAlertError: UnexpectedAlertOpenError,
        NoAlertPresentError: NoSuchAlertError,
        NoAlertOpenError: NoSuchAlertError,
        ScriptTimeOutError: ScriptTimeoutError,
        InvalidElementCoordinatesError: nil,
        IMENotAvailableError: nil,
        IMEEngineActivationFailedError: nil,
        InvalidXpathSelectorError: InvalidSelectorError,
        InvalidXpathSelectorReturnTyperError: InvalidSelectorError,
        TimeOutError: TimeoutError,
        ObsoleteElementError: StaleElementReferenceError,
        UnhandledError: UnknownError,
        UnexpectedJavascriptError: JavascriptError,
        ElementNotDisplayedError: ElementNotInteractableError
      }.freeze

      DEPRECATED_ERRORS.keys.each do |oss_error|
        remove_const oss_error
      end

      def self.const_missing(const_name)
        super unless DEPRECATED_ERRORS.key?(const_name)
        if DEPRECATED_ERRORS[const_name]
          WebDriver.logger.deprecate("Selenium::WebDriver::Error::#{const_name}",
                                     "#{DEPRECATED_ERRORS[const_name]} (ensure the driver supports W3C WebDriver specification)")
          DEPRECATED_ERRORS[const_name]
        else
          WebDriver.logger.deprecate("Selenium::WebDriver::Error::#{const_name}")
          WebDriverError
        end
      end

    end # Error
  end # WebDriver
end # Selenium
