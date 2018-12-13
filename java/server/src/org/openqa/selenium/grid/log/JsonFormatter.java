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

package org.openqa.selenium.grid.log;

import static java.time.ZoneOffset.UTC;
import static java.time.format.DateTimeFormatter.ISO_OFFSET_DATE_TIME;

import org.openqa.selenium.json.Json;
import org.openqa.selenium.json.JsonOutput;

import java.time.Instant;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.util.Map;
import java.util.TreeMap;
import java.util.logging.Formatter;
import java.util.logging.LogRecord;

class JsonFormatter extends Formatter {

  public static final Json JSON = new Json();

  @Override
  public String format(LogRecord record) {
    Map<String, Object> logRecord = new TreeMap<>();

    Instant instant = Instant.ofEpochMilli(record.getMillis());
    ZonedDateTime local = ZonedDateTime.ofInstant(instant, ZoneId.systemDefault());

    logRecord.put("log-time-local", ISO_OFFSET_DATE_TIME.format(local));
    logRecord.put("log-time-utc", ISO_OFFSET_DATE_TIME.format(local.withZoneSameInstant(UTC)));

    String[] split = record.getSourceClassName().split("\\.");
    logRecord.put("class", split[split.length - 1]);
    logRecord.put("method", record.getSourceMethodName());
    logRecord.put("log-name", record.getLoggerName());
    logRecord.put("log-level", record.getLevel());
    logRecord.put("log-message", record.getMessage());

    StringBuilder text = new StringBuilder();
    try (JsonOutput json = JSON.newOutput(text).setPrettyPrint(false)) {
      json.write(logRecord);
      text.append('\n');
    }
    return text.toString();
  }
}
