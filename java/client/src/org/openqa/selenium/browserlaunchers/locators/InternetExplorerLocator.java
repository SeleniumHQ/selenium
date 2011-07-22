package org.openqa.selenium.browserlaunchers.locators;

import org.openqa.selenium.os.WindowsUtils;

/**
 * Discovers a valid Internet Explorer installation on local system.
 */
public class InternetExplorerLocator extends SingleBrowserLocator {

    private static final String[] USUAL_WINDOWS_LAUNCHER_LOCATIONS = {
            WindowsUtils.getProgramFilesPath() + "\\Internet Explorer"
    };

    protected String browserName() {
        return "Internet Explorer";
    }

    protected String seleniumBrowserName() {
        return "iexplore";
    }

    protected String[] standardlauncherFilenames() {
        return new String[]{"iexplore.exe"};
    }

    protected String browserPathOverridePropertyName() {
        return "internetExplorerDefaultPath";
    }

    protected String[] usualLauncherLocations() {
        return WindowsUtils.thisIsWindows() ? USUAL_WINDOWS_LAUNCHER_LOCATIONS : new String[0];
    }
    
}
