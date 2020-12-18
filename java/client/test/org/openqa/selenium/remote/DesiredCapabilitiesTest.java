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

import com.google.common.collect.ImmutableMap;

import org.junit.Test;
import org.junit.experimental.categories.Category;
import org.openqa.selenium.Capabilities;
import org.openqa.selenium.Platform;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.firefox.FirefoxOptions;
import org.openqa.selenium.logging.LoggingPreferences;
import org.openqa.selenium.testing.UnitTests;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.logging.Level;

@Category(UnitTests.class)
public class DesiredCapabilitiesTest {

  @Test
  public void testAddingTheSameCapabilityToAMapTwiceShouldResultInOneEntry() {
    Map<org.openqa.selenium.Capabilities, Class<? extends WebDriver>> capabilitiesToDriver =
        new ConcurrentHashMap<>();

    capabilitiesToDriver.put(new FirefoxOptions(), WebDriver.class);
    capabilitiesToDriver.put(new FirefoxOptions(), WebDriver.class);

    assertThat(capabilitiesToDriver).hasSize(1);
  }

  @Test
  public void testAugmentingCapabilitiesReturnsNewCapabilities() {
    DesiredCapabilities origCapabilities = new DesiredCapabilities();
    origCapabilities.setCapability("Browser", "firefox");

    DesiredCapabilities extraCapabilities = new DesiredCapabilities();
    extraCapabilities.setCapability("Platform", "any");

    origCapabilities.merge(extraCapabilities);
    assertThat(origCapabilities.getCapability("Browser")).isEqualTo("firefox");
    assertThat(origCapabilities.getCapability("Platform")).isEqualTo("any");
  }

  @Test
  public void testCopyConstructorWithNullArgument() {
    DesiredCapabilities origCapabilities = new DesiredCapabilities((Capabilities) null);

    origCapabilities.setCapability("Browser", "firefox");
    assertThat(origCapabilities.getCapability("Browser")).isEqualTo("firefox");
  }

  @Test
  public void testCopyConstructorDoesNotAliasToArgument() {
    DesiredCapabilities origCapabilities = new DesiredCapabilities();
    origCapabilities.setCapability("Browser", "firefox");

    DesiredCapabilities newCapabilities = new DesiredCapabilities(origCapabilities);
    origCapabilities.setCapability("Browser", "ie");

    assertThat(origCapabilities.getCapability("Browser")).isEqualTo("ie");
    assertThat(newCapabilities.getCapability("Browser")).isEqualTo("firefox");
  }

  @Test
  public void testExtractDebugLogLevelFromCapabilityMap() {
    Map<String, Object> capabilitiesMap
        = ImmutableMap.of(CapabilityType.LOGGING_PREFS, ImmutableMap.of("browser", "DEBUG"));

    DesiredCapabilities caps = new DesiredCapabilities(capabilitiesMap);
    LoggingPreferences prefs =
        (LoggingPreferences) caps.getCapability(CapabilityType.LOGGING_PREFS);
    assertThat(prefs.getLevel("browser")).isSameAs(Level.FINE);
  }

  @Test
  public void shouldAutomaticallyConvertPlatformFromStringToEnum() {
    DesiredCapabilities caps = new DesiredCapabilities();
    caps.setCapability(CapabilityType.PLATFORM, "windows 7");
    assertThat(caps.getCapability(CapabilityType.PLATFORM)).isEqualTo(Platform.VISTA);
    caps.setCapability(CapabilityType.PLATFORM, "WIN8_1");
    assertThat(caps.getCapability(CapabilityType.PLATFORM)).isEqualTo(Platform.WIN8_1);
  }

  @Test
  public void shouldNotAutomaticallyConvertPlatformIfItNotConvertible() {
    DesiredCapabilities caps = new DesiredCapabilities();
    caps.setCapability(CapabilityType.PLATFORM, "FreeBSD");
    assertThat(caps.getCapability(CapabilityType.PLATFORM)).isEqualTo("FreeBSD");
  }

  @Test
  public void shouldNotAutomaticallyConvertPlatformIfItNotConvertibleInConstructor() {
    Map<String, Object> capabilitiesMap = ImmutableMap.of(CapabilityType.PLATFORM, "FreeBSD");

    DesiredCapabilities caps = new DesiredCapabilities(capabilitiesMap);
    assertThat(caps.getCapability(CapabilityType.PLATFORM)).isEqualTo("FreeBSD");
  }

  @Test
  public void shouldShortenLongValues() {
    Map<String, Object> capabilitiesMap = ImmutableMap.of("key", createString(1025));

    DesiredCapabilities caps = new DesiredCapabilities(capabilitiesMap);
    String expected = "key: " + createString(27) + "...";
    assertThat(caps.toString()).contains(expected);
  }

  @Test
  public void shouldShortenLongEnclosedValues() {
    Map<String, Object> capabilitiesMap
        = ImmutableMap.of("key", ImmutableMap.of("subkey", createString(1025)));

    DesiredCapabilities caps = new DesiredCapabilities(capabilitiesMap);
    String expected = "{subkey: " + createString(27) + "..." + "}";
    assertThat(caps.toString()).contains(expected);
  }

  @Test
  public void canCompareCapabilities() {
    DesiredCapabilities caps1 = new DesiredCapabilities();
    DesiredCapabilities caps2 = new DesiredCapabilities();
    assertThat(caps2).isEqualTo(caps1);

    caps1.setCapability("xxx", "yyy");
    assertThat(caps2).isNotEqualTo(caps1);

    caps2.setCapability("xxx", "yyy");
    assertThat(caps2).isEqualTo(caps1);
  }

  private String createString(int length) {
    StringBuilder outputBuffer = new StringBuilder(length);
    for (int i = 0; i < length; i++){
      outputBuffer.append("x");
    }
    return outputBuffer.toString();
  }

}
