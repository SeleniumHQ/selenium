package org.openqa.selenium.support;

import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class Color {
  private final short red;
  private final short green;
  private final short blue;

  private static final Converter[] CONVERTERS = { new RgbConverter(), new HexConverter() };

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

  private Color(short red, short green, short blue) {
    this.red = red;
    this.green = green;
    this.blue = blue;
  }

  public String asRgb() {
    return String.format("rgb(%d, %d, %d)", red, green, blue);
  }

  public String asHex() {
    return String.format("#%02x%02x%02x", red, green, blue);
  }

  private static abstract class Converter {
    public Color getColor(String value) {
      Matcher matcher = getPattern().matcher(value);
      if (matcher.find()) {
        return new Color(
          fromMatchGroup(matcher, 1),
          fromMatchGroup(matcher, 2),
          fromMatchGroup(matcher, 3));
      }
      return null;
    }

    private short fromMatchGroup(Matcher matcher, int index) {
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
}
