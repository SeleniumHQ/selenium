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


package org.openqa.selenium.server;

import org.openqa.selenium.server.browserlaunchers.BrowserInstallationCache;

/**
 * Application Registry. Global object to find common objects and services.
 * <p/>
 * See http://martinfowler.com/eaaCatalog/registry.html
 */
public class ApplicationRegistry {

  private static ApplicationRegistry instance;
  private final BrowserInstallationCache browserInstallationCache;

  public ApplicationRegistry() {
    browserInstallationCache = new BrowserInstallationCache();
  }

  /**
   * Return the singleton instance.
   * 
   * @return The singleton instance. Never null.
   */
  public static ApplicationRegistry instance() {
    /*
     * In theory the is no guard against concurrent code and multiple instances could be created. In
     * practice this is not a problem, this scenario is unlikely and all registries would be
     * equivalent.
     */
    if (null == instance) {
      instance = new ApplicationRegistry();
    }
    return instance;
  }

  public BrowserInstallationCache browserInstallationCache() {
    return browserInstallationCache;
  }

}
