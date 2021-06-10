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

import java.util.Collections;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;
import java.util.TreeMap;

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
   * Merge two {@link Capabilities} together and return the union of the two as a new
   * {@link Capabilities} instance. Capabilities from {@code other} will override those in
   * {@code this}.
   */
  @Override
  public MutableCapabilities merge(Capabilities other) {
    MutableCapabilities newInstance = new MutableCapabilities(this);
    if (other != null) {
      other.asMap().forEach(newInstance::setCapability);
    }
    return newInstance;
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
      ((Capabilities) value).asMap().forEach(this::setCapability);
      return;
    }

    if (value == null) {
      caps.remove(key);
      return;
    }

    SharedCapabilitiesMethods.setCapability(caps, key, value);
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

  @Override
  public int hashCode() {
    return SharedCapabilitiesMethods.hashCode(this);
  }

  @Override
  public boolean equals(Object o) {
    if (!(o instanceof Capabilities)) {
      return false;
    }
    return SharedCapabilitiesMethods.equals(this, (Capabilities) o);
  }

  @Override
  public String toString() {
    return SharedCapabilitiesMethods.toString(this);
  }
}
