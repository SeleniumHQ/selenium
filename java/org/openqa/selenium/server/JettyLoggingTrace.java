package org.openqa.selenium.server;

import org.apache.commons.logging.Log;
import org.openqa.jetty.log.LogFactory;
import org.openqa.selenium.internal.Trace;

public class JettyLoggingTrace implements Trace {
  private final Log log;

  public JettyLoggingTrace(Class<?> classToLog) {
    log = LogFactory.getLog(classToLog);
  }

  public void debug(String message) {
    log.debug(message);
  }

  public void debug(String message, Throwable throwable) {
    log.debug(message, throwable);
  }

  public void info(String message) {
    log.info(message);
  }

  public void warn(Throwable e) {
    log.warn(e);
  }

  public void warn(String message) {
    log.warn(message);
  }

  public void warn(String message, Throwable throwable) {
    log.warn(message, throwable);
  }

  public void error(String message) {
    log.error(message);
  }
}
