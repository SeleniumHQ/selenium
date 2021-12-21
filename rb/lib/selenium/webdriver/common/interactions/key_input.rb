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
      # Creates actions specific to Key Input devices
      #
      # @api private
      #

      class KeyInput < InputDevice
        SUBTYPES = {down: :keyDown, up: :keyUp, pause: :pause}.freeze

        def initialize(name = nil)
          super
          @type = Interactions::KEY
        end

        def create_key_down(key)
          add_action(TypingInteraction.new(self, :down, key))
        end

        def create_key_up(key)
          add_action(TypingInteraction.new(self, :up, key))
        end

        # Backward compatibility in case anyone called this directly
        class TypingInteraction < Interactions::TypingInteraction; end
      end # KeyInput
    end # Interactions
  end # WebDriver
end # Selenium
