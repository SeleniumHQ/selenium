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

package org.openqa.selenium.bidi.protocolvalue;

import static java.util.Collections.unmodifiableMap;

import org.openqa.selenium.json.JsonInput;

import java.util.Map;
import java.util.Optional;
import java.util.TreeMap;

public class RegExpValue {

  private String pattern;
  private Optional<String> flags;

  public RegExpValue(String pattern) {
    this.pattern = pattern;
  }

  public RegExpValue(String pattern, Optional<String> flags) {
    this.pattern = pattern;
    this.flags = flags;
  }

  public static RegExpValue fromJson(JsonInput input) {
    String pattern = null;
    Optional<String> flags = Optional.empty();

    input.beginObject();
    while (input.hasNext()) {
      switch (input.nextName()) {
        case "pattern":
          pattern = input.read(String.class);
          break;

        case "flags":
          flags = Optional.of(input.read(String.class));
          break;

        default:
          input.skipValue();
          break;
      }
    }

    input.endObject();

    return new RegExpValue(pattern, flags);
  }

  public Map<String, Object> toJson() {
    Map<String, Object> toReturn = new TreeMap<>();

    toReturn.put("pattern", this.pattern);

    if (flags.isPresent()) {
      toReturn.put("flags", this.flags.get());
    }

    return unmodifiableMap(toReturn);
  }

  public String getPattern() {
    return pattern;
  }

  public Optional<String> getFlags() {
    return flags;
  }
}
