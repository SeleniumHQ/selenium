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

package org.openqa.selenium.remote;

import static org.assertj.core.api.Assertions.assertThat;
import static org.openqa.selenium.Platform.ANDROID;
import static org.openqa.selenium.Platform.WINDOWS;
import static org.openqa.selenium.remote.CapabilityType.ACCEPT_INSECURE_CERTS;
import static org.openqa.selenium.remote.CapabilityType.BROWSER_NAME;
import static org.openqa.selenium.remote.CapabilityType.BROWSER_VERSION;
import static org.openqa.selenium.remote.CapabilityType.PLATFORM_NAME;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.openqa.selenium.Capabilities;
import org.openqa.selenium.Platform;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.firefox.FirefoxOptions;

@Tag("UnitTests")
class DesiredCapabilitiesTest {

  @Test
  void defaultConstructor() {
    DesiredCapabilities capabilities = new DesiredCapabilities();
    assertThat(capabilities.asMap()).isEmpty();
  }

  @Test
  void constructorWithMap() {
    DesiredCapabilities capabilities = new DesiredCapabilities(Map.of("foo", 8));
    assertThat(capabilities.asMap()).containsExactly(Map.entry("foo", 8));
  }

  @Test
  void constructorWithBrowserVersion() {
    DesiredCapabilities capabilities = new DesiredCapabilities("firefox", "2.0", WINDOWS);
    assertThat(capabilities.asMap())
        .containsExactlyInAnyOrderEntriesOf(
            Map.of(
                BROWSER_VERSION, "2.0",
                BROWSER_NAME, "firefox",
                PLATFORM_NAME, WINDOWS));
  }

  @Test
  void fluentSetters() {
    DesiredCapabilities capabilities =
        new DesiredCapabilities()
            .setBrowserName("edge")
            .setVersion("3.0")
            .setPlatform(ANDROID)
            .setAcceptInsecureCerts(true);
    assertThat(capabilities.asMap())
        .containsExactlyInAnyOrderEntriesOf(
            Map.of(
                BROWSER_VERSION,
                "3.0",
                BROWSER_NAME,
                "edge",
                PLATFORM_NAME,
                ANDROID,
                ACCEPT_INSECURE_CERTS,
                true));
  }

  @Test
  void testAddingTheSameCapabilityToAMapTwiceShouldResultInOneEntry() {
    Map<Capabilities, Class<? extends WebDriver>> capabilitiesToDriver = new ConcurrentHashMap<>();

    capabilitiesToDriver.put(new FirefoxOptions(), WebDriver.class);
    capabilitiesToDriver.put(new FirefoxOptions(), RemoteWebDriver.class);

    assertThat(capabilitiesToDriver)
        .hasSize(1)
        .containsEntry(new FirefoxOptions(), RemoteWebDriver.class);
  }

  @Test
  void testAugmentingCapabilitiesReturnsNewCapabilities() {
    DesiredCapabilities origCapabilities = new DesiredCapabilities();
    origCapabilities.setCapability("BrowserName", "firefox");

    DesiredCapabilities extraCapabilities = new DesiredCapabilities();
    extraCapabilities.setCapability("PlatformName", "any");

    origCapabilities.merge(extraCapabilities);
    assertThat(origCapabilities.getCapability("BrowserName")).isEqualTo("firefox");
    assertThat(origCapabilities.getCapability("PlatformName")).isEqualTo("any");
  }

  @Test
  void testCopyConstructorWithNullArgument() {
    DesiredCapabilities origCapabilities = new DesiredCapabilities((Capabilities) null);

    origCapabilities.setCapability("BrowserName", "firefox");
    assertThat(origCapabilities.getCapability("BrowserName")).isEqualTo("firefox");
  }

  @Test
  void testCopyConstructorDoesNotAliasToArgument() {
    DesiredCapabilities origCapabilities = new DesiredCapabilities();
    origCapabilities.setCapability("BrowserName", "firefox");

    DesiredCapabilities newCapabilities = new DesiredCapabilities(origCapabilities);
    origCapabilities.setCapability("BrowserName", "ie");

    assertThat(origCapabilities.getCapability("BrowserName")).isEqualTo("ie");
    assertThat(newCapabilities.getCapability("BrowserName")).isEqualTo("firefox");
  }

  @Test
  void shouldAutomaticallyConvertPlatformFromStringToEnum() {
    DesiredCapabilities caps = new DesiredCapabilities();
    caps.setCapability(CapabilityType.PLATFORM_NAME, "Windows Server 2008");
    assertThat(caps.getCapability(CapabilityType.PLATFORM_NAME)).isEqualTo(Platform.VISTA);
    caps.setCapability(CapabilityType.PLATFORM_NAME, "win8.1");
    assertThat(caps.getCapability(CapabilityType.PLATFORM_NAME)).isEqualTo(Platform.WIN8_1);
  }

  @Test
  void shouldNotAutomaticallyConvertPlatformIfItNotConvertible() {
    DesiredCapabilities caps = new DesiredCapabilities();
    caps.setCapability(CapabilityType.PLATFORM_NAME, "FreeBSD");
    assertThat(caps.getCapability(CapabilityType.PLATFORM_NAME)).isEqualTo("FreeBSD");
  }

  @Test
  void shouldNotAutomaticallyConvertPlatformIfItNotConvertibleInConstructor() {
    Map<String, Object> capabilitiesMap = Map.of(CapabilityType.PLATFORM_NAME, "FreeBSD");

    DesiredCapabilities caps = new DesiredCapabilities(capabilitiesMap);
    assertThat(caps.getCapability(CapabilityType.PLATFORM_NAME)).isEqualTo("FreeBSD");
  }

  @Test
  void shouldShortenLongValues() {
    Map<String, Object> capabilitiesMap = Map.of("key", createString(1025));

    DesiredCapabilities caps = new DesiredCapabilities(capabilitiesMap);
    String expected = "key: " + createString(27) + "...";
    assertThat(caps.toString()).contains(expected);
  }

  @Test
  void shouldShortenLongEnclosedValues() {
    Map<String, Object> capabilitiesMap = Map.of("key", Map.of("subkey", createString(1025)));

    DesiredCapabilities caps = new DesiredCapabilities(capabilitiesMap);
    String expected = "{subkey: " + createString(27) + "..." + "}";
    assertThat(caps.toString()).contains(expected);
  }

  @Test
  void canCompareCapabilities() {
    DesiredCapabilities caps1 = new DesiredCapabilities();
    DesiredCapabilities caps2 = new DesiredCapabilities();
    assertThat(caps2).isEqualTo(caps1);

    caps1.setCapability("xxx", "yyy");
    assertThat(caps2).isNotEqualTo(caps1);

    caps2.setCapability("xxx", "yyy");
    assertThat(caps2).isEqualTo(caps1);
  }

  private String createString(int length) {
    return "x".repeat(Math.max(0, length));
  }
}
