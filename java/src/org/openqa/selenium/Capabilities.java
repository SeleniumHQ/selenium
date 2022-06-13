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
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Stream;

/**
 * Describes a series of key/value pairs that encapsulate aspects of a browser.
 */
public interface Capabilities extends Serializable {

  default String getBrowserName() {
    return String.valueOf(Optional.ofNullable(getCapability("browserName")).orElse(""));
  }

  default Platform getPlatformName() {
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

  default String getBrowserVersion() {
    return String.valueOf(Optional.ofNullable(getCapability("browserVersion")).orElse(
      Optional.ofNullable(getCapability("version")).orElse("")));
  }

  /**
   * @return The capabilities as a Map.
   */
  Map<String, Object> asMap();

  /**
   * @param capabilityName The capability to return.
   * @return The value, or null if not set.
   * @see org.openqa.selenium.remote.CapabilityType
   */
  Object getCapability(String capabilityName);

  /**
   * @param capabilityName The capability to check.
   * @return Whether or not the value is not null and not false.
   * @see org.openqa.selenium.remote.CapabilityType
   */
  default boolean is(String capabilityName) {
    Object cap = getCapability(capabilityName);
    if (cap == null) {
      // If it's not set explicitly, javascriptEnabled is true.
      return "javascriptEnabled".equals(capabilityName);
    }
    return cap instanceof Boolean ? (Boolean) cap : Boolean.parseBoolean(String.valueOf(cap));
  }

  /**
   * Merge two {@link Capabilities} together and return the union of the two as a new
   * {@link Capabilities} instance. Capabilities from {@code other} will override those in
   * {@code this}.
   */
  default Capabilities merge(Capabilities other) {
    return new ImmutableCapabilities(new MutableCapabilities(this).merge(other));
  }

  default Set<String> getCapabilityNames() {
    return Collections.unmodifiableSet(asMap().keySet());
  }
}
