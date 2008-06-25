package org.openqa.selenium.server.browserlaunchers;

import org.openqa.selenium.server.RemoteControlConfiguration;

/**
 * {@link FirefoxCustomProfileLauncher} integration test class.
 */
public class FirefoxCustomProfileLauncherIntegrationTest extends LauncherFunctionalTestCase {

    public void testLauncherWithDefaultConfiguration() throws Exception {
        launchBrowser(new FirefoxCustomProfileLauncher(new RemoteControlConfiguration(), "CUSTFFCHROME"));
    }

    public void testLaunchTwoBrowsersInARowWithDefaultConfiguration() throws Exception {
        final RemoteControlConfiguration configuration = new RemoteControlConfiguration();

        launchBrowser(new FirefoxCustomProfileLauncher(configuration, "CUSTFFCHROME"));
        launchBrowser(new FirefoxCustomProfileLauncher(configuration, "CUSTFFCHROME"));
    }

}