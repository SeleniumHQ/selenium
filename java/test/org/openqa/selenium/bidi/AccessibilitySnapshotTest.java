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

package org.openqa.selenium.bidi;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatExceptionOfType;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import java.util.stream.Stream;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.MethodSource;
import org.openqa.selenium.AccessibilityNode;
import org.openqa.selenium.By;
import org.openqa.selenium.HasCapabilities;
import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.StaleElementReferenceException;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.build.InProject;
import org.openqa.selenium.json.Json;
import org.openqa.selenium.testing.JupiterTestBase;

/**
 * driver.getAccessibilitySnapshot() and element.getAccessibilitySnapshot() over BiDi. The shared
 * corpus in common/src/web/accessibility is the cross-binding contract: every page is snapshotted
 * whole and compared with its recorded tree and text.
 */
class AccessibilitySnapshotTest extends JupiterTestBase {

  private static final Json JSON = new Json();

  /**
   * The atom records frames as leaves; the binding fills them in, so this page has its own tests.
   */
  private static final String FRAMES_PAGE = "014-iframe";

  static Stream<String> corpusPages() throws IOException {
    return JSON.<List<String>>toType(read("index.json"), List.class).stream()
        .filter(page -> !FRAMES_PAGE.equals(page));
  }

  @ParameterizedTest
  @MethodSource("corpusPages")
  void wholePageSnapshotMatchesTheCorpus(String page) throws IOException {
    load(page);

    AccessibilityNode tree = driver.getAccessibilitySnapshot();

    assertThat(serialize(tree)).isEqualTo(JSON.toType(expected(page, "json"), Json.MAP_TYPE));
    assertThat(tree.toText() + "\n").isEqualTo(expected(page, "txt"));
  }

  @Test
  void wholePageSnapshotIsRootedAtTheDocument() {
    load("001-headings-and-landmarks");

    AccessibilityNode tree = driver.getAccessibilitySnapshot();

    assertThat(tree.getRole()).isEqualTo("document");
    assertThat(tree.getElement()).isNotNull();
    assertThat(tree.getElement().getTagName()).isEqualTo("html");
  }

  @Test
  void elementReferencesAreUsable() {
    load("003-links-and-buttons");

    AccessibilityNode tree = driver.getAccessibilitySnapshot();

    AccessibilityNode button =
        walk(tree).filter(node -> "button".equals(node.getRole())).findFirst().orElseThrow();
    assertThat(button.getElement().getTagName()).isIn("button", "input", "a");
    assertThat(button.getElement().getDomAttribute("id")).isNotEmpty();
  }

  @Test
  void subtreeSnapshotAlwaysProducesANodeForItsRoot() {
    load("005-lists");
    WebElement root = driver.findElement(By.tagName("body"));

    AccessibilityNode tree = root.getAccessibilitySnapshot();

    assertThat(tree.getRole()).isEqualTo("generic");
    assertThat(tree.getElement().getTagName()).isEqualTo("body");
    assertThat(walk(tree).anyMatch(node -> "list".equals(node.getRole()))).isTrue();
  }

  @Test
  void subtreeSnapshotOfANodeFromAnEarlierSnapshot() {
    load("005-lists");
    AccessibilityNode firstList =
        walk(driver.getAccessibilitySnapshot())
            .filter(node -> "list".equals(node.getRole()))
            .findFirst()
            .orElseThrow();

    AccessibilityNode tree = firstList.getElement().getAccessibilitySnapshot();

    assertThat(tree.getRole()).isEqualTo("list");
    assertThat(roles(tree.getChildren())).isEqualTo(roles(firstList.getChildren()));
  }

  @Test
  void framesAreStitchedIn() {
    load(FRAMES_PAGE);

    AccessibilityNode tree = driver.getAccessibilitySnapshot();

    List<AccessibilityNode> frames =
        walk(tree).filter(node -> "iframe".equals(node.getRole())).collect(Collectors.toList());
    assertThat(frames)
        .extracting(AccessibilityNode::getName)
        .containsExactly("Embedded content", "");
    for (AccessibilityNode frame : frames) {
      assertThat(frame.getChildren())
          .as("a reachable frame carries its document as the one child")
          .hasSize(1);
      assertThat(frame.getChildren().get(0).getRole()).isEqualTo("document");
      assertThat(frame.getChildren().get(0).getElement()).isNotNull();
    }
    // The text form renders the stitched tree; the atom-level expectation stops at the leaves.
    assertThat(tree.toText().split("- document", -1)).hasSize(4);
    // A reference inside a frame works through classic commands once that frame is current.
    driver.switchTo().frame(frames.get(0).getElement());
    try {
      assertThat(frames.get(0).getChildren().get(0).getElement().getTagName()).isEqualTo("html");
    } finally {
      driver.switchTo().defaultContent();
    }
  }

  @Test
  void subtreeSnapshotOfAnIframeElementCarriesItsDocument() {
    load(FRAMES_PAGE);
    WebElement frame = driver.findElement(By.id("frame"));

    AccessibilityNode tree = frame.getAccessibilitySnapshot();

    assertThat(tree.getRole()).isEqualTo("iframe");
    assertThat(tree.getName()).isEqualTo("Embedded content");
    assertThat(roles(tree.getChildren())).containsExactly("document");
  }

  @Test
  void subtreeSnapshotInsideAFrame() {
    load(FRAMES_PAGE);
    driver.switchTo().frame("frame");
    try {
      WebElement body = driver.findElement(By.tagName("body"));
      AccessibilityNode tree = body.getAccessibilitySnapshot();
      // The root is the frame's body, not the top document that owns the window.
      assertThat(tree.getRole()).isEqualTo("generic");
      assertThat(tree.getName()).isEmpty();
      assertThat(tree.getElement().getTagName()).isEqualTo("body");
    } finally {
      driver.switchTo().defaultContent();
    }
  }

  @Test
  void wholePageSnapshotIgnoresTheFrameTheDriverSwitchedTo() {
    load(FRAMES_PAGE);
    driver.switchTo().frame("frame");
    AccessibilityNode tree;
    try {
      tree = driver.getAccessibilitySnapshot();
    } finally {
      driver.switchTo().defaultContent();
    }

    assertThat(tree.getName()).isEqualTo("Frames");
  }

  @Test
  void aStaleRootRaisesTheStaleElementError() {
    load("005-lists");
    WebElement root = driver.findElement(By.tagName("body"));
    load("001-headings-and-landmarks");

    assertThatExceptionOfType(StaleElementReferenceException.class)
        .isThrownBy(root::getAccessibilitySnapshot);
  }

  @Test
  void aDetachedRootRaisesTheStaleElementError() {
    load("005-lists");
    WebElement item = driver.findElement(By.tagName("li"));
    ((JavascriptExecutor) driver).executeScript("arguments[0].remove()", item);

    assertThatExceptionOfType(StaleElementReferenceException.class)
        .isThrownBy(item::getAccessibilitySnapshot);
  }

  @Test
  void aSnapshotIsACopy() {
    load("005-lists");
    AccessibilityNode before = driver.getAccessibilitySnapshot();
    ((JavascriptExecutor) driver)
        .executeScript("document.querySelector('li').textContent = 'changed'");

    AccessibilityNode after = driver.getAccessibilitySnapshot();

    assertThat(before.toText()).isNotEqualTo(after.toText());
    assertThat(after.toText()).contains("changed");
  }

  private void load(String page) {
    driver.get(appServer.whereIs("accessibility/" + page + ".html"));
  }

  private String engine() {
    String name = ((HasCapabilities) driver).getCapabilities().getBrowserName().toLowerCase();
    if (name.contains("firefox")) {
      return "firefox";
    }
    if (name.contains("safari") || name.contains("webkit")) {
      return "webkit";
    }
    return "chromium";
  }

  /** The engine-specific expectation when one is recorded, else the shared one. */
  private String expected(String page, String suffix) throws IOException {
    Path specific =
        InProject.locate("common/src/web/accessibility")
            .resolve(page + ".expected." + engine() + "." + suffix);
    if (Files.exists(specific)) {
      return Files.readString(specific, StandardCharsets.UTF_8);
    }
    return read(page + ".expected." + suffix);
  }

  /** The corpus JSON form: every field written, `element` as the element's id. */
  private static Map<String, Object> serialize(AccessibilityNode node) {
    Map<String, Object> out = new LinkedHashMap<>();
    out.put("role", node.getRole());
    out.put("name", node.getName());
    out.put("description", node.getDescription());
    if (node.getValue() != null) {
      out.put("value", node.getValue());
    }
    out.put("states", node.getStates());
    if (node.getElement() != null) {
      out.put("element", node.getElement().getDomAttribute("id"));
    }
    List<Object> children = new ArrayList<>();
    for (AccessibilityNode child : node.getChildren()) {
      children.add(serialize(child));
    }
    out.put("children", children);
    return out;
  }

  private static Stream<AccessibilityNode> walk(AccessibilityNode node) {
    return Stream.concat(
        Stream.of(node), node.getChildren().stream().flatMap(AccessibilitySnapshotTest::walk));
  }

  private static List<String> roles(List<AccessibilityNode> nodes) {
    return nodes.stream().map(AccessibilityNode::getRole).collect(Collectors.toList());
  }

  private static String read(String file) throws IOException {
    Path path = InProject.locate("common/src/web/accessibility/" + file);
    return Files.readString(path, StandardCharsets.UTF_8);
  }
}
