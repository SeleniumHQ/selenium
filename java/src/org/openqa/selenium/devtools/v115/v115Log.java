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

package org.openqa.selenium.devtools.v115;

import java.util.function.Function;
import java.util.logging.Level;
import org.openqa.selenium.devtools.Command;
import org.openqa.selenium.devtools.ConverterFunctions;
import org.openqa.selenium.devtools.Event;
import org.openqa.selenium.devtools.v115.log.Log;
import org.openqa.selenium.devtools.v115.log.model.LogEntry;
import org.openqa.selenium.devtools.v115.runtime.model.Timestamp;
import org.openqa.selenium.json.JsonInput;

public class v115Log implements org.openqa.selenium.devtools.idealized.log.Log {

  @Override
  public Command<Void> enable() {
    return Log.enable();
  }

  @Override
  public Command<Void> clear() {
    return Log.clear();
  }

  @Override
  public Event<org.openqa.selenium.devtools.idealized.log.model.LogEntry> entryAdded() {
    return new Event<>(
        Log.entryAdded().getMethod(),
        input -> {
          Function<JsonInput, LogEntry> mapper = ConverterFunctions.map("entry", LogEntry.class);
          LogEntry entry = mapper.apply(input);

          return new org.openqa.selenium.devtools.idealized.log.model.LogEntry(
              entry.getSource().toString(),
              new org.openqa.selenium.logging.LogEntry(
                  fromCdpLevel(entry.getLevel()),
                  fromCdpTimestamp(entry.getTimestamp()),
                  entry.getText()));
        });
  }

  private Level fromCdpLevel(LogEntry.Level level) {
    switch (level.toString()) {
      case "verbose":
        return Level.FINEST;

      case "info":
        return Level.INFO;

      case "warning":
        return Level.WARNING;

      case "error":
        return Level.SEVERE;

      default:
        return Level.INFO;
    }
  }

  private long fromCdpTimestamp(Timestamp timestamp) {
    try {
      return Long.parseLong(timestamp.toString());
    } catch (NumberFormatException e) {
      return System.currentTimeMillis();
    }
  }
}
