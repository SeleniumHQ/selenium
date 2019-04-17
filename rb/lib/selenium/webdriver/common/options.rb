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
    module Common
      class Options

        attr_accessor :custom

        VALID_W3C = %i[browser_name browser_version platform_name accept_insecure_certs page_load_strategy proxy
                       set_window_rect timeouts unhandled_prompt_behavior strict_file_interactability].freeze

        #
        # Create a new Options instance with w3c compatible values.
        #

        def initialize(**opts)
          VALID_W3C.each do |capability|
            next unless opts.key?(capability)

            instance_variable_set("@#{capability}", opts.delete(capability))
            self.class.__send__(:attr_accessor, capability)
          end

          validate_proxy if @proxy

          # This will accept any additional params and all keys will need to include a colon to be w3c compatible
          @custom = opts
          @custom.keys.each do |key|
            next if key.to_s.include?(':')

            WebDriver.logger.deprecate "Using #{key} directly in Options",
                                       "The appropriate third party settings it applies to"
          end
        end

        def to_json(*)
          JSON.generate as_json
        end

        def ==(other)
          return false unless other.is_a? self.class

          as_json == other.as_json
        end

        def as_json(*)
          VALID_W3C.each_with_object({}) { |key, hash|
            value = instance_variable_get("@#{key}")
            next if value.nil?

            hash[convert_json_key(key)] = parse_json(value)
          }.merge(parse_json @custom)
        end

        protected

        def parse_json(value)
          if value.respond_to?(:as_json)
            value.as_json
          elsif value.is_a?(Hash)
            value.each_with_object({}) { |(key, val), hash| hash[convert_json_key(key)] = parse_json(val) }
          elsif value.is_a?(Array)
            value.map(&method(:parse_json))
          elsif value.is_a?(Symbol)
            value.to_s
          else
            value
          end
        end

        def convert_json_key(key)
          key = camel_case(key.to_s) if key.is_a?(Symbol)
          return key if key.is_a?(String)

          raise TypeError, "expected String or Symbol, got #{key.inspect}:#{key.class}"
        end

        private

        def validate_proxy
          return if @proxy.is_a? Proxy

          raise TypeError, "expected Hash or Proxy, got #{proxy.inspect}:#{proxy.class}" unless @proxy.respond_to?(:to_h)

          @proxy = Proxy.new(@proxy)
        end

        def camel_case(str)
          str.gsub(/_([a-z])/) { Regexp.last_match(1).upcase }
        end
      end # Options
    end # Common
  end # WebDriver
end # Selenium
