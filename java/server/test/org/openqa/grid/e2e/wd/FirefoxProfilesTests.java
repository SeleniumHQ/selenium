package org.openqa.grid.e2e.wd;

import java.io.File;
import java.net.MalformedURLException;
import java.net.URL;

import org.openqa.grid.internal.Registry;
import org.openqa.grid.selenium.SelfRegisteringRemote;
import org.openqa.grid.selenium.utils.SeleniumProtocol;
import org.openqa.grid.web.Hub;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.firefox.FirefoxDriver;
import org.openqa.selenium.firefox.FirefoxProfile;
import org.openqa.selenium.net.PortProber;
import org.openqa.selenium.remote.DesiredCapabilities;
import org.openqa.selenium.remote.RemoteWebDriver;
import org.testng.Assert;
import org.testng.Reporter;
import org.testng.annotations.AfterClass;
import org.testng.annotations.BeforeClass;
import org.testng.annotations.Test;

@Test(groups = { "slow", "firefox" })
public class FirefoxProfilesTests {

	private Hub hub = Hub.getNewInstanceForTest(PortProber.findFreePort(), Registry.getNewInstanceForTestOnly());
	private URL hubURL = hub.getUrl();

	@BeforeClass(alwaysRun = true)
	public void prepare() throws Exception {

		hub.start();
		hubURL = new URL("http://" + hub.getHost() + ":" + hub.getPort());

		SelfRegisteringRemote remote = SelfRegisteringRemote.create(SeleniumProtocol.WebDriver, PortProber.findFreePort(),  hub.getRegistrationURL());
		remote.addFirefoxSupport(null);
		remote.setTimeout(-1,-1);
		remote.launchRemoteServer();
		remote.registerToHub();

	}

	// TODO freynaud profile checked in
	// disabled. won't work because of the hardcoded path to c:\
	@Test(enabled=false)
	public void testwebdriver() throws MalformedURLException, InterruptedException {
		WebDriver driver = null;
		try {
			DesiredCapabilities cap = DesiredCapabilities.firefox();
			cap.setCapability(FirefoxDriver.PROFILE, new FirefoxProfile(new File("C:\\grid\\master")));
			driver = new RemoteWebDriver(new URL(hubURL + "/grid/driver"), cap);
			driver.get(hubURL + "/grid/console");
			Assert.assertEquals(driver.getTitle(), "Grid overview");
		} catch (Exception e) {
			e.printStackTrace();
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
