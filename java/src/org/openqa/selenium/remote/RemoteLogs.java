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

import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;
import org.openqa.selenium.Beta;
import org.openqa.selenium.UnsupportedCommandException;
import org.openqa.selenium.logging.LogEntries;
import org.openqa.selenium.logging.LogEntry;
import org.openqa.selenium.logging.LogLevelMapping;
import org.openqa.selenium.logging.Logs;

@Beta
public class RemoteLogs implements Logs {
  private static final String LEVEL = "level";
  private static final String TIMESTAMP = "timestamp";
  private static final String MESSAGE = "message";

  protected ExecuteMethod executeMethod;

  public static final String TYPE_KEY = "type";

  public RemoteLogs(ExecuteMethod executeMethod) {
    this.executeMethod = executeMethod;
  }

  @Override
  public LogEntries get(String logType) {
    return getRemoteEntries(logType);
  }

  private LogEntries getRemoteEntries(String logType) {
    Object raw = executeMethod.execute(DriverCommand.GET_LOG, Map.of(TYPE_KEY, logType));
    if (!(raw instanceof List)) {
      throw new UnsupportedCommandException("malformed response to remote logs command");
    }
    @SuppressWarnings("unchecked")
    List<Map<String, Object>> rawList = (List<Map<String, Object>>) raw;
    List<LogEntry> remoteEntries =
        rawList.stream().map(this::createLogEntry).collect(Collectors.toList());

    return new LogEntries(remoteEntries);
  }

  private LogEntry createLogEntry(Map<String, Object> obj) {
    return new LogEntry(
        LogLevelMapping.toLevel((String) obj.get(LEVEL)),
        (Long) obj.get(TIMESTAMP),
        (String) obj.get(MESSAGE));
  }

  @Override
  public Set<String> getAvailableLogTypes() {
    List<String> rawList = executeMethod.execute(DriverCommand.GET_AVAILABLE_LOG_TYPES);
    return Set.copyOf(new LinkedHashSet<>(rawList));
  }
}
