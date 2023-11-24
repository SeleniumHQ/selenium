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

package org.openqa.selenium.interactions;

import static org.assertj.core.api.Assertions.assertThat;
import static org.openqa.selenium.remote.Dialect.W3C;

import java.time.Duration;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.openqa.selenium.Point;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.WrappedWebElement;
import org.openqa.selenium.json.Json;
import org.openqa.selenium.json.PropertySetting;
import org.openqa.selenium.remote.RemoteWebElement;

@Tag("UnitTests")
class WheelInputTest {

  @Test
  void shouldEncodeWrappedElementInScrollOrigin() {
    RemoteWebElement innerElement = new RemoteWebElement();
    innerElement.setId("12345");
    WebElement element = new WrappedWebElement(innerElement);

    WheelInput wheelInput = new WheelInput("wheel");
    Interaction scroll =
        wheelInput.createScroll(
            new Point(20, 30),
            0,
            0,
            Duration.ofMillis(100),
            WheelInput.ScrollOrigin.fromElement(element));
    Sequence sequence = new Sequence(wheelInput, 0).addAction(scroll);

    String rawJson = new Json().toJson(sequence);
    ActionSequenceJson json =
        new Json().toType(rawJson, ActionSequenceJson.class, PropertySetting.BY_FIELD);

    assertThat(json.actions).hasSize(1);
    ActionJson firstAction = json.actions.get(0);
    assertThat(firstAction.origin).containsEntry(W3C.getEncodedElementKey(), "12345");
  }

  @Test
  void shouldEncodeWheelInput() {
    WheelInput wheelInput = new WheelInput("test-wheel");
    Map<String, Object> encodedResult = wheelInput.encode();

    assertThat(encodedResult).containsEntry("id", "test-wheel").containsEntry("type", "wheel");
  }

  @Test
  void shouldEncodeScrollInteractionWithViewPortOrigin() {
    WheelInput wheelInput = new WheelInput("test-wheel");
    WheelInput.ScrollInteraction interaction =
        (WheelInput.ScrollInteraction)
            wheelInput.createScroll(
                25, 50, 30, 60, Duration.ofSeconds(1), WheelInput.ScrollOrigin.fromViewport());

    Map<String, Object> encodedResult = interaction.encode();
    assertThat(encodedResult)
        .containsEntry("type", "scroll")
        .containsEntry("x", 25)
        .containsEntry("y", 50)
        .containsEntry("deltaX", 30)
        .containsEntry("deltaY", 60)
        .containsEntry("duration", 1000L)
        .containsEntry("origin", "viewport");
  }

  @Test
  void shouldEncodeScrollInteractionWithElementOrigin() {
    RemoteWebElement innerElement = new RemoteWebElement();
    innerElement.setId("12345");

    WheelInput wheelInput = new WheelInput("test-wheel");
    WheelInput.ScrollInteraction interaction =
        (WheelInput.ScrollInteraction)
            wheelInput.createScroll(
                new Point(25, 50),
                30,
                60,
                Duration.ofSeconds(1),
                WheelInput.ScrollOrigin.fromElement(innerElement));

    Map<String, Object> encodedResult = interaction.encode();
    assertThat(encodedResult)
        .containsEntry("type", "scroll")
        .containsEntry("x", 25)
        .containsEntry("y", 50)
        .containsEntry("deltaX", 30)
        .containsEntry("deltaY", 60)
        .containsEntry("duration", 1000L)
        .containsEntry("origin", innerElement);
  }

  private static class ActionSequenceJson {

    List<ActionJson> actions;
  }

  private static class ActionJson {

    Map<String, String> origin;
  }
}
