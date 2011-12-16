/*
Copyright 2007-2011 WebDriver committers

Portions copyright 2011 Software Freedom Conservancy

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

import java.util.ArrayList;
import java.util.Collections;
import java.util.Iterator;
import java.util.List;
import java.util.logging.Level;

/**
 * Represent a pool of {@Link LogEntry}. This class also provides filtering
 * mechanisms based on levels.
 */
public class LogEntries implements Iterable<LogEntry> {
  private final List<LogEntry> entries;

  public LogEntries(List<LogEntry> entries) {
    this.entries = new ArrayList<LogEntry>(entries);
  }

  /**
   * @return a view of all {@link LogEntry} fetched.
   */
  public List<LogEntry> getAll() {
    return entries;
  }

  /**
   * @param level {@link Level} The level to filter the log entries.
   * @return all log entries for that level and above.
   */
  public List<LogEntry> filter(Level level) {
    List<LogEntry> toReturn = new ArrayList<LogEntry>();
    for (LogEntry entry : entries) {
      if (entry.getLevel() >= level.intValue()) {
        toReturn.add(entry);
      }
    }
    return toReturn;
  }

  public Iterator<LogEntry> iterator() {
    return entries.iterator();
  }
}
