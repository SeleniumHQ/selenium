package org.openqa.selenium.server;


import junit.framework.TestCase;

import org.openqa.selenium.Capabilities;
import org.openqa.selenium.browserlaunchers.Proxies;
import org.openqa.selenium.remote.DesiredCapabilities;
import org.openqa.selenium.server.browserlaunchers.BrowserOptions;

public class BrowserConfigurationOptionsTest extends TestCase {

  public void testInitializationWithNoOptions() {
    BrowserOptions.newBrowserOptions("");
  }

  public void testInitializationWithGoodSingleOption() {
    Capabilities options = BrowserOptions.newBrowserOptions("profile=foo");
    assertEquals("foo", BrowserOptions.getProfile(options));
    assertTrue(BrowserOptions.hasOptionsSet(options));
  }

  public void testInitializationWithGoodSingleOptionAndWhitespace() {
    Capabilities options = BrowserOptions.newBrowserOptions("profile= foo bar");
    assertEquals("foo bar", BrowserOptions.getProfile(options));
    assertTrue(BrowserOptions.hasOptionsSet(options));
  }

  public void testInitializationWithBadSingleOption() {
    Capabilities options = BrowserOptions.newBrowserOptions("profile_foo");
    assertNull(BrowserOptions.getProfile(options));
    assertFalse(BrowserOptions.hasOptionsSet(options));
  }

  public void testInitializationWithGoodOptionsAndWhitespace() {
    Capabilities options =
        BrowserOptions.newBrowserOptions("profile=foo ; unknown=bar");
    assertEquals("foo", BrowserOptions.getProfile(options));
    assertTrue(BrowserOptions.hasOptionsSet(options));
  }

  public void testToStringEquivalentToSerialize() {
    String[] tests = {
        "",
        "foo",
        "foo bar",
        null
    };

    DesiredCapabilities options = (DesiredCapabilities) BrowserOptions.newBrowserOptions();

    for (String test : tests) {
      options.setCapability("profile", test);
//      assertEquals(options.serialize(), options.toString());
    }
//    fail("Make me pass");
  }

  public void testCanBeConvertedToACapabilitiesObject() {
    Capabilities options = BrowserOptions.newBrowserOptions();
    options = Proxies.setAvoidProxy(options, true);
    options = BrowserOptions.setSingleWindow(options, true);

    // Because "proxyRequired" is set
    assertEquals(3, options.asMap().size());
  }
}