package org.openqa.grid.e2e.misc;

import java.io.File;
import java.net.MalformedURLException;
import java.net.URL;

import org.openqa.grid.internal.Registry;
import org.openqa.grid.selenium.SelfRegisteringRemote;
import org.openqa.grid.selenium.utils.SeleniumProtocol;
import org.openqa.grid.web.Hub;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.net.PortProber;
import org.openqa.selenium.remote.DesiredCapabilities;
import org.openqa.selenium.remote.RemoteWebDriver;
import org.testng.Assert;
import org.testng.annotations.BeforeClass;
import org.testng.annotations.Test;

import com.thoughtworks.selenium.DefaultSelenium;
import com.thoughtworks.selenium.Selenium;

public class Selenium1WebDriverTests {

	
	private Hub hub = Hub.getNewInstanceForTest(PortProber.findFreePort(), Registry.getNewInstanceForTestOnly());
	
	
	@BeforeClass(alwaysRun = true)
	public void setup() throws Exception {
		hub.start();

		// register a selenium 1
		SelfRegisteringRemote selenium1 = SelfRegisteringRemote.create(SeleniumProtocol.Selenium, PortProber.findFreePort(), hub.getRegistrationURL());
		selenium1.addFirefoxSupport(null);
		selenium1.addFirefoxSupport(new File("c:\\grid\\master"));
		selenium1.addInternetExplorerSupport();
		selenium1.addSafariSupport();
		selenium1.launchRemoteServer();
		selenium1.registerToHub();
		
		
		// register a webdriver
		SelfRegisteringRemote webdriver = SelfRegisteringRemote.create(SeleniumProtocol.WebDriver, PortProber.findFreePort(), hub.getRegistrationURL());
		webdriver.addFirefoxSupport(null);
		webdriver.addFirefoxSupport(null);
		webdriver.addFirefoxSupport(null);
		webdriver.addInternetExplorerSupport();
		webdriver.setMaxConcurrentSession(5);
		
		webdriver.launchRemoteServer();
		webdriver.registerToHub();
	}

	@Test(enabled = false)
	public void test() throws MalformedURLException {
		String url = "http://" + hub.getHost() + ":" + hub.getPort()+"/grid/console";
		
		Selenium selenium = new DefaultSelenium(hub.getHost(), hub.getPort(), "*firefox", url);
		Assert.assertEquals(hub.getRegistry().getActiveSessions().size(), 0);
		selenium.start();
		Assert.assertEquals(hub.getRegistry().getActiveSessions().size(), 1);
		selenium.open(url);
		Assert.assertTrue("Grid overview".equals(selenium.getTitle()));
		selenium.stop();
		
		DesiredCapabilities ff = DesiredCapabilities.firefox();
		URL hubUrl = new URL("http://" + hub.getHost() + ":" + hub.getPort() + "/grid/driver");
		WebDriver driver = new RemoteWebDriver(hubUrl, ff);
		
		driver.get(url);
		Assert.assertEquals(driver.getTitle(), "Grid overview");
		driver.quit();
		
	}
}
