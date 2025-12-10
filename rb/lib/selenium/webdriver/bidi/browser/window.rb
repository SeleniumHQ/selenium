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
    class BiDi
      class Browser
        class Window
          attr_reader :handle, :active, :state
          attr_accessor :height, :width, :x, :y

          def initialize(bidi, **opts)
            @bidi = bidi
            @handle = opts[:handle]
            @active = opts[:active]
            @height = opts[:height].to_i
            @width = opts[:width].to_i
            @x = opts[:x].to_i
            @y = opts[:y].to_i
            @state = opts[:state].to_sym
          end

          def active?
            @active
          end

          def set_state(state:, width: nil, height: nil, x: nil, y: nil)
            params = {clientWindow: @handle, state: state.to_s, width: width, height: height, x: x, y: y}.compact

            response = @bidi.send_cmd('browser.setClientWindowState', **params)
            update_attributes(state: state, width: width, height: height, x: x, y: y)
            response
          end

          def maximize
            set_state(state: :maximized)
          end

          def minimize
            set_state(state: :minimized)
          end

          def fullscreen
            set_state(state: :fullscreen)
          end

          def resize(width:, height:, x: nil, y: nil)
            set_state(state: :normal, width: width, height: height, x: x, y: y)
          end

          private

          def update_attributes(state:, width:, height:, x:, y:)
            @state = state.to_sym
            @width = width.to_i if width
            @height = height.to_i if height
            @x = x.to_i if x
            @y = y.to_i if y
          end
        end # Window
      end # Browser
    end # BiDi
  end # WebDriver
end # Selenium
