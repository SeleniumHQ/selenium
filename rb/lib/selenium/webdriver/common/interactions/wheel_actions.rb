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
      attr_writer :default_scroll_duration

      #
      # By default this is set to 250ms in the ActionBuilder constructor
      # It can be overridden with default_scroll_duration=
      #

      def default_scroll_duration
        @default_scroll_duration ||= @duration / 1000.0 # convert ms to seconds
      end

      #
      # If the element is outside the viewport, scrolls the bottom of the element to the bottom of the viewport.
      #
      # @example Scroll to element
      #    el = driver.find_element(id: "some_id")
      #    driver.action.scroll_to(element).perform
      #
      # @param [Object] element Which element to scroll into the viewport.
      # @param [Object] device Which device to use to scroll
      # @return [Selenium::WebDriver::WheelActions] A self reference.
      def scroll_to(element, device: nil)
        scroll(origin: element, device: device)
      end

      #
      # Scrolls by provided amounts with the origin in the top left corner of the viewport.
      #
      # @example Scroll viewport by a specified amount
      #    el = driver.find_element(id: "some_id")
      #    driver.action.scroll_by(100, 200).perform
      #
      # @param [Integer] delta_x Distance along X axis to scroll using the wheel. A negative value scrolls left.
      # @param [Integer] delta_y Distance along Y axis to scroll using the wheel. A negative value scrolls up.
      # @return [Selenium::WebDriver::WheelActions] A self reference.
      def scroll_by(delta_x, delta_y, device: nil)
        scroll(delta_x: delta_x, delta_y: delta_y, device: device)
      end

      #
      # Scrolls by provided amount based on a provided origin.
      #
      # The scroll origin is either the center of an element or the upper left of the viewport plus any offsets.
      # If the origin is an element, and the element is not in the viewport, the bottom of the element will first
      #   be scrolled to the bottom of the viewport.
      #
      # @example Scroll from element by a specified amount
      #    el = driver.find_element(id: "some_id")
      #    origin = WheelActions::ScrollOrigin.element(el)
      #    driver.action.scroll_from(origin, 0, 200).perform
      #
      # @example Scroll from element by a specified amount with an offset
      #    el = driver.find_element(id: "some_id")
      #    origin = WheelActions::ScrollOrigin.element(el, 10, 10)
      #    driver.action.scroll_from(origin, 100, 200).perform
      #
      # @example Scroll viewport by a specified amount with an offset
      #    origin = WheelActions::ScrollOrigin.viewport(10, 10)
      #    driver.action.scroll_from(origin, 0, 200).perform
      #
      # @param [ScrollOrigin] scroll_origin Where scroll originates (viewport or element center) plus provided offsets.
      # @param [Integer] delta_x Distance along X axis to scroll using the wheel. A negative value scrolls left.
      # @param [Integer] delta_y Distance along Y axis to scroll using the wheel. A negative value scrolls up.
      # @return [Selenium::WebDriver::WheelActions] A self reference.
      # @raise [Error::MoveTargetOutOfBoundsError] If the origin with offset is outside the viewport.
      def scroll_from(scroll_origin, delta_x, delta_y, device: nil)
        raise TypeError, "#{scroll_origin.inspect} isn't a valid ScrollOrigin" unless scroll_origin.is_a?(ScrollOrigin)

        scroll(x: scroll_origin.x_offset,
               y: scroll_origin.y_offset,
               delta_x: delta_x,
               delta_y: delta_y,
               origin: scroll_origin.origin,
               device: device)
      end

      private

      def scroll(**opts)
        opts[:duration] = default_scroll_duration
        wheel = wheel_input(opts.delete(:device))
        wheel.create_scroll(**opts)
        tick(wheel)
        self
      end

      def wheel_input(name = nil)
        device(name: name, type: Interactions::WHEEL) || add_wheel_input('wheel')
      end
    end # WheelActions
  end # WebDriver
end # Selenium
