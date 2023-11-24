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

import java.util.ArrayDeque;
import java.util.Collection;
import java.util.Collections;
import java.util.logging.Handler;
import java.util.logging.LogRecord;

/**
 * A custom handler used to record log entries.
 *
 * <p>This handler queues up log records as they come, up to MAX_RECORDS (currently 1000) records.
 * If it reaches this capacity it will remove the older records from the queue before adding the
 * next one.
 */
public class LoggingHandler extends Handler {

  private static final int MAX_RECORDS = 1000;
  private ArrayDeque<LogEntry> records = new ArrayDeque<>();
  private static final LoggingHandler INSTANCE = new LoggingHandler();

  private LoggingHandler() {}

  public static LoggingHandler getInstance() {
    return INSTANCE;
  }

  /**
   * @return an unmodifiable list of LogEntry.
   */
  public synchronized Collection<LogEntry> getRecords() {
    return Collections.unmodifiableCollection(records);
  }

  @Override
  public synchronized void publish(LogRecord logRecord) {
    if (isLoggable(logRecord)) {
      if (records.size() > MAX_RECORDS) {
        records.remove();
      }
      records.add(
          new LogEntry(
              logRecord.getLevel(),
              logRecord.getMillis(),
              logRecord.getLoggerName()
                  + " "
                  + logRecord.getSourceClassName()
                  + "."
                  + logRecord.getSourceMethodName()
                  + " "
                  + logRecord.getMessage()));
    }
  }

  @Override
  public synchronized void flush() {
    records = new ArrayDeque<>();
  }

  @Override
  public synchronized void close() throws SecurityException {
    records.clear();
  }
}
