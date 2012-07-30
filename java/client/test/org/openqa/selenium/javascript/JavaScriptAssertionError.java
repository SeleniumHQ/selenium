package org.openqa.selenium.javascript;

class JavaScriptAssertionError extends AssertionError {

  public JavaScriptAssertionError(String message) {
    super(message);
  }

  @Override
  public Throwable fillInStackTrace() {
    return this;  // No java stack traces.
  }

  @Override
  public void setStackTrace(StackTraceElement[] stackTraceElements) {
    // No java stack traces.
  }
}
