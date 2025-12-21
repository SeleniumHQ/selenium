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

import static java.util.Collections.emptyList;
import static org.assertj.core.api.Assertions.assertThat;

import java.io.StringReader;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.Test;

class JsonConfigTest {

  @Test
  void shouldUseATableAsASection() {
    String raw = "{\"cheeses\": {\"selected\": \"brie\"}}";
    Config config = new JsonConfig(new StringReader(raw));

    assertThat(config.get("cheeses", "selected")).contains("brie");
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

    Optional<List<String>> content = config.getAll("relay", "configs");
    assertThat(content).isPresent();
    assertThat(content.get()).containsExactly("2", "{\"browserName\": \"chrome\"}");
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

    assertThat(config.get("cheeses", "default")).contains("manchego");

    assertThat(config.getAll("cheeses", "type").get())
        .containsExactly(
            "name=\"soft cheese\"",
            "default=\"brie\"",
            Config.DELIMITER,
            "name=\"Medium-hard cheese\"",
            "default=\"Emmental\"",
            Config.DELIMITER);
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
        List.of(
            "display-name=\"htmlunit\"",
            "stereotype={\"browserName\": \"htmlunit\",\"browserVersion\": \"chrome\"}",
            Config.DELIMITER);
    Optional<List<String>> content = config.getAll("node", "driver-configuration");
    assertThat(content).contains(expected);
  }

  @Test
  void ensureCanReadListOfLists() {
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

    List<List<String>> expected =
        List.of(
            List.of("name=\"soft cheese\"", "default=\"brie\""),
            List.of("name=\"Medium-hard cheese\"", "default=\"Emmental\""));
    assertThat(config.getArray("cheeses", "type").orElse(emptyList())).isEqualTo(expected);
    assertThat(config.getArray("cheeses", "type").orElse(emptyList()).subList(0, 1))
        .isEqualTo(expected.subList(0, 1));
  }
}
