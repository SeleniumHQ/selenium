package org.openqa.selenium.server.browserlaunchers.locators;

import org.apache.commons.logging.Log;
import org.mortbay.log.LogFactory;
import org.openqa.selenium.server.browserlaunchers.AsyncExecute;
import org.openqa.selenium.server.browserlaunchers.WindowsUtils;
import org.openqa.selenium.server.browserlaunchers.LauncherUtils;

import java.io.File;

/**
 * Discovers a valid browser installation on local system.
 */
public abstract class BrowserLocator {

    private static final Log LOGGER = LogFactory.getLog(BrowserLocator.class);

    public String findBrowserLocationOrFail() {
        final String location;

        location = findBrowserLocation();
        if (null == location) {
            throw new RuntimeException(couldNotFindAnyInstallationMessage());
        }

        return location;
    }

    public String findBrowserLocation() {
        final String defaultPath;

        if (LOGGER.isDebugEnabled()) {
            LOGGER.debug("Discovering " + browserName() + "...");
        }
        defaultPath = findAtADefaultLocation();
        if (null != defaultPath) {
            return defaultPath;
        }

        return findInPath();
    }

    protected abstract String browserName();
    protected abstract String[] standardlauncherFilenames();
    protected abstract String seleniumBrowserName();
    protected abstract String browserPathOverridePropertyName();
    protected abstract String[] usualLauncherLocations();

    protected String findInPath() {
        for(String launcherFilename : standardlauncherFilenames()) {
            final String launcherPath;

            launcherPath = findFileInPath(launcherFilename);
            if (null != launcherPath) {
                return launcherPath; 
            }
        }
        return null;
    }

    protected String findAtADefaultLocation() {
        return retrieveValidInstallationPath(browserDefaultPath());
    }


    protected String browserDefaultPath() {
        final String userProvidedDefaultPath;

        userProvidedDefaultPath = System.getProperty(browserPathOverridePropertyName());
        if (null != userProvidedDefaultPath) {
            return userProvidedDefaultPath;
        }

        for (String location : usualLauncherLocations()) {
            for (String fileName : standardlauncherFilenames()) {
                final String validInstallationPath;

                validInstallationPath = retrieveValidInstallationPath(location, fileName);
                if (null != validInstallationPath) {
                    return validInstallationPath;
                }
            }
        }

        return null;
    }

    public String findFileInPath(String fileName) {
        return retrieveValidInstallationPath(AsyncExecute.whichExec(fileName));
    }

    protected String couldNotFindAnyInstallationMessage() {
        return browserName() + "couldn't be found in the path!\n" +
                "Please add the directory containing '" + humanFriendlyLauncherFileNames() + "' to your PATH environment\n" +
                "variable, or explicitly specify a path to " + browserName() + " like this:\n" +
                "*" + seleniumBrowserName() + fakeLauncherPath();
    }

    protected String fakeLauncherPath() {
        if (WindowsUtils.thisIsWindows()) {
            return "c:\\blah\\" + standardlauncherFilenames()[0];
        }
        return "/blah/blah/" + standardlauncherFilenames()[0];
    }

    protected String humanFriendlyLauncherFileNames() {
        final String[] fileNames;
        final StringBuffer buffer;

        fileNames = standardlauncherFilenames();
        if (0 == fileNames.length) {
          return "";
        } else if (1 == fileNames.length) {
            return "'" + fileNames[0] + "'";
        }

        buffer = new StringBuffer();
        for (String filename : fileNames) {
          buffer.append("'").append(filename).append("'");
          buffer.append(" or "); 
        }

        return buffer.substring(0, buffer.lastIndexOf(" or "));
    }

    protected String retrieveValidInstallationPath(String dirname, String fileName) {
        return retrieveValidInstallationPath(new File(dirname, fileName));
    }

    protected String retrieveValidInstallationPath(String launcher) {
        if (null == launcher) {
            return  null;
        }
        return retrieveValidInstallationPath(new File(launcher));
    }

    protected String retrieveValidInstallationPath(File launcher) {
        if (null == launcher) {
            return  null;
        }
        if (LOGGER.isDebugEnabled()) {
          LOGGER.debug("Checking whether " + browserName() + " launcher at :'" + launcher + "' is valid...");
        }
        if (!launcher.exists()) {
            return null;
        }

        if (LauncherUtils.isScriptFile(launcher)) {
            LOGGER.warn("Ignoring '" + launcher.getAbsolutePath() +"': file is a script file, not a real executable");
            return null;
        }
        if (LOGGER.isDebugEnabled()) {
            LOGGER.debug("Discovered valid " + browserName() + " launcher  : '" + launcher + "'");
        }

        return launcher.getAbsolutePath();
    }


}
