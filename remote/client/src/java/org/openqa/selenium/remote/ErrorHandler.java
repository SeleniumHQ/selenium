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
  private static final String UNKNOWN_FILE = "<unknown file>";

  private final ErrorCodes errorCodes = new ErrorCodes();

  private boolean includeServerErrors;

  public ErrorHandler() {
    this(false);
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

    Class<? extends RuntimeException> outerErrorType =
        errorCodes.getExceptionType(response.getStatus());

    Object value = response.getValue();
    String message = null;
    Throwable cause = null;

    if (!(value instanceof Map)) {
      message = value == null ? null : String.valueOf(value);
    } else {
      Map<String, Object> rawErrorData;
      try {
        rawErrorData =  (Map<String, Object>) response.getValue();
        message = (String) rawErrorData.get(MESSAGE);
        if (includeServerErrors) {
          cause = rebuildServerError(rawErrorData);
        }
        if (rawErrorData.containsKey(SCREEN_SHOT)) {
          cause = new ScreenshotException((String) rawErrorData.get(SCREEN_SHOT), cause);
        }
      } catch (ClassCastException e) {
        // Ok, try to recover gracefully
        message = String.valueOf(value);
      }
    }

    Throwable toThrow = null;
    try {
      Constructor<? extends Throwable> constructor =
          outerErrorType.getConstructor(String.class, Throwable.class);
      toThrow = constructor.newInstance(message, cause);
    } catch (Exception e) {
      // Fine. fall through
    } catch (OutOfMemoryError error) {
      // It can happen...
    }

    if (toThrow == null) {
      try {
        Constructor<? extends Throwable> constructor =
            outerErrorType.getConstructor(String.class);
        toThrow = constructor.newInstance(message);
      } catch (Exception e) {
        // Fine. fall through
      } catch (OutOfMemoryError error) {
        // It can happen...
      }
    }

    if (toThrow == null) {
      throw new WebDriverException(message, cause);
    }

    if (!(toThrow instanceof RuntimeException)) {
      throw new RuntimeException(toThrow);
    }

    throw (RuntimeException) toThrow;
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
          Constructor<? extends Throwable> constructor =
              throwableType.getConstructor(String.class);
          toReturn = constructor.newInstance(message);
        }
      } catch (ClassNotFoundException ignored) {
        // Ok, fall-through
      } catch (InvocationTargetException e) {
        // Ok, fall-through
      } catch (NoSuchMethodException e) {
        // Ok, fall-through
      } catch (InstantiationException e) {
        // Ok, fall-through
      } catch (IllegalAccessException e) {
        // Ok, fall-through
      }
    }

    if (toReturn == null) {
      toReturn = new UnknownServerException(message);
    }

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
          ? String.valueOf(frameInfo.get(CLASS_NAME)) : UNKNOWN_CLASS;
      String methodName = frameInfo.containsKey(METHOD_NAME)
          ? String.valueOf(frameInfo.get(METHOD_NAME)) : UNKNOWN_METHOD;
      String fileName = frameInfo.containsKey(FILE_NAME)
          ? String.valueOf(frameInfo.get(FILE_NAME)) : UNKNOWN_FILE;

      return new StackTraceElement(className, methodName, fileName,
          lineNumber.intValue());
    }
  }
}
