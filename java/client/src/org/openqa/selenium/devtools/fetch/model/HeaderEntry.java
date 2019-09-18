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
package org.openqa.selenium.devtools.fetch.model;

import org.openqa.selenium.json.JsonInput;

import java.util.Objects;

/**
 * Response HTTP header entry
 */
public class HeaderEntry {

  private final String name;

  private final String value;

  public HeaderEntry(String name, String value) {
    this.name = Objects.requireNonNull(name, "name is required");
    this.value = Objects.requireNonNull(value, "value is required");
  }

  private static HeaderEntry fromJson(JsonInput input) {
    String name = input.nextString(), value = null;
    while (input.hasNext()) {
      switch (input.nextName()) {
        case "value":
          value = input.nextString();
          break;
        default:
          input.skipValue();
          break;
      }
    }
    return new HeaderEntry(name, value);
  }

  public String getName() {
    return name;
  }

  public String getValue() {
    return value;
  }
}
