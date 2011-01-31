package org.openqa.selenium.browserlaunchers.locators;

/**
 * Discovers a valid browser installation on local system.
 */
public interface BrowserLocator {

    BrowserInstallation findBrowserLocationOrFail();

    BrowserInstallation retrieveValidInstallationPath(String customLauncherPath);
        
}
