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

import java.util.AbstractMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;

public class ConcatenatingConfig implements Config {

  private final String prefix;
  private final char separator;
  private final Map<String, String> values;

  public ConcatenatingConfig(String prefix, char separator, Map<?, ?> values) {
    this.prefix = prefix == null || "".equals(prefix) ? "" : (prefix + separator);
    this.separator = separator;

    this.values = Objects.requireNonNull(values).entrySet().stream()
        .peek(entry -> Objects.requireNonNull(entry.getKey(), "Key has not been set"))
        .peek(entry -> Objects.requireNonNull(entry.getValue(), "Value has not been set"))
        .map(entry -> new AbstractMap.SimpleImmutableEntry<>(
            String.valueOf(entry.getKey()),
            String.valueOf(entry.getValue())))
        .collect(ImmutableMap.toImmutableMap(Map.Entry::getKey, Map.Entry::getValue));
  }

  @Override
  public Optional<List<String>> getAll(String section, String option) {
    Objects.requireNonNull(section, "Section name not set");
    Objects.requireNonNull(option, "Option name not set");

    String key = prefix + section + separator + option;

    return values.entrySet().stream()
        .filter(entry -> key.equalsIgnoreCase(entry.getKey()))
        .map(Map.Entry::getValue)
        .findFirst()
        .map(ImmutableList::of);
  }
}
