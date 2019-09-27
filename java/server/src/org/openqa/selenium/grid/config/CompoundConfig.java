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

import static com.google.common.collect.ImmutableList.toImmutableList;

import com.google.common.collect.ImmutableList;

import java.util.Collection;
import java.util.List;
import java.util.Objects;
import java.util.Optional;

public class CompoundConfig implements Config {

  private final List<Config> allConfigs;

  public CompoundConfig(Config mostImportant, Config... othersInDescendingOrderOfImportance) {
    this.allConfigs = ImmutableList.<Config>builder()
        .add(mostImportant)
        .add(othersInDescendingOrderOfImportance)
        .build();
  }

  @Override
  public Optional<List<String>> getAll(String section, String option) {
    Objects.requireNonNull(section, "Section name not set");
    Objects.requireNonNull(option, "Option name not set");

    List<String> values = allConfigs.stream()
        .map(config -> config.getAll(section, option))
        .filter(Optional::isPresent)
        .map(Optional::get)
        .flatMap(Collection::stream)
        .collect(toImmutableList());

    return values.isEmpty() ? Optional.empty() : Optional.of(values);
  }
}
