package org.openqa.selenium.browserlaunchers.locators;

import org.openqa.selenium.internal.Trace;
import org.openqa.selenium.internal.TraceFactory;

/**
 * Discovers a valid Firefox installation on local system.
 */
public class CombinedFirefoxLocator implements BrowserLocator {

  private static Trace LOGGER = TraceFactory.getTrace(CombinedFirefoxLocator.class);

  public BrowserInstallation findBrowserLocationOrFail() {
      LOGGER.debug("Discovering Firefox 2...");
      final BrowserInstallation firefox2Location = new Firefox2Locator().findBrowserLocation();
      if (null != firefox2Location) {
          return firefox2Location;
      }

      LOGGER.debug("Did not find Firefox 2, now discovering Firefox 3...");
      final BrowserInstallation firefox3Location = new Firefox3Locator().findBrowserLocation();
      if (null != firefox3Location) {
          return firefox3Location;
      }

      LOGGER.debug("Did not find Firefox 3, now searching PATH...");
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