// Licensed to the Software Freedom Conservancy (SFC) under one
// or more contributor license agreements.  See the NOTICE file
// distributed with this work for additional information
// regarding copyright ownership.  The SFC licenses this file
// to you under the Apache License, Version 2.0 (the
// "License"); you may not use this file except in compliance
// with the License.  You may obtain a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing,
// software distributed under the License is distributed on an
// "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
// KIND, either express or implied.  See the License for the
// specific language governing permissions and limitations
// under the License.

package org.openqa.grid.e2e.misc;

import org.junit.AfterClass;
import org.junit.BeforeClass;
import org.junit.Test;
import org.openqa.grid.common.GridRole;
import org.openqa.grid.e2e.utils.GridTestHelper;
import org.openqa.grid.e2e.utils.RegistryTestHelper;
import org.openqa.grid.internal.utils.SelfRegisteringRemote;
import org.openqa.grid.web.Hub;
import org.openqa.selenium.WebDriverException;
import org.openqa.selenium.remote.server.SeleniumServer;

public class GridSerializeExceptionTest {

  private static Hub hub;

  @BeforeClass
  public static void prepare() throws Exception {

    hub = GridTestHelper.getHub();

    SelfRegisteringRemote remote =
        GridTestHelper.getRemoteWithoutCapabilities(hub, GridRole.NODE);

    remote.setRemoteServer(new SeleniumServer(remote.getConfiguration()));
    remote.startRemoteServer();
    remote.sendRegistrationRequest();
    RegistryTestHelper.waitForNode(hub.getRegistry(), 1);
  }

  @Test(expected = WebDriverException.class)
  public void testwebdriver() throws Throwable {
    GridTestHelper.getRemoteWebDriver(GridTestHelper.getDefaultBrowserCapability(), hub);
  }

  @AfterClass
  public static void stop() throws Exception {
    hub.stop();
  }
}
