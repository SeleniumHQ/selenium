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


import java.io.Serializable;
import java.lang.reflect.Array;
import java.util.Collection;
import java.util.Collections;
import java.util.HashMap;
import java.util.IdentityHashMap;
import java.util.Map;

public class ImmutableCapabilities implements Capabilities, Serializable {

  private static final long serialVersionUID = 665766108972704060L;

  private final Map<String, Object> caps = new HashMap<>();

  public ImmutableCapabilities(Capabilities other) {
    this(other.asMap());
  }

  public ImmutableCapabilities(Map<String, ?> capabilities) {
    capabilities.forEach((key, value) -> {
      if (value != null) {
        caps.put(key, value);
      }
    });

    // Normalise the "platform" value for both OSS and W3C.
    Object value = caps.getOrDefault("platform", caps.get("platformName"));
    if (value != null) {
      Object platform;
      if (value instanceof Platform) {
        platform = (Platform) value;
      } else if (value instanceof String) {
        try {
          platform = Platform.fromString((String) value);
        } catch (WebDriverException ignored) {
          // Just use the string we were given.
          platform = value;
        }
      } else {
        throw new IllegalStateException("Platform was neither a string or a Platform: " + value);
      }

      caps.put("platform", platform);
      caps.put("platformName", platform);
    }
  }

  @Override
  public Object getCapability(String capabilityName) {
    return caps.get(capabilityName);
  }

  @Override
  public Map<String, ?> asMap() {
    return Collections.unmodifiableMap(caps);
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

    return caps.equals(that.asMap());
  }

  @Override
  public int hashCode() {
    return caps.hashCode();
  }

  @Override
  public String toString() {
    Map<Object, String> seen = new IdentityHashMap<>();
    StringBuilder builder = new StringBuilder("Capabilities ");
    abbreviate(seen, builder, caps);
    return builder.toString();
  }

  private void abbreviate(
      Map<Object, String> seen,
      StringBuilder builder,
      Object stringify) {

    if (stringify == null) {
      builder.append("null");
      return;
    }

    StringBuilder value = new StringBuilder();

    if (stringify.getClass().isArray()) {
      Array ary = (Array) stringify;
      value.append("[");
      int length = Array.getLength(ary);
      for (int i = 0; i < length; i++) {
        abbreviate(seen, value, Array.get(ary, i));
        if (i < length - 1) {
          value.append(", ");
        }
      }
      value.append("]");
    } else if (stringify instanceof Collection) {
      Collection<?> c = (Collection<?>) stringify;
      value.append("[");
      int length = c.size();
      int i = 0;

      for (Object o : c) {
        abbreviate(seen, value, o);
        if (i < length - 1) {
          value.append(", ");
        }
        i++;
      }
      value.append("]");
    } else if (stringify instanceof Map) {
      value.append("{");

      Map<?, ?> m = (Map<?, ?>) stringify;
      int length = m.size();
      int i = 0;
      for (Map.Entry entry : m.entrySet()) {
        abbreviate(seen, value, entry.getKey());
        value.append("=");
        abbreviate(seen, value, entry.getValue());
        if (i < length - 1) {
          value.append(", ");
        }
      }
      value.append("}");
    } else {
      String s = String.valueOf(stringify);
      if (s.length() > 30) {
        value.append(s.substring(0, 27)).append("...");
      } else {
        value.append(s);
      }
    }

    seen.put(stringify, value.toString());
    builder.append(value.toString());
  }
}
