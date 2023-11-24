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

import java.util.Collection;
import java.util.Collections;
import java.util.Set;

/** LocalLogs instance that extracts entries from a logging handler. */
class HandlerBasedLocalLogs extends LocalLogs {
  private final LoggingHandler loggingHandler;
  private final Set<String> logTypesToInclude;

  protected HandlerBasedLocalLogs(LoggingHandler loggingHandler, Set<String> logTypesToInclude) {
    super();
    this.loggingHandler = loggingHandler;
    this.logTypesToInclude = logTypesToInclude;
  }

  @Override
  public LogEntries get(String logType) {
    if (LogType.CLIENT.equals(logType) && logTypesToInclude.contains(logType)) {
      Collection<LogEntry> entries = loggingHandler.getRecords();
      loggingHandler.flush();
      return new LogEntries(entries);
    }
    return new LogEntries(Collections.emptyList());
  }

  @Override
  public Set<String> getAvailableLogTypes() {
    return Collections.singleton(LogType.CLIENT);
  }

  @Override
  public void addEntry(String logType, LogEntry entry) {
    throw new RuntimeException("Log to this instance of LocalLogs using standard Java logging.");
  }
}
