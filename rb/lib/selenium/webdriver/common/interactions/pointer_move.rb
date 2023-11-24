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
      # Action related to moving the pointer.
      #
      # @api private
      #

      class PointerMove < Interaction
        include PointerEventProperties

        VIEWPORT = :viewport
        POINTER = :pointer
        ORIGINS = [VIEWPORT, POINTER].freeze

        def initialize(source, duration, x, y, **opts)
          super(source)
          @duration = duration * 1000
          @x_offset = x
          @y_offset = y
          @origin = opts.delete(:element) || opts.delete(:origin) || :viewport
          @type = :pointerMove
          @opts = opts
        end

        def assert_source(source)
          raise TypeError, "#{source.type} is not a valid input type" unless source.is_a? PointerInput
        end

        def encode
          process_opts.merge('type' => type.to_s,
                             'duration' => @duration.to_i,
                             'x' => @x_offset,
                             'y' => @y_offset,
                             'origin' => @origin)
        end
      end # PointerMove
    end # Interactions
  end # WebDriver
end # Selenium
