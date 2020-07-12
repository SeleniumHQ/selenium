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
                       set_window_rect timeouts unhandled_prompt_behavior strict_file_interactability].freeze

      W3C_OPTIONS.each do |key|
        define_method key do
          @options[key]
        end

        define_method "#{key}=" do |value|
          @options[key] = value
        end
      end

      attr_accessor :options

      def initialize(options: nil, **opts)
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

      def add_option(name, value)
        @options[name] = value
      end

      #
      # @api private
      #

      def as_json(*)
        options = @options.dup

        w3c_options = options.select { |key, _val| W3C_OPTIONS.include?(key) }
        options.delete_if { |key, _val| W3C_OPTIONS.include?(key) }

        self.class::CAPABILITIES.each do |capability_alias, capability_name|
          capability_value = options.delete(capability_alias)
          options[capability_name] = capability_value unless capability_value.nil?
        end
        browser_options = defined?(self.class::KEY) ? {self.class::KEY => options} : options

        process_browser_options(browser_options) if private_methods(false).include?(:process_browser_options)
        generate_as_json(w3c_options.merge(browser_options))
      end

      private

      def generate_as_json(value, camelize_keys: true)
        if value.respond_to?(:as_json)
          value.as_json
        elsif value.is_a?(Hash)
          value.each_with_object({}) do |(key, val), hash|
            hash[convert_json_key(key, camelize: camelize_keys)] = generate_as_json(val, camelize_keys: camelize_keys)
          end
        elsif value.is_a?(Array)
          value.map { |val| generate_as_json(val, camelize_keys: camelize_keys) }
        elsif value.is_a?(Symbol)
          value.to_s
        else
          value
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
    end # Options
  end # WebDriver
end # Selenium
