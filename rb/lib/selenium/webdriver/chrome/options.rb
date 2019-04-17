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
      class Options < WebDriver::Common::Options
        attr_reader :extensions
        attr_accessor :args, :binary, :local_state, :prefs, :detach, :debugger_address, :exclude_switches,
                      :minidump_path, :emulation, :perf_logging_prefs, :window_types, :options, :encoded_extensions

        KEY = 'goog:chromeOptions'

        #
        # Create a new Options instance.
        #
        # see: http://chromedriver.chromium.org/capabilities
        #
        # @example
        #   options = Selenium::WebDriver::Chrome::Options.new(args: ['start-maximized', 'user-data-dir=/tmp/temp_profile'])
        #   driver = Selenium::WebDriver.for(:chrome, options: options)
        #
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

        def initialize(**opts)
          opts[:browser_name] = 'chrome'

          @args = Set[*opts.delete(:args)]
          @binary = opts.delete(:binary) || Chrome.path
          @prefs = opts.delete(:prefs) || {}

          @encoded_extensions = Array(opts.delete(:encoded_extensions))
          @extensions = Array(opts.delete(:extensions))
          @extensions.each(&method(:validate_extension))

          @options = opts.delete(:options) || {}

          emulation = opts.delete(:emulation)
          @emulation = {}
          validate_emulation(emulation) if emulation

          @local_state = opts.delete(:local_state) || {}
          @detach = opts.delete(:detach)
          @debugger_address = opts.delete(:debugger_address)
          @exclude_switches = Array(opts.delete(:exclude_switches))
          @minidump_path = opts.delete(:minidump_path)
          @perf_logging_prefs = opts.delete(:perf_logging_prefs) || {}
          @window_types = Array(opts.delete(:window_types))

          super(opts)
        end

        #
        # Add an extension by local path or Base64-encoded string.
        #
        # @example
        #   options = Selenium::WebDriver::Chrome::Options.new
        #   options.add_extension('/path/to/extension.crx')
        #   options.add_extension(encoded_string)
        #
        # @param [String] extension The local path to the .crx file or Base64-encoded string of the .crx file
        #

        def add_extension(extension)
          @extensions << extension
          validate_extension(extension)
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
          WebDriver.logger.deprecate 'Options#add_encoded_extension',
                                     'Options.encoded_extensions << <encoded_extension>'
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
          WebDriver.logger.deprecate 'Options#add_argument',
                                     "Options.args << #{arg}"
          @args << arg
        end

        #
        # Add a new option not yet handled by bindings.
        #
        # @example Leave Chrome open when chromedriver is killed
        #   options = Selenium::WebDriver::Chrome::Options.new
        #   options.add_option(:detach, true)
        #
        # @param [String, Symbol] name Name of the option
        # @param [Boolean, String, Integer] value Value of the option
        #

        def add_option(name, value)
          WebDriver.logger.deprecate 'Options#add_option',
                                     "Options.options[#{name}] = #{value}"
          @options[name] = value
        end

        #
        # Add a preference that is only applied to the user profile in use.
        #
        # @example Set the default homepage
        #   options = Selenium::WebDriver::Chrome::Options.new
        #   options.add_preference('homepage', 'http://www.seleniumhq.com/')
        #
        # @param [String] name Name of the preference
        # @param [Boolean, String, Integer] value Value of the preference
        #

        def add_preference(name, value)
          WebDriver.logger.deprecate 'Options#add_preference',
                                     "Options.prefs[#{name}] = #{value}"

          @prefs[name] = value
        end

        #
        # Run Chrome in headless mode.
        #
        # @example Enable headless mode
        #   options = Selenium::WebDriver::Chrome::Options.new
        #   options.headless!
        #

        def headless!
          @args << '--headless'
        end

        #
        # Add an emulation device name
        #
        # @example Start Chrome in mobile emulation mode by device name
        #   options = Selenium::WebDriver::Chrome::Options.new
        #   options.add_emulation(device_name: 'iPhone 6')
        #
        # @example Start Chrome in mobile emulation mode by device metrics
        #   options = Selenium::WebDriver::Chrome::Options.new
        #   options.add_emulation(device_metrics: {width: 400, height: 800, pixelRatio: 1, touch: true})
        #
        # @param [String] device_name Name of the device or a hash containing width, height, pixelRatio, touch
        # @param [Hash] device_metrics Hash containing width, height, pixelRatio, touch
        # @param [String] user_agent Full user agent
        #

        def add_emulation(**opt)
          validate_emulation(opt)
        end

        #
        # @api private
        #

        def as_json(*)
          opts = @options

          opts['binary'] = @binary if @binary
          opts['args'] = @args.to_a if @args.any?
          opts['extensions'] = @encoded_extensions if @encoded_extensions.any?
          opts['mobileEmulation'] = @emulation if @emulation.any?
          opts['prefs'] = @prefs if @prefs.any?
          opts['localState'] = @local_state if @local_state.any?
          opts['detach'] = @detach unless @detach.nil?
          opts['debuggerAddress'] = @debugger_address if @debugger_address
          opts['excludeSwitches'] = @exclude_switches if @exclude_switches.any?
          opts['minidumpPath'] = @minidump_path if @minidump_path
          opts['perfLoggingPrefs'] = @perf_logging_prefs if @perf_logging_prefs.any?
          opts['windowTypes'] = @window_types if @window_types.any?

          super.merge(KEY => opts)
        end

        private

        def validate_emulation(device_name: nil, device_metrics: nil, user_agent: nil)
          @emulation['deviceName'] = device_name if device_name
          @emulation['deviceMetrics'] = device_metrics if device_metrics
          @emulation['userAgent'] = user_agent if user_agent
        end

        def validate_extension(path)
          raise Error::WebDriverError, "could not find extension at #{path.inspect}" unless File.file?(path)
          raise Error::WebDriverError, "file was not an extension #{path.inspect}" unless File.extname(path) == '.crx'

          @encoded_extensions << encode_file(path)
        end

        def encode_file(path)
          File.open(path, 'rb') { |crx_file| Base64.strict_encode64 crx_file.read }
        end
      end # Options
    end # Chrome
  end # WebDriver
end # Selenium
