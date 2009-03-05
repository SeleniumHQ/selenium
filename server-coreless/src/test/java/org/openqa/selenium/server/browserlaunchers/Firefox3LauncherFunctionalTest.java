package org.openqa.selenium.server.browserlaunchers;

import org.openqa.selenium.server.BrowserConfigurationOptions;
import org.openqa.selenium.server.RemoteControlConfiguration;

/**
 * {@link org.openqa.selenium.server.browserlaunchers.Firefox3Launcher} integration test class.
 */
public class Firefox3LauncherFunctionalTest extends LauncherFunctionalTestCase {

    public void testLauncherWithDefaultConfiguration() throws Exception {
        launchBrowser(new Firefox3Launcher(new BrowserConfigurationOptions(), new RemoteControlConfiguration(), "CUSTFFCHROME", null));
    }

    public void testLaunchTwoBrowsersInARowWithDefaultConfiguration() throws Exception {
        final RemoteControlConfiguration configuration = new RemoteControlConfiguration();

        launchBrowser(new Firefox3Launcher(new BrowserConfigurationOptions(), configuration, "CUSTFFCHROME", null));
        launchBrowser(new Firefox3Launcher(new BrowserConfigurationOptions(), configuration, "CUSTFFCHROME", null));
    }

}