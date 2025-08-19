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

import java.util.Collection;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.TreeSet;
import java.util.stream.Collectors;
import org.openqa.selenium.internal.Require;

public class MapConfig implements Config {

  private final Map<String, Map<String, Object>> raw;

  public MapConfig(Map<String, Object> raw) {
    Require.nonNull("Underlying map", raw);

    Map<String, Map<String, Object>> validated = new HashMap<>();

    for (Map.Entry<String, Object> entry : raw.entrySet()) {
      if (!(entry.getValue() instanceof Map)) {
        continue;
      }

      Map<String, Object> values =
          ((Map<?, ?>) entry.getValue())
              .entrySet().stream()
                  .filter(e -> e.getKey() instanceof String)
                  .collect(
                      Collectors.toUnmodifiableMap(
                          e -> String.valueOf(e.getKey()), Map.Entry::getValue));

      validated.put(entry.getKey(), values);
    }

    this.raw = Collections.unmodifiableMap(validated);
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
    if (value == null) {
      return Optional.empty();
    }

    if (value instanceof Collection) {
      Collection<?> collection = (Collection<?>) value;
      // Case when an array of map is used as config
      if (collection.stream().anyMatch(item -> item instanceof Map)) {
        return Optional.of(
            collection.stream()
                .map(item -> (Map<String, Object>) item)
                .map(this::toEntryList)
                .flatMap(Collection::stream)
                .collect(Collectors.toUnmodifiableList()));
      }

      return Optional.of(
          collection.stream()
              .filter(item -> (!(item instanceof Collection)))
              .map(String::valueOf)
              .collect(Collectors.toUnmodifiableList()));
    }

    if (value instanceof Map) {
      return Optional.of(toEntryList((Map<String, Object>) value));
    }

    return Optional.of(List.of(String.valueOf(value)));
  }

  @Override
  public Set<String> getSectionNames() {
    return Set.copyOf(raw.keySet());
  }

  @Override
  public Set<String> getOptions(String section) {
    Require.nonNull("Section name to get options for", section);

    Map<String, Object> values = raw.getOrDefault(section, Map.of());
    return Collections.unmodifiableSortedSet(new TreeSet<>(values.keySet()));
  }
}
