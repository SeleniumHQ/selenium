/*
Copyright 2012 Software Freedom Conservancy

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

     http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

package org.openqa.selenium.logging;

import com.google.common.collect.ImmutableSet;
import com.google.common.collect.Lists;
import com.google.common.collect.Maps;

import java.util.List;
import java.util.Map;
import java.util.Set;

/**
 * Stores and retrieves logs in-process (i.e. without any RPCs).
 */
public class LocalLogs implements Logs {

  /**
   * Logger which doesn't do anything.
   */
  public static final LocalLogs NULL_LOGGER = new LocalLogs() {
    public void addEntry(String logType, LogEntry entry) {
    }
  };

  private final Map<String, List<LogEntry>> localLogs = Maps.newHashMap();
  private final Set<String> logTypesToIgnore;

  public LocalLogs() {
    logTypesToIgnore = ImmutableSet.of();
  }

  public LocalLogs(Set<String> logTypesToIgnore) {
    this.logTypesToIgnore = logTypesToIgnore;
  }

  public LogEntries get(String logType) {
    // TODO(andreastt): Should presumably clear the logs of that type to reduce memory consumption
    return new LogEntries(getLocalLogs(logType));
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