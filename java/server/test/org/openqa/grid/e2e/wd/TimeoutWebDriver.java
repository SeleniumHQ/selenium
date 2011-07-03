package org.openqa.grid.e2e.wd;

import java.net.MalformedURLException;
import java.net.URL;

import org.openqa.grid.common.GridRole;
import org.openqa.grid.e2e.utils.GridTestHelper;
import org.openqa.grid.e2e.utils.RegistryTestHelper;
import org.openqa.grid.internal.utils.GridHubConfiguration;
import org.openqa.grid.internal.utils.SelfRegisteringRemote;
import org.openqa.grid.web.Hub;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebDriverException;
import org.openqa.selenium.net.PortProber;
import org.openqa.selenium.remote.DesiredCapabilities;
import org.openqa.selenium.remote.RemoteWebDriver;
import org.testng.Assert;
import org.testng.annotations.AfterClass;
import org.testng.annotations.BeforeClass;
import org.testng.annotations.Test;

@Test(groups = { "slow", "firefox" })
public class TimeoutWebDriver {

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
		
		remote.setMaxConcurrent(1);
		remote.setTimeout(5000,250);
		remote.addBrowser(DesiredCapabilities.firefox(),1);
		
		remote.startRemoteServer();
		remote.sendRegistrationRequest();
		
		RegistryTestHelper.waitForNode(hub.getRegistry(), 1);
	}

	@Test
	public void testOk() throws MalformedURLException, InterruptedException {
		DesiredCapabilities ff = DesiredCapabilities.firefox();
		WebDriver driver = new RemoteWebDriver(new URL(hubURL + "/grid/driver"), ff);
		Assert.assertTrue(hub.getRegistry().getActiveSessions().size() == 1);
		driver.get(hubURL + "/grid/console");
		Assert.assertEquals(driver.getTitle(), "Grid overview");
		driver.quit();
	}
	
	@Test(expectedExceptions = WebDriverException.class)
	public void testTimeout() throws MalformedURLException, InterruptedException {
		DesiredCapabilities ff = DesiredCapabilities.firefox();
		WebDriver driver = new RemoteWebDriver(new URL(hubURL + "/grid/driver"), ff);
		Assert.assertTrue(hub.getRegistry().getActiveSessions().size() == 1);
		driver.get(hubURL + "/grid/console");
		Assert.assertEquals(driver.getTitle(), "Grid overview");
		Thread.sleep(7000);
		// sould throw here. The session has timed out.
		driver.quit();
	}

	@AfterClass(alwaysRun = false)
	public void stop() throws Exception {
		Assert.assertTrue(hub.getRegistry().getActiveSessions().size() == 0);
		hub.stop();
	}
}
