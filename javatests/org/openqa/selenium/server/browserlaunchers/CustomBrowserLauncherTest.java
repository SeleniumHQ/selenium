package org.openqa.selenium.server.browserlaunchers;

import static org.junit.Assert.assertFalse;

import org.junit.Test;
import org.openqa.selenium.Capabilities;
import org.openqa.selenium.server.BrowserConfigurationOptions;
import org.openqa.selenium.server.RemoteControlConfiguration;

public class CustomBrowserLauncherTest {

	@Test
	public void constructor_setsBrowserOptions() {
		BrowserConfigurationOptions browserOptions = new BrowserConfigurationOptions();
		RemoteControlConfiguration configuration = new RemoteControlConfiguration();
		CustomBrowserLauncher launcher = new CustomBrowserLauncher("command", "sessionId", configuration, browserOptions);

    Capabilities caps = launcher.browserConfigurationOptions.asCapabilities();
    assertFalse(BrowserOptions.isSingleWindow(caps));
	}
}
