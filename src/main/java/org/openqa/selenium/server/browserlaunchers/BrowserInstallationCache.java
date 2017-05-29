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

import org.openqa.selenium.browserlaunchers.locators.BrowserInstallation;
import org.openqa.selenium.browserlaunchers.locators.BrowserLocator;

import java.util.HashMap;
import java.util.Map;

/**
 * Cache browser installation corresponding to a spefic browser string and launcher location.
 */
public class BrowserInstallationCache {

  private final Map<String, BrowserInstallation> cache;

  public BrowserInstallationCache() {
    this.cache = new HashMap<String, BrowserInstallation>(5);
  }

  public BrowserInstallation locateBrowserInstallation(String browserName,
      String customLauncherPath, BrowserLocator locator) {
    final String cacheKey;

    cacheKey = cacheKey(browserName, customLauncherPath);
    synchronized (cache) {
      if (null == cache.get(cacheKey)) {
        if (null == customLauncherPath) {
          cache.put(cacheKey, locator.findBrowserLocationOrFail());
        } else {
          cache.put(cacheKey, locator.retrieveValidInstallationPath(customLauncherPath));
        }
      }
      return cache.get(cacheKey);
    }
  }

  protected String cacheKey(String browserString, String customLauncherPath) {
    return (null == customLauncherPath) ? browserString : browserString + customLauncherPath;
  }


}
