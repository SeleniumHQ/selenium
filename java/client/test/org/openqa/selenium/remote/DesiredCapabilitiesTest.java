/*
Copyright 2012 Selenium committers
Copyright 2012 Software Freedom Conservancy

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

     http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/


package org.openqa.selenium.remote;

import org.junit.Test;
import org.openqa.selenium.Capabilities;
import org.openqa.selenium.StubDriver;
import org.openqa.selenium.WebDriver;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

import static org.junit.Assert.assertEquals;

public class DesiredCapabilitiesTest {
  @Test
  public void testAddingTheSameCapabilityToAMapTwiceShouldResultInOneEntry() {
    Map<org.openqa.selenium.Capabilities, Class<? extends WebDriver>> capabilitiesToDriver =
        new ConcurrentHashMap<Capabilities, Class<? extends WebDriver>>();

    capabilitiesToDriver.put(DesiredCapabilities.firefox(), StubDriver.class);
    capabilitiesToDriver.put(DesiredCapabilities.firefox(), StubDriver.class);

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
}
