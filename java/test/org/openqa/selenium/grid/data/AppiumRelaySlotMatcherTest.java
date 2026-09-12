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

import java.util.Map;
import org.junit.jupiter.api.Test;
import org.openqa.selenium.Capabilities;
import org.openqa.selenium.ImmutableCapabilities;
import org.openqa.selenium.Platform;
import org.openqa.selenium.remote.CapabilityType;

class AppiumRelaySlotMatcherTest {

  private final AppiumRelaySlotMatcher slotMatcher = new AppiumRelaySlotMatcher();

  @Test
  void plainBrowserStereotypeStillRequiresExplicitParity() {
    /*
    Ordinary, non-relay matching is unaffected: ambient leniency only kicks in for
    stereotypes that show Appium-awareness or requests carrying app-relay capabilities.
     */
    Capabilities stereotype =
        new ImmutableCapabilities(
            CapabilityType.BROWSER_NAME, "chrome", CapabilityType.PLATFORM_NAME, Platform.LINUX);
    Capabilities matchingCapabilities =
        new ImmutableCapabilities(
            CapabilityType.BROWSER_NAME, "chrome", CapabilityType.PLATFORM_NAME, Platform.LINUX);
    Capabilities mismatchedCapabilities =
        new ImmutableCapabilities(
            CapabilityType.BROWSER_NAME, "firefox", CapabilityType.PLATFORM_NAME, Platform.LINUX);

    assertThat(slotMatcher.matches(stereotype, matchingCapabilities)).isTrue();
    assertThat(slotMatcher.matches(stereotype, mismatchedCapabilities)).isFalse();
  }

  @Test
  void automationNameDoesNotMatchWhenStereotypeIsNotAppiumAware() {
    /*
    Regression test for https://github.com/SeleniumHQ/selenium/issues/17845: a plain browser
    stereotype with no Appium signal at all must still reject an automationName-differentiated
    request, same as DefaultSlotMatcher.
     */
    Capabilities stereotype =
        new ImmutableCapabilities(
            CapabilityType.BROWSER_NAME,
            "MicrosoftEdge",
            CapabilityType.PLATFORM_NAME,
            Platform.WIN10);

    Capabilities capabilities =
        new ImmutableCapabilities(
            "appium:automationName", "Windows", CapabilityType.PLATFORM_NAME, Platform.WINDOWS);

    assertThat(slotMatcher.matches(stereotype, capabilities)).isFalse();
  }

  @Test
  void automationNameMatchesForAppiumAwareStereotypeMissingAutomationName() {
    /*
    An Appium-aware stereotype (declaring appium:platformVersion) may match a request carrying
    automationName even though it doesn't declare that capability itself -- this is the
    behavior relay-node operators opt into by choosing this matcher.
     */
    Capabilities stereotype =
        new ImmutableCapabilities(
            CapabilityType.PLATFORM_NAME, Platform.ANDROID, "appium:platformVersion", "14");

    Capabilities capabilities =
        new ImmutableCapabilities(
            CapabilityType.PLATFORM_NAME,
            Platform.ANDROID,
            "appium:platformVersion",
            "14",
            "appium:automationName",
            "uiautomator2");

    assertThat(slotMatcher.matches(stereotype, capabilities)).isTrue();
  }

  @Test
  void automationNameMatchesWhenNestedInsideOptionsMapForAppiumAwareStereotype() {
    /*
    An Appium-aware stereotype may still match a request nesting automationName inside an
    options map (e.g. appium:options), consistent with top-level automationName handling.
     */
    Capabilities stereotype =
        new ImmutableCapabilities(
            CapabilityType.PLATFORM_NAME, Platform.ANDROID, "appium:platformVersion", "14");

    Capabilities capabilities =
        new ImmutableCapabilities(
            CapabilityType.PLATFORM_NAME,
            Platform.ANDROID,
            "appium:platformVersion",
            "14",
            "appium:options",
            Map.of("automationName", "uiautomator2"));

    assertThat(slotMatcher.matches(stereotype, capabilities)).isTrue();
  }

  @Test
  void relayNodeMatchesByBypassingBrowserNameWhenAppSet() {
    /*
    Relay node stereotype does not declare browserName (operator wants to restrict the slot to
    native-app-only sessions). A request carrying both browserName (e.g. initialized via
    ChromeOptions) and an app capability still matches -- the browserName is disregarded.
     */
    Capabilities stereotype =
        new ImmutableCapabilities(
            CapabilityType.PLATFORM_NAME, Platform.ANDROID, "appium:platformVersion", "14");
    Capabilities capabilities =
        new ImmutableCapabilities(
            CapabilityType.BROWSER_NAME,
            "chrome",
            CapabilityType.PLATFORM_NAME,
            Platform.ANDROID,
            "appium:platformVersion",
            "14",
            "appium:app",
            "link.to.apk",
            "appium:automationName",
            "uiautomator2");
    assertThat(slotMatcher.matches(stereotype, capabilities)).isTrue();
  }

  @Test
  void relayNodeRequiresBrowserNameWhenAppNotSet() {
    /*
    Relay node 1's stereotype does not declare browserName. A hybrid request (browserName set,
    no app capability) must not match it -- the browserName bypass only applies when an
    app-relay capability is present. Relay node 2's stereotype declares browserName and matches.
     */
    Capabilities stereotype1 =
        new ImmutableCapabilities(
            CapabilityType.PLATFORM_NAME, Platform.ANDROID, "appium:platformVersion", "14");
    Capabilities capabilities =
        new ImmutableCapabilities(
            CapabilityType.BROWSER_NAME,
            "chrome",
            CapabilityType.PLATFORM_NAME,
            Platform.ANDROID,
            "appium:platformVersion",
            "14",
            "appium:automationName",
            "uiautomator2");
    assertThat(slotMatcher.matches(stereotype1, capabilities)).isFalse();

    Capabilities stereotype2 =
        new ImmutableCapabilities(
            CapabilityType.BROWSER_NAME,
            "chrome",
            CapabilityType.PLATFORM_NAME,
            Platform.ANDROID,
            "appium:platformVersion",
            "14");
    assertThat(slotMatcher.matches(stereotype2, capabilities)).isTrue();
  }
}
