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
  public Optional<String> get(String section, String option) {
    return allConfigs.stream()
        .map(config -> config.get(section, option))
        .filter(Optional::isPresent)
        .findFirst()
        .orElse(Optional.empty());
  }
}
