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

/**
 * {@link org.openqa.selenium.server.browserlaunchers.AbstractBrowserLauncher} unit test class.
 */
public class SingleBrowserLocatorUnitTest {

  @Test
  public void testHumanFriendlyLauncherFileNamesReturnsEmptyStringWhenThereIsNoStandardFileNames() {
    final SingleBrowserLocator locator;

    locator = new SingleBrowserLocator() {
      @Override
      protected String[] standardlauncherFilenames() {
        return new String[0];
      }

      @Override
      protected String browserName() {
        return null;
      }

      @Override
      protected String seleniumBrowserName() {
        return null;
      }

      @Override
      protected String browserPathOverridePropertyName() {
        return null;
      }

      @Override
      protected String[] usualLauncherLocations() {
        return new String[0];
      }

    };
    assertEquals("", locator.humanFriendlyLauncherFileNames());
  }

  @Test
  public void testHumanFriendlyLauncherFileNamesReturnsQuotedFileNameWhenThereIsASingleFileName() {
    final SingleBrowserLocator locator;

    locator = new SingleBrowserLocator() {

      @Override
      protected String[] standardlauncherFilenames() {
        return new String[] {"a-single-browser"};
      }

      @Override
      protected String browserName() {
        return null;
      }

      @Override
      protected String seleniumBrowserName() {
        return null;
      }

      @Override
      protected String browserPathOverridePropertyName() {
        return null;
      }

      @Override
      protected String[] usualLauncherLocations() {
        return new String[0];
      }

    };
    assertEquals("'a-single-browser'", locator.humanFriendlyLauncherFileNames());
  }

  @Test
  public void testHumanFriendlyLauncherFileNamesReturnsAllFileNamesOrSeperatedWhenThereIsMoreThanOneFileName() {
    final SingleBrowserLocator locator;

    locator = new SingleBrowserLocator() {

      @Override
      protected String[] standardlauncherFilenames() {
        return new String[] {"a-browser", "another-one"};
      }

      @Override
      protected String browserName() {
        return null;
      }

      @Override
      protected String seleniumBrowserName() {
        return null;
      }

      @Override
      protected String browserPathOverridePropertyName() {
        return null;
      }

      @Override
      protected String[] usualLauncherLocations() {
        return new String[0];
      }

    };
    assertEquals("'a-browser' or 'another-one'", locator.humanFriendlyLauncherFileNames());
  }

}
