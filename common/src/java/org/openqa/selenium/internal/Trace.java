package org.openqa.selenium.internal;

import java.io.IOException;

import org.openqa.selenium.browserlaunchers.WindowsUtils;

// I am not calling this "log".
public interface Trace {
  void info(String message);

  void warn(Throwable e);
  void warn(String message);
  void warn(String message, Throwable throwable);

  void error(String message);

  void debug(String message);
  void debug(String message, Throwable throwable);
}
