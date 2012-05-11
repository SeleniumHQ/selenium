package org.openqa.selenium;

/**
 * Thrown when a command does not complete in enough time.
 */
public class TimeoutException extends WebDriverException {

  private static final long serialVersionUID = -8455508423410370890L;

  public TimeoutException() {
  }

  public TimeoutException(String message) {
    super(message);
  }

  public TimeoutException(Throwable cause) {
    super(cause);
  }

  public TimeoutException(String message, Throwable cause) {
    super(message, cause);
  }
}
