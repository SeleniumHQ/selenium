package org.openqa.grid.e2e.selenium;

import org.openqa.grid.common.GridRole;
import org.openqa.grid.e2e.utils.GridTestHelper;
import org.openqa.grid.e2e.utils.RegistryTestHelper;
import org.openqa.grid.internal.utils.GridHubConfiguration;
import org.openqa.grid.internal.utils.SelfRegisteringRemote;
import org.openqa.grid.web.Hub;
import org.openqa.selenium.Platform;
import org.openqa.selenium.net.PortProber;
import org.openqa.selenium.remote.DesiredCapabilities;
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

		SelfRegisteringRemote selenium1 = GridTestHelper.getRemoteWithoutCapabilities(hub.getUrl(), GridRole.REMOTE_CONTROL);
		selenium1.addBrowser(new DesiredCapabilities("*firefox", "3.6", Platform.getCurrent()), 1);
		selenium1.setTimeout(5000, 2000);
		selenium1.startRemoteServer();
		selenium1.sendRegistrationRequest();

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
