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
import com.google.common.collect.ImmutableSortedSet;
import io.ous.jtoml.JToml;
import io.ous.jtoml.Toml;
import io.ous.jtoml.TomlTable;

import java.io.IOException;
import java.io.Reader;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Collection;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import java.util.Set;

public class TomlConfig implements Config {

  private final Toml toml;

  TomlConfig(Reader reader) {
    try {
      toml = JToml.parse(reader);
    } catch (IOException e) {
      throw new ConfigException("Unable to read TOML.", e);
    }
  }

  public static Config from(Path path) {
    Objects.requireNonNull(path, "Path to read must be set.");

    try (Reader reader = Files.newBufferedReader(path)) {
      return new TomlConfig(reader);
    } catch (IOException e) {
      throw new ConfigException(String.format("Unable to parse: %s", path), e);
    }
  }

  @Override
  public Optional<List<String>> getAll(String section, String option) {
    Objects.requireNonNull(section, "Section to read must be set.");
    Objects.requireNonNull(option, "Option to read must be set.");

    if (!toml.containsKey(section)) {
      return Optional.empty();
    }

    Object raw = toml.get(section);
    if (!(raw instanceof TomlTable)) {
      throw new ConfigException(String.format("Section %s is not a section! %s", section, raw));
    }

    TomlTable table = toml.getTomlTable(section);

    Object value = table.getOrDefault(option, null);
    if (value == null) {
      return Optional.empty();
    }

    if (value instanceof Collection) {
      ImmutableList<String> values = ((Collection<?>) value).stream()
      .filter(item -> (!(item instanceof Collection)))
      .map(String::valueOf)
      .collect(ImmutableList.toImmutableList());

      return Optional.of(values);
    }

    return Optional.of(ImmutableList.of(String.valueOf(value)));
  }

  @Override
  public Set<String> getSectionNames() {
    return ImmutableSortedSet.copyOf(toml.keySet());
  }

  @Override
  public Set<String> getOptions(String section) {
    Objects.requireNonNull(section, "Section name to get options for must be set.");

    Object raw = toml.get(section);
    if (!(raw instanceof TomlTable)) {
      return ImmutableSortedSet.of();
    }

    return ImmutableSortedSet.copyOf(((TomlTable) raw).keySet());
  }
}
