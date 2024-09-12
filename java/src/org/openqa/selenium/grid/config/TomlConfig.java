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
import io.ous.jtoml.ParseException;
import io.ous.jtoml.Toml;
import io.ous.jtoml.TomlTable;
import java.io.IOException;
import java.io.Reader;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.logging.Logger;
import org.openqa.selenium.internal.Require;

public class TomlConfig implements Config {

  private final Toml toml;
  private static final Logger LOG = Logger.getLogger(TomlConfig.class.getName());

  public TomlConfig(Reader reader) {
    try {
      toml = JToml.parse(reader);
      LOG.warning(
          "Please use quotes to denote strings. Upcoming TOML parser will require this and unquoted"
              + " strings will throw an error in the future");
    } catch (IOException e) {
      throw new ConfigException("Unable to read TOML.", e);
    } catch (ParseException e) {
      throw new ConfigException(
          e.getCause()
              + "\n Validate the config using https://www.toml-lint.com/. "
              + "\n Refer to https://toml.io/en/ for TOML usage guidance. ");
    }
  }

  public static Config from(Path path) {
    Require.nonNull("Path to read", path);

    try (Reader reader = Files.newBufferedReader(path)) {
      return new TomlConfig(reader);
    } catch (IOException e) {
      throw new ConfigException(String.format("Unable to parse: %s", path), e);
    }
  }

  @Override
  public Optional<List<String>> getAll(String section, String option) {
    Require.nonNull("Section to read", section);
    Require.nonNull("Option to read", option);

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
      Collection<?> collection = (Collection<?>) value;
      // Case when an array of tables is used as config
      // https://toml.io/en/v1.0.0-rc.3#array-of-tables
      if (collection.stream().anyMatch(item -> item instanceof TomlTable)) {
        return Optional.of(
            collection.stream()
                .map(item -> (TomlTable) item)
                .map(TomlTable::toMap)
                .map(this::toEntryList)
                .flatMap(Collection::stream)
                .collect(ImmutableList.toImmutableList()));
      }

      return Optional.of(
          collection.stream()
              .filter(item -> (!(item instanceof Collection)))
              .map(String::valueOf)
              .collect(ImmutableList.toImmutableList()));
    }

    if (value instanceof TomlTable) {
      return Optional.of(toEntryList(((TomlTable) value).toMap()));
    }

    return Optional.of(ImmutableList.of(String.valueOf(value)));
  }

  @Override
  public Set<String> getSectionNames() {
    return ImmutableSortedSet.copyOf(toml.keySet());
  }

  @Override
  public Set<String> getOptions(String section) {
    Require.nonNull("Section name to get options for", section);

    Object raw = toml.get(section);
    if (!(raw instanceof TomlTable)) {
      return ImmutableSortedSet.of();
    }

    return ImmutableSortedSet.copyOf(((TomlTable) raw).keySet());
  }
}
