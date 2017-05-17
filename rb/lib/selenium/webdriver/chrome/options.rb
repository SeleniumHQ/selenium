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
        attr_reader :args, :prefs, :options, :emulation, :extensions
        attr_accessor :binary

        #
        # Create a new Options instance
        #
        # @example User configured options
        #
        #   options = Selenium::WebDriver::Chrome::Options.new(args: ['start-maximized', 'user-data-dir=/tmp/temp_profile'])
        #   options.binary = '/path/to/binary'
        #   caps = Selenium::WebDriver::Remote::Capabilities.chrome
        #   caps[:chrome_options] = options
        #
        #   driver = Selenium::WebDriver.for :chrome, desired_capabilities: caps
        #
        # @param [Hash] opts the pre-defined options to create the Chrome::Options with
        # @option opts [Array<String>] :args List of command-line arguments to use when starting Chrome
        # @option opts [String] :binary Path to the Chrome executable to use
        # @option opts [Hash] :prefs A hash with each entry consisting of the name of the preference and its value
        # @option opts [Array<String>] :extensions A list of paths to (.crx) Chrome extensions to install on startup
        # @option opts [Hash] :options A hash for raw options
        # @option opts [Hash] :emulation A hash for raw emulation options
        # @return [Options]
        #

        def initialize(opts = {})
          @args = opts.delete(:args) || []
          @binary = opts.delete(:binary)
          @prefs = opts.delete(:prefs) || {}
          @extensions = opts.delete(:extensions) || []
          @options = opts.delete(:options) || {}
          @emulation = opts.delete(:emulation) || {}
          @encoded_extensions = []
        end

        #
        # Add an extension by local path
        #
        # @example Add local extension
        #
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
        # Add an extension by Base64-encoded string
        #
        # @example Add encoded extension
        #
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
        #
        #   options = Selenium::WebDriver::Chrome::Options.new
        #   options.add_argument('start-maximized')
        #
        # @param [String] arg The command-line argument to add
        #

        def add_argument(arg)
          @args << arg
        end

        #
        # Add a new option not yet handled by these bindings
        #
        # @example Leave Chrome open when chromedriver is killed
        #
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
        # Add a preference that is only applied to the user profile in use
        #
        # @example Set the default homepage
        #
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
        # Add an emulation option
        #
        # @example Start Chrome in mobile emulation mode for a preset device
        #
        #   options = Selenium::WebDriver::Chrome::Options.new
        #   options.add_emulation_option('mobileEmulation', {'deviceName': 'Google Nexus 6'})
        #
        # @param [String] name Name of the option
        # @param [Boolean, String, Integer, Hash] value Value of the option
        #

        def add_emulation_option(name, value)
          @emulation[name] = value
        end

        #
        # Add an emulation device name
        #
        # @example Start Chrome in mobile emulation mode by device name
        #
        #   options = Selenium::WebDriver::Chrome::Options.new
        #   options.add_emulated_device('Google Nexus 6')
        #
        # @example Start Chrome in mobile emulation mode by device metrics
        #
        #   options = Selenium::WebDriver::Chrome::Options.new
        #   options.add_emulated_device(width: 400, height: 800, pixelRatio: 1, touch: true)
        #
        # @param [String, Hash] device Name of the device or a hash containing width, height, pixelRatio, touch
        #

        def add_emulated_device(device)
          if device.is_a? Hash
            @emulation[:deviceMetrics] = device
          else
            @emulation[:deviceName] = device
          end
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
          opts[:args] = @args if @args.any?
          opts[:binary] = @binary if @binary
          opts[:extensions] = extensions if extensions.any?
          opts[:mobileEmulation] = @emulation unless @emulation.empty?
          opts[:prefs] = @prefs unless @prefs.empty?
          opts
        end
      end # Profile
    end # Chrome
  end # WebDriver
end # Selenium
