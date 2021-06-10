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
    module Chrome
      class Options < WebDriver::Options
        attr_accessor :profile, :logging_prefs

        KEY = 'goog:chromeOptions'
        BROWSER = 'chrome'

        # see: http://chromedriver.chromium.org/capabilities
        CAPABILITIES = {args: 'args',
                        binary: 'binary',
                        local_state: 'localState',
                        prefs: 'prefs',
                        detach: 'detach',
                        debugger_address: 'debuggerAddress',
                        exclude_switches: 'excludeSwitches',
                        minidump_path: 'minidumpPath',
                        emulation: 'mobileEmulation',
                        perf_logging_prefs: 'perfLoggingPrefs',
                        window_types: 'windowTypes'}.freeze

        # NOTE: special handling of 'extensions' to validate when set instead of when used
        attr_reader :extensions

        # Create a new Options instance.
        #
        # @example
        #   options = Selenium::WebDriver::Chrome::Options.new(args: ['start-maximized', 'user-data-dir=/tmp/temp_profile'])
        #   driver = Selenium::WebDriver.for(:chrome, options: options)
        #
        # @param [Profile] :profile An instance of a Chrome::Profile Class
        # @param [Array] :encoded_extensions List of extensions that do not need to be Base64 encoded
        # @param [Hash] opts the pre-defined options to create the Chrome::Options with
        # @option opts [Array<String>] :args List of command-line arguments to use when starting Chrome
        # @option opts [String] :binary Path to the Chrome executable to use
        # @option opts [Hash] :prefs A hash with each entry consisting of the name of the preference and its value
        # @option opts [Array<String>] :extensions A list of paths to (.crx) Chrome extensions to install on startup
        # @option opts [Hash] :options A hash for raw options
        # @option opts [Hash] :emulation A hash for raw emulation options
        # @option opts [Hash] :local_state A hash for the Local State file in the user data folder
        # @option opts [Boolean] :detach whether browser is closed when the driver is sent the quit command
        # @option opts [String] :debugger_address address of a Chrome debugger server to connect to
        # @option opts [Array<String>] :exclude_switches command line switches to exclude
        # @option opts [String] :minidump_path Directory to store Chrome minidumps (linux only)
        # @option opts [Hash] :perf_logging_prefs A hash for performance logging preferences
        # @option opts [Array<String>] :window_types A list of window types to appear in the list of window handles
        #

        def initialize(profile: nil, **opts)
          super(**opts)

          @profile = profile

          @options = {args: [],
                      prefs: {},
                      emulation: {},
                      extensions: [],
                      local_state: {},
                      exclude_switches: [],
                      perf_logging_prefs: {},
                      window_types: []}.merge(@options)

          @logging_prefs = options.delete(:logging_prefs) || {}
          @encoded_extensions = @options.delete(:encoded_extensions) || []
          @extensions = []
          (@options.delete(:extensions)).each(&method(:validate_extension))
        end

        #
        # Add an extension by local path.
        #
        # @example
        #   options = Selenium::WebDriver::Chrome::Options.new
        #   options.add_extension('/path/to/extension.crx')
        #
        # @param [String] path The local path to the .crx file
        #

        def add_extension(path)
          validate_extension(path)
        end

        #
        # Add an extension by local path.
        #
        # @example
        #   extensions = ['/path/to/extension.crx', '/path/to/other.crx']
        #   options = Selenium::WebDriver::Chrome::Options.new
        #   options.extensions = extensions
        #
        # @param [Array<String>] :extensions A list of paths to (.crx) Chrome extensions to install on startup
        #

        def extensions=(extensions)
          extensions.each(&method(:validate_extension))
        end

        #
        # Add an extension by Base64-encoded string.
        #
        # @example
        #   options = Selenium::WebDriver::Chrome::Options.new
        #   options.add_encoded_extension(encoded_string)
        #
        # @param [String] encoded The Base64-encoded string of the .crx file
        #

        def add_encoded_extension(encoded)
          @encoded_extensions << encoded
        end

        #
        # Add a command-line argument to use when starting Chrome.
        #
        # @example Start Chrome maximized
        #   options = Selenium::WebDriver::Chrome::Options.new
        #   options.add_argument('start-maximized')
        #
        # @param [String] arg The command-line argument to add
        #

        def add_argument(arg)
          @options[:args] << arg
        end

        #
        # Add a preference that is only applied to the user profile in use.
        #
        # @example Set the default homepage
        #   options = Selenium::WebDriver::Chrome::Options.new
        #   options.add_preference('homepage', 'http://www.seleniumhq.com/')
        #
        # @param [String] name Key of the preference
        # @param [Boolean, String, Integer] value Value of the preference
        #

        def add_preference(name, value)
          @options[:prefs][name] = value
        end

        #
        # Run Chrome in headless mode.
        #
        # @example Enable headless mode
        #   options = Selenium::WebDriver::Chrome::Options.new
        #   options.headless!
        #

        def headless!
          add_argument '--headless'
        end

        #
        # Add emulation device information
        #
        # see: http://chromedriver.chromium.org/mobile-emulation
        #
        # @example Start Chrome in mobile emulation mode by device name
        #   options = Selenium::WebDriver::Chrome::Options.new
        #   options.add_emulation(device_name: 'iPhone 6')
        #
        # @example Start Chrome in mobile emulation mode by device metrics
        #   options = Selenium::WebDriver::Chrome::Options.new
        #   options.add_emulation(device_metrics: {width: 400, height: 800, pixelRatio: 1, touch: true})
        #
        # @param [Hash] opts the pre-defined options for adding mobile emulation values
        # @option opts [String] :device_name A valid device name from the Chrome DevTools Emulation panel
        # @option opts [Hash] :device_metrics Hash containing width, height, pixelRatio, touch
        # @option opts [String] :user_agent Full user agent
        #

        def add_emulation(**opts)
          @options[:emulation] = opts
        end

        private

        def enable_logging(browser_options)
          browser_options['goog:loggingPrefs'] = @logging_prefs
        end

        def process_browser_options(browser_options)
          enable_logging(browser_options) unless @logging_prefs.empty?

          options = browser_options[self.class::KEY]
          options['binary'] ||= binary_path if binary_path
          if @profile
            options['args'] ||= []
            options['args'] << "--user-data-dir=#{@profile.directory}"
          end

          return if (@encoded_extensions + @extensions).empty?

          options['extensions'] = @encoded_extensions + @extensions.map(&method(:encode_extension))
        end

        def binary_path
          Chrome.path
        end

        def encode_extension(path)
          File.open(path, 'rb') { |crx_file| Base64.strict_encode64 crx_file.read }
        end

        def validate_extension(path)
          raise Error::WebDriverError, "could not find extension at #{path.inspect}" unless File.file?(path)
          raise Error::WebDriverError, "file was not an extension #{path.inspect}" unless File.extname(path) == '.crx'

          @extensions << path
        end

        def camelize?(key)
          !%w[localState prefs].include?(key)
        end
      end # Options
    end # Chrome
  end # WebDriver
end # Selenium
