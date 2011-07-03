package org.openqa.grid.e2e.wd;

import java.net.URL;

import org.openqa.grid.common.GridRole;
import org.openqa.grid.e2e.utils.GridTestHelper;
import org.openqa.grid.e2e.utils.RegistryTestHelper;
import org.openqa.grid.internal.utils.GridHubConfiguration;
import org.openqa.grid.internal.utils.SelfRegisteringRemote;
import org.openqa.grid.web.Hub;
import org.openqa.selenium.WebDriverException;
import org.openqa.selenium.net.PortProber;
import org.openqa.selenium.remote.DesiredCapabilities;
import org.openqa.selenium.remote.RemoteWebDriver;
import org.testng.annotations.AfterClass;
import org.testng.annotations.BeforeClass;
import org.testng.annotations.Test;

public class GridSerializeExceptionTests {

	
	
	private Hub hub;
	private URL hubURL;

	@BeforeClass(alwaysRun = false)
	public void prepare() throws Exception {
		
		GridHubConfiguration config = new GridHubConfiguration();
		config.setPort(PortProber.findFreePort());
		hub = new Hub(config);
		hubURL = hub.getUrl();
		
		hub.start();

		SelfRegisteringRemote remote = GridTestHelper.getRemoteWithoutCapabilities(hubURL, GridRole.WEBDRIVER);
		//remote.addBrowser(DesiredCapabilities.firefox(),1);
		
		remote.startRemoteServer();
		remote.sendRegistrationRequest();
		RegistryTestHelper.waitForNode(hub.getRegistry(), 1);
	}

	@Test(expectedExceptions=WebDriverException.class)
	public void testwebdriver() throws Throwable {
		DesiredCapabilities ff = DesiredCapabilities.firefox();
		new RemoteWebDriver(new URL(hubURL + "/grid/driver"), ff);	
	}

	@AfterClass(alwaysRun = false)
	public void stop() throws Exception {
		hub.stop();
	}
}
