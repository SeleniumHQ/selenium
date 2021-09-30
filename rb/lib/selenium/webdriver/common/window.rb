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
    class Window
      #
      # @api private
      #

      def initialize(bridge)
        @bridge = bridge
      end

      #
      # Resize the current window to the given dimension.
      #
      # @param [Selenium::WebDriver::Dimension, #width and #height] dimension The new size.
      #

      def size=(dimension)
        unless dimension.respond_to?(:width) && dimension.respond_to?(:height)
          raise ArgumentError, "expected #{dimension.inspect}:#{dimension.class}" \
                               ' to respond to #width and #height'
        end

        @bridge.resize_window dimension.width, dimension.height
      end

      #
      # Get the size of the current window.
      #
      # @return [Selenium::WebDriver::Dimension] The size.
      #

      def size
        @bridge.window_size
      end

      #
      # Move the current window to the given position.
      #
      # @param [Selenium::WebDriver::Point, #x and #y] point The new position.
      #

      def position=(point)
        unless point.respond_to?(:x) && point.respond_to?(:y)
          raise ArgumentError, "expected #{point.inspect}:#{point.class}" \
                               ' to respond to #x and #y'
        end

        @bridge.reposition_window point.x, point.y
      end

      #
      # Get the position of the current window.
      #
      # @return [Selenium::WebDriver::Point] The position.
      #

      def position
        @bridge.window_position
      end

      #
      # Sets the current window rect to the given point and position.
      #
      # @param [Selenium::WebDriver::Rectangle, #x, #y, #width, #height] rectangle The new rect.
      #

      def rect=(rectangle)
        unless %w[x y width height].all? { |val| rectangle.respond_to? val }
          raise ArgumentError, "expected #{rectangle.inspect}:#{rectangle.class}" \
                               ' to respond to #x, #y, #width, and #height'
        end

        @bridge.set_window_rect(x: rectangle.x,
                                y: rectangle.y,
                                width: rectangle.width,
                                height: rectangle.height)
      end

      #
      # Get the rect of the current window.
      #
      # @return [Selenium::WebDriver::Rectangle] The rectangle.
      #

      def rect
        @bridge.window_rect
      end

      #
      # Equivalent to #size=, but accepts width and height arguments.
      #
      # @example Maximize the window.
      #
      #    max_width, max_height = driver.execute_script("return [window.screen.availWidth, window.screen.availHeight];")
      #    driver.manage.window.resize_to(max_width, max_height)
      #

      def resize_to(width, height)
        @bridge.resize_window Integer(width), Integer(height)
      end

      #
      # Equivalent to #position=, but accepts x and y arguments.
      #
      # @example
      #
      #   driver.manage.window.move_to(300, 400)
      #

      def move_to(x, y)
        @bridge.reposition_window Integer(x), Integer(y)
      end

      #
      # Maximize the current window
      #

      def maximize
        @bridge.maximize_window
      end

      #
      # Minimize the current window
      #

      def minimize
        @bridge.minimize_window
      end

      #
      # Make current window full screen
      #

      def full_screen
        @bridge.full_screen_window
      end
    end # Window
  end # WebDriver
end # Selenium
