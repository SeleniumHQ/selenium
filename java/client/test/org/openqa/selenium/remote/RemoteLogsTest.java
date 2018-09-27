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
import static org.mockito.Mockito.verifyNoMoreInteractions;
import static org.mockito.Mockito.when;

import com.google.common.collect.ImmutableList;
import com.google.common.collect.ImmutableMap;

import org.junit.Before;
import org.junit.Test;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.openqa.selenium.WebDriverException;
import org.openqa.selenium.logging.LocalLogs;
import org.openqa.selenium.logging.LogEntries;
import org.openqa.selenium.logging.LogEntry;
import org.openqa.selenium.logging.LogType;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.logging.Level;

public class RemoteLogsTest {
  @Mock
  private ExecuteMethod executeMethod;

  @Mock
  private LocalLogs localLogs;

  private RemoteLogs remoteLogs;

  @Before
  public void createMocksAndRemoteLogs() {
    MockitoAnnotations.initMocks(this);
    remoteLogs = new RemoteLogs(executeMethod, localLogs);
  }

  @Test
  public void canGetProfilerLogs() {
    List<LogEntry> entries = new ArrayList<>();
    entries.add(new LogEntry(Level.INFO, 0, "hello"));
    when(localLogs.get(LogType.PROFILER)).thenReturn(new LogEntries(entries));

    when(
        executeMethod.execute(
            DriverCommand.GET_LOG, ImmutableMap.of(RemoteLogs.TYPE_KEY, LogType.PROFILER)))
        .thenReturn(ImmutableList.of(
            ImmutableMap.of("level", Level.INFO.getName(), "timestamp", 1L, "message", "world")));

    LogEntries logEntries = remoteLogs.get(LogType.PROFILER);
    List<LogEntry> allLogEntries = logEntries.getAll();
    assertThat(allLogEntries).hasSize(2);
    assertThat(allLogEntries.get(0).getMessage()).isEqualTo("hello");
    assertThat(allLogEntries.get(1).getMessage()).isEqualTo("world");
  }

  @Test
  public void canGetLocalProfilerLogsIfNoRemoteProfilerLogSupport() {
    List<LogEntry> entries = new ArrayList<>();
    entries.add(new LogEntry(Level.INFO, 0, "hello"));
    when(localLogs.get(LogType.PROFILER)).thenReturn(new LogEntries(entries));

    when(
        executeMethod.execute(
            DriverCommand.GET_LOG, ImmutableMap.of(RemoteLogs.TYPE_KEY, LogType.PROFILER)))
        .thenThrow(
            new WebDriverException("IGNORE THIS LOG MESSAGE AND STACKTRACE; IT IS EXPECTED."));

    LogEntries logEntries = remoteLogs.get(LogType.PROFILER);
    List<LogEntry> allLogEntries = logEntries.getAll();
    assertThat(allLogEntries).hasSize(1);
    assertThat(allLogEntries.get(0).getMessage()).isEqualTo("hello");
  }

  @Test
  public void canGetClientLogs() {
    List<LogEntry> entries = new ArrayList<>();
    entries.add(new LogEntry(Level.SEVERE, 0, "hello"));
    when(localLogs.get(LogType.CLIENT)).thenReturn(new LogEntries(entries));

    LogEntries logEntries = remoteLogs.get(LogType.CLIENT);
    assertThat(logEntries.getAll()).hasSize(1);
    assertThat(logEntries.getAll().get(0).getMessage()).isEqualTo("hello");

    // Client logs should not retrieve remote logs.
    verifyNoMoreInteractions(executeMethod);
  }

  @Test
  public void canGetServerLogs() {
    when(
        executeMethod.execute(
            DriverCommand.GET_LOG, ImmutableMap.of(RemoteLogs.TYPE_KEY, LogType.SERVER)))
        .thenReturn(ImmutableList.of(
            ImmutableMap.of("level", Level.INFO.getName(), "timestamp", 0L, "message", "world")));

    LogEntries logEntries = remoteLogs.get(LogType.SERVER);
    assertThat(logEntries.getAll()).hasSize(1);
    assertThat(logEntries.getAll().get(0).getMessage()).isEqualTo("world");

    // Server logs should not retrieve local logs.
    verifyNoMoreInteractions(localLogs);
  }

  @Test
  public void throwsOnBogusRemoteLogsResponse() {
    when(
        executeMethod
            .execute(DriverCommand.GET_LOG, ImmutableMap.of(RemoteLogs.TYPE_KEY, LogType.BROWSER)))
        .thenReturn(new ImmutableMap.Builder<>()
                        .put("error", "unknown method")
                        .put("message", "Command not found: POST /session/11037/log")
                        .put("stacktrace", "").build());

    assertThatExceptionOfType(WebDriverException.class)
        .isThrownBy(() -> remoteLogs.get(LogType.BROWSER));

    verifyNoMoreInteractions(localLogs);
  }

  @Test
  public void canGetAvailableLogTypes() {
    List<String> remoteAvailableLogTypes = new ArrayList<>();
    remoteAvailableLogTypes.add(LogType.PROFILER);
    remoteAvailableLogTypes.add(LogType.SERVER);

    when(executeMethod.execute(DriverCommand.GET_AVAILABLE_LOG_TYPES, null))
        .thenReturn(remoteAvailableLogTypes);

    Set<String> localAvailableLogTypes = new HashSet<>();
    localAvailableLogTypes.add(LogType.PROFILER);
    localAvailableLogTypes.add(LogType.CLIENT);

    when(localLogs.getAvailableLogTypes()).thenReturn(localAvailableLogTypes);

    Set<String> expected = new HashSet<>();
    expected.add(LogType.CLIENT);
    expected.add(LogType.PROFILER);
    expected.add(LogType.SERVER);

    Set<String> availableLogTypes = remoteLogs.getAvailableLogTypes();

    assertThat(availableLogTypes).isEqualTo(expected);
  }
}
