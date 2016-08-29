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

package org.openqa.grid.e2e.node;

import static org.junit.Assert.assertEquals;

import org.junit.BeforeClass;
import org.junit.Ignore;
import org.junit.Test;
import org.openqa.grid.common.GridRole;
import org.openqa.grid.e2e.utils.GridTestHelper;
import org.openqa.grid.e2e.utils.RegistryTestHelper;
import org.openqa.grid.internal.RemoteProxy;
import org.openqa.grid.internal.utils.SelfRegisteringRemote;
import org.openqa.grid.internal.utils.configuration.GridHubConfiguration;
import org.openqa.grid.web.Hub;
import org.openqa.selenium.net.PortProber;
import org.openqa.selenium.remote.DesiredCapabilities;
import org.openqa.selenium.remote.RemoteWebDriver;
import org.openqa.selenium.remote.server.SeleniumServer;

import java.net.URL;

/**
 * a node should be allowed to stop / crash and restart. When the node restarts, it replaces the old
 * one, updating its configuration is necessary.
 *
 * @author freynaud
 *
 */
public class NodeRecoveryTest {

  private static Hub hub;
  private static SelfRegisteringRemote node;

  private static int originalTimeout = 3;
  private static int newtimeout = 20;

  @BeforeClass
  public static void setup() throws Exception {
    GridHubConfiguration config = new GridHubConfiguration();
    config.host = "localhost";
    config.port = PortProber.findFreePort();
    hub = new Hub(config);

    hub.start();

    node = GridTestHelper.getRemoteWithoutCapabilities(hub.getUrl(), GridRole.NODE);
    // register a selenium 1 with a timeout of 3 sec

    node.addBrowser(GridTestHelper.getDefaultBrowserCapability(), 1);
    node.setTimeout(originalTimeout, 100);
    node.setRemoteServer(new SeleniumServer(node.getConfiguration()));
    node.startRemoteServer();
    node.sendRegistrationRequest();
    RegistryTestHelper.waitForNode(hub.getRegistry(), 1);
  }

  @Test
  public void nodeServerCanStopAndRestart() throws Exception {

    assertEquals(hub.getRegistry().getAllProxies().size(), 1);
    for (RemoteProxy p : hub.getRegistry().getAllProxies()) {
      assertEquals(p.getTimeOut(), originalTimeout * 1000);
    }

    DesiredCapabilities caps = GridTestHelper.getDefaultBrowserCapability();
    new RemoteWebDriver(hub.getWebDriverHubRequestURL(), caps);

    // kill the node
    node.stopRemoteServer();


    // change its config.
    node.setTimeout(newtimeout, 100);

    // restart it
    node.setRemoteServer(new SeleniumServer(node.getConfiguration()));
    node.startRemoteServer();
    node.sendRegistrationRequest();

    // the timeout of the original node should be reached, and the session freed
    Thread.sleep(originalTimeout * 1000 + 100);

    assertEquals(hub.getRegistry().getActiveSessions().size(), 0);

    assertEquals(hub.getRegistry().getAllProxies().size(), 1);


    for (RemoteProxy p : hub.getRegistry().getAllProxies()) {
      System.out.println(p);
      assertEquals(p.getTimeOut(), newtimeout * 1000);
    }

  }
}
