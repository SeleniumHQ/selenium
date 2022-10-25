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

      class WheelInput < InputDevice
        def initialize(name = nil)
          super(name)
          @type = Interactions::WHEEL
        end

        def create_scroll(**opts)
          opts[:source] = self
          add_action(Scroll.new(**opts))
        end
      end # PointerInput
    end # Interactions
  end # WebDriver
end # Selenium
