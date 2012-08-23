package org.openqa.selenium.logging;

import com.google.common.collect.Lists;
import com.google.common.collect.Maps;

import java.util.List;
import java.util.Map;
import java.util.Set;

/**
 * LocalLogs instance that has its own storage. This should be used for explicit storing
 * of logs, such as for profiling.
 */
class StoringLocalLogs extends LocalLogs {
  private final Map<String, List<LogEntry>> localLogs = Maps.newHashMap();
  private final Set<String> logTypesToIgnore;

  public StoringLocalLogs(Set<String> logTypesToIgnore) {
    this.logTypesToIgnore = logTypesToIgnore;
  }

  public LogEntries get(String logType) {
    Iterable<LogEntry> toReturn = getLocalLogs(logType);
    localLogs.remove(logType);
    return new LogEntries(toReturn);
  }

  private Iterable<LogEntry> getLocalLogs(String logType) {
    if (localLogs.containsKey(logType)) {
      return localLogs.get(logType);
    }

    return Lists.newArrayList();
  }

  /**
   * Add a new log entry to the local storage.
   *
   * @param logType the log type to store
   * @param entry   the entry to store
   */
  public void addEntry(String logType, LogEntry entry) {
    if (logTypesToIgnore.contains(logType)) {
      return;
    }

    if (!localLogs.containsKey(logType)) {
      localLogs.put(logType, Lists.newArrayList(entry));
    } else {
      localLogs.get(logType).add(entry);
    }
  }

  public Set<String> getAvailableLogTypes() {
    return localLogs.keySet();
  }
}
