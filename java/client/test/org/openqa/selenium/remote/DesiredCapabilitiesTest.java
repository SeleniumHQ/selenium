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

import org.junit.Test;
import org.junit.runner.RunWith;
import org.junit.runners.JUnit4;
import org.openqa.selenium.Capabilities;
import org.openqa.selenium.Platform;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.logging.LoggingPreferences;

import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.logging.Level;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertSame;

@RunWith(JUnit4.class)
public class DesiredCapabilitiesTest {
  @Test
  public void testAddingTheSameCapabilityToAMapTwiceShouldResultInOneEntry() {
    Map<org.openqa.selenium.Capabilities, Class<? extends WebDriver>> capabilitiesToDriver =
        new ConcurrentHashMap<>();

    capabilitiesToDriver.put(DesiredCapabilities.firefox(), WebDriver.class);
    capabilitiesToDriver.put(DesiredCapabilities.firefox(), WebDriver.class);

    assertEquals(1, capabilitiesToDriver.size());
  }

  @Test
  public void testAugmentingCapabilitiesReturnsNewCapabilities() {
    DesiredCapabilities origCapabilities = new DesiredCapabilities();
    origCapabilities.setCapability("Browser", "firefox");

    DesiredCapabilities extraCapabilities = new DesiredCapabilities();
    extraCapabilities.setCapability("Platform", "any");

    origCapabilities.merge(extraCapabilities);
    assertEquals("firefox", origCapabilities.getCapability("Browser"));
    assertEquals("any", origCapabilities.getCapability("Platform"));
  }

  @Test
  public void testCopyConstructorWithNullArgument() {
    DesiredCapabilities origCapabilities = new DesiredCapabilities((Capabilities) null);

    origCapabilities.setCapability("Browser", "firefox");
    assertEquals("firefox", origCapabilities.getCapability("Browser"));
  }

  @Test
  public void testCopyConstructorDoesNotAliasToArgument() {
    DesiredCapabilities origCapabilities = new DesiredCapabilities();
    origCapabilities.setCapability("Browser", "firefox");

    DesiredCapabilities newCapabilities = new DesiredCapabilities(origCapabilities);
    origCapabilities.setCapability("Browser", "ie");

    assertEquals("ie", origCapabilities.getCapability("Browser"));
    assertEquals("firefox", newCapabilities.getCapability("Browser"));
  }

  @Test
  public void testExtractDebugLogLevelFromCapabilityMap() {
    Map<String, Object> capabilitiesMap = new HashMap<String, Object>() {{
      put(CapabilityType.LOGGING_PREFS, new HashMap<String, String>() {{
        put("browser", "DEBUG");
      }});
    }};

    DesiredCapabilities caps = new DesiredCapabilities(capabilitiesMap);
    LoggingPreferences prefs =
        (LoggingPreferences) caps.getCapability(CapabilityType.LOGGING_PREFS);
    assertSame(Level.FINE, prefs.getLevel("browser"));
  }

  @Test
  public void shouldAutomaticallyConvertPlatformFromStringToEnum() {
    DesiredCapabilities caps = new DesiredCapabilities();
    caps.setCapability(CapabilityType.PLATFORM, "windows 7");
    assertEquals(caps.getCapability(CapabilityType.PLATFORM), Platform.VISTA);
    caps.setCapability(CapabilityType.PLATFORM, "WIN8_1");
    assertEquals(caps.getCapability(CapabilityType.PLATFORM), Platform.WIN8_1);
  }

  @Test
  public void shouldNotAutomaticallyConvertPlatformIfItNotConvertible() {
    DesiredCapabilities caps = new DesiredCapabilities();
    caps.setCapability(CapabilityType.PLATFORM, "FreeBSD");
    assertEquals(caps.getCapability(CapabilityType.PLATFORM), "FreeBSD");
  }

  @Test
  public void shouldNotAutomaticallyConvertPlatformIfItNotConvertibleInConstructor() {
    Map<String, Object> capabilitiesMap = new HashMap<String, Object>() {{
      put(CapabilityType.PLATFORM, "FreeBSD");
    }};

    DesiredCapabilities caps = new DesiredCapabilities(capabilitiesMap);
    assertEquals(caps.getCapability(CapabilityType.PLATFORM), "FreeBSD");
  }

  @Test
  public void shouldShortenLongValues() {
    Map<String, Object> capabilitiesMap = new HashMap<String, Object>() {{
      put("key", createString(1025));
    }};

    DesiredCapabilities caps = new DesiredCapabilities(capabilitiesMap);
    assertEquals(caps.toString().length(), 53);
  }

  @Test
  public void shouldShortenLongEnclosedValues() {
    Map<String, Object> capabilitiesMap = new HashMap<String, Object>() {{
      put("key", new HashMap<String, String>() {{
        put("subkey", createString(1025));
      }});
    }};

    DesiredCapabilities caps = new DesiredCapabilities(capabilitiesMap);
    System.out.println(caps.toString());
    assertEquals(caps.toString().length(), 62);
  }

  private String createString(int length) {
    StringBuilder outputBuffer = new StringBuilder(length);
    for (int i = 0; i < length; i++){
      outputBuffer.append("x");
    }
    return outputBuffer.toString();
  }

}
