module Selenium
  module WebDriver
    module Support
      class Color
        RGB_PATTERN      = /^\s*rgb\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*\)\s*$/
        RGB_PCT_PATTERN  = /^\s*rgb\(\s*(\d{1,3}|\d{1,2}\.\d+)%\s*,\s*(\d{1,3}|\d{1,2}\.\d+)%\s*,\s*(\d{1,3}|\d{1,2}\.\d+)%\s*\)\s*$/
        RGBA_PATTERN     = /^\s*rgba\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(0|1|0\.\d+)\s*\)\s*$/
        RGBA_PCT_PATTERN = /^\s*rgba\(\s*(\d{1,3}|\d{1,2}\.\d+)%\s*,\s*(\d{1,3}|\d{1,2}\.\d+)%\s*,\s*(\d{1,3}|\d{1,2}\.\d+)%\s*,\s*(0|1|0\.\d+)\s*\)\s*$/
        HEX_PATTERN      = /#([A-Fa-f0-9]{2})([A-Fa-f0-9]{2})([A-Fa-f0-9]{2})/ # \p{XDigit} or \h only works on Ruby 1.9
        HEX3_PATTERN     = /#([A-Fa-f0-9])([A-Fa-f0-9])([A-Fa-f0-9])/ # \p{XDigit} or \h only works on Ruby 1.9
        HSL_PATTERN      = /^\s*hsl\(\s*(\d{1,3})\s*,\s*(\d{1,3})%\s*,\s*(\d{1,3})%\s*\)\s*$/
        HSLA_PATTERN     = /^\s*hsla\(\s*(\d{1,3})\s*,\s*(\d{1,3})%\s*,\s*(\d{1,3})%\s*,\s*(0|1|0\.\d+)\s*\)\s*$/

        attr_reader :red, :green, :blue, :alpha

        def self.from_string(str)
          case str
          when RGB_PATTERN
            new $1, $2, $3
          when RGB_PCT_PATTERN
            new(*[$1, $2, $3].map { |e| Float(e) / 100 * 255 })
          when RGBA_PATTERN
            new $1, $2, $3, $4
          when RGBA_PCT_PATTERN
            new(*[$1, $2, $3].map { |e| Float(e) / 100 * 255 } << $4)
          when HEX_PATTERN
            new(*[$1, $2, $3].map { |e| e.to_i(16) })
          when HEX3_PATTERN
            new(*[$1, $2, $3].map { |e| (e * 2).to_i(16) })
          when HSL_PATTERN, HSLA_PATTERN
            from_hsl($1, $2, $3, $4)
          else
            raise ArgumentError, "could not convert #{str.inspect} into color"
          end
        end

        def self.from_hsl(h, s, l, a)
          h = Float(h) / 360
          s = Float(s) / 100
          l = Float(l) / 100
          a = Float(a || 1)

          if s == 0
            r = l
            g = r
            b = r
          else
            luminocity2 = (l < 0.5) ? l * (1 + s) : l + s - l * s
            luminocity1 = 2 * l - luminocity2

            hue_to_rgb = lambda do |lum1, lum2, hue|
              hue += 1 if hue < 0.0
              hue -= 1 if hue > 1.0

              if hue < 1.0 / 6.0
                 (lum1 + (lum2 - lum1) * 6.0 * hue)
              elsif  hue < 1.0 / 2.0
                 lum2
              elsif hue < 2.0 / 3.0
                lum1 + (lum2 - lum1) * ((2.0 / 3.0) - hue) * 6.0
              else
                lum1
              end
            end

            r = hue_to_rgb.call(luminocity1, luminocity2, h + 1.0 / 3.0)
            g = hue_to_rgb.call(luminocity1, luminocity2, h)
            b = hue_to_rgb.call(luminocity1, luminocity2, h - 1.0 / 3.0)
          end

          new r * 256, g * 256, b * 256, a
        end


        def initialize(red, green, blue, alpha = 1)
          @red   = Integer(red)
          @green = Integer(green)
          @blue  = Integer(blue)
          @alpha = Float(alpha)
        end

        def rgb
          "rgb(#{red}, #{green}, #{blue})"
        end

        def rgba
          a = alpha == 1 ? '1' : alpha
          "rgba(#{red}, #{green}, #{blue}, #{a})"
        end

        def hex
          "#%02x%02x%02x" % [red, green, blue]
        end

      end
    end
  end
end
