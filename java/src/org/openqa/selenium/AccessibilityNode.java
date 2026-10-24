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

import java.util.ArrayList;
import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import org.jspecify.annotations.Nullable;
import org.openqa.selenium.internal.Require;

/**
 * One node of an accessibility snapshot, as returned by {@link
 * WebDriver#getAccessibilitySnapshot()} and {@link WebElement#getAccessibilitySnapshot()}.
 *
 * <p>The tree is computed in the page from the DOM following WAI-ARIA, html-aam and accname. It is
 * not the browser's own accessibility tree and can differ from it at the edges.
 */
public final class AccessibilityNode {

  /** The order the text form writes states in. */
  private static final List<String> STATE_ORDER =
      List.of("checked", "pressed", "expanded", "selected", "level", "disabled", "focused");

  private final String role;
  private final String name;
  private final String description;
  private final @Nullable String value;
  private final Map<String, Object> states;
  private final @Nullable WebElement element;
  private final List<AccessibilityNode> children;

  /**
   * @param role the WAI-ARIA role token; {@code text} for text leaves and {@code iframe} for frames
   * @param name the computed accessible name, {@code ""} when there is none
   * @param description the computed accessible description, {@code ""} when there is none
   * @param value the current value for textbox, searchbox, combobox and range roles, or {@code
   *     null}
   * @param states the states that apply, keyed by name; values are {@link Boolean}, {@link Long} or
   *     {@link String}
   * @param element the element the node is backed by, or {@code null} for a text leaf
   * @param children the child nodes
   */
  public AccessibilityNode(
      String role,
      String name,
      String description,
      @Nullable String value,
      Map<String, Object> states,
      @Nullable WebElement element,
      List<AccessibilityNode> children) {
    this.role = Require.nonNull("Role", role);
    this.name = Require.nonNull("Name", name);
    this.description = Require.nonNull("Description", description);
    this.value = value;
    this.states =
        Collections.unmodifiableMap(new LinkedHashMap<>(Require.nonNull("States", states)));
    this.element = element;
    this.children =
        Collections.unmodifiableList(new ArrayList<>(Require.nonNull("Children", children)));
  }

  /**
   * @return the WAI-ARIA role token; {@code text} for text leaves and {@code iframe} for frames,
   *     under which the frame's own tree is attached
   */
  public String getRole() {
    return role;
  }

  /**
   * @return the computed accessible name, {@code ""} when there is none
   */
  public String getName() {
    return name;
  }

  /**
   * @return the computed accessible description, {@code ""} when there is none
   */
  public String getDescription() {
    return description;
  }

  /**
   * @return the current value for textbox, searchbox, combobox and range roles; {@code null} where
   *     the role has none. A password field's value is masked.
   */
  public @Nullable String getValue() {
    return value;
  }

  /**
   * @return {@code checked}, {@code pressed}, {@code expanded}, {@code selected}, {@code level},
   *     {@code disabled} and {@code focused}, each present only when it applies, as {@link
   *     Boolean}, {@link Long} or {@link String} values. New keys may be added in any release, so
   *     ignore keys you do not recognise.
   */
  public Map<String, Object> getStates() {
    return states;
  }

  /**
   * @return the element the node is backed by, usable for further commands, or {@code null} for a
   *     text leaf. An element inside a child frame can be used through classic commands only once
   *     the driver has switched to that frame.
   */
  public @Nullable WebElement getElement() {
    return element;
  }

  /**
   * @return the child nodes, empty for a leaf
   */
  public List<AccessibilityNode> getChildren() {
    return children;
  }

  /**
   * Renders the tree as text, one node per line.
   *
   * <p>The line grammar is {@code - role "name" [state] [state=value]: value}, children indented
   * two spaces, text leaves written as {@code - text: content}. An empty name is left out, as is an
   * absent or empty value; a {@code true} state is written bare, a {@code false} one left out, any
   * other value spelled. A line break or backslash in a value is escaped so a node never spans two
   * lines. The description and element references are not rendered.
   *
   * @return the text form, without a trailing newline
   */
  public String toText() {
    StringBuilder out = new StringBuilder();
    appendLines("", out);
    return out.toString();
  }

  private void appendLines(String indent, StringBuilder out) {
    if (out.length() > 0) {
      out.append('\n');
    }
    out.append(indent).append(line());
    for (AccessibilityNode child : children) {
      child.appendLines(indent + "  ", out);
    }
  }

  private String line() {
    if ("text".equals(role)) {
      return "- text: " + name;
    }
    StringBuilder out = new StringBuilder("- ").append(role);
    if (!name.isEmpty()) {
      out.append(' ').append(quote(name));
    }
    for (String key : STATE_ORDER) {
      if (!states.containsKey(key)) {
        continue;
      }
      Object state = states.get(key);
      if (Boolean.TRUE.equals(state)) {
        out.append(" [").append(key).append(']');
      } else if (!Boolean.FALSE.equals(state)) {
        out.append(" [").append(key).append('=').append(state).append(']');
      }
    }
    if (value != null && !value.isEmpty()) {
      out.append(": ").append(oneLine(value));
    }
    return out.toString();
  }

  private static String quote(String text) {
    return "\"" + text.replace("\\", "\\\\").replace("\"", "\\\"") + "\"";
  }

  private static String oneLine(String text) {
    return text.replace("\\", "\\\\").replace("\r", "\\r").replace("\n", "\\n");
  }

  @Override
  public String toString() {
    return "AccessibilityNode{role=" + role + ", name=" + quote(name) + "}";
  }
}
