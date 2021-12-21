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
    module WheelActions
      def default_scroll_duration
        @default_scroll_duration ||= 0.25 # 250 milliseconds
      end

      #
      # Scrolls the viewport so that the provided element is at the bottom. Then the viewport
      # is further scrolled by the provided x and y offsets.
      #
      # @example Scroll to element
      #
      #    el = driver.find_element(id: "some_id")
      #    driver.action.scroll_to(el).perform
      #
      # @example Scroll to offset from element
      #
      #    el = driver.find_element(id: "some_id")
      #    driver.action.scroll_to(el, 0, 1000).perform
      #
      # @param [Selenium::WebDriver::Element] element to scroll to.
      # @param [Integer] x Optional horizontal offset to scroll from the center of the element.
      #   A negative value means scrolling left.
      # @param [Integer] y Optional vertical offset to scroll from the center of the element.
      #   A negative value means scrolling up.
      # @param [Symbol || String] device optional name of the WheelInput device to scroll with.
      # @return [ActionBuilder] A self reference.
      #

      def scroll_to(element, x = 0, y = 0, device: nil)
        scroll(x, y, origin: ScrollOrigin.element(element, 0, 0), device: device)
      end

      #
      # Scrolls the viewport from its current position by the provided offset.
      # The origin source is the upper left corner of the viewport
      #
      # @example Scroll by the provided amount
      #
      #    driver.action.scroll_by(0, 1000).perform
      #
      # @param [Integer] x horizontal offset. A negative value means scrolling left.
      # @param [Integer] y vertical offset. A negative value means scrolling up.
      # @param [Symbol || String] device Optional name of the WheelInput device to scroll with
      # @return [ActionBuilder] A self reference.
      #

      def scroll_by(x = 0, y = 0, device: nil)
        scroll(x, y, origin: ScrollOrigin.viewport(0, 0), device: device)
      end

      #
      # Scrolls the viewport based on a ScrollOrigin.
      #
      # This method is needed instead of #scroll_to or #scroll_by
      # when what needs to be scrolled is only in a portion of the viewport.
      # The origin can be thought of as where on the screen you put the mouse when
      # executing a wheel scroll, or where you put your cursor when swiping a touch pad, etc.
      #
      # The offset for the origin is referenced to either the upper left of the viewport or the center of the element
      # The methods ScrollOrigin.viewport and ScrollOrigin.element are provided to ensure correct syntax
      #
      # @example Scroll by the provided amount originating from a source offset from upper left of the viewport
      #
      #    el = driver.find_element(id: "some_id")
      #    driver.action.scroll(0, 100, ScrollOrigin.viewport(400, 200)).perform
      #
      # @example Scroll by the provided amount originating from a source offset from the center of the provided element
      #
      #    el = driver.find_element(id: "some_id")
      #    driver.action.scroll(0, 100, ScrollOrigin.element(element, x: -400, 100)).perform
      #
      # @see ScrollOrigin
      #
      # @param [Integer] x horizontal offset. A negative value means scrolling left.
      # @param [Integer] y vertical offset. A negative value means scrolling up.
      # @param [Hash] origin The location the scroll originates from
      # @param [Symbol || String] device Optional name of the WheelInput device to scroll with
      # @return [ActionBuilder] A self reference.
      # @raise [MoveTargetOutOfBoundsError] if the origin value is outside the viewport.
      #

      def scroll(x, y, origin: ScrollOrigin.viewport(0, 0), device: nil)
        wheel = wheel_input(device)
        opts = {delta_x: Integer(x),
                delta_y: Integer(y),
                duration: default_scroll_duration}.merge!(origin)
        wheel.create_scroll(**opts)
        tick(wheel)
        self
      end

      private

      def wheel_input(name = nil)
        device(name: name, type: Interactions::WHEEL) || add_wheel_input('wheel')
      end
    end # WheelActions
  end # WebDriver
end # Selenium
