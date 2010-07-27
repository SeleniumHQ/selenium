package org.openqa.selenium.remote;

import junit.framework.TestCase;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

import org.openqa.selenium.Capabilities;
import org.openqa.selenium.StubDriver;
import org.openqa.selenium.WebDriver;

public class DesiredCapabilitiesTest extends TestCase {
  public void testAddingTheSameCapabilityToAMapTwiceShouldResultInOneEntry() {
    Map<org.openqa.selenium.Capabilities, Class<? extends WebDriver>> capabilitiesToDriver =
      new ConcurrentHashMap<Capabilities, Class<? extends WebDriver>>();

    capabilitiesToDriver.put(DesiredCapabilities.firefox(), StubDriver.class);
    capabilitiesToDriver.put(DesiredCapabilities.firefox(), StubDriver.class);

    assertEquals(1, capabilitiesToDriver.size());
  }
}
