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

package org.openqa.selenium.grid.config;

import org.openqa.selenium.internal.Require;

import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

public class MemoizingConfig implements Config {

  private final ConcurrentHashMap<String, Object> memoizedConfig;
  private final Config delegate;

  public MemoizingConfig(Config config) {
    this.memoizedConfig = new ConcurrentHashMap<>();
    this.delegate = config;
  }

  @Override
  public Set<String> getSectionNames() {
    if (memoizedConfig.containsKey("sectionNames")) {
      return (Set<String>) memoizedConfig.get("sectionNames");
    }

    Set<String> sectionNames = delegate.getSectionNames();
    memoizedConfig.put("sectionNames", sectionNames);

    return sectionNames;
  }

  @Override
  public Set<String> getOptions(String section) {
    Require.nonNull("Section name to get options for", section);

    if(memoizedConfig.containsKey(section)) {
      return (Set<String>) memoizedConfig.get(section);
    }

    Set<String> options = delegate.getOptions(section);
    memoizedConfig.put(section, options);

    return options;
  }

  @Override
  public Optional<List<String>> getAll(String section, String option) {
    if (memoizedConfig.containsKey("allLists")) {
      return (Optional<List<String>>) memoizedConfig.get("allLists");
    }

    Optional<List<String>> allLists = delegate.getAll(section, option);
    memoizedConfig.put("allLists", allLists);

    return allLists;
  }
}
