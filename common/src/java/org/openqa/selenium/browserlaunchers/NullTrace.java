package org.openqa.selenium.browserlaunchers;

import org.openqa.selenium.internal.Trace;

public class NullTrace implements Trace {
  public void info(String message) { }

  public void warn(Throwable e) {
    warn("", e);
  }

  public void warn(String message) {
    warn(message, null);
  }

  public void warn(String message, Throwable throwable) {
    StringBuilder missive = new StringBuilder("WARNING: ");
    missive.append(message);
    if (throwable != null) {
      missive.append(". ").append(throwable.getLocalizedMessage());
    }
    System.err.println(missive.toString());
    if (throwable != null) {
      throwable.printStackTrace(System.err);
    }
  }

  public void error(String message) {
    System.err.println("ERROR: " + message);
  }

  public void debug(String message) { }
  public void debug(String message, Throwable throwable) { }
}
