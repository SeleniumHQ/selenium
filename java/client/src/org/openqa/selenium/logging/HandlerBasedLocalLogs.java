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
