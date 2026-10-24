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

package org.openqa.selenium.remote;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatExceptionOfType;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.openqa.selenium.AccessibilityNode;
import org.openqa.selenium.ImmutableCapabilities;
import org.openqa.selenium.UnsupportedCommandException;
import org.openqa.selenium.json.Json;

/**
 * A session without BiDi cannot take an accessibility snapshot, and says so before any command; the
 * atom's wire form decodes to the node tree with its references resolved.
 */
@Tag("UnitTests")
class AccessibilitySnapshotUnitTest {

  private static final Json JSON = new Json();

  /** Answers the new session command with the requested capabilities and records the rest. */
  private static final class RecordingExecutor implements CommandExecutor {
    final List<String> commands = new ArrayList<>();

    @Override
    public Response execute(Command command) {
      Response response = new Response(new SessionId(UUID.randomUUID()));
      response.setState("success");
      if (DriverCommand.NEW_SESSION.equals(command.getName())) {
        response.setValue(Map.of("browserName", "chrome"));
      } else {
        commands.add(command.getName());
      }
      return response;
    }
  }

  @Test
  void aSessionWithoutBiDiRaisesForTheWholePage() {
    RecordingExecutor executor = new RecordingExecutor();
    RemoteWebDriver driver =
        new RemoteWebDriver(executor, new ImmutableCapabilities("browserName", "chrome"));

    assertThatExceptionOfType(UnsupportedCommandException.class)
        .isThrownBy(driver::getAccessibilitySnapshot)
        .withMessageContaining("BiDi");
    assertThat(executor.commands).isEmpty();
  }

  @Test
  void aSessionWithoutBiDiRaisesForAnElement() {
    RecordingExecutor executor = new RecordingExecutor();
    RemoteWebDriver driver =
        new RemoteWebDriver(executor, new ImmutableCapabilities("browserName", "chrome"));
    RemoteWebElement element = new RemoteWebElement();
    element.setParent(driver);
    element.setId("element-1");

    assertThatExceptionOfType(UnsupportedCommandException.class)
        .isThrownBy(element::getAccessibilitySnapshot)
        .withMessageContaining("BiDi");
    assertThat(executor.commands).isEmpty();
  }

  @Test
  void fromWireBuildsTheTreeAndResolvesTheIndices() {
    RemoteWebElement region = element("region-1");
    RemoteWebElement frame = element("frame-1");
    RemoteWebElement button = element("button-1");
    Map<String, Object> data =
        JSON.toType(
            "{\"role\":\"region\",\"name\":\"App\",\"description\":\"\",\"states\":{},"
                + "\"element\":0,\"children\":["
                + "{\"role\":\"text\",\"name\":\"Welcome\",\"description\":\"\",\"states\":{},"
                + "\"children\":[]},"
                + "{\"role\":\"iframe\",\"name\":\"Embedded\",\"description\":\"\",\"states\":{},"
                + "\"element\":1,\"frame\":0,\"children\":[]},"
                + "{\"role\":\"button\",\"name\":\"Save\",\"description\":\"Saves\","
                + "\"states\":{\"disabled\":true,\"level\":2},\"element\":2,\"children\":[]}]}",
            Json.MAP_TYPE);
    AccessibilityNode framed =
        new AccessibilityNode("document", "Inner", "", null, Map.of(), null, List.of());

    AccessibilityNode node =
        AccessibilitySnapshotter.fromWire(
            data, List.of(region, frame, button), index -> List.of(framed));

    assertThat(node.getRole()).isEqualTo("region");
    assertThat(node.getName()).isEqualTo("App");
    assertThat(node.getElement()).isSameAs(region);
    assertThat(node.getChildren()).hasSize(3);
    AccessibilityNode text = node.getChildren().get(0);
    assertThat(text.getRole()).isEqualTo("text");
    assertThat(text.getElement()).isNull();
    AccessibilityNode iframe = node.getChildren().get(1);
    assertThat(iframe.getElement()).isSameAs(frame);
    assertThat(iframe.getChildren()).containsExactly(framed);
    AccessibilityNode save = node.getChildren().get(2);
    assertThat(save.getElement()).isSameAs(button);
    assertThat(save.getDescription()).isEqualTo("Saves");
    assertThat(save.getStates()).containsEntry("disabled", true);
    assertThat(((Number) save.getStates().get("level")).intValue()).isEqualTo(2);
  }

  @Test
  void fromWireKeepsAbsentFieldsAbsent() {
    Map<String, Object> data =
        JSON.toType(
            "{\"role\":\"textbox\",\"name\":\"\",\"description\":\"\",\"value\":\"a@b.c\","
                + "\"states\":{},\"element\":0,\"children\":[]}",
            Json.MAP_TYPE);

    AccessibilityNode node =
        AccessibilitySnapshotter.fromWire(data, List.of(element("input-1")), index -> List.of());

    assertThat(node.getValue()).isEqualTo("a@b.c");
    assertThat(node.getChildren()).isEmpty();
    assertThat(node.getStates()).isEmpty();
  }

  private static RemoteWebElement element(String id) {
    RemoteWebElement element = new RemoteWebElement();
    element.setId(id);
    return element;
  }
}
