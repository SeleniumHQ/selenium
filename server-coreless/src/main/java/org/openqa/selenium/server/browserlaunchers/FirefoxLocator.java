package org.openqa.selenium.server.browserlaunchers;

import org.apache.commons.logging.Log;
import org.mortbay.log.LogFactory;

import java.io.File;

/**
 * Discovers a valid Firefox installation on local system.
 */
public abstract class FirefoxLocator {

    private static Log LOGGER = LogFactory.getLog(FirefoxLocator.class);

    public abstract String[] usualUNIXLauncherLocations();

    public abstract String[] usualWindowsLauncherLocations();

    public abstract String unixProgramName();

    public String windowsProgramName() {
        return "firefox.exe";
    }

    public String findBrowserLocationOrFail() {
        final String location;

        location = findBrowserLocation();
        if (null == location) {
            throw new RuntimeException(couldNotFindFirefoxMessage(unixProgramName()));
        }

        return location;
    }
    
    public String findBrowserLocation() {
        final String defaultLocation;

        LOGGER.debug("Discovering " + unixProgramName() + " ...");

        defaultLocation = findFirefoxAtADefaultLocation();
        if (null != defaultLocation) {
            return defaultLocation;
        }

        return findFirefoxInPath();
    }

    private String findFirefoxInPath() {
        final File unixLauncher;

        if (WindowsUtils.thisIsWindows()) {
            File firefoxEXE = AsyncExecute.whichExec(windowsProgramName());
            if (null != firefoxEXE) {
                return firefoxEXE.getAbsolutePath();
            }
            return null;
        }

        unixLauncher = AsyncExecute.whichExec(unixProgramName());
        if (unixLauncher != null) {
            LOGGER.debug("Discovered Firefox launcher in PATH at :'" + unixLauncher + "'");
            return unixLauncher.getAbsolutePath();
        }
        return null;
    }

    private String findFirefoxAtADefaultLocation() {
        final File defaultLocation;
        final String defaultPath;

        defaultPath = firefoxDefaultPath();
        if (null == defaultPath) {
            return null;
        }

        defaultLocation = new File(defaultPath);
        if (defaultLocation.exists()) {
            return defaultLocation.getAbsolutePath();
        }

        return null;        
    }

    private String firefoxDefaultPath() {
        final String userProvidedDefaultPath;

        userProvidedDefaultPath = System.getProperty("firefoxDefaultPath");
        if (null != userProvidedDefaultPath) {
            return userProvidedDefaultPath;
        }

        if (WindowsUtils.thisIsWindows()) {
            for (String location : usualWindowsLauncherLocations()) {
                final File launcher = new File(location + "\\" + windowsProgramName());
                LOGGER.debug("Attempting to discover Firefox launcher at :'" + launcher + "'");
                if (launcher.exists()) {
                    LOGGER.debug("Discovered Firefox launcher  :'" + launcher + "'");
                    return launcher.getAbsolutePath();
                }
            }
            return null;
        }

        for (String location : usualUNIXLauncherLocations()) {
            final File launcher = new File(location + "/" + unixProgramName());
            LOGGER.debug("Attempting to discover Firefox launcher at :'" + launcher + "'");
            if (launcher.exists()) {
                LOGGER.debug("Discovered Firefox launcher  :'" + launcher + "'");
                return launcher.getAbsolutePath();
            }
        }
        return null;
    }

    private String couldNotFindFirefoxMessage(String expectedProgramNames) {
        return "Firefox couldn't be found in the path!\n"
          + "Please add the directory containing '" + expectedProgramNames + "' to your PATH environment\n"
          + "variable, or explicitly specify a path to Firefox like this:\n"
          + "*firefox /blah/blah/firefox-bin";
    }

}
