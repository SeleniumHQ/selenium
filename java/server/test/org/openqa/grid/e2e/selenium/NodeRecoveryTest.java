package org.openqa.grid.e2e.selenium;


import org.openqa.grid.common.GridRole;
import org.openqa.grid.e2e.utils.GridTestHelper;
import org.openqa.grid.e2e.utils.RegistryTestHelper;
import org.openqa.grid.internal.RemoteProxy;
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

public class NodeRecoveryTest {

	private Hub hub;
	SelfRegisteringRemote node; 
	
	int originalTimeout =3000;
	int newtimeout = 20000;

	@BeforeClass(alwaysRun = true)
	public void setup() throws Exception {
		GridHubConfiguration config = new GridHubConfiguration();
		config.setPort(PortProber.findFreePort());
		hub = new Hub(config);
		
		hub.start();

		node = GridTestHelper.getRemoteWithoutCapabilities(hub.getUrl(), GridRole.REMOTE_CONTROL);
		// register a selenium 1 with a timeout of 3 sec
		node.addBrowser(new DesiredCapabilities("*firefox","3.6",Platform.getCurrent()),1);
		node.setTimeout(originalTimeout, 1000);
		node.startRemoteServer();
		node.sendRegistrationRequest();
		RegistryTestHelper.waitForNode(hub.getRegistry(), 1);
	}

	@Test
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
		
		
		
		// restart it
		node.startRemoteServer();
		node.sendRegistrationRequest();
		
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
