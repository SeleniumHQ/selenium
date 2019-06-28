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
    module EdgeHtml
      class Options < WebDriver::Options
        # see https://docs.microsoft.com/en-us/microsoft-edge/webdriver#capabilities
        CAPABILITIES = {in_private: 'ms:inPrivate',
                        extension_paths: 'ms:extensionPaths',
                        start_page: 'ms:startPage'}.freeze

        CAPABILITIES.each_key do |key|
          define_method key do
            @options[key]
          end

          define_method "#{key}=" do |value|
            @options[key] = value
          end
        end

        #
        # Create a new Options instance for Edge.
        #
        # @example
        #   options = Selenium::WebDriver::Edge::Options.new(in_private: true)
        #   driver = Selenium::WebDriver.for :edge, options: options
        #
        # @param [Hash] opts the pre-defined options to create the Edge::Options with
        # @option opts [Boolean] :in_private Start in private mode. Default is false
        # @option opts [Array<String>] :extension_paths A list of full paths to extensions to install on startup
        # @option opts [String] :start_page Default page to start with
        #
        # @see https://docs.microsoft.com/en-us/microsoft-edge/webdriver
        #

        def initialize(**opts)
          super
          @options[:extensions]&.each(&method(:validate_extension))
        end

        #
        # Add an extension by local path.
        #
        # @example
        #   options = Selenium::WebDriver::Edge::Options.new
        #   options.add_extension_path('C:\path\to\extension')
        #
        # @param [String] path The local path to the extension folder
        #

        def add_extension_path(path)
          validate_extension(path)
          @options[:extension_paths] ||= []
          @options[:extension_paths] << path
        end

        #
        # @api private
        #

        def as_json(*)
          generate_as_json(super)
        end

        private

        def validate_extension(path)
          raise Error::WebDriverError, "could not find extension at #{path.inspect}" unless File.directory?(path)
        end
      end # Options
    end # Edge
  end # WebDriver
end # Selenium
