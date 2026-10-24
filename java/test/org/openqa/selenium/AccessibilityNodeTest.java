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

package org.openqa.selenium;

import static org.assertj.core.api.Assertions.assertThat;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Stream;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.MethodSource;
import org.openqa.selenium.build.InProject;
import org.openqa.selenium.json.Json;

/**
 * The text renderer is held to the shared corpus in common/src/web/accessibility: every
 * expected.txt is the reference renderer's output over its expected.json, so the port must agree.
 */
@Tag("UnitTests")
class AccessibilityNodeTest {

  private static final Json JSON = new Json();

  static Stream<String> corpusPages() throws IOException {
    return JSON.<List<String>>toType(read("index.json"), List.class).stream();
  }

  @ParameterizedTest
  @MethodSource("corpusPages")
  void rendersEveryCorpusPageAsItsRecordedText(String page) throws IOException {
    AccessibilityNode tree = fromJson(JSON.toType(read(page + ".expected.json"), Json.MAP_TYPE));

    assertThat(tree.toText() + "\n").isEqualTo(read(page + ".expected.txt"));
  }

  @Test
  void writesTheLineGrammarWithItsEscapes() {
    Map<String, Object> states = new LinkedHashMap<>();
    states.put("focused", true);
    states.put("disabled", true);
    states.put("level", 2L);
    states.put("selected", false);
    states.put("pressed", "mixed");
    AccessibilityNode node =
        new AccessibilityNode(
            "textbox", "Say \"hi\" \\ bye", "", "line one\nline two\\", states, null, List.of());

    assertThat(node.toText())
        .isEqualTo(
            "- textbox \"Say \\\"hi\\\" \\\\ bye\" [pressed=mixed] [level=2] [disabled] [focused]:"
                + " line one\\nline two\\\\");
    assertThat(node("list", "", List.of()).toText()).isEqualTo("- list");
    assertThat(node("text", "plain words", List.of()).toText()).isEqualTo("- text: plain words");
    assertThat(
            new AccessibilityNode("textbox", "Empty", "", "", Map.of(), null, List.of()).toText())
        .isEqualTo("- textbox \"Empty\"");
  }

  @Test
  void indentsChildrenTwoSpacesPerLevel() {
    AccessibilityNode tree =
        node(
            "list",
            "",
            List.of(
                node(
                    "listitem",
                    "",
                    List.of(node("text", "one", List.of()), node("link", "more", List.of())))));

    assertThat(tree.toText())
        .isEqualTo("- list\n  - listitem\n    - text: one\n    - link \"more\"");
  }

  @Test
  void exposesItsFieldsAsReadOnlyViews() {
    Map<String, Object> states = new LinkedHashMap<>();
    states.put("checked", true);
    AccessibilityNode node =
        new AccessibilityNode("checkbox", "Agree", "Terms", null, states, null, List.of());
    states.put("checked", false);

    assertThat(node.getRole()).isEqualTo("checkbox");
    assertThat(node.getName()).isEqualTo("Agree");
    assertThat(node.getDescription()).isEqualTo("Terms");
    assertThat(node.getValue()).isNull();
    assertThat(node.getStates()).containsEntry("checked", true);
    assertThat(node.getElement()).isNull();
    assertThat(node.getChildren()).isEmpty();
  }

  private static AccessibilityNode node(
      String role, String name, List<AccessibilityNode> children) {
    return new AccessibilityNode(role, name, "", null, Map.of(), null, children);
  }

  /**
   * The corpus JSON as nodes; `element` holds the recorded id, which the text form never renders.
   */
  @SuppressWarnings("unchecked")
  private static AccessibilityNode fromJson(Map<String, Object> data) {
    List<AccessibilityNode> children = new ArrayList<>();
    for (Object child : (List<Object>) data.get("children")) {
      children.add(fromJson((Map<String, Object>) child));
    }
    return new AccessibilityNode(
        (String) data.get("role"),
        (String) data.get("name"),
        (String) data.get("description"),
        (String) data.get("value"),
        (Map<String, Object>) data.get("states"),
        null,
        children);
  }

  private static String read(String file) throws IOException {
    Path path = InProject.locate("common/src/web/accessibility/" + file);
    return Files.readString(path, StandardCharsets.UTF_8);
  }
}
