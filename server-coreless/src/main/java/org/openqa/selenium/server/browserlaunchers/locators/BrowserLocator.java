package org.openqa.selenium.server.browserlaunchers.locators;

import org.apache.commons.logging.Log;
import org.mortbay.log.LogFactory;
import org.openqa.selenium.server.browserlaunchers.AsyncExecute;

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

        LOGGER.debug("Discovering " + browserName() + "...");
        defaultPath = findAtADefaultLocation();
        if (null != defaultPath) {
            return defaultPath;
        }

        return findInPath();
    }

    protected String findInPath() {
        return findFileInPath(launcherFilename());
    }


    protected String findAtADefaultLocation() {
        final File defaultLocation;
        final String defaultPath;

        defaultPath = browserDefaultPath();
        if (null == defaultPath) {
            return null;
        }

        defaultLocation = new File(defaultPath);
        if (defaultLocation.exists()) {
            return defaultLocation.getAbsolutePath();
        }

        return null;
    }

    
    public String findFileInPath(String fileName) {
        final File theFile;

        theFile = AsyncExecute.whichExec(fileName);
        if (null != theFile) {
            return theFile.getAbsolutePath();
        }

        return null;
    }
    
    protected abstract String browserName();
    protected abstract String launcherFilename();
    protected abstract String browserDefaultPath();
    protected abstract String couldNotFindAnyInstallationMessage();
}
