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

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.io.StringReader;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.openqa.selenium.json.Json;
import org.openqa.selenium.json.JsonException;
import org.openqa.selenium.json.JsonInput;

@Tag("UnitTests")
class RemoteValueTest {

  private static final Json JSON = new Json();

  @Test
  void decodesObjectChainDeeperThanJsonOutputMaxDepth() {
    // Each nesting level is three JSON levels (object -> entries -> [key, value]), so before
    // #18076 a chain past ~34 levels hit JsonOutput.MAX_DEPTH while being re-serialized.
    for (int depth : new int[] {20, 40, 200}) {
      RemoteValue value = decode(objectChain(depth));

      int walked = 0;
      RemoteValue current = value;
      while (current.getType().equals("object")) {
        current = entries(current).get("k");
        walked++;
      }

      assertThat(walked).isEqualTo(depth);
      assertThat(current.getType()).isEqualTo("number");
      assertThat(current.getValue().get()).isEqualTo(0L);
    }
  }

  @Test
  void decodesLargeArrayOfNestedRecords() {
    int count = 10_000;
    StringBuilder json = new StringBuilder("{\"type\":\"array\",\"value\":[");
    for (int i = 0; i < count; i++) {
      if (i > 0) {
        json.append(',');
      }
      json.append("{\"type\":\"object\",\"value\":[[\"index\",")
          .append(number(i))
          .append("],[\"nested\",{\"type\":\"object\",\"value\":[[\"value\",")
          .append(number(i))
          .append("]]}]]}");
    }
    json.append("]}");

    RemoteValue value = decode(json.toString());

    List<RemoteValue> items = items(value);
    assertThat(items).hasSize(count);

    RemoteValue last = items.get(count - 1);
    assertThat(last.getType()).isEqualTo("object");
    assertThat(entries(last).get("index").getValue().get()).isEqualTo((long) count - 1);
    assertThat(entries(entries(last).get("nested")).get("value").getValue().get())
        .isEqualTo((long) count - 1);
  }

  @Test
  void decodesMapWithNonStringKeys() {
    RemoteValue value =
        decode(
            "{\"type\":\"map\",\"value\":["
                + "["
                + number(7)
                + ","
                + string("seven")
                + "],"
                + "[{\"type\":\"object\",\"value\":[[\"x\","
                + number(1)
                + "]]},"
                + string("obj")
                + "],"
                + "[\"plain\","
                + number(3)
                + "]]}");

    Map<?, ?> map = (Map<?, ?>) value.getValue().get();
    assertThat(map).hasSize(3);

    RemoteValue numberKeyValue = null;
    RemoteValue objectKeyValue = null;
    for (Map.Entry<?, ?> entry : map.entrySet()) {
      if (entry.getKey() instanceof RemoteValue) {
        RemoteValue key = (RemoteValue) entry.getKey();
        if (key.getType().equals("number")) {
          assertThat(key.getValue().get()).isEqualTo(7L);
          numberKeyValue = (RemoteValue) entry.getValue();
        } else {
          assertThat(key.getType()).isEqualTo("object");
          assertThat(entries(key).get("x").getValue().get()).isEqualTo(1L);
          objectKeyValue = (RemoteValue) entry.getValue();
        }
      }
    }

    assertThat(numberKeyValue.getValue().get()).isEqualTo("seven");
    assertThat(objectKeyValue.getValue().get()).isEqualTo("obj");
    assertThat(((RemoteValue) map.get("plain")).getValue().get()).isEqualTo(3L);
  }

  @Test
  void decodesSetAndNodeListItems() {
    RemoteValue set =
        decode("{\"type\":\"set\",\"value\":[" + number(1) + "," + objectChain(2) + "]}");
    assertThat(items(set)).hasSize(2);
    assertThat(items(set).get(0).getValue().get()).isEqualTo(1L);
    assertThat(items(set).get(1).getType()).isEqualTo("object");

    RemoteValue nodeList =
        decode(
            "{\"type\":\"nodelist\",\"value\":["
                + "{\"type\":\"node\",\"sharedId\":\"n1\","
                + "\"value\":{\"nodeType\":1,\"childNodeCount\":0}}]}");
    assertThat(items(nodeList)).hasSize(1);
    assertThat(items(nodeList).get(0).getSharedId().get()).isEqualTo("n1");
  }

  @Test
  void decodesNodeChildrenAndShadowRootAsRemoteValues() {
    RemoteValue value =
        decode(
            "{\"type\":\"node\",\"sharedId\":\"root\",\"value\":{"
                + "\"nodeType\":1,\"childNodeCount\":1,\"localName\":\"div\","
                + "\"attributes\":{\"id\":\"host\"},"
                + "\"children\":[{\"type\":\"node\",\"sharedId\":\"text\",\"value\":"
                + "{\"nodeType\":3,\"childNodeCount\":0,\"nodeValue\":\"hello\"}}],"
                + "\"shadowRoot\":{\"type\":\"node\",\"sharedId\":\"shadow\",\"value\":"
                + "{\"nodeType\":11,\"childNodeCount\":0,\"mode\":\"open\"}}}}");

    NodeProperties node = (NodeProperties) value.getValue().get();
    assertThat(node.getNodeType()).isEqualTo(1L);
    assertThat(node.getChildNodeCount()).isEqualTo(1L);
    assertThat(node.getLocalName().get()).isEqualTo("div");
    assertThat(node.getAttributes().get()).isEqualTo(Map.of("id", "host"));

    RemoteValue child = node.getChildren().get().get(0);
    assertThat(child.getSharedId().get()).isEqualTo("text");
    assertThat(((NodeProperties) child.getValue().get()).getNodeValue().get()).isEqualTo("hello");

    RemoteValue shadowRoot = node.getShadowRoot().get();
    assertThat(shadowRoot.getSharedId().get()).isEqualTo("shadow");
    assertThat(((NodeProperties) shadowRoot.getValue().get()).getMode().get())
        .isEqualTo(NodeProperties.Mode.OPEN);
  }

  @Test
  void decodesNodeTreeDeeperThanJsonOutputMaxDepth() {
    // NodeProperties is not a leaf: children re-enter RemoteValue decoding at every level.
    int depth = 40;
    String json = "{\"type\":\"node\",\"value\":{\"nodeType\":3,\"childNodeCount\":0}}";
    for (int i = 0; i < depth; i++) {
      json =
          "{\"type\":\"node\",\"value\":{\"nodeType\":1,\"childNodeCount\":1,\"children\":["
              + json
              + "]}}";
    }

    RemoteValue current = decode(json);
    for (int i = 0; i < depth; i++) {
      current = ((NodeProperties) current.getValue().get()).getChildren().get().get(0);
    }

    assertThat(((NodeProperties) current.getValue().get()).getNodeType()).isEqualTo(3L);
  }

  @Test
  void decodesLeafValues() {
    RegExpValue regExp =
        (RegExpValue)
            decode("{\"type\":\"regexp\",\"value\":{\"pattern\":\"a+\",\"flags\":\"g\"}}")
                .getValue()
                .get();
    assertThat(regExp.getPattern()).isEqualTo("a+");
    assertThat(regExp.getFlags()).isEqualTo("g");

    WindowProxyProperties window =
        (WindowProxyProperties)
            decode("{\"type\":\"window\",\"value\":{\"context\":\"ctx\"}}").getValue().get();
    assertThat(window.getBrowsingContext()).isEqualTo("ctx");
  }

  @Test
  void keepsHandleInternalIdAndSharedIdOnNestedValues() {
    RemoteValue value =
        decode(
            "{\"type\":\"array\",\"value\":[{\"type\":\"object\",\"handle\":\"h\","
                + "\"internalId\":\"i\",\"value\":[]},"
                + "{\"type\":\"node\",\"sharedId\":\"s\","
                + "\"value\":{\"nodeType\":1,\"childNodeCount\":0}}]}");

    RemoteValue object = items(value).get(0);
    assertThat(object.getHandle().get()).isEqualTo("h");
    assertThat(object.getInternalId().get()).isEqualTo("i");
    assertThat(items(value).get(1).getSharedId().get()).isEqualTo("s");
  }

  @Test
  void rejectsNestedValueWithoutType() {
    assertThatThrownBy(() -> decode("{\"type\":\"array\",\"value\":[{\"value\":1}]}"))
        .isInstanceOf(JsonException.class);
  }

  @Test
  void coercesNumericStringNodeCountsLikeTheJsonLayer() {
    // Matches NumberCoercer, which the constructor-based decoding used before.
    NodeProperties fromStrings =
        node("{\"type\":\"node\",\"value\":{\"nodeType\":\"1\",\"childNodeCount\":\"0\"}}");
    assertThat(fromStrings.getNodeType()).isEqualTo(1L);
    assertThat(fromStrings.getChildNodeCount()).isEqualTo(0L);

    NodeProperties fromDecimalAndExponent =
        node("{\"type\":\"node\",\"value\":{\"nodeType\":1.0,\"childNodeCount\":\"2e0\"}}");
    assertThat(fromDecimalAndExponent.getNodeType()).isEqualTo(1L);
    assertThat(fromDecimalAndExponent.getChildNodeCount()).isEqualTo(2L);

    assertThatThrownBy(
            () ->
                decode("{\"type\":\"node\",\"value\":{\"nodeType\":\"abc\",\"childNodeCount\":0}}"))
        .isInstanceOf(JsonException.class);
  }

  @Test
  void coercesScalarStringFieldsLikeTheJsonLayer() {
    // Matches StringCoercer: numbers and booleans are accepted as strings.
    NodeProperties node =
        node(
            "{\"type\":\"node\",\"value\":{\"nodeType\":1,\"childNodeCount\":0,"
                + "\"localName\":123,\"mode\":\"OPEN\",\"attributes\":{\"n\":5,\"b\":true}}}");
    assertThat(node.getLocalName().get()).isEqualTo("123");
    assertThat(node.getMode().get()).isEqualTo(NodeProperties.Mode.OPEN);
    assertThat(node.getAttributes().get()).isEqualTo(Map.of("n", "5", "b", "true"));

    RemoteValue value =
        items(
                decode(
                    "{\"type\":\"array\",\"value\":[{\"type\":\"object\",\"handle\":42,"
                        + "\"sharedId\":true,\"value\":[]}]}"))
            .get(0);
    assertThat(value.getHandle().get()).isEqualTo("42");
    assertThat(value.getSharedId().get()).isEqualTo("true");
  }

  @Test
  void keepsNullEntriesAndIgnoresExtraMapEntryItemsAsBefore() {
    // The previous decoding passed a JSON null through wherever a remote value was expected and
    // read only the first two items of a map entry; keep that behaviour.
    assertThat(items(decode("{\"type\":\"array\",\"value\":[null]}")))
        .containsExactly((RemoteValue) null);

    Map<Object, RemoteValue> map =
        entries(
            decode(
                "{\"type\":\"map\",\"value\":[[\"k\",null],[null,"
                    + number(1)
                    + "],[\"extra\","
                    + number(2)
                    + ",\"ignored\"]]}"));
    assertThat(map).hasSize(3);
    assertThat(map.get("k")).isNull();
    assertThat(map.get(null).getValue().get()).isEqualTo(1L);
    assertThat(map.get("extra").getValue().get()).isEqualTo(2L);

    NodeProperties node =
        node(
            "{\"type\":\"node\",\"value\":{\"nodeType\":1,\"childNodeCount\":1,"
                + "\"children\":[null],\"shadowRoot\":null}}");
    assertThat(node.getChildren().get()).containsExactly((RemoteValue) null);
    assertThat(node.getShadowRoot()).isEmpty();

    assertThatThrownBy(() -> decode("{\"type\":\"map\",\"value\":[[\"k\"]]}"))
        .isInstanceOf(JsonException.class);
  }

  private static NodeProperties node(String json) {
    return (NodeProperties) decode(json).getValue().get();
  }

  private static RemoteValue decode(String json) {
    try (JsonInput input = JSON.newInput(new StringReader(json))) {
      return input.read(RemoteValue.class);
    }
  }

  @SuppressWarnings("unchecked")
  private static List<RemoteValue> items(RemoteValue value) {
    return (List<RemoteValue>) value.getValue().get();
  }

  @SuppressWarnings("unchecked")
  private static Map<Object, RemoteValue> entries(RemoteValue value) {
    return (Map<Object, RemoteValue>) value.getValue().get();
  }

  private static String objectChain(int depth) {
    String json = number(0);
    for (int i = 0; i < depth; i++) {
      json = "{\"type\":\"object\",\"value\":[[\"k\"," + json + "]]}";
    }
    return json;
  }

  private static String number(long value) {
    return "{\"type\":\"number\",\"value\":" + value + "}";
  }

  private static String string(String value) {
    return "{\"type\":\"string\",\"value\":\"" + value + "\"}";
  }
}
