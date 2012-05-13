package org.openqa.selenium.chrome;

import org.openqa.selenium.WebDriverException;

public class FatalChromeException extends WebDriverException {

  FatalChromeException(Throwable cause) {
    super("The chromedriver server has unexpectedly died!", cause);
  }
}
