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
import java.util.Map;
import java.util.Objects;
import java.util.Optional;

public class MapConfig implements Config {

  private final Map<String, Object> raw;

  public MapConfig(Map<String, Object> raw) {
    this.raw = raw;
  }

  @Override
  public Optional<List<String>> getAll(String section, String option) {
    Objects.requireNonNull(section, "Section name not set");
    Objects.requireNonNull(option, "Option name not set");

    Object rawSection = raw.get(section);
    if (!(rawSection instanceof Map)) {
      return Optional.empty();
    }

    Object value = ((Map<?, ?>) rawSection).get(option);
    return value == null ? Optional.empty() : Optional.of(ImmutableList.of(String.valueOf(value)));
  }
}
