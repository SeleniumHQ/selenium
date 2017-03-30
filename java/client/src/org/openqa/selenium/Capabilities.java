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

import java.util.HashMap;
import java.util.Map;


/**
 * Describes a series of key/value pairs that encapsulate aspects of a browser.
 */
public interface Capabilities {

  String getBrowserName();

  Platform getPlatform();

  String getVersion();

  /**
   * @deprecated Use is(SUPPORTS_JAVASCRIPT) instead
   * @see #is(String)
   * @see org.openqa.selenium.remote.CapabilityType#SUPPORTS_JAVASCRIPT
   */
  @Deprecated
  boolean isJavascriptEnabled();

  /**
   * @return The capabilities as a Map
   */
  Map<String, ?> asMap();

  /**
   * @see org.openqa.selenium.remote.CapabilityType
   * @param capabilityName The capability to return.
   * @return The value, or null if not set.
   */
  Object getCapability(String capabilityName);

  /**
   * @see org.openqa.selenium.remote.CapabilityType
   * @param capabilityName The capability to check.
   * @return Whether or not the value is not null and not false.
   */
  boolean is(String capabilityName);

  /**
   * Merge two {@link Capabilities} together and return the union of the two as a new
   * {@link Capabilities} instance. Capabilities from {@code other} will override those in
   * {@code this}.
   */
  default Capabilities merge(Capabilities other) {
    HashMap<String, Object> map = new HashMap<>();
    map.putAll(asMap());
    map.putAll(other.asMap());
    return new ImmutableCapabilities(map);
  }
}
