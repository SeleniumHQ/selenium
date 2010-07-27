package org.openqa.selenium.server.browserlaunchers;

import org.junit.Test;
import org.openqa.selenium.server.BrowserConfigurationOptions;
import org.openqa.selenium.server.RemoteControlConfiguration;

import static org.junit.Assert.assertNotNull;

public class CustomBrowserLauncherTest {

	@Test
	public void constructor_setsBrowserOptions() {
		BrowserConfigurationOptions browserOptions = new BrowserConfigurationOptions();
		RemoteControlConfiguration configuration = new RemoteControlConfiguration();
		CustomBrowserLauncher launcher = new CustomBrowserLauncher("command", "sessionId", configuration, browserOptions);
		assertNotNull(launcher.browserConfigurationOptions.isSingleWindow());
	}
}
