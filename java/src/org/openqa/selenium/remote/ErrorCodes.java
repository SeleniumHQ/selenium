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

import static java.net.HttpURLConnection.HTTP_INTERNAL_ERROR;

import java.util.Collection;
import java.util.Comparator;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.logging.Logger;
import java.util.stream.Collectors;
import org.openqa.selenium.ElementClickInterceptedException;
import org.openqa.selenium.ElementNotInteractableException;
import org.openqa.selenium.InvalidArgumentException;
import org.openqa.selenium.InvalidCookieDomainException;
import org.openqa.selenium.InvalidElementStateException;
import org.openqa.selenium.InvalidSelectorException;
import org.openqa.selenium.JavascriptException;
import org.openqa.selenium.NoAlertPresentException;
import org.openqa.selenium.NoSuchCookieException;
import org.openqa.selenium.NoSuchElementException;
import org.openqa.selenium.NoSuchFrameException;
import org.openqa.selenium.NoSuchSessionException;
import org.openqa.selenium.NoSuchShadowRootException;
import org.openqa.selenium.NoSuchWindowException;
import org.openqa.selenium.ScriptTimeoutException;
import org.openqa.selenium.SessionNotCreatedException;
import org.openqa.selenium.StaleElementReferenceException;
import org.openqa.selenium.TimeoutException;
import org.openqa.selenium.UnableToSetCookieException;
import org.openqa.selenium.UnhandledAlertException;
import org.openqa.selenium.UnsupportedCommandException;
import org.openqa.selenium.WebDriverException;
import org.openqa.selenium.interactions.MoveTargetOutOfBoundsException;

/** Defines common error codes for the wire protocol. */
@Deprecated(forRemoval = true)
public class ErrorCodes {

  public static final String SUCCESS_STRING = "success";
  public static final int SUCCESS = 0;
  public static final int NO_SUCH_SESSION = 6;
  public static final int NO_SUCH_ELEMENT = 7;
  public static final int NO_SUCH_FRAME = 8;
  public static final int UNKNOWN_COMMAND = 9;
  public static final int STALE_ELEMENT_REFERENCE = 10;
  public static final int INVALID_ELEMENT_STATE = 12;
  public static final int UNHANDLED_ERROR = 13;
  public static final int JAVASCRIPT_ERROR = 17;
  public static final int XPATH_LOOKUP_ERROR = 19;
  public static final int TIMEOUT = 21;
  public static final int NO_SUCH_WINDOW = 23;
  public static final int INVALID_COOKIE_DOMAIN = 24;
  public static final int UNABLE_TO_SET_COOKIE = 25;
  public static final int UNEXPECTED_ALERT_PRESENT = 26;
  public static final int NO_ALERT_PRESENT = 27;
  public static final int ASYNC_SCRIPT_TIMEOUT = 28;
  public static final int INVALID_SELECTOR_ERROR = 32;
  public static final int SESSION_NOT_CREATED = 33;
  public static final int MOVE_TARGET_OUT_OF_BOUNDS = 34;
  public static final int INVALID_XPATH_SELECTOR = 51;
  public static final int INVALID_XPATH_SELECTOR_RETURN_TYPER = 52;

  // json wire protocol doesn't have analogous status codes for
  // these new W3C status response 'codes', so making some up!
  public static final int ELEMENT_NOT_INTERACTABLE = 60;
  public static final int INVALID_ARGUMENT = 61;
  public static final int NO_SUCH_COOKIE = 62;
  public static final int UNABLE_TO_CAPTURE_SCREEN = 63;
  public static final int ELEMENT_CLICK_INTERCEPTED = 64;
  public static final int NO_SUCH_SHADOW_ROOT = 65;

  // The following error codes are derived straight from HTTP return codes.
  public static final int METHOD_NOT_ALLOWED = 405;

  private static final Logger LOG = Logger.getLogger(ErrorCodes.class.getName());
  // Every row on this table should be self-explanatory, except for the two booleans at the end.
  // The first of these is "isCanonicalJsonCodeForException". This means that when doing the mapping
  // for a JSON Wire Protocol status code, this KnownError provides the exception that should be
  // thrown. The second boolean is "isCanonicalForW3C". This means that when mapping a state or
  // exception to a W3C state, this KnownError provides the default exception and Json Wire Protocol
  // status to send.
  private static final Set<KnownError> KNOWN_ERRORS =
      Set.of(
          new KnownError(
              ASYNC_SCRIPT_TIMEOUT,
              "script timeout",
              500,
              ScriptTimeoutException.class,
              true,
              true),
          new KnownError(
              ELEMENT_CLICK_INTERCEPTED,
              "element click intercepted",
              400,
              ElementClickInterceptedException.class,
              true,
              true),
          new KnownError(
              ELEMENT_NOT_INTERACTABLE,
              "element not interactable",
              400,
              ElementNotInteractableException.class,
              true,
              true),
          new KnownError(
              INVALID_ARGUMENT,
              "invalid argument",
              400,
              InvalidArgumentException.class,
              true,
              true),
          new KnownError(
              INVALID_COOKIE_DOMAIN,
              "invalid cookie domain",
              400,
              InvalidCookieDomainException.class,
              true,
              true),
          new KnownError(
              INVALID_ELEMENT_STATE,
              "invalid element state",
              400,
              InvalidElementStateException.class,
              true,
              true),
          new KnownError(
              INVALID_SELECTOR_ERROR,
              "invalid selector",
              400,
              InvalidSelectorException.class,
              true,
              true),
          new KnownError(
              INVALID_XPATH_SELECTOR,
              "invalid selector",
              400,
              InvalidSelectorException.class,
              false,
              false),
          new KnownError(
              INVALID_XPATH_SELECTOR_RETURN_TYPER,
              "invalid selector",
              400,
              InvalidSelectorException.class,
              false,
              true),
          new KnownError(
              JAVASCRIPT_ERROR, "javascript error", 500, JavascriptException.class, true, true),
          new KnownError(
              METHOD_NOT_ALLOWED,
              "unknown method",
              405,
              UnsupportedCommandException.class,
              false,
              false),
          new KnownError(
              METHOD_NOT_ALLOWED,
              "unsupported operation",
              500,
              UnsupportedCommandException.class,
              false,
              true),
          new KnownError(
              MOVE_TARGET_OUT_OF_BOUNDS,
              "move target out of bounds",
              500,
              MoveTargetOutOfBoundsException.class,
              true,
              true),
          new KnownError(
              NO_ALERT_PRESENT, "no such alert", 404, NoAlertPresentException.class, true, true),
          new KnownError(
              NO_SUCH_COOKIE, "no such cookie", 404, NoSuchCookieException.class, true, true),
          new KnownError(
              NO_SUCH_ELEMENT, "no such element", 404, NoSuchElementException.class, true, true),
          new KnownError(
              NO_SUCH_FRAME, "no such frame", 404, NoSuchFrameException.class, true, true),
          new KnownError(
              NO_SUCH_SESSION, "invalid session id", 404, NoSuchSessionException.class, true, true),
          new KnownError(
              NO_SUCH_SHADOW_ROOT,
              "no such shadow root",
              404,
              NoSuchShadowRootException.class,
              true,
              true),
          new KnownError(
              NO_SUCH_WINDOW, "no such window", 404, NoSuchWindowException.class, true, true),
          new KnownError(
              SESSION_NOT_CREATED,
              "session not created",
              500,
              SessionNotCreatedException.class,
              true,
              true),
          new KnownError(
              STALE_ELEMENT_REFERENCE,
              "stale element reference",
              404,
              StaleElementReferenceException.class,
              true,
              true),
          new KnownError(TIMEOUT, "timeout", 500, TimeoutException.class, true, true),
          new KnownError(
              XPATH_LOOKUP_ERROR,
              "invalid selector",
              400,
              InvalidSelectorException.class,
              false,
              false),
          new KnownError(
              UNABLE_TO_CAPTURE_SCREEN,
              "unable to capture screen",
              500,
              ScreenshotException.class,
              true,
              true),
          new KnownError(
              UNABLE_TO_SET_COOKIE,
              "unable to set cookie",
              500,
              UnableToSetCookieException.class,
              true,
              true),
          new KnownError(
              UNEXPECTED_ALERT_PRESENT,
              "unexpected alert open",
              500,
              UnhandledAlertException.class,
              true,
              true),
          new KnownError(
              UNHANDLED_ERROR, "unknown error", 500, WebDriverException.class, true, true),
          new KnownError(
              UNKNOWN_COMMAND,
              "unknown command",
              404,
              UnsupportedCommandException.class,
              true,
              true));

  static {
    {
      // Validate uniqueness constraints.
      //
      // There should be only one canonical JSON Wire protocol code per exception
      Map<Object, Set<KnownError>> matched = new HashMap<>();
      for (KnownError knownError : KNOWN_ERRORS) {
        matched.computeIfAbsent(knownError, key -> new HashSet<>()).add(knownError);
      }
      for (Set<KnownError> errors : matched.values()) {
        if (errors.size() != 1) {
          throw new RuntimeException("Duplicate canonical exceptions: " + errors);
        }
      }

      // There should only be one canonical W3C code to JSON Wire Protocol code
      //    matched = new HashMap<>();
      //    for (KnownError error : KNOWN_ERRORS) {
      //      matched.computeIfAbsent(error.getW3cCode(), key -> new HashSet<>()).add(error);
      //    }
      //    for (Set<KnownError> errors : matched.values()) {
      //      if (errors.size() != 1) {
      //        throw new RuntimeException("Duplicate canonical w3c state codes: " + errors);
      //      }
      //    }
    }
  }

  public String toState(Integer status) {
    if (status == null) {
      return toState(UNHANDLED_ERROR);
    }

    if (SUCCESS == status) {
      return SUCCESS_STRING;
    }

    Set<String> possibleMatches =
        KNOWN_ERRORS.stream()
            .filter(knownError -> knownError.getJsonCode() == status)
            .filter(KnownError::isCanonicalForW3C)
            .map(KnownError::getW3cCode)
            .collect(Collectors.toSet());

    return onlyElement(possibleMatches, "unhandled error");
  }

  public int toStatus(String webdriverState, Optional<Integer> httpStatus) {
    if (SUCCESS_STRING.equals(webdriverState)) {
      return 0;
    }

    List<KnownError> possibleMatches =
        KNOWN_ERRORS.stream()
            .filter(knownError -> knownError.getW3cCode().equals(webdriverState))
            .filter(KnownError::isCanonicalForW3C)
            .sorted(Comparator.comparingInt(KnownError::getJsonCode))
            .collect(Collectors.toList());

    if (possibleMatches.isEmpty()) {
      return UNHANDLED_ERROR;
    }
    KnownError error = possibleMatches.get(0);
    if (httpStatus.isPresent() && httpStatus.get() != error.getW3cHttpStatus()) {
      LOG.info(
          String.format(
              "HTTP Status: '%d' -> incorrect JSON status mapping for '%s' (%d expected)",
              httpStatus.get(), webdriverState, error.getW3cHttpStatus()));
    }
    return error.getJsonCode();
  }

  public int getHttpStatusCode(Throwable throwable) {
    return KNOWN_ERRORS.stream()
        .filter(error -> error.getException().isAssignableFrom(throwable.getClass()))
        .filter(KnownError::isCanonicalForW3C)
        .map(KnownError::getW3cHttpStatus)
        .findAny()
        .orElse(HTTP_INTERNAL_ERROR);
  }

  /**
   * Returns the exception type that corresponds to the given {@code statusCode}. All unrecognized
   * status codes will be mapped to {@link WebDriverException WebDriverException.class}.
   *
   * @param statusCode The status code to convert.
   * @return The exception type that corresponds to the provided status code or {@code null} if
   *     {@code statusCode == 0}.
   */
  public Class<? extends WebDriverException> getExceptionType(int statusCode) {
    if (SUCCESS == statusCode) {
      return null;
    }

    // We know that the tuple of (status code, exception) is distinct.
    Set<Class<? extends WebDriverException>> allPossibleExceptions =
        KNOWN_ERRORS.stream()
            .filter(knownError -> knownError.getJsonCode() == statusCode)
            .map(KnownError::getException)
            .collect(Collectors.toSet());

    return onlyElement(allPossibleExceptions, WebDriverException.class);
  }

  public Class<? extends WebDriverException> getExceptionType(String webdriverState) {
    Set<Class<? extends WebDriverException>> possibleMatches =
        KNOWN_ERRORS.stream()
            .filter(knownError -> knownError.getW3cCode().equals(webdriverState))
            .filter(KnownError::isCanonicalForW3C)
            .map(KnownError::getException)
            .collect(Collectors.toSet());

    return onlyElement(possibleMatches, WebDriverException.class);
  }

  public int toStatusCode(Throwable e) {
    if (e == null) {
      return SUCCESS;
    }

    Set<Integer> possibleMatches =
        KNOWN_ERRORS.stream()
            .filter(knownError -> knownError.getException().equals(e.getClass()))
            .filter(knownError -> knownError.isCanonicalJsonCodeForException)
            .map(KnownError::getJsonCode)
            .collect(Collectors.toSet());

    return onlyElement(possibleMatches, UNHANDLED_ERROR);
  }

  public boolean isMappableError(Throwable rootCause) {
    if (rootCause == null) {
      return false;
    }
    Set<KnownError> possibleMatches =
        KNOWN_ERRORS.stream()
            .filter(knownError -> knownError.getException().equals(rootCause.getClass()))
            .collect(Collectors.toSet());

    return !possibleMatches.isEmpty();
  }

  private static <V> V onlyElement(Collection<V> values, V fallback) {
    switch (values.size()) {
      case 0:
        return fallback;
      case 1:
        return values.iterator().next();
      default:
        throw new IllegalArgumentException("expected one value, found: " + values);
    }
  }

  private static class KnownError {
    private final int jsonCode;
    private final String w3cCode;
    private final int w3cHttpStatus;
    private final Class<? extends WebDriverException> exception;
    private final boolean isCanonicalJsonCodeForException;
    private final boolean isCanonicalForW3C;

    public KnownError(
        int jsonCode,
        String w3cCode,
        int w3cHttpStatus,
        Class<? extends WebDriverException> exception,
        boolean isCanonicalJsonCodeForException,
        boolean isCanonicalForW3C) {
      this.jsonCode = jsonCode;
      this.w3cCode = w3cCode;
      this.w3cHttpStatus = w3cHttpStatus;
      this.exception = exception;
      this.isCanonicalJsonCodeForException = isCanonicalJsonCodeForException;
      this.isCanonicalForW3C = isCanonicalForW3C;
    }

    public int getJsonCode() {
      return jsonCode;
    }

    public String getW3cCode() {
      return w3cCode;
    }

    public int getW3cHttpStatus() {
      return w3cHttpStatus;
    }

    public Class<? extends WebDriverException> getException() {
      return exception;
    }

    public boolean isCanonicalForW3C() {
      return isCanonicalForW3C;
    }
  }
}
