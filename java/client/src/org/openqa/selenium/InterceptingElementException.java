package org.openqa.selenium;

/**
 * Created by James Reed on 11/04/2016.
 * Thrown to indicate that a click was attempted on an element but was intercepted by another
 * element on top of it
 */
public class InterceptingElementException extends InvalidElementStateException {

  public InterceptingElementException(String message) {
    super(message);
  }

  public InterceptingElementException(String message, Throwable cause) {
    super(message, cause);
  }

}
