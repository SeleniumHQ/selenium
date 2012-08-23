package org.openqa.selenium.logging;

import com.google.common.collect.ImmutableSet;
import com.google.common.collect.Lists;

import java.util.Set;

/**
 * LocalLogs instance that extracts entries from a logging handler.
  */
class HandlerBasedLocalLogs extends LocalLogs {
  final LoggingHandler loggingHandler;

  protected HandlerBasedLocalLogs(LoggingHandler loggingHandler) {
    super();
    this.loggingHandler = loggingHandler;
  }

  public LogEntries get(String logType) {
    if (LogType.CLIENT.equals(logType)) {
      return new LogEntries(loggingHandler.getRecords());
    }
    return new LogEntries(Lists.<LogEntry>newArrayList());
  }

  public Set<String> getAvailableLogTypes() {
    return ImmutableSet.<String>of(LogType.CLIENT);
  }

  public void addEntry(String logType, LogEntry entry) {
    throw new RuntimeException("Log to this instance of LocalLogs using standard Java logging.");
  }
}
