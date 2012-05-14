/*
Copyright 2012 Selenium committers
Copyright 2012 Software Freedom Conservancy

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

     http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/


package org.openqa.grid.e2e.node;

import java.net.MalformedURLException;
import java.net.URL;

import org.openqa.grid.common.GridRole;
import org.openqa.grid.e2e.utils.GridTestHelper;
import org.openqa.grid.e2e.utils.RegistryTestHelper;
import org.openqa.grid.internal.utils.SelfRegisteringRemote;
import org.openqa.grid.web.Hub;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebDriverException;
import org.openqa.selenium.firefox.FirefoxDriver;
import org.openqa.selenium.remote.DesiredCapabilities;
import org.openqa.selenium.remote.RemoteWebDriver;
import org.testng.Assert;
import org.testng.annotations.AfterClass;
import org.testng.annotations.BeforeClass;
import org.testng.annotations.Test;


public class CrashWhenStartingBrowserTest {


  private Hub hub;
  private final String wrong_path = "stupidPathUnliklyToExist";

  @BeforeClass(alwaysRun = false)
  public void prepareANodePointingToANonExistingFirefox() throws Exception {

    hub = GridTestHelper.getHub();

    SelfRegisteringRemote remote =
        GridTestHelper.getRemoteWithoutCapabilities(hub.getUrl(), GridRole.NODE);

    DesiredCapabilities firefox = DesiredCapabilities.firefox();
    firefox.setCapability(FirefoxDriver.BINARY, wrong_path);
    
    remote.addBrowser(firefox, 1);
    remote.startRemoteServer();
    remote.sendRegistrationRequest();
    RegistryTestHelper.waitForNode(hub.getRegistry(), 1);
  }

  @Test
  public void serverCrashesStartingFirefox() throws MalformedURLException {
    WebDriverException exception = null;
    try {
      DesiredCapabilities ff = DesiredCapabilities.firefox();
      WebDriver driver = new RemoteWebDriver(new URL(hub.getUrl() + "/wd/hub"), ff);
    } catch (WebDriverException expected) {
      exception = expected;
    }
    Assert.assertNotNull(exception);
    Assert.assertTrue(exception.getMessage().contains(wrong_path));
    Assert.assertEquals(hub.getRegistry().getActiveSessions().size(), 0,"resource released");
    
  }

  @AfterClass(alwaysRun = false)
  public void stop() throws Exception {
    hub.stop();
  }
}
