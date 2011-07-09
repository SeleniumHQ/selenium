package org.openqa.grid.e2e.wd;

import org.openqa.grid.common.GridRole;
import org.openqa.grid.common.RegistrationRequest;
import org.openqa.grid.e2e.utils.GridTestHelper;
import org.openqa.grid.e2e.utils.RegistryTestHelper;
import org.openqa.grid.internal.Registry;
import org.openqa.grid.internal.RemoteProxy;
import org.openqa.grid.internal.utils.GridHubConfiguration;
import org.openqa.grid.internal.utils.SelfRegisteringRemote;
import org.openqa.grid.selenium.proxy.WebRemoteProxy;
import org.openqa.grid.web.Hub;
import org.openqa.selenium.net.PortProber;
import org.testng.Assert;
import org.testng.annotations.AfterClass;
import org.testng.annotations.BeforeClass;
import org.testng.annotations.Test;

@Test(groups = {"slow", "firefox"})
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


    remote = GridTestHelper.getRemoteWithoutCapabilities(hub.getUrl(), GridRole.WEBDRIVER);
    remote2 = GridTestHelper.getRemoteWithoutCapabilities(hub.getUrl(), GridRole.REMOTE_CONTROL);

    remote.getConfiguration().put(RegistrationRequest.NODE_POLLING, 250);
    remote2.getConfiguration().put(RegistrationRequest.NODE_POLLING, 250);

    remote.startRemoteServer();
    remote2.startRemoteServer();

    remote.sendRegistrationRequest();
    remote2.sendRegistrationRequest();

    RegistryTestHelper.waitForNode(hub.getRegistry(), 2);
  }

  @Test
  public void markdown() throws Exception {
    // should be up
    Thread.sleep(300);
    for (RemoteProxy proxy : registry.getAllProxies()) {
      Assert.assertFalse(((WebRemoteProxy) proxy).isDown());
    }
    // killing the nodes
    remote.stopRemoteServer();
    remote2.stopRemoteServer();
    Thread.sleep(300);
    // should be down
    for (RemoteProxy proxy : registry.getAllProxies()) {
      Assert.assertTrue(((WebRemoteProxy) proxy).isDown());
    }
    // and back up
    remote.startRemoteServer();
    remote2.startRemoteServer();
    Thread.sleep(300);
    // should be down
    for (RemoteProxy proxy : registry.getAllProxies()) {
      Assert.assertFalse(((WebRemoteProxy) proxy).isDown());
    }
  }


  @AfterClass(alwaysRun = false)
  public void stop() throws Exception {
    hub.stop();
    remote.stopRemoteServer();
    remote2.stopRemoteServer();

  }
}
