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

import static java.util.Collections.singletonList;
import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatExceptionOfType;
import static org.mockito.Mockito.when;

import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.logging.Level;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.openqa.selenium.WebDriverException;
import org.openqa.selenium.logging.LogEntries;
import org.openqa.selenium.logging.LogType;

@Tag("UnitTests")
class RemoteLogsTest {
  @Mock private ExecuteMethod executeMethod;

  private RemoteLogs remoteLogs;

  @BeforeEach
  public void createMocksAndRemoteLogs() {
    MockitoAnnotations.initMocks(this);
    remoteLogs = new RemoteLogs(executeMethod);
  }

  @Test
  void canGetBrowserLogs() {
    when(executeMethod.execute(DriverCommand.GET_LOG, Map.of(RemoteLogs.TYPE_KEY, LogType.BROWSER)))
        .thenReturn(
            singletonList(
                Map.of("level", Level.INFO.getName(), "timestamp", 1L, "message", "hello")));

    LogEntries logEntries = remoteLogs.get(LogType.BROWSER);
    assertThat(logEntries.getAll()).hasSize(1);
    assertThat(logEntries.getAll().get(0).getMessage()).isEqualTo("hello");
  }

  @Test
  void throwsOnBogusRemoteLogsResponse() {
    when(executeMethod.execute(DriverCommand.GET_LOG, Map.of(RemoteLogs.TYPE_KEY, LogType.BROWSER)))
        .thenReturn(
            Map.of(
                "error", "unknown method",
                "message", "Command not found: POST /session/11037/log",
                "stacktrace", ""));

    assertThatExceptionOfType(WebDriverException.class)
        .isThrownBy(() -> remoteLogs.get(LogType.BROWSER));
  }

  @Test
  void canGetAvailableLogTypes() {
    List<String> remoteAvailableLogTypes = List.of(LogType.BROWSER, LogType.DRIVER);
    when(executeMethod.execute(DriverCommand.GET_AVAILABLE_LOG_TYPES))
        .thenReturn(remoteAvailableLogTypes);

    Set<String> availableLogTypes = remoteLogs.getAvailableLogTypes();

    assertThat(availableLogTypes).containsExactlyInAnyOrder(LogType.BROWSER, LogType.DRIVER);
  }
}
