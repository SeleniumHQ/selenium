package org.openqa.selenium.server.browserlaunchers;

import org.openqa.selenium.server.RemoteControlConfiguration;

/**
 * {@link FirefoxChromeLauncher} integration test class.
 */
public class FirefoxChromeLauncherIntegrationTest extends LauncherFunctionalTestCase {

    public void testLauncherWithDefaultConfiguration() throws Exception {
        launchBrowser(new FirefoxChromeLauncher(BrowserOptions.newBrowserOptions(), new RemoteControlConfiguration(), "CUSTFFCHROME", (String)null));
    }

    public void testLaunchTwoBrowsersInARowWithDefaultConfiguration() throws Exception {
        final RemoteControlConfiguration configuration = new RemoteControlConfiguration();

        launchBrowser(new FirefoxChromeLauncher(BrowserOptions.newBrowserOptions(), configuration, "CUSTFFCHROME", (String)null));
        launchBrowser(new FirefoxChromeLauncher(BrowserOptions.newBrowserOptions(), configuration, "CUSTFFCHROME", (String)null));
    }

}