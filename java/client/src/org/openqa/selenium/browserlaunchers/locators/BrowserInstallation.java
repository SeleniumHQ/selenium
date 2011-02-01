package org.openqa.selenium.browserlaunchers.locators;

/**
 * Encapsulate useful settings of a browser installation discovered with a {@link org.openqa.selenium.browserlaunchers.locators.BrowserLocator}
 */
public class BrowserInstallation {

    private final String launcherFilePath;
    private final String libraryPath;

    public BrowserInstallation(String launcherFilePath, String libraryPath) {
        this.launcherFilePath = launcherFilePath;
        this.libraryPath = libraryPath;
    }

    public String launcherFilePath() {
        return launcherFilePath;
    }

    public String libraryPath() {
        return libraryPath;
    }
    
}
