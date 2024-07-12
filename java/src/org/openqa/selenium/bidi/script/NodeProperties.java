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

import java.util.List;
import java.util.Map;
import java.util.Optional;
import org.openqa.selenium.json.JsonInput;
import org.openqa.selenium.json.TypeToken;

public class NodeProperties {
  private enum Mode {
    OPEN("open"),
    CLOSE("close");

    private final String value;

    Mode(String mode) {
      this.value = mode;
    }

    @Override
    public String toString() {
      return value;
    }

    public static Mode findByName(String name) {
      Mode result = null;
      for (Mode type : values()) {
        if (type.toString().equalsIgnoreCase(name)) {
          result = type;
          break;
        }
      }
      return result;
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

  public NodeProperties(
      long nodeType,
      long childNodeCount,
      Optional<Map<String, String>> attributes,
      Optional<List<RemoteValue>> children,
      Optional<String> localName,
      Optional<Mode> mode,
      Optional<String> namespaceURI,
      Optional<String> nodeValue,
      Optional<RemoteValue> shadowRoot) {
    this.nodeType = nodeType;
    this.childNodeCount = childNodeCount;
    this.attributes = attributes;
    this.children = children;
    this.localName = localName;
    this.mode = mode;
    this.namespaceURI = namespaceURI;
    this.nodeValue = nodeValue;
    this.shadowRoot = shadowRoot;
  }

  public static NodeProperties fromJson(JsonInput input) {
    long nodeType = 0L;

    long childNodeCount = 0L;

    Optional<Map<String, String>> attributes = Optional.empty();

    Optional<List<RemoteValue>> children = Optional.empty();

    Optional<String> localName = Optional.empty();

    Optional<Mode> mode = Optional.empty();

    Optional<String> namespaceURI = Optional.empty();

    Optional<String> nodeValue = Optional.empty();

    Optional<RemoteValue> shadowRoot = Optional.empty();

    input.beginObject();
    while (input.hasNext()) {
      switch (input.nextName()) {
        case "nodeType":
          nodeType = input.read(long.class);
          break;

        case "childNodeCount":
          childNodeCount = input.read(long.class);
          break;

        case "attributes":
          attributes = Optional.of(input.read(new TypeToken<Map<String, String>>() {}.getType()));
          break;

        case "children":
          children = Optional.of(input.read(new TypeToken<List<RemoteValue>>() {}.getType()));
          break;

        case "localName":
          localName = Optional.of(input.read(String.class));
          break;

        case "mode":
          mode = Optional.of(Mode.findByName(input.read(String.class)));
          break;

        case "namespaceURI":
          namespaceURI = Optional.of(input.read(String.class));
          break;

        case "nodeValue":
          nodeValue = Optional.of(input.read(String.class));
          break;

        case "shadowRoot":
          shadowRoot = Optional.ofNullable(input.read(RemoteValue.class));
          break;

        default:
          input.skipValue();
          break;
      }
    }

    input.endObject();

    return new NodeProperties(
        nodeType,
        childNodeCount,
        attributes,
        children,
        localName,
        mode,
        namespaceURI,
        nodeValue,
        shadowRoot);
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
