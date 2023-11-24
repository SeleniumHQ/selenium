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
      # Action related to scrolling a wheel.
      #
      # @api private
      #

      class Scroll < Interaction
        def initialize(source:, origin: :viewport, duration: 0.25, **opts)
          super(source)
          @type = :scroll
          @duration = duration * 1000
          @origin = origin
          @x_offset = opts.delete(:x) || 0
          @y_offset = opts.delete(:y) || 0
          @delta_x = opts.delete(:delta_x) || 0
          @delta_y = opts.delete(:delta_y) || 0

          raise ArgumentError, "Invalid arguments: #{opts.keys}" unless opts.empty?
        end

        def assert_source(source)
          raise TypeError, "#{source.type} is not a valid input type" unless source.is_a? WheelInput
        end

        def encode
          {'type' => type.to_s,
           'duration' => @duration.to_i,
           'x' => @x_offset,
           'y' => @y_offset,
           'deltaX' => @delta_x,
           'deltaY' => @delta_y,
           'origin' => @origin.is_a?(Element) ? @origin : @origin.to_s}
        end
      end # PointerPress
    end # Interactions
  end # WebDriver
end # Selenium
