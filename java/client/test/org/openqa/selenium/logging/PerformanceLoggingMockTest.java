/*
Copyright 2012 Software Freedom Conservancy

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

     http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

package org.openqa.selenium.logging;

import static org.junit.Assert.assertEquals;

import java.util.List;
import java.util.logging.Level;

import com.google.common.collect.ImmutableSet;
import org.jmock.Expectations;
import org.junit.Test;
import org.openqa.selenium.remote.DriverCommand;
import org.openqa.selenium.remote.ExecuteMethod;
import org.openqa.selenium.remote.RemoteLogs;
import org.openqa.selenium.testing.MockTestBase;

import com.google.common.collect.ImmutableList;
import com.google.common.collect.ImmutableMap;

public class PerformanceLoggingMockTest extends MockTestBase {
  @Test
  public void testMergesRemoteLogs() {
    final ExecuteMethod executeMethod = mock(ExecuteMethod.class);

    checking(new Expectations() {
      {
        one(executeMethod).execute(DriverCommand.GET_LOG,
          ImmutableMap.of(RemoteLogs.TYPE_KEY, LogType.PROFILER));
        will(returnValue(ImmutableList.of(ImmutableMap.of(
          "level", Level.INFO.getName(),
          "timestamp", 1L,
          "message", "second"))));
      }
    });
    
    LocalLogs localLogs = LocalLogs.getStoringLoggerInstance(ImmutableSet.<String>of(LogType.PROFILER));
    RemoteLogs logs = new RemoteLogs(executeMethod, localLogs);
    localLogs.addEntry(LogType.PROFILER, new LogEntry(Level.INFO, 0, "first"));
    localLogs.addEntry(LogType.PROFILER, new LogEntry(Level.INFO, 2, "third"));

    List<LogEntry> entries = logs.get(LogType.PROFILER).getAll();
    assertEquals(3, entries.size());
    for (int i = 0; i < entries.size(); ++i) {
      assertEquals(i, entries.get(i).getTimestamp());
    }
  }
}
