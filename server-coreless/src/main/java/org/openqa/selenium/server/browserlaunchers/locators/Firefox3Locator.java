package org.openqa.selenium.server.browserlaunchers.locators;

import org.openqa.selenium.server.browserlaunchers.WindowsUtils;

import java.io.File;
import java.io.FilenameFilter;

/**
 * Discovers a valid Firefox 2.x or 3.x installation on local system. Preference is given to 2.x installs.
 */
public class Firefox3Locator extends FirefoxLocator {

    private static final String[] USUAL_OS_X_LAUNCHER_LOCATIONS = {
            "/Applications/Firefox-3.app/Contents/MacOS",
            "/Applications/Firefox.app/Contents/MacOS",
    };

    private static final String[] USUAL_WINDOWS_LAUNCHER_LOCATIONS = {
            WindowsUtils.getProgramFilesPath() + "\\Firefox-3",
            WindowsUtils.getProgramFilesPath() + "\\Mozilla Firefox",
            WindowsUtils.getProgramFilesPath() + "\\Firefox",
    };


    private String[] usualLauncherLocations;


    protected String browserName() {
        return "Firefox 3";
    }

    protected String seleniumBrowserName() {
        return "firefox3";
    }

    protected String[] standardlauncherFilenames() {
        if (runningOnWindows()) {
            return new String[]{"firefox.exe"};
        } else {
            return new String[]{"firefox-bin", "firefox"};
        }
    }

    protected synchronized String[] usualLauncherLocations() {
        if (null == usualLauncherLocations) {
            usualLauncherLocations = runningOnWindows() ? USUAL_WINDOWS_LAUNCHER_LOCATIONS : usualUnixLauncherLocations();
        }

        return usualLauncherLocations;
    }

    protected String[] usualUnixLauncherLocations() {
        final String[] ubuntuLocations;

        ubuntuLocations = firefoxDefaultLocationsOnUbuntu();
        return ubuntuLocations.length == 0 ? USUAL_OS_X_LAUNCHER_LOCATIONS : ubuntuLocations;
    }


    /**
     * Dynamic because the directory version number keep changing. 
     */
    protected String[] firefoxDefaultLocationsOnUbuntu() {
        final File dir;

        dir = new File("/usr/lib");

        if (!dir.exists() && dir.isDirectory()) {
            return new String[] {};
        }
        return dir.list(new FilenameFilter() {
            public boolean accept(File dir, String name) {
                return name.startsWith("firefox-");
            }
        });
    }

    protected boolean runningOnWindows() {
        return WindowsUtils.thisIsWindows();
    }
    
}