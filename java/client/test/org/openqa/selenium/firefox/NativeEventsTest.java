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
