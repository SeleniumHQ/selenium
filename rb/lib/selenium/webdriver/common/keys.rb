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
    module Keys
      #
      # @see Element#send_keys
      # @see http://www.google.com.au/search?&q=unicode+pua&btnG=Search
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
        command: "\ue03D" # alias
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
        keys.map do |arg|
          case arg
          when Symbol
            Keys[arg]
          when Array
            arg = arg.map { |e| e.is_a?(Symbol) ? Keys[e] : e }.join
            arg << Keys[:null]

            arg
          else
            arg.to_s
          end
        end
      end
    end # Keys
  end # WebDriver
end # Selenium
