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

package org.openqa.selenium.grid.node.config;

import com.google.common.annotations.VisibleForTesting;
import org.openqa.selenium.Capabilities;

import java.util.Comparator;
import java.util.List;
import java.util.Objects;
import java.util.ServiceLoader;
import java.util.concurrent.CopyOnWriteArrayList;
import java.util.stream.Collectors;
import java.util.stream.StreamSupport;

public class CapabilitiesMutatorService {
  Capabilities stereotype;
  private final List<CapabilityMutator> customMutators = new CopyOnWriteArrayList<>();

  private static final Comparator<CapabilityMutator> MUTATOR_COMPARATOR =
    Comparator.comparingInt(CapabilityMutator::getOrder).reversed();

  public CapabilitiesMutatorService(Capabilities stereotype) {
    this.stereotype = stereotype;

    loadAllCustomMutators();
  }

  public Capabilities getMutatedCapabilities(Capabilities desiredCapabilities) {
    Objects.requireNonNull(desiredCapabilities, "desiredCapabilities must not be null");

    // Always apply this default capability mutator before applying any other mutator
    SessionCapabilitiesMutator defaultMutator = new SessionCapabilitiesMutator(stereotype);
    Capabilities newCapability = defaultMutator.apply(desiredCapabilities);

    for (CapabilityMutator customMutator : customMutators) {
      newCapability = customMutator.apply(newCapability);
    }

    return newCapability;
  }

  private void loadAllCustomMutators() {
    ServiceLoader<CapabilityMutator> loader = ServiceLoader.load(CapabilityMutator.class);

    List<CapabilityMutator> allMutators = StreamSupport.stream(loader.spliterator(), false)
      .sorted(MUTATOR_COMPARATOR)
      .collect(Collectors.toList());

    customMutators.addAll(allMutators);
  }

  @VisibleForTesting
  void setCustomMutators(List<CapabilityMutator> mutators) {
    customMutators.clear();
    customMutators.addAll(mutators);
  }

  @VisibleForTesting
  List<CapabilityMutator> getCustomMutators() {
    return customMutators;
  }
}
