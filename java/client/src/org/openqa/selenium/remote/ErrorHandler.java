/*
Copyright 2012 Selenium committers
Copyright 2012 Software Freedom Conservancy

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

import com.google.common.base.Function;
import com.google.common.base.Predicates;
import com.google.common.base.Throwables;
import com.google.common.collect.Iterables;

import org.openqa.selenium.UnhandledAlertException;
import org.openqa.selenium.WebDriverException;

import java.lang.reflect.Constructor;
import java.lang.reflect.InvocationTargetException;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.Map;

import static org.openqa.selenium.remote.ErrorCodes.SUCCESS;

/**
 * Maps exceptions to status codes for sending over the wire.
 * 
 * @author jmleyba@gmail.com (Jason Leyba)
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

  private final ErrorCodes errorCodes = new ErrorCodes();

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
  }

  public boolean isIncludeServerErrors() {
    return includeServerErrors;
  }

  public void setIncludeServerErrors(boolean includeServerErrors) {
    this.includeServerErrors = includeServerErrors;
  }

  @SuppressWarnings("unchecked")
  public Response throwIfResponseFailed(Response response, long duration) throws RuntimeException {
    if (response.getStatus() == SUCCESS) {
      return response;
    }
    
    if (response.getValue() instanceof Throwable) {
      throw Throwables.propagate((Throwable) response.getValue());
    }

    Class<? extends WebDriverException> outerErrorType =
        errorCodes.getExceptionType(response.getStatus());

    Object value = response.getValue();
    String message = null;
    Throwable cause = null;

    if (value instanceof Map) {
      Map<String, Object> rawErrorData = (Map<String, Object>) value;
      try {
        message = (String) rawErrorData.get(MESSAGE);
      } catch (ClassCastException e) {
        // Ok, try to recover gracefully.
        message = String.valueOf(e);
      }

      Throwable serverError = rebuildServerError(rawErrorData);

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
      }

      if (rawErrorData.get(SCREEN_SHOT) != null) {
        cause = new ScreenshotException(String.valueOf(rawErrorData.get(SCREEN_SHOT)), cause);
      }
    } else if (value != null) {
      message = String.valueOf(value);
    }

    String duration1 = duration(duration);

    if (message != null && message.indexOf(duration1) == -1) {
      message = message + duration1;
    }

    WebDriverException toThrow = null;

    if (outerErrorType.equals(UnhandledAlertException.class)
        && value instanceof Map) {
      toThrow = createUnhandledAlertException(value);
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

    toThrow.setSessionId(response.getSessionId());
    throw toThrow;
  }

  @SuppressWarnings("unchecked")
  private UnhandledAlertException createUnhandledAlertException(Object value) {
    Map<String, Object> rawErrorData = (Map<String, Object>) value;
    if (rawErrorData.containsKey("alert")) {
      Map<String, Object> alert = (Map<String, Object>) rawErrorData.get("alert");
      return createThrowable(UnhandledAlertException.class,
          new Class<?>[] {String.class, String.class},
          new Object[] {rawErrorData.get("message"), alert.get("text")});
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
    } catch (NoSuchMethodException e) {
      // Do nothing - fall through.
    } catch (InvocationTargetException e) {
      // Do nothing - fall through.
    } catch (InstantiationException e) {
      // Do nothing - fall through.
    } catch (IllegalAccessException e) {
      // Do nothing - fall through.
    } catch (OutOfMemoryError error) {
      // It can happen...
    }
    return null;
  }

  private Throwable rebuildServerError(Map<String, Object> rawErrorData) {

    if (!rawErrorData.containsKey(CLASS) && !rawErrorData.containsKey(STACK_TRACE)) {
      // Not enough information for us to try to rebuild an error.
      return null;
    }

    Throwable toReturn = null;
    String message = (String) rawErrorData.get(MESSAGE);

    if (rawErrorData.containsKey(CLASS)) {
      String className = (String) rawErrorData.get(CLASS);
      try {
        Class clazz = Class.forName(className);
        if (clazz.equals(UnhandledAlertException.class)) {
          toReturn = createUnhandledAlertException(rawErrorData);
        } else if (Throwable.class.isAssignableFrom(clazz)) {
          @SuppressWarnings({"unchecked"})
          Class<? extends Throwable> throwableType = (Class<? extends Throwable>) clazz;
          toReturn = createThrowable(throwableType, new Class<?>[] {String.class},
              new Object[] {message});
        }
      } catch (ClassNotFoundException ignored) {
        // Ok, fall-through
      }
    }

    if (toReturn == null) {
      toReturn = new UnknownServerException(message);
    }

    // Note: if we have a class name above, we should always have a stack trace.
    // The inverse is not always true.
    StackTraceElement[] stackTrace = new StackTraceElement[0];
    if (rawErrorData.containsKey(STACK_TRACE)) {
      @SuppressWarnings({"unchecked"})
      List<Map<String, Object>> stackTraceInfo =
          (List<Map<String, Object>>) rawErrorData.get(STACK_TRACE);
      Iterable<StackTraceElement> stackFrames =
          Iterables.transform(stackTraceInfo, new FrameInfoToStackFrame());
      stackFrames = Iterables.filter(stackFrames, Predicates.notNull());
      stackTrace = Iterables.toArray(stackFrames, StackTraceElement.class);
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
    public StackTraceElement apply(Map<String, Object> frameInfo) {
      if (frameInfo == null) {
        return null;
      }

      Number lineNumber = (Number) frameInfo.get(LINE_NUMBER);
      if (lineNumber == null) {
        return null;
      }

      // Gracefully handle remote servers that don't (or can't) send back
      // complete stack trace info. At least some of this information should
      // be included...
      String className = frameInfo.containsKey(CLASS_NAME)
          ? toStringOrNull(frameInfo.get(CLASS_NAME)) : UNKNOWN_CLASS;
      String methodName = frameInfo.containsKey(METHOD_NAME)
          ? toStringOrNull(frameInfo.get(METHOD_NAME)) : UNKNOWN_METHOD;
      String fileName = frameInfo.containsKey(FILE_NAME)
          ? toStringOrNull(frameInfo.get(FILE_NAME)) : UNKNOWN_FILE;

      return new StackTraceElement(className, methodName, fileName,
          lineNumber.intValue());
    }

    private static String toStringOrNull(Object o) {
      return o == null ? null : o.toString();
    }
  }
}
