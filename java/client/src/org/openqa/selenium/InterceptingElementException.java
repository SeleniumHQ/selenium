package org.openqa.selenium;

/**
 * Thrown to indicate that a click was attempted on an element but was intercepted by another
 * element on top of it
 */
public class InterceptingElementException extends ElementNotInteractableException {

  public InterceptingElementException(String message) {
    super(message);
  }

  public InterceptingElementException(String message, Throwable cause) {
    super(message, cause);
  }

}
