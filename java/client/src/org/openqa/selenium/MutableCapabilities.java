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

import org.openqa.selenium.internal.Require;
import org.openqa.selenium.logging.LogLevelMapping;
import org.openqa.selenium.logging.LoggingPreferences;

import java.util.Collection;
import java.util.Collections;
import java.util.Comparator;
import java.util.HashSet;
import java.util.IdentityHashMap;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.TreeMap;
import java.util.stream.Collectors;
import java.util.stream.Stream;

public class MutableCapabilities implements Capabilities {

  private static final Set<String> OPTION_KEYS;
  static {
    HashSet<String> keys = new HashSet<>();
    keys.add("chromeOptions");
    keys.add("edgeOptions");
    keys.add("goog:chromeOptions");
    keys.add("moz:firefoxOptions");
    keys.add("operaOptions");
    keys.add("se:ieOptions");
    keys.add("safari.options");
    OPTION_KEYS = Collections.unmodifiableSet(keys);
  }

  private final Map<String, Object> caps = new TreeMap<>();

  public MutableCapabilities() {
    // no-arg constructor
  }

  public MutableCapabilities(Capabilities other) {
    this(other.asMap());
  }

  public MutableCapabilities(Map<String, ?> capabilities) {
    capabilities.forEach((key, value) -> {
      if (value != null) {
        setCapability(key, value);
      }
    });
  }

  /**
   * Merge the extra capabilities provided into this DesiredCapabilities instance. If capabilities
   * with the same name exist in this instance, they will be overridden by the values from the
   * extraCapabilities object.
   *
   * @param extraCapabilities Additional capabilities to be added.
   * @return The DesiredCapabilities instance after the merge.
   */
  @Override
  public MutableCapabilities merge(Capabilities extraCapabilities) {
    if (extraCapabilities == null) {
      return this;
    }

    extraCapabilities.asMap().forEach(this::setCapability);

    return this;
  }

  public void setCapability(String capabilityName, boolean value) {
    setCapability(capabilityName, (Object) value);
  }

  public void setCapability(String capabilityName, String value) {
    setCapability(capabilityName, (Object) value);
  }

  public void setCapability(String capabilityName, Platform value) {
    setCapability(capabilityName, (Object) value);
  }

  public void setCapability(String key, Object value) {
    Require.nonNull("Capability name", key);

    // We have to special-case some keys and values because of the popular idiom of calling
    // something like "capabilities.setCapability(SafariOptions.CAPABILITY, new SafariOptions());"
    // and this is no longer needed as options are capabilities. There will be a large amount of
    // legacy code that will always try and follow this pattern, however.
    if (OPTION_KEYS.contains(key) && value instanceof Capabilities) {
      merge((Capabilities) value);
      return;
    }

    if (value == null) {
      caps.remove(key);
      return;
    }

    if ("loggingPrefs".equals(key) && value instanceof Map) {
      LoggingPreferences prefs = new LoggingPreferences();
      @SuppressWarnings("unchecked") Map<String, String> prefsMap = (Map<String, String>) value;

      prefsMap.forEach((pKey, pValue) -> prefs.enable(pKey, LogLevelMapping.toLevel(pValue)));
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
  public Map<String, Object> asMap() {
    return Collections.unmodifiableMap(caps);
  }

  @Override
  public Object getCapability(String capabilityName) {
    return caps.get(capabilityName);
  }

  @Override
  public Set<String> getCapabilityNames() {
    return Collections.unmodifiableSet(caps.keySet());
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
