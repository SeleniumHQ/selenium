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
      FLICK_SPEED = { :normal => 0, :fast => 1}


      #
      # @api private
      #

      def initialize(bridge)
        @bridge = bridge
      end

      def single_tap(element)
        assert_element element
        @bridge.touchSingleTap element.ref
      end

      def double_tap(element)
        assert_element element
        @bridge.touchDoubleTap element.ref
      end

      def long_press(element)
        assert_element element
        @bridge.touchLongPress element.ref
      end

      def down(x, y = nil)
        x, y = coords_from x, y
        @bridge.touchDown x, y
      end

      def up(x, y = nil)
        x, y = coords_from x, y
        @bridge.touchUp x, y
      end

      def move(x, y = nil)
        x, y = coords_from x, y
        @bridge.touchMove x, y
      end

      def scroll(*args)
        case args.size
        when 2
          x_offset, y_offset = args
          @bridge.touchScroll nil, Integer(x_offset), Integer(y_offset)
        when 3
          element, x_offset, y_offset = args
          assert_element element
          @bridge.touchScroll element.ref, Integer(x_offset), Integer(y_offset)
        else
          raise ArgumentError, "wrong number of arguments, expected 2..3, got #{args.size}"
        end
      end

      def flick(*args)
        case args.size
        when 2
          x_speed, y_speed = args
          @bridge.touchFlick Integer(x_speed), Integer(y_speed)
        when 4
          element, xoffset, yoffset, speed = args

          assert_element element
          flick_speed = FLICK_SPEED[speed.to_sym]

          unless flick_speed
            raise ArgumentError, "expected one of #{FLICK_SPEED.keys.inspect}, got #{speed.inspect}"
          end

          @bridge.touchElementFlick element.ref, Integer(xoffset), Integer(yoffset), flick_speed
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

          x, y = point.x, point.y
        end

        [Integer(x), Integer(y)]
      end

      def assert_element(element)
        unless element.kind_of? Element
          raise TypeError, "expected #{Element}, got #{element.inspect}:#{element.class}"
        end
      end

    end # TouchScreen
  end # WebDriver
end # Selenium
