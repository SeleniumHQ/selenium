/*
Copyright 2012 Selenium committers
Copyright 2012 Software Freedom Conservancy

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

     http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/


package org.openqa.selenium.support;

import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class Color {
  private final short red;
  private final short green;
  private final short blue;
  private final float alpha;

  // Converters ordered by gut-feel frequency, with most likely first.
  private static final Converter[] CONVERTERS = {
      new RgbaConverter(),
      new HexConverter(),
      new Hex3Converter(),
      new RgbConverter(),
      new RgbPctConverter(),
      new RgbaPctConverter(),
      new HslConverter(),
      new HslaConverter()
  };

  /*
   * Guesses what format the input color is in.
   */
  public static Color fromString(String value) {
    for (Converter converter : CONVERTERS) {
      Color color = converter.getColor(value);
      if (color != null) {
        return color;
      }
    }
    throw new IllegalArgumentException(String.format("Did not know how to convert %s into color", value));
  }

  private Color(short red, short green, short blue, float alpha) {
    this.red = red;
    this.green = green;
    this.blue = blue;
    this.alpha = alpha;
  }

  public String asRgb() {
    return String.format("rgb(%d, %d, %d)", red, green, blue);
  }

  public String asRgba() {
    String formatSpec = (alpha == 1) ? "rgba(%d, %d, %d, %.0f)" : "rgba(%d, %d, %d, %.1f)";
    return String.format(formatSpec, red, green, blue, alpha);
  }

  public String asHex() {
    return String.format("#%02x%02x%02x", red, green, blue);
  }

  private static abstract class Converter {
    public Color getColor(String value) {
      Matcher matcher = getPattern().matcher(value);
      if (matcher.find()) {
        float a = 1f;
        if (matcher.groupCount() == 4) {
          a = Float.parseFloat(matcher.group(4));
        }
        return createColor(matcher, a);
      }
      return null;
    }

    protected Color createColor(Matcher matcher, float a) {
      return new Color(
        fromMatchGroup(matcher, 1),
        fromMatchGroup(matcher, 2),
        fromMatchGroup(matcher, 3),
        a);
    }

    protected short fromMatchGroup(Matcher matcher, int index) {
      return Short.parseShort(matcher.group(index), getRadix());
    }

    protected abstract Pattern getPattern();
    protected abstract int getRadix();
  }

  private static class RgbConverter extends Converter {
    private static final Pattern RGB_PATTERN = Pattern.compile("^\\s*rgb\\(\\s*(\\d{1,3})\\s*,\\s*(\\d{1,3})\\s*,\\s*(\\d{1,3})\\s*\\)\\s*$");

    @Override
    protected Pattern getPattern() {
      return RGB_PATTERN;
    }

    @Override
    protected int getRadix() {
      return 10;
    }
  }

  private static class RgbPctConverter extends Converter {
    private static final Pattern RGBPCT_PATTERN = Pattern.compile("^\\s*rgb\\(\\s*(\\d{1,3}|\\d{1,2}\\.\\d*)%\\s*,\\s*(\\d{1,3}|\\d{1,2}\\.\\d*)%\\s*,\\s*(\\d{1,3}|\\d{1,2}\\.\\d*)%\\s*\\)\\s*$");
    @Override
    protected Pattern getPattern() {
      return RGBPCT_PATTERN;
    }

    @Override
    protected int getRadix() {
      return 10;
    }

    @Override
    protected short fromMatchGroup(Matcher matcher, int index) {
      float n = Float.parseFloat(matcher.group(index)) / 100 * 255;
      return (short) (n);
    }
  }

  private static class RgbaConverter extends RgbConverter {
    private static final Pattern RGBA_PATTERN = Pattern.compile("^\\s*rgba\\(\\s*(\\d{1,3})\\s*,\\s*(\\d{1,3})\\s*,\\s*(\\d{1,3})\\s*,\\s*(0|1|0\\.\\d*)\\s*\\)\\s*$");
    @Override
    protected Pattern getPattern() {
      return RGBA_PATTERN;
    }
  }

  private static class RgbaPctConverter extends RgbPctConverter {
    private static final Pattern RGBAPCT_PATTERN = Pattern.compile("^\\s*rgba\\(\\s*(\\d{1,3}|\\d{1,2}\\.\\d*)%\\s*,\\s*(\\d{1,3}|\\d{1,2}\\.\\d*)%\\s*,\\s*(\\d{1,3}|\\d{1,2}\\.\\d*)%\\s*,\\s*(0|1|0\\.\\d*)\\s*\\)\\s*$");
    @Override
    protected Pattern getPattern() {
      return RGBAPCT_PATTERN;
    }
  }

  private static class HexConverter extends Converter {
    private static final Pattern HEX_PATTERN = Pattern.compile("#(\\p{XDigit}{2})(\\p{XDigit}{2})(\\p{XDigit}{2})");

    @Override
    protected Pattern getPattern() {
      return HEX_PATTERN;
    }

    @Override
    protected int getRadix() {
      return 16;
    }
  }

  private static class Hex3Converter extends Converter {
    private static final Pattern HEX3_PATTERN = Pattern.compile("#(\\p{XDigit}{1})(\\p{XDigit}{1})(\\p{XDigit}{1})");

    @Override
    protected Pattern getPattern() {
      return HEX3_PATTERN;
    }

    @Override
    protected int getRadix() {
      return 16;
    }

    @Override
    protected short fromMatchGroup(Matcher matcher, int index) {
      return Short.parseShort(matcher.group(index) + matcher.group(index), getRadix());
    }

  }

  private static class HslConverter extends Converter {
    private static final Pattern HSL_PATTERN = Pattern.compile("^\\s*hsl\\(\\s*(0|[1-9]\\d{0,2})\\s*,\\s*(0|[1-9]\\d{0,2})\\%\\s*,\\s*(0|[1-9]\\d{0,2})\\%\\s*\\)\\s*$");
    @Override
    protected Pattern getPattern() {
      return HSL_PATTERN;
    }

    @Override
    protected int getRadix() {
      return 10;
    }

    @Override
    protected Color createColor(Matcher matcher, float a) {
      float h =  Float.parseFloat(matcher.group(1)) / 360;
      float s =  Float.parseFloat(matcher.group(2)) / 100;
      float l =  Float.parseFloat(matcher.group(3)) / 100;
      float r, g, b;

      if (s == 0) {
        r = l;
        g = r;
        b = r;
      } else {
        float l2 = (l < 0.5) ? l * (1 + s) : l + s - l * s;
        float l1 = 2 * l - l2;
        r = hueToRgb(l1, l2, h + 1f / 3f);
        g = hueToRgb(l1, l2, h);
        b = hueToRgb(l1, l2, h - 1f / 3f);
      }

      return new Color((short) (r * 256),
          (short) (g * 256),
          (short) (b * 256),
          a);
    }

    private float hueToRgb(float l1, float l2, float h) {
      if (h < 0f) h += 1;
      if (h > 1f) h -= 1;
      if (h < 1f / 6f) return (l1 + (l2 - l1) * 6f * h);
      if (h < 1f / 2f) return l2;
      if (h < 2f / 3f) return (l1 + (l2 - l1) * ((2f / 3f) - h) * 6f);
      return l1;
    }

  }

  private static class HslaConverter extends HslConverter {
    private static final Pattern HSLA_PATTERN = Pattern.compile("^\\s*hsla\\(\\s*(0|[1-9]\\d{0,2})\\s*,\\s*(0|[1-9]\\d{0,2})\\%\\s*,\\s*(0|[1-9]\\d{0,2})\\%\\s*,\\s*(0|1|0\\.\\d*)\\s*\\)\\s*$");
    @Override
    protected Pattern getPattern() {
      return HSLA_PATTERN;
    }

  }

}
