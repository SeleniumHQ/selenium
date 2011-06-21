package org.openqa.grid.e2e.selenium;


import org.openqa.grid.e2e.utils.GridConfigurationMock;
import org.openqa.grid.internal.RemoteProxy;
import org.openqa.grid.internal.utils.GridHubConfiguration;
import org.openqa.grid.selenium.SelfRegisteringRemote;
import org.openqa.grid.selenium.utils.GridConfiguration;
import org.openqa.grid.web.Hub;
import org.openqa.selenium.net.PortProber;
import org.testng.Assert;
import org.testng.annotations.BeforeClass;
import org.testng.annotations.Test;

import com.thoughtworks.selenium.DefaultSelenium;
import com.thoughtworks.selenium.Selenium;

public class NodeRecoveryTest {

	private Hub hub;
	GridConfiguration proxy;
	SelfRegisteringRemote node; 
	
	int originalTimeout =3000;
	int newtimeout = 20000;

	@BeforeClass(alwaysRun = true)
	public void setup() throws Exception {
		GridHubConfiguration config = new GridHubConfiguration();
		config.setPort(PortProber.findFreePort());
		hub = new Hub(config);
		
		hub.start();

		proxy = GridConfigurationMock.seleniumConfig(hub.getRegistrationURL());
		node = SelfRegisteringRemote.create(proxy);
		// register a selenium 1 with a timeout of 3 sec
		node.addFirefoxSupport();
		node.setTimeout(originalTimeout, 1000);
		node.launchRemoteServer();
		node.registerToHub();
	}

	@Test(enabled=false)
	public void test() throws Exception {
		
		Assert.assertEquals(hub.getRegistry().getAllProxies().size(), 1);
		for (RemoteProxy p : hub.getRegistry().getAllProxies()) {
			Assert.assertEquals(p.getTimeOut(), originalTimeout);
		}
		
		String url = "http://" + hub.getHost() + ":" + hub.getPort() + "/grid/console";

		Selenium selenium = new DefaultSelenium(hub.getHost(), hub.getPort(), "*firefox", url);
		selenium.start();
		
		// kill the node 
		node.stopRemoteServer();
		
		
		// change its config.
		node.setTimeout(newtimeout, 1000);
		
		System.out.println(node.getRegistrationRequest().toJSON());
		
		// restart it
		node.launchRemoteServer();
		node.registerToHub();
		
		// wait for 5 sec : the timeout of the original node should be reached, and the session freed
		Thread.sleep(5000);

		Assert.assertEquals(hub.getRegistry().getActiveSessions().size(), 0);
		
		Assert.assertEquals(hub.getRegistry().getAllProxies().size(), 1);
		
		
		for (RemoteProxy p : hub.getRegistry().getAllProxies()) {
			System.out.println(p);
			Assert.assertEquals(p.getTimeOut(), newtimeout);
		}

	}
}
