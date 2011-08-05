package org.openqa.selenium.remote;

import org.openqa.selenium.WebDriverException;

import com.google.common.base.Function;
import com.google.common.base.Predicates;
import com.google.common.collect.Iterables;
import static org.openqa.selenium.remote.ErrorCodes.SUCCESS;

import java.lang.reflect.Constructor;
import java.lang.reflect.InvocationTargetException;
import java.util.List;
import java.util.Map;

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
   * @param includeServerErrors Whether to include server-side details in thrown
   *     exceptions if the information is available.
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

  @SuppressWarnings({"unchecked", "ThrowableInstanceNeverThrown"})
  public Response throwIfResponseFailed(Response response) throws RuntimeException {
    if (response.getStatus() == SUCCESS) {
      return response;
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

      @SuppressWarnings({"ThrowableResultOfMethodCallIgnored"})
      Throwable serverError = rebuildServerError(rawErrorData);

      // If serverError is null, then the server did not provide a className (only expected if
      // the server is a Java process) or a stack trace.  The lack of a className is OK, but
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

    Throwable toThrow = createThrowable(outerErrorType,
        new Class<?>[] { String.class, Throwable.class },
        new Object[] { message, cause });

    if (toThrow == null) {
      toThrow = createThrowable(outerErrorType,
          new Class<?>[] { String.class },
          new Object[] { message });
    }

    if (toThrow == null) {
      throw new WebDriverException(message, cause);
    }

    if (toThrow instanceof RuntimeException) {
      throw (RuntimeException) toThrow;
    } else {
      throw new WebDriverException(toThrow);
    }
  }

  @SuppressWarnings({"ErrorNotRethrown"})
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
        if (Throwable.class.isAssignableFrom(clazz)) {
          @SuppressWarnings({"unchecked"})
          Class<? extends Throwable> throwableType = (Class<? extends Throwable>) clazz;
          toReturn = createThrowable(throwableType, new Class<?>[] { String.class },
              new Object[] { message });
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
   * Exception used as a place holder if the server returns an error without a
   * stack trace.
   */
  public static class UnknownServerException extends WebDriverException {
    private UnknownServerException(String s) {
      super(s);
    }
  }

  /**
   * Function that can rebuild a {@link StackTraceElement} from the frame info
   * included with a WebDriver JSON response.
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
