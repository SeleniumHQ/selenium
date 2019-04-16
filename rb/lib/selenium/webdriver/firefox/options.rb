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
    module Firefox
      class Options < WebDriver::Common::Options
        attr_reader :profile
        attr_accessor :binary, :log_level, :args, :prefs, :options

        KEY = 'moz:firefoxOptions'

        #
        # Create a new Options instance, only for W3C-capable versions of Firefox.
        #
        # see: https://firefox-source-docs.mozilla.org/testing/geckodriver/Capabilities.html
        #
        # @example
        #   options = Selenium::WebDriver::Firefox::Options.new(args: ['--host=127.0.0.1'])
        #   driver = Selenium::WebDriver.for :firefox, options: options
        #
        # @param [Hash] opts the pre-defined options to create the Firefox::Options with
        # @option opts [String] :binary Path to the Firefox executable to use
        # @option opts [Array<String>] :args List of command-line arguments to use when starting geckodriver
        # @option opts [Profile, String] :profile Encoded profile string or Profile instance
        # @option opts [String, Symbol] :log_level Log level for geckodriver
        # @option opts [Hash] :prefs A hash with each entry consisting of the key of the preference and its value
        # @option opts [Hash] :options A hash for raw options
        #

        def initialize(**opts)
          opts.delete(:browser_name)
          opts[:browser_name] = 'firefox'

          @args = Set.new(opts.delete(:args) || [])
          @binary = opts.delete(:binary)
          validate_profile opts.delete(:profile)
          @log_level = opts.delete(:log_level)
          @prefs = opts.delete(:prefs) || {}
          @options = opts.delete(:options) || {}

          super(opts)
        end

        #
        # Add a command-line argument to use when starting Firefox.
        #
        # @example Start geckodriver on a specific host
        #   options = Selenium::WebDriver::Firefox::Options.new
        #   options.add_argument('--host=127.0.0.1')
        #
        # @param [String] arg The command-line argument to add
        #

        def add_argument(arg)
          WebDriver.logger.deprecate 'Options#add_argument',
                                     'Options.args << <value>'
          @args << arg
        end

        #
        # Add a new option not yet handled by these bindings.
        #
        # @example
        #   options = Selenium::WebDriver::Firefox::Options.new
        #   options.add_option(:foo, 'bar')
        #
        # @param [String, Symbol] name Name of the option
        # @param [Boolean, String, Integer] value Value of the option
        #

        def add_option(name, value)
          WebDriver.logger.deprecate 'Options#add_option',
                                     'Options#options.merge(<key>: <value>)'
          @options.merge!(name => value)
        end

        #
        # Add a preference that is only applied to the user profile in use.
        #
        # @example Set the default homepage
        #   options = Selenium::WebDriver::Firefox::Options.new
        #   options.add_preference('browser.startup.homepage', 'http://www.seleniumhq.com/')
        #
        # @param [String] name Key of the preference
        # @param [Boolean, String, Integer] value Value of the preference
        #

        def add_preference(name, value)
          WebDriver.logger.deprecate 'Options#add_preference',
                                     'Options.prefs[<key>] = value'

          @prefs[name] = value
        end

        #
        # Run Firefox in headless mode.
        #
        # @example Enable headless mode
        #   options = Selenium::WebDriver::Firefox::Options.new
        #   options.headless!
        #

        def headless!
          add_argument '-headless'
        end

        #
        # Sets Firefox profile.
        #
        # @example Set the custom profile
        #   profile = Selenium::WebDriver::Firefox::Profile.new
        #   options = Selenium::WebDriver::Firefox::Options.new
        #   options.profile = profile
        #
        # @example Use existing profile
        #   options = Selenium::WebDriver::Firefox::Options.new
        #   options.profile = 'myprofile'
        #
        # @param [Profile, String] profile Profile to be used
        #
        #
        # TODO: Support passing in an existing directory per Mozilla documentation
        #

        def profile=(profile)
          validate_profile(profile)
        end

        #
        # @api private
        #

        def as_json(*)
          opts = @options

          opts['profile'] = @profile if @profile
          opts['args'] = @args.to_a if @args.any?
          opts['binary'] = @binary if @binary
          opts['prefs'] = @prefs unless @prefs.empty?
          opts['log'] = {level: @log_level} if @log_level

          super.merge(KEY => opts)
        end

        private

        def validate_profile(profile)
          @profile = if profile.nil?
                       nil
                     elsif profile.is_a? Profile
                       profile.encoded
                     else
                       Profile.from_name(profile).encoded
                     end
        end
      end # Options
    end # Firefox
  end # WebDriver
end # Selenium
