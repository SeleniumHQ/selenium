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
    module PointerActions
      DEFAULT_MOVE_DURATION = 0.25 # 250 milliseconds

      #
      # Presses (without releasing) at the current location of the PointerInput device. This is equivalent to:
      #
      #   driver.action.click_and_hold(nil)
      #
      # @example Clicking and holding at the current location
      #
      #    driver.action.pointer_down(:left).perform
      #
      # @param [Selenium::WebDriver::Interactions::PointerPress::BUTTONS] button the button to press.
      # @param [Symbol || String] device optional name of the PointerInput device with the button
      #   that will be pressed
      # @return [W3CActionBuilder] A self reference.
      #

      def pointer_down(button, device: nil)
        button_action(button, action: :create_pointer_down, device: device)
      end

      #
      # Releases the pressed mouse button at the current mouse location of the PointerInput device.
      #
      # @example Releasing a button after clicking and holding
      #
      #    driver.action.pointer_down(:left).pointer_up(:left).perform
      #
      # @param [Selenium::WebDriver::Interactions::PointerPress::BUTTONS] button the button to release.
      # @param [Symbol || String] device optional name of the PointerInput device with the button that will
      #   be released
      # @return [W3CActionBuilder] A self reference.
      #

      def pointer_up(button, device: nil)
        button_action(button, action: :create_pointer_up, device: device)
      end

      #
      # Moves the mouse to the middle of the given element. The element is scrolled into
      # view and its location is calculated using getBoundingClientRect.  Then the
      # mouse is moved to optional offset coordinates from the element.
      #
      # This is adapted to be backward compatible from non-W3C actions. W3C calculates offset from the center point
      # of the element
      #
      # Note that when using offsets, both coordinates need to be passed.
      #
      # @example Scroll element into view and move the mouse to it
      #
      #   el = driver.find_element(id: "some_id")
      #   driver.action.move_to(el).perform
      #
      # @example
      #
      #   el = driver.find_element(id: "some_id")
      #   driver.action.move_to(el, 100, 100).perform
      #
      # @param [Selenium::WebDriver::Element] element to move to.
      # @param [Integer] right_by Optional offset from the top-left corner. A negative value means
      #   coordinates to the left of the element.
      # @param [Integer] down_by Optional offset from the top-left corner. A negative value means
      #   coordinates above the element.
      # @param [Symbol || String] device optional name of the PointerInput device to move.
      # @return [W3CActionBuilder] A self reference.
      #

      def move_to(element, right_by = nil, down_by = nil, device: nil)
        pointer = get_pointer(device)
        # New actions offset is from center of element
        if right_by || down_by
          size = element.size
          left_offset = (size[:width] / 2).to_i
          top_offset = (size[:height] / 2).to_i
          left = -left_offset + (right_by || 0)
          top = -top_offset + (down_by || 0)
        else
          left = 0
          top = 0
        end
        pointer.create_pointer_move(duration: DEFAULT_MOVE_DURATION,
                                    x: left,
                                    y: top,
                                    element: element)
        tick(pointer)
        self
      end

      #
      # Moves the mouse from its current position by the given offset.
      # If the coordinates provided are outside the viewport (the mouse will
      # end up outside the browser window) then the viewport is scrolled to
      # match.
      #
      # @example Move the mouse to a certain offset from its current position
      #
      #    driver.action.move_by(100, 100).perform
      #
      # @param [Integer] right_by horizontal offset. A negative value means moving the mouse left.
      # @param [Integer] down_by vertical offset. A negative value means moving the mouse up.
      # @param [Symbol || String] device optional name of the PointerInput device to move
      # @return [W3CActionBuilder] A self reference.
      # @raise [MoveTargetOutOfBoundsError] if the provided offset is outside the document's boundaries.
      #

      def move_by(right_by, down_by, device: nil)
        pointer = get_pointer(device)
        pointer.create_pointer_move(duration: DEFAULT_MOVE_DURATION,
                                    x: Integer(right_by),
                                    y: Integer(down_by),
                                    origin: Interactions::PointerMove::POINTER)
        tick(pointer)
        self
      end

      #
      # Moves the mouse to a given location in the viewport.
      # If the coordinates provided are outside the viewport (the mouse will
      # end up outside the browser window) then the viewport is scrolled to
      # match.
      #
      # @example Move the mouse to a certain position in the viewport
      #
      #    driver.action.move_to_location(100, 100).perform
      #
      # @param [Integer] x horizontal position. Equivalent to a css 'left' value.
      # @param [Integer] y vertical position. Equivalent to a css 'top' value.
      # @param [Symbol || String] device optional name of the PointerInput device to move
      # @return [W3CActionBuilder] A self reference.
      # @raise [MoveTargetOutOfBoundsError] if the provided x or y value is outside the document's boundaries.
      #

      def move_to_location(x, y, device: nil)
        pointer = get_pointer(device)
        pointer.create_pointer_move(duration: DEFAULT_MOVE_DURATION,
                                    x: Integer(x),
                                    y: Integer(y),
                                    origin: Interactions::PointerMove::VIEWPORT)
        tick(pointer)
        self
      end

      #
      # Clicks (without releasing) in the middle of the given element. This is
      # equivalent to:
      #
      #   driver.action.move_to(element).click_and_hold
      #
      # @example Clicking and holding on some element
      #
      #    el = driver.find_element(id: "some_id")
      #    driver.action.click_and_hold(el).perform
      #
      # @param [Selenium::WebDriver::Element] element the element to move to and click.
      # @param [Symbol || String] device optional name of the PointerInput device to click with
      # @return [W3CActionBuilder] A self reference.
      #

      def click_and_hold(element = nil, device: nil)
        move_to(element, device: device) if element
        pointer_down(:left, device: device)
        self
      end

      #
      # Releases the depressed left mouse button at the current mouse location.
      #
      # @example Releasing an element after clicking and holding it
      #
      #    el = driver.find_element(id: "some_id")
      #    driver.action.click_and_hold(el).release.perform
      #
      # @param [Symbol || String] device optional name of the PointerInput device with the button
      #   that will be released
      # @return [W3CActionBuilder] A self reference.
      #

      def release(device: nil)
        pointer_up(:left, device: device)
        self
      end

      #
      # Clicks in the middle of the given element. Equivalent to:
      #
      #   driver.action.move_to(element).click
      #
      # When no element is passed, the current mouse position will be clicked.
      #
      # @example Clicking on an element
      #
      #    el = driver.find_element(id: "some_id")
      #    driver.action.click(el).perform
      #
      # @example Clicking at the current mouse position
      #
      #    driver.action.click.perform
      #
      # @param [Selenium::WebDriver::Element] element An optional element to click.
      # @param [Symbol || String] device optional name of the PointerInput device with the button
      #   that will be clicked
      # @return [W3CActionBuilder] A self reference.
      #

      def click(element = nil, device: nil)
        move_to(element, device: device) if element
        pointer_down(:left, device: device)
        pointer_up(:left, device: device)
        self
      end

      #
      # Performs a double-click at middle of the given element. Equivalent to:
      #
      #   driver.action.move_to(element).double_click
      #
      # When no element is passed, the current mouse position will be double-clicked.
      #
      # @example Double-click an element
      #
      #    el = driver.find_element(id: "some_id")
      #    driver.action.double_click(el).perform
      #
      # @example Double-clicking at the current mouse position
      #
      #    driver.action.double_click.perform
      #
      # @param [Selenium::WebDriver::Element] element An optional element to move to.
      # @param [Symbol || String] device optional name of the PointerInput device with the button
      #   that will be double-clicked
      # @return [W3CActionBuilder] A self reference.
      #

      def double_click(element = nil, device: nil)
        move_to(element, device: device) if element
        click(device: device)
        click(device: device)
        self
      end

      #
      # Performs a context-click at middle of the given element. First performs
      # a move_to to the location of the element.
      #
      # When no element is passed, the current mouse position will be context-clicked.
      #
      # @example Context-click at middle of given element
      #
      #   el = driver.find_element(id: "some_id")
      #   driver.action.context_click(el).perform
      #
      # @example Context-clicking at the current mouse position
      #
      #    driver.action.context_click.perform
      #
      # @param [Selenium::WebDriver::Element] element An element to context click.
      # @param [Symbol || String] device optional name of the PointerInput device with the button
      #   that will be context-clicked
      # @return [W3CActionBuilder] A self reference.
      #

      def context_click(element = nil, device: nil)
        move_to(element, device: device) if element
        pointer_down(:right, device: device)
        pointer_up(:right, device: device)
        self
      end

      #
      # A convenience method that performs click-and-hold at the location of the
      # source element, moves to the location of the target element, then
      # releases the mouse.
      #
      # @example Drag and drop one element onto another
      #
      #   el1 = driver.find_element(id: "some_id1")
      #   el2 = driver.find_element(id: "some_id2")
      #   driver.action.drag_and_drop(el1, el2).perform
      #
      # @param [Selenium::WebDriver::Element] source element to emulate button down at.
      # @param [Selenium::WebDriver::Element] target element to move to and release the
      #   mouse at.
      # @param [Symbol || String] device optional name of the PointerInput device with the button
      #   that will perform the drag and drop
      # @return [W3CActionBuilder] A self reference.
      #

      def drag_and_drop(source, target, device: nil)
        click_and_hold(source, device: device)
        move_to(target, device: device)
        release(device: device)
        self
      end

      #
      # A convenience method that performs click-and-hold at the location of
      # the source element, moves by a given offset, then releases the mouse.
      #
      # @example Drag and drop an element by offset
      #
      #   el = driver.find_element(id: "some_id1")
      #   driver.action.drag_and_drop_by(el, 100, 100).perform
      #
      # @param [Selenium::WebDriver::Element] source Element to emulate button down at.
      # @param [Integer] right_by horizontal move offset.
      # @param [Integer] down_by vertical move offset.
      # @param [Symbol || String] device optional name of the PointerInput device with the button
      #   that will perform the drag and drop
      # @return [W3CActionBuilder] A self reference.
      #

      def drag_and_drop_by(source, right_by, down_by, device: nil)
        click_and_hold(source, device: device)
        move_by(right_by, down_by, device: device)
        release(device: device)
        self
      end

      private

      def button_action(button, action: nil, device: nil)
        pointer = get_pointer(device)
        pointer.send(action, button)
        tick(pointer)
        self
      end

      def get_pointer(device = nil)
        get_device(device) || pointer_inputs.first
      end
    end # PointerActions
  end # WebDriver
end # Selenium
