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
      # Creates actions specific to Pointer Input devices
      #
      # @api private
      #

      class PointerInput < InputDevice
        KIND = {mouse: :mouse, pen: :pen, touch: :touch}.freeze

        attr_reader :kind

        def initialize(kind, name: nil)
          super(name)
          @kind = assert_kind(kind)
          @type = Interactions::POINTER
        end

        def encode
          output = super
          output[:parameters] = {pointerType: kind} if output
          output
        end

        def assert_kind(pointer)
          raise TypeError, "#{pointer.inspect} is not a valid pointer type" unless KIND.key? pointer

          KIND[pointer]
        end

        def create_pointer_move(duration: 0, x: 0, y: 0, origin: nil, **)
          add_action(PointerMove.new(self, duration, x, y, origin: origin, **))
        end

        def create_pointer_down(button, **)
          add_action(PointerPress.new(self, :down, button, **))
        end

        def create_pointer_up(button, **)
          add_action(PointerPress.new(self, :up, button, **))
        end

        def create_pointer_cancel
          add_action(PointerCancel.new(self))
        end
      end # PointerInput
    end # Interactions
  end # WebDriver
end # Selenium
