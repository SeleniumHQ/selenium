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

package org.openqa.selenium.bidi.script;

import java.util.Map;
import java.util.TreeMap;
import org.openqa.selenium.json.JsonInput;

public class RegExpValue extends LocalValue {

  private final String pattern;
  private String flags;

  public RegExpValue(String pattern) {
    this.pattern = pattern;
  }

  public RegExpValue(String pattern, String flags) {
    this.pattern = pattern;
    this.flags = flags;
  }

  public static RegExpValue fromJson(JsonInput input) {
    String pattern = null;
    String flags = null;

    input.beginObject();
    while (input.hasNext()) {
      switch (input.nextName()) {
        case "pattern":
          pattern = input.read(String.class);
          break;

        case "flags":
          flags = input.read(String.class);
          break;

        default:
          input.skipValue();
          break;
      }
    }

    input.endObject();

    return new RegExpValue(pattern, flags);
  }

  @Override
  public Map<String, Object> toJson() {
    Map<String, Object> toReturn = new TreeMap<>();

    toReturn.put("pattern", this.pattern);

    if (flags != null) {
      toReturn.put("flags", this.flags);
    }

    return Map.of("type", "regexp", "value", toReturn);
  }

  public String getPattern() {
    return pattern;
  }

  public String getFlags() {
    return flags;
  }
}
