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
    #
    # @api private
    # @see ActionBuilder
    #

    class Mouse
      def initialize(bridge)
        @bridge = bridge
      end

      def click(element = nil)
        move_if_needed element
        @bridge.click
      end

      def double_click(element = nil)
        move_if_needed element
        @bridge.double_click
      end

      def context_click(element = nil)
        move_if_needed element
        @bridge.context_click
      end

      def down(element = nil)
        move_if_needed element
        @bridge.mouse_down
      end

      def up(element = nil)
        move_if_needed element
        @bridge.mouse_up
      end

      #
      # Move the mouse.
      #
      # Examples:
      #
      #   driver.mouse.move_to(element)
      #   driver.mouse.move_to(element, 5, 5)
      #

      def move_to(element, right_by = nil, down_by = nil)
        assert_element element

        @bridge.mouse_move_to element.ref, right_by, down_by
      end

      def move_by(right_by, down_by)
        @bridge.mouse_move_to nil, Integer(right_by), Integer(down_by)
      end

      private

      def move_if_needed(element)
        move_to element if element
      end

      def assert_element(element)
        return if element.is_a? Element
        raise TypeError, "expected #{Element}, got #{element.inspect}:#{element.class}"
      end
    end # Mouse
  end # WebDriver
end # Selenium
