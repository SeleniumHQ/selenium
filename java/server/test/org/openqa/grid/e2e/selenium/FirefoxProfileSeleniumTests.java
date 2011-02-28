package org.openqa.grid.e2e.selenium;

import java.io.File;
import java.net.MalformedURLException;
import java.net.URL;

import org.openqa.grid.internal.Registry;
import org.openqa.grid.selenium.SelfRegisteringRemote;
import org.openqa.grid.selenium.utils.SeleniumProtocol;
import org.openqa.grid.web.Hub;
import org.openqa.selenium.net.PortProber;
import org.testng.Assert;
import org.testng.annotations.AfterClass;
import org.testng.annotations.BeforeClass;
import org.testng.annotations.Test;

import com.thoughtworks.selenium.DefaultSelenium;
import com.thoughtworks.selenium.Selenium;

/**
 * When a remote registers itself to the grid with a firefox that has a custom
 * profile, only client specifying that proxy can access the remote.
 * 
 * 
 */
public class FirefoxProfileSeleniumTests {

	private Hub hub = Hub.getNewInstanceForTest(PortProber.findFreePort(), Registry.getNewInstanceForTestOnly());
	private URL hubURL = hub.getUrl();

	@BeforeClass(alwaysRun = true)
	public void prepare() throws Exception {
		hub.start();

		SelfRegisteringRemote remote = SelfRegisteringRemote.create(SeleniumProtocol.Selenium, PortProber.findFreePort(), hub.getRegistrationURL());

		// specifying a profile
		remote.addFirefoxSupport(new File("C:\\grid\\master"));

		remote.launchRemoteServer();
		remote.registerToHub();

	}

	// TODO freynaud profile checked in
	// disabled. won't work because of the hardcoded path to c:\
	@Test(enabled = false)
	public void testSeleniumProfile() throws MalformedURLException, InterruptedException {
		Selenium selenium = null;
		try {
			// specifying the correct profile -> works
			selenium = new DefaultSelenium(hub.getHost(), hub.getPort(), "*firefox,profilePath=C:\\grid\\master", hubURL.toExternalForm());
			selenium.start();
			selenium.open(hubURL + "/grid/console");
			Assert.assertEquals(selenium.getTitle(), "Grid overview");
		} catch (Exception e) {
			e.printStackTrace();
		} finally {
			selenium.stop();
		}
	}

	// TODO freynaud profile checked in
	// disabled. won't work because of the hardcoded path to c:\
	@Test(enabled = false, expectedExceptions = RuntimeException.class)
	public void testSeleniumNoProfile() throws MalformedURLException, InterruptedException {
		Selenium selenium = null;
		try {
			// no profile -> fails
			selenium = new DefaultSelenium(hub.getHost(), hub.getPort(), "*firefox", hubURL.toExternalForm());
			selenium.start();
			selenium.open(hubURL + "/grid/console");
			Assert.assertEquals(selenium.getTitle(), "Grid overview");
		} finally {
			selenium.stop();
		}
	}

	// TODO freynaud profile checked in
	// disabled. won't work because of the hardcoded path to c:\
	@Test(enabled = false, expectedExceptions = RuntimeException.class)
	public void testSeleniumWrongProfile() throws MalformedURLException, InterruptedException {
		Selenium selenium = null;
		try {
			// wrong profile -> fails
			selenium = new DefaultSelenium(hub.getHost(), hub.getPort(), "*firefox,profilePath=C:\\grid\\master2", hubURL.toExternalForm());
			selenium.start();
			selenium.open(hubURL + "/grid/console");
			Assert.assertEquals(selenium.getTitle(), "Grid overview");
		} finally {
			selenium.stop();
		}
	}

	@AfterClass(alwaysRun = true)
	public void stop() throws Exception {
		hub.stop();
	}
}
