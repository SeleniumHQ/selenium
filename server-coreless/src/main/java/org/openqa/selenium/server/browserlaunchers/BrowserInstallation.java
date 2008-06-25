package org.openqa.selenium.server.browserlaunchers;

/**
 * Encapsulate useful settings of a browser installation discovered with a {@link org.openqa.selenium.server.browserlaunchers.locators.BrowserLocator}
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
