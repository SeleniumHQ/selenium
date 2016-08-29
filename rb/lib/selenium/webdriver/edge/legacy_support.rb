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
    module Edge
      module LegacySupport
        # These are commands Edge is still using from JSON Wire Protocol
        %i[executeScript executeAsyncScript submitElement doubleClick
           mouseDown mouseUp mouseMoveTo click
           sendKeysToActiveElement getWindowHandles getCurrentWindowHandle
           getWindowSize setWindowSize getWindowPosition setWindowPosition
           maximizeWindow getAlertText acceptAlert dismissAlert].each do |cmd|
          jwp = Remote::Bridge::COMMANDS[cmd]
          Remote::W3CBridge.command(cmd, jwp.first, jwp.last)
        end

        def execute_script(script, *args)
          result = execute :executeScript, {}, {script: script, args: args}
          unwrap_script_result result
        end

        def execute_async_script(script, *args)
          result = execute :executeAsyncScript, {}, {script: script, args: args}
          unwrap_script_result result
        end

        def submit_element(element)
          execute :submitElement, id: element['ELEMENT']
        end

        def double_click
          execute :doubleClick
        end

        def click
          execute :click, {}, {button: 0}
        end

        def context_click
          execute :click, {}, {button: 2}
        end

        def mouse_down
          execute :mouseDown
        end

        def mouse_up
          execute :mouseUp
        end

        def mouse_move_to(element, x = nil, y = nil)
          element_id = element['ELEMENT'] if element
          params = {element: element_id}

          if x && y
            params[:xoffset] = x
            params[:yoffset] = y
          end

          execute :mouseMoveTo, {}, params
        end

        def send_keys_to_active_element(key)
          execute :sendKeysToActiveElement, {}, {value: key}
        end

        def window_handle
          execute :getCurrentWindowHandle
        end

        def window_size(handle = :current)
          data = execute :getWindowSize, window_handle: handle

          Dimension.new data['width'], data['height']
        end

        def resize_window(width, height, handle = :current)
          execute :setWindowSize, {window_handle: handle},
                  {width: width,
                   height: height}
        end

        def window_position(handle = :current)
          data = execute :getWindowPosition, window_handle: handle

          Point.new data['x'], data['y']
        end

        def reposition_window(x, y, handle = :current)
          execute :setWindowPosition, {window_handle: handle},
                  {x: x, y: y}
        end

        def maximize_window(handle = :current)
          execute :maximizeWindow, window_handle: handle
        end
      end # LegacySupport
    end # Edge
  end # WebDriver
end # Selenium
