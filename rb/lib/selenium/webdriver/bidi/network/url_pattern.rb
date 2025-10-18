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

require 'uri'

module Selenium
  module WebDriver
    class BiDi
      module UrlPattern
        module_function

        ALLOWED_KEYS = %i[protocol hostname port pathname search].freeze
        WEB = [{ type: 'pattern', protocol: 'https' }.freeze, { type: 'pattern', protocol: 'http' }.freeze].freeze

        def format_pattern(filters)
          patterns = Array(filters).flatten.compact
          return WEB.dup if patterns.empty?

          patterns.each_with_object([]) do |pattern, array|
            case pattern
            when String, ::URI::Generic
              array << { type: 'string', pattern: pattern.to_s }
            when Hash
              url_pattern = to_url_pattern(pattern)
              if url_pattern.key?(:protocol)
                array << url_pattern
              else
                array << url_pattern.merge(protocol: 'http')
                array << url_pattern.merge(protocol: 'https')
              end
            else
              raise TypeError, "pattern must be a String, URI or a Hash of keys: #{ALLOWED_KEYS.join(", ")}"
            end
          end

        end

        private

        def to_url_pattern(pattern)
          unknown = pattern.keys - ALLOWED_KEYS
          raise ArgumentError, "Unknown keys in pattern hash: #{unknown.inspect}" unless unknown.empty?

          pattern.slice(*ALLOWED_KEYS).merge(type: 'pattern')
        end
      end
    end # BiDi
  end # WebDriver
end # Selenium
