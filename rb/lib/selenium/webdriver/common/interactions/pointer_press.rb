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
    module Interactions
      #
      # Actions related to clicking, tapping or pressing the pointer.
      #
      # @api private
      #

      class PointerPress < Interaction
        include PointerEventProperties

        BUTTONS = {left: 0,
                   touch: 0,
                   pen_contact: 0,
                   middle: 1,
                   right: 2,
                   pen_barrel: 2,
                   x1: 3,
                   back: 3,
                   x2: 4,
                   forward: 4}.freeze
        DIRECTIONS = {down: :pointerDown, up: :pointerUp}.freeze

        def initialize(source, direction, button, **opts)
          super(source)
          @direction = assert_direction(direction)
          @button = assert_button(button)
          @type = @direction
          @opts = opts
        end

        def encode
          process_opts.merge('type' => type.to_s, 'button' => @button)
        end

        private

        def assert_source(source)
          raise TypeError, "#{source.type} is not a valid input type" unless source.is_a? PointerInput
        end

        def assert_button(button)
          case button
          when Symbol
            raise ArgumentError, "#{button} is not a valid button!" unless BUTTONS.key? button

            BUTTONS[button]
          when Integer
            raise ArgumentError, 'Button number cannot be negative!' if button.negative?

            button
          else
            raise TypeError, "button must be a positive integer or one of #{BUTTONS.keys}, not #{button.class}"
          end
        end

        def assert_direction(direction)
          raise ArgumentError, "#{direction.inspect} is not a valid button direction" unless DIRECTIONS.key? direction

          DIRECTIONS[direction]
        end
      end # PointerPress
    end # Interactions
  end # WebDriver
end # Selenium
