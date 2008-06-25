package org.openqa.selenium.server.browserlaunchers;

import org.openqa.selenium.server.RemoteControlConfiguration;

/**
 * {@link FirefoxChromeLauncher} integration test class.
 */
public class FirefoxChromeLauncherIntegrationTest extends LauncherFunctionalTestCase {

    public void testLauncherWithDefaultConfiguration() throws Exception {
        launchBrowser(new FirefoxChromeLauncher(new RemoteControlConfiguration(), "CUSTFFCHROME"));
    }

    public void testLaunchTwoBrowsersInARowWithDefaultConfiguration() throws Exception {
        final RemoteControlConfiguration configuration = new RemoteControlConfiguration();

        launchBrowser(new FirefoxChromeLauncher(configuration, "CUSTFFCHROME"));
        launchBrowser(new FirefoxChromeLauncher(configuration, "CUSTFFCHROME"));
    }

}