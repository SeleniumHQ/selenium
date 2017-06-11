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
    module Chrome
      class Options
        attr_reader :args, :prefs, :options, :emulation, :extensions, :encoded_extensions
        attr_accessor :binary

        #
        # Create a new Options instance.
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
        #

        def initialize(**opts)
          @args = opts.delete(:args) || []
          @binary = opts.delete(:binary) || Chrome.path
          @prefs = opts.delete(:prefs) || {}
          @extensions = opts.delete(:extensions) || []
          @options = opts.delete(:options) || {}
          @emulation = opts.delete(:emulation) || {}
          @encoded_extensions = []
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
          raise Error::WebDriverError, "could not find extension at #{path.inspect}" unless File.file?(path)
          raise Error::WebDriverError, "file was not an extension #{path.inspect}" unless File.extname(path) == '.crx'
          @extensions << path
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
        # Add a command-line argument to use when starting Chrome
        #
        # @example Start Chrome maximized
        #   options = Selenium::WebDriver::Chrome::Options.new
        #   options.add_argument('start-maximized')
        #
        # @param [String] arg The command-line argument to add
        #

        def add_argument(arg)
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
          @options[name] = value
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
          prefs[name] = value
        end

        #
        # Add an emulation device name
        #
        # @example Start Chrome in mobile emulation mode by device name
        #   options = Selenium::WebDriver::Chrome::Options.new
        #   options.add_emulated_device(device_name: 'iPhone 6')
        #
        # @example Start Chrome in mobile emulation mode by device metrics
        #   options = Selenium::WebDriver::Chrome::Options.new
        #   options.add_emulated_device(device_metrics: {width: 400, height: 800, pixelRatio: 1, touch: true})
        #
        # @param [String] device_name Name of the device or a hash containing width, height, pixelRatio, touch
        # @param [Hash] device_metrics Hash containing width, height, pixelRatio, touch
        # @param [String] user_agent Full user agent
        #

        def add_emulation(device_name: nil, device_metrics: nil, user_agent: nil)
          @emulation[:deviceName] = device_name if device_name
          @emulation[:deviceMetrics] = device_metrics if device_metrics
          @emulation[:userAgent] = user_agent if user_agent
        end

        #
        # @api private
        #

        def as_json(*)
          extensions = @extensions.map do |crx_path|
            File.open(crx_path, 'rb') { |crx_file| Base64.strict_encode64 crx_file.read }
          end
          extensions.concat(@encoded_extensions)

          opts = @options
          opts[:binary] = @binary if @binary
          opts[:args] = @args if @args.any?
          opts[:extensions] = extensions if extensions.any?
          opts[:mobileEmulation] = @emulation unless @emulation.empty?
          opts[:prefs] = @prefs unless @prefs.empty?
          opts
        end
      end # Profile
    end # Chrome
  end # WebDriver
end # Selenium
