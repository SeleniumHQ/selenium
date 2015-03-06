package org.openqa.selenium.logging;

import com.google.common.collect.Sets;

import java.util.Set;

/**
 * LocalLogs implementation that holds two other local logs.
 * NOTE: The two local logs are not equal.
 * The first LocalLogs instance is assumed to pre-define which log types
 * it supports, so addEntry will not be called on the first instance unless it pre-declares
 * what it supports.
 * If the first LocalLogs instance does not support this log type, addEntry will be called
 * on the second LocalLogs instance.
 */
class CompositeLocalLogs extends LocalLogs {
  private LocalLogs predefinedTypeLogger;
  private LocalLogs allTypesLogger;

  protected CompositeLocalLogs(LocalLogs predefinedTypeLogger, LocalLogs allTypesLogger) {
    super();
    this.predefinedTypeLogger = predefinedTypeLogger;
    this.allTypesLogger = allTypesLogger;
  }

  @Override
  public LogEntries get(String logType) {
    if (predefinedTypeLogger.getAvailableLogTypes().contains(logType)) {
      return predefinedTypeLogger.get(logType);
    }

    return allTypesLogger.get(logType);
  }

  public Set<String> getAvailableLogTypes() {
    return Sets.union(predefinedTypeLogger.getAvailableLogTypes(), allTypesLogger.getAvailableLogTypes());
  }

  @Override
  public void addEntry(String logType, LogEntry entry) {
    if (predefinedTypeLogger.getAvailableLogTypes().contains(logType)) {
      predefinedTypeLogger.addEntry(logType, entry);
    } else {
      allTypesLogger.addEntry(logType, entry);
    }
  }
}
