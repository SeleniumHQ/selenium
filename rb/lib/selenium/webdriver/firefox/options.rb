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
        KEY = 'moz:firefoxOptions'

        # see: https://firefox-source-docs.mozilla.org/testing/geckodriver/Capabilities.html
        CAPABILITIES = %i[binary args profile log prefs].freeze

        (CAPABILITIES + %i[log_level]).each do |key|
          define_method key do
            @options[key]
          end

          define_method "#{key}=" do |value|
            @options[key] = value
          end
        end

        #
        # Create a new Options instance, only for W3C-capable versions of Firefox.
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

        def initialize(options: nil, **opts)
          @options = if options
                       WebDriver.logger.deprecate(":options as keyword for initializing #{self.class}",
                                                  "values directly in #new constructor")
                       opts.merge(options)
                     else
                       opts
                     end
          process_profile(@options[:profile]) if @options.key?(:profile)
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
          @options[:args] ||= []
          @options[:args] << arg
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
          @options[name] = value
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
          @options[:prefs] ||= {}
          @options[:prefs][name] = value
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

        def profile=(profile)
          process_profile(profile)
        end

        #
        # @api private
        #

        def as_json(*)
          options = @options.dup

          opts = CAPABILITIES.each_with_object({}) do |capability_name, hash|
            capability_value = options.delete(capability_name)
            hash[capability_name] = capability_value unless capability_value.nil?
          end

          opts[:log] ||= {level: options.delete(:log_level)} if options.key?(:log_level)

          {KEY => generate_as_json(opts.merge(options))}
        end

        private

        def process_profile(profile)
          @options[:profile] = if profile.nil?
                                 nil
                               elsif profile.is_a? Profile
                                 profile
                               else
                                 Profile.from_name(profile)
                               end
        end
      end # Options
    end # Firefox
  end # WebDriver
end # Selenium
