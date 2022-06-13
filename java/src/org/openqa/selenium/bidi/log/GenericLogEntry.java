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

import static java.util.Collections.unmodifiableMap;

import java.util.Map;
import java.util.TreeMap;

import org.openqa.selenium.json.JsonInput;

// @see <a href="https://w3c.github.io/webdriver-bidi/#types-log-logentry">https://w3c.github.io/webdriver-bidi/#types-log-logentry</a>
public class GenericLogEntry extends BaseLogEntry {

  private final String type;

  public GenericLogEntry(LogLevel level,
                         String text,
                         long timestamp,
                         String type,
                         StackTrace stackTrace) {
    super(level, text, timestamp, stackTrace);
    this.type = type;
  }

  public String getType() {
    return type;
  }

  public static GenericLogEntry fromJson(JsonInput input) {
    LogLevel level = null;
    String text = null;
    long timestamp = 0;
    String type = null;
    StackTrace stackTrace = null;

    input.beginObject();
    while (input.hasNext()) {
      switch (input.nextName()) {
        case "level":
          level = input.read(LogLevel.class);
          break;

        case "text":
          text = input.read(String.class);
          break;

        case "timestamp":
          timestamp = input.read(Long.class);
          break;

        case "type":
          type = input.read(String.class);
          break;

        case "stackTrace":
          stackTrace = input.read(StackTrace.class);
          break;

        default:
          input.skipValue();
          break;
      }
    }

    input.endObject();

    return new GenericLogEntry(level, text, timestamp, type, stackTrace);
  }

  private Map<String, Object> toJson() {
    Map<String, Object> toReturn = new TreeMap<>();
    toReturn.put("type", type);
    toReturn.put("level", super.getLevel());
    toReturn.put("text", super.getText());
    toReturn.put("timestamp", super.getTimestamp());
    toReturn.put("stackTrace", super.getStackTrace());

    return unmodifiableMap(toReturn);
  }

}
