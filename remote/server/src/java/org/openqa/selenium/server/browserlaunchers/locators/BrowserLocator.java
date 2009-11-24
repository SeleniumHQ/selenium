package org.openqa.selenium.server.browserlaunchers.locators;

import org.openqa.selenium.server.browserlaunchers.BrowserInstallation;

/**
 * Discovers a valid browser installation on local system.
 */
public interface BrowserLocator {

    BrowserInstallation findBrowserLocationOrFail();

    BrowserInstallation retrieveValidInstallationPath(String customLauncherPath);
        
}
