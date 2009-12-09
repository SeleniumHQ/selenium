package org.openqa.selenium.server.browserlaunchers;

import static org.easymock.classextension.EasyMock.createStrictMock;
import static org.easymock.classextension.EasyMock.expectLastCall;
import static org.easymock.classextension.EasyMock.replay;
import static org.easymock.classextension.EasyMock.verify;
import org.junit.Test;
import org.openqa.selenium.server.BrowserConfigurationOptions;
import org.openqa.selenium.server.RemoteControlConfiguration;
import org.openqa.selenium.server.SeleniumServer;


public class SafariCustomProfileLauncherUnitTest {
	
	private AbstractBrowserLauncher launcher;
	private BrowserConfigurationOptions browserOptions = new BrowserConfigurationOptions();
	private RemoteControlConfiguration remoteConfiguration = new RemoteControlConfiguration();
	private SeleniumServer server;
	
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
			}
			
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
