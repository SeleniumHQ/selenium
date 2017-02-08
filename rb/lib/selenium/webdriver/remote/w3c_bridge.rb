# encoding: utf-8
#
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
      #
      # Low level bridge to the remote server, through which the rest of the API works.
      #
      # @api private
      #

      class W3CBridge < Bridge
        include Atoms

        #
        # alerts
        #

        def alert=(keys)
          execute :send_alert_text, {}, {value: keys.split(//)}
        end

        def full_screen_window
          execute :fullscreen_window
        end

        def cookie(name)
          execute :get_cookie, name: name
        end

        private

        def process_capabilities(opts)
          opts.delete(:marionette)
          super
        end

        def convert_locators(how, what)
          case how
          when 'class name'
            how = 'css selector'
            what = ".#{escape_css(what)}"
          when 'id'
            how = 'css selector'
            what = "##{escape_css(what)}"
          when 'name'
            how = 'css selector'
            what = "*[name='#{escape_css(what)}']"
          when 'tag name'
            how = 'css selector'
          end
          [how, what]
        end

        ESCAPE_CSS_REGEXP = /(['"\\#.:;,!?+<>=~*^$|%&@`{}\-\[\]\(\)])/
        UNICODE_CODE_POINT = 30

        # Escapes invalid characters in CSS selector.
        # @see https://mathiasbynens.be/notes/css-escapes
        def escape_css(string)
          string = string.gsub(ESCAPE_CSS_REGEXP) { |match| "\\#{match}" }
          if !string.empty? && string[0] =~ /[[:digit:]]/
            string = "\\#{UNICODE_CODE_POINT + Integer(string[0])} #{string[1..-1]}"
          end

          string
        end
      end # W3CBridge
    end # Remote
  end # WebDriver
end # Selenium
