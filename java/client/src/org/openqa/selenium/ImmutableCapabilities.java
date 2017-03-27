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
import java.util.Collections;
import java.util.HashMap;
import java.util.Map;

class ImmutableCapabilities implements Capabilities, Serializable {

  private static final long serialVersionUID = 665766108972704060L;

  private final Map<String, Object> caps = new HashMap<>();

  ImmutableCapabilities(Map<String, Object> capabilities) {
    capabilities.forEach((key, value) -> {
      if (value != null) {
        caps.put(key, value);
      }
    });
  }

  @Override
  public String getBrowserName() {
    return String.valueOf(caps.getOrDefault("browserName", ""));
  }

  @Override
  public Platform getPlatform() {
    Object rawPlatform = caps.get("platform");

    if (rawPlatform == null) {
      return null;
    }

    if (rawPlatform instanceof String) {
      return Platform.valueOf((String) rawPlatform);
    } else if (rawPlatform instanceof Platform) {
      return (Platform) rawPlatform;
    }

    throw new IllegalStateException("Platform was neither a string or a Platform: " + rawPlatform);
  }

  @Override
  public String getVersion() {
    return String.valueOf(caps.getOrDefault("version", ""));
  }

  @Override
  public boolean isJavascriptEnabled() {
    Object raw = caps.getOrDefault("javascriptEnabled", true);
    if (raw instanceof String) {
      return Boolean.parseBoolean((String) raw);
    } else if (raw instanceof Boolean) {
      return (Boolean) raw;
    }

    throw new IllegalStateException("Javascript-enabled capability was of invalid type: " + raw);
  }

  @Override
  public Object getCapability(String capabilityName) {
    return caps.get(capabilityName);
  }

  @Override
  public boolean is(String capabilityName) {
    Object cap = getCapability(capabilityName);
    if (cap == null) {
      return false;
    }
    return cap instanceof Boolean ? (Boolean) cap : Boolean.parseBoolean(String.valueOf(cap));
  }

  @Override
  public Map<String, ?> asMap() {
    return Collections.unmodifiableMap(caps);
  }
}
