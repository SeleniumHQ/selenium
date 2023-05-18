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

import static org.openqa.selenium.json.Json.MAP_TYPE;

import java.io.IOException;
import java.io.Reader;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import org.openqa.selenium.internal.Require;
import org.openqa.selenium.json.Json;
import org.openqa.selenium.json.JsonException;

public class JsonConfig implements Config {

  private static final Json JSON = new Json();
  private final Config delegate;

  JsonConfig(Reader reader) {
    try {
      delegate = new MapConfig(JSON.toType(Require.nonNull("JSON source", reader), MAP_TYPE));
    } catch (JsonException e) {
      throw new ConfigException("Unable to parse input", e);
    }
  }

  public static Config from(Path path) {
    try (Reader reader = Files.newBufferedReader(path)) {
      return new JsonConfig(reader);
    } catch (IOException e) {
      throw new ConfigException("Unable to read JSON.", e);
    }
  }

  @Override
  public Optional<List<String>> getAll(String section, String option) {
    return delegate.getAll(section, option);
  }

  @Override
  public Set<String> getSectionNames() {
    return delegate.getSectionNames();
  }

  @Override
  public Set<String> getOptions(String section) {
    return delegate.getOptions(Require.nonNull("Section name to get options for", section));
  }
}
