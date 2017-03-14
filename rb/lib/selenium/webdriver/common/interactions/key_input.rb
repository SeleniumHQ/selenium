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
    module Interactions
      class KeyInput < InputDevice
        SUBTYPES = {down: :keyDown, up: :keyUp, pause: :pause}.freeze

        def type
          Interactions::KEY
        end

        def encode
          return nil if no_actions?
          {type: type, id: name, actions: @actions.map(&:encode)}
        end

        def create_key_down(key)
          add_action(TypingInteraction.new(self, :down, key))
        end

        def create_key_up(key)
          add_action(TypingInteraction.new(self, :up, key))
        end

        class TypingInteraction < Interaction
          attr_reader :type

          def initialize(source, type, key)
            super(source)
            @type = assert_type(type)
            @key = Keys.encode_key(key)
          end

          def assert_type(type)
            raise TypeError, "#{type.inspect} is not a valid key subtype" unless KeyInput::SUBTYPES.key? type
            KeyInput::SUBTYPES[type]
          end

          def encode
            {type: @type, value: @key}
          end
        end # TypingInteraction
      end # KeyInput
    end # Interactions
  end # WebDriver
end # Selenium
