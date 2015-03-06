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
  private final Set<String> logTypesToInclude;

  public StoringLocalLogs(Set<String> logTypesToInclude) {
    this.logTypesToInclude = logTypesToInclude;
  }

  public LogEntries get(String logType) {
    return new LogEntries(getLocalLogs(logType));
  }

  private Iterable<LogEntry> getLocalLogs(String logType) {
    if (localLogs.containsKey(logType)) {
      List<LogEntry> entries = localLogs.get(logType);
      localLogs.put(logType, Lists.<LogEntry>newArrayList());
      return entries;
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
    if (!logTypesToInclude.contains(logType)) {
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
