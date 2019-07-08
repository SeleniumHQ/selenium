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

package org.openqa.selenium.devtools.storage.model;

import static java.util.Objects.requireNonNull;

import org.openqa.selenium.json.JsonInput;

/**
 * Storage Item
 */
public class Item {

  private String key;
  private String value;

  private Item(String key, String value) {
    this.key = requireNonNull(key, "'key' is mandatory for Item");
    this.value = requireNonNull(value, "'value' is mandatory for Item");
  }

  public String getKey() {
    return key;
  }

  public String getValue() {
    return value;
  }

  private static Item fromJson(JsonInput input) {
    String value = null;
    input.beginArray();
    String key = input.nextString();
    if (input.hasNext()) {
      value = input.nextString();
    }
    input.endArray();
    return new Item(key, value);
  }
}
