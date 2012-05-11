package org.openqa.selenium.chrome;

import org.openqa.selenium.WebDriverException;

public class FatalChromeException extends WebDriverException {

  private static final long serialVersionUID = -4792715534897222758L;

  FatalChromeException(Throwable cause) {
    super("The chromedriver server has unexpectedly died!", cause);
  }
}
