package org.openqa.grid.e2e.node;

import org.openqa.grid.common.GridRole;
import org.openqa.grid.common.RegistrationRequest;
import org.openqa.grid.e2e.utils.GridTestHelper;
import org.openqa.grid.e2e.utils.RegistryTestHelper;
import org.openqa.grid.internal.utils.SelfRegisteringRemote;
import org.openqa.grid.web.Hub;
import org.openqa.selenium.remote.DesiredCapabilities;
import org.testng.Assert;
import org.testng.annotations.AfterClass;
import org.testng.annotations.BeforeClass;
import org.testng.annotations.Test;

public class DefaultProxyIsUnregisteredIfDownForTooLongTest {
  private Hub hub;
  private SelfRegisteringRemote remote;

  @BeforeClass
  public void prepare() throws Exception {

    hub = GridTestHelper.getHub();


    remote = GridTestHelper.getRemoteWithoutCapabilities(hub.getUrl(), GridRole.NODE);

    // check if the hub is up every 250 ms.
    remote.getConfiguration().put(RegistrationRequest.NODE_POLLING, 250);

    // unregister the proxy is it's down for more than 2 sec in a row.
    remote.getConfiguration().put(RegistrationRequest.UNREGISTER_IF_STILL_DOWN_AFTER, 2000);
    remote.addBrowser(DesiredCapabilities.firefox(), 1);
    remote.startRemoteServer();
    remote.sendRegistrationRequest();
    RegistryTestHelper.waitForNode(hub.getRegistry(), 1);
  }

  @Test
  public void proxyIsUnregistered() throws InterruptedException {
    Assert.assertTrue(hub.getRegistry().getAllProxies().size() == 1);
    remote.stopRemoteServer();
    // first mark down.
    Assert.assertTrue(hub.getRegistry().getAllProxies().size() == 1);
    Thread.sleep(2500);
    // and finally removed after time > UNREGISTER_IF_STILL_DOWN_AFTER
    Assert.assertTrue(hub.getRegistry().getAllProxies().size() == 0);
  }

  @AfterClass
  public void tearDown() throws Exception {
    hub.stop();
  }
}
