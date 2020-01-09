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

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatExceptionOfType;

import com.google.common.collect.ImmutableMap;

import org.junit.Before;
import org.junit.Test;
import org.openqa.selenium.ElementNotSelectableException;
import org.openqa.selenium.ElementNotVisibleException;
import org.openqa.selenium.ImeActivationFailedException;
import org.openqa.selenium.ImeNotAvailableException;
import org.openqa.selenium.InvalidCookieDomainException;
import org.openqa.selenium.InvalidElementStateException;
import org.openqa.selenium.InvalidSelectorException;
import org.openqa.selenium.JavascriptException;
import org.openqa.selenium.NoAlertPresentException;
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
import org.openqa.selenium.json.Json;

import java.util.Collections;
import java.util.HashMap;
import java.util.Map;

public class ErrorHandlerTest {
  private ErrorHandler handler;

  @Before
  public void setUp() {
    handler = new ErrorHandler();
    handler.setIncludeServerErrors(true);
  }

  @Test
  public void testShouldNotThrowIfResponseWasASuccess() {
    handler.throwIfResponseFailed(createResponse(ErrorCodes.SUCCESS), 100);
    // All is well if this doesn't throw.
  }

  @Test
  public void testThrowsCorrectExceptionTypes() {
    assertThrowsCorrectExceptionType(ErrorCodes.NO_SUCH_WINDOW, NoSuchWindowException.class);
    assertThrowsCorrectExceptionType(ErrorCodes.NO_SUCH_FRAME, NoSuchFrameException.class);
    assertThrowsCorrectExceptionType(ErrorCodes.NO_SUCH_ELEMENT, NoSuchElementException.class);
    assertThrowsCorrectExceptionType(
        ErrorCodes.UNKNOWN_COMMAND, UnsupportedCommandException.class);
    assertThrowsCorrectExceptionType(
        ErrorCodes.METHOD_NOT_ALLOWED, UnsupportedCommandException.class);
    assertThrowsCorrectExceptionType(
        ErrorCodes.STALE_ELEMENT_REFERENCE, StaleElementReferenceException.class);
    assertThrowsCorrectExceptionType(
        ErrorCodes.ELEMENT_NOT_VISIBLE, ElementNotVisibleException.class);
    assertThrowsCorrectExceptionType(
        ErrorCodes.INVALID_ELEMENT_STATE, InvalidElementStateException.class);
    assertThrowsCorrectExceptionType(
        ErrorCodes.XPATH_LOOKUP_ERROR, InvalidSelectorException.class);
    assertThrowsCorrectExceptionType(ErrorCodes.INVALID_ELEMENT_COORDINATES,
        InvalidCoordinatesException.class);
  }

  private void assertThrowsCorrectExceptionType(int status, Class<? extends RuntimeException> type) {
    assertThatExceptionOfType(RuntimeException.class)
        .isThrownBy(() -> handler.throwIfResponseFailed(createResponse(status), 123))
        .satisfies(e -> assertThat(type.isAssignableFrom(e.getClass())).isTrue());
  }

  @Test
  public void testShouldThrowAVanillaWebDriverExceptionIfServerDoesNotProvideAValue() {
    Response response = createResponse(ErrorCodes.UNHANDLED_ERROR);
    assertThatExceptionOfType(WebDriverException.class)
        .isThrownBy(() -> handler.throwIfResponseFailed(response, 123))
        .withNoCause()
        .withMessageContaining(new WebDriverException().getMessage());
  }

  @Test
  public void testShouldNotSetCauseIfResponseValueIsJustAString() {
    assertThatExceptionOfType(WebDriverException.class)
        .isThrownBy(() -> handler.throwIfResponseFailed(
            createResponse(ErrorCodes.UNHANDLED_ERROR, "boom"), 123))
        .withNoCause()
        .satisfies(expected -> assertThat(expected).isExactlyInstanceOf(WebDriverException.class))
        .withMessageContaining("boom")
        .withMessageContaining(new WebDriverException().getMessage());
  }

  @Test
  public void testCauseShouldBeAnUnknownServerExceptionIfServerOnlyReturnsAMessage() {
    assertThatExceptionOfType(WebDriverException.class)
        .isThrownBy(() -> handler.throwIfResponseFailed(
            createResponse(ErrorCodes.UNHANDLED_ERROR, ImmutableMap.of("message", "boom")), 123))
        .withNoCause()
        .withMessageContaining("boom")
        .withMessageContaining(new WebDriverException().getMessage());
  }

  @Test
  public void testCauseShouldUseTheNamedClassIfAvailableOnTheClassPath() {
    assertThatExceptionOfType(WebDriverException.class)
        .isThrownBy(() -> handler.throwIfResponseFailed(
            createResponse(ErrorCodes.UNHANDLED_ERROR,
                           ImmutableMap.of("message", "boom", "class", NullPointerException.class.getName())), 123))
        .withMessage(new WebDriverException("boom (WARNING: The server did not provide any stacktrace information)\nCommand duration or timeout: 123 milliseconds").getMessage())
        .withCauseInstanceOf(NullPointerException.class)
        .satisfies(expected -> assertThat(expected.getCause()).hasMessage("boom"));
  }

  @Test
  public void testCauseStackTraceShouldBeEmptyIfTheServerDidNotProvideThatInformation() {
    assertThatExceptionOfType(WebDriverException.class)
        .isThrownBy(() -> handler.throwIfResponseFailed(
            createResponse(ErrorCodes.UNHANDLED_ERROR,
                           ImmutableMap.of("message", "boom", "class", NullPointerException.class.getName())), 1234))
        .withMessage(new WebDriverException("boom (WARNING: The server did not provide any stacktrace information)\nCommand duration or timeout: 1.23 seconds").getMessage())
        .withCauseInstanceOf(NullPointerException.class)
        .satisfies(expected -> {
          assertThat(expected.getCause()).hasMessage("boom");
          assertThat(expected.getCause().getStackTrace()).isEmpty();
        });
  }

  @Test
  public void testShouldBeAbleToRebuildASerializedException() {
    RuntimeException serverError = new RuntimeException("foo bar baz!\nCommand duration or timeout: 123 milliseconds");

    assertThatExceptionOfType(WebDriverException.class)
        .isThrownBy(()-> handler.throwIfResponseFailed(
            createResponse(ErrorCodes.UNHANDLED_ERROR, toMap(serverError)), 123))
        .withMessage(new WebDriverException(serverError.getMessage()).getMessage())
        .withCauseInstanceOf(serverError.getClass())
        .satisfies(expected -> {
          assertThat(expected.getCause().getMessage()).isEqualTo(serverError.getMessage());
          assertStackTracesEqual(expected.getCause().getStackTrace(), serverError.getStackTrace());
        });
  }

  @Test
  public void testShouldIncludeScreenshotIfProvided() {
    RuntimeException serverError = new RuntimeException("foo bar baz!");
    Map<String, Object> data = toMap(serverError);
    data.put("screen", "screenGrabText");

    assertThatExceptionOfType(WebDriverException.class)
        .isThrownBy(() -> handler.throwIfResponseFailed(
            createResponse(ErrorCodes.UNHANDLED_ERROR, data), 123))
        .withMessage(new WebDriverException(
            serverError.getMessage() + "\nCommand duration or timeout: 123 milliseconds",
            new WebDriverException()).getMessage())
        .withCauseInstanceOf(ScreenshotException.class)
        .satisfies(expected -> {
          Throwable cause = expected.getCause();
          assertThat(((ScreenshotException) cause).getBase64EncodedScreenshot()).isEqualTo("screenGrabText");
          Throwable realCause = cause.getCause();
          assertThat(realCause).isNotNull();
          assertThat(realCause.getClass()).isEqualTo(serverError.getClass());
          assertThat(realCause.getMessage()).isEqualTo(serverError.getMessage());
          assertStackTracesEqual(serverError.getStackTrace(), realCause.getStackTrace());
        });
  }

  @Test
  public void testShouldDefaultToWebDriverExceptionIfClassIsNotSpecified() {
    RuntimeException serverError = new RuntimeException("foo bar baz!");
    Map<String, Object> data = toMap(serverError);
    data.remove("class");

    assertThatExceptionOfType(WebDriverException.class)
        .isThrownBy(() -> handler.throwIfResponseFailed(
            createResponse(ErrorCodes.UNHANDLED_ERROR, data), 123))
        .withMessage(new WebDriverException(
            serverError.getMessage() + "\nCommand duration or timeout: 123 milliseconds",
            new WebDriverException()).getMessage())
        .withCauseInstanceOf(WebDriverException.class)
        .satisfies(expected -> {
          Throwable cause = expected.getCause();
          assertThat(cause.getMessage()).isEqualTo(new WebDriverException(serverError.getMessage()).getMessage());
          assertStackTracesEqual(serverError.getStackTrace(), cause.getStackTrace());
        });
  }

  @Test
  public void testShouldStillTryToBuildWebDriverExceptionIfClassIsNotProvidedAndStackTraceIsNotForJava() {
    Map<String, ?> data = ImmutableMap.of(
        "message", "some error message",
        "stackTrace", Collections.singletonList(
            ImmutableMap.of("lineNumber", 1224,
                            "methodName", "someMethod",
                            "className", "MyClass",
                            "fileName", "Resource.m")));

    assertThatExceptionOfType(WebDriverException.class)
        .isThrownBy(() -> handler.throwIfResponseFailed(
            createResponse(ErrorCodes.UNHANDLED_ERROR, data), 123))
        .withMessage(new WebDriverException(
            "some error message\nCommand duration or timeout: 123 milliseconds",
            new WebDriverException()).getMessage())
        .withCauseInstanceOf(WebDriverException.class)
        .satisfies(expected -> {
          StackTraceElement[] expectedTrace = {
              new StackTraceElement("MyClass", "someMethod", "Resource.m", 1224)
          };
          WebDriverException helper = new WebDriverException("some error message");
          helper.setStackTrace(expectedTrace);

          Throwable cause = expected.getCause();
          assertThat(cause.getMessage()).isEqualTo(helper.getMessage());
          assertStackTracesEqual(expectedTrace, cause.getStackTrace());
        });
  }
  
  @Test
  public void testShoulNotBuildWebDriverExceptionIfClassAndStackTraceIsNull() {
    Map<String, Object> data = new HashMap<>();
    data.put("message", "some error message");
    data.put("class", null);
    data.put("stackTrace", null);

    assertThatExceptionOfType(WebDriverException.class)
        .isThrownBy(() -> handler.throwIfResponseFailed(
            createResponse(ErrorCodes.UNHANDLED_ERROR, data), 123))
        .withMessageStartingWith(new WebDriverException(
            "some error message (WARNING: The server did not provide any stacktrace information)\nCommand duration or timeout: 123 milliseconds",
            new WebDriverException()).getMessage());
  }
  
  @Test
  public void testShoulNotBuildWebDriverExceptionIfClassNullAndStackTraceNotNull() {
    Map<String, Object> data = new HashMap<>();
    data.put("message", "some error message");
    data.put("class", null);
    data.put("stackTrace", Collections.singletonList(
        ImmutableMap.of("lineNumber", 1224,
                        "methodName", "someMethod",
                        "className", "MyClass",
                        "fileName", "Resource.m")));

    assertThatExceptionOfType(WebDriverException.class)
        .isThrownBy(() -> handler.throwIfResponseFailed(
            createResponse(ErrorCodes.UNHANDLED_ERROR, data), 123))
        .withMessageStartingWith(new WebDriverException(
            "some error message\nCommand duration or timeout: 123 milliseconds",
            new WebDriverException()).getMessage());
  }
  
  @Test
  public void testShoulNotBuildWebDriverExceptionIfClassNotNullAndStackTraceNull() {
    Map<String, Object> data = new HashMap<>();
    data.put("message", "some error message");
    data.put("class", "a");
    data.put("stackTrace", null);

    assertThatExceptionOfType(WebDriverException.class)
        .isThrownBy(() -> handler.throwIfResponseFailed(
            createResponse(ErrorCodes.UNHANDLED_ERROR, data), 123))
        .withMessageStartingWith(new WebDriverException(
            "some error message (WARNING: The server did not provide any stacktrace information)\nCommand duration or timeout: 123 milliseconds",
            new WebDriverException()).getMessage());
  }

  @Test
  public void testToleratesNonNumericLineNumber() {
    Map<String, ?> data = ImmutableMap.of(
        "message", "some error message",
        "stackTrace", Collections.singletonList(
            ImmutableMap.of("lineNumber", "some string, might be empty or 'Not avalable'",
                            "methodName", "someMethod",
                            "className", "MyClass",
                            "fileName", "Resource.m")));

    assertThatExceptionOfType(WebDriverException.class)
        .isThrownBy(() -> handler.throwIfResponseFailed(
            createResponse(ErrorCodes.UNHANDLED_ERROR, data), 123))
        .withMessage(new WebDriverException(
            "some error message\nCommand duration or timeout: 123 milliseconds",
            new WebDriverException()).getMessage())
        .withCauseInstanceOf(WebDriverException.class)
        .satisfies(expected -> {
          StackTraceElement[] expectedTrace = {
              new StackTraceElement("MyClass", "someMethod", "Resource.m", -1)
          };
          WebDriverException helper = new WebDriverException("some error message");
          helper.setStackTrace(expectedTrace);

          Throwable cause = expected.getCause();
          assertThat(cause.getMessage()).isEqualTo(helper.getMessage());
          assertStackTracesEqual(expectedTrace, cause.getStackTrace());
        });
  }

  @Test
  public void testToleratesNumericLineNumberAsString() {
    Map<String, ?> data = ImmutableMap.of(
        "message", "some error message",
        "stackTrace", Collections.singletonList(
            ImmutableMap.of("lineNumber", "1224", // number as a string
                            "methodName", "someMethod",
                            "className", "MyClass",
                            "fileName", "Resource.m")));

    assertThatExceptionOfType(WebDriverException.class)
        .isThrownBy(() -> handler.throwIfResponseFailed(
            createResponse(ErrorCodes.UNHANDLED_ERROR, data), 123))
        .withMessage(new WebDriverException(
            "some error message\nCommand duration or timeout: 123 milliseconds",
            new WebDriverException()).getMessage())
        .withCauseInstanceOf(WebDriverException.class)
        .satisfies(expected -> {
          StackTraceElement[] expectedTrace = {
              new StackTraceElement("MyClass", "someMethod", "Resource.m", 1224)
          };
          WebDriverException helper = new WebDriverException("some error message");
          helper.setStackTrace(expectedTrace);

          Throwable cause = expected.getCause();
          assertThat(cause.getMessage()).isEqualTo(helper.getMessage());

          assertStackTracesEqual(expectedTrace, cause.getStackTrace());
        });
  }

  @Test
  public void testShouldIndicateWhenTheServerReturnedAnExceptionThatWasSuppressed() {
    RuntimeException serverError = new RuntimeException("foo bar baz!");

    handler.setIncludeServerErrors(false);

    assertThatExceptionOfType(WebDriverException.class)
        .isThrownBy(() -> handler.throwIfResponseFailed(
            createResponse(ErrorCodes.UNHANDLED_ERROR, toMap(serverError)), 123))
        .withNoCause()
        .withMessageContaining(serverError.getMessage())
        .withMessageContaining(new WebDriverException().getMessage());
  }

  @Test
  public void testShouldStillIncludeScreenshotEvenIfServerSideExceptionsAreDisabled() {
    RuntimeException serverError = new RuntimeException("foo bar baz!");
    Map<String, Object> data = toMap(serverError);
    data.put("screen", "screenGrabText");

    handler.setIncludeServerErrors(false);

    assertThatExceptionOfType(WebDriverException.class)
        .isThrownBy(() -> handler.throwIfResponseFailed(
            createResponse(ErrorCodes.UNHANDLED_ERROR, data), 123))
        .withMessageStartingWith("foo bar baz!")
        .withCauseInstanceOf(ScreenshotException.class)
        .satisfies(expected -> {
          ScreenshotException screenshot = (ScreenshotException) expected.getCause();
          assertThat(screenshot.getBase64EncodedScreenshot()).isEqualTo("screenGrabText");
          assertThat(screenshot).hasNoCause();
        });
  }

  @Test
  public void testStatusCodesRaisedBackToStatusMatches() {
    Map<Integer, Class<?>> exceptions = new HashMap<>();
    exceptions.put(ErrorCodes.NO_SUCH_SESSION, NoSuchSessionException.class);
    exceptions.put(ErrorCodes.NO_SUCH_ELEMENT, NoSuchElementException.class);
    exceptions.put(ErrorCodes.NO_SUCH_FRAME, NoSuchFrameException.class);
    exceptions.put(ErrorCodes.UNKNOWN_COMMAND, UnsupportedCommandException.class);
    exceptions.put(ErrorCodes.STALE_ELEMENT_REFERENCE, StaleElementReferenceException.class);
    exceptions.put(ErrorCodes.ELEMENT_NOT_VISIBLE, ElementNotVisibleException.class);
    exceptions.put(ErrorCodes.INVALID_ELEMENT_STATE, InvalidElementStateException.class);
    exceptions.put(ErrorCodes.UNHANDLED_ERROR, WebDriverException.class);
    exceptions.put(ErrorCodes.ELEMENT_NOT_SELECTABLE, ElementNotSelectableException.class);
    exceptions.put(ErrorCodes.JAVASCRIPT_ERROR, JavascriptException.class);
    exceptions.put(ErrorCodes.XPATH_LOOKUP_ERROR, InvalidSelectorException.class);
    exceptions.put(ErrorCodes.TIMEOUT, TimeoutException.class);
    exceptions.put(ErrorCodes.NO_SUCH_WINDOW, NoSuchWindowException.class);
    exceptions.put(ErrorCodes.INVALID_COOKIE_DOMAIN, InvalidCookieDomainException.class);
    exceptions.put(ErrorCodes.UNABLE_TO_SET_COOKIE, UnableToSetCookieException.class);
    exceptions.put(ErrorCodes.UNEXPECTED_ALERT_PRESENT, UnhandledAlertException.class);
    exceptions.put(ErrorCodes.NO_ALERT_PRESENT, NoAlertPresentException.class);
    exceptions.put(ErrorCodes.ASYNC_SCRIPT_TIMEOUT, ScriptTimeoutException.class);
    exceptions.put(ErrorCodes.INVALID_ELEMENT_COORDINATES, InvalidCoordinatesException.class);
    exceptions.put(ErrorCodes.IME_NOT_AVAILABLE, ImeNotAvailableException.class);
    exceptions.put(ErrorCodes.IME_ENGINE_ACTIVATION_FAILED, ImeActivationFailedException.class);
    exceptions.put(ErrorCodes.INVALID_SELECTOR_ERROR, InvalidSelectorException.class);
    exceptions.put(ErrorCodes.SESSION_NOT_CREATED, SessionNotCreatedException.class);
    exceptions.put(ErrorCodes.MOVE_TARGET_OUT_OF_BOUNDS, MoveTargetOutOfBoundsException.class);
    exceptions.put(ErrorCodes.INVALID_XPATH_SELECTOR, InvalidSelectorException.class);
    exceptions.put(ErrorCodes.INVALID_XPATH_SELECTOR_RETURN_TYPER, InvalidSelectorException.class);

    for (Map.Entry<Integer, Class<?>> exception : exceptions.entrySet()) {
      assertThatExceptionOfType(WebDriverException.class)
          .isThrownBy(() -> handler.throwIfResponseFailed(createResponse(exception.getKey()), 123))
          .satisfies(e -> {
            assertThat(e.getClass().getSimpleName()).isEqualTo(exception.getValue().getSimpleName());

            // all of the special invalid selector exceptions are just mapped to the generic invalid selector
            int expected = e instanceof InvalidSelectorException
                           ? ErrorCodes.INVALID_SELECTOR_ERROR : exception.getKey();
            assertThat(new ErrorCodes().toStatusCode(e)).isEqualTo(expected);
          });
    }
  }

  private Response createResponse(int status) {
    return createResponse(status, null);
  }

  private Response createResponse(int status, Object value) {
    Response response = new Response();
    response.setStatus(status);
    response.setValue(value);
    return response;
  }

  private static void assertStackTracesEqual(StackTraceElement[] expected, StackTraceElement[] actual) {
    assertThat(actual.length).as("Stacktrace length").isEqualTo(expected.length);
    for (int i = 0; i < expected.length; i++) {
      String message = "Frames at index [" + i + "]";
      assertThat(actual[i].getFileName()).as(message).isEqualTo(expected[i].getFileName());
      assertThat(actual[i].getClassName()).as(message).isEqualTo(expected[i].getClassName());
      assertThat(actual[i].getMethodName()).as(message).isEqualTo(expected[i].getMethodName());
      assertThat(actual[i].getLineNumber()).as(message).isEqualTo(expected[i].getLineNumber());
    }
  }

  private static Map<String, Object> toMap(Object o) {
    String rawJson = new Json().toJson(o);
    return new Json().toType(rawJson, Map.class);
  }
}
