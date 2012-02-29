// Copyright 2010 Google Inc. All Rights Reserved.
package org.openqa.selenium.firefox;

import static org.junit.Assert.assertTrue;

import org.junit.After;
import org.junit.Before;
import org.junit.Test;
import org.openqa.selenium.AbstractDriverTestCase;
import org.openqa.selenium.Platform;
import org.openqa.selenium.remote.CapabilityType;
import org.openqa.selenium.testing.JUnit4TestBase;
import org.openqa.selenium.testing.NeedsLocalEnvironment;

/**
 * If native events are enabled, make sure they work.
 * 
 * @author eran.mes@gmail.com (Eran Mes)
 */
@NeedsLocalEnvironment(reason = "Requires local browser launching environment")
public class NativeEventsTest extends JUnit4TestBase {
  private boolean testNativeEvents = false;
  private FirefoxDriver driver2;

  @Before
  public void setUp() throws Exception {
    testNativeEvents = FirefoxDriver.DEFAULT_ENABLE_NATIVE_EVENTS ||
        Platform.getCurrent().is(Platform.LINUX);
    if (testNativeEvents) {
      FirefoxProfile p = new FirefoxProfile();
      p.setEnableNativeEvents(true);
      driver2 = new FirefoxDriver(p);
    }
  }

  @After
  public void tearDown() throws Exception {
    if (driver2 != null) {
      driver2.quit();
    }
  }

  @Test
  public void nativeEventsCanBeEnabled() {
    if (driver2 == null) {
      return;
    }

    assertTrue("Native events were explicitly enabled and should be on.",
        (Boolean) driver2.getCapabilities().getCapability(CapabilityType.HAS_NATIVE_EVENTS));
  }
}
