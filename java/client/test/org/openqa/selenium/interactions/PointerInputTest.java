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

import static org.hamcrest.MatcherAssert.assertThat;
import static org.hamcrest.Matchers.hasEntry;
import static org.junit.Assert.assertEquals;
import static org.openqa.selenium.remote.Dialect.W3C;

import com.google.gson.Gson;
import java.time.Duration;
import java.util.List;
import java.util.Map;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.junit.runners.JUnit4;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.WrappedWebElement;
import org.openqa.selenium.interactions.PointerInput.Kind;
import org.openqa.selenium.interactions.PointerInput.Origin;
import org.openqa.selenium.interactions.input.Interaction;
import org.openqa.selenium.interactions.input.Sequence;
import org.openqa.selenium.json.Json;
import org.openqa.selenium.remote.RemoteWebElement;

/**
 * Unit test for PointerInputs.
 */
@RunWith(JUnit4.class)
public class PointerInputTest {

  @Test
  public void encodesWrappedElementInMoveOrigin() {
    RemoteWebElement innerElement = new RemoteWebElement();
    innerElement.setId("12345");
    WebElement element = new WrappedWebElement(innerElement);

    PointerInput pointerInput = new PointerInput(Kind.MOUSE, null);
    Interaction move = pointerInput.createPointerMove(
        Duration.ofMillis(100), Origin.fromElement(element), 0, 0);
    Sequence sequence = new Sequence(move.getSource(), 0).addAction(move);

    String rawJson = new Json().toJson(sequence);
    ActionSequenceJson json = new Gson().fromJson(rawJson, ActionSequenceJson.class);

    assertEquals(json.actions.size(), 1);
    ActionJson firstAction = json.actions.get(0);
    assertThat(firstAction.origin, hasEntry(W3C.getEncodedElementKey(), "12345"));
  }

  private static class ActionSequenceJson {
    public List<ActionJson> actions;
  }

  private static class ActionJson {
    public Map<String, String> origin;
  }
}
