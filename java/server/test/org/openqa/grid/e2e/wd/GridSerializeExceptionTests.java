package org.openqa.grid.e2e.wd;

import java.net.URL;

import org.openqa.grid.e2e.utils.GridConfigurationMock;
import org.openqa.grid.e2e.utils.RegistryTestHelper;
import org.openqa.grid.internal.Registry;
import org.openqa.grid.internal.exception.CapabilityNotPresentOnTheGridException;
import org.openqa.grid.selenium.SelfRegisteringRemote;
import org.openqa.grid.web.Hub;
import org.openqa.selenium.WebDriverException;
import org.openqa.selenium.net.PortProber;
import org.openqa.selenium.remote.DesiredCapabilities;
import org.openqa.selenium.remote.RemoteWebDriver;
import org.testng.annotations.AfterClass;
import org.testng.annotations.BeforeClass;
import org.testng.annotations.Test;

public class GridSerializeExceptionTests {

	
	
	private Hub hub = Hub.getNewInstanceForTest(PortProber.findFreePort(), Registry.getNewInstanceForTestOnly());
	private URL hubURL = hub.getUrl();

	@BeforeClass(alwaysRun = false)
	public void prepare() throws Exception {
		hub.start();

		SelfRegisteringRemote remote = SelfRegisteringRemote.create(GridConfigurationMock.webdriverConfig(hub.getRegistrationURL()));
		remote.addChromeSupport();
		remote.launchRemoteServer();
		remote.registerToHub();
		RegistryTestHelper.waitForNode(hub.getRegistry(), 1);
	}

	@Test(expectedExceptions=CapabilityNotPresentOnTheGridException.class)
	public void testwebdriver() throws Throwable {
		DesiredCapabilities ff = DesiredCapabilities.firefox();
		try {
			new RemoteWebDriver(new URL(hubURL + "/grid/driver"), ff);
		} catch (WebDriverException e) {
			throw e.getCause();
		}	
	}

	@AfterClass(alwaysRun = false)
	public void stop() throws Exception {
		hub.stop();
	}
}
