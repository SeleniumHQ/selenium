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
import java.util.Map;
import java.util.TreeMap;

import static org.openqa.selenium.SharedCapabilitiesMethods.setCapability;

public class ImmutableCapabilities implements Capabilities {

  private final Map<String, Object> delegate;
  private final int hashCode;

  public ImmutableCapabilities() {
    this.delegate = Collections.emptyMap();
    this.hashCode = SharedCapabilitiesMethods.hashCode(this);
  }

  public ImmutableCapabilities(String k, Object v) {
    Require.nonNull("Capability", k);
    Require.nonNull("Value", v);

    Map<String, Object> delegate = new TreeMap<>();
    setCapability(delegate, k, v);

    this.delegate = Collections.unmodifiableMap(delegate);
    this.hashCode = SharedCapabilitiesMethods.hashCode(this);
  }

  public ImmutableCapabilities(String k1, Object v1, String k2, Object v2) {
    Require.nonNull("First capability", k1);
    Require.nonNull("First value", v1);
    Require.nonNull("Second capability", k2);
    Require.nonNull("Second value", v2);

    Map<String, Object> delegate = new TreeMap<>();

    setCapability(delegate, k1, v1);
    setCapability(delegate, k2, v2);

    this.delegate = Collections.unmodifiableMap(delegate);
    this.hashCode = SharedCapabilitiesMethods.hashCode(this);
  }

  public ImmutableCapabilities(String k1, Object v1, String k2, Object v2, String k3, Object v3) {
    Require.nonNull("First capability", k1);
    Require.nonNull("First value", v1);
    Require.nonNull("Second capability", k2);
    Require.nonNull("Second value", v2);
    Require.nonNull("Third capability", k3);
    Require.nonNull("Third value", v3);

    Map<String, Object> delegate = new TreeMap<>();

    setCapability(delegate, k1, v1);
    setCapability(delegate, k2, v2);
    setCapability(delegate, k3, v3);

    this.delegate = Collections.unmodifiableMap(delegate);
    this.hashCode = SharedCapabilitiesMethods.hashCode(this);
  }

  public ImmutableCapabilities(
      String k1, Object v1,
      String k2, Object v2,
      String k3, Object v3,
      String k4, Object v4) {
    Require.nonNull("First capability", k1);
    Require.nonNull("First value", v1);
    Require.nonNull("Second capability", k2);
    Require.nonNull("Second value", v2);
    Require.nonNull("Third capability", k3);
    Require.nonNull("Third value", v3);
    Require.nonNull("Fourth capability", k4);
    Require.nonNull("Fourth value", v4);

    Map<String, Object> delegate = new TreeMap<>();

    setCapability(delegate, k1, v1);
    setCapability(delegate, k2, v2);
    setCapability(delegate, k3, v3);
    setCapability(delegate, k4, v4);

    this.delegate = Collections.unmodifiableMap(delegate);
    this.hashCode = SharedCapabilitiesMethods.hashCode(this);
  }

  public ImmutableCapabilities(
      String k1, Object v1,
      String k2, Object v2,
      String k3, Object v3,
      String k4, Object v4,
      String k5, Object v5) {
    Require.nonNull("First capability", k1);
    Require.nonNull("First value", v1);
    Require.nonNull("Second capability", k2);
    Require.nonNull("Second value", v2);
    Require.nonNull("Third capability", k3);
    Require.nonNull("Third value", v3);
    Require.nonNull("Fourth capability", k4);
    Require.nonNull("Fourth value", v4);
    Require.nonNull("Fifth capability", k5);
    Require.nonNull("Fifth value", v5);

    Map<String, Object> delegate = new TreeMap<>();

    setCapability(delegate, k1, v1);
    setCapability(delegate, k2, v2);
    setCapability(delegate, k3, v3);
    setCapability(delegate, k4, v4);
    setCapability(delegate, k5, v5);

    this.delegate = Collections.unmodifiableMap(delegate);
    this.hashCode = SharedCapabilitiesMethods.hashCode(this);
  }

  public ImmutableCapabilities(Capabilities other) {
    Require.nonNull("Capabilities", other);

    Map<String, Object> delegate = new TreeMap<>();
    other.getCapabilityNames().forEach(name -> {
      Require.nonNull("Capability name", name);
      Object value = other.getCapability(name);
      Require.nonNull("Capability value", value);

      setCapability(delegate, name, value);
    });

    this.delegate = Collections.unmodifiableMap(delegate);
    this.hashCode = SharedCapabilitiesMethods.hashCode(this);
  }

  public ImmutableCapabilities(Map<?, ?> capabilities) {
    Require.nonNull("Capabilities", capabilities);

    Map<String, Object> delegate = new TreeMap<>();
    capabilities.forEach((key, value) -> {
      Require.argument("Capability key", key).instanceOf(String.class);
      Object v = capabilities.get(key);
      Require.nonNull("Capability value", value);

      setCapability(delegate, (String) key, v);
    });

    this.delegate = Collections.unmodifiableMap(delegate);
    this.hashCode = SharedCapabilitiesMethods.hashCode(this);
  }

  @Override
  public Object getCapability(String capabilityName) {
    Require.nonNull("Capability name", capabilityName);
    return delegate.get(capabilityName);
  }

  @Override
  public Map<String, Object> asMap() {
    return delegate;
  }

  @Override
  public int hashCode() {
    return hashCode;
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

  public static ImmutableCapabilities copyOf(Capabilities capabilities) {
    Require.nonNull("Capabilities", capabilities);

    if (capabilities instanceof ImmutableCapabilities) {
      return (ImmutableCapabilities) capabilities;
    }

    return new ImmutableCapabilities(capabilities);
  }

}
