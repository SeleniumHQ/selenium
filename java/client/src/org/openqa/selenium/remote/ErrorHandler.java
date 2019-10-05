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

import static org.openqa.selenium.remote.ErrorCodes.SUCCESS;

import com.google.common.base.Throwables;
import com.google.common.primitives.Ints;

import org.openqa.selenium.UnhandledAlertException;
import org.openqa.selenium.WebDriverException;

import java.lang.reflect.Constructor;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.function.Function;

/**
 * Maps exceptions to status codes for sending over the wire.
 */
public class ErrorHandler {

  private static final String MESSAGE = "message";
  private static final String SCREEN_SHOT = "screen";
  private static final String CLASS = "class";
  private static final String STACK_TRACE = "stackTrace";
  private static final String LINE_NUMBER = "lineNumber";
  private static final String METHOD_NAME = "methodName";
  private static final String CLASS_NAME = "className";
  private static final String FILE_NAME = "fileName";
  private static final String UNKNOWN_CLASS = "<anonymous class>";
  private static final String UNKNOWN_METHOD = "<anonymous method>";
  private static final String UNKNOWN_FILE = null;

  private ErrorCodes errorCodes;

  private boolean includeServerErrors;

  public ErrorHandler() {
    this(true);
  }

  /**
   * @param includeServerErrors Whether to include server-side details in thrown exceptions if the
   *        information is available.
   */
  public ErrorHandler(boolean includeServerErrors) {
    this.includeServerErrors = includeServerErrors;
    this.errorCodes = new ErrorCodes();
  }

  /**
   * @param includeServerErrors Whether to include server-side details in thrown exceptions if the
   *        information is available.
   * @param codes The ErrorCodes object to use for linking error codes to exceptions.
   */
  public ErrorHandler(ErrorCodes codes, boolean includeServerErrors) {
    this.includeServerErrors = includeServerErrors;
    this.errorCodes = codes;
  }

  public boolean isIncludeServerErrors() {
    return includeServerErrors;
  }

  public void setIncludeServerErrors(boolean includeServerErrors) {
    this.includeServerErrors = includeServerErrors;
  }

  @SuppressWarnings("unchecked")
  public Response throwIfResponseFailed(Response response, long duration) throws RuntimeException {
    if (response.getStatus() == null || response.getStatus() == SUCCESS) {
      return response;
    }

    if (response.getValue() instanceof Throwable) {
      Throwable throwable = (Throwable) response.getValue();
      Throwables.throwIfUnchecked(throwable);
      throw new RuntimeException(throwable);
    }

    Class<? extends WebDriverException> outerErrorType =
        errorCodes.getExceptionType(response.getStatus());

    Object value = response.getValue();
    String message = null;
    Throwable cause = null;

    if (value instanceof Map) {
      Map<String, Object> rawErrorData = (Map<String, Object>) value;
      if (!rawErrorData.containsKey(MESSAGE) && rawErrorData.containsKey("value")) {
        try {
          rawErrorData = (Map<String, Object>) rawErrorData.get("value");
        } catch (ClassCastException cce) {}
      }
      try {
        message = (String) rawErrorData.get(MESSAGE);
      } catch (ClassCastException e) {
        // Ok, try to recover gracefully.
        message = String.valueOf(e);
      }

      Throwable serverError = rebuildServerError(rawErrorData, response.getStatus());

      // If serverError is null, then the server did not provide a className (only expected if
      // the server is a Java process) or a stack trace. The lack of a className is OK, but
      // not having a stacktrace really hurts our ability to debug problems.
      if (serverError == null) {
        if (includeServerErrors) {
          // TODO: this should probably link to a wiki article with more info.
          message += " (WARNING: The server did not provide any stacktrace information)";
        }
      } else if (!includeServerErrors) {
        // TODO: wiki article with more info.
        message += " (WARNING: The client has suppressed server-side stacktraces)";
      } else {
        cause = serverError;
        if (cause.getStackTrace() == null || cause.getStackTrace().length == 0) {
          message += " (WARNING: The server did not provide any stacktrace information)";
        }
      }

      if (rawErrorData.get(SCREEN_SHOT) != null) {
        cause = new ScreenshotException(String.valueOf(rawErrorData.get(SCREEN_SHOT)), cause);
      }
    } else if (value != null) {
      message = String.valueOf(value);
    }

    String duration1 = duration(duration);

    if (message != null && !message.contains(duration1)) {
      message = message + duration1;
    }

    WebDriverException toThrow = null;

    if (outerErrorType.equals(UnhandledAlertException.class)
        && value instanceof Map) {
      toThrow = createUnhandledAlertException(value);
    }

    if (toThrow == null) {
      toThrow = createThrowable(outerErrorType,
                                new Class<?>[] {String.class, Throwable.class, Integer.class},
                                new Object[] {message, cause, response.getStatus()});
    }

    if (toThrow == null) {
      toThrow = createThrowable(outerErrorType,
          new Class<?>[] {String.class, Throwable.class},
          new Object[] {message, cause});
    }

    if (toThrow == null) {
      toThrow = createThrowable(outerErrorType,
          new Class<?>[] {String.class},
          new Object[] {message});
    }

    if (toThrow == null) {
      toThrow = new WebDriverException(message, cause);
    }

    throw toThrow;
  }

  @SuppressWarnings("unchecked")
  private UnhandledAlertException createUnhandledAlertException(Object value) {
    Map<String, Object> rawErrorData = (Map<String, Object>) value;
    if (rawErrorData.containsKey("alert") || rawErrorData.containsKey("alertText")) {
      Object alertText = rawErrorData.get("alertText");
      if (alertText == null) {
        Map<String, Object> alert = (Map<String, Object>) rawErrorData.get("alert");
        if (alert != null) {
          alertText = alert.get("text");
        }
      }
      return createThrowable(UnhandledAlertException.class,
          new Class<?>[] {String.class, String.class},
          new Object[] {rawErrorData.get("message"), alertText});
    }
    return null;
  }

  private String duration(long duration) {
    String prefix = "\nCommand duration or timeout: ";
    if (duration < 1000) {
      return prefix + duration + " milliseconds";
    }
    return prefix + (new BigDecimal(duration).divide(new BigDecimal(1000)).setScale(2, RoundingMode.HALF_UP)) + " seconds";
  }

  private <T extends Throwable> T createThrowable(
      Class<T> clazz, Class<?>[] parameterTypes, Object[] parameters) {
    try {
      Constructor<T> constructor = clazz.getConstructor(parameterTypes);
      return constructor.newInstance(parameters);
    } catch (OutOfMemoryError | ReflectiveOperationException e) {
      // Do nothing - fall through.
    }
    return null;
  }

  private Throwable rebuildServerError(Map<String, Object> rawErrorData, int responseStatus) {

    if (rawErrorData.get(CLASS) == null && rawErrorData.get(STACK_TRACE) == null) {
      // Not enough information for us to try to rebuild an error.
      return null;
    }

    Throwable toReturn = null;
    String message = (String) rawErrorData.get(MESSAGE);
    Class<?> clazz = null;

    // First: allow Remote Driver to specify the Selenium Server internal exception
    if (rawErrorData.get(CLASS) != null) {
      String className = (String) rawErrorData.get(CLASS);
      try {
        clazz = Class.forName(className);
      } catch (ClassNotFoundException ignored) {
        // Ok, fall-through
      }
    }

    // If the above fails, map Response Status to Exception class
    if (null == clazz) {
      clazz = errorCodes.getExceptionType(responseStatus);
    }

    if (clazz.equals(UnhandledAlertException.class)) {
      toReturn = createUnhandledAlertException(rawErrorData);
    } else if (Throwable.class.isAssignableFrom(clazz)) {
      @SuppressWarnings({"unchecked"})
      Class<? extends Throwable> throwableType = (Class<? extends Throwable>) clazz;
      toReturn = createThrowable(
          throwableType,
          new Class<?>[] {String.class},
          new Object[] {message});
    }

    if (toReturn == null) {
      toReturn = new UnknownServerException(message);
    }

    // Note: if we have a class name above, we should always have a stack trace.
    // The inverse is not always true.
    StackTraceElement[] stackTrace = new StackTraceElement[0];
    if (rawErrorData.get(STACK_TRACE) != null) {
      @SuppressWarnings({"unchecked"})
      List<Map<String, Object>> stackTraceInfo =
          (List<Map<String, Object>>) rawErrorData.get(STACK_TRACE);

      stackTrace = stackTraceInfo.stream()
          .map(entry -> new FrameInfoToStackFrame().apply(entry))
          .filter(Objects::nonNull)
          .toArray(StackTraceElement[]::new);
    }

    toReturn.setStackTrace(stackTrace);
    return toReturn;
  }

  /**
   * Exception used as a place holder if the server returns an error without a stack trace.
   */
  public static class UnknownServerException extends WebDriverException {
    private UnknownServerException(String s) {
      super(s);
    }
  }

  /**
   * Function that can rebuild a {@link StackTraceElement} from the frame info included with a
   * WebDriver JSON response.
   */
  private static class FrameInfoToStackFrame
      implements Function<Map<String, Object>, StackTraceElement> {
    @Override
    public StackTraceElement apply(Map<String, Object> frameInfo) {
      if (frameInfo == null) {
        return null;
      }

      Optional<Number> maybeLineNumberInteger = Optional.empty();

      final Object lineNumberObject = frameInfo.get(LINE_NUMBER);
      if (lineNumberObject instanceof Number) {
        maybeLineNumberInteger = Optional.of((Number) lineNumberObject);
      } else if (lineNumberObject != null) {
        // might be a Number as a String
        maybeLineNumberInteger = Optional.ofNullable(Ints.tryParse(lineNumberObject.toString()));
      }

      // default -1 for unknown, see StackTraceElement constructor javadoc
      final int lineNumber = maybeLineNumberInteger.orElse(-1).intValue();

      // Gracefully handle remote servers that don't (or can't) send back
      // complete stack trace info. At least some of this information should
      // be included...
      String className = frameInfo.containsKey(CLASS_NAME) ?
                         toStringOrNull(frameInfo.get(CLASS_NAME)) : UNKNOWN_CLASS;
      String methodName = frameInfo.containsKey(METHOD_NAME) ?
                          toStringOrNull(frameInfo.get(METHOD_NAME)) : UNKNOWN_METHOD;
      String fileName = frameInfo.containsKey(FILE_NAME) ?
                        toStringOrNull(frameInfo.get(FILE_NAME)) : UNKNOWN_FILE;

      return new StackTraceElement(
          className,
          methodName,
          fileName,
          lineNumber);
    }

    private static String toStringOrNull(Object o) {
      return o == null ? null : o.toString();
    }
  }
}
