package org.openqa.selenium.server.browserlaunchers;

import org.openqa.selenium.server.RemoteControlConfiguration;

/**
 * {@link Firefox2Launcher} integration test class.
 */
public class Firefox2LauncherFunctionalTest extends LauncherFunctionalTestCase {

    public void testLauncherWithDefaultConfiguration() throws Exception {
        launchBrowser(new Firefox2Launcher(BrowserOptions.newBrowserOptions(), new RemoteControlConfiguration(), "CUSTFFCHROME", null));
    }

    public void testLaunchTwoBrowsersInARowWithDefaultConfiguration() throws Exception {
        final RemoteControlConfiguration configuration = new RemoteControlConfiguration();

        launchBrowser(new Firefox2Launcher(BrowserOptions.newBrowserOptions(), configuration, "CUSTFFCHROME", null));
        launchBrowser(new Firefox2Launcher(BrowserOptions.newBrowserOptions(), configuration, "CUSTFFCHROME", null));
    }


}