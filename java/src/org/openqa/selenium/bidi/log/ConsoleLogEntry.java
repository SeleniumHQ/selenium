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

import java.util.List;
import java.util.Map;
import java.util.TreeMap;
import org.openqa.selenium.bidi.script.RemoteValue;
import org.openqa.selenium.bidi.script.Source;
import org.openqa.selenium.json.JsonInput;
import org.openqa.selenium.json.TypeToken;

// @see <a
// href="https://w3c.github.io/webdriver-bidi/#types-log-logentry">https://w3c.github.io/webdriver-bidi/#types-log-logentry</a>
public class ConsoleLogEntry extends GenericLogEntry {

  private final String method;
  private final List<RemoteValue> args;

  public ConsoleLogEntry(
      LogLevel level,
      Source source,
      String text,
      long timestamp,
      String type,
      String method,
      List<RemoteValue> args,
      StackTrace stackTrace) {
    super(level, source, text, timestamp, type, stackTrace);
    this.method = method;
    this.args = args;
  }

  public String getMethod() {
    return method;
  }

  public List<RemoteValue> getArgs() {
    return args;
  }

  public static ConsoleLogEntry fromJson(JsonInput input) {
    LogLevel level = null;
    Source source = null;
    String text = null;
    long timestamp = 0;
    String type = null;
    String method = null;
    List<RemoteValue> args = null;
    StackTrace stackTrace = null;

    input.beginObject();
    while (input.hasNext()) {
      switch (input.nextName()) {
        case "level":
          level = input.read(LogLevel.class);
          break;

        case "source":
          source = input.read(Source.class);
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

        case "method":
          method = input.read(String.class);
          break;

        case "args":
          args = input.read(new TypeToken<List<RemoteValue>>() {}.getType());
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

    return new ConsoleLogEntry(level, source, text, timestamp, type, method, args, stackTrace);
  }

  private Map<String, Object> toJson() {
    Map<String, Object> toReturn = new TreeMap<>();

    toReturn.put("type", super.getType());
    toReturn.put("source", super.getSource());
    toReturn.put("level", super.getLevel());
    toReturn.put("text", super.getText());
    toReturn.put("timestamp", super.getTimestamp());
    toReturn.put("method", method);
    toReturn.put("args", args);
    toReturn.put("stackTrace", super.getStackTrace());

    return unmodifiableMap(toReturn);
  }
}
