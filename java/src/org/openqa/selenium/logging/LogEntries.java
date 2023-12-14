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

import static java.util.Collections.unmodifiableList;
import static java.util.stream.Collectors.toList;

import java.util.Iterator;
import java.util.List;
import java.util.stream.StreamSupport;
import org.openqa.selenium.Beta;

/**
 * Represent a pool of {@link LogEntry}. This class also provides filtering mechanisms based on
 * levels.
 */
@Beta
public class LogEntries implements Iterable<LogEntry> {

  private final List<LogEntry> entries;

  public LogEntries(Iterable<LogEntry> entries) {
    this.entries =
        unmodifiableList(StreamSupport.stream(entries.spliterator(), false).collect(toList()));
  }

  /**
   * Get the list of all log entries.
   *
   * @return a view of all {@link LogEntry} fetched
   */
  public List<LogEntry> getAll() {
    return entries;
  }

  @Override
  public Iterator<LogEntry> iterator() {
    return entries.iterator();
  }

  @Beta
  public List<LogEntry> toJson() {
    return getAll();
  }
}
