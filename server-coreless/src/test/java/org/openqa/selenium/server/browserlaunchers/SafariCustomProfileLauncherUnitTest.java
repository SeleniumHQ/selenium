package org.openqa.selenium.server.browserlaunchers;

import org.junit.Test;
import org.openqa.selenium.server.BrowserConfigurationOptions;
import org.openqa.selenium.server.RemoteControlConfiguration;
import org.openqa.selenium.server.SeleniumServer;

import static org.easymock.classextension.EasyMock.*;


public class SafariCustomProfileLauncherUnitTest {
	
	AbstractBrowserLauncher launcher;
	BrowserConfigurationOptions browserOptions = new BrowserConfigurationOptions();
	RemoteControlConfiguration remoteConfiguration = new RemoteControlConfiguration();
	SeleniumServer server;
	
	@Test(expected=InvalidBrowserExecutableException.class)
	public void constructor_invalidBrowserInstallationCausesException() throws Exception {
		launcher = new SafariCustomProfileLauncher(browserOptions, remoteConfiguration, "session", "invalid");
	}
	
	@Test
	public void launchRemoteSession_generatesSslCertsIfBrowserSideLogEnabled() throws Exception {
		String location = null;
		
		server = createStrictMock(SeleniumServer.class);
		server.generateSSLCertsForLoggingHosts();
		expectLastCall().once();
		
		remoteConfiguration.setSeleniumServer(server);
		browserOptions.set("browserSideLog", true);
		
		launcher = new SafariCustomProfileLauncher(browserOptions, remoteConfiguration, "session", location) {
			@Override
			protected void launch(String url) {
			};
			
			@Override
			protected BrowserInstallation locateSafari(String location) {
					return new BrowserInstallation("", "");
			}
		};
		
		replay(server);
		launcher.launchRemoteSession("http://url");
		verify(server);
	}
	
}
