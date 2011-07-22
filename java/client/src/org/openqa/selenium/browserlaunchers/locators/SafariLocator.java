package org.openqa.selenium.browserlaunchers.locators;

import org.openqa.selenium.os.WindowsUtils;

/**
 * Discovers a valid Internet Explorer installation on local system.
 */
public class SafariLocator extends SingleBrowserLocator {

    private static final String[] USUAL_UNIX_LAUNCHER_LOCATIONS = {
            "/Applications/Safari.app/Contents/MacOS",
    };

    private static final String[] USUAL_WINDOWS_LAUNCHER_LOCATIONS = {
            WindowsUtils.getProgramFilesPath() + "\\Safari"
    };

    protected String browserName() {
        return "Safari";
    }

    protected String seleniumBrowserName() {
        return "safari";
    }

    protected String[] standardlauncherFilenames() {
        if (WindowsUtils.thisIsWindows()) {
            return new String[]{"Safari.exe"};
        } else {
            return new String[]{"Safari"};
        }
    }

    protected String browserPathOverridePropertyName() {
        return "SafariDefaultPath";
    }

    protected String[] usualLauncherLocations() {
        return WindowsUtils.thisIsWindows() ? USUAL_WINDOWS_LAUNCHER_LOCATIONS : USUAL_UNIX_LAUNCHER_LOCATIONS;
    }

}
