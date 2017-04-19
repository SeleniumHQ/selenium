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

import com.google.common.annotations.VisibleForTesting;
import com.google.common.collect.ImmutableMap;
import com.google.common.collect.ImmutableSet;
import com.google.common.collect.Lists;

import org.openqa.selenium.Beta;
import org.openqa.selenium.WebDriverException;
import org.openqa.selenium.logging.LocalLogs;
import org.openqa.selenium.logging.LogCombiner;
import org.openqa.selenium.logging.LogEntries;
import org.openqa.selenium.logging.LogEntry;
import org.openqa.selenium.logging.LogLevelMapping;
import org.openqa.selenium.logging.LogType;
import org.openqa.selenium.logging.Logs;

import java.text.DateFormat;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.TimeZone;
import java.util.logging.Level;
import java.util.logging.Logger;

@Beta
public class RemoteLogs implements Logs {
  private static final String LEVEL = "level";
  private static final String TIMESTAMP= "timestamp";
  private static final String MESSAGE = "message";
  private static final DateFormat ISO_8601_DATE_FORMAT = getIso8601DateFormat();

  private static final Logger logger = Logger.getLogger(RemoteLogs.class.getName());

  protected ExecuteMethod executeMethod;

  private static DateFormat getIso8601DateFormat() {
    TimeZone utcTimeZone = TimeZone.getTimeZone("UTC");
    DateFormat isoDateFormat = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'");
    isoDateFormat.setTimeZone(utcTimeZone);
    return isoDateFormat;
  }

  @VisibleForTesting public static final String TYPE_KEY = "type";
  private final LocalLogs localLogs;

  public RemoteLogs(ExecuteMethod executeMethod, LocalLogs localLogs) {
    this.executeMethod = executeMethod;
    this.localLogs = localLogs;
  }

  public LogEntries get(String logType) {
    if (LogType.PROFILER.equals(logType)) {
      LogEntries remoteEntries = new LogEntries(new ArrayList<>());
      try {
        remoteEntries = getRemoteEntries(logType);
      } catch (WebDriverException e) {
        // An exception may be thrown if the WebDriver server does not recognize profiler logs.
        // In this case, the user should be able to see the local profiler logs.
        logger.log(Level.WARNING,
            "Remote profiler logs are not available and have been omitted.", e);
      }

      return LogCombiner.combine(remoteEntries, getLocalEntries(logType));
    }
    if (LogType.CLIENT.equals(logType)) {
      return getLocalEntries(logType);
    }
    return getRemoteEntries(logType);
  }

  private LogEntries getRemoteEntries(String logType) {
    Object raw = executeMethod.execute(DriverCommand.GET_LOG, ImmutableMap.of(TYPE_KEY, logType));
    @SuppressWarnings("unchecked")
    List<Map<String, Object>> rawList = (List<Map<String, Object>>) raw;
    List<LogEntry> remoteEntries = Lists.newArrayListWithCapacity(rawList.size());

    for (Map<String, Object> obj : rawList) {
      Object rawTimestamp = obj.get(TIMESTAMP);
      long timestamp;
      if (rawTimestamp instanceof String) {
        try {
          Date date = ISO_8601_DATE_FORMAT.parse((String) rawTimestamp);
          timestamp = date.getTime();
        } catch (ParseException e) {
          throw new IncorrectDateFormatException("Incorrect date format. Expected ISO 8601, got: " + rawTimestamp, e);
        }
      } else if (rawTimestamp instanceof Date) {
        timestamp = ((Date) rawTimestamp).getTime();
      } else {
        timestamp = (Long) rawTimestamp;
      }
      remoteEntries.add(new LogEntry(LogLevelMapping.toLevel((String)obj.get(LEVEL)),
          timestamp,
          (String) obj.get(MESSAGE)));
    }
    return new LogEntries(remoteEntries);
  }

  private LogEntries getLocalEntries(String logType) {
    return localLogs.get(logType);
  }

  private Set<String> getAvailableLocalLogs() {
    return localLogs.getAvailableLogTypes();
  }

  public Set<String> getAvailableLogTypes() {
    Object raw = executeMethod.execute(DriverCommand.GET_AVAILABLE_LOG_TYPES, null);
    @SuppressWarnings("unchecked")
    List<String> rawList = (List<String>) raw;
    ImmutableSet.Builder<String> builder = new ImmutableSet.Builder<>();
    for (String logType : rawList) {
      builder.add(logType);
    }
    builder.addAll(getAvailableLocalLogs());
    return builder.build();
  }
}
