package org.openqa.selenium.logging;

import com.google.common.collect.ImmutableSet;
import com.google.common.collect.Lists;

import java.util.List;
import java.util.Set;

/**
 * LocalLogs instance that extracts entries from a logging handler.
  */
class HandlerBasedLocalLogs extends LocalLogs {
  final LoggingHandler loggingHandler;
  final Set<String> logTypesToInclude;

  protected HandlerBasedLocalLogs(LoggingHandler loggingHandler, Set<String> logTypesToInclude) {
    super();
    this.loggingHandler = loggingHandler;
    this.logTypesToInclude = logTypesToInclude;
  }

  public LogEntries get(String logType) {
    if (LogType.CLIENT.equals(logType) && logTypesToInclude.contains(logType)) {
      List<LogEntry> entries = loggingHandler.getRecords();
      loggingHandler.flush();
      return new LogEntries(entries);
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
