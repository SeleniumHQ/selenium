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

import com.google.common.base.Preconditions;
import com.google.common.collect.ComparisonChain;
import com.google.common.collect.ImmutableMap;
import com.google.common.collect.ImmutableSet;
import com.google.common.collect.ImmutableSortedSet;
import com.google.common.collect.Iterables;

import org.openqa.selenium.Beta;
import org.openqa.selenium.ElementNotInteractableException;
import org.openqa.selenium.ElementNotSelectableException;
import org.openqa.selenium.ElementNotVisibleException;
import org.openqa.selenium.ImeActivationFailedException;
import org.openqa.selenium.ImeNotAvailableException;
import org.openqa.selenium.InvalidArgumentException;
import org.openqa.selenium.InvalidCookieDomainException;
import org.openqa.selenium.InvalidElementStateException;
import org.openqa.selenium.InvalidSelectorException;
import org.openqa.selenium.NoAlertPresentException;
import org.openqa.selenium.NoSuchCookieException;
import org.openqa.selenium.NoSuchElementException;
import org.openqa.selenium.NoSuchFrameException;
import org.openqa.selenium.NoSuchSessionException;
import org.openqa.selenium.NoSuchWindowException;
import org.openqa.selenium.ScriptTimeoutException;
import org.openqa.selenium.SessionNotCreatedException;
import org.openqa.selenium.StaleElementReferenceException;
import org.openqa.selenium.TimeoutException;
import org.openqa.selenium.UnableToSetCookieException;
import org.openqa.selenium.UnhandledAlertException;
import org.openqa.selenium.UnsupportedCommandException;
import org.openqa.selenium.WebDriverException;
import org.openqa.selenium.interactions.InvalidCoordinatesException;
import org.openqa.selenium.interactions.MoveTargetOutOfBoundsException;

import java.util.Collection;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.logging.Logger;
import java.util.stream.Collectors;

/**
 * Defines common error codes for the wire protocol.
 */
public class ErrorCodes {

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

  // json wire protocol doesn't have analogous status codes for
  // these new W3C status repsonse 'codes', so making some up!
  public static final int ELEMENT_NOT_INTERACTABLE = 60;

  // The following error codes are derived straight from HTTP return codes.
  public static final int METHOD_NOT_ALLOWED = 405;

  private static final Logger log = Logger.getLogger(ErrorCodes.class.getName());

  private static final ImmutableMap<Integer, ImmutableSet<StatusTuple>>
    ALL_CODES =
    ImmutableMap.<Integer, ImmutableSet<StatusTuple>>builder()
      .put(200,
           ImmutableSortedSet.<StatusTuple>naturalOrder()
             .add(new StatusTuple("success", SUCCESS, null))
           .build())
      .put(400,
           ImmutableSortedSet.<StatusTuple>naturalOrder()
             .add(new StatusTuple("element not selectable", ELEMENT_NOT_SELECTABLE, ElementNotSelectableException.class))
             .add(new StatusTuple("element not interactable", ELEMENT_NOT_INTERACTABLE, ElementNotInteractableException.class))
             .add(new StatusTuple("element not visible", ELEMENT_NOT_VISIBLE, ElementNotVisibleException.class))
             .add(new StatusTuple("invalid argument", UNHANDLED_ERROR, InvalidArgumentException.class))
             .add(new StatusTuple("invalid cookie domain", INVALID_COOKIE_DOMAIN, InvalidCookieDomainException.class))
             .add(new StatusTuple("invalid element coordinates", INVALID_ELEMENT_COORDINATES, InvalidCoordinatesException.class))
             .add(new StatusTuple("invalid element state", INVALID_ELEMENT_STATE, InvalidElementStateException.class))
             .add(new StatusTuple("invalid selector", INVALID_SELECTOR_ERROR, InvalidSelectorException.class, INVALID_SELECTOR_ERROR))
             .add(new StatusTuple("invalid selector", INVALID_XPATH_SELECTOR, InvalidSelectorException.class, INVALID_SELECTOR_ERROR))
             .add(new StatusTuple("invalid selector", INVALID_XPATH_SELECTOR_RETURN_TYPER, InvalidSelectorException.class, INVALID_SELECTOR_ERROR))
             .add(new StatusTuple("invalid selector", XPATH_LOOKUP_ERROR, InvalidSelectorException.class, INVALID_SELECTOR_ERROR))
             .add(new StatusTuple("no such alert", NO_ALERT_PRESENT, NoAlertPresentException.class))
             .add(new StatusTuple("no such frame", NO_SUCH_FRAME, NoSuchFrameException.class))
             .add(new StatusTuple("no such window", NO_SUCH_WINDOW, NoSuchWindowException.class))
             .add(new StatusTuple("stale element reference", STALE_ELEMENT_REFERENCE, StaleElementReferenceException.class))
             .build())
      .put(404,
           ImmutableSortedSet.<StatusTuple>naturalOrder()
             .add(new StatusTuple("invalid session id", NO_SUCH_SESSION, NoSuchSessionException.class))
             .add(new StatusTuple("no such cookie", UNHANDLED_ERROR, NoSuchCookieException.class))
             .add(new StatusTuple("no such element", NO_SUCH_ELEMENT, NoSuchElementException.class))
             .add(new StatusTuple("unknown command", UNKNOWN_COMMAND, UnsupportedCommandException.class, UNHANDLED_ERROR))
             .build())
      .put(405,
           ImmutableSortedSet.<StatusTuple>naturalOrder()
             .add(new StatusTuple("unknown method", METHOD_NOT_ALLOWED, UnsupportedCommandException.class, UNHANDLED_ERROR))
             .build())
      .put(408,
           ImmutableSortedSet.<StatusTuple>naturalOrder()
             .add(new StatusTuple("script timeout", ASYNC_SCRIPT_TIMEOUT, ScriptTimeoutException.class))
             .add(new StatusTuple("timeout", TIMEOUT, TimeoutException.class))
             .build())
  .put(500,
       ImmutableSortedSet.<StatusTuple>naturalOrder()
         .add(new StatusTuple("javascript error", JAVASCRIPT_ERROR, WebDriverException.class, UNHANDLED_ERROR))
         .add(new StatusTuple("move target out of bounds", MOVE_TARGET_OUT_OF_BOUNDS, MoveTargetOutOfBoundsException.class))
         .add(new StatusTuple("session not created", SESSION_NOT_CREATED, SessionNotCreatedException.class))
         .add(new StatusTuple("unable to set cookie", UNABLE_TO_SET_COOKIE, UnableToSetCookieException.class))
         .add(new StatusTuple("unable to capture screen", UNHANDLED_ERROR, ScreenshotException.class))
         .add(new StatusTuple("unexpected alert open", UNEXPECTED_ALERT_PRESENT, UnhandledAlertException.class))
         .add(new StatusTuple("unknown error", UNHANDLED_ERROR, WebDriverException.class, UNHANDLED_ERROR))
         .add(new StatusTuple("unsupported operation", METHOD_NOT_ALLOWED, UnsupportedCommandException.class, UNHANDLED_ERROR))
         .add(new StatusTuple("unsupported operation", IME_NOT_AVAILABLE, ImeNotAvailableException.class))
         .add(new StatusTuple("unsupported operation", IME_ENGINE_ACTIVATION_FAILED, ImeActivationFailedException.class))
         .build())
      .build();

  // A single JSON status code can map to many w3c codes. The exceptions thrown are the same. It'll
  // be fine.
  private static final Map<Integer, String> JSON_TO_W3C = ALL_CODES.values().stream()
    .flatMap(Collection::stream)
    .collect(Collectors.toMap(StatusTuple::asStatus, StatusTuple::asState, (key1, key2) -> key1));

  private static final Map<String, Integer> W3C_TO_JSON = ALL_CODES.values().stream()
    .flatMap(Collection::stream)
    .collect(Collectors.toMap(StatusTuple::asState, StatusTuple::asStatus, (key1, key2) -> key1));

  private static final Map<Integer, Map<String, Integer>> HTTP_TO_STATE_AND_STATUS =
    ALL_CODES.entrySet().stream()
      .collect(Collectors.toMap(
        Map.Entry::getKey,
        entry -> entry.getValue()
          .stream()
          .collect(Collectors.toMap(StatusTuple::asState, StatusTuple::asStatus, (key1, key2) -> key1))));

  private static final Map<String, Class<? extends WebDriverException>> STATE_TO_EXCEPTION =
    ALL_CODES.values().stream()
      .flatMap(Collection::stream)
      .filter(tuple -> tuple.getException() != null)
      .collect(Collectors.toMap(StatusTuple::asState, StatusTuple::getException, (key1, key2) -> key1));

  public String toState(Integer status) {
    return JSON_TO_W3C.getOrDefault(status, "unknown error");
  }

  public int toStatus(String webdriverState, Optional<Integer> httpStatus) {
    // Look it up in the map if the http status code has been provided
    if (httpStatus.isPresent()) {
      Map<String, Integer> tuples = HTTP_TO_STATE_AND_STATUS.get(httpStatus.get());
      if (tuples != null) {
        Integer value = tuples.get(webdriverState);
        if (value != null) {
          return value;
        }
        log.info(String.format(
          "HTTP Status: '%d' -> no JSON status mapping for '%s'",
          httpStatus.get(),
          webdriverState));
      } else {
        log.info(String.format(
          "No JSON status codes found for HTTP status: '%d' -> ",
          httpStatus.get()));
      }

    }

    // Fall through to just doing a straight look up
    return W3C_TO_JSON.getOrDefault(webdriverState, UNHANDLED_ERROR);
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
    return getExceptionType(toState(statusCode));
  }

  public Class<? extends WebDriverException> getExceptionType(String webdriverState) {
    return STATE_TO_EXCEPTION.getOrDefault(webdriverState, WebDriverException.class);
  }

  public int toStatusCode(Throwable e) {
    if (e == null) {
      return SUCCESS;
    }

    // Handle the cases where the JSON wire protocol was more specific than the W3C one
    if (ImeNotAvailableException.class.equals(e.getClass())) {
      return IME_NOT_AVAILABLE;
    }
    if (ImeActivationFailedException.class.equals(e.getClass())) {
      return IME_ENGINE_ACTIVATION_FAILED;
    }

    // And then handle the other cases
    Set<Integer> possibleMatches = ALL_CODES.values().stream()
      .flatMap(Collection::stream)
      .filter(tuple -> tuple.getException() != null)
      .filter(tuple -> tuple.associatedException.isAssignableFrom(e.getClass()))
      .map(StatusTuple::getStatusFromException)
      .collect(Collectors.toSet());

    return Preconditions.checkNotNull(Iterables.getFirst(possibleMatches, UNHANDLED_ERROR));
  }

  public boolean isMappableError(Throwable rootCause) {
    if (rootCause == null) {
      return false;
    }

    Set<Integer> possibleMatches = ALL_CODES.values().stream()
      .flatMap(Collection::stream)
      .filter(tuple -> tuple.getException() != null)
      .filter(tuple -> tuple.associatedException.isAssignableFrom(rootCause.getClass()))
      .map(StatusTuple::asStatus)
      .collect(Collectors.toSet());

    return !possibleMatches.isEmpty();
  }

  private static class StatusTuple implements Comparable<StatusTuple> {
    private final String w3cState;
    private final int jsonStatus;
    private final Class<? extends WebDriverException> associatedException;
    // Mapping from the original error codes implementation.
    private final int seleniumExceptionToResponseCode;

    public StatusTuple(String w3cState, int jsonStatus, Class<? extends WebDriverException> ex) {
      this(w3cState, jsonStatus, ex, jsonStatus);
    }

    public StatusTuple(
      String w3cState,
      int jsonStatus,
      Class<? extends WebDriverException> ex,
      int seleniumExceptionToResponseCode) {
      this.w3cState = w3cState;
      this.jsonStatus = jsonStatus;
      this.associatedException = ex;
      // This field is derived from the original implementation of ErrorCodes. Also used when
      this.seleniumExceptionToResponseCode = seleniumExceptionToResponseCode;
    }

    public int asStatus() {
      return jsonStatus;
    }

    public String asState() {
      return w3cState;
    }

    public int getStatusFromException() {
      return seleniumExceptionToResponseCode;
    }

    @Override
    public int compareTo(StatusTuple that) {
      return ComparisonChain.start()
        .compare(this.w3cState, that.w3cState)
        .compare(this.jsonStatus, that.jsonStatus)
        .result();
    }

    public Class<? extends WebDriverException> getException() {
      return associatedException;
    }
  }
}
