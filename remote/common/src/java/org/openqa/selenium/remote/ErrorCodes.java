package org.openqa.selenium.remote;

import org.openqa.selenium.ElementNotVisibleException;
import org.openqa.selenium.InvalidCookieDomainException;
import org.openqa.selenium.NoSuchElementException;
import org.openqa.selenium.NoSuchFrameException;
import org.openqa.selenium.NoSuchWindowException;
import org.openqa.selenium.StaleElementReferenceException;
import org.openqa.selenium.UnableToSetCookieException;
import org.openqa.selenium.WebDriverException;
import org.openqa.selenium.XPathLookupException;

/**
 * Defines common error codes for the wire protocol.
 *
 * @author jmleyba@gmail.com (Jason Leyba)
 */
public class ErrorCodes {

  // These codes were all pulled from ChromeCommandExecutor and seem all over the place.
  // TODO(jmleyba): Clean up error codes?

  public static final int SUCCESS = 0;
  public static final int NO_SUCH_ELEMENT = 7;
  public static final int NO_SUCH_FRAME = 8;
  public static final int UNKNOWN_COMMAND = 9;
  public static final int STALE_ELEMENT_REFERENCE = 10;
  public static final int ELEMENT_NOT_VISIBLE = 11;
  public static final int INVALID_ELEMENT_STATE = 12;
  public static final int UNHANDLED_ERROR = 13;
  public static final int ELEMENT_NOT_SELECTABLE = 15;
  public static final int XPATH_LOOKUP_ERROR = 19;
  public static final int NO_SUCH_WINDOW = 23;
  public static final int INVALID_COOKIE_DOMAIN = 24;
  public static final int UNABLE_TO_SET_COOKIE = 25;

  // The following error codes are derived straight from HTTP return codes.
  public static final int METHOD_NOT_ALLOWED = 405;

  /**
   * Returns the exception type that corresponds to the given
   * {@code statusCode}. All unrecognized status codes will be mapped to
   * {@link WebDriverException WebDriverException.class}.
   *
   * @param statusCode The status code to convert.
   * @return The exception type that corresponds to the provided status code or
   *     {@code null} if {@code statusCode == 0}.
   */
  public Class<? extends RuntimeException> getExceptionType(int statusCode) {
    switch (statusCode) {
      case SUCCESS:
        return null;
      case INVALID_COOKIE_DOMAIN:
        return InvalidCookieDomainException.class;
      case UNABLE_TO_SET_COOKIE:
        return UnableToSetCookieException.class;
      case NO_SUCH_WINDOW:
        return NoSuchWindowException.class;
      case NO_SUCH_ELEMENT:
        return NoSuchElementException.class;
      case NO_SUCH_FRAME:
        return NoSuchFrameException.class;
      case UNKNOWN_COMMAND:
      case METHOD_NOT_ALLOWED:
        return UnsupportedOperationException.class;
      case STALE_ELEMENT_REFERENCE:
        return StaleElementReferenceException.class;
      case ELEMENT_NOT_VISIBLE:
        return ElementNotVisibleException.class;
      case ELEMENT_NOT_SELECTABLE:
      case INVALID_ELEMENT_STATE:
        // TODO: There should be a more specific exception here.
        return UnsupportedOperationException.class;
      case XPATH_LOOKUP_ERROR:
        return XPathLookupException.class;
      default:
        return WebDriverException.class;
    }
  }

  /**
   * Converts a thrown error into the corresponding status code.
   *
   * @param thrown The thrown error.
   * @return The corresponding status code for the given thrown error.
   */
  public int toStatusCode(Throwable thrown) {
    if (thrown == null) {
      return SUCCESS; 
    } else if (thrown instanceof InvalidCookieDomainException) {
      return INVALID_COOKIE_DOMAIN;
    } else if (thrown instanceof UnableToSetCookieException) {
      return UNABLE_TO_SET_COOKIE;
    } else if (thrown instanceof NoSuchWindowException) {
      return NO_SUCH_WINDOW;
    } else if (thrown instanceof NoSuchElementException) {
      return NO_SUCH_ELEMENT;
    } else if (thrown instanceof NoSuchFrameException) {
      return NO_SUCH_FRAME;
    } else if (thrown instanceof StaleElementReferenceException) {
      return STALE_ELEMENT_REFERENCE;
    } else if (thrown instanceof ElementNotVisibleException) {
      return ELEMENT_NOT_VISIBLE;
    } else if (thrown instanceof UnsupportedOperationException) {
      return INVALID_ELEMENT_STATE;
    } else if (thrown instanceof XPathLookupException) {
      return XPATH_LOOKUP_ERROR;
    } else {
      return UNHANDLED_ERROR;
    }
  }
}
