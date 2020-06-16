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

import java.util.List;
import java.util.Locale;
import java.util.Optional;
import java.util.Set;

import static com.google.common.collect.ImmutableSortedSet.toImmutableSortedSet;
import static java.util.Comparator.naturalOrder;

import org.openqa.selenium.internal.Require;

/**
 * Exposes environment variables as config settings by mapping
 * "section.option" to "SECTION_OPTION". Dashes and periods in the options
 * are converted to underscores, and all characters are upper-cased assuming
 * a US English locale.
 */
public class EnvConfig implements Config {

  @Override
  public Optional<List<String>> getAll(String section, String option) {
    Require.nonNull("Section name", section);
    Require.nonNull("Option name", option);

    String key = String.format("%s_%s", section, option)
      .toUpperCase(Locale.ENGLISH)
      .replace("-", "_")
      .replace(".", "_");

    String value = System.getenv().get(key);
    if (value == null) {
      return Optional.empty();
    }

    if (value.startsWith("$")) {
      value = System.getenv(value.substring(1));
    }

    return Optional.ofNullable(value).map(ImmutableList::of);
  }

  @Override
  public Set<String> getSectionNames() {
    return System.getenv().keySet().stream()
      // We need at least two "_" characters
      .filter(key -> key.split("_").length > 1)
      .map(key -> key.substring(0, key.indexOf('_')))
      .map(key -> key.toLowerCase(Locale.ENGLISH))
      .collect(toImmutableSortedSet(naturalOrder()));
  }

  @Override
  public Set<String> getOptions(String section) {
    Require.nonNull("Section name to get options for", section);

    String prefix = String.format("%s_", section).toUpperCase(Locale.ENGLISH);
    return System.getenv().keySet().stream()
      .filter(key -> key.startsWith(prefix))
      .map(key -> key.substring(prefix.length()))
      .map(key -> key.toLowerCase(Locale.ENGLISH))
      .collect(toImmutableSortedSet(naturalOrder()));
  }
}
