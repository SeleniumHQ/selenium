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

import org.openqa.selenium.Beta;

import java.util.ArrayList;
import java.util.Collections;
import java.util.Iterator;
import java.util.List;
import java.util.function.Predicate;
import java.util.logging.Level;
import java.util.stream.Collectors;

/**
 * Represent a pool of {@link LogEntry}.  This class also provides filtering mechanisms based on
 * levels.
 */
@Beta
public class LogEntries implements Iterable<LogEntry> {

  private final List<LogEntry> entries;

  public LogEntries(Iterable<LogEntry> entries) {
    List<LogEntry> mutableEntries = new ArrayList<>();
    for (LogEntry entry : entries) {
      mutableEntries.add(entry);
    }
    this.entries = Collections.unmodifiableList(mutableEntries);
  }

  /**
   * Get the list of all log entries.
   *
   * @return a view of all {@link LogEntry} fetched
   */
  public List<LogEntry> getAll() {
    return entries;
  }

  /**
   * @param level {@link Level} the level to filter the log entries
   * @return all log entries for that level and above
   */
  public List<LogEntry> filter(Level level) {
    return filter(entry -> entry.getLevel().intValue() >= level.intValue());
  }

  /**
   * @param lowestLevelInclusive {@link Level} the lowest level to filter the log entries
   * @param highestLevelInclusive {@link Level} the highest level to filter the log entries
   * @return all log entries which levels are equal or higher than {@code lowestLevelInclusive} and
   * lower or equal than {@code highestLevelInclusive}
   */
  public List<LogEntry> filter(Level lowestLevelInclusive, Level highestLevelInclusive) {
    return filter(entry -> {
      int logEntryLevel = entry.getLevel().intValue();
      return logEntryLevel >= lowestLevelInclusive.intValue()
             && logEntryLevel <= highestLevelInclusive.intValue();
    });
  }

  private List<LogEntry> filter(Predicate<LogEntry> logEntryPredicate) {
    return entries.stream().filter(logEntryPredicate).collect(Collectors.toList());
  }

  public Iterator<LogEntry> iterator() {
    return entries.iterator();
  }

  @Beta
  public List<LogEntry> toJson() {
    return getAll();
  }
}
