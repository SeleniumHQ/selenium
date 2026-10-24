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
import org.openqa.selenium.ImmutableCapabilities;
import org.openqa.selenium.UnsupportedCommandException;

/** A session without BiDi cannot take an accessibility snapshot, and says so before any command. */
@Tag("UnitTests")
class AccessibilitySnapshotUnitTest {

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
}
