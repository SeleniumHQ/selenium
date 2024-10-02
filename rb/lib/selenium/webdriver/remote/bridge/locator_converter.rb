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
    module Remote
      class Bridge
        class LocatorConverter
          ESCAPE_CSS_REGEXP = /(['"\\#.:;,!?+<>=~*^$|%&@`{}\-\[\]()])/
          UNICODE_CODE_POINT = 30

          #
          # Converts a locator to a specification compatible one.
          # @param [String, Symbol] how
          # @param [String] what
          #

          def convert(how, what)
            how = SearchContext.finders[how.to_sym] || how

            case how
            when 'class name'
              how = 'css selector'
              what = ".#{escape_css(what.to_s)}"
            when 'id'
              how = 'css selector'
              what = "##{escape_css(what.to_s)}"
            when 'name'
              how = 'css selector'
              what = "*[name='#{escape_css(what.to_s)}']"
            end

            if what.is_a?(Hash)
              what = what.each_with_object({}) do |(h, w), hash|
                h, w = convert(h.to_s, w)
                hash[h] = w
              end
            end

            [how, what]
          end

          private

          #
          # Escapes invalid characters in CSS selector.
          # @see https://mathiasbynens.be/notes/css-escapes
          #

          def escape_css(string)
            string = string.gsub(ESCAPE_CSS_REGEXP) { |match| "\\#{match}" }
            string = "\\#{UNICODE_CODE_POINT + Integer(string[0])} #{string[1..]}" if string[0]&.match?(/[[:digit:]]/)

            string
          end
        end # LocatorConverter
      end # Bridge
    end # Remote
  end # WebDriver
end # Selenium
