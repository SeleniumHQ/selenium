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

import static org.openqa.selenium.grid.config.StandardGridRoles.ALL_ROLES;

import com.google.common.collect.ImmutableMap;
import com.google.common.collect.ImmutableSet;
import com.google.common.collect.ImmutableSortedSet;

import com.beust.jcommander.Parameter;

import org.openqa.selenium.json.Json;

import java.io.PrintStream;
import java.nio.file.Path;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.TreeMap;
import java.util.stream.Collectors;

public class ConfigFlags implements HasRoles {

  private static final ImmutableSet<String> IGNORED_SECTIONS =
    ImmutableSet.of("java", "lc", "term");

  @Parameter(
    names = "--config",
    description = "Config file to read from (may be specified more than once)")
  private List<Path> configFiles;

  @Parameter(
    names = "--dump-config",
    description = "Dump the config of the server as JSON.",
    hidden = true)
  private boolean dumpConfig;

  @Parameter(
    names = "--config-help",
    description = "Output detailed information about config options")
  private boolean dumpConfigHelp;

  @Override
  public Set<Role> getRoles() {
    return ALL_ROLES;
  }

  public Config readConfigFiles() {
    if (configFiles == null || configFiles.isEmpty()) {
      return new MapConfig(ImmutableMap.of());
    }

    return new CompoundConfig(
      configFiles.stream()
        .map(Configs::from)
        .toArray(Config[]::new));
  }

  public boolean dumpConfig(Config config, PrintStream dumpTo) {
    if (!dumpConfig) {
      return false;
    }

    Map<String, Map<String, Object>> toOutput = new TreeMap<>();
    for (String section : config.getSectionNames()) {
      if (section.isEmpty() || IGNORED_SECTIONS.contains(section)) {
        continue;
      }

      config.getOptions(section).forEach(option ->
        config.get(section, option).ifPresent(value ->
          toOutput.computeIfAbsent(section, ignored -> new TreeMap<>()).put(option, value)
        )
      );
    }

    dumpTo.print(new Json().toJson(toOutput));

    return true;
  }

  public boolean dumpConfigHelp(Config config, Set<Role> currentRoles, PrintStream dumpTo) {
    if (!dumpConfigHelp) {
      return false;
    }

    Map<String, Set<DescribedOption>> allOptions = DescribedOption
      .findAllMatchingOptions(currentRoles).stream()
      .collect(Collectors.toMap(
        DescribedOption::section,
        ImmutableSortedSet::of,
        (l, r) -> ImmutableSortedSet.<DescribedOption>naturalOrder().addAll(l).addAll(r).build()));

    StringBuilder demoToml = new StringBuilder();
    demoToml.append("Configuration help for Toml config file").append("\n\n");
    demoToml.append("In case of parsing errors, validate the config using https://www.toml-lint.com/").append("\n\n");
    demoToml.append("Refer https://toml.io/en/ for TOML usage guidance").append("\n\n");
    allOptions.forEach((section, options) -> {
      demoToml.append("[").append(section).append("]\n");
      options.stream().filter(option -> !option.hidden).forEach(option -> {
        if (!option.optionName.isEmpty()) {
          demoToml.append("# ").append(option.description).append("\n");
        }
        demoToml.append("# Type: ").append(option.type).append("\n");
        if (!option.defaultValue.isEmpty()) {
          demoToml.append("# Default: ").append(option.defaultValue).append("\n");
        }
        Arrays.stream(option.example()).forEach(example -> {
          demoToml.append("# Example: ").append("\n");
          if (option.prefixed) {
            demoToml.append("[[")
              .append(section)
              .append(".")
              .append(option.optionName)
              .append("]]")
              .append(option.example(config, example))
              .append("\n\n");
          } else {
            demoToml.append(option.optionName)
              .append(" = ")
              .append(option.example(config, example)).append("\n\n");
          }
        });
        demoToml.append("\n");
      });
    });

    dumpTo.print(demoToml);

    return true;
  }
}
