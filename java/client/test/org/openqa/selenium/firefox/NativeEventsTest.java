// Copyright 2010 Google Inc. All Rights Reserved.
package org.openqa.selenium.firefox;

import org.openqa.selenium.AbstractDriverTestCase;
import org.openqa.selenium.Platform;
import org.openqa.selenium.remote.CapabilityType;

/**
 * If native events are enabled, make sure they work.
 *
 * @author eran.mes@gmail.com (Eran Mes)
 */
public class NativeEventsTest extends AbstractDriverTestCase {
  private boolean testNativeEvents = false;
  private FirefoxDriver driver2;

  @Override
  protected void setUp() throws Exception {
    super.setUp();
    testNativeEvents = FirefoxDriver.DEFAULT_ENABLE_NATIVE_EVENTS ||
                       Platform.getCurrent().is(Platform.LINUX);
    if (testNativeEvents) {
      FirefoxProfile p = new FirefoxProfile();
      p.setEnableNativeEvents(true);
      driver2 = new FirefoxDriver(p);
    }
  }

  @Override
  protected void tearDown() throws Exception {
    super.tearDown();
    if (driver2 != null) {
      driver2.quit();
    }
  }

  public void testNativeEventsCanBeEnabled() {
    if (driver2 == null) {
      return;
    }

    assertTrue("Native events were explicitly enabled and should be on.",
        (Boolean) driver2.getCapabilities().getCapability(CapabilityType.HAS_NATIVE_EVENTS));
  }

  public void testNativeEventsAreNotOnByDefaultOnLinux() {
    if (Platform.getCurrent().is(Platform.LINUX)) {
      assertFalse("Native events should be off by default on Linux",
          FirefoxDriver.DEFAULT_ENABLE_NATIVE_EVENTS);
    }
  }
}
