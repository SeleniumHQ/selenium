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


package org.openqa.selenium.browserlaunchers.locators;

import org.junit.Test;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertTrue;

/**
 * {@link org.openqa.selenium.browserlaunchers.locators.Firefox3Locator} unit test class.
 */
public class Firefox3LocatorUnitTest {

  @Test
  public void testUsualLauncherLocationsOnWindows() {
    final Firefox3Locator locator;

    locator = new Firefox3Locator() {
      @Override
      protected boolean runningOnWindows() {
        return true;
      }
    };

    assertEquals(6, locator.usualLauncherLocations().length);
    assertTrue(locator.usualLauncherLocations()[0].endsWith("\\Firefox-3"));
    assertTrue(locator.usualLauncherLocations()[2].endsWith("\\Mozilla Firefox"));
    assertTrue(locator.usualLauncherLocations()[4].endsWith("\\Firefox"));
  }

  @Test
  public void testUsualLauncherLocationsOnOSX() {
    final Firefox3Locator locator;

    locator = new Firefox3Locator() {
      @Override
      protected boolean runningOnWindows() {
        return false;
      }

      @Override
      protected String[] firefoxDefaultLocationsOnUbuntu() {
        return new String[] {};
      }
    };

    assertEquals(2, locator.usualLauncherLocations().length);
    assertEquals("/Applications/Firefox-3.app/Contents/MacOS", locator.usualLauncherLocations()[0]);
    assertEquals("/Applications/Firefox.app/Contents/MacOS", locator.usualLauncherLocations()[1]);
  }

  @Test
  public void testUsualLauncherLocationsOnUbuntu() {
    final Firefox3Locator locator;

    locator = new Firefox3Locator() {
      @Override
      protected boolean runningOnWindows() {
        return false;
      }

      @Override
      protected String[] firefoxDefaultLocationsOnUbuntu() {
        return new String[] {"firefox-3.0.3"};
      }
    };

    assertEquals(1, locator.usualLauncherLocations().length);
    assertEquals("/usr/lib/firefox-3.0.3", locator.usualLauncherLocations()[0]);
  }
}
