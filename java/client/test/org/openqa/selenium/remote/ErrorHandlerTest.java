/*
 Copyright 2007-2010 WebDriver committers
 Copyright 2007-2010 Google Inc.

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

 http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
 */

package org.openqa.selenium.remote;

import junit.framework.TestCase;

import java.util.Map;

import com.google.common.collect.ImmutableMap;
import com.google.common.collect.Lists;
import org.openqa.selenium.*;
import org.openqa.selenium.interactions.InvalidCoordinatesException;

import static org.hamcrest.Matchers.containsString;
import static org.hamcrest.Matchers.startsWith;
import static org.junit.Assert.assertThat;

/**
 * Unit tests for {@link ErrorHandler}.
 *
 * @author jmleyba@gmail.com (Jason Leyba)
 */
public class ErrorHandlerTest extends TestCase {
  private ErrorHandler handler;

  @Override
  protected void setUp() {
    handler = new ErrorHandler();
    handler.setIncludeServerErrors(true);
  }

  public void testShouldNotThrowIfResponseWasASuccess() {
    handler.throwIfResponseFailed(createResponse(ErrorCodes.SUCCESS));
    // All is well if this doesn't throw.
  }

  public void testThrowsCorrectExceptionTypes() {
    assertThrowsCorrectExceptionType(ErrorCodes.NO_SUCH_WINDOW, NoSuchWindowException.class);
    assertThrowsCorrectExceptionType(ErrorCodes.NO_SUCH_FRAME, NoSuchFrameException.class);
    assertThrowsCorrectExceptionType(ErrorCodes.NO_SUCH_ELEMENT, NoSuchElementException.class);
    assertThrowsCorrectExceptionType(
        ErrorCodes.UNKNOWN_COMMAND, UnsupportedCommandException.class);
    assertThrowsCorrectExceptionType(
        ErrorCodes.METHOD_NOT_ALLOWED,UnsupportedCommandException.class);
    assertThrowsCorrectExceptionType(
        ErrorCodes.STALE_ELEMENT_REFERENCE, StaleElementReferenceException.class);
    assertThrowsCorrectExceptionType(
        ErrorCodes.ELEMENT_NOT_VISIBLE, ElementNotVisibleException.class);
    assertThrowsCorrectExceptionType(
        ErrorCodes.INVALID_ELEMENT_STATE, InvalidElementStateException.class);
    assertThrowsCorrectExceptionType(
        ErrorCodes.XPATH_LOOKUP_ERROR, XPathLookupException.class);
    assertThrowsCorrectExceptionType(ErrorCodes.INVALID_ELEMENT_COORDINATES,
        InvalidCoordinatesException.class);
  }

  private void assertThrowsCorrectExceptionType(
      int status, Class<? extends RuntimeException> type) {
    try {
      handler.throwIfResponseFailed(createResponse(status));
      fail("Should have a " + type.getName());
    } catch (RuntimeException e) {
      assertTrue("Exepected:<" + type.getName() + ">, but was:<" + e.getClass().getName() + ">",
          type.isAssignableFrom(e.getClass()));
    }
  }

  private static void assertDoesNotHaveACause(Throwable t) {
    if (t.getCause() != null) {
      throw new RuntimeException("Should not have a cause", t);
    }
  }

  @SuppressWarnings({"ThrowableInstanceNeverThrown"})
  public void testShouldThrowAVanillaWebDriverExceptionIfServerDoesNotProvideAValue() {
    try {
      handler.throwIfResponseFailed(createResponse(ErrorCodes.UNHANDLED_ERROR));
      fail("Should have thrown!");
    } catch (WebDriverException expected) {
      assertDoesNotHaveACause(expected);
      assertThat(expected.getMessage(), containsString(new WebDriverException().getMessage()));
    }
  }

  @SuppressWarnings({"ThrowableInstanceNeverThrown"})
  public void testShouldNotSetCauseIfResponseValueIsJustAString() {
    try {
      handler.throwIfResponseFailed(createResponse(ErrorCodes.UNHANDLED_ERROR, "boom"));
      fail("Should have thrown!");
    } catch (WebDriverException expected) {
      assertEquals(WebDriverException.class, expected.getClass());
      assertDoesNotHaveACause(expected);
      assertThat(expected.getMessage(), containsString("boom"));
      assertThat(expected.getMessage(), containsString(new WebDriverException().getMessage()));
    }
  }

  @SuppressWarnings({"ThrowableInstanceNeverThrown"})
  public void testCauseShouldBeAnUnknownServerExceptionIfServerOnlyReturnsAMessage() {
    try {
      handler.throwIfResponseFailed(createResponse(ErrorCodes.UNHANDLED_ERROR,
          ImmutableMap.of("message", "boom")));
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
  public void testCauseShouldUseTheNamedClassIfAvailableOnTheClassPath() {
    try {
      handler.throwIfResponseFailed(createResponse(ErrorCodes.UNHANDLED_ERROR,
          ImmutableMap.of("message", "boom",
              "class", NullPointerException.class.getName())));
      fail("Should have thrown!");
    } catch (WebDriverException expected) {
      assertEquals(new WebDriverException("boom").getMessage(),
          expected.getMessage());

      Throwable cause = expected.getCause();
      assertNotNull("Should have a cause", cause);
      assertEquals("Wrong cause type", NullPointerException.class, cause.getClass());
      assertEquals("Wrong cause message", "boom", cause.getMessage());
    }
  }

  @SuppressWarnings({"ThrowableInstanceNeverThrown"})
  public void testCauseStackTraceShouldBeEmptyIfTheServerDidNotProvideThatInformation() {
    try {
      handler.throwIfResponseFailed(createResponse(ErrorCodes.UNHANDLED_ERROR,
          ImmutableMap.of("message", "boom",
              "class", NullPointerException.class.getName())));
      fail("Should have thrown!");
    } catch (WebDriverException expected) {
      assertEquals(new WebDriverException("boom").getMessage(),
          expected.getMessage());

      Throwable cause = expected.getCause();
      assertNotNull("Should have a cause", cause);
      assertEquals("Wrong cause type", NullPointerException.class, cause.getClass());
      assertEquals("Wrong cause message", "boom", cause.getMessage());
      assertEquals(0, cause.getStackTrace().length);
    }
  }

  @SuppressWarnings({"unchecked", "ThrowableInstanceNeverThrown"})
  public void testShouldBeAbleToRebuildASerializedException() throws Exception {
    RuntimeException serverError = new RuntimeException("foo bar baz!");

    try {
      handler.throwIfResponseFailed(
          createResponse(ErrorCodes.UNHANDLED_ERROR, toMap(serverError)));
      fail("Should have thrown!");
    } catch (WebDriverException expected) {
      assertEquals(new WebDriverException(serverError.getMessage()).getMessage(),
          expected.getMessage());

      Throwable cause = expected.getCause();
      assertNotNull("Should have a cause", cause);
      assertEquals("Wrong cause type", serverError.getClass(), cause.getClass());
      assertEquals("Wrong cause message", serverError.getMessage(), cause.getMessage());
      assertStackTracesEqual(serverError.getStackTrace(), cause.getStackTrace());
    }
  }

  @SuppressWarnings({"unchecked", "ThrowableInstanceNeverThrown"})
  public void testShouldIncludeScreenshotIfProvided() throws Exception {
    RuntimeException serverError = new RuntimeException("foo bar baz!");
    Map<String, Object> data = toMap(serverError);
    data.put("screen", "screenGrabText");

    try {
      handler.throwIfResponseFailed(createResponse(ErrorCodes.UNHANDLED_ERROR, data));
      fail("Should have thrown!");
    } catch (WebDriverException expected) {
      assertEquals(new WebDriverException(serverError.getMessage()).getMessage(),
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
  public void testShouldDefaultToUnknownServerErrorIfClassIsNotSpecified()
      throws Exception {
    RuntimeException serverError = new RuntimeException("foo bar baz!");
    Map<String, Object> data = toMap(serverError);
    data.remove("class");

    try {
      handler.throwIfResponseFailed(createResponse(ErrorCodes.UNHANDLED_ERROR, data));
      fail("Should have thrown!");
    } catch (WebDriverException expected) {
      assertEquals(new WebDriverException(serverError.getMessage()).getMessage(),
          expected.getMessage());

      Throwable cause = expected.getCause();
      assertNotNull(cause);
      assertEquals(ErrorHandler.UnknownServerException.class, cause.getClass());
      assertEquals(new WebDriverException(serverError.getMessage()).getMessage(),
          cause.getMessage());
      assertStackTracesEqual(serverError.getStackTrace(), cause.getStackTrace());
    }
  }

  @SuppressWarnings({"unchecked", "ThrowableInstanceNeverThrown"})
  public void testShouldStillTryToBuildServerErrorIfClassIsNotProvidedAndStackTraceIsNotForJava() {
    Map<String, ?> data = ImmutableMap.of(
        "message", "some error message",
        "stackTrace", Lists.newArrayList(
            ImmutableMap.of("lineNumber", 1224,
                "methodName", "someMethod",
                "className", "MyClass",
                "fileName", "Resource.m")));
    
    try {
      handler.throwIfResponseFailed(createResponse(ErrorCodes.UNHANDLED_ERROR, data));
      fail("Should have thrown!");
    } catch (WebDriverException expected) {
      assertEquals(new WebDriverException("some error message").getMessage(),
          expected.getMessage());

      StackTraceElement[] expectedTrace = {
          new StackTraceElement("MyClass", "someMethod", "Resource.m", 1224)
      };
      WebDriverException helper = new WebDriverException("some error message");
      helper.setStackTrace(expectedTrace);

      Throwable cause = expected.getCause();
      assertNotNull(cause);
      assertEquals(ErrorHandler.UnknownServerException.class, cause.getClass());
      assertEquals(helper.getMessage(),
          cause.getMessage());

      assertStackTracesEqual(expectedTrace, cause.getStackTrace());
    }
  }

  @SuppressWarnings({"unchecked", "ThrowableInstanceNeverThrown"})
  public void testShouldIndicateWhenTheServerReturnedAnExceptionThatWasSuppressed()
      throws Exception {
    RuntimeException serverError = new RuntimeException("foo bar baz!");

    handler.setIncludeServerErrors(false);

    try {
      handler.throwIfResponseFailed(createResponse(
          ErrorCodes.UNHANDLED_ERROR, toMap(serverError)));
      fail("Should have thrown!");
    } catch (WebDriverException expected) {
      assertDoesNotHaveACause(expected);
      assertThat(expected.getMessage(), containsString(serverError.getMessage()));
      assertThat(expected.getMessage(), containsString(new WebDriverException().getMessage()));
    }
  }

  @SuppressWarnings({"unchecked", "ThrowableInstanceNeverThrown"})
  public void testShouldStillIncludeScreenshotEvenIfServerSideExceptionsAreDisabled()
      throws Exception {
    RuntimeException serverError = new RuntimeException("foo bar baz!");
    Map<String, Object> data = toMap(serverError);
    data.put("screen", "screenGrabText");

    handler.setIncludeServerErrors(false);

    try {
      handler.throwIfResponseFailed(createResponse(
          ErrorCodes.UNHANDLED_ERROR, data));
      fail("Should have thrown!");
    } catch (WebDriverException expected) {
      assertThat(expected.getMessage(), startsWith("foo bar baz!"));

      assertCauseIsOfType(ScreenshotException.class,  expected);
      ScreenshotException screenshot = (ScreenshotException) expected.getCause();
      assertEquals("screenGrabText", screenshot.getBase64EncodedScreenshot());
      assertDoesNotHaveACause(screenshot);
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
