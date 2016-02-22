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
    class TargetLocator

      #
      # @api private
      #

      def initialize(bridge)
        @bridge = bridge
      end

      #
      # switch to the frame with the given id
      #

      def frame(id)
        @bridge.switchToFrame id
      end

      #
      # switch to the parent frame
      #

      def parent_frame
        @bridge.switchToParentFrame
      end

      #
      # switch to the given window handle
      #
      # If given a block, this method will switch back to the original window after
      # block execution.
      #
      # @param id
      #   A window handle, obtained through Driver#window_handles
      #

      def window(id)
        if block_given?
          original = begin
            @bridge.getCurrentWindowHandle
          rescue Error::NoSuchWindowError
            nil
          end

          unless @bridge.getWindowHandles.include? id
            raise Error::NoSuchWindowError, "The specified identifier '#{id}' is not found in the window handle list"
          end

          @bridge.switchToWindow id

          begin
            returned = yield
          ensure
            current_handles = @bridge.getWindowHandles
            original = current_handles.first unless current_handles.include? original
            @bridge.switchToWindow original
            returned
          end
        else
          @bridge.switchToWindow id
        end
      end

      #
      # get the active element
      #
      # @return [WebDriver::Element]
      #

      def active_element
        @bridge.switchToActiveElement
      end

      #
      # selects either the first frame on the page, or the main document when a page contains iframes.
      #

      def default_content
        @bridge.switchToDefaultContent
      end

      #
      # switches to the currently active modal dialog for this particular driver instance
      #

      def alert
        Alert.new(@bridge)
      end

    end # TargetLocator
  end # WebDriver
end  # Selenium
