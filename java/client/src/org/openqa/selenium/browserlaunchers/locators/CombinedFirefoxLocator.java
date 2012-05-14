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

import java.util.logging.Logger;

/**
 * Discovers a valid Firefox installation on local system.
 */
public class CombinedFirefoxLocator implements BrowserLocator {

  private static Logger LOGGER = Logger.getLogger(CombinedFirefoxLocator.class.getName());

  public BrowserInstallation findBrowserLocationOrFail() {
    LOGGER.fine("Discovering Firefox 2...");
    final BrowserInstallation firefox2Location = new Firefox2Locator().findBrowserLocation();
    if (null != firefox2Location) {
      return firefox2Location;
    }

    LOGGER.fine("Did not find Firefox 2, now discovering Firefox 3...");
    final BrowserInstallation firefox3Location = new Firefox3Locator().findBrowserLocation();
    if (null != firefox3Location) {
      return firefox3Location;
    }

    LOGGER.fine("Did not find Firefox 3, now searching PATH...");
    final BrowserInstallation firefoxPathLocation = new FirefoxPathLocator().findBrowserLocation();
    if (null != firefoxPathLocation) {
      return firefoxPathLocation;
    }

    throw new RuntimeException(couldNotFindFirefoxMessage());
  }

  public BrowserInstallation retrieveValidInstallationPath(String customLauncherPath) {
    return new Firefox3Locator().retrieveValidInstallationPath(customLauncherPath);
  }

  private String couldNotFindFirefoxMessage() {
    return new Firefox3Locator().couldNotFindAnyInstallationMessage();
  }
}
