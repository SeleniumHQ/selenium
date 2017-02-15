package org.openqa.grid.common;

import static org.junit.Assert.assertEquals;

import org.junit.Test;
import org.openqa.selenium.remote.DesiredCapabilities;

public class SeleniumProtocolTest {

  @Test
  public void getPathTest() {
    //Ensuring that when path is specified via capabilities, that is what we get back in return.
    DesiredCapabilities caps = new DesiredCapabilities();
    caps.setCapability(RegistrationRequest.SELENIUM_PROTOCOL, SeleniumProtocol.WebDriver.toString());
    caps.setCapability(RegistrationRequest.PATH, "foo/bar");
    SeleniumProtocol protocol = SeleniumProtocol.fromCapabilitiesMap(caps.asMap());
    assertEquals(SeleniumProtocol.WebDriver, protocol);
    assertEquals("foo/bar", protocol.getPathConsideringCapabilitiesMap(caps.asMap()));

    //Ensuring that by default we parse the protocol as WebDriver and we get back its default path.
    caps = new DesiredCapabilities();
    protocol = SeleniumProtocol.fromCapabilitiesMap(caps.asMap());
    assertEquals(SeleniumProtocol.WebDriver, protocol);
    assertEquals("/wd/hub", protocol.getPathConsideringCapabilitiesMap(caps.asMap()));
  }
}
