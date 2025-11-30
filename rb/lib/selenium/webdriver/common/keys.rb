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
    module Keys
      #
      # @see Element#send_keys
      # @see http://www.google.com.au/search?&q=unicode+pua&btnK=Search
      #

      KEYS = {
        null: "\ue000",
        cancel: "\ue001",
        help: "\ue002",
        backspace: "\ue003",
        tab: "\ue004",
        clear: "\ue005",
        return: "\ue006",
        enter: "\ue007",
        shift: "\ue008",
        left_shift: "\ue008",
        control: "\ue009",
        left_control: "\ue009",
        alt: "\ue00A",
        left_alt: "\ue00A",
        pause: "\ue00B",
        escape: "\ue00C",
        space: "\ue00D",
        page_up: "\ue00E",
        page_down: "\ue00F",
        end: "\ue010",
        home: "\ue011",
        left: "\ue012",
        arrow_left: "\ue012",
        up: "\ue013",
        arrow_up: "\ue013",
        right: "\ue014",
        arrow_right: "\ue014",
        down: "\ue015",
        arrow_down: "\ue015",
        insert: "\ue016",
        delete: "\ue017",
        semicolon: "\ue018",
        equals: "\ue019",
        numpad0: "\ue01A",
        numpad1: "\ue01B",
        numpad2: "\ue01C",
        numpad3: "\ue01D",
        numpad4: "\ue01E",
        numpad5: "\ue01F",
        numpad6: "\ue020",
        numpad7: "\ue021",
        numpad8: "\ue022",
        numpad9: "\ue023",
        multiply: "\ue024",
        add: "\ue025",
        separator: "\ue026",
        subtract: "\ue027",
        decimal: "\ue028",
        divide: "\ue029",
        numpad_multiply: "\ue024",
        numpad_add: "\ue025",
        numpad_comma: "\ue026",
        numpad_subtract: "\ue027",
        numpad_decimal: "\ue028",
        numpad_divide: "\ue029",
        numpad_enter: "\ue007",
        f1: "\ue031",
        f2: "\ue032",
        f3: "\ue033",
        f4: "\ue034",
        f5: "\ue035",
        f6: "\ue036",
        f7: "\ue037",
        f8: "\ue038",
        f9: "\ue039",
        f10: "\ue03A",
        f11: "\ue03B",
        f12: "\ue03C",
        meta: "\ue03D",
        command: "\ue03D", # alias
        left_meta: "\ue03D", # alias
        zenkaku_hankaku: "\uE040",
        right_shift: "\ue050",
        right_control: "\ue051",
        right_alt: "\ue052",
        right_meta: "\ue053",
        options: "\ue052",
        function: "\ue051", # macOS Function key, same as right_control
        numpad_page_up: "\ue054",
        numpad_page_down: "\ue055",
        numpad_end: "\ue056",
        numpad_home: "\ue057",
        numpad_left: "\ue058",
        numpad_up: "\ue059",
        numpad_right: "\ue05A",
        numpad_down: "\ue05B",
        numpad_insert: "\ue05C",
        numpad_delete: "\ue05D"
      }.freeze

      #
      # @api private
      #

      def self.[](key)
        return KEYS[key] if KEYS[key]

        raise Error::UnsupportedOperationError, "no such key #{key.inspect}"
      end

      #
      # @api private
      #

      def self.encode(keys)
        keys.map { |key| encode_key(key) }
      end

      #
      # @api private
      #

      def self.encode_key(key)
        case key
        when Symbol
          Keys[key]
        when Array
          key = key.map { |e| e.is_a?(Symbol) ? Keys[e] : e }.join
          key << Keys[:null]

          key
        else
          key.to_s
        end
      end
    end # Keys
  end # WebDriver
end # Selenium
