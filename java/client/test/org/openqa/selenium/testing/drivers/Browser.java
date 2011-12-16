

package org.openqa.selenium.testing.drivers;

import java.util.logging.Logger;

public enum Browser {
  android,
  chrome,
  ff,
  htmlunit,
  htmlunit_js,
  ie,
  ipad,
  iphone,
  opera,
  safari;

  private static final Browser DEFAULT_BROWSER = ff;
  private static final Logger log = Logger.getLogger(Browser.class.getName());

  public static Browser detect() {
    String browserName = System.getProperty("selenium.browser");
    if (browserName == null) {
      log.info("No browser detected, returning " + DEFAULT_BROWSER);
      return null;
    }

    try {
      return Browser.valueOf(browserName);
    } catch (IllegalArgumentException e) {
      log.severe("Cannot locate matching browser for: " + browserName);
      return null;
    }
  }
}
