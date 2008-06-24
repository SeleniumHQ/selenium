package org.openqa.selenium.server.browserlaunchers.locators;

import org.openqa.selenium.server.browserlaunchers.WindowsUtils;

/**
 * Discovers a valid Internet Explorer installation on local system.
 */
public class SafariLocator extends BrowserLocator {

    private static final String DEFAULT_LOCATION = "/Applications/Safari.app/Contents/MacOS/Safari";

    protected String browserName() {
        return "Safari";
    }

    protected String launcherFilename() {
        return WindowsUtils.thisIsWindows()? "Safari.exe": "Safari";
    }
    
    protected String browserDefaultPath() {
        final String userProvidedDefaultPath;

        userProvidedDefaultPath = System.getProperty("SafariDefaultPath");
        if (null != userProvidedDefaultPath) {
            return userProvidedDefaultPath;
        }

        if (WindowsUtils.thisIsWindows()) {
            return WindowsUtils.getProgramFilesPath() + "\\Safari\\Safari.exe";
        }

        return DEFAULT_LOCATION;
    }    

    protected String couldNotFindAnyInstallationMessage() {
        return "Safari couldn't be found in the path!\n" +
                "Please add the directory containing 'Safari' to your PATH environment\n" +
                "variable, or explicitly specify a path to Safari like this:\n" +
                "*Safari /blah/blah/Safari";
    }
    
}
