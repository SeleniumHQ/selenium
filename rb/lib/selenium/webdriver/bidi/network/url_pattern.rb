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

        def format_pattern(url_patterns, pattern_type)
          case pattern_type
          when :string
            to_url_string_pattern(url_patterns)
          when :url
            to_url_pattern(url_patterns)
          else
            raise ArgumentError, "Unknown pattern type: #{pattern_type}"
          end
        end

        def to_url_pattern(*url_patterns)
          url_patterns.flatten.map do |url_pattern|
            uri = URI.parse(url_pattern)

            {
              type: 'pattern',
              protocol: uri.scheme || '',
              hostname: uri.host || '',
              port: uri.port.to_s,
              pathname: uri.path || '',
              search: uri.query || ''
            }
          end
        end

        def to_url_string_pattern(*url_patterns)
          url_patterns.flatten.map do |url_pattern|
            {
              type: 'string',
              pattern: url_pattern
            }
          end
        end
      end
    end # BiDi
  end # WebDriver
end # Selenium
