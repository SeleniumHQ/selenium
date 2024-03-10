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

import org.junit.jupiter.api.Test;
import org.openqa.selenium.Capabilities;
import org.openqa.selenium.ImmutableCapabilities;
import org.openqa.selenium.PersistentCapabilities;

import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.InstanceOfAssertFactories.LIST;
import static org.assertj.core.api.InstanceOfAssertFactories.MAP;

public class CapabilitiesMutatorServiceTest {

  @Test
  void applyDefaultCapabilityMutator() {
    CapabilitiesMutatorService mutatorService = new CapabilitiesMutatorService(getStereotype());
    Map<String, Object> newCapabilities = mutatorService.getMutatedCapabilities(getRequirdCapabilities()).asMap();

    assertThat(mutatorService.getCustomMutators().size()).isEqualTo(0);

    assertThat(newCapabilities.get("browserName")).isEqualTo("chrome");

    assertThat(newCapabilities)
      .extractingByKey("goog:chromeOptions")
      .asInstanceOf(MAP)
      .extractingByKey("args")
      .asInstanceOf(LIST)
      .contains("incognito", "window-size=500,500");
  }

  @Test
  void applyCustomCapabilityMutator() {
    CapabilitiesMutatorService mutatorService = new CapabilitiesMutatorService(getStereotype());
    mutatorService.setCustomMutators(List.of(getTestMutatorA()));

    Capabilities newCapabilities = mutatorService.getMutatedCapabilities(getRequirdCapabilities());

    assertThat(mutatorService.getCustomMutators().size()).isEqualTo(1);

    assertThat(newCapabilities.getCapability("browserName")).isEqualTo("chrome");
    assertThat(newCapabilities.getCapability("key")).isEqualTo("foo");
  }

  @Test
  void applyCustomCapabilityMutator_with_order() {
    CapabilitiesMutatorService mutatorService = new CapabilitiesMutatorService(getStereotype());
    mutatorService.setCustomMutators(List.of(getTestHighOrderMutator(), getTestMutatorA()));

    Capabilities newCapabilities = mutatorService.getMutatedCapabilities(getRequirdCapabilities());

    assertThat(mutatorService.getCustomMutators().size()).isEqualTo(2);

    assertThat(newCapabilities.getCapability("browserName")).isEqualTo("chrome");
    assertThat(newCapabilities.getCapability("key")).isEqualTo("foo");
    assertThat(newCapabilities.getCapability("someKey")).isEqualTo("someValue");
  }

  private Capabilities getStereotype() {
    return new ImmutableCapabilities("browserName", "chrome");
  }

  private Capabilities getRequirdCapabilities() {
    Map<String, Object> chromeOptions = new HashMap<>();
    chromeOptions.put("args", Arrays.asList("incognito", "window-size=500,500"));

    return new ImmutableCapabilities(
      "browserName", "chrome",
      "goog:chromeOptions", chromeOptions);
  }

  private CapabilityMutator getTestMutatorA() {
    return capabilities -> new PersistentCapabilities(capabilities).setCapability("key", "foo");
  }

  private CapabilityMutator getTestHighOrderMutator() {
    return new CapabilityMutator() {
      @Override
      public Capabilities apply(Capabilities capabilities) {
        return new PersistentCapabilities(capabilities)
          .setCapability("key", "bar")
          .setCapability("someKey", "someValue");
      }

      @Override
      public int getOrder() {
        return 10;
      }
    };
  }
}
