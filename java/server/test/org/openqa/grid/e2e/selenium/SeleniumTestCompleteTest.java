package org.openqa.grid.e2e.selenium;

import org.openqa.grid.e2e.utils.GridConfigurationMock;
import org.openqa.grid.e2e.utils.RegistryTestHelper;
import org.openqa.grid.internal.utils.GridHubConfiguration;
import org.openqa.grid.selenium.SelfRegisteringRemote;
import org.openqa.grid.web.Hub;
import org.openqa.selenium.net.PortProber;
import org.testng.Assert;
import org.testng.annotations.BeforeClass;
import org.testng.annotations.Test;

import com.thoughtworks.selenium.DefaultSelenium;
import com.thoughtworks.selenium.Selenium;

/**
 * checks that the browser is properly stopped when a selenium1 session times
 * out.
 *
 * 
 */
public class SeleniumTestCompleteTest {

	private Hub hub;

	@BeforeClass(alwaysRun = true)
	public void setup() throws Exception {
		GridHubConfiguration config = new GridHubConfiguration();
		config.setPort(PortProber.findFreePort());
		hub = new Hub(config);
		
		hub.start();

		// register a selenium 1
		SelfRegisteringRemote selenium1 = SelfRegisteringRemote.create(GridConfigurationMock.seleniumConfig(hub.getRegistrationURL()));
		selenium1.addFirefoxSupport();
		selenium1.setTimeout(5000, 2000);
		selenium1.launchRemoteServer();
		selenium1.registerToHub();
		
		RegistryTestHelper.waitForNode(hub.getRegistry(), 1);
	}

	@Test
	public void test() throws InterruptedException {
		String url = "http://" + hub.getHost() + ":" + hub.getPort() + "/grid/console";

		Selenium selenium = new DefaultSelenium(hub.getHost(), hub.getPort(), "*firefox", url);
		selenium.start();
		selenium.open(url);
		Thread.sleep(8000);

		Assert.assertEquals(hub.getRegistry().getActiveSessions().size(), 0);

	}
}
