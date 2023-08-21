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

package org.openqa.selenium;

import java.util.Arrays;
import java.util.Collection;
import java.util.Comparator;
import java.util.IdentityHashMap;
import java.util.Map;
import java.util.stream.Collectors;
import java.util.stream.Stream;
import org.openqa.selenium.logging.LogLevelMapping;
import org.openqa.selenium.logging.LoggingPreferences;

class SharedCapabilitiesMethods {

  private static final String[] EMPTY_ARRAY = new String[0];

  private SharedCapabilitiesMethods() {
    // Utility class
  }

  static int hashCode(Capabilities caps) {
    String[] sortedNames = caps.getCapabilityNames().toArray(EMPTY_ARRAY);
    Arrays.sort(sortedNames, String::compareTo);
    // we only use the names to generate a hash code, this might result in hash collisions. thanks
    // to the
    // moz:firefoxOptions, goog:chromeOptions and ms:edgeOptions, these hash collisions should not
    // happen too often.
    return Arrays.hashCode(sortedNames);
  }

  static boolean equals(Capabilities left, Capabilities right) {
    if (left == right) {
      return true;
    }
    // deeply compare the keys & values, usually only called when the hash codes of two objects are
    // identical.
    // note: there should be no arrays (directly or nested) inside the map, otherwise the equals
    // will not work.
    return left.asMap().equals(right.asMap());
  }

  static void setCapability(Map<String, Object> caps, String key, Object value) {
    if ("loggingPrefs".equals(key) && value instanceof Map) {
      LoggingPreferences prefs = new LoggingPreferences();
      @SuppressWarnings("unchecked")
      Map<String, String> prefsMap = (Map<String, String>) value;

      prefsMap.forEach((pKey, pValue) -> prefs.enable(pKey, LogLevelMapping.toLevel(pValue)));
      caps.put(key, prefs);
      return;
    }

    if ("platformName".equals(key) && value instanceof String) {
      try {
        caps.put(key, Platform.fromString((String) value));
      } catch (WebDriverException e) {
        caps.put(key, value);
      }
      return;
    }

    caps.put(key, value);
  }

  static String toString(Capabilities caps) {
    Map<Object, String> seen = new IdentityHashMap<>();
    return "Capabilities " + abbreviate(seen, caps.asMap());
  }

  private static String abbreviate(Map<Object, String> seen, Object stringify) {
    if (stringify == null) {
      return "null";
    }

    StringBuilder value = new StringBuilder();

    if (stringify.getClass().isArray()) {
      value.append("[");
      value.append(
          Stream.of((Object[]) stringify)
              .map(item -> abbreviate(seen, item))
              .collect(Collectors.joining(", ")));
      value.append("]");
    } else if (stringify instanceof Collection) {
      value.append("[");
      value.append(
          ((Collection<?>) stringify)
              .stream().map(item -> abbreviate(seen, item)).collect(Collectors.joining(", ")));
      value.append("]");
    } else if (stringify instanceof Map) {
      value.append("{");
      value.append(
          ((Map<?, ?>) stringify)
              .entrySet().stream()
                  .sorted(Comparator.comparing(entry -> String.valueOf(entry.getKey())))
                  .map(
                      entry ->
                          String.format(
                              "%s: %s", entry.getKey(), abbreviate(seen, entry.getValue())))
                  .collect(Collectors.joining(", ")));
      value.append("}");
    } else {
      String s = String.valueOf(stringify);
      if (s.length() > 30) {
        value.append(s, 0, 27).append("...");
      } else {
        value.append(s);
      }
    }

    seen.put(stringify, value.toString());
    return value.toString();
  }
}
