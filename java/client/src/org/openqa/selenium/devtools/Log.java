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

package org.openqa.selenium.devtools;

import static java.util.logging.Level.ALL;
import static java.util.logging.Level.INFO;
import static java.util.logging.Level.SEVERE;
import static java.util.logging.Level.WARNING;
import static org.openqa.selenium.devtools.ConverterFunctions.map;

import com.google.common.collect.ImmutableMap;

import org.openqa.selenium.devtools.network.model.MonotonicTime;
import org.openqa.selenium.json.JsonInput;

import java.util.Map;
import java.util.Objects;
import java.util.logging.Level;

public class Log {

  private final static String DOMAIN_NAME = "Log";

  public static Command<Void> clear() {
    return new Command<>(DOMAIN_NAME + ".clear", ImmutableMap.of());
  }

  public static Command<Void> enable() {
    return new Command<>(DOMAIN_NAME + ".enable", ImmutableMap.of());
  }

  public static Command<Void> disable() {
    return new Command<>(DOMAIN_NAME + ".disable", ImmutableMap.of());
  }

  public static Event<LogEntry> entryAdded() {
    return new Event<>(
        DOMAIN_NAME + ".entryAdded",
        map("entry", LogEntry.class));
  }

  public static class LogEntry {

    private final String source;
    private final String level;
    private final String text;
    private final MonotonicTime timestamp;

    public LogEntry(String source, String level, String text, MonotonicTime timestamp) {
      this.source = Objects.requireNonNull(source);
      this.level = Objects.requireNonNull(level);
      this.text = Objects.requireNonNull(text);
      this.timestamp = Objects.requireNonNull(timestamp);
    }

    public String getSource() {
      return source;
    }

    public String getLevel() {
      return level;
    }

    public String getText() {
      return text;
    }

    public MonotonicTime getTimestamp() {
      return timestamp;
    }

    public org.openqa.selenium.logging.LogEntry asSeleniumLogEntry() {
      Level level;
      switch (getLevel()) {
        case "error":
          level = SEVERE;
          break;

        case "verbose":
          level = ALL;
          break;

        case "warning":
          level = WARNING;
          break;

        default:
          level = INFO;
          break;
      }

      return new org.openqa.selenium.logging.LogEntry(level,
                                                      timestamp.getTimeStamp().toEpochMilli(),
                                                      getText());
    }

    private Map<String, Object> toJson() {
      return ImmutableMap.of(
          "source", getSource(),
          "level", getLevel(),
          "text", getText(),
          "timestamp", getTimestamp());
    }

    private static LogEntry fromJson(JsonInput input) {
      String source = null;
      String level = null;
      String text = null;
      MonotonicTime timestamp = null;

      input.beginObject();
      while (input.hasNext()) {
        switch (input.nextName()) {
          case "level":
            level = input.nextString();
            break;

          case "source":
            source = input.nextString();
            break;

          case "text":
            text = input.nextString();
            break;

          case "timestamp":
            timestamp = MonotonicTime.parse(input.nextNumber());
            break;

          default:
            input.skipValue();
            break;
        }
      }
      input.endObject();

      return new LogEntry(source, level, text, timestamp);
    }
  }

}
