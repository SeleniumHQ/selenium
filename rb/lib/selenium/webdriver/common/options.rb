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
        private

        def generate_as_json(value)
          if value.respond_to?(:as_json)
            value.as_json
          elsif value.is_a?(Hash)
            value.each_with_object({}) { |(key, val), hash| hash[convert_json_key(key)] = generate_as_json(val) }
          elsif value.is_a?(Array)
            value.map(&method(:generate_as_json))
          elsif value.is_a?(Symbol)
            value.to_s
          else
            value
          end
        end

        def convert_json_key(key)
          key = camel_case(key) if key.is_a?(Symbol)
          return key if key.is_a?(String)

          raise TypeError, "expected String or Symbol, got #{key.inspect}:#{key.class}"
        end

        def camel_case(str)
          str.to_s.gsub(/_([a-z])/) { Regexp.last_match(1).upcase }
        end
      end # Options
    end # Common
  end # WebDriver
end # Selenium
