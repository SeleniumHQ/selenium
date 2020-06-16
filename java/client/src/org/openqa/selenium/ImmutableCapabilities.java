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

import java.util.Map;

public class ImmutableCapabilities implements Capabilities {

  private MutableCapabilities delegate = new MutableCapabilities();

  public ImmutableCapabilities() {
  }

  public ImmutableCapabilities(String k, Object v) {
    delegate.setCapability(k, v);
  }

  public ImmutableCapabilities(String k1, Object v1, String k2, Object v2) {
    delegate.setCapability(k1, v1);
    delegate.setCapability(k2, v2);
  }

  public ImmutableCapabilities(String k1, Object v1, String k2, Object v2, String k3, Object v3) {
    delegate.setCapability(k1, v1);
    delegate.setCapability(k2, v2);
    delegate.setCapability(k3, v3);
  }

  public ImmutableCapabilities(
      String k1, Object v1,
      String k2, Object v2,
      String k3, Object v3,
      String k4, Object v4) {
    delegate.setCapability(k1, v1);
    delegate.setCapability(k2, v2);
    delegate.setCapability(k3, v3);
    delegate.setCapability(k4, v4);
  }

  public ImmutableCapabilities(
      String k1, Object v1,
      String k2, Object v2,
      String k3, Object v3,
      String k4, Object v4,
      String k5, Object v5) {
    delegate.setCapability(k1, v1);
    delegate.setCapability(k2, v2);
    delegate.setCapability(k3, v3);
    delegate.setCapability(k4, v4);
    delegate.setCapability(k5, v5);
  }

  public ImmutableCapabilities(Capabilities other) {
    this(other.asMap());
  }

  public ImmutableCapabilities(Map<?, ?> capabilities) {
    capabilities.forEach((key, value) -> {
      Require.argument("Key", key).instanceOf(String.class);
      delegate.setCapability(String.valueOf(key), value);
    });
  }

  @Override
  public Object getCapability(String capabilityName) {
    return delegate.getCapability(capabilityName);
  }

  @Override
  public Map<String, Object> asMap() {
    return delegate.asMap();
  }

  @Override
  public int hashCode() {
    return delegate.hashCode();
  }

  @Override
  public boolean equals(Object o) {
    if (this == o) {
      return true;
    }
    if (!(o instanceof Capabilities)) {
      return false;
    }
    return delegate.equals(o);
  }

  @Override
  public String toString() {
    return delegate.toString();
  }

  public static ImmutableCapabilities copyOf(Capabilities capabilities) {
    Require.nonNull("Capabilities", capabilities);

    if (capabilities instanceof ImmutableCapabilities) {
      return (ImmutableCapabilities) capabilities;
    }

    return new ImmutableCapabilities(capabilities);
  }
}