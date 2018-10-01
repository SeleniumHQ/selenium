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

require 'securerandom'

module Selenium
  module WebDriver
    module Interactions
      class InputDevice
        attr_reader :name, :actions

        def initialize(name = nil)
          @name = name || SecureRandom.uuid
          @actions = []
        end

        def add_action(action)
          raise TypeError, "#{action.inspect} is not a valid action" unless action.class < Interaction
          @actions << action
        end

        def clear_actions
          @actions.clear
        end

        def create_pause(duration = 0)
          add_action(Pause.new(self, duration))
        end

        def no_actions? # Determine if only pauses are present
          actions = @actions.reject { |action| action.type == Interaction::PAUSE }
          actions.empty?
        end
      end # InputDevice
    end # Interactions
  end # WebDriver
end # Selenium
