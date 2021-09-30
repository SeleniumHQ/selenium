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
    class Options
      W3C_OPTIONS = %i[browser_name browser_version platform_name accept_insecure_certs page_load_strategy proxy
                       set_window_rect timeouts unhandled_prompt_behavior strict_file_interactability
                       web_socket_url].freeze

      class << self
        attr_reader :driver_path

        def chrome(**opts)
          Chrome::Options.new(**opts)
        end

        def firefox(**opts)
          Firefox::Options.new(**opts)
        end

        def ie(**opts)
          IE::Options.new(**opts)
        end
        alias_method :internet_explorer, :ie

        def edge(**opts)
          Edge::Options.new(**opts)
        end
        alias_method :microsoftedge, :edge

        def safari(**opts)
          Safari::Options.new(**opts)
        end

        def set_capabilities
          (W3C_OPTIONS + self::CAPABILITIES.keys).each do |key|
            next if method_defined? key

            define_method key do
              @options[key]
            end

            define_method "#{key}=" do |value|
              @options[key] = value
            end
          end
        end
      end

      attr_accessor :options

      def initialize(options: nil, **opts)
        self.class.set_capabilities

        @options = if options
                     WebDriver.logger.deprecate(":options as keyword for initializing #{self.class}",
                                                "custom values directly in #new constructor",
                                                id: :options_options)
                     opts.merge(options)
                   else
                     opts
                   end
        @options[:browser_name] = self.class::BROWSER
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

      def add_option(name, value = nil)
        @options[name.keys.first] = name.values.first if value.nil? && name.is_a?(Hash)
        @options[name] = value
      end

      def ==(other)
        return false unless other.is_a? self.class

        as_json == other.as_json
      end

      alias_method :eql?, :==

      #
      # @api private
      #

      def as_json(*)
        options = @options.dup

        w3c_options = process_w3c_options(options)

        self.class::CAPABILITIES.each do |capability_alias, capability_name|
          capability_value = options.delete(capability_alias)
          options[capability_name] = capability_value if !capability_value.nil? && !options.key?(capability_name)
        end
        browser_options = defined?(self.class::KEY) ? {self.class::KEY => options} : options

        process_browser_options(browser_options)
        generate_as_json(w3c_options.merge(browser_options))
      end

      private

      def w3c?(key)
        W3C_OPTIONS.include?(key) || key.to_s.include?(':')
      end

      def process_w3c_options(options)
        w3c_options = options.select { |key, _val| w3c?(key) }
        w3c_options[:unhandled_prompt_behavior] &&= w3c_options[:unhandled_prompt_behavior]&.to_s&.tr('_', ' ')
        options.delete_if { |key, _val| w3c?(key) }
        w3c_options
      end

      def process_browser_options(_browser_options)
        nil
      end

      def camelize?(_key)
        true
      end

      def generate_as_json(value, camelize_keys: true)
        if value.is_a?(Hash)
          process_json_hash(value, camelize_keys)
        elsif value.respond_to?(:as_json)
          value.as_json
        elsif value.is_a?(Array)
          value.map { |val| generate_as_json(val, camelize_keys: camelize_keys) }
        elsif value.is_a?(Symbol)
          value.to_s
        else
          value
        end
      end

      def process_json_hash(value, camelize_keys)
        value.each_with_object({}) do |(key, val), hash|
          next if val.respond_to?(:empty?) && val.empty?

          camelize = camelize_keys ? camelize?(key) : false
          key = convert_json_key(key, camelize: camelize)
          hash[key] = generate_as_json(val, camelize_keys: camelize)
        end
      end

      def convert_json_key(key, camelize: true)
        key = key.to_s if key.is_a?(Symbol)
        key = camel_case(key) if camelize
        return key if key.is_a?(String)

        raise TypeError, "expected String or Symbol, got #{key.inspect}:#{key.class}"
      end

      def camel_case(str)
        str.gsub(/_([a-z])/) { Regexp.last_match(1).upcase }
      end
    end

    # Options
  end # WebDriver
end # Selenium
