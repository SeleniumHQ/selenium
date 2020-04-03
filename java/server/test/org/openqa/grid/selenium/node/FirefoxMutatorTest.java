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

package org.openqa.grid.selenium.node;

import static org.openqa.selenium.firefox.FirefoxDriver.BINARY;
import static org.openqa.selenium.firefox.FirefoxDriver.MARIONETTE;

import org.junit.Test;
import org.openqa.selenium.ImmutableCapabilities;

public class FirefoxMutatorTest {

  private final ImmutableCapabilities defaultConfig = new ImmutableCapabilities(
      "browserName", "firefox",
      BINARY, "binary",
      "firefox_profile", "profile",
      MARIONETTE, true);

  @Test
  public void shouldDoNothingIfBrowserNameIsNotFirefox() {
//    ImmutableCapabilities caps = new ImmutableCapabilities("browserName", "chrome");
//
//    Capabilities seen = new FirefoxMutator(defaultConfig).apply(caps);
//
//    // Make sure we return exactly the same instance of the capabilities, and not just a copy.
//    assertSame(caps, seen);
  }

  @Test
  public void shouldDoNothingIfCapabilitiesUsedToConfigureMutatorAreNotFirefoxBased() {
//    ImmutableCapabilities config = new ImmutableCapabilities(
//        "browserName", "foo",
//        "firefox_binary", "cake");
//
//    ImmutableCapabilities caps = new ImmutableCapabilities("browserName", "firefox");
//    Capabilities seen = new FirefoxMutator(config).apply(caps);
//
//    assertSame(caps, seen);
  }

  @Test
  public void shouldInjectBinaryIfNotSpecified() {
//    ImmutableCapabilities caps = new ImmutableCapabilities("browserName", "firefox");
//    Capabilities seen = new FirefoxMutator(defaultConfig).apply(caps);
//
//    assertEquals(
//        seen.getCapability("firefox_binary"),
//        defaultConfig.getCapability("firefox_binary"));
//
//    @SuppressWarnings("unchecked")
//    Map<String, Object> options = (Map<String, Object>) seen.getCapability(FIREFOX_OPTIONS);
//
//    assertEquals(
//        options.get("binary"),
//        defaultConfig.getCapability("firefox_binary"));
  }

  @Test
  public void shouldInjectBinaryIfLegacyOptionUnsetButGeckoDriverOptionSet() {
//    ImmutableCapabilities caps = new ImmutableCapabilities(
//        "browserName", "firefox",
//        BINARY, "cheese",
//        FIREFOX_OPTIONS, ImmutableMap.of());
//    Capabilities seen = new FirefoxMutator(defaultConfig).apply(caps);
//
//    assertEquals("cheese", seen.getCapability(BINARY));
//
//    @SuppressWarnings("unchecked")
//    Map<String, Object> options = (Map<String, Object>) seen.getCapability(FIREFOX_OPTIONS);
//
//    assertEquals(defaultConfig.getCapability(BINARY), options.get("binary"));
  }

  @Test
  public void shouldInjectBinaryIfGeckoDriverOptionUnsetButLegacyOptionSet() {
//    ImmutableCapabilities caps = new ImmutableCapabilities(
//        "browserName", "firefox",
//        FIREFOX_OPTIONS, ImmutableMap.of("binary", "cheese"));
//    Capabilities seen = new FirefoxMutator(defaultConfig).apply(caps);
//
//    assertEquals(defaultConfig.getCapability(BINARY), seen.getCapability(BINARY));
//
//    @SuppressWarnings("unchecked")
//    Map<String, Object> options = (Map<String, Object>) seen.getCapability(FIREFOX_OPTIONS);
//
//    assertEquals("cheese", options.get("binary"));
  }

  @Test
  public void shouldInjectMarionetteValueNoMatterWhat() {
//    ImmutableCapabilities caps = new ImmutableCapabilities(
//        "browserName", "firefox",
//        MARIONETTE, "cheese");
//    Capabilities seen = new FirefoxMutator(defaultConfig).apply(caps);
//
//    assertEquals(defaultConfig.getCapability(MARIONETTE), seen.getCapability(MARIONETTE));
  }

  @Test
  public void shouldInjectIfConfigUuidMatches() {
//    ImmutableCapabilities defaultConfigWithUuid = new ImmutableCapabilities(
//        "browserName", "firefox",
//        BINARY, "binary",
//        "firefox_profile", "profile",
//        MARIONETTE, true,
//        GridNodeConfiguration.CONFIG_UUID_CAPABILITY, "123");
//    ImmutableCapabilities caps = new ImmutableCapabilities(
//        "browserName", "firefox",
//        MARIONETTE, "cheese",
//        GridNodeConfiguration.CONFIG_UUID_CAPABILITY, "123");
//    Capabilities seen = new FirefoxMutator(defaultConfigWithUuid).apply(caps);
//
//    assertEquals(true, seen.getCapability(MARIONETTE));
  }

  @Test
  public void shouldNotInjectIfConfigUuidDoesNotMatch() {
//    ImmutableCapabilities defaultConfigWithUuid = new ImmutableCapabilities(
//        "browserName", "firefox",
//        BINARY, "binary",
//        "firefox_profile", "profile",
//        MARIONETTE, true,
//        GridNodeConfiguration.CONFIG_UUID_CAPABILITY, "uuid");
//    ImmutableCapabilities caps = new ImmutableCapabilities(
//        "browserName", "firefox",
//        MARIONETTE, "cheese",
//        GridNodeConfiguration.CONFIG_UUID_CAPABILITY, "123");
//    Capabilities seen = new FirefoxMutator(defaultConfigWithUuid).apply(caps);
//
//    assertEquals("cheese", seen.getCapability(MARIONETTE));
  }

  @Test
  public void shouldNotInjectIfUuidIsPresentInConfigOnly() {
//    ImmutableCapabilities defaultConfigWithUuid = new ImmutableCapabilities(
//        "browserName", "firefox",
//        BINARY, "binary",
//        "firefox_profile", "profile",
//        MARIONETTE, true,
//        GridNodeConfiguration.CONFIG_UUID_CAPABILITY, "uuid");
//    ImmutableCapabilities caps = new ImmutableCapabilities(
//        "browserName", "firefox",
//        MARIONETTE, "cheese");
//    Capabilities seen = new FirefoxMutator(defaultConfigWithUuid).apply(caps);
//
//    assertEquals("cheese", seen.getCapability(MARIONETTE));
  }

  @Test
  public void shouldNotInjectIfUuidIsPresentInPayloadOnly() {
//    ImmutableCapabilities caps = new ImmutableCapabilities(
//        "browserName", "firefox",
//        MARIONETTE, "cheese",
//        GridNodeConfiguration.CONFIG_UUID_CAPABILITY, "123");
//    Capabilities seen = new FirefoxMutator(defaultConfig).apply(caps);
//
//    assertEquals("cheese", seen.getCapability(MARIONETTE));
  }
}
