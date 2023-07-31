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

import static org.assertj.core.api.Assertions.assertThat;

import java.io.StringReader;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.Test;

class JsonConfigTest {

  @Test
  void shouldUseATableAsASection() {
    String raw = "{\"cheeses\": {\"selected\": \"brie\"}}";
    Config config = new JsonConfig(new StringReader(raw));

    assertThat(config.get("cheeses", "selected")).isEqualTo(Optional.of("brie"));
  }

  @Test
  void ensureCanReadListOfStrings() {
    String raw =
        String.join(
                "",
                "",
                "{",
                "`relay`: {",
                "`configs`: [`2`, `{\\`browserName\\`: \\`chrome\\`}`]",
                "}",
                "}")
            .replace("`", "\"");
    Config config = new JsonConfig(new StringReader(raw));

    List<String> expected = Arrays.asList("2", "{\"browserName\": \"chrome\"}");
    Optional<List<String>> content = config.getAll("relay", "configs");
    assertThat(content).isEqualTo(Optional.of(expected));
  }

  @Test
  void shouldContainConfigFromArrayOfTables() {
    String raw =
        String.join(
                "",
                "",
                "{",
                "`cheeses`: {",
                "`default`: `manchego`,",
                "`type`: [",
                "{",
                "`name`: `soft cheese`,",
                "`default`: `brie`",
                "},",
                "{",
                "`name`: `Medium-hard cheese`,",
                "`default`: `Emmental`",
                "}",
                "]",
                "}",
                "}")
            .replace("`", "\"");
    Config config = new JsonConfig(new StringReader(raw));

    assertThat(config.get("cheeses", "default")).isEqualTo(Optional.of("manchego"));

    List<String> expected =
        Arrays.asList(
            "default=\"brie\"", "name=\"soft cheese\"",
            "default=\"Emmental\"", "name=\"Medium-hard cheese\"");
    assertThat(config.getAll("cheeses", "type").orElse(Collections.emptyList()))
        .isEqualTo(expected);
    assertThat(config.getAll("cheeses", "type").orElse(Collections.emptyList()).subList(0, 2))
        .isEqualTo(expected.subList(0, 2));
  }

  @Test
  void ensureCanReadListOfMaps() {
    String raw =
        String.join(
                "",
                "",
                "{",
                "`node`: {",
                "`detect-drivers`: false,",
                "`driver-configuration`: [",
                "{",
                "`display-name`: `htmlunit`,",
                "`stereotype`: {",
                "`browserName`: `htmlunit`,",
                "`browserVersion`: `chrome`",
                "}",
                "}",
                "]",
                "}",
                "}")
            .replace("`", "\"");
    Config config = new JsonConfig(new StringReader(raw));
    List<String> expected =
        Arrays.asList(
            "display-name=\"htmlunit\"",
            "stereotype={\"browserName\": \"htmlunit\",\"browserVersion\": \"chrome\"}");
    Optional<List<String>> content = config.getAll("node", "driver-configuration");
    assertThat(content).isEqualTo(Optional.of(expected));
  }
}
