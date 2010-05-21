package org.openqa.selenium.server.browserlaunchers.locators;

import org.apache.commons.logging.Log;
import org.openqa.jetty.log.LogFactory;
import org.openqa.selenium.browserlaunchers.WindowsUtils;
import org.openqa.selenium.server.browserlaunchers.*;

import java.io.File;

/**
 * Discovers a valid browser installation on local system.
 */
public abstract class SingleBrowserLocator implements BrowserLocator {

    private static final Log LOGGER = LogFactory.getLog(BrowserLocator.class);

    public BrowserInstallation findBrowserLocationOrFail() {
        final BrowserInstallation location;

        location = findBrowserLocation();
        if (null == location) {
            throw new RuntimeException(couldNotFindAnyInstallationMessage());
        }

        return location;
    }

    public BrowserInstallation findBrowserLocation() {
        final BrowserInstallation defaultPath;

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

    protected BrowserInstallation findInPath() {
        for(String launcherFilename : standardlauncherFilenames()) {
            final BrowserInstallation launcherPath;

            launcherPath = findFileInPath(launcherFilename);
            if (null != launcherPath) {
                return launcherPath;
            }
        }
        return null;
    }

    protected BrowserInstallation findAtADefaultLocation() {
        return browserDefaultPath();
    }


    protected BrowserInstallation browserDefaultPath() {
        final String userProvidedDefaultPath;

        userProvidedDefaultPath = System.getProperty(browserPathOverridePropertyName());
        if (null != userProvidedDefaultPath) {
            return retrieveValidInstallationPath(userProvidedDefaultPath);
        }

        for (String location : usualLauncherLocations()) {
            for (String fileName : standardlauncherFilenames()) {
                final BrowserInstallation validInstallationPath;

                validInstallationPath = retrieveValidInstallationPath(location, fileName);
                if (null != validInstallationPath) {
                    return validInstallationPath;
                }
            }
        }

        return null;
    }

    public BrowserInstallation findFileInPath(String fileName) {
        return retrieveValidInstallationPath(AsyncExecute.whichExec(fileName));
    }

    protected String couldNotFindAnyInstallationMessage() {
        return browserName() + " could not be found in the path!\n" +
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

    protected BrowserInstallation retrieveValidInstallationPath(String dirname, String fileName) {
        return retrieveValidInstallationPath(new File(dirname, fileName));
    }

    public BrowserInstallation retrieveValidInstallationPath(String launcher) {
        if (null == launcher) {
            return  null;
        }
        return retrieveValidInstallationPath(new File(launcher));
    }

    protected BrowserInstallation retrieveValidInstallationPath(File launcher) {
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
            LOGGER.warn("Caution: '" + launcher.getAbsolutePath() +"': file is a script file, not a real executable.  The browser environment is no longer fully under RC control");
        }

        if (LOGGER.isDebugEnabled()) {
            LOGGER.debug("Discovered valid " + browserName() + " launcher  : '" + launcher + "'");
        }


        return new BrowserInstallation(launcher.getAbsolutePath(), computeLibraryPath(launcher));
    }


    public String computeLibraryPath(File launcherPath) {
        final String libraryPathEnvironmentVariable;
        final String currentLibraryPath;

        if (WindowsUtils.thisIsWindows()) {
            return null;
        }
        libraryPathEnvironmentVariable = SystemUtils.libraryPathEnvironmentVariable();
        currentLibraryPath = WindowsUtils.loadEnvironment().getProperty(libraryPathEnvironmentVariable);

        return currentLibraryPath + File.pathSeparator + launcherPath.getParent();
    }

}
