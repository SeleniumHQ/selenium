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
import java.util.Map;
import java.util.Objects;

public class ImmutableCapabilities extends AbstractCapabilities implements Serializable {

  private static final long serialVersionUID = 665766108972704060L;

  public ImmutableCapabilities() {
  }

  public ImmutableCapabilities(String k, Object v) {
    setCapability(k, v);
  }

  public ImmutableCapabilities(String k1, Object v1, String k2, Object v2) {
    setCapability(k1, v1);
    setCapability(k2, v2);
  }

  public ImmutableCapabilities(String k1, Object v1, String k2, Object v2, String k3, Object v3) {
    setCapability(k1, v1);
    setCapability(k2, v2);
    setCapability(k3, v3);
  }

  public ImmutableCapabilities(
      String k1, Object v1,
      String k2, Object v2,
      String k3, Object v3,
      String k4, Object v4) {
    setCapability(k1, v1);
    setCapability(k2, v2);
    setCapability(k3, v3);
    setCapability(k4, v4);
  }

  public ImmutableCapabilities(
      String k1, Object v1,
      String k2, Object v2,
      String k3, Object v3,
      String k4, Object v4,
      String k5, Object v5) {
    setCapability(k1, v1);
    setCapability(k2, v2);
    setCapability(k3, v3);
    setCapability(k4, v4);
    setCapability(k5, v5);
  }

  public ImmutableCapabilities(Capabilities other) {
    this(other.asMap());
  }

  public ImmutableCapabilities(Map<?, ?> capabilities) {
    capabilities.forEach((key, value) -> {
      if (!(key instanceof String)) {
        throw new IllegalArgumentException("Key values must be strings");
      }
      setCapability(String.valueOf(key), value);
    });
  }

  public static ImmutableCapabilities copyOf(Capabilities capabilities) {
    Objects.requireNonNull(capabilities, "Capabilities must be set");

    if (capabilities instanceof ImmutableCapabilities) {
      return (ImmutableCapabilities) capabilities;
    }

    return new ImmutableCapabilities(capabilities);
  }
}