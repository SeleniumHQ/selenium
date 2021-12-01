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

      # This scrolls an element to the bottom of the viewport
      def scroll_to(element, device: nil)
        scroll_from(element, device: device)
      end

      # This scrolls from the provided element
      # The origin of the scroll is the center of the element plus the
      # offset amounts in origin_offset_x and origin_offset_y
      # The amount of scrolling is the value of right_by and down_by
      def scroll_from(element, right_by = 0, down_by = 0, origin_offset_x: 0, origin_offset_y: 0, device: nil)
        wheel = wheel_input(device)
        wheel.create_scroll(x: Integer(origin_offset_x),
                            y: Integer(origin_offset_y),
                            delta_x: Integer(right_by),
                            delta_y: Integer(down_by),
                            origin: element,
                            duration: default_move_duration)
        tick(wheel)
        self
      end

      # The origin of the scroll will the upper left corner of the viewport plus the
      # offset amounts in origin_x and origin_y
      # The amount of scrolling is the value of right_by and down_by
      def scroll_by(right_by = 0, down_by = 0, origin_x: 0, origin_y: 0, device: nil)
        wheel = wheel_input(device)
        wheel.create_scroll(x: Integer(origin_x),
                            y: Integer(origin_y),
                            delta_x: Integer(right_by),
                            delta_y: Integer(down_by),
                            origin: Interactions::Scroll::VIEWPORT,
                            duration: default_move_duration)
        tick(wheel)
        self
      end

      private

      def wheel_input(name = nil)
        device(name: name, type: Interactions::WHEEL) || add_wheel_input('wheel')
      end
    end # KeyActions
  end # WebDriver
end # Selenium
