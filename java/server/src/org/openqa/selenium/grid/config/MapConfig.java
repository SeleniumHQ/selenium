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

import com.google.common.collect.ImmutableList;
import com.google.common.collect.ImmutableMap;
import com.google.common.collect.ImmutableSet;
import com.google.common.collect.ImmutableSortedSet;

import org.openqa.selenium.internal.Require;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;

public class MapConfig implements Config {

  private final Map<String, Map<String, Object>> raw;

  public MapConfig(Map<String, Object> raw) {
    Require.nonNull("Underlying map", raw);

    ImmutableMap.Builder<String, Map<String, Object>> builder = ImmutableMap.builder();
    for (Map.Entry<String, Object> entry : raw.entrySet()) {
      if (!(entry.getValue() instanceof Map)) {
        continue;
      }

      ImmutableMap<String, Object> values = ((Map<?, ?>) entry.getValue()).entrySet().stream()
        .filter(e -> e.getKey() instanceof String)
        .collect(ImmutableMap.toImmutableMap(e -> String.valueOf(e.getKey()), Map.Entry::getValue));

      builder.put(entry.getKey(), values);
    }

    this.raw = builder.build();
  }

  @Override
  public Optional<List<String>> getAll(String section, String option) {
    Require.nonNull("Section name", section);
    Require.nonNull("Option name", option);

    Map<String, Object> rawSection = raw.get(section);
    if (rawSection == null) {
      return Optional.empty();
    }

    Object value = rawSection.get(option);
    return value == null ? Optional.empty() : Optional.of(ImmutableList.of(String.valueOf(value)));
  }

  @Override
  public Set<String> getSectionNames() {
    return ImmutableSet.copyOf(raw.keySet());
  }

  @Override
  public Set<String> getOptions(String section) {
    Require.nonNull("Section name to get options for", section);

    Map<String, Object> values = raw.getOrDefault(section, ImmutableMap.of());
    return ImmutableSortedSet.copyOf(values.keySet());
  }
}
