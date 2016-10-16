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

import static org.hamcrest.Matchers.containsString;
import static org.hamcrest.Matchers.not;
import static org.hamcrest.Matchers.startsWith;
import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertNotNull;
import static org.junit.Assert.assertThat;
import static org.junit.Assert.assertTrue;
import static org.junit.Assert.fail;

import com.google.common.base.Joiner;
import com.google.common.collect.ImmutableMap;
import com.google.common.collect.Lists;

import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.junit.runners.JUnit4;
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

import java.util.HashMap;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;

/**
 * Unit tests for {@link ErrorHandler}.
 *
 * @author jmleyba@gmail.com (Jason Leyba)
 */
@RunWith(JUnit4.class)
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

  private void assertThrowsCorrectExceptionType(
      int status, Class<? extends RuntimeException> type) {
    try {
      handler.throwIfResponseFailed(createResponse(status), 123);
      fail("Should have a " + type.getName());
    } catch (RuntimeException e) {
      assertTrue("Expected:<" + type.getName() + ">, but was:<" + e.getClass().getName() + ">",
          type.isAssignableFrom(e.getClass()));
    }
  }

  private static void assertDoesNotHaveACause(Throwable t) {
    if (t.getCause() != null) {
      throw new RuntimeException("Should not have a cause", t);
    }
  }

  @SuppressWarnings({"ThrowableInstanceNeverThrown"})
  @Test
  public void testShouldThrowAVanillaWebDriverExceptionIfServerDoesNotProvideAValue() {
    try {
        Response response = createResponse(ErrorCodes.UNHANDLED_ERROR);
        handler.throwIfResponseFailed(response, 123);
      fail("Should have thrown!");
    } catch (WebDriverException expected) {
      assertDoesNotHaveACause(expected);
      String message = expected.getMessage();
      assertThat(message, containsString(new WebDriverException().getMessage()));
      assertThat(message, not(containsString("duration"))); // no duration message
    }
  }

  @SuppressWarnings({"ThrowableInstanceNeverThrown"})
  @Test
  public void testShouldNotSetCauseIfResponseValueIsJustAString() {
    try {
      handler.throwIfResponseFailed(createResponse(ErrorCodes.UNHANDLED_ERROR, "boom"), 123);
      fail("Should have thrown!");
    } catch (WebDriverException expected) {
      assertEquals(WebDriverException.class, expected.getClass());
      assertDoesNotHaveACause(expected);
      assertThat(expected.getMessage(), containsString("boom"));
      assertThat(expected.getMessage(), containsString(new WebDriverException().getMessage()));
    }
  }

  @SuppressWarnings({"ThrowableInstanceNeverThrown"})
  @Test
  public void testCauseShouldBeAnUnknownServerExceptionIfServerOnlyReturnsAMessage() {
    try {
      handler.throwIfResponseFailed(createResponse(ErrorCodes.UNHANDLED_ERROR,
          ImmutableMap.of("message", "boom")), 123);
      fail("Should have thrown!");
    } catch (WebDriverException expected) {
      assertDoesNotHaveACause(expected);
      assertThat(expected.getMessage(), containsString("boom"));
      assertThat(expected.getMessage(), containsString(new WebDriverException().getMessage()));
    }
  }

  private static void assertCauseIsOfType(Class<? extends Throwable> expectedType, Throwable root) {
    Throwable cause = root.getCause();
    if (cause == null) {
      // Doing it this way makes sure the test logs has the full trace to debug.
      throw new RuntimeException("Missing an exception!", root);
    } else if (!expectedType.isInstance(cause)) {
      throw new RuntimeException("Expected cause to be of type: " + expectedType.getName(), cause);
    }
  }

  @SuppressWarnings({"ThrowableInstanceNeverThrown"})
  @Test
  public void testCauseShouldUseTheNamedClassIfAvailableOnTheClassPath() {
    try {
      handler.throwIfResponseFailed(createResponse(ErrorCodes.UNHANDLED_ERROR,
          ImmutableMap.of("message", "boom",
              "class", NullPointerException.class.getName())), 123);
      fail("Should have thrown!");
    } catch (WebDriverException expected) {
      assertEquals(new WebDriverException("boom\nCommand duration or timeout: 123 milliseconds").getMessage(),
          expected.getMessage());

      Throwable cause = expected.getCause();
      assertNotNull("Should have a cause", cause);
      assertEquals("Wrong cause type", NullPointerException.class, cause.getClass());
      assertEquals("Wrong cause message", "boom", cause.getMessage());
    }
  }

  @SuppressWarnings({"ThrowableInstanceNeverThrown"})
  @Test
  public void testCauseStackTraceShouldBeEmptyIfTheServerDidNotProvideThatInformation() {
    try {
      handler.throwIfResponseFailed(createResponse(ErrorCodes.UNHANDLED_ERROR,
          ImmutableMap.of("message", "boom",
              "class", NullPointerException.class.getName())), 1234);
      fail("Should have thrown!");
    } catch (WebDriverException expected) {
      assertEquals(new WebDriverException("boom\nCommand duration or timeout: 1.23 seconds").getMessage(),
          expected.getMessage());

      Throwable cause = expected.getCause();
      assertNotNull("Should have a cause", cause);
      assertEquals("Wrong cause type", NullPointerException.class, cause.getClass());
      assertEquals("Wrong cause message", "boom", cause.getMessage());
      assertEquals(0, cause.getStackTrace().length);
    }
  }

  @SuppressWarnings({"unchecked", "ThrowableInstanceNeverThrown"})
  @Test
  public void testShouldBeAbleToRebuildASerializedException() throws Exception {
    RuntimeException serverError = new RuntimeException("foo bar baz!\nCommand duration or timeout: 123 milliseconds");

    try {
      handler.throwIfResponseFailed(
          createResponse(ErrorCodes.UNHANDLED_ERROR, toMap(serverError)), 123);
      fail("Should have thrown!");
    } catch (WebDriverException expected) {
        WebDriverException webDriverException = new WebDriverException(serverError.getMessage());
        String message = webDriverException.getMessage();
        String message1 = expected.getMessage();
        assertEquals(message,
                message1);

      Throwable cause = expected.getCause();
      assertNotNull("Should have a cause", cause);
      assertEquals("Wrong cause type", serverError.getClass(), cause.getClass());
      assertEquals("Wrong cause message", serverError.getMessage(), cause.getMessage());
      assertStackTracesEqual(serverError.getStackTrace(), cause.getStackTrace());
    }
  }

  @SuppressWarnings({"unchecked", "ThrowableInstanceNeverThrown"})
  @Test
  public void testShouldIncludeScreenshotIfProvided() throws Exception {
    RuntimeException serverError = new RuntimeException("foo bar baz!");
    Map<String, Object> data = toMap(serverError);
    data.put("screen", "screenGrabText");

    try {
      handler.throwIfResponseFailed(createResponse(ErrorCodes.UNHANDLED_ERROR, data), 123);
      fail("Should have thrown!");
    } catch (WebDriverException expected) {
      assertEquals(new WebDriverException(serverError.getMessage() + "\nCommand duration or timeout: 123 milliseconds").getMessage(),
          expected.getMessage());

      Throwable cause = expected.getCause();
      assertNotNull(cause);
      assertEquals(ScreenshotException.class, cause.getClass());
      assertEquals("screenGrabText", ((ScreenshotException) cause).getBase64EncodedScreenshot());

      Throwable realCause = cause.getCause();
      assertNotNull(realCause);
      assertEquals(serverError.getClass(), realCause.getClass());
      assertEquals(serverError.getMessage(), realCause.getMessage());
      assertStackTracesEqual(serverError.getStackTrace(), realCause.getStackTrace());
    }
  }

  @SuppressWarnings({"unchecked", "ThrowableInstanceNeverThrown"})
  @Test
  public void testShouldDefaultToWebDriverExceptionIfClassIsNotSpecified()
      throws Exception {
    RuntimeException serverError = new RuntimeException("foo bar baz!");
    Map<String, Object> data = toMap(serverError);
    data.remove("class");

    try {
      handler.throwIfResponseFailed(createResponse(ErrorCodes.UNHANDLED_ERROR, data), 123);
      fail("Should have thrown!");
    } catch (WebDriverException expected) {
      assertEquals(new WebDriverException(serverError.getMessage() + "\nCommand duration or timeout: 123 milliseconds").getMessage(),
          expected.getMessage());

      Throwable cause = expected.getCause();
      assertNotNull(cause);
      assertEquals(WebDriverException.class, cause.getClass());
      assertEquals(new WebDriverException(serverError.getMessage()).getMessage(),
          cause.getMessage());
      assertStackTracesEqual(serverError.getStackTrace(), cause.getStackTrace());
    }
  }

  @SuppressWarnings({"unchecked", "ThrowableInstanceNeverThrown"})
  @Test
  public void testShouldStillTryToBuildWebDriverExceptionIfClassIsNotProvidedAndStackTraceIsNotForJava() {
    Map<String, ?> data = ImmutableMap.of(
        "message", "some error message",
        "stackTrace", Lists.newArrayList(
            ImmutableMap.of("lineNumber", 1224,
                "methodName", "someMethod",
                "className", "MyClass",
                "fileName", "Resource.m")));

    try {
      handler.throwIfResponseFailed(createResponse(ErrorCodes.UNHANDLED_ERROR, data), 123);
      fail("Should have thrown!");
    } catch (WebDriverException expected) {
      assertEquals(new WebDriverException("some error message\nCommand duration or timeout: 123 milliseconds").getMessage(),
          expected.getMessage());

      StackTraceElement[] expectedTrace = {
          new StackTraceElement("MyClass", "someMethod", "Resource.m", 1224)
      };
      WebDriverException helper = new WebDriverException("some error message");
      helper.setStackTrace(expectedTrace);

      Throwable cause = expected.getCause();
      assertNotNull(cause);
      assertEquals(WebDriverException.class, cause.getClass());
      assertEquals(helper.getMessage(),
          cause.getMessage());

      assertStackTracesEqual(expectedTrace, cause.getStackTrace());
    }
  }

  @SuppressWarnings({"unchecked", "ThrowableInstanceNeverThrown"})
  @Test
  public void testToleratesNonNumericLineNumber() {
    Map<String, ?> data = ImmutableMap.of(
        "message", "some error message",
        "stackTrace", Lists.newArrayList(
            ImmutableMap.of("lineNumber", "some string, might be empty or 'Not avalable'",
                "methodName", "someMethod",
                "className", "MyClass",
                "fileName", "Resource.m")));

    try {
      handler.throwIfResponseFailed(createResponse(ErrorCodes.UNHANDLED_ERROR, data), 123);
      fail("Should have thrown!");
    } catch (WebDriverException expected) {
      assertEquals(new WebDriverException("some error message\nCommand duration or timeout: 123 milliseconds").getMessage(),
          expected.getMessage());

      StackTraceElement[] expectedTrace = {
          new StackTraceElement("MyClass", "someMethod", "Resource.m", -1)
      };
      WebDriverException helper = new WebDriverException("some error message");
      helper.setStackTrace(expectedTrace);

      Throwable cause = expected.getCause();
      assertNotNull(cause);
      assertEquals(WebDriverException.class, cause.getClass());
      assertEquals(helper.getMessage(),
          cause.getMessage());

      assertStackTracesEqual(expectedTrace, cause.getStackTrace());
    }
  }

  @SuppressWarnings({"unchecked", "ThrowableInstanceNeverThrown"})
  @Test
  public void testToleratesNumericLineNumberAsString() {
    Map<String, ?> data = ImmutableMap.of(
        "message", "some error message",
        "stackTrace", Lists.newArrayList(
            ImmutableMap.of("lineNumber", "1224", // number as a string
                "methodName", "someMethod",
                "className", "MyClass",
                "fileName", "Resource.m")));

    try {
      handler.throwIfResponseFailed(createResponse(ErrorCodes.UNHANDLED_ERROR, data), 123);
      fail("Should have thrown!");
    } catch (WebDriverException expected) {
      assertEquals(new WebDriverException("some error message\nCommand duration or timeout: 123 milliseconds").getMessage(),
          expected.getMessage());

      StackTraceElement[] expectedTrace = {
          new StackTraceElement("MyClass", "someMethod", "Resource.m", 1224)
      };
      WebDriverException helper = new WebDriverException("some error message");
      helper.setStackTrace(expectedTrace);

      Throwable cause = expected.getCause();
      assertNotNull(cause);
      assertEquals(WebDriverException.class, cause.getClass());
      assertEquals(helper.getMessage(),
          cause.getMessage());

      assertStackTracesEqual(expectedTrace, cause.getStackTrace());
    }
  }

  @SuppressWarnings({"unchecked", "ThrowableInstanceNeverThrown"})
  @Test
  public void testShouldIndicateWhenTheServerReturnedAnExceptionThatWasSuppressed()
      throws Exception {
    RuntimeException serverError = new RuntimeException("foo bar baz!");

    handler.setIncludeServerErrors(false);

    try {
      handler.throwIfResponseFailed(createResponse(
          ErrorCodes.UNHANDLED_ERROR, toMap(serverError)), 123);
      fail("Should have thrown!");
    } catch (WebDriverException expected) {
      assertDoesNotHaveACause(expected);
      assertThat(expected.getMessage(), containsString(serverError.getMessage()));
      assertThat(expected.getMessage(), containsString(new WebDriverException().getMessage()));
    }
  }

  @SuppressWarnings({"unchecked", "ThrowableInstanceNeverThrown"})
  @Test
  public void testShouldStillIncludeScreenshotEvenIfServerSideExceptionsAreDisabled()
      throws Exception {
    RuntimeException serverError = new RuntimeException("foo bar baz!");
    Map<String, Object> data = toMap(serverError);
    data.put("screen", "screenGrabText");

    handler.setIncludeServerErrors(false);

    try {
      handler.throwIfResponseFailed(createResponse(
          ErrorCodes.UNHANDLED_ERROR, data), 123);
      fail("Should have thrown!");
    } catch (WebDriverException expected) {
      assertThat(expected.getMessage(), startsWith("foo bar baz!"));

      assertCauseIsOfType(ScreenshotException.class, expected);
      ScreenshotException screenshot = (ScreenshotException) expected.getCause();
      assertEquals("screenGrabText", screenshot.getBase64EncodedScreenshot());
      assertDoesNotHaveACause(screenshot);
    }
  }

  @Test
  public void testStatusCodesRaisedBackToStatusMatches() {
    Map<Integer, Class> exceptions = new HashMap<>();
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

    Set<String> collectedFailures = new HashSet<>();
    for (Map.Entry<Integer, Class> exception : exceptions.entrySet()) {
      try {
        handler.throwIfResponseFailed(createResponse(exception.getKey()), 123);
        fail("Should have thrown an Exception");
      } catch (Exception e) {
        assertEquals("Checking status code: " + exception.getKey(), exception.getValue().getSimpleName(), e.getClass().getSimpleName());

        int expected = exception.getKey();
        if (e instanceof InvalidSelectorException) {
          // all of the special invalid selector exceptions are just mapped to the generic invalid selector
          expected = ErrorCodes.INVALID_SELECTOR_ERROR;
        }
        int seenStatusCode = new ErrorCodes().toStatusCode(e);
        if (seenStatusCode != expected) {
          collectedFailures.add(String.format("%s: ErrorCode.toStatusCode. Expected %d, saw %d", e.getClass().getSimpleName(), expected, seenStatusCode));
        }
      }
    }
    if (!collectedFailures.isEmpty()) {
      fail(Joiner.on("\n").join(collectedFailures));
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

  private static void assertStackTracesEqual(StackTraceElement[] expected,
      StackTraceElement[] actual) {
    assertEquals("Stack traces have different sizes", expected.length, actual.length);
    for (int i = 0; i < expected.length; i++) {
      String message = "Frames differ at index [" + i + "]; expected:<"
          + expected[i] + "> but was:<" + actual[i] + ">";

      assertEquals(message, expected[i].getFileName(), actual[i].getFileName());
      assertEquals(message, expected[i].getClassName(), actual[i].getClassName());
      assertEquals(message, expected[i].getMethodName(), actual[i].getMethodName());
      assertEquals(message, expected[i].getLineNumber(), actual[i].getLineNumber());
    }
  }

  @SuppressWarnings({"unchecked"})
  private static Map<String, Object> toMap(Object o) throws Exception {
    String rawJson = new BeanToJsonConverter().convert(o);
    return new JsonToBeanConverter().convert(Map.class, rawJson);
  }
}
