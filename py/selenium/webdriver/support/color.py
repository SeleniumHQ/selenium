#!/usr/bin/python

# Copyright 2011 Software Freedom Conservancy.
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

RGB_PATTERN = r"^\s*rgb\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*\)\s*$"
RGB_PCT_PATTERN = r"^\s*rgb\(\s*(\d{1,3}|\d{1,2}\.\d+)%\s*,\s*(\d{1,3}|\d{1,2}\.\d+)%\s*,\s*(\d{1,3}|\d{1,2}\.\d+)%\s*\)\s*$"
RGBA_PATTERN = r"^\s*rgba\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(0|1|0\.\d+)\s*\)\s*$"
RGBA_PCT_PATTERN = r"^\s*rgba\(\s*(\d{1,3}|\d{1,2}\.\d+)%\s*,\s*(\d{1,3}|\d{1,2}\.\d+)%\s*,\s*(\d{1,3}|\d{1,2}\.\d+)%\s*,\s*(0|1|0\.\d+)\s*\)\s*$"
HEX_PATTERN = r"#([A-Fa-f0-9]{2})([A-Fa-f0-9]{2})([A-Fa-f0-9]{2})"
HEX3_PATTERN = r"#([A-Fa-f0-9])([A-Fa-f0-9])([A-Fa-f0-9])"
HSL_PATTERN = r"^\s*hsl\(\s*(\d{1,3})\s*,\s*(\d{1,3})%\s*,\s*(\d{1,3})%\s*\)\s*$"
HSLA_PATTERN = r"^\s*hsla\(\s*(\d{1,3})\s*,\s*(\d{1,3})%\s*,\s*(\d{1,3})%\s*,\s*(0|1|0\.\d+)\s*\)\s*$"


class Color(object):
    """
    Color conversion support class

    Example:
    from selenium.webdriver.support.color import Color

    print Color.from_string('#00ff33').rgba
    """

    @staticmethod
    def from_string(str_):
        import re

        class Matcher(object):
            def __init__(self):
                self.match_obj = None

            def match(self, pattern, str_):
                self.match_obj = re.match(pattern, str_)
                return self.match_obj

            @property
            def groups(self):
                return () if self.match_obj is None else self.match_obj.groups()

        m = Matcher()

        if m.match(RGB_PATTERN, str_):
            return Color(*m.groups)
        elif m.match(RGB_PCT_PATTERN, str_):
            rgb = tuple([float(each) / 100 * 255 for each in m.groups])
            return Color(*rgb)
        elif m.match(RGBA_PATTERN, str_):
            return Color(*m.groups)
        elif m.match(RGBA_PCT_PATTERN, str_):
            rgba = tuple([float(each) / 100 * 255 for each in m.groups[:3]] + [m.groups[3]])
            return Color(*rgba)
        elif m.match(HEX_PATTERN, str_):
            rgb = tuple([int(each, 16) for each in m.groups])
            return Color(*rgb)
        elif m.match(HEX3_PATTERN, str_):
            rgb = tuple([int(each * 2, 16) for each in m.groups])
            return Color(*rgb)
        elif m.match(HSL_PATTERN, str_) or m.match(HSLA_PATTERN, str_):
            return Color._from_hsl(*m.groups)
        elif str_.upper() in Colors.keys():
            return Colors[str_.upper()]
        else:
            raise ValueError("Could not convert %s into color" % str_)

    @staticmethod
    def _from_hsl(h, s, l, a=1):
        h = float(h) / 360
        s = float(s) / 100
        l = float(l) / 100

        if s == 0:
            r = l
            g = r
            b = r
        else:
            luminocity2 = l * (1 + s) if  l < 0.5 else  l + s - l * s
            luminocity1 = 2 * l - luminocity2

            def hue_to_rgb(lum1, lum2, hue):
                if hue < 0.0:
                    hue += 1
                if hue > 1.0:
                    hue -= 1

                if hue < 1.0 / 6.0:
                    return (lum1 + (lum2 - lum1) * 6.0 * hue)
                elif  hue < 1.0 / 2.0:
                    return lum2
                elif hue < 2.0 / 3.0:
                    return lum1 + (lum2 - lum1) * ((2.0 / 3.0) - hue) * 6.0
                else:
                    return lum1

            r = hue_to_rgb(luminocity1, luminocity2, h + 1.0 / 3.0)
            g = hue_to_rgb(luminocity1, luminocity2, h)
            b = hue_to_rgb(luminocity1, luminocity2, h - 1.0 / 3.0)

        return Color(r * 256, g * 256, b * 256, a)

    def __init__(self, red, green, blue, alpha=1):
        self.red = int(red)
        self.green = int(green)
        self.blue = int(blue)
        self.alpha = float(alpha)

    @property
    def rgb(self):
        return "rgb(%d, %d, %d)" % (self.red, self.green, self.blue)

    @property
    def rgba(self):
        a = "1" if self.alpha == 1 else str(self.alpha)
        return "rgba(%d, %d, %d, %s)" % (self.red, self.green, self.blue, a)

    @property
    def hex(self):
        return "#%02x%02x%02x" % (self.red, self.green, self.blue)

    def __eq__(self, other):
        if isinstance(other, Color):
            return self.rgba == other.rgba
        return NotImplemented

    def __ne__(self, other):
        result = self.__eq__(other)
        if result is NotImplemented:
            return result
        return not result

    def __hash__(self):
        return hash((self.red, self.green, self.blue, self.alpha))


Colors = {
    "BLACK": Color(0, 0, 0),
    "SILVER": Color(192, 192, 192),
    "GRAY": Color(128, 128, 128),
    "WHITE": Color(255, 255, 255),
    "MAROON": Color(128, 0, 0),
    "RED": Color(255, 0, 0),
    "PURPLE": Color(128, 0, 128),
    "FUCHSIA": Color(255, 0, 255),
    "GREEN": Color(0, 128, 0),
    "LIME": Color(0, 255, 0),
    "OLIVE": Color(128, 128, 0),
    "YELLOW": Color(255, 255, 0),
    "NAVY": Color(0, 0, 128),
    "BLUE": Color(0, 0, 255),
    "TEAL": Color(0, 128, 128),
    "AQUA": Color(0, 255, 255)
}
