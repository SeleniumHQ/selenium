package org.openqa.selenium.server.browserlaunchers.locators;

import org.openqa.selenium.server.browserlaunchers.WindowsUtils;

/**
 * Discovers a valid Firefox 2.x or 3.x installation on local system. Preference is given to 2.x installs.
 */
public class Firefox3Locator extends FirefoxLocator {

    private static final String[] USUAL_UNIX_LAUNCHER_LOCATIONS = {
            "/Applications/Firefox.app/Contents/MacOS",
            "/usr/lib/firefox-3.0", /* Ubuntu 8.x default location */
            "/Applications/Firefox-3.app/Contents/MacOS",
    };

    private static final String[] USUAL_WINDOWS_LAUNCHER_LOCATIONS = {
            WindowsUtils.getProgramFilesPath() + "\\Mozilla Firefox",
            WindowsUtils.getProgramFilesPath() + "\\Firefox",
            WindowsUtils.getProgramFilesPath() + "\\Firefox-3",
    };

    public String unixProgramName() {
        return "firefox";
    }

    public String[] usualUNIXLauncherLocations() {
        return USUAL_UNIX_LAUNCHER_LOCATIONS;
    }

    public String[] usualWindowsLauncherLocations() {
        return USUAL_WINDOWS_LAUNCHER_LOCATIONS;
    }

}