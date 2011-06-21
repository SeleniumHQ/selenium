package org.openqa.grid.e2e.selenium;

import java.net.URL;

import org.openqa.grid.e2e.utils.GridConfigurationMock;
import org.openqa.grid.internal.utils.GridHubConfiguration;
import org.openqa.grid.selenium.SelfRegisteringRemote;
import org.openqa.grid.web.Hub;
import org.openqa.selenium.net.PortProber;
import org.testng.Assert;
import org.testng.annotations.AfterClass;
import org.testng.annotations.BeforeClass;
import org.testng.annotations.Test;

import com.thoughtworks.selenium.DefaultSelenium;
import com.thoughtworks.selenium.Selenium;

/**
 * A hub controling 1 selenium1 remote can run IE, FF or safari tests.
 * 
 * 
 */
public class SmokeTest {

	private Hub hub ;
	private URL hubURL ;

	@BeforeClass(alwaysRun = false)
	public void prepare() throws Exception {
		GridHubConfiguration config = new GridHubConfiguration();
		config.setPort(PortProber.findFreePort());
		hub = new Hub(config);
		hubURL = hub.getUrl();
		hub.start();

		SelfRegisteringRemote remote = SelfRegisteringRemote.create(GridConfigurationMock.seleniumConfig(hub.getRegistrationURL()));
		remote.addFirefoxSupport();
		remote.addSafariSupport();
		remote.addInternetExplorerSupport();
		remote.launchRemoteServer();
		remote.registerToHub();
	}

	@Test(timeOut = 10000)
	public void sel1firefox() throws InterruptedException {
		Selenium selenium = new DefaultSelenium(hub.getHost(), hub.getPort(), "*firefox", hubURL + "");
		Assert.assertEquals(hub.getRegistry().getActiveSessions().size(), 0);
		selenium.start();
		Assert.assertEquals(hub.getRegistry().getActiveSessions().size(), 1);
		selenium.open(hubURL + "/grid/console");
		Assert.assertTrue(selenium.getTitle().contains("Grid overview"));
		selenium.stop();

		// cannot assume it will be 0 active session right away. selenium.stop()
		// will trigger a session.terminate() on the grid, that runs in a
		// different thread
		// not to block the test.
		while (hub.getRegistry().getActiveSessions().size() != 0) {
			Thread.sleep(250);
		}
	}

	@Test(enabled = false)
	public void sel1ie() throws InterruptedException {
		// http://stackoverflow.com/questions/1517623/internet-explorer-8-64bit-and-selenium-not-working
		Selenium selenium = new DefaultSelenium(hub.getHost(), hub.getPort(), "*iexplore", "http://www.ebay.co.uk");
		Assert.assertEquals(hub.getRegistry().getActiveSessions().size(), 0);
		selenium.start();
		Assert.assertEquals(hub.getRegistry().getActiveSessions().size(), 1);
		selenium.open("http://www.ebay.co.uk");
		Assert.assertTrue(selenium.getTitle().contains("eBay"));
		selenium.stop();
		while (hub.getRegistry().getActiveSessions().size() != 0) {
			Thread.sleep(250);
		}
	}

	@Test(enabled = false)
	public void selsafari() {
		// http://discussions.apple.com/thread.jspa?messageID=12564201 ?
		Selenium selenium = new DefaultSelenium(hub.getHost(), hub.getPort(), "*safari", "http://www.ebay.co.uk");
		Assert.assertEquals(hub.getRegistry().getActiveSessions().size(), 0);
		selenium.start();
		Assert.assertEquals(hub.getRegistry().getActiveSessions().size(), 1);
		selenium.open("http://www.ebay.co.uk");
		Assert.assertTrue(selenium.getTitle().contains("eBay"));
		selenium.stop();
		Assert.assertEquals(hub.getRegistry().getActiveSessions().size(), 0);
	}

	@AfterClass(alwaysRun = true)
	public void stop() throws Exception {
		hub.stop();
	}

}
