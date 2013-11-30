package org.openqa.selenium.safari;

import org.openqa.selenium.WebDriverException;

/**
 * Exception thrown when the connection to the SafariDriver is lost.
 */
public class ConnectionClosedException extends WebDriverException {

  public ConnectionClosedException(String message) {
    super(message);
  }
}
