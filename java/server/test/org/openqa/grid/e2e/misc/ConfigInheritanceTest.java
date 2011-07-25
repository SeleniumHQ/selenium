package org.openqa.grid.e2e.misc;

import java.net.MalformedURLException;
import java.net.URL;

import org.openqa.grid.common.GridRole;
import org.openqa.grid.e2e.utils.GridTestHelper;
import org.openqa.grid.e2e.utils.RegistryTestHelper;
import org.openqa.grid.internal.RemoteProxy;
import org.openqa.grid.internal.utils.GridHubConfiguration;
import org.openqa.grid.internal.utils.SelfRegisteringRemote;
import org.openqa.grid.web.Hub;
import org.openqa.selenium.net.PortProber;
import org.openqa.selenium.remote.DesiredCapabilities;
import org.testng.Assert;
import org.testng.annotations.AfterClass;
import org.testng.annotations.BeforeClass;
import org.testng.annotations.Test;


public class ConfigInheritanceTest {
  private Hub hub;
  private URL hubURL;

  @BeforeClass(alwaysRun = false)
  public void prepare() throws Exception {
    GridHubConfiguration config = new GridHubConfiguration();
    config.setPort(PortProber.findFreePort());
    config.getAllParams().put("A", "valueA");
    config.getAllParams().put("B", 5);
    config.getAllParams().put("A2", "valueA2");
    config.getAllParams().put("B2", 42);

    hub = new Hub(config);
    hubURL = hub.getUrl();

    hub.start();


    SelfRegisteringRemote remote = GridTestHelper.getRemoteWithoutCapabilities(hubURL, GridRole.WEBDRIVER);
    remote.addBrowser(DesiredCapabilities.firefox(), 1);
    remote.getConfiguration().put("A2", "proxyA2");
    remote.getConfiguration().put("B2", 50);

    remote.startRemoteServer();
    remote.sendRegistrationRequest();
    RegistryTestHelper.waitForNode(hub.getRegistry(), 1);
  }

  @Test
  public void test() throws MalformedURLException, InterruptedException {

    Assert.assertEquals(1, hub.getRegistry().getAllProxies().size());
    RemoteProxy p = hub.getRegistry().getAllProxies().iterator().next();

    Assert.assertEquals(p.getConfig().get("A"), "valueA");
    Assert.assertEquals(p.getConfig().get("A2"), "proxyA2");

    Assert.assertEquals(p.getConfig().get("B"), 5);
    Assert.assertEquals(p.getConfig().get("B2"), 50);


  }

  @AfterClass(alwaysRun = false)
  public void stop() throws Exception {
    hub.stop();
  }
}
