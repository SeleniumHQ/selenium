package org.openqa.selenium.server.browserlaunchers.locators;

import org.openqa.selenium.server.browserlaunchers.WindowsUtils;

import java.io.File;

/**
 * Discovers a valid Internet Explorer installation on local system.
 */
public class InternetExplorerLocator extends BrowserLocator{

    protected String browserName() {
        return "Internet Explorer";
    }

    protected String launcherFilename() {
        return "iexplore.exe";
    }

    protected String browserDefaultPath() {
        final String userProvidedDefaultPath;

        userProvidedDefaultPath = System.getProperty("internetExplorerDefaultPath");
        if (null != userProvidedDefaultPath) {
            return userProvidedDefaultPath;
        }

        return WindowsUtils.getProgramFilesPath() + "\\Internet Explorer\\iexplore.exe";
    }

    protected String couldNotFindAnyInstallationMessage() {
        return "Internet Explorer couldn't be found in the path!\n" +
                "Please add the directory containing iexplore.exe to your PATH environment\n" +
                "variable, or explicitly specify a path to IE like this:\n" +
                "*iexplore c:\\blah\\iexplore.exe";
    }

}
