package org.openqa.selenium.server.browserlaunchers;

/**
 * Discovers a valid Firefox 2.x installation on local system.
 */
public class Firefox2Locator extends FirefoxLocator {

    private static final String[] USUAL_UNIX_LAUNCHER_LOCATIONS = {
            "/Applications/Firefox.app/Contents/MacOS",
            "/usr/lib/firefox", /* Ubuntu 7.x default location */
            "/Applications/Firefox-2.app/Contents/MacOS"
    };

    private static final String[] USUAL_WINDOWS_LAUNCHER_LOCATIONS = {
            WindowsUtils.getProgramFilesPath() + "\\Mozilla Firefox",
            WindowsUtils.getProgramFilesPath() + "\\Firefox",
            WindowsUtils.getProgramFilesPath() + "\\Firefox-2",
    };

    public String unixProgramName() {
        return "firefox-bin";
    }
    
    public String[] usualUNIXLauncherLocations() {
        return USUAL_UNIX_LAUNCHER_LOCATIONS;
    }

    public String[] usualWindowsLauncherLocations() {
        return USUAL_WINDOWS_LAUNCHER_LOCATIONS;
    }

}