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
    module Interactions
      class PointerInput < InputDevice
        KIND = {mouse: :mouse, pen: :pen, touch: :touch}.freeze

        attr_reader :kind

        def initialize(kind, name: nil)
          super(name)
          @kind = assert_kind(kind)
        end

        def type
          Interactions::POINTER
        end

        def encode
          return nil if no_actions?
          output = {type: type, id: name, actions: @actions.map(&:encode)}
          output[:parameters] = {pointerType: kind}
          output
        end

        def assert_kind(pointer)
          raise TypeError, "#{pointer.inspect} is not a valid pointer type" unless KIND.key? pointer
          KIND[pointer]
        end

        def create_pointer_move(duration: 0, x: 0, y: 0, element: nil, origin: nil)
          add_action(PointerMove.new(self, duration, x, y, element: element, origin: origin))
        end

        def create_pointer_down(button)
          add_action(PointerPress.new(self, :down, button))
        end

        def create_pointer_up(button)
          add_action(PointerPress.new(self, :up, button))
        end

        def create_pointer_cancel
          add_action(PointerCancel.new(self))
        end
      end # PointerInput

      class PointerPress < Interaction
        BUTTONS = {left: 0, middle: 1, right: 2}.freeze
        DIRECTIONS = {down: :pointerDown, up: :pointerUp}.freeze

        def initialize(source, direction, button)
          super(source)
          @direction = assert_direction(direction)
          @button = assert_button(button)
        end

        def type
          @direction
        end

        def assert_button(button)
          if button.is_a? Symbol
            raise TypeError, "#{button.inspect} is not a valid button!" unless BUTTONS.key? button
            button = BUTTONS[button]
          end
          raise ArgumentError, 'Button number cannot be negative!' unless button >= 0
          button
        end

        def assert_direction(direction)
          raise TypeError, "#{direction.inspect} is not a valid button direction" unless DIRECTIONS.key? direction
          DIRECTIONS[direction]
        end

        def encode
          {type: type, button: @button}
        end
      end # PointerPress

      class PointerMove < Interaction
        VIEWPORT = :viewport
        POINTER = :pointer
        ORIGINS = [VIEWPORT, POINTER].freeze

        def initialize(source, duration, x, y, element: nil, origin: nil)
          super(source)
          @duration = duration * 1000
          @x_offset = x
          @y_offset = y
          @origin = element || origin
        end

        def type
          :pointerMove
        end

        def encode
          output = {type: type, duration: @duration.to_i, x: @x_offset, y: @y_offset}
          output[:origin] = @origin
          output
        end
      end # Move

      class PointerCancel < Interaction
        def type
          :pointerCancel
        end

        def encode
          {type: type}
        end
      end # Cancel
    end # Interactions
  end # WebDriver
end # Selenium
