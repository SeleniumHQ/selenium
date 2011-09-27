package org.openqa.grid.e2e.wd;

import org.openqa.grid.common.GridRole;
import org.openqa.grid.e2e.utils.GridTestHelper;
import org.openqa.grid.e2e.utils.RegistryTestHelper;
import org.openqa.grid.internal.utils.SelfRegisteringRemote;
import org.openqa.grid.web.Hub;
import org.openqa.selenium.WebDriverException;
import org.openqa.selenium.remote.DesiredCapabilities;
import org.testng.annotations.AfterClass;
import org.testng.annotations.BeforeClass;
import org.testng.annotations.Test;

import java.net.URL;

public class GridSerializeExceptionTests {


  private URL hubURL;
  private Hub hub;

  @BeforeClass(alwaysRun = false)
  public void prepare() throws Exception {

    hub = GridTestHelper.getHub();

    SelfRegisteringRemote remote =
        GridTestHelper.getRemoteWithoutCapabilities(hub, GridRole.WEBDRIVER);

    remote.startRemoteServer();
    remote.sendRegistrationRequest();
    RegistryTestHelper.waitForNode(hub.getRegistry(), 1);
  }

  @Test(expectedExceptions = WebDriverException.class)
  public void testwebdriver() throws Throwable {
    DesiredCapabilities ff = DesiredCapabilities.firefox();
    GridTestHelper.getRemoteWebDriver(ff, hub);
  }

  @AfterClass(alwaysRun = false)
  public void stop() throws Exception {
    hub.stop();
  }
}
