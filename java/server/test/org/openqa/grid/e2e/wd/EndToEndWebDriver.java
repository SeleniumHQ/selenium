package org.openqa.grid.e2e.wd;

import java.net.MalformedURLException;
import java.net.URL;

import org.openqa.grid.e2e.utils.GridConfigurationMock;
import org.openqa.grid.internal.utils.GridHubConfiguration;
import org.openqa.grid.selenium.SelfRegisteringRemote;
import org.openqa.grid.web.Hub;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.net.PortProber;
import org.openqa.selenium.remote.DesiredCapabilities;
import org.openqa.selenium.remote.RemoteWebDriver;
import org.testng.Assert;
import org.testng.Reporter;
import org.testng.annotations.AfterClass;
import org.testng.annotations.BeforeClass;
import org.testng.annotations.Test;

/**
 * start 2 proxy of 5 FF each, and run 10 tests. Validate all the resources are
 * used.
 * 
 * 
 */
public class EndToEndWebDriver {

	private Hub hub ;
	private URL hubURL;

	@BeforeClass(alwaysRun = true)
	public void prepare() throws Exception {
		GridHubConfiguration config = new GridHubConfiguration();
		config.setPort(PortProber.findFreePort());
		hub = new Hub(config);
		hubURL = hub.getUrl();
		
		hub.start();
		hubURL = new URL("http://" + hub.getHost() + ":" + hub.getPort());

		SelfRegisteringRemote remote = SelfRegisteringRemote.create(GridConfigurationMock.webdriverConfig(hub.getRegistrationURL()));
		remote.addFirefoxSupport();
		remote.addFirefoxSupport();
		remote.addFirefoxSupport();
		remote.addFirefoxSupport();
		remote.addFirefoxSupport();
		remote.setMaxConcurrentSession(5);
		remote.setTimeout(-1, -1);
		remote.launchRemoteServer();
		remote.registerToHub();

		SelfRegisteringRemote remote2 = SelfRegisteringRemote.create(GridConfigurationMock.webdriverConfig(hub.getRegistrationURL()));
		remote2.addFirefoxSupport();
		remote2.addFirefoxSupport();
		remote2.addFirefoxSupport();
		remote2.addFirefoxSupport();
		remote2.addFirefoxSupport();
		remote2.setMaxConcurrentSession(5);
		remote2.setTimeout(-1, -1);
		remote2.launchRemoteServer();
		remote2.registerToHub();
	}

	@Test(invocationCount = 10, threadPoolSize = 10)
	public void test() throws MalformedURLException, InterruptedException {
		DesiredCapabilities ff = DesiredCapabilities.firefox();
		WebDriver driver = null;
		try {
			driver = new RemoteWebDriver(new URL(hubURL + "/grid/driver"), ff);
			driver.get(hubURL + "/grid/console");
			Assert.assertEquals(driver.getTitle(), "Grid overview");
		} finally {
			Reporter.log("driver : "+driver);
			driver.quit();
		}
	}

	@AfterClass(alwaysRun = true)
	public void stop() throws Exception {
		hub.stop();
	}
}
