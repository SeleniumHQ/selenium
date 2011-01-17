package org.openqa.selenium.internal;

// I am not calling this "log".
public interface Trace {
  void info(String message);

  void warn(Throwable e);
  void warn(String message);
  void warn(String message, Throwable throwable);

  void error(String message);
  void error(String message, Throwable throwable);

  void debug(String message);
  void debug(String message, Throwable throwable);
}
