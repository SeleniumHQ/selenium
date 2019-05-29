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

import static org.openqa.selenium.devtools.ConverterFunctions.map;

import com.google.common.collect.ImmutableMap;

import org.openqa.selenium.json.JsonInput;

import java.util.Objects;
import java.util.StringJoiner;

public class Console {

  private final static String DOMAIN_NAME = "Console";

  public static Command<Void> enable() {
    return new Command<>(DOMAIN_NAME + ".enable", ImmutableMap.of());
  }

  public static Command<Void> disable() {
    return new Command<>(DOMAIN_NAME + ".disable", ImmutableMap.of());
  }

  public static Event<ConsoleMessage> messageAdded() {
    return new Event<>(
        DOMAIN_NAME + ".messageAdded",
        map("message", ConsoleMessage.class));
  }

  public static class ConsoleMessage {

    private final String source;
    private final String level;
    private final String text;

    ConsoleMessage(String source, String level, String text) {
      this.source = Objects.requireNonNull(source);
      this.level = Objects.requireNonNull(level);
      this.text = Objects.requireNonNull(text);
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

    private static ConsoleMessage fromJson(JsonInput input) {
      String source = null;
      String level = null;
      String text = null;

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

          default:
            input.skipValue();
            break;
        }
      }
      input.endObject();

      return new ConsoleMessage(source, level, text);
    }

    @Override
    public String toString() {
      return new StringJoiner(", ", ConsoleMessage.class.getSimpleName() + "[", "]")
          .add("level='" + level + "'")
          .add("source='" + source + "'")
          .add("text='" + text + "'")
          .toString();
    }
  }
}
