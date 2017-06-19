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
import static org.junit.Assert.assertTrue;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.junit.runners.JUnit4;
import org.openqa.selenium.Capabilities;
import org.openqa.selenium.Platform;
import org.openqa.selenium.StubDriver;
import org.openqa.selenium.remote.BrowserType;
import org.openqa.selenium.remote.DesiredCapabilities;

@RunWith(JUnit4.class)
public class DriverFactoryTest {
  private DefaultDriverFactory factory;

  @Before
  public void setUp() throws Exception {
    factory = new DefaultDriverFactory(Platform.getCurrent());
  }

  @Test
  public void testShouldBeAbleToRegisterNewDrivers() {
    DesiredCapabilities capabilities = new DesiredCapabilities("cheese", null, Platform.ANY);
    assertFalse(factory.hasMappingFor(capabilities));

    factory.registerDriverProvider(mockDriverProviderFor(capabilities));

    assertTrue(factory.hasMappingFor(capabilities));
  }

  @Test
  public void testShouldReturnMatchIfOneFieldMatchesAndOnlyOneDriverIsRegistered() {
    DesiredCapabilities template = new DesiredCapabilities();
    template.setBrowserName("foo");
    template.setVersion("1.0");
    template.setPlatform(Platform.getCurrent());

    DriverProvider provider = mockDriverProviderFor(template);

    factory.registerDriverProvider(provider);

    DesiredCapabilities example = new DesiredCapabilities();
    example.setBrowserName(template.getBrowserName());

    assertEquals(provider, factory.getProviderMatching(example));
  }

  @Test
  public void testShouldReturnDriverWhereTheMostCapabilitiesMatch() {
    DesiredCapabilities first = new DesiredCapabilities();
    first.setBrowserName("foo");
    first.setVersion("1.0");

    DesiredCapabilities second = new DesiredCapabilities();
    second.setBrowserName("bar"); // Different name
    second.setVersion("1.0");

    DriverProvider provider1 = mockDriverProviderFor(first);
    DriverProvider provider2 = mockDriverProviderFor(second);

    factory.registerDriverProvider(provider1);
    factory.registerDriverProvider(provider2);

    DesiredCapabilities example = new DesiredCapabilities();

    example.setBrowserName("foo");
    assertEquals(provider1, factory.getProviderMatching(example));

    example.setBrowserName("bar");
    assertEquals(provider2, factory.getProviderMatching(example));
  }

  @Test
  public void testShouldReturnDriverWhereTheMostCapabilitiesMatch_lotsOfRegisteredDrivers() {
    DriverProvider chromeProvider = mockDriverProviderFor(DesiredCapabilities.chrome());
    DriverProvider firefoxProvider = mockDriverProviderFor(DesiredCapabilities.firefox());
    DriverProvider htmlUnitProvider = mockDriverProviderFor(DesiredCapabilities.htmlUnit());
    DriverProvider ieProvider = mockDriverProviderFor(DesiredCapabilities.internetExplorer());
    DriverProvider operaProvider = mockDriverProviderFor(DesiredCapabilities.operaBlink());

    factory.registerDriverProvider(chromeProvider);
    factory.registerDriverProvider(firefoxProvider);
    factory.registerDriverProvider(htmlUnitProvider);
    factory.registerDriverProvider(ieProvider);
    factory.registerDriverProvider(operaProvider);

    DesiredCapabilities desiredCapabilities = new DesiredCapabilities();
    desiredCapabilities.setBrowserName(BrowserType.IE);
    desiredCapabilities.setVersion("");
    desiredCapabilities.setJavascriptEnabled(true);
    desiredCapabilities.setPlatform(Platform.ANY);

    assertEquals(ieProvider, factory.getProviderMatching(desiredCapabilities));
  }

  @Test
  public void testShouldReturnMostRecentlyAddedDriverWhenAllCapabilitiesAreEqual() {
    Capabilities capabilities = DesiredCapabilities.firefox();

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
    DesiredCapabilities caps = new DesiredCapabilities();
    caps.setBrowserName("example");
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

  private DriverProvider mockDriverProviderFor(Capabilities nojavascript) {
    DriverProvider nojavascriptProvider = mock(DriverProvider.class);
    when(nojavascriptProvider.getProvidedCapabilities()).thenReturn(nojavascript);
    when(nojavascriptProvider.canCreateDriverInstances()).thenReturn(true);
    return nojavascriptProvider;
  }

}
