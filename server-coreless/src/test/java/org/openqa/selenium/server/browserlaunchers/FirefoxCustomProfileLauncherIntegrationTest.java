package org.openqa.selenium.server.browserlaunchers;

import org.openqa.selenium.server.BrowserConfigurationOptions;
import org.openqa.selenium.server.RemoteControlConfiguration;

/**
 * {@link FirefoxCustomProfileLauncher} integration test class.
 */
public class FirefoxCustomProfileLauncherIntegrationTest extends LauncherFunctionalTestCase {

    public void testLauncherWithDefaultConfiguration() throws Exception {
        launchBrowser(new FirefoxCustomProfileLauncher(new BrowserConfigurationOptions(), new RemoteControlConfiguration(), "CUSTFFCHROME", (String) null));
    }

    public void testLaunchTwoBrowsersInARowWithDefaultConfiguration() throws Exception {
        final RemoteControlConfiguration configuration = new RemoteControlConfiguration();

        launchBrowser(new FirefoxCustomProfileLauncher(new BrowserConfigurationOptions(), configuration, "CUSTFFCHROME", (String) null));
        launchBrowser(new FirefoxCustomProfileLauncher(new BrowserConfigurationOptions(), configuration, "CUSTFFCHROME", (String) null));
    }

}