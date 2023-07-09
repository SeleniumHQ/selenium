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

import org.junit.jupiter.api.Test;
import org.openqa.selenium.json.Json;

import java.util.*;

import static org.assertj.core.api.Assertions.assertThat;
import static org.openqa.selenium.json.Json.MAP_TYPE;

class MapConfigTest {

  @Test
  void shouldUseATableAsASection() {
    String json = "{\"cheeses\": {\"selected\": \"brie\"}}";
    Map<String, Object> raw = new Json().toType(json, MAP_TYPE);
    Config config = new MapConfig(raw);

    assertThat(config.get("cheeses", "selected")).isEqualTo(Optional.of("brie"));
  }

  @Test
  void shouldContainConfigFromArrayOfTables() {
    String json = "{\"cheeses\": {\"default\": \"manchego\", "
    + "\"type\": [{\"name\": \"soft cheese\", \"default\": \"brie\"}, "
    + "{\"name\": \"Medium-hard cheese\", \"default\": \"Emmental\"}]}}";
    Map<String, Object> raw = new Json().toType(json, MAP_TYPE);
    Config config = new MapConfig(raw);

    assertThat(config.get("cheeses", "default")).isEqualTo(Optional.of("manchego"));

    List<String> expected =
      Arrays.asList(
        "name=\"soft cheese\"", "default=\"brie\"",
        "name=\"Medium-hard cheese\"", "default=\"Emmental\"");
    assertThat(config.getAll("cheeses", "type").orElse(Collections.emptyList()))
      .containsAll(expected);
    assertThat(config.getAll("cheeses", "type").orElse(Collections.emptyList()).subList(0, 2))
      .containsAll(expected.subList(0, 2));
  }

  @Test
  void ensureCanReadListOfMaps() {
    String json = "{\"node\":{\"detect-drivers\":false,"
      + "\"driver-configuration\":[{\"display-name\":\"htmlunit\","
      + "\"stereotype\":{\"browserName\":\"htmlunit\",\"browserVersion\":\"chrome\"}}]}}";
    Map<String, Object> raw = new Json().toType(json, MAP_TYPE);
    Config config = new MapConfig(raw);

    List<String> expected = Arrays.asList(
      "display-name=\"htmlunit\"",
      "stereotype={\"browserName\": \"htmlunit\",\"browserVersion\": \"chrome\"}"
    );
    Optional<List<String>> content = config.getAll("node", "driver-configuration");
    assertThat(content).isEqualTo(Optional.of(expected));
  }
}
