package org.openqa.selenium.browserlaunchers;

import org.openqa.selenium.internal.Trace;

public class NullTrace implements Trace {
  public void info(String message) { }

  public void warn(Throwable e) { }
  public void warn(String message) { }
  public void warn(String message, Throwable throwable) { }

  public void error(String message) { }

  public void debug(String message) { }
  public void debug(String message, Throwable throwable) { }
}
