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
    module Support
      class Color
        RGB_PATTERN = %r{^\s*rgb\(\s*(\d{1,3})\s*,
                          \s*(\d{1,3})\s*,
                          \s*(\d{1,3})\s*\)\s*$}x.freeze
        RGB_PCT_PATTERN = %r{^\s*rgb\(\s*(\d{1,3}|\d{1,2}\.\d+)%\s*,
                              \s*(\d{1,3}|\d{1,2}\.\d+)%\s*,
                              \s*(\d{1,3}|\d{1,2}\.\d+)%\s*\)\s*$}x.freeze
        RGBA_PATTERN = %r{^\s*rgba\(\s*(\d{1,3})\s*,
                          \s*(\d{1,3})\s*,
                          \s*(\d{1,3})\s*,
                          \s*(0|1|0\.\d+)\s*\)\s*$}x.freeze
        RGBA_PCT_PATTERN = %r{^\s*rgba\(\s*(\d{1,3}|\d{1,2}\.\d+)
                              %\s*,\s*(\d{1,3}|\d{1,2}\.\d+)
                              %\s*,\s*(\d{1,3}|\d{1,2}\.\d+)
                              %\s*,\s*(0|1|0\.\d+)\s*\)\s*$}x.freeze
        HEX_PATTERN = /#(\h{2})(\h{2})(\h{2})/.freeze
        HEX3_PATTERN = /#(\h)(\h)(\h)/.freeze
        HSL_PATTERN = %r{^\s*hsl\(\s*(\d{1,3})\s*,
                         \s*(\d{1,3})%\s*,
                         \s*(\d{1,3})%\s*\)\s*$}x.freeze
        HSLA_PATTERN = %r{^\s*hsla\(\s*(\d{1,3})\s*,
                          \s*(\d{1,3})%\s*,
                          \s*(\d{1,3})%\s*,
                          \s*(0|1|0\.\d+)\s*\)\s*$}x.freeze

        attr_reader :red, :green, :blue, :alpha

        def self.from_string(str)
          case str
          when RGB_PATTERN
            new Regexp.last_match(1), Regexp.last_match(2), Regexp.last_match(3)
          when RGB_PCT_PATTERN
            array = [Regexp.last_match(1), Regexp.last_match(2), Regexp.last_match(3)]
            new(*array.map { |e| Float(e) / 100 * 255 })
          when RGBA_PATTERN
            new Regexp.last_match(1), Regexp.last_match(2), Regexp.last_match(3), Regexp.last_match(4)
          when RGBA_PCT_PATTERN
            array = [Regexp.last_match(1), Regexp.last_match(2), Regexp.last_match(3)]
            new(*array.map { |e| Float(e) / 100 * 255 } << Regexp.last_match(4))
          when HEX_PATTERN
            array = [Regexp.last_match(1), Regexp.last_match(2), Regexp.last_match(3)]
            new(*array.map { |e| e.to_i(16) })
          when HEX3_PATTERN
            array = [Regexp.last_match(1), Regexp.last_match(2), Regexp.last_match(3)]
            new(*array.map { |e| (e * 2).to_i(16) })
          when HSL_PATTERN, HSLA_PATTERN
            from_hsl(Regexp.last_match(1), Regexp.last_match(2), Regexp.last_match(3), Regexp.last_match(4))
          else
            raise ArgumentError, "could not convert #{str.inspect} into color"
          end
        end

        def self.from_hsl(h, s, l, a) # rubocop:disable Naming/MethodParameterName
          h = Float(h) / 360
          s = Float(s) / 100
          l = Float(l) / 100
          a = Float(a || 1)

          if s.zero?
            r = l
            g = r
            b = r
          else
            luminocity2 = l < 0.5 ? l * (1 + s) : l + s - (l * s)
            luminocity1 = (2 * l) - luminocity2

            r = hue_to_rgb(luminocity1, luminocity2, h + (1.0 / 3.0))
            g = hue_to_rgb(luminocity1, luminocity2, h)
            b = hue_to_rgb(luminocity1, luminocity2, h - (1.0 / 3.0))
          end

          new (r * 255).round, (g * 255).round, (b * 255).round, a
        end

        def self.hue_to_rgb(lum1, lum2, hue)
          hue += 1 if hue < 0.0
          hue -= 1 if hue > 1.0

          if hue < 1.0 / 6.0
            (lum1 + ((lum2 - lum1) * 6.0 * hue))
          elsif hue < 1.0 / 2.0
            lum2
          elsif hue < 2.0 / 3.0
            lum1 + ((lum2 - lum1) * ((2.0 / 3.0) - hue) * 6.0)
          else
            lum1
          end
        end

        def initialize(red, green, blue, alpha = 1)
          @red = Integer(red)
          @green = Integer(green)
          @blue = Integer(blue)
          @alpha = Float(alpha)
        end

        def ==(other)
          return true if equal?(other)
          return false unless other.is_a?(self.class)

          [red, green, blue, alpha] == [other.red, other.green, other.blue, other.alpha]
        end
        alias_method :eql?, :==

        def hash
          [red, green, blue, alpha, self.class].hash
        end

        def rgb
          "rgb(#{red}, #{green}, #{blue})"
        end

        def rgba
          a = alpha == 1 ? '1' : alpha
          "rgba(#{red}, #{green}, #{blue}, #{a})"
        end

        def hex
          format '#%<red>02x%<green>02x%<blue>02x', red: red, green: green, blue: blue
        end
      end # Color
    end # Support
  end # WebDriver
end # Selenium
