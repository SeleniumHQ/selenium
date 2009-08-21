package org.openqa.selenium.chrome;

import org.openqa.selenium.WebDriverException;

public class FatalChromeException extends WebDriverException {
  public FatalChromeException(String message) {
    super(message);
  }
}
