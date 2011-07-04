package org.openqa.grid.e2e.misc;

import org.openqa.grid.common.GridRole;
import org.openqa.grid.common.RegistrationRequest;
import org.openqa.grid.e2e.utils.GridTestHelper;
import org.openqa.grid.e2e.utils.RegistryTestHelper;
import org.openqa.grid.internal.Registry;
import org.openqa.grid.internal.utils.GridHubConfiguration;
import org.openqa.grid.internal.utils.SelfRegisteringRemote;
import org.openqa.grid.web.Hub;
import org.openqa.selenium.net.PortProber;
import org.testng.Assert;
import org.testng.annotations.AfterClass;
import org.testng.annotations.BeforeClass;
import org.testng.annotations.Test;

public class HubRestartNeg {
	private Hub hub;
	private Registry registry;
	private SelfRegisteringRemote remote;
	private SelfRegisteringRemote remote2;
	private GridHubConfiguration config = new GridHubConfiguration();

	@BeforeClass(alwaysRun = false)
	public void prepare() throws Exception {

		config.setPort(PortProber.findFreePort());
		hub = new Hub(config);
		registry = hub.getRegistry();
		hub.start();

		remote = GridTestHelper.getRemoteWithoutCapabilities(hub.getUrl(), GridRole.WEBDRIVER);
		remote2 = GridTestHelper.getRemoteWithoutCapabilities(hub.getUrl(), GridRole.REMOTE_CONTROL);

		remote.getConfiguration().put(RegistrationRequest.REGISTER_CYCLE, -1);
		remote2.getConfiguration().put(RegistrationRequest.REGISTER_CYCLE, -1);

		remote.startRemoteServer();
		remote2.startRemoteServer();

	}

	@Test(timeOut = 5000)
	public void nodeRegisterAgain() throws Exception {

		// every 5 sec, the node register themselves again.
		Assert.assertEquals(remote.getConfiguration().get(RegistrationRequest.REGISTER_CYCLE), -1);
		Assert.assertEquals(remote2.getConfiguration().get(RegistrationRequest.REGISTER_CYCLE), -1);
		remote.startRegistrationProcess();
		remote2.startRegistrationProcess();

		// should be up
		RegistryTestHelper.waitForNode(hub.getRegistry(), 2);

		// crashing the hub.
		hub.stop();

		// check that the remote do not crash if there is no hub to reply.
		Thread.sleep(1000);
		
		// and starting a new hub
		hub = new Hub(config);
		registry = hub.getRegistry();
		// should be empty
		Assert.assertEquals(registry.getAllProxies().size(), 0);
		hub.start();

		// the node will appear again after 250 ms.
		RegistryTestHelper.waitForNode(hub.getRegistry(), 0);

	}

	@AfterClass(alwaysRun = false)
	public void stop() throws Exception {
		hub.stop();
		remote.stopRemoteServer();
		remote2.stopRemoteServer();

	}
}
