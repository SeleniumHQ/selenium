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
package org.openqa.selenium.bidi.script;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import org.openqa.selenium.Beta;
import org.openqa.selenium.internal.Require;
import org.openqa.selenium.json.JsonException;

@Beta
public class NodeProperties {
  public enum Mode {
    OPEN("open"),
    CLOSED("closed");

    private final String value;

    Mode(String mode) {
      this.value = mode;
    }

    @Override
    public String toString() {
      return value;
    }

    public static Mode findByName(String name) {
      for (Mode type : values()) {
        if (type.toString().equalsIgnoreCase(name)) {
          return type;
        }
      }
      throw new IllegalArgumentException("Unsupported node mode: " + name);
    }
  }

  private final long nodeType;
  private final long childNodeCount;
  private final Optional<Map<String, String>> attributes;
  private final Optional<List<RemoteValue>> children;
  private final Optional<String> localName;
  private final Optional<Mode> mode;
  private final Optional<String> namespaceURI;
  private final Optional<String> nodeValue;
  private final Optional<RemoteValue> shadowRoot;

  private NodeProperties(
      long nodeType,
      long childNodeCount,
      Optional<Map<String, String>> attributes,
      Optional<List<RemoteValue>> children,
      Optional<String> localName,
      Optional<Mode> mode,
      Optional<String> namespaceURI,
      Optional<String> nodeValue,
      Optional<RemoteValue> shadowRoot) {
    this.nodeType = Require.nonNegative("nodeType", nodeType);
    this.childNodeCount = Require.nonNegative("childNodeCount", childNodeCount);
    this.attributes = attributes;
    this.children = children;
    this.localName = localName;
    this.mode = mode;
    this.namespaceURI = namespaceURI;
    this.nodeValue = nodeValue;
    this.shadowRoot = shadowRoot;
  }

  /**
   * Builds {@code NodeProperties} from an already-parsed JSON object. {@code children} and {@code
   * shadowRoot} are remote values, so they are decoded through {@link RemoteValue#fromMap} rather
   * than round-tripped through JSON text. See #18076.
   */
  static NodeProperties fromMap(Object raw) {
    Map<String, Object> map = RemoteValue.asMap(raw, "node properties");

    Optional<Map<String, String>> attributes = Optional.empty();
    Object rawAttributes = map.get("attributes");
    if (rawAttributes != null) {
      Map<String, String> copy = new LinkedHashMap<>();
      RemoteValue.asMap(rawAttributes, "node attributes")
          .forEach(
              (name, value) ->
                  copy.put(
                      name,
                      RemoteValue.coerceScalar(value, String.class, "node attribute " + name)));
      attributes = Optional.of(copy);
    }

    Optional<List<RemoteValue>> children = Optional.empty();
    Object rawChildren = map.get("children");
    if (rawChildren != null) {
      List<Object> items = RemoteValue.asList(rawChildren, "node children");
      List<RemoteValue> list = new ArrayList<>(items.size());
      for (Object item : items) {
        list.add(RemoteValue.fromMap(item));
      }
      children = Optional.of(list);
    }

    Optional<Mode> mode =
        Optional.ofNullable(RemoteValue.coerceScalar(map.get("mode"), Mode.class, "node mode"));

    Optional<RemoteValue> shadowRoot =
        Optional.ofNullable(RemoteValue.fromMap(map.get("shadowRoot")));

    return new NodeProperties(
        requiredLong(map, "nodeType"),
        requiredLong(map, "childNodeCount"),
        attributes,
        children,
        RemoteValue.optionalString(map, "localName"),
        mode,
        RemoteValue.optionalString(map, "namespaceURI"),
        RemoteValue.optionalString(map, "nodeValue"),
        shadowRoot);
  }

  // Same coercion as the constructor-based path this replaces: "1", 1.0 and "1e0" all become 1L.
  private static long requiredLong(Map<String, Object> map, String key) {
    Long value = RemoteValue.coerceScalar(map.get(key), Long.class, "node " + key);
    if (value == null) {
      throw new JsonException("Missing JSON value for node \"" + key + "\"");
    }
    return value;
  }

  public long getNodeType() {
    return nodeType;
  }

  public long getChildNodeCount() {
    return childNodeCount;
  }

  public Optional<Map<String, String>> getAttributes() {
    return attributes;
  }

  public Optional<List<RemoteValue>> getChildren() {
    return children;
  }

  public Optional<String> getLocalName() {
    return localName;
  }

  public Optional<Mode> getMode() {
    return mode;
  }

  public Optional<String> getNamespaceURI() {
    return namespaceURI;
  }

  public Optional<String> getNodeValue() {
    return nodeValue;
  }

  public Optional<RemoteValue> getShadowRoot() {
    return shadowRoot;
  }
}
