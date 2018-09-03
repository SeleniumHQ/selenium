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

package org.openqa.selenium.logging;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import com.google.common.collect.ImmutableList;
import com.google.common.collect.ImmutableMap;
import com.google.common.collect.ImmutableSet;

import org.junit.Test;
import org.openqa.selenium.remote.DriverCommand;
import org.openqa.selenium.remote.ExecuteMethod;
import org.openqa.selenium.remote.RemoteLogs;

import java.util.List;
import java.util.logging.Level;

public class PerformanceLoggingMockTest {

  @Test
  public void testMergesRemoteLogs() {
    final ExecuteMethod executeMethod = mock(ExecuteMethod.class);

    when(executeMethod.execute(
        DriverCommand.GET_LOG, ImmutableMap.of(RemoteLogs.TYPE_KEY, LogType.PROFILER)))
        .thenReturn(ImmutableList.of(ImmutableMap.of(
          "level", Level.INFO.getName(),
          "timestamp", 1L,
          "message", "second")));

    LocalLogs localLogs = LocalLogs.getStoringLoggerInstance(ImmutableSet.of(LogType.PROFILER));
    RemoteLogs logs = new RemoteLogs(executeMethod, localLogs);
    localLogs.addEntry(LogType.PROFILER, new LogEntry(Level.INFO, 0, "first"));
    localLogs.addEntry(LogType.PROFILER, new LogEntry(Level.INFO, 2, "third"));

    List<LogEntry> entries = logs.get(LogType.PROFILER).getAll();
    assertThat(entries).hasSize(3);
    for (int i = 0; i < entries.size(); ++i) {
      assertThat(entries.get(i).getTimestamp()).isEqualTo(i);
    }
  }
}
