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
    module Error
      #
      # Returns exception from its string representation.
      # @param [String, nil] error
      #

      def self.for_error(error)
        return if error.nil?

        klass_name = error.split.map(&:capitalize).join.sub(/Error$/, '')
        const_get("#{klass_name}Error", false)
      rescue NameError
        WebDriverError
      end

      SUPPORT_MSG = 'For documentation on this error, please visit:'
      ERROR_URL = 'https://www.selenium.dev/documentation/webdriver/troubleshooting/errors'

      class WebDriverError < StandardError; end

      #
      # An element could not be located on the page using the given search parameters.
      #

      class NoSuchElementError < WebDriverError
        def initialize(msg = '')
          super("#{msg}; #{SUPPORT_MSG} #{ERROR_URL}#no-such-element-exception")
        end
      end

      #
      # A command to switch to a frame could not be satisfied because the frame could not be found.
      #

      class NoSuchFrameError < WebDriverError; end

      #
      # A command could not be executed because the remote end is not aware of it.
      #

      class UnknownCommandError < WebDriverError; end

      #
      # A command failed because the referenced element is no longer attached to the DOM.
      #

      class StaleElementReferenceError < WebDriverError
        def initialize(msg = '')
          super("#{msg}; #{SUPPORT_MSG} #{ERROR_URL}#stale-element-reference-exception")
        end
      end

      #
      # A command failed because the referenced shadow root is no longer attached to the DOM.
      #

      class DetachedShadowRootError < WebDriverError; end

      #
      # The target element is in an invalid state, rendering it impossible to interact with, for
      # example if you click a disabled element.
      #

      class InvalidElementStateError < WebDriverError; end

      #
      # An unknown error occurred in the remote end while processing the command.
      #

      class UnknownError < WebDriverError; end

      #
      # An error occurred while executing JavaScript supplied by the user.
      #

      class JavascriptError < WebDriverError; end

      #
      # An operation did not complete before its timeout expired.
      #

      class TimeoutError < WebDriverError; end

      #
      # A command to switch to a window could not be satisfied because
      # the window could not be found.
      #

      class NoSuchWindowError < WebDriverError; end

      #
      # The element does not have a shadow root.
      #

      class NoSuchShadowRootError < WebDriverError; end

      #
      # An illegal attempt was made to set a cookie under a different domain than the current page.
      #

      class InvalidCookieDomainError < WebDriverError; end

      #
      # A command to set a cookie's value could not be satisfied.
      #

      class UnableToSetCookieError < WebDriverError; end

      #
      # An attempt was made to operate on a modal dialog when one was not open:
      #

      class NoSuchAlertError < WebDriverError; end

      #
      # A script did not complete before its timeout expired.
      #

      class ScriptTimeoutError < WebDriverError; end

      #
      # Argument was an invalid selector.
      #

      class InvalidSelectorError < WebDriverError
        def initialize(msg = '')
          super("#{msg}; #{SUPPORT_MSG} #{ERROR_URL}#invalid-selector-exception")
        end
      end

      #
      # A new session could not be created.
      #

      class SessionNotCreatedError < WebDriverError; end

      #
      # The target for mouse interaction is not in the browser's viewport and cannot be brought
      # into that viewport.
      #

      class MoveTargetOutOfBoundsError < WebDriverError; end

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

      #
      # Indicates that driver was not specified and could not be located.
      #

      class NoSuchDriverError < WebDriverError
        def initialize(msg = '')
          super("#{msg}; #{SUPPORT_MSG} #{ERROR_URL}/driver_location")
        end
      end
    end # Error
  end # WebDriver
end # Selenium
