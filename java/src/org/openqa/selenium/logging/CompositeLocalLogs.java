// Licensed to the Software Freedom Conservancy (SFC) under one
// or more contributor license agreements.  See the NOTICE file
// distributed with this work for additional information
// regarding copyright ownership.  The SFC licenses this file
// to you under the Apache License, Version 2.0 (the
// "License"); you may not use this file except in compliance
// with the License.  You may obtain a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing,
// software distributed under the License is distributed on an
// "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
// KIND, either express or implied.  See the License for the
// specific language governing permissions and limitations
// under the License.

package org.openqa.selenium.logging;

import java.util.Set;
import java.util.TreeSet;

/**
 * LocalLogs implementation that holds two other local logs. NOTE: The two local logs are not equal.
 * The first LocalLogs instance is assumed to pre-define which log types it supports, so addEntry
 * will not be called on the first instance unless it pre-declares what it supports. If the first
 * LocalLogs instance does not support this log type, addEntry will be called on the second
 * LocalLogs instance.
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

  @Override
  public Set<String> getAvailableLogTypes() {
    TreeSet<String> toReturn = new TreeSet<>();
    toReturn.addAll(predefinedTypeLogger.getAvailableLogTypes());
    toReturn.addAll(allTypesLogger.getAvailableLogTypes());
    return toReturn;
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
