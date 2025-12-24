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

import static java.util.Collections.emptyMap;
import static java.util.stream.Collectors.toUnmodifiableList;
import static java.util.stream.Collectors.toUnmodifiableMap;

import com.google.common.collect.ImmutableSortedSet;
import java.util.Collection;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import org.openqa.selenium.internal.Require;

public class MapConfig implements Config {

  private final Map<String, Map<String, Object>> raw;

  public MapConfig() {
    this(emptyMap());
  }

  public MapConfig(Map<String, Object> raw) {
    Require.nonNull("Underlying map", raw);

    this.raw =
        raw.entrySet().stream()
            .filter(entry -> entry.getValue() instanceof Map)
            .collect(
                toUnmodifiableMap(
                    entry -> entry.getKey(),
                    entry ->
                        ((Map<?, ?>) entry.getValue())
                            .entrySet().stream()
                                .filter(e -> e.getKey() instanceof String)
                                .collect(
                                    toUnmodifiableMap(
                                        e -> String.valueOf(e.getKey()), e -> e.getValue()))));
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
                .collect(toUnmodifiableList()));
      }

      return Optional.of(
          collection.stream()
              .filter(item -> (!(item instanceof Collection)))
              .map(String::valueOf)
              .collect(toUnmodifiableList()));
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

    Map<String, Object> values = raw.getOrDefault(section, emptyMap());
    return ImmutableSortedSet.copyOf(values.keySet());
  }
}
