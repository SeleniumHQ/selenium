package org.openqa.selenium.internal;

public class NullTrace implements Trace {
  public void info(String message) { }

  public void warn(Throwable e) {
    warn("", e);
  }

  public void warn(String message) {
    warn(message, null);
  }

  public void warn(String message, Throwable throwable) {
    logMessage("WARNING: ", message, throwable);
  }

  public void error(String message) {
    System.err.println("ERROR: " + message);
  }

  public void error(String message, Throwable throwable) {
    logMessage("ERROR: ", message, throwable);

  }

  public void debug(Throwable e) { } 
  public void debug(String message) { }
  public void debug(String message, Throwable throwable) { }

  private void logMessage(String type, String message, Throwable throwable) {
    StringBuilder missive = new StringBuilder(type);
    missive.append(message);
    if (throwable != null) {
      missive.append(". ").append(throwable.getLocalizedMessage());
    }
    System.err.println(missive.toString());
    if (throwable != null) {
      throwable.printStackTrace(System.err);
    }
  }
}
