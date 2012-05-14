/*
Copyright 2011 Selenium committers
Copyright 2011 Software Freedom Conservancy

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

package org.openqa.grid.e2e.misc;

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

public class GridSerializeExceptionTests {

  private Hub hub;

  @BeforeClass(alwaysRun = false)
  public void prepare() throws Exception {

    hub = GridTestHelper.getHub();

    SelfRegisteringRemote remote =
        GridTestHelper.getRemoteWithoutCapabilities(hub, GridRole.NODE);

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
