package org.openqa.selenium.server.browserlaunchers;

import static org.junit.Assert.assertEquals;
import org.junit.Test;
import org.openqa.selenium.server.BrowserConfigurationOptions;
import org.openqa.selenium.server.RemoteControlConfiguration;

import java.io.File;

public class OperaCustomProfileLauncherUnitTest {

	@Test
	public void constructor_triesToFindBrowserLocationIfNullSpecified() throws Exception {
		RemoteControlConfiguration remoteConfiguration = new RemoteControlConfiguration();
		BrowserConfigurationOptions browserOptions = new BrowserConfigurationOptions();
		
		OperaCustomProfileLauncher launcher = new OperaCustomProfileLauncher(browserOptions, remoteConfiguration, "session", null) {
			@Override
			protected File locateBinaryInPath(String commandPath) {
				return null;
			}
			
			@Override
			protected String findBrowserLaunchLocation() {
				return "location";
			}
		};
		
		assertEquals("location", launcher.getCommandPath());
			
	}
}
