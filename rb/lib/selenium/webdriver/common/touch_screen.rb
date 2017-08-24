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
    class TouchScreen
      FLICK_SPEED = {normal: 0, fast: 1}.freeze

      #
      # @api private
      #

      def initialize(bridge)
        @bridge = bridge
      end

      def single_tap(element)
        assert_element element
        @bridge.touch_single_tap element.ref
      end

      def double_tap(element)
        assert_element element
        @bridge.touch_double_tap element.ref
      end

      def long_press(element)
        assert_element element
        @bridge.touch_long_press element.ref
      end

      def down(x, y = nil)
        x, y = coords_from x, y
        @bridge.touch_down x, y
      end

      def up(x, y = nil)
        x, y = coords_from x, y
        @bridge.touch_up x, y
      end

      def move(x, y = nil)
        x, y = coords_from x, y
        @bridge.touch_move x, y
      end

      def scroll(*args)
        case args.size
        when 2
          x_offset, y_offset = args
          @bridge.touch_scroll nil, Integer(x_offset), Integer(y_offset)
        when 3
          element, x_offset, y_offset = args
          assert_element element
          @bridge.touch_scroll element.ref, Integer(x_offset), Integer(y_offset)
        else
          raise ArgumentError, "wrong number of arguments, expected 2..3, got #{args.size}"
        end
      end

      def flick(*args)
        case args.size
        when 2
          x_speed, y_speed = args
          @bridge.touch_flick Integer(x_speed), Integer(y_speed)
        when 4
          element, xoffset, yoffset, speed = args

          assert_element element

          if (speed.is_a?(String) || speed.is_a?(Symbol)) && FLICK_SPEED.keys.include?(speed.to_sym)
            WebDriver.logger.deprecate "Passing #{speed.inspect} speed",
                                       "Integer or Selenium::WebDriver::TouchScreen::FLICK_SPEED[:#{speed}]"
            speed = FLICK_SPEED[speed.to_sym]
          end

          @bridge.touch_element_flick element.ref, Integer(xoffset), Integer(yoffset), Integer(speed)
        else
          raise ArgumentError, "wrong number of arguments, expected 2 or 4, got #{args.size}"
        end
      end

      private

      def coords_from(x, y)
        if y.nil?
          point = x

          unless point.respond_to?(:x) && point.respond_to?(:y)
            raise ArgumentError, "expected #{point.inspect} to respond to :x and :y"
          end

          x = point.x
          y = point.y
        end

        [Integer(x), Integer(y)]
      end

      def assert_element(element)
        return if element.is_a? Element
        raise TypeError, "expected #{Element}, got #{element.inspect}:#{element.class}"
      end
    end # TouchScreen
  end # WebDriver
end # Selenium
