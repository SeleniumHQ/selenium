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

  public void testAugmentingCapabilitiesReturnsNewCapabilities() {
    DesiredCapabilities origCapabilities = new DesiredCapabilities();
    origCapabilities.setCapability("Browser", "firefox");

    DesiredCapabilities extraCapabilities = new DesiredCapabilities();
    extraCapabilities.setCapability("Platform", "any");

    origCapabilities.merge(extraCapabilities);
    assertEquals("firefox", origCapabilities.getCapability("Browser"));
    assertEquals("any", origCapabilities.getCapability("Platform"));
  }

  public void testCopyConstructorWithNullArgument() {
    DesiredCapabilities origCapabilities = new DesiredCapabilities((Capabilities) null);

    origCapabilities.setCapability("Browser", "firefox");
    assertEquals("firefox", origCapabilities.getCapability("Browser"));    
  }

  public void testCopyConstructorDoesNotAliasToArgument() {
    DesiredCapabilities origCapabilities = new DesiredCapabilities();
    origCapabilities.setCapability("Browser", "firefox");

    DesiredCapabilities newCapabilities = new DesiredCapabilities(origCapabilities);
    origCapabilities.setCapability("Browser", "ie");

    assertEquals("ie", origCapabilities.getCapability("Browser"));
    assertEquals("firefox", newCapabilities.getCapability("Browser"));
  }
}
