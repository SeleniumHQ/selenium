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
        [:executeScript, :executeAsyncScript, :submitElement, :doubleClick, :mouseDown, :mouseUp, :mouseMoveTo, :click,
         :sendKeysToActiveElement, :getWindowHandles, :getCurrentWindowHandle, :getWindowSize, :setWindowSize, :getWindowPosition,
         :setWindowPosition, :maximizeWindow, :getAlertText, :acceptAlert, :dismissAlert].each do |cmd|
          jwp = Remote::Bridge::COMMANDS[cmd]
          Remote::W3CBridge.command(cmd, jwp.first, jwp.last)
        end

        def executeScript(script, *args)
          result = execute :executeScript, {}, :script => script, :args => args
          unwrap_script_result result
        end

        def executeAsyncScript(script, *args)
          result = execute :executeAsyncScript, {}, :script => script, :args => args
          unwrap_script_result result
        end

        def submitElement(element)
          execute :submitElement, :id => element
        end

        def doubleClick
          execute :doubleClick
        end

        def click
          execute :click, {}, :button => 0
        end

        def contextClick
          execute :click, {}, :button => 2
        end

        def mouseDown
          execute :mouseDown
        end

        def mouseUp
          execute :mouseUp
        end

        def mouseMoveTo(element, x = nil, y = nil)
          params = { :element => element }

          if x && y
            params.merge! :xoffset => x, :yoffset => y
          end

          execute :mouseMoveTo, {}, params
        end

        def sendKeysToActiveElement(key)
          execute :sendKeysToActiveElement, {}, :value => key
        end

        def getCurrentWindowHandle
          execute :getCurrentWindowHandle
        end

        def getWindowSize(handle = :current)
          data = execute :getWindowSize, :window_handle => handle

          Dimension.new data['width'], data['height']
        end

        def setWindowSize(width, height, handle = :current)
          execute :setWindowSize, {:window_handle => handle},
                  :width  => width,
                  :height => height
        end

        def getWindowPosition(handle = :current)
          data = execute :getWindowPosition, :window_handle => handle

          Point.new data['x'], data['y']
        end

        def setWindowPosition(x, y, handle = :current)
          execute :setWindowPosition, {:window_handle => handle},
                  :x => x, :y => y
        end

        def maximizeWindow(handle = :current)
          execute :maximizeWindow, :window_handle => handle
        end


      end # LegacySupport
    end # Edge
  end # WebDriver
end # Selenium
