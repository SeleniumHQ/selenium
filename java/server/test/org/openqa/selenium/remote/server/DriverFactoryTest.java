/*
Copyright 2007-2009 Selenium committers

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

package org.openqa.selenium.remote.server;

import org.junit.Before;
import org.junit.Test;
import org.openqa.selenium.Capabilities;
import org.openqa.selenium.Platform;
import org.openqa.selenium.StubDriver;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.remote.DesiredCapabilities;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertTrue;
import static org.junit.Assert.fail;

public class DriverFactoryTest {
  private DefaultDriverFactory factory;

  @Before
  public void setUp() throws Exception {
    factory = new DefaultDriverFactory();
  }

  @Test
  public void testShouldBeAbleToRegisterNewDrivers() {
    Capabilities capabilities = DesiredCapabilities.htmlUnit();
    assertFalse(factory.hasMappingFor(capabilities));

    factory.registerDriver(capabilities, DriverOne.class);

    assertTrue(factory.hasMappingFor(capabilities));
  }

  @Test
  public void testShouldReturnMatchIfOneFieldMatchesAndOnlyOneDriverIsRegistered() {
    DesiredCapabilities template = new DesiredCapabilities();
    template.setBrowserName("foo");
    template.setVersion("1.0");
    template.setPlatform(Platform.getCurrent());

    factory.registerDriver(template, DriverOne.class);

    DesiredCapabilities example = new DesiredCapabilities();
    example.setBrowserName(template.getBrowserName());
    Class<? extends WebDriver> result = factory.getBestMatchFor(example);

    assertEquals(DriverOne.class, result);
  }

  @Test
  public void testShouldReturnDriverWhereTheMostCapabilitiesMatch() {
    DesiredCapabilities first = new DesiredCapabilities();
    first.setBrowserName("foo");
    first.setVersion("1.0");

    DesiredCapabilities second = new DesiredCapabilities();
    second.setBrowserName("bar"); // Different name
    second.setVersion("1.0");

    factory.registerDriver(first, DriverOne.class);
    factory.registerDriver(second, DriverTwo.class);

    DesiredCapabilities example = new DesiredCapabilities();
    example.setBrowserName("foo");

    Class<? extends WebDriver> result = factory.getBestMatchFor(example);
    assertEquals(DriverOne.class, result);

    example.setBrowserName("bar");
    result = factory.getBestMatchFor(example);
    assertEquals(DriverTwo.class, result);
  }

  @Test
  public void testShouldReturnDriverWhereTheMostCapabilitiesMatch_lotsOfRegisteredDrivers() {
    abstract class Chrome implements WebDriver {}
    abstract class Firefox implements WebDriver {}
    abstract class HtmlUnit implements WebDriver {}
    abstract class Ie implements WebDriver {}
    abstract class Opera implements WebDriver {}

    factory.registerDriver(DesiredCapabilities.chrome(), Chrome.class);
    factory.registerDriver(DesiredCapabilities.firefox(), Firefox.class);
    factory.registerDriver(DesiredCapabilities.htmlUnit(), HtmlUnit.class);
    factory.registerDriver(DesiredCapabilities.internetExplorer(), Ie.class);
    factory.registerDriver(DesiredCapabilities.opera(), Opera.class);

    DesiredCapabilities desiredCapabilities = new DesiredCapabilities();
    desiredCapabilities.setBrowserName("internet explorer");
    desiredCapabilities.setVersion("");
    desiredCapabilities.setJavascriptEnabled(true);
    desiredCapabilities.setPlatform(Platform.ANY);

    assertEquals(Ie.class, factory.getBestMatchFor(desiredCapabilities));
  }

  @Test
  public void testShouldReturnMostRecentlyAddedDriverWhenAllCapabilitiesAreEqual() {
    Capabilities capabilities = DesiredCapabilities.firefox();

    factory.registerDriver(capabilities, DriverOne.class);
    factory.registerDriver(capabilities, DriverTwo.class);

    Class<? extends WebDriver> result = factory.getBestMatchFor(capabilities);

    assertEquals(DriverTwo.class, result);
  }

  @Test
  public void testShouldConsiderPlatform() {
    DesiredCapabilities windows = new DesiredCapabilities("browser", "v1", Platform.WINDOWS);
    DesiredCapabilities linux = new DesiredCapabilities("browser", "v1", Platform.LINUX);

    factory.registerDriver(windows, DriverOne.class);
    factory.registerDriver(linux, DriverTwo.class);

    assertEquals(DriverOne.class, factory.getBestMatchFor(windows));
    assertEquals(DriverTwo.class, factory.getBestMatchFor(linux));
  }

  @Test
  public void testShouldMatchAgainstAnyPlatformWhenRequestingAny() {
    DesiredCapabilities windowsVista = new DesiredCapabilities("browser", "v1", Platform.VISTA);
    DesiredCapabilities windowsXp = new DesiredCapabilities("browser", "v1", Platform.XP);
    DesiredCapabilities anyWindows = new DesiredCapabilities("browser", "v1", Platform.ANY);

    factory.registerDriver(windowsVista, DriverOne.class);

    assertEquals(DriverOne.class, factory.getBestMatchFor(windowsVista));
    assertEquals(DriverOne.class, factory.getBestMatchFor(anyWindows));
    assertEquals("Should always get a match if a driver has been registered",
        DriverOne.class, factory.getBestMatchFor(windowsXp));
  }

  @Test
  public void testShouldFailFastWhenMatchingAndNoDriversHaveBeenRegistered() {
    try {
      factory.getBestMatchFor(DesiredCapabilities.chrome());
      fail("Should have thrown.");
    } catch (IllegalStateException expected) {
    }
  }

  @Test
  public void testShouldConsiderJavascriptCapabilities() {
    DesiredCapabilities nojavascript = new DesiredCapabilities("browser", "v1", Platform.LINUX);
    nojavascript.setJavascriptEnabled(false);
    DesiredCapabilities javascript = new DesiredCapabilities("browser", "v1", Platform.LINUX);
    javascript.setJavascriptEnabled(true);

    factory.registerDriver(nojavascript, DriverOne.class);
    factory.registerDriver(javascript, DriverTwo.class);

    assertEquals(DriverOne.class, factory.getBestMatchFor(nojavascript));
    assertEquals(DriverTwo.class, factory.getBestMatchFor(javascript));
  }

  @Test
  public void testShouldCallAConstructorTakingACapabilitiesArgInPreferenceToANoArgOne() {
    DesiredCapabilities caps = new DesiredCapabilities();
    caps.setBrowserName("example");
    factory.registerDriver(caps, CapabilitiesDriver.class);

    CapabilitiesDriver driver = (CapabilitiesDriver) factory.newInstance(caps);

    assertEquals(caps, driver.getCapabilities());
  }

  public static abstract class DriverOne implements WebDriver {}
  public static abstract class DriverTwo implements WebDriver {}

  public static class CapabilitiesDriver extends StubDriver {
    private Capabilities caps;

    public CapabilitiesDriver() {
    }

    public CapabilitiesDriver(Capabilities caps) {
      this.caps = caps;
    }

    public Capabilities getCapabilities() {
      return caps;
    }
  }
}
