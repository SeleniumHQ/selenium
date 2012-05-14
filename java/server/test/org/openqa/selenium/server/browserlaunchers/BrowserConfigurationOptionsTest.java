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


package org.openqa.selenium.server.browserlaunchers;


import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertNull;
import static org.junit.Assert.assertTrue;

import com.thoughtworks.selenium.BrowserConfigurationOptions;

import org.junit.Test;
import org.openqa.selenium.Capabilities;
import org.openqa.selenium.browserlaunchers.Proxies;
import org.openqa.selenium.remote.DesiredCapabilities;

public class BrowserConfigurationOptionsTest {

  @Test
  public void testInitializationWithNoOptions() {
    BrowserOptions.newBrowserOptions("");
  }

  @Test
  public void testInitializationWithGoodSingleOption() {
    Capabilities options = BrowserOptions.newBrowserOptions("profile=foo");
    assertEquals("foo", BrowserOptions.getProfile(options));
    assertTrue(BrowserOptions.hasOptionsSet(options));
  }

  @Test
  public void testInitializationWithGoodSingleOptionAndWhitespace() {
    Capabilities options = BrowserOptions.newBrowserOptions("profile= foo bar");
    assertEquals("foo bar", BrowserOptions.getProfile(options));
    assertTrue(BrowserOptions.hasOptionsSet(options));
  }

  @Test
  public void testInitializationWithBadSingleOption() {
    Capabilities options = BrowserOptions.newBrowserOptions("profile_foo");
    assertNull(BrowserOptions.getProfile(options));
    assertFalse(BrowserOptions.hasOptionsSet(options));
  }

  @Test
  public void testInitializationWithGoodOptionsAndWhitespace() {
    Capabilities options =
        BrowserOptions.newBrowserOptions("profile=foo ; unknown=bar");
    assertEquals("foo", BrowserOptions.getProfile(options));
    assertTrue(BrowserOptions.hasOptionsSet(options));
  }

  @Test
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
      // assertEquals(options.serialize(), options.toString());
    }
    // fail("Make me pass");
  }

  @Test
  public void testCanBeConvertedToACapabilitiesObject() {
    Capabilities options = BrowserOptions.newBrowserOptions();
    options = Proxies.setAvoidProxy(options, true);
    options = BrowserOptions.setSingleWindow(options, true);

    // Because "proxyRequired" is set
    assertEquals(3, options.asMap().size());
  }

  @Test
  public void testServerOptionsCanLoadClientOptions() {
    String profile = "foo";
    String execPath = "c:\\simon stewart\\likes\\cheese";
    BrowserConfigurationOptions bco = new BrowserConfigurationOptions()
        .setSingleWindow()
        .setProfile(profile)
        .setBrowserExecutablePath(execPath);
    Capabilities serverOptions = BrowserOptions.newBrowserOptions(bco.toString());
    assertEquals(profile, BrowserOptions.getProfile(serverOptions));
    assertEquals(execPath, BrowserOptions.getExecutablePath(serverOptions));
    assertTrue(BrowserOptions.isSingleWindow(serverOptions));
  }
}
