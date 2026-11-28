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

require 'selenium/webdriver/bidi/protocol'

module Selenium
  module WebDriver
    module Remote
      # Classic commands sent over BiDi, for a session whose socket reaches a browser.
      # The includer supplies #connection.
      # @api private
      module BiDiCommands
        READINESS_STATE = {
          'none' => :none,
          'eager' => :interactive,
          'normal' => :complete
        }.freeze

        # Read on first use unless the bridge assigned it when the session started.
        def current_window
          @current_window ||= window_handle
        end

        def install_web_extension(path)
          result = bidi_web_extension.install(extension_data: web_extension_data(path))
          WebExtension.new(result.extension)
        end

        def uninstall_web_extension(id)
          bidi_web_extension.uninstall(extension: id)
          nil
        end

        def get(url)
          bidi_browsing_context.navigate(context: current_window, url: url, wait: readiness_state)
          nil
        rescue Error::InterruptedByAlertError
          nil
        rescue Error::NoSuchFrameError => e
          raise Error::NoSuchWindowError, e.message
        end

        def go_back
          bidi_browsing_context.traverse_history(context: current_window, delta: -1)
          nil
        rescue Error::InterruptedByAlertError
          nil
        rescue Error::NoSuchFrameError => e
          raise Error::NoSuchWindowError, e.message
        end

        def go_forward
          bidi_browsing_context.traverse_history(context: current_window, delta: 1)
          nil
        rescue Error::InterruptedByAlertError
          nil
        rescue Error::NoSuchFrameError => e
          raise Error::NoSuchWindowError, e.message
        end

        def refresh
          bidi_browsing_context.reload(context: current_window, wait: readiness_state)
          nil
        rescue Error::InterruptedByAlertError
          nil
        rescue Error::NoSuchFrameError => e
          raise Error::NoSuchWindowError, e.message
        end

        def switch_to_window(name)
          super.tap { @current_window = name }
        end

        private

        # A directory only resolves on the machine running the browser, so upload it to the remote
        # end and reference the returned path; archives and base64 bytes travel inline.
        def web_extension_data(path)
          return bidi_web_extension.extension_base64_encoded(value: encode_extension(path)) unless File.directory?(path)

          path = upload(path) if respond_to?(:upload)
          bidi_web_extension.extension_path(path: path)
        end

        def readiness_state
          READINESS_STATE.fetch(capabilities[:page_load_strategy] || 'normal')
        end
      end # BiDiCommands
    end # Remote
  end # WebDriver
end # Selenium
