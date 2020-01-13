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

package org.openqa.selenium.remote.server;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertNotEquals;
import static org.junit.Assert.assertTrue;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;
import static org.openqa.selenium.remote.BrowserType.CHROME;
import static org.openqa.selenium.remote.BrowserType.EDGE;
import static org.openqa.selenium.remote.BrowserType.FIREFOX;
import static org.openqa.selenium.remote.BrowserType.IE;
import static org.openqa.selenium.remote.BrowserType.SAFARI;
import static org.openqa.selenium.remote.CapabilityType.BROWSER_NAME;

import org.junit.Before;
import org.junit.Test;
import org.openqa.selenium.Capabilities;
import org.openqa.selenium.ImmutableCapabilities;
import org.openqa.selenium.Platform;
import org.openqa.selenium.StubDriver;
import org.openqa.selenium.remote.DesiredCapabilities;

public class DriverFactoryTest {

  private DefaultDriverFactory factory;

  @Before
  public void setUp() {
    factory = new DefaultDriverFactory(Platform.getCurrent());
  }

  @Test
  public void testShouldRegisterCorrectDefaultsOnMac() {
    DefaultDriverFactory factory = new DefaultDriverFactory(Platform.MAC);

    assertTrue(canInstantiate(factory, CHROME));
    assertTrue(canInstantiate(factory, EDGE));
    assertTrue(canInstantiate(factory, FIREFOX));
    assertTrue(canInstantiate(factory, SAFARI));
    assertFalse(canInstantiate(factory, IE));
  }

  @Test
  public void testShouldRegisterCorrectDefaultsOnLinux() {
    DefaultDriverFactory factory = new DefaultDriverFactory(Platform.LINUX);

    assertTrue(canInstantiate(factory, CHROME));
    assertTrue(canInstantiate(factory, EDGE));
    assertTrue(canInstantiate(factory, FIREFOX));
    assertFalse(canInstantiate(factory, SAFARI));
    assertFalse(canInstantiate(factory, IE));
  }

  @Test
  public void testShouldRegisterCorrectDefaultsOnWindows() {
    DefaultDriverFactory factory = new DefaultDriverFactory(Platform.VISTA);

    assertTrue(canInstantiate(factory, CHROME));
    assertTrue(canInstantiate(factory, EDGE));
    assertTrue(canInstantiate(factory, FIREFOX));
    assertFalse(canInstantiate(factory, SAFARI));
    assertTrue(canInstantiate(factory, IE));
  }

  private boolean canInstantiate(DefaultDriverFactory factory, String browser) {
    Capabilities capabilities = new ImmutableCapabilities(BROWSER_NAME, browser);
    return factory.getProviderMatching(capabilities).canCreateDriverInstanceFor(capabilities);
  }

  @Test
  public void testShouldBeAbleToRegisterNewDrivers() {
    Capabilities capabilities = new DesiredCapabilities("cheese", null, Platform.ANY);
    assertNotEquals(factory.getProviderMatching(capabilities).getProvidedCapabilities(), capabilities);

    factory.registerDriverProvider(mockDriverProviderFor(capabilities));

    assertEquals(factory.getProviderMatching(capabilities).getProvidedCapabilities(), capabilities);
  }

  @Test
  public void testShouldReturnMatchIfOneFieldMatchesAndOnlyOneDriverIsRegistered() {
    Capabilities template = new DesiredCapabilities("foo", "1.0", Platform.getCurrent());
    DriverProvider provider = mockDriverProviderFor(template);

    factory.registerDriverProvider(provider);

    Capabilities example = new ImmutableCapabilities(BROWSER_NAME, template.getBrowserName());
    assertEquals(provider, factory.getProviderMatching(example));
  }

  @Test
  public void testShouldReturnDriverWhereTheMostCapabilitiesMatch() {
    Capabilities first = new DesiredCapabilities("foo", "1.0", Platform.ANY);
    Capabilities second = new DesiredCapabilities("bar", "1.0", Platform.ANY);

    DriverProvider provider1 = mockDriverProviderFor(first);
    DriverProvider provider2 = mockDriverProviderFor(second);

    factory.registerDriverProvider(provider1);
    factory.registerDriverProvider(provider2);

    Capabilities example = new ImmutableCapabilities(BROWSER_NAME, "foo");
    assertEquals(provider1, factory.getProviderMatching(example));

    example = new ImmutableCapabilities(BROWSER_NAME, "bar");
    assertEquals(provider2, factory.getProviderMatching(example));
  }

  @Test
  public void testShouldReturnDriverWhereTheMostCapabilitiesMatch_lotsOfRegisteredDrivers() {
    DesiredCapabilities desiredCapabilities = new DesiredCapabilities();
    desiredCapabilities.setBrowserName(FIREFOX);
    desiredCapabilities.setVersion("");
    desiredCapabilities.setJavascriptEnabled(true);
    desiredCapabilities.setPlatform(Platform.ANY);

    assertEquals(FIREFOX, factory.getProviderMatching(desiredCapabilities)
        .getProvidedCapabilities().getBrowserName());
  }

  @Test
  public void testShouldReturnMostRecentlyAddedDriverWhenAllCapabilitiesAreEqual() {
    Capabilities capabilities = new ImmutableCapabilities(BROWSER_NAME, "cheese");

    DriverProvider provider1 = mockDriverProviderFor(capabilities);
    DriverProvider provider2 = mockDriverProviderFor(capabilities);

    factory.registerDriverProvider(provider1);
    factory.registerDriverProvider(provider2);

    assertEquals(provider2, factory.getProviderMatching(capabilities));
  }

  @Test
  public void testShouldConsiderPlatform() {
    DesiredCapabilities windows = new DesiredCapabilities("browser", "v1", Platform.WINDOWS);
    DesiredCapabilities linux = new DesiredCapabilities("browser", "v1", Platform.LINUX);

    DriverProvider windowsProvider = mockDriverProviderFor(windows);
    DriverProvider linuxProvider = mockDriverProviderFor(linux);

    factory.registerDriverProvider(windowsProvider);
    factory.registerDriverProvider(linuxProvider);

    assertEquals(windowsProvider, factory.getProviderMatching(windows));
    assertEquals(linuxProvider, factory.getProviderMatching(linux));
  }

  @Test
  public void testShouldMatchAgainstAnyPlatformWhenRequestingAny() {
    DesiredCapabilities windowsVista = new DesiredCapabilities("browser", "v1", Platform.VISTA);
    DesiredCapabilities windowsXp = new DesiredCapabilities("browser", "v1", Platform.XP);
    DesiredCapabilities anyWindows = new DesiredCapabilities("browser", "v1", Platform.ANY);

    DriverProvider provider = mockDriverProviderFor(windowsVista);

    factory.registerDriverProvider(provider);

    assertEquals(provider, factory.getProviderMatching(windowsVista));
    assertEquals(provider, factory.getProviderMatching(anyWindows));
    assertEquals("Should always get a match if a driver has been registered",
                 provider, factory.getProviderMatching(windowsXp));
  }

  @Test
  public void testShouldConsiderJavascriptCapabilities() {
    DesiredCapabilities nojavascript = new DesiredCapabilities("browser", "v1", Platform.LINUX);
    nojavascript.setJavascriptEnabled(false);
    DesiredCapabilities javascript = new DesiredCapabilities("browser", "v1", Platform.LINUX);
    javascript.setJavascriptEnabled(true);

    DriverProvider nojavascriptProvider = mockDriverProviderFor(nojavascript);
    DriverProvider javascriptProvider = mockDriverProviderFor(javascript);

    factory.registerDriverProvider(nojavascriptProvider);
    factory.registerDriverProvider(javascriptProvider);

    assertEquals(nojavascriptProvider, factory.getProviderMatching(nojavascript));
    assertEquals(javascriptProvider, factory.getProviderMatching(javascript));
  }

  @Test
  public void testShouldCallAConstructorTakingACapabilitiesArgInPreferenceToANoArgOne() {
    Capabilities caps = new ImmutableCapabilities(BROWSER_NAME, "example");
    factory.registerDriverProvider(new DefaultDriverProvider(caps, CapabilitiesDriver.class));

    CapabilitiesDriver driver = (CapabilitiesDriver) factory.newInstance(caps);

    assertEquals(caps, driver.getCapabilities());
  }

  private static class CapabilitiesDriver extends StubDriver {
    private Capabilities caps;

    @SuppressWarnings("unused")
    public CapabilitiesDriver() {
    }

    @SuppressWarnings("unused")
    public CapabilitiesDriver(Capabilities caps) {
      this.caps = caps;
    }

    public Capabilities getCapabilities() {
      return caps;
    }
  }

  private DriverProvider mockDriverProviderFor(Capabilities capabilities) {
    DriverProvider provider = mock(DriverProvider.class);
    when(provider.getProvidedCapabilities()).thenReturn(capabilities);
    return provider;
  }

}
