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


package org.openqa.selenium.server.browserlaunchers;

import org.junit.Test;
import org.openqa.selenium.browserlaunchers.locators.BrowserInstallation;
import org.openqa.selenium.browserlaunchers.locators.BrowserLocator;

import static org.junit.Assert.assertEquals;

/**
 * {@link BrowserInstallationCache} unit test class.
 */
public class BrowserLocationCacheUnitTest {

  @Test
  public void tesCacheKeyIsTheBrowserStringWhenNoCustomPathIsProvided() {
    assertEquals("*aBrowser", new BrowserInstallationCache().cacheKey("*aBrowser", null));
  }

  @Test
  public void testCacaheIsTheBrowserStringConcatenatedWithCustomPathWhenCustomPathIsProvided() {
    assertEquals("*aBrowseraCustomPath",
        new BrowserInstallationCache().cacheKey("*aBrowser", "aCustomPath"));
  }

  @Test
  public void testLocateBrowserInstallationUseLocatorWhenCacheIsEmpty() {
    final BrowserInstallation expectedInstallation;
    final BrowserLocator locator;

    expectedInstallation = new BrowserInstallation(null, null);
    locator = new BrowserLocator() {

      public BrowserInstallation findBrowserLocationOrFail() {
        return expectedInstallation;
      }

      public BrowserInstallation retrieveValidInstallationPath(String customLauncherPath) {
        throw new UnsupportedOperationException();
      }

    };

    assertEquals(expectedInstallation,
        new BrowserInstallationCache().locateBrowserInstallation("aBrowser", null, locator));
  }

  @Test
  public void testLocateBrowserInstallationUseCacheOnSecondAccess() {
    final BrowserInstallation expectedInstallation;
    final BrowserInstallationCache cache;
    final BrowserLocator locator;

    expectedInstallation = new BrowserInstallation(null, null);
    locator = new BrowserLocator() {

      public BrowserInstallation findBrowserLocationOrFail() {
        return expectedInstallation;
      }

      public BrowserInstallation retrieveValidInstallationPath(String customLauncherPath) {
        throw new UnsupportedOperationException();
      }
    };

    cache = new BrowserInstallationCache();
    cache.locateBrowserInstallation("aBrowser", null, locator);
    assertEquals(expectedInstallation, cache.locateBrowserInstallation("aBrowser", null, null));
  }

  @Test
  public void testLocateBrowserInstallationUseLocatorWhenCacheIsEmptyAndACustomPathIsProvided() {
    final BrowserInstallation expectedInstallation;
    final BrowserLocator locator;

    expectedInstallation = new BrowserInstallation(null, null);
    locator = new BrowserLocator() {

      public BrowserInstallation findBrowserLocationOrFail() {
        throw new UnsupportedOperationException();
      }

      public BrowserInstallation retrieveValidInstallationPath(String customLauncherPath) {
        if ("aCustomLauncher".equals(customLauncherPath)) {
          return expectedInstallation;
        }
        throw new UnsupportedOperationException(customLauncherPath);
      }

    };

    assertEquals(expectedInstallation,
        new BrowserInstallationCache().locateBrowserInstallation("aBrowser", "aCustomLauncher",
            locator));
  }

  @Test
  public void testLocateBrowserInstallationUseCacheOnSecondAccessWhenCustomLauncherIsProvided() {
    final BrowserInstallation expectedInstallation;
    final BrowserInstallationCache cache;
    final BrowserLocator locator;

    expectedInstallation = new BrowserInstallation(null, null);
    locator = new BrowserLocator() {

      public BrowserInstallation findBrowserLocationOrFail() {
        throw new UnsupportedOperationException();
      }

      public BrowserInstallation retrieveValidInstallationPath(String customLauncherPath) {
        if ("aCustomLauncher".equals(customLauncherPath)) {
          return expectedInstallation;
        }
        throw new UnsupportedOperationException(customLauncherPath);
      }
    };

    cache = new BrowserInstallationCache();
    cache.locateBrowserInstallation("aBrowser", "aCustomLauncher", locator);
    assertEquals(expectedInstallation,
        cache.locateBrowserInstallation("aBrowser", "aCustomLauncher", null));
  }

}
