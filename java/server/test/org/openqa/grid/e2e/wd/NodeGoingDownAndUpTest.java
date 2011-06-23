package org.openqa.grid.e2e.wd;

import java.net.MalformedURLException;

import org.openqa.grid.common.RegistrationRequest;
import org.openqa.grid.e2e.utils.GridConfigurationMock;
import org.openqa.grid.e2e.utils.RegistryTestHelper;
import org.openqa.grid.internal.Registry;
import org.openqa.grid.internal.RemoteProxy;
import org.openqa.grid.internal.utils.GridHubConfiguration;
import org.openqa.grid.selenium.SelfRegisteringRemote;
import org.openqa.grid.selenium.proxy.WebRemoteProxy;
import org.openqa.grid.web.Hub;
import org.openqa.selenium.net.PortProber;
import org.testng.Assert;
import org.testng.annotations.AfterClass;
import org.testng.annotations.BeforeClass;
import org.testng.annotations.Test;

@Test(groups = { "slow", "firefox" })
public class NodeGoingDownAndUpTest {

	private Hub hub;
	private Registry registry;
	private SelfRegisteringRemote remote;
	private SelfRegisteringRemote remote2;
	

	@BeforeClass(alwaysRun = false)
	public void prepare() throws Exception {
		GridHubConfiguration config = new GridHubConfiguration();
		config.setPort(PortProber.findFreePort());
		hub = new Hub(config);
		registry = hub.getRegistry(); 
		hub.start();

		remote = SelfRegisteringRemote.create(GridConfigurationMock.seleniumConfig(hub.getRegistrationURL()));
		remote2 = SelfRegisteringRemote.create(GridConfigurationMock.webdriverConfig(hub.getRegistrationURL()));
		// polling every 250 ms
		remote.getRegistrationRequest().getConfiguration().put(RegistrationRequest.NODE_POLLING, 250);
		remote2.getRegistrationRequest().getConfiguration().put(RegistrationRequest.NODE_POLLING, 250);		
		remote.addFirefoxSupport();
		remote2.addFirefoxSupport();
		
		remote.launchRemoteServer();
		remote2.launchRemoteServer();
		
		remote.registerToHub();
		remote2.registerToHub();
		
		RegistryTestHelper.waitForNode(hub.getRegistry(), 2);
	}

	@Test
	public void test() throws Exception {
		// should be up
		Thread.sleep(300);
		for (RemoteProxy proxy : registry.getAllProxies()){
			Assert.assertFalse(((WebRemoteProxy)proxy).isDown());	
		}
		// killing the nodes
		remote.stopRemoteServer();
		remote2.stopRemoteServer();
		Thread.sleep(300);
		// should be down
		for (RemoteProxy proxy : registry.getAllProxies()){
			Assert.assertTrue(((WebRemoteProxy)proxy).isDown());	
		}
		// and back up
		remote.launchRemoteServer();
		remote2.launchRemoteServer();
		Thread.sleep(300);
		// should be down
		for (RemoteProxy proxy : registry.getAllProxies()){
			Assert.assertFalse(((WebRemoteProxy)proxy).isDown());	
		}
	}

	@AfterClass(alwaysRun = false)
	public void stop() throws Exception {
		hub.stop();
		remote.stopRemoteServer();
		remote2.stopRemoteServer();
		
	}
}
