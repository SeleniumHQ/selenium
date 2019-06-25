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
package org.openqa.selenium.devtools.page.model;

import org.openqa.selenium.devtools.DevToolsException;
import org.openqa.selenium.json.JsonInput;

import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

/**
 * Returns navigation history for the current page.
 */
public class NavigationHistory {

  /**
   * Index of the current navigation history entry.
   */
  private final int currentIndex;
  /**
   * Array of navigation history entries.
   */
  private final List<NavigationEntry> entries;

  public NavigationHistory(Integer currentIndex,
                           List<NavigationEntry> entries) {
    this.currentIndex = Objects.requireNonNull(currentIndex, "currentIndex is missing");
    this.entries = validateNavEntry(entries);
  }

  private static NavigationHistory fromJson(JsonInput input) {
    Integer currentIndex = input.read(Integer.class);
    List<NavigationEntry> entries = null;
    while (input.hasNext()) {
      switch (input.nextName()) {
        case "entries":
          input.beginArray();
          entries = new ArrayList<>();
          while (input.hasNext()) {
            entries.add(input.read(NavigationEntry.class));
          }
          input.endArray();
          break;
      }
    }
    return new NavigationHistory(currentIndex, entries);
  }

  private List<NavigationEntry> validateNavEntry(List<NavigationEntry> entries) {
    Objects.requireNonNull(entries, "entries are missing");
    if (entries.isEmpty()) {
      throw new DevToolsException("entries list is empty");
    }
    return entries;
  }

  public int getCurrentIndex() {
    return currentIndex;
  }

  public List<NavigationEntry> getEntries() {
    return entries;
  }
}
