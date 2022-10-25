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

package org.openqa.selenium.bidi.log;

import org.openqa.selenium.bidi.Event;
import org.openqa.selenium.json.Json;
import org.openqa.selenium.json.JsonInput;

import java.io.StringReader;
import java.util.Optional;

public class Log {

  private Log() {
    // A utility class for Log events that returns the event and adds a consumer to map the event response
  }

  private static final Json JSON = new Json();

  public static Event<LogEntry> entryAdded() {
    return new Event<>(
      "log.entryAdded",
      params -> {
        String type = (String) params.get("type");

        Optional<GenericLogEntry> genericLogEntry = Optional.empty();
        Optional<ConsoleLogEntry> consoleLogEntry = Optional.empty();
        Optional<GenericLogEntry> javascriptLogEntry = Optional.empty();

        if (type != null) {
          try (StringReader reader = new StringReader(JSON.toJson(params));
               JsonInput input = JSON.newInput(reader)) {
            if ("console".equals(type)) {
              consoleLogEntry = Optional.ofNullable(input.read(ConsoleLogEntry.class));
            } else if ("javascript".equals(type)) {
              javascriptLogEntry = Optional.ofNullable(input.read(GenericLogEntry.class));
            } else {
              genericLogEntry = Optional.ofNullable(input.read(GenericLogEntry.class));
            }
          }
        }

        return new LogEntry(genericLogEntry, consoleLogEntry, javascriptLogEntry);
      });
  }
}
