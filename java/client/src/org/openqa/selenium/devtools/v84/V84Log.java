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

package org.openqa.selenium.devtools.v84;

import org.openqa.selenium.devtools.Command;
import org.openqa.selenium.devtools.Event;
import org.openqa.selenium.devtools.idealized.log.model.LogEntry;
import org.openqa.selenium.devtools.v84.log.Log;
import org.openqa.selenium.devtools.v84.runtime.model.Timestamp;

import java.util.logging.Level;

public class V84Log implements org.openqa.selenium.devtools.idealized.log.Log {
  @Override
  public Command<Void> enable() {
    return Log.enable();
  }

  @Override
  public Command<Void> clear() {
    return Log.clear();
  }

  @Override
  public Event<LogEntry> entryAdded() {
    return new Event<>(
      Log.entryAdded().getMethod(),
      input -> {
        org.openqa.selenium.devtools.v84.log.model.LogEntry entry =
          input.read(org.openqa.selenium.devtools.v84.log.model.LogEntry.class);

        return new LogEntry(
          entry.getSource().toString(),
          new org.openqa.selenium.logging.LogEntry(
            fromCdpLevel(entry.getLevel()),
            fromCdpTimestamp(entry.getTimestamp()),
            entry.getText()));
      });
  }

  private Level fromCdpLevel(org.openqa.selenium.devtools.v84.log.model.LogEntry.Level level) {
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
