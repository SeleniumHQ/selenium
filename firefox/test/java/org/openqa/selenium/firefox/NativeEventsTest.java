// Copyright 2010 Google Inc. All Rights Reserved.
package org.openqa.selenium.firefox;

import org.openqa.selenium.AbstractDriverTestCase;
import org.openqa.selenium.By;
import org.openqa.selenium.Keys;
import org.openqa.selenium.Platform;
import org.openqa.selenium.WebElement;

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

  public void testSwitchingElementsUsingKeyboardWorks() {
    if (driver2 == null) {
      return;
    }

    assertTrue("Native events were explicitly enabeld and should be on.",
        (Boolean) driver2.getCapabilities().getCapability("nativeEvents"));

    if (Platform.getCurrent().is(Platform.LINUX)) {
      assertFalse("Native events should be off by default on Linux",
          (Boolean) ((FirefoxDriver) driver).getCapabilities().getCapability("nativeEvents"));
    }
  }
}
