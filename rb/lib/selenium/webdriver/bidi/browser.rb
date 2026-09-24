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

require_relative 'browser/window'

module Selenium
  module WebDriver
    class BiDi
      #
      # BiDi Implementation of the Browser Module
      # Continue to use functionality from existing `driver.manager.window` method
      #
      # @api private
      #

      class Browser
        def initialize(bidi)
          @bidi = bidi
          @window = nil
        end

        def create_user_context
          @bidi.send_cmd('browser.createUserContext')
        end

        def user_contexts
          @bidi.send_cmd('browser.getUserContexts')
        end

        def remove_user_context(user_context)
          @bidi.send_cmd('browser.removeUserContext', userContext: user_context)
        end

        def windows
          response = @bidi.send_cmd('browser.getClientWindows')

          response['clientWindows'].map do |win_data|
            attributes = {
              handle: win_data['clientWindow'],
              active: win_data['active'],
              height: win_data['height'],
              width: win_data['width'],
              x: win_data['x'],
              y: win_data['y'],
              state: win_data['state']
            }
            Window.new(@bidi, **attributes)
          end
        end

        def window
          @window ||= begin
            current_windows = windows
            current_windows.find(&:active?) || current_windows.first
          end
        end
      end # Browser
    end # BiDi
  end # WebDriver
end # Selenium
