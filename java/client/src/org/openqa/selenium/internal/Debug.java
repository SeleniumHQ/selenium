package org.openqa.selenium.internal;

import java.lang.management.ManagementFactory;
import java.util.logging.Level;

/**
 * Used to provide information about whether or not Selenium is running
 * under debug mode.
 */
public class Debug {

  private static final boolean IS_DEBUG;
  static {
    IS_DEBUG = Boolean.getBoolean("selenium.webdriver.verbose") ||
      // Thanks https://stackoverflow.com/a/6865049
      ManagementFactory.getRuntimeMXBean().getInputArguments().toString().contains("-agentlib:jdwp");
  }

  private Debug() {
    // Utility class
  }

  public static boolean isDebugging() {
    return IS_DEBUG;
  }

  public static Level getDebugLogLevel() {
    return isDebugging() ? Level.INFO : Level.FINE;
  }
}
