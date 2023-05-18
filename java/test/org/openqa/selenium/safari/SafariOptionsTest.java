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

package org.openqa.selenium.safari;

import static java.util.stream.Collectors.toSet;
import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatExceptionOfType;
import static org.openqa.selenium.remote.Browser.SAFARI;
import static org.openqa.selenium.remote.Browser.SAFARI_TECH_PREVIEW;

import java.util.Map;
import java.util.Set;
import java.util.function.Predicate;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.openqa.selenium.AcceptedW3CCapabilityKeys;
import org.openqa.selenium.ImmutableCapabilities;
import org.openqa.selenium.remote.CapabilityType;

@Tag("UnitTests")
class SafariOptionsTest {

  @Test
  void roundTrippingToCapabilitiesAndBackWorks() {
    SafariOptions expected = new SafariOptions().setUseTechnologyPreview(true);

    // Convert to a Map so we can create a standalone capabilities instance, which we then use to
    // create a new set of options. This is the round trip, ladies and gentlemen.
    SafariOptions seen = new SafariOptions(new ImmutableCapabilities(expected.asMap()));

    assertThat(seen).isEqualTo(expected);
  }

  @Test
  void canConstructFromCapabilities() {
    SafariOptions options = new SafariOptions();
    assertThat(options.getUseTechnologyPreview()).isFalse();

    options =
        new SafariOptions(
            new ImmutableCapabilities(
                CapabilityType.BROWSER_NAME, SAFARI_TECH_PREVIEW.browserName()));
    assertThat(options.getUseTechnologyPreview()).isTrue();

    options =
        new SafariOptions(
            new ImmutableCapabilities(CapabilityType.BROWSER_NAME, SAFARI.browserName()));
    assertThat(options.getUseTechnologyPreview()).isFalse();
  }

  @Test
  void canSetAutomaticInspection() {
    SafariOptions options = new SafariOptions().setAutomaticInspection(true);
    assertThat(options.getAutomaticInspection()).isTrue();
  }

  @Test
  void canSetAutomaticProfiling() {
    SafariOptions options = new SafariOptions().setAutomaticProfiling(true);
    assertThat(options.getAutomaticProfiling()).isTrue();
  }

  @Test
  void settingTechnologyPreviewModeAlsoChangesBrowserName() {
    SafariOptions options = new SafariOptions();
    assertThat(options.getBrowserName()).isEqualTo(SAFARI.browserName());

    options.setUseTechnologyPreview(true);
    assertThat(options.getBrowserName()).isEqualTo(SAFARI_TECH_PREVIEW.browserName());

    options.setUseTechnologyPreview(false);
    assertThat(options.getBrowserName()).isEqualTo(SAFARI.browserName());
  }

  @Test
  void optionsAsMapShouldBeImmutable() {
    Map<String, Object> options = new SafariOptions().asMap();
    assertThatExceptionOfType(UnsupportedOperationException.class)
        .isThrownBy(() -> options.put("browserType", "chrome"));
  }

  @Test
  void isW3CSafe() {
    Map<String, Object> converted =
        new SafariOptions()
            .setUseTechnologyPreview(true)
            .setAutomaticInspection(true)
            .setAutomaticProfiling(true)
            .asMap();

    Predicate<String> badKeys = new AcceptedW3CCapabilityKeys().negate();
    Set<String> seen = converted.keySet().stream().filter(badKeys).collect(toSet());

    assertThat(seen).isEmpty();
  }
}
