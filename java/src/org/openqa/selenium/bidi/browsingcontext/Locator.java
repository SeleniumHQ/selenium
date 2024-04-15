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

package org.openqa.selenium.bidi.browsingcontext;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

public class Locator {
  final Map<String, Object> map = new HashMap<>();

  private enum Type {
    CSS("css"),
    INNER("innerText"),
    XPATH("xpath");

    private final String value;

    Type(String value) {
      this.value = value;
    }

    @Override
    public String toString() {
      return value;
    }
  }

  private Locator(Type type, String value) {
    map.put("type", type.toString());
    map.put("value", value);
  }

  private Locator(
      Type type,
      String value,
      Optional<Boolean> ignoreCase,
      Optional<String> matchType,
      Optional<Long> maxDepth) {
    map.put("type", type.toString());
    map.put("value", value);
    ignoreCase.ifPresent(val -> map.put("ignoreCase", val));
    matchType.ifPresent(val -> map.put("matchType", val));
    maxDepth.ifPresent(val -> map.put("maxDepth", val));
  }

  public static Locator css(String value) {
    return new Locator(Type.CSS, value);
  }

  public static Locator innerText(
      String value,
      Optional<Boolean> ignoreCase,
      Optional<String> matchType,
      Optional<Long> maxDepth) {
    return new Locator(Type.INNER, value, ignoreCase, matchType, maxDepth);
  }

  public static Locator innerText(String value) {
    return new Locator(Type.INNER, value);
  }

  public static Locator xpath(String value) {
    return new Locator(Type.XPATH, value);
  }

  public Map<String, Object> toMap() {
    return map;
  }
}
