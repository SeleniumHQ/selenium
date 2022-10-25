// Licensed to the Software Freedom Conservancy (SFC) under one
// or more contributor license agreements.  See the NOTICE file
// distributed with this work for additional information
// regarding copyright ownership.  The SFC licenses this file
// to you under the Apache License, Version 2.0 (the
// "License"); you may not use this file except in compliance
// with the License.  You may obtain a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing,
// software distributed under the License is distributed on an
// "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
// KIND, either express or implied.  See the License for the
// specific language governing permissions and limitations
// under the License.

package org.openqa.selenium.support;

import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class Color {
  private final int red;
  private final int green;
  private final int blue;
  private double alpha;

  private static final Converter[] CONVERTERS = {
      new RgbConverter(),
      new RgbPctConverter(),
      new RgbaConverter(),
      new RgbaPctConverter(),
      new HexConverter(),
      new Hex3Converter(),
      new HslConverter(),
      new HslaConverter(),
      new NamedColorConverter(),
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
    throw new IllegalArgumentException(
        String.format("Did not know how to convert %s into color", value)
    );
  }

  public Color(int red, int green, int blue, double alpha) {
    this.red = red;
    this.green = green;
    this.blue = blue;
    this.alpha = alpha;
  }

  public void setOpacity(double alpha) {
    this.alpha = alpha;
  }

  public String asRgb() {
    return String.format("rgb(%d, %d, %d)", red, green, blue);
  }

  public String asRgba() {
    String alphaString;
    if (alpha == 1) {
      alphaString = "1";
    } else if (alpha == 0) {
      alphaString = "0";
    } else {
      alphaString = Double.toString(alpha);
    }
    return String.format("rgba(%d, %d, %d, %s)", red, green, blue, alphaString);
  }

  public String asHex() {
    return String.format("#%02x%02x%02x", red, green, blue);
  }

  /**
   * @return a java.awt.Color class instance
   */
  public java.awt.Color getColor() {
    return new java.awt.Color(red, green, blue, (int)(alpha*255));
  }

  @Override
  public String toString() {
    return "Color: " + asRgba();
  }

  @Override
  public boolean equals(Object other) {
    if (other == null) {
      return false;
    }

    if (!(other instanceof Color)) {
      return false;
    }

    return asRgba().equals(((Color) other).asRgba());
  }

  @Override
  public int hashCode() {
    int result;
    long temp;
    result = red;
    result = 31 * result + green;
    result = 31 * result + blue;
    temp = alpha != +0.0d ? Double.doubleToLongBits(alpha) : 0L;
    result = 31 * result + (int) (temp ^ (temp >>> 32));
    return result;
  }

  private abstract static class Converter {
    public Color getColor(String value) {
      Matcher matcher = getPattern().matcher(value);
      if (matcher.find()) {
        double a = 1.0;
        if (matcher.groupCount() == 4) {
          a = Double.parseDouble(matcher.group(4));
        }
        return createColor(matcher, a);
      }
      return null;
    }

    protected Color createColor(Matcher matcher, double a) {
      return new Color(
          fromMatchGroup(matcher, 1),
          fromMatchGroup(matcher, 2),
          fromMatchGroup(matcher, 3),
          a);
    }

    protected short fromMatchGroup(Matcher matcher, int index) {
      return Short.parseShort(matcher.group(index), 10);
    }

    protected abstract Pattern getPattern();
  }

  private static class RgbConverter extends Converter {
    private static final Pattern RGB_PATTERN = Pattern.compile("^\\s*rgb\\(\\s*" +
        "(\\d{1,3})\\s*,\\s*" +
        "(\\d{1,3})\\s*,\\s*" +
        "(\\d{1,3})\\s*\\)\\s*$");

    @Override
    protected Pattern getPattern() {
      return RGB_PATTERN;
    }
  }

  private static class RgbPctConverter extends Converter {
    private static final Pattern RGBPCT_PATTERN = Pattern.compile("^\\s*rgb\\(\\s*" +
        "(\\d{1,3}|\\d{1,2}\\.\\d+)%\\s*,\\s*" +
        "(\\d{1,3}|\\d{1,2}\\.\\d+)%\\s*,\\s*" +
        "(\\d{1,3}|\\d{1,2}\\.\\d+)%\\s*\\)\\s*$");

    @Override
    protected Pattern getPattern() {
      return RGBPCT_PATTERN;
    }

    @Override
    protected short fromMatchGroup(Matcher matcher, int index) {
      double n = Double.parseDouble(matcher.group(index)) / 100 * 255;
      return (short) n;
    }
  }

  private static class RgbaConverter extends RgbConverter {
    private static final Pattern RGBA_PATTERN = Pattern.compile("^\\s*rgba\\(\\s*" +
        "(\\d{1,3})\\s*,\\s*(\\d{1,3})\\s*,\\s*" +
        "(\\d{1,3})\\s*,\\s*(0|1|0\\.\\d+)\\s*\\)\\s*$");

    @Override
    protected Pattern getPattern() {
      return RGBA_PATTERN;
    }
  }

  private static class RgbaPctConverter extends RgbPctConverter {
    private static final Pattern RGBAPCT_PATTERN = Pattern.compile("^\\s*rgba\\(\\s*" +
        "(\\d{1,3}|\\d{1,2}\\.\\d+)%\\s*,\\s*" +
        "(\\d{1,3}|\\d{1,2}\\.\\d+)%\\s*,\\s*" +
        "(\\d{1,3}|\\d{1,2}\\.\\d+)%\\s*,\\s*" +
        "(0|1|0\\.\\d+)\\s*\\)\\s*$");

    @Override
    protected Pattern getPattern() {
      return RGBAPCT_PATTERN;
    }
  }

  private static class HexConverter extends Converter {
    private static final Pattern HEX_PATTERN = Pattern.compile(
        "#(\\p{XDigit}{2})(\\p{XDigit}{2})(\\p{XDigit}{2})"
    );

    @Override
    protected Pattern getPattern() {
      return HEX_PATTERN;
    }

    @Override
    protected short fromMatchGroup(Matcher matcher, int index) {
      return Short.parseShort(matcher.group(index), 16);
    }
  }

  private static class Hex3Converter extends Converter {
    private static final Pattern HEX3_PATTERN = Pattern.compile(
        "#(\\p{XDigit}{1})(\\p{XDigit}{1})(\\p{XDigit}{1})"
    );

    @Override
    protected Pattern getPattern() {
      return HEX3_PATTERN;
    }

    @Override
    protected short fromMatchGroup(Matcher matcher, int index) {
      return Short.parseShort(matcher.group(index) + matcher.group(index), 16);
    }

  }

  private static class HslConverter extends Converter {
    private static final Pattern HSL_PATTERN = Pattern.compile("^\\s*hsl\\(\\s*" +
        "(\\d{1,3})\\s*,\\s*" +
        "(\\d{1,3})\\%\\s*,\\s*" +
        "(\\d{1,3})\\%\\s*\\)\\s*$");

    @Override
    protected Pattern getPattern() {
      return HSL_PATTERN;
    }

    @Override
    protected Color createColor(Matcher matcher, double a) {
      double h = Double.parseDouble(matcher.group(1)) / 360;
      double s = Double.parseDouble(matcher.group(2)) / 100;
      double l = Double.parseDouble(matcher.group(3)) / 100;
      double r, g, b;

      if (s == 0) {
        r = l;
        g = r;
        b = r;
      } else {
        double luminocity2 = (l < 0.5) ? l * (1 + s) : l + s - l * s;
        double luminocity1 = 2 * l - luminocity2;
        r = hueToRgb(luminocity1, luminocity2, h + 1.0 / 3.0);
        g = hueToRgb(luminocity1, luminocity2, h);
        b = hueToRgb(luminocity1, luminocity2, h - 1.0 / 3.0);
      }

      return new Color((short) Math.round(r * 255),
          (short) Math.round(g * 255),
          (short) Math.round(b * 255),
          a);
    }

    private double hueToRgb(double luminocity1, double luminocity2, double hue) {
      if (hue < 0.0) hue += 1;
      if (hue > 1.0) hue -= 1;
      if (hue < 1.0 / 6.0) return (luminocity1 + (luminocity2 - luminocity1) * 6.0 * hue);
      if (hue < 1.0 / 2.0) return luminocity2;
      if (hue < 2.0 / 3.0) return (luminocity1 + (luminocity2 - luminocity1) * ((2.0 / 3.0) - hue) * 6.0);
      return luminocity1;
    }

  }

  private static class HslaConverter extends HslConverter {
    private static final Pattern HSLA_PATTERN = Pattern.compile("^\\s*hsla\\(\\s*" +
        "(\\d{1,3})\\s*,\\s*" +
        "(\\d{1,3})\\%\\s*,\\s*" +
        "(\\d{1,3})\\%\\s*,\\s*" +
        "(0|1|0\\.\\d+)\\s*\\)\\s*$");

    @Override
    protected Pattern getPattern() {
      return HSLA_PATTERN;
    }

  }

  private static class NamedColorConverter extends Converter {
    @Override
    public Color getColor(String value) {
      return Colors.valueOf(value.toUpperCase()).getColorValue();
    }

    @Override
    public Pattern getPattern() {
      throw new UnsupportedOperationException("getPattern is unsupported");
    }
  }

}
