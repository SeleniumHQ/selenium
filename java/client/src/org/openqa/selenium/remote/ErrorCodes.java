// Licensed to the Software Freedom Conservancy (SFC) under one
// or more contributor license agreements.  See the NOTICE file
// distributed with this work for additional information
// regarding copyright ownership.  The SFC licenses this file
// to you under the Apache License, Version 2.0 (the
// "License"); you may not use this file except in compliance
// with the License.  You may obtain a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing,
// software distributed under the License is distributed on an
// "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
// KIND, either express or implied.  See the License for the
// specific language governing permissions and limitations
// under the License.


package org.openqa.selenium.remote;

import com.google.common.collect.ImmutableMap;
import org.openqa.selenium.Beta;
import org.openqa.selenium.ElementNotVisibleException;
import org.openqa.selenium.ImeActivationFailedException;
import org.openqa.selenium.ImeNotAvailableException;
import org.openqa.selenium.InvalidCookieDomainException;
import org.openqa.selenium.InvalidElementStateException;
import org.openqa.selenium.InvalidSelectorException;
import org.openqa.selenium.NoAlertPresentException;
import org.openqa.selenium.NoSuchElementException;
import org.openqa.selenium.NoSuchFrameException;
import org.openqa.selenium.NoSuchSessionException;
import org.openqa.selenium.NoSuchWindowException;
import org.openqa.selenium.SessionNotCreatedException;
import org.openqa.selenium.StaleElementReferenceException;
import org.openqa.selenium.TimeoutException;
import org.openqa.selenium.UnableToSetCookieException;
import org.openqa.selenium.UnhandledAlertException;
import org.openqa.selenium.UnsupportedCommandException;
import org.openqa.selenium.WebDriverException;
import org.openqa.selenium.interactions.InvalidCoordinatesException;
import org.openqa.selenium.interactions.MoveTargetOutOfBoundsException;

import java.util.Map;

/**
 * Defines common error codes for the wire protocol.
 *
 * @author jmleyba@gmail.com (Jason Leyba)
 */
public class ErrorCodes {

  // These codes were all pulled from ChromeCommandExecutor and seem all over the place.
  // TODO(jmleyba): Clean up error codes?

  @Beta
  public static final String SUCCESS_STRING = "success";
  public static final int SUCCESS = 0;
  public static final int NO_SUCH_SESSION = 6;
  public static final int NO_SUCH_ELEMENT = 7;
  public static final int NO_SUCH_FRAME = 8;
  public static final int UNKNOWN_COMMAND = 9;
  public static final int STALE_ELEMENT_REFERENCE = 10;
  public static final int ELEMENT_NOT_VISIBLE = 11;
  public static final int INVALID_ELEMENT_STATE = 12;
  public static final int UNHANDLED_ERROR = 13;
  public static final int ELEMENT_NOT_SELECTABLE = 15;
  public static final int JAVASCRIPT_ERROR = 17;
  public static final int XPATH_LOOKUP_ERROR = 19;
  public static final int TIMEOUT = 21;
  public static final int NO_SUCH_WINDOW = 23;
  public static final int INVALID_COOKIE_DOMAIN = 24;
  public static final int UNABLE_TO_SET_COOKIE = 25;
  public static final int UNEXPECTED_ALERT_PRESENT = 26;
  public static final int NO_ALERT_PRESENT = 27;
  public static final int ASYNC_SCRIPT_TIMEOUT = 28;
  public static final int INVALID_ELEMENT_COORDINATES = 29;
  public static final int IME_NOT_AVAILABLE = 30;
  public static final int IME_ENGINE_ACTIVATION_FAILED = 31;
  public static final int INVALID_SELECTOR_ERROR = 32;
  public static final int SESSION_NOT_CREATED = 33;
  public static final int MOVE_TARGET_OUT_OF_BOUNDS = 34;
  public static final int INVALID_XPATH_SELECTOR = 51;
  public static final int INVALID_XPATH_SELECTOR_RETURN_TYPER = 52;
  // The following error codes are derived straight from HTTP return codes.
  public static final int METHOD_NOT_ALLOWED = 405;

  // TODO(simon): Convert the strings to constants. Sadly the constant names
  // will be the ones used by the ints now. *sigh*
  private static Map<Integer, String> statusToState = ImmutableMap.<Integer, String>builder()
      .put(ASYNC_SCRIPT_TIMEOUT, "async script timeout")
      .put(ELEMENT_NOT_SELECTABLE, "element not selectable")
      .put(ELEMENT_NOT_VISIBLE, "element not visible")
      .put(IME_ENGINE_ACTIVATION_FAILED, "ime engine activation failed")
      .put(IME_NOT_AVAILABLE, "ime not available")
      .put(INVALID_COOKIE_DOMAIN, "invalid cookie domain")
      .put(INVALID_ELEMENT_COORDINATES, "invalid element coordinates")
      .put(INVALID_ELEMENT_STATE, "invalid element state")
      .put(INVALID_SELECTOR_ERROR, "invalid selector")
      .put(INVALID_XPATH_SELECTOR, "invalid selector")
      .put(INVALID_XPATH_SELECTOR_RETURN_TYPER, "invalid selector")
      .put(JAVASCRIPT_ERROR, "javascript error")
      .put(METHOD_NOT_ALLOWED, "method not allowed")
      .put(MOVE_TARGET_OUT_OF_BOUNDS, "move target out of bounds")
      .put(NO_SUCH_ELEMENT, "no such element")
      .put(NO_SUCH_FRAME, "no such frame")
      .put(NO_SUCH_SESSION, "no such session")
      .put(NO_SUCH_WINDOW, "no such window")
      .put(SESSION_NOT_CREATED, "session not created")
      .put(STALE_ELEMENT_REFERENCE, "stale element reference")
      .put(SUCCESS, "success")
      .put(TIMEOUT, "timeout")
      .put(UNABLE_TO_SET_COOKIE, "unable to set cookie")
      .put(NO_ALERT_PRESENT, "no such alert")
      .put(UNHANDLED_ERROR, "unhandled error")
      .put(UNKNOWN_COMMAND, "unknown command")
      .put(XPATH_LOOKUP_ERROR, "invalid selector")
      .build();

  private static Map<String, Integer> stateToStatus;
  static {
    ImmutableMap.Builder<String, Integer> builder = ImmutableMap.<String, Integer>builder();
    for (Map.Entry<Integer, String> pair : statusToState.entrySet()) {
      // Ignore duplicate "invalid selector" codes
      if (! pair.getValue().equals("invalid selector") || pair.getKey() == INVALID_SELECTOR_ERROR) {
        builder.put(pair.getValue(), pair.getKey());
      }
    }
    builder.put("invalid session id", NO_SUCH_SESSION); // for W3C compatibility
    stateToStatus = builder.build();
  }

  /**
   * Returns the exception type that corresponds to the given {@code statusCode}. All unrecognized
   * status codes will be mapped to {@link WebDriverException WebDriverException.class}.
   *
   * @param statusCode The status code to convert.
   * @return The exception type that corresponds to the provided status code or {@code null} if
   *         {@code statusCode == 0}.
   */
  public Class<? extends WebDriverException> getExceptionType(int statusCode) {
    switch (statusCode) {
      case SUCCESS:
        return null;
      case NO_SUCH_SESSION:
        return NoSuchSessionException.class;
      case INVALID_COOKIE_DOMAIN:
        return InvalidCookieDomainException.class;
      case UNABLE_TO_SET_COOKIE:
        return UnableToSetCookieException.class;
      case NO_SUCH_WINDOW:
        return NoSuchWindowException.class;
      case NO_SUCH_ELEMENT:
        return NoSuchElementException.class;
      case INVALID_SELECTOR_ERROR:
      case INVALID_XPATH_SELECTOR:
      case INVALID_XPATH_SELECTOR_RETURN_TYPER:
      case XPATH_LOOKUP_ERROR:
        return InvalidSelectorException.class;
      case MOVE_TARGET_OUT_OF_BOUNDS:
        return MoveTargetOutOfBoundsException.class;
      case NO_SUCH_FRAME:
        return NoSuchFrameException.class;
      case UNKNOWN_COMMAND:
      case METHOD_NOT_ALLOWED:
        return UnsupportedCommandException.class;
      case STALE_ELEMENT_REFERENCE:
        return StaleElementReferenceException.class;
      case ELEMENT_NOT_VISIBLE:
        return ElementNotVisibleException.class;
      case ELEMENT_NOT_SELECTABLE:
      case INVALID_ELEMENT_STATE:
        return InvalidElementStateException.class;
      case ASYNC_SCRIPT_TIMEOUT:
      case TIMEOUT:
        return TimeoutException.class;
      case INVALID_ELEMENT_COORDINATES:
        return InvalidCoordinatesException.class;
      case IME_NOT_AVAILABLE:
        return ImeNotAvailableException.class;
      case IME_ENGINE_ACTIVATION_FAILED:
        return ImeActivationFailedException.class;
      case NO_ALERT_PRESENT:
        return NoAlertPresentException.class;
      case SESSION_NOT_CREATED:
        return SessionNotCreatedException.class;
      case UNEXPECTED_ALERT_PRESENT:
        return UnhandledAlertException.class;
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
    } else if (thrown instanceof TimeoutException) {
      return ASYNC_SCRIPT_TIMEOUT;
    } else if (thrown instanceof ElementNotVisibleException) {
      return ELEMENT_NOT_VISIBLE;
    } else if (thrown instanceof InvalidCookieDomainException) {
      return INVALID_COOKIE_DOMAIN;
    } else if (thrown instanceof InvalidCoordinatesException) {
      return INVALID_ELEMENT_COORDINATES;
    } else if (thrown instanceof InvalidElementStateException) {
      return INVALID_ELEMENT_STATE;
    } else if (thrown instanceof InvalidSelectorException) {
      return INVALID_SELECTOR_ERROR;
    } else if (thrown instanceof ImeNotAvailableException) {
      return IME_NOT_AVAILABLE;
    } else if (thrown instanceof ImeActivationFailedException) {
      return IME_ENGINE_ACTIVATION_FAILED;
    } else if (thrown instanceof NoAlertPresentException) {
      return NO_ALERT_PRESENT;
    } else if (thrown instanceof NoSuchElementException) {
      return NO_SUCH_ELEMENT;
    } else if (thrown instanceof NoSuchFrameException) {
      return NO_SUCH_FRAME;
    } else if (thrown instanceof NoSuchWindowException) {
      return NO_SUCH_WINDOW;
    } else if (thrown instanceof MoveTargetOutOfBoundsException) {
      return MOVE_TARGET_OUT_OF_BOUNDS;
    } else if (thrown instanceof SessionNotCreatedException) {
      return SESSION_NOT_CREATED;
    } else if (thrown instanceof StaleElementReferenceException) {
      return STALE_ELEMENT_REFERENCE;
    } else if (thrown instanceof UnableToSetCookieException) {
      return UNABLE_TO_SET_COOKIE;
    } else if (thrown instanceof UnhandledAlertException) {
      return UNEXPECTED_ALERT_PRESENT;
    } else {
      return UNHANDLED_ERROR;
    }
  }

  /**
   * Tests if the {@code thrown} error can be mapped to one of WebDriver's well defined error codes.
   *
   * @param thrown The error to test.
   * @return Whether the error can be mapped to a status code.
   */
  public boolean isMappableError(Throwable thrown) {
    int statusCode = toStatusCode(thrown);
    return statusCode != SUCCESS && statusCode != UNHANDLED_ERROR;
  }

  public static String toState(Integer status) {
    return statusToState.get(status);
  }

  public static int toStatus(String state) {
    Integer status = stateToStatus.get(state);
    return status != null ? status : UNHANDLED_ERROR;
  }
}
