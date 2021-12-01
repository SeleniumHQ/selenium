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
      module PointerEventProperties
        VALID = {width: {'width' => {min: 0.0}},
                 height: {'height' => {min: 0.0}},
                 pressure: {'pressure' => {min: 0.0, max: 1.0}},
                 tangential_pressure: {'tangentialPressure' => {min: -1.0, max: 1.0}},
                 tilt_x: {'tiltX' => {min: -90, max: 90}},
                 tilt_y: {'tiltY' => {min: -90, max: 90}},
                 twist: {'twist' => {min: 0, max: 359}},
                 altitude_angle: {'altitudeAngle' => {min: 0.0, max: (Math::PI / 2)}},
                 azimuth_angle: {'azimuthAngle' => {min: 0.0, max: (Math::PI * 2)}}}.freeze

        def process_opts
          raise ArgumentError, "Unknown options found: #{@opts.inspect}" unless (@opts.keys - VALID.keys).empty?

          VALID.each_with_object({}) do |(key, val), hash|
            next unless @opts.key?(key)

            name = val.keys.first
            values = val.values.first
            hash[name] = assert_number(@opts[key], values[:min], values[:max])
          end
        end

        private

        def assert_number(num, min, max = nil)
          return if num.nil?

          klass = min.is_a?(Integer) ? Integer : Numeric
          raise TypeError, "#{num} is not a #{klass}" unless num.is_a?(klass)

          raise ArgumentError, "#{num} is not greater than or equal to #{min}" if num < min

          raise ArgumentError, "#{num} is not less than or equal to #{max}" if max && num > max

          num
        end
      end # PointerEventProperties
    end # Interactions
  end # WebDriver
end # Selenium
