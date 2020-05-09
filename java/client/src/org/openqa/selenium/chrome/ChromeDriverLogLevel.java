package org.openqa.selenium.chrome;

import com.google.common.collect.ImmutableMap;

import java.util.Map;
import java.util.logging.Level;

/**
 * <a href="https://source.chromium.org/chromium/chromium/src/+/master:chrome/test/chromedriver/logging.cc">
 *   Log levels</a> defined by ChromeDriver
 */
public enum ChromeDriverLogLevel {
  ALL,
  INFO,
  DEBUG,
  WARNING,
  SEVERE,
  OFF;

  private static final Map<Level, ChromeDriverLogLevel> logLevelToChromeLevelMap
    = new ImmutableMap.Builder<Level, ChromeDriverLogLevel>()
    .put(Level.ALL, ALL)
    .put(Level.FINEST, DEBUG)
    .put(Level.FINER, DEBUG)
    .put(Level.FINE, DEBUG)
    .put(Level.INFO, INFO)
    .put(Level.WARNING, WARNING)
    .put(Level.SEVERE, SEVERE)
    .put(Level.OFF, OFF)
    .build();

  @Override
  public String toString() {
    return super.toString().toLowerCase();
  }

  public static ChromeDriverLogLevel fromString(String text) {
    if (text != null) {
      for (ChromeDriverLogLevel b : ChromeDriverLogLevel.values()) {
        if (text.equalsIgnoreCase(b.toString())) {
          return b;
        }
      }
    }
    return null;
  }

  public static ChromeDriverLogLevel fromLevel(Level level) {
    return logLevelToChromeLevelMap.getOrDefault(level, ALL);
  }
}
