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

import java.util.ArrayList;
import java.util.Collections;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.logging.Level;
import java.util.logging.Logger;
import java.util.stream.Collectors;
import org.jspecify.annotations.Nullable;
import org.openqa.selenium.Beta;
import org.openqa.selenium.UnsupportedCommandException;
import org.openqa.selenium.WebDriverException;
import org.openqa.selenium.logging.LocalLogs;
import org.openqa.selenium.logging.LogCombiner;
import org.openqa.selenium.logging.LogEntries;
import org.openqa.selenium.logging.LogEntry;
import org.openqa.selenium.logging.LogLevelMapping;
import org.openqa.selenium.logging.LogType;
import org.openqa.selenium.logging.Logs;

@Beta
public class RemoteLogs implements Logs {
  private static final String LEVEL = "level";
  private static final String TIMESTAMP = "timestamp";
  private static final String MESSAGE = "message";

  private static final Logger LOG = Logger.getLogger(RemoteLogs.class.getName());

  protected ExecuteMethod executeMethod;

  public static final String TYPE_KEY = "type";
  @Nullable private final LocalLogs localLogs;

  public RemoteLogs(ExecuteMethod executeMethod) {
    this.executeMethod = executeMethod;
    this.localLogs = null;
  }

  /**
   * @deprecated logging is not in the W3C WebDriver spec and LocalLogs are no longer supported. Use
   *     {@link #RemoteLogs(ExecuteMethod)} instead.
   */
  @Deprecated(forRemoval = true)
  public RemoteLogs(ExecuteMethod executeMethod, LocalLogs localLogs) {
    this.executeMethod = executeMethod;
    this.localLogs = localLogs;
  }

  @Override
  @SuppressWarnings("deprecation")
  public LogEntries get(String logType) {
    if (LogType.CLIENT.equals(logType)) {
      LOG.warning(
          "LogType.CLIENT is deprecated and not part of the W3C WebDriver specification. "
              + "Returning empty log entries.");
      if (localLogs != null) {
        return getLocalEntries(logType);
      }
      return new LogEntries(Collections.emptyList());
    }
    if (LogType.PROFILER.equals(logType)) {
      LOG.warning(
          "LogType.PROFILER is deprecated and not part of the W3C WebDriver specification. "
              + "Returning empty log entries.");
      if (localLogs != null) {
        LogEntries remoteEntries = new LogEntries(new ArrayList<>());
        try {
          remoteEntries = getRemoteEntries(logType);
        } catch (WebDriverException e) {
          // An exception may be thrown if the WebDriver server does not recognize profiler logs.
          // In this case, the user should be able to see the local profiler logs.
          LOG.log(
              Level.WARNING, "Remote profiler logs are not available and have been omitted.", e);
        }
        return LogCombiner.combine(remoteEntries, getLocalEntries(logType));
      }
      return new LogEntries(Collections.emptyList());
    }
    if (LogType.SERVER.equals(logType)) {
      LOG.warning(
          "LogType.SERVER is deprecated. Selenium Grid no longer supports server logs. "
              + "Returning empty log entries.");
      return new LogEntries(Collections.emptyList());
    }
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

  /**
   * @deprecated logging is not in the W3C WebDriver spec and LocalLogs are no longer supported.
   */
  @Deprecated(forRemoval = true)
  private LogEntries getLocalEntries(String logType) {
    if (localLogs == null) {
      return new LogEntries(Collections.emptyList());
    }
    return localLogs.get(logType);
  }

  /**
   * @deprecated logging is not in the W3C WebDriver spec and LocalLogs are no longer supported.
   */
  @Deprecated(forRemoval = true)
  private Set<String> getAvailableLocalLogs() {
    if (localLogs == null) {
      return Collections.emptySet();
    }
    return localLogs.getAvailableLogTypes();
  }

  @Override
  public Set<String> getAvailableLogTypes() {
    List<String> rawList = executeMethod.execute(DriverCommand.GET_AVAILABLE_LOG_TYPES);
    Set<String> builder = new LinkedHashSet<>();
    builder.addAll(rawList);
    builder.addAll(getAvailableLocalLogs());
    return Set.copyOf(builder);
  }
}
