package org.openqa.selenium.server.browserlaunchers.locators;

import org.openqa.selenium.server.browserlaunchers.WindowsUtils;

/**
 * Discovers a valid Firefox 2.x or 3.x installation on local system. Preference is given to 2.x installs.
 */
public class Firefox3Locator extends FirefoxLocator {

    private static final String[] USUAL_UNIX_LAUNCHER_LOCATIONS = {
            "/Applications/Firefox-3.app/Contents/MacOS",
            "/Applications/Firefox.app/Contents/MacOS",
            "/usr/lib/firefox-3.0", /* Ubuntu 8.x default location */
    };

    private static final String[] USUAL_WINDOWS_LAUNCHER_LOCATIONS = {
            WindowsUtils.getProgramFilesPath() + "\\Firefox-3",
            WindowsUtils.getProgramFilesPath() + "\\Mozilla Firefox",
            WindowsUtils.getProgramFilesPath() + "\\Firefox",
    };

    protected String browserName() {
        return "Firefox 3";
    }

    protected String seleniumBrowserName() {
        return "firefox3";
    }

    protected String[] standardlauncherFilenames() {
        if (WindowsUtils.thisIsWindows()) {
            return new String[]{"firefox.exe"};
        } else {
            return new String[]{"firefox-bin", "firefox"};
        }
    }
    
    protected String[] usualLauncherLocations() {
        return WindowsUtils.thisIsWindows() ? USUAL_WINDOWS_LAUNCHER_LOCATIONS : USUAL_UNIX_LAUNCHER_LOCATIONS;
    }

}