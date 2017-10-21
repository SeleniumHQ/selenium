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
import java.util.Collection;
import java.util.Collections;
import java.util.HashMap;
import java.util.IdentityHashMap;
import java.util.Map;
import java.util.TreeMap;
import java.util.stream.Collectors;
import java.util.stream.Stream;

public class ImmutableCapabilities extends AbstractCapabilities implements Serializable {

  private static final long serialVersionUID = 665766108972704060L;

  public ImmutableCapabilities() {
  }

  public ImmutableCapabilities(String k, Object v) {
    caps.put(k, v);
  }

  public ImmutableCapabilities(String k1, Object v1, String k2, Object v2) {
    caps.put(k1, v1);
    caps.put(k2, v2);
  }

  public ImmutableCapabilities(String k1, Object v1, String k2, Object v2, String k3, Object v3) {
    caps.put(k1, v1);
    caps.put(k2, v2);
    caps.put(k3, v3);
  }

  public ImmutableCapabilities(
      String k1, Object v1,
      String k2, Object v2,
      String k3, Object v3,
      String k4, Object v4) {
    caps.put(k1, v1);
    caps.put(k2, v2);
    caps.put(k3, v3);
    caps.put(k4, v4);
  }

  public ImmutableCapabilities(
      String k1, Object v1,
      String k2, Object v2,
      String k3, Object v3,
      String k4, Object v4,
      String k5, Object v5) {
    caps.put(k1, v1);
    caps.put(k2, v2);
    caps.put(k3, v3);
    caps.put(k4, v4);
    caps.put(k5, v5);
  }

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

}