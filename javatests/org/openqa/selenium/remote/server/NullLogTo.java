package org.openqa.selenium.remote.server;

import org.openqa.selenium.internal.Trace;

class NullLogTo implements Trace {
  public void info(String message) {
  }

  public void warn(Throwable e) {
  }

  public void warn(String message) {
  }

  public void warn(String message, Throwable throwable) {
  }

  public void error(String message) {
  }

  public void error(String message, Throwable throwable) {
  }

  public void debug(Throwable e) {
  }

  public void debug(String message) {
  }

  public void debug(String message, Throwable throwable) {
  }
}
