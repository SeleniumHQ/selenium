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
      # This method uses a Scroll Wheel Input to determine where and by how much to scroll
      #
      # The scroll happens from an origin plus an offset.
      # The amount to scroll is represented by delta_x and delta_y
      # The origin is either the center of a provided element or the upper left of the current viewport
      # The offset from the origin is represented by x and y
      #
      # @example Scroll to element
      #    el = driver.find_element(id: "some_id")
      #    driver.action.scroll(origin: element).perform
      #
      # @example Scroll from element by a specified amount
      #    el = driver.find_element(id: "some_id")
      #    driver.action.scroll(delta_x: 100, delta_y: 200, origin: element).perform
      #
      # @example Scroll from element by a specified amount with an offset
      #    el = driver.find_element(id: "some_id")
      #    driver.action.scroll(x: 10, y: 10, delta_x: 100, delta_y: 200, origin: element).perform
      #
      # @example Scroll viewport by a specified amount
      #    el = driver.find_element(id: "some_id")
      #    driver.action.scroll(delta_x: 100, delta_y: 200).perform
      #
      # @example Scroll viewport by a specified amount with an offset
      #    el = driver.find_element(id: "some_id")
      #    driver.action.scroll(x: 10, y: 10, delta_x: 100, delta_y: 200).perform
      #
      # @option opts [Integer] x The horizontal offset from the origin from which to start the scroll.
      # @option opts [Integer] y The vertical offset from the origin from which to start the scroll.
      # @option opts [Integer] delta_x Distance along X axis to scroll using the wheel. A negative value scrolls left.
      # @option opts [Integer] delta_y Distance along Y axis to scroll using the wheel. A negative value scrolls up.
      # @option opts [String, Element] origin The origin of the scroll, either the viewport or the center of an element.
      # @return [ActionBuilder] A self reference.
      # @raise [MoveTargetOutOfBoundsError] if the origin plus offset is located outside the viewport.
      #

      def scroll(**opts)
        opts[:duration] = default_scroll_duration
        wheel = wheel_input(opts.delete(:device))
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
