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

import static org.junit.Assert.assertEquals;

import org.junit.AfterClass;
import org.junit.BeforeClass;
import org.junit.Test;
import org.openqa.grid.common.GridRole;
import org.openqa.grid.e2e.utils.GridTestHelper;
import org.openqa.grid.e2e.utils.RegistryTestHelper;
import org.openqa.grid.internal.RemoteProxy;
import org.openqa.grid.internal.utils.configuration.GridHubConfiguration;
import org.openqa.grid.internal.utils.SelfRegisteringRemote;
import org.openqa.grid.web.Hub;
import org.openqa.selenium.net.PortProber;
import org.openqa.selenium.remote.server.SeleniumServer;


public class ConfigInheritanceTest {
  private static Hub hub;

  @BeforeClass
  public static void prepare() throws Exception {
    GridHubConfiguration config = new GridHubConfiguration();
    config.port = PortProber.findFreePort();
    config.custom.put("A", "valueA");
    config.custom.put("B", "5");
    config.custom.put("A2", "valueA2");
    config.custom.put("B2", "42");
    hub = GridTestHelper.getHub(config);


    SelfRegisteringRemote remote =
        GridTestHelper.getRemoteWithoutCapabilities(hub.getUrl(), GridRole.NODE);
    remote.addBrowser(GridTestHelper.getDefaultBrowserCapability(), 1);
    remote.getConfiguration().custom.put("A2", "proxyA2");
    remote.getConfiguration().custom.put("B2", "50");

    remote.setRemoteServer(new SeleniumServer(remote.getConfiguration()));
    remote.startRemoteServer();
    remote.sendRegistrationRequest();
    RegistryTestHelper.waitForNode(hub.getRegistry(), 1);
  }

  @Test
  public void test() {

    assertEquals(1, hub.getRegistry().getAllProxies().size());
    RemoteProxy p = hub.getRegistry().getAllProxies().iterator().next();

    assertEquals(p.getConfig().custom.get("A"), "valueA");
    assertEquals(p.getConfig().custom.get("A2"), "proxyA2");

    assertEquals(p.getConfig().custom.get("B"), "5");
    assertEquals(p.getConfig().custom.get("B2"), "50");


  }

  @AfterClass
  public static void stop() throws Exception {
    hub.stop();
  }
}
