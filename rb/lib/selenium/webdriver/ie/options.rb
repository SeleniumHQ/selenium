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
    module IE
      class Options < WebDriver::Options
        KEY = 'se:ieOptions'
        SCROLL_TOP = 0
        SCROLL_BOTTOM = 1
        CAPABILITIES = {
          browser_attach_timeout: 'browserAttachTimeout',
          element_scroll_behavior: 'elementScrollBehavior',
          full_page_screenshot: 'ie.enableFullPageScreenshot',
          ensure_clean_session: 'ie.ensureCleanSession',
          file_upload_dialog_timeout: 'ie.fileUploadDialogTimeout',
          force_create_process_api: 'ie.forceCreateProcessApi',
          force_shell_windows_api: 'ie.forceShellWindowsApi',
          ignore_protected_mode_settings: 'ignoreProtectedModeSettings',
          ignore_zoom_level: 'ignoreZoomSetting',
          initial_browser_url: 'initialBrowserUrl',
          native_events: 'nativeEvents',
          persistent_hover: 'enablePersistentHover',
          require_window_focus: 'requireWindowFocus',
          use_per_process_proxy: 'ie.usePerProcessProxy',
          use_legacy_file_upload_dialog_handling: 'ie.useLegacyFileUploadDialogHandling',
          attach_to_edge_chrome: 'ie.edgechromium',
          edge_executable_path: 'ie.edgepath',
          ignore_process_match: 'ie.ignoreprocessmatch'
        }.freeze
        BROWSER = 'internet explorer'

        attr_reader :args

        #
        # Create a new Options instance
        #
        # @example
        #   options = Selenium::WebDriver::IE::Options.new(args: ['--host=127.0.0.1'])
        #   driver = Selenium::WebDriver.for(:ie, capabilities: options)
        #
        # @example
        #   options = Selenium::WebDriver::IE::Options.new
        #   options.element_scroll_behavior = Selenium::WebDriver::IE::Options::SCROLL_BOTTOM
        #   driver = Selenium::WebDriver.for(:ie, capabilities: options)
        #
        # @param [Hash] opts the pre-defined options
        # @option opts [Array<String>] args
        # @option opts [Integer] browser_attach_timeout
        # @option opts [Integer] element_scroll_behavior Either SCROLL_TOP or SCROLL_BOTTOM
        # @option opts [Boolean] full_page_screenshot
        # @option opts [Boolean] ensure_clean_session
        # @option opts [Integer] file_upload_dialog_timeout
        # @option opts [Boolean] force_create_process_api
        # @option opts [Boolean] force_shell_windows_api
        # @option opts [Boolean] ignore_protected_mode_settings
        # @option opts [Boolean] ignore_zoom_level
        # @option opts [String] initial_browser_url
        # @option opts [Boolean] native_events
        # @option opts [Boolean] persistent_hover
        # @option opts [Boolean] require_window_focus
        # @option opts [Boolean] use_per_process_proxy
        # @option opts [Boolean] validate_cookie_document_type
        #

        def initialize(**opts)
          @args = (opts.delete(:args) || []).to_set
          super(**opts)

          @options[:native_events] = true if @options[:native_events].nil?
        end

        #
        # Add a command-line argument to use when starting Internet Explorer.
        #
        # @param [String] arg The command-line argument to add
        #

        def add_argument(arg)
          @args << arg
        end

        private

        def process_browser_options(browser_options)
          options = browser_options[KEY]
          options['ie.browserCommandLineSwitches'] = @args.to_a.join(' ') if @args.any?
        end
      end # Options
    end # IE
  end # WebDriver
end # Selenium
