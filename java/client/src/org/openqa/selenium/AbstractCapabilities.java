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

import org.openqa.selenium.logging.LogLevelMapping;
import org.openqa.selenium.logging.LoggingPreferences;

import java.util.Collection;
import java.util.Collections;
import java.util.Comparator;
import java.util.IdentityHashMap;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.TreeMap;
import java.util.stream.Collectors;
import java.util.stream.Stream;

abstract class AbstractCapabilities implements Capabilities {

  private final Map<String, Object> caps = new TreeMap<>();

  @Override
  public Platform getPlatform() {
    return Stream.of("platform", "platformName")
        .map(this::getCapability)
        .filter(Objects::nonNull)
        .map(cap -> {
          if (cap instanceof Platform) {
            return (Platform) cap;
          }

          try {
            return Platform.fromString((String.valueOf(cap)));
          } catch (WebDriverException e) {
            return null;
          }
        })
        .filter(Objects::nonNull)
        .findFirst()
        .orElse(null);
  }

  @Override
  public Object getCapability(String capabilityName) {
    return caps.get(capabilityName);
  }

  protected void setCapability(String key, Object value) {
    Objects.requireNonNull(key, "Cannot set a capability without a name");

    if (value == null) {
      caps.remove(key);
      return;
    }

    if ("loggingPrefs".equals(key) && value instanceof Map) {
      LoggingPreferences prefs = new LoggingPreferences();
      @SuppressWarnings("unchecked") Map<String, String> prefsMap = (Map<String, String>) value;

      for (String logType : prefsMap.keySet()) {
        prefs.enable(logType, LogLevelMapping.toLevel(prefsMap.get(logType)));
      }
      caps.put(key, prefs);
      return;
    }

    if ("platform".equals(key) && value instanceof String) {
      try {
        caps.put(key, Platform.fromString((String) value));
      } catch (WebDriverException e) {
        caps.put(key, value);
      }
      return;
    }

    if ("unexpectedAlertBehaviour".equals(key)) {
      caps.put("unexpectedAlertBehaviour", value);
      caps.put("unhandledPromptBehavior", value);
      return;
    }

    caps.put(key, value);
  }

  @Override
  public Set<String> getCapabilityNames() {
    return Collections.unmodifiableSet(caps.keySet());
  }

  @Override
  public Map<String, Object> asMap() {
    return Collections.unmodifiableMap(caps);
  }

  public Map<String, Object> toJson() {
    return asMap();
  }

  /**
   * Subclasses can use this to add information that isn't always in the capabilities map.
   */
  protected int amendHashCode() {
    return 0;
  }

  @Override
  public int hashCode() {
    return Objects.hash(amendHashCode(), caps);
  }

  @Override
  public boolean equals(Object o) {
    if (this == o) {
      return true;
    }
    if (!(o instanceof Capabilities)) {
      return false;
    }

    Capabilities that = (Capabilities) o;

    return asMap().equals(that.asMap());
  }

  @Override
  public String toString() {
    Map<Object, String> seen = new IdentityHashMap<>();
    return "Capabilities " + abbreviate(seen, caps);
  }

  private String abbreviate(Map<Object, String> seen, Object stringify) {
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
          ((Collection<?>) stringify).stream()
              .map(item -> abbreviate(seen, item))
              .collect(Collectors.joining(", ")));
      value.append("]");
    } else if (stringify instanceof Map) {
      value.append("{");
      value.append(
          ((Map<?, ?>) stringify).entrySet().stream()
              .sorted(Comparator.comparing(entry -> String.valueOf(entry.getKey())))
              .map(entry -> String.valueOf(entry.getKey()) + ": " + abbreviate(seen, entry.getValue()))
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
