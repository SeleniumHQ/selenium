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
    module Support
      module Escaper
        def self.escape(str)
          if str.include?('"') && str.include?("'")
            parts = str.split('"', -1).map { |part| %("#{part}") }

            quoted = parts.join(%(, '"', ))
                          .gsub(/^"", |, ""$/, '')

            "concat(#{quoted})"
          elsif str.include?('"')
            # escape string with just a quote into being single quoted: f"oo -> 'f"oo'
            "'#{str}'"
          else
            # otherwise return the quoted string
            %("#{str}")
          end
        end
      end # Escaper
    end # Support
  end # WebDriver
end # Selenium
