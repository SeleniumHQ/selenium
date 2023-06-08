package org.openqa.selenium.firefox;

import static org.assertj.core.api.Assumptions.assumeThat;

public class FirefoxAssumptions {

  public static void assumeDefaultBrowserLocationUsed() {
    assumeThat(System.getProperty("webdriver.firefox.bin")).isNull();
  }
}
