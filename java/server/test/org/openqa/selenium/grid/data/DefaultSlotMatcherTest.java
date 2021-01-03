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

package org.openqa.selenium.grid.data;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.Test;
import org.openqa.selenium.ImmutableCapabilities;
import org.openqa.selenium.Platform;
import org.openqa.selenium.remote.CapabilityType;

public class DefaultSlotMatcherTest {

  private final DefaultSlotMatcher slotMatcher = new DefaultSlotMatcher();

  @Test
  public void fullMatch() {
    ImmutableCapabilities stereotype = new ImmutableCapabilities(
      CapabilityType.BROWSER_NAME, "chrome",
      CapabilityType.BROWSER_VERSION, "80",
      CapabilityType.PLATFORM_NAME, Platform.WINDOWS
    );
    ImmutableCapabilities capabilities = new ImmutableCapabilities(
      CapabilityType.BROWSER_NAME, "chrome",
      CapabilityType.BROWSER_VERSION, "80",
      CapabilityType.PLATFORM_NAME, Platform.WINDOWS
    );
    assertThat(slotMatcher.matches(capabilities, stereotype)).isTrue();
  }

  @Test
  public void matchesBrowserAndVersion() {
    ImmutableCapabilities stereotype = new ImmutableCapabilities(
      CapabilityType.BROWSER_NAME, "chrome",
      CapabilityType.BROWSER_VERSION, "80",
      CapabilityType.PLATFORM_NAME, Platform.WINDOWS
    );
    ImmutableCapabilities capabilities = new ImmutableCapabilities(
      CapabilityType.BROWSER_NAME, "chrome",
      CapabilityType.BROWSER_VERSION, "80"
    );
    assertThat(slotMatcher.matches(capabilities, stereotype)).isTrue();
  }

  @Test
  public void matchesBrowser() {
    ImmutableCapabilities stereotype = new ImmutableCapabilities(
      CapabilityType.BROWSER_NAME, "chrome",
      CapabilityType.BROWSER_VERSION, "80",
      CapabilityType.PLATFORM_NAME, Platform.WINDOWS
    );
    ImmutableCapabilities capabilities = new ImmutableCapabilities(
      CapabilityType.BROWSER_NAME, "chrome"
    );
    assertThat(slotMatcher.matches(capabilities, stereotype)).isTrue();
  }

  @Test
  public void platformDoesNotMatch() {
    ImmutableCapabilities stereotype = new ImmutableCapabilities(
      CapabilityType.BROWSER_NAME, "chrome",
      CapabilityType.BROWSER_VERSION, "80",
      CapabilityType.PLATFORM_NAME, Platform.WINDOWS
    );
    ImmutableCapabilities capabilities = new ImmutableCapabilities(
      CapabilityType.BROWSER_NAME, "chrome",
      CapabilityType.BROWSER_VERSION, "80",
      CapabilityType.PLATFORM_NAME, Platform.MAC
    );
    assertThat(slotMatcher.matches(capabilities, stereotype)).isFalse();
  }

  @Test
  public void browserDoesNotMatch() {
    ImmutableCapabilities stereotype = new ImmutableCapabilities(
      CapabilityType.BROWSER_NAME, "chrome",
      CapabilityType.BROWSER_VERSION, "80",
      CapabilityType.PLATFORM_NAME, Platform.WINDOWS
    );
    ImmutableCapabilities capabilities = new ImmutableCapabilities(
      CapabilityType.BROWSER_NAME, "firefox",
      CapabilityType.BROWSER_VERSION, "80",
      CapabilityType.PLATFORM_NAME, Platform.WINDOWS
    );
    assertThat(slotMatcher.matches(capabilities, stereotype)).isFalse();
  }

  @Test
  public void browserVersionDoesNotMatch() {
    ImmutableCapabilities stereotype = new ImmutableCapabilities(
      CapabilityType.BROWSER_NAME, "chrome",
      CapabilityType.BROWSER_VERSION, "80",
      CapabilityType.PLATFORM_NAME, Platform.WINDOWS
    );
    ImmutableCapabilities capabilities = new ImmutableCapabilities(
      CapabilityType.BROWSER_NAME, "chrome",
      CapabilityType.BROWSER_VERSION, "84",
      CapabilityType.PLATFORM_NAME, Platform.WINDOWS
    );
    assertThat(slotMatcher.matches(capabilities, stereotype)).isFalse();
  }

  @Test
  public void requestedPlatformDoesNotMatch() {
    ImmutableCapabilities stereotype = new ImmutableCapabilities(
      CapabilityType.BROWSER_NAME, "chrome",
      CapabilityType.BROWSER_VERSION, "80"
    );

    ImmutableCapabilities capabilities = new ImmutableCapabilities(
      CapabilityType.BROWSER_NAME, "chrome",
      CapabilityType.BROWSER_VERSION, "84",
      CapabilityType.PLATFORM_NAME, Platform.WINDOWS
    );
    assertThat(slotMatcher.matches(capabilities, stereotype)).isFalse();
  }

  @Test
  public void requestedBrowserVersionDoesNotMatch() {
    ImmutableCapabilities stereotype = new ImmutableCapabilities(
      CapabilityType.BROWSER_NAME, "chrome",
      CapabilityType.PLATFORM_NAME, Platform.WINDOWS
    );

    ImmutableCapabilities capabilities = new ImmutableCapabilities(
      CapabilityType.BROWSER_NAME, "chrome",
      CapabilityType.BROWSER_VERSION, "84",
      CapabilityType.PLATFORM_NAME, Platform.WINDOWS
    );
    assertThat(slotMatcher.matches(capabilities, stereotype)).isFalse();
  }

  @Test
  public void matchesWithJWPCaps() {
    ImmutableCapabilities stereotype = new ImmutableCapabilities(
      CapabilityType.BROWSER_NAME, "chrome",
      CapabilityType.BROWSER_VERSION, "80",
      CapabilityType.PLATFORM_NAME, Platform.WINDOWS
    );
    ImmutableCapabilities capabilities = new ImmutableCapabilities(
      CapabilityType.BROWSER_NAME, "chrome",
      CapabilityType.VERSION, "80",
      CapabilityType.PLATFORM, Platform.WINDOWS
    );
    assertThat(slotMatcher.matches(capabilities, stereotype)).isTrue();
  }
}
