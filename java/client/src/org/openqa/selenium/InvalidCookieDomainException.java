package org.openqa.selenium;

/**
 * Thrown when attempting to add a cookie under a different domain than the current URL.
 * 
 * @see org.openqa.selenium.WebDriver.Options#addCookie(Cookie)
 */
public class InvalidCookieDomainException extends WebDriverException {

  private static final long serialVersionUID = 4510066184462771609L;

  public InvalidCookieDomainException() {
  }

  public InvalidCookieDomainException(String message) {
    super(message);
  }

  public InvalidCookieDomainException(Throwable cause) {
    super(cause);
  }

  public InvalidCookieDomainException(String message, Throwable cause) {
    super(message, cause);
  }
}
