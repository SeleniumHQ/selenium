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

import static java.util.Comparator.naturalOrder;

import com.google.common.collect.ImmutableList;
import com.google.common.collect.ImmutableMap;
import com.google.common.collect.ImmutableSortedSet;
import java.util.AbstractMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import org.openqa.selenium.internal.Require;

public class ConcatenatingConfig implements Config {

  private final String prefix;
  private final char separator;
  private final Map<String, String> values;

  public ConcatenatingConfig(String prefix, char separator, Map<?, ?> values) {
    this.prefix = prefix == null || "".equals(prefix) ? "" : (prefix + separator);
    this.separator = separator;

    this.values =
        Require.nonNull("Config values", values).entrySet().stream()
            .peek(entry -> Require.nonNull("Key", entry.getKey()))
            .peek(entry -> Require.nonNull("Value", entry.getValue()))
            .map(
                entry ->
                    new AbstractMap.SimpleImmutableEntry<>(
                        String.valueOf(entry.getKey()), String.valueOf(entry.getValue())))
            .collect(ImmutableMap.toImmutableMap(Map.Entry::getKey, Map.Entry::getValue));
  }

  @Override
  public Optional<List<String>> getAll(String section, String option) {
    Require.nonNull("Section name", section);
    Require.nonNull("Option name", option);

    String key = prefix + section + separator + option;

    return values.entrySet().stream()
        .filter(entry -> key.equalsIgnoreCase(entry.getKey()))
        .map(Map.Entry::getValue)
        .findFirst()
        .map(ImmutableList::of);
  }

  @Override
  public Set<String> getSectionNames() {
    String actualPrefix = prefix.toLowerCase(Locale.ENGLISH);

    return values.keySet().stream()
        .filter(key -> key.toLowerCase(Locale.ENGLISH).startsWith(actualPrefix))
        .filter(key -> key.length() > (actualPrefix.length() + 1))
        .map(key -> key.substring(actualPrefix.length()))
        .filter(key -> key.indexOf(separator) > -1)
        .map(key -> key.substring(0, key.indexOf(separator)))
        .map(key -> key.toLowerCase(Locale.ENGLISH))
        .collect(ImmutableSortedSet.toImmutableSortedSet(naturalOrder()));
  }

  @Override
  public Set<String> getOptions(String section) {
    Require.nonNull("Section name to get options for", section);

    String actualPrefix = String.format("%s%s_", prefix, section).toLowerCase(Locale.ENGLISH);

    return values.keySet().stream()
        .filter(key -> key.toLowerCase(Locale.ENGLISH).startsWith(actualPrefix))
        .filter(key -> key.length() > actualPrefix.length() + 1)
        .map(key -> key.substring(actualPrefix.length()))
        .map(key -> key.toLowerCase(Locale.ENGLISH))
        .collect(ImmutableSortedSet.toImmutableSortedSet(naturalOrder()));
  }
}
