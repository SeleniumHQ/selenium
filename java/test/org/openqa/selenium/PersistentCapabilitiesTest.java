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

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.Tag;

import static org.assertj.core.api.Assertions.assertThat;

@Tag("UnitTests")
public class PersistentCapabilitiesTest {

  @Test
  public void shouldAllowAnEmptySetOfCapabilities() {
    Capabilities seen = new PersistentCapabilities();

    assertThat(seen).isEqualTo(new ImmutableCapabilities());
  }

  @Test
  public void modifyingTheCapabilitiesThisPersistentCapabilitiesIsBasedOnDoesNotChangeOurView() {
    MutableCapabilities mutableCaps = new MutableCapabilities();
    Capabilities caps = new PersistentCapabilities(mutableCaps);

    mutableCaps.setCapability("cheese", "parmesan");

    assertThat(caps).isEqualTo(new ImmutableCapabilities());
  }

  @Test
  public void shouldBePossibleToOverrideAValue() {
    Capabilities original = new ImmutableCapabilities("vegetable", "peas");
    Capabilities seen = new PersistentCapabilities(original).setCapability("vegetable", "carrots");

    assertThat(seen).isEqualTo(new ImmutableCapabilities("vegetable", "carrots"));
  }

  @Test
  public void shouldActuallyBePersistent() {
    PersistentCapabilities original = new PersistentCapabilities(new ImmutableCapabilities("cheese", "cheddar"));
    Capabilities seen = original.setCapability("cheese", "orgu peynir");

    assertThat(original).isEqualTo(new ImmutableCapabilities("cheese", "cheddar"));
    assertThat(seen).isEqualTo(new ImmutableCapabilities("cheese", "orgu peynir"));
  }

  @Test
  public void shouldAllowChainedCallsToSetCapabilities() {
    PersistentCapabilities caps = new PersistentCapabilities(new ImmutableCapabilities())
      .setCapability("one", 1)
      .setCapability("two", 2);

    assertThat(caps).isEqualTo(new ImmutableCapabilities("one", 1, "two", 2));

  }
}
