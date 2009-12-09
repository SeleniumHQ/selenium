package org.openqa.selenium.server.browserlaunchers;
import static org.junit.Assert.*;

import org.junit.Test;
import org.openqa.selenium.server.RemoteControlConfiguration;

import org.openqa.selenium.server.BrowserConfigurationOptions;

public class CustomBrowserLauncherTest {

	@Test
	public void constructor_setsBrowserOptions() {
		BrowserConfigurationOptions browserOptions = new BrowserConfigurationOptions();
		RemoteControlConfiguration configuration = new RemoteControlConfiguration();
		CustomBrowserLauncher launcher = new CustomBrowserLauncher("command", "sessionId", configuration, browserOptions);
		assertNotNull(launcher.browserConfigurationOptions.isSingleWindow());
	}
}
