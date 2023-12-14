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

import java.util.Collections;
import java.util.Map;
import java.util.Set;
import java.util.function.Function;
import java.util.stream.Collector;
import java.util.stream.Collectors;
import java.util.stream.Stream;
import org.openqa.selenium.internal.Require;

public class PersistentCapabilities implements Capabilities {

  private final ImmutableCapabilities caps;
  private final ImmutableCapabilities overrides;
  private final int hashCode;

  public PersistentCapabilities() {
    this(new ImmutableCapabilities());
  }

  public PersistentCapabilities(Capabilities source) {
    this(source, new ImmutableCapabilities());
  }

  private PersistentCapabilities(Capabilities previousValues, Capabilities newValues) {
    Require.nonNull("Source capabilities", previousValues, "may be empty, but must be set.");
    Require.nonNull("Additional capabilities", newValues, "may be empty, but must be set.");
    this.caps = ImmutableCapabilities.copyOf(previousValues);
    this.overrides = ImmutableCapabilities.copyOf(newValues);
    this.hashCode = SharedCapabilitiesMethods.hashCode(this);
  }

  public PersistentCapabilities setCapability(String name, Object value) {
    Require.nonNull("Name", name);
    Require.nonNull("Value", value);

    return new PersistentCapabilities(this, new ImmutableCapabilities(name, value));
  }

  @Override
  public Map<String, Object> asMap() {
    return getCapabilityNames().stream()
        .collect(toUnmodifiableMap(Function.identity(), this::getCapability));
  }

  @Override
  public Object getCapability(String capabilityName) {
    Require.nonNull("Capability name", capabilityName);
    Object capability = overrides.getCapability(capabilityName);
    if (capability != null) {
      return capability;
    }
    return caps.getCapability(capabilityName);
  }

  @Override
  public Capabilities merge(Capabilities other) {
    Require.nonNull("Other capabilities", other, "may be empty, but must be set.");
    return new PersistentCapabilities(this, other);
  }

  @Override
  public Set<String> getCapabilityNames() {
    return Stream.concat(
            caps.getCapabilityNames().stream(), overrides.getCapabilityNames().stream())
        .collect(toUnmodifiableSet());
  }

  // Needed, since we're dependent on Java 8 as a minimum version
  private <T, K, U> Collector<T, ?, Map<K, U>> toUnmodifiableMap(
      Function<? super T, ? extends K> keyMapper, Function<? super T, ? extends U> valueMapper) {
    return Collectors.collectingAndThen(
        Collectors.toMap(keyMapper, valueMapper), Collections::unmodifiableMap);
  }

  // Needed, since we're dependent on Java 8 as a minimum version
  private <T> Collector<T, ?, Set<T>> toUnmodifiableSet() {
    return Collectors.collectingAndThen(Collectors.toSet(), Collections::unmodifiableSet);
  }

  @Override
  public String toString() {
    return SharedCapabilitiesMethods.toString(this);
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
}
