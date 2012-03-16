// Copyright 2010 Google Inc. All Rights Reserved.
package org.openqa.selenium.firefox;

import static org.junit.Assert.assertTrue;

import org.junit.After;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.openqa.selenium.remote.CapabilityType;
import org.openqa.selenium.testing.NativeEventsRequired;
import org.openqa.selenium.testing.NeedsLocalEnvironment;
import org.openqa.selenium.testing.SeleniumTestRunner;

/**
 * If native events are enabled, make sure they work.
 * 
 * @author eran.mes@gmail.com (Eran Mes)
 */
@NeedsLocalEnvironment(reason = "Requires local browser launching environment")
@NativeEventsRequired
@RunWith(SeleniumTestRunner.class)
public class NativeEventsTest {
  private FirefoxDriver driver2;

  @After
  public void tearDown() throws Exception {
    if (driver2 != null) {
      driver2.quit();
    }
  }

  @Test
  public void nativeEventsCanBeEnabled() {
    FirefoxProfile p = new FirefoxProfile();
    p.setEnableNativeEvents(true);
    driver2 = new FirefoxDriver(p);

    assertTrue("Native events were explicitly enabled and should be on.",
        (Boolean) driver2.getCapabilities().getCapability(
            CapabilityType.HAS_NATIVE_EVENTS));
  }
}
