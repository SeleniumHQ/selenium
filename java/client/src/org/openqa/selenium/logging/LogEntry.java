/*
Copyright 2007-2011 WebDriver committers

Portions copyright 2011 Software Freedom Conservatory

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

import java.util.Date;
import java.util.logging.Level;

/**
 * Represents a single log statement.
 */
public class LogEntry {
  private final int level;
  private final long timestamp;
  private final String message;

  /**
   * @param level the integer value of the level.
   * @param timestamp long value of the timestamp at which this log entry
   *     was created.
   * @param message String the log's message.
   */
  public LogEntry(int level, long timestamp, String message) {
    this.level = level;
    this.timestamp = timestamp;
    this.message = message;
  }

  public int getLevel() {
    return level;
  }

  public long getTimestamp() {
    return timestamp;
  }

  public String getMessage() {
    return message;
  }

  @Override
  public String toString() {
    return String.format("[%d] %s %s ", level, timestamp, message);
  }
}
