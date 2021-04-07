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

/**
 * a node should be allowed to stop / crash and restart. When the node restarts, it replaces the old
 * one, updating its configuration is necessary.
 *
 * @author freynaud
 *
 */
public class NodeRecoveryTest {

//  private Hub hub;
//  private SelfRegisteringRemote node;
//
//  private final static int ORIGINAL_TIMEOUT = 3;
//  private final static int NEW_TIMEOUT = 20;
//
//  @Before
//  public void setup() {
//    GridHubConfiguration config = new GridHubConfiguration();
//    config.host = "localhost";
//    config.port = PortProber.findFreePort();
//    hub = new Hub(config);
//
//    hub.start();
//
//    node = GridTestHelper.getRemoteWithoutCapabilities(hub.getUrl(), GridRole.NODE);
//    node.getConfiguration().timeout = ORIGINAL_TIMEOUT;
//    // register a selenium 1 with a timeout of 3 sec
//    node.addBrowser(GridTestHelper.getDefaultBrowserCapability(), 1);
//    node.setRemoteServer(new SeleniumServer(node.getConfiguration()));
//    node.startRemoteServer();
//    node.sendRegistrationRequest();
//    RegistryTestHelper.waitForNode(hub.getRegistry(), 1);
//  }
//
//  @Test
//  public void nodeServerCanStopAndRestart() throws Exception {
//
//    assertEquals(hub.getRegistry().getAllProxies().size(), 1);
//    for (RemoteProxy p : hub.getRegistry().getAllProxies()) {
//      // Nodes fetch timeout and browserTimeout from the hub and update their configs
//      assertEquals(ORIGINAL_TIMEOUT * 1000, p.getTimeOut());
//    }
//
//    DesiredCapabilities caps = GridTestHelper.getDefaultBrowserCapability();
//    new RemoteWebDriver(hub.getWebDriverHubRequestURL(), caps);
//
//    // kill the node
//    node.stopRemoteServer();
//
//    // changing the node timeout, it should be kept after restarting and registering again
//    node.getConfiguration().timeout = NEW_TIMEOUT;
//
//    // restart it
//    node.setRemoteServer(new SeleniumServer(node.getConfiguration()));
//    node.startRemoteServer();
//    node.sendRegistrationRequest();
//
//    // the timeout of the original node should be reached, and the session freed
//    Thread.sleep(ORIGINAL_TIMEOUT * 1000 + 100);
//
//    assertEquals(hub.getRegistry().getActiveSessions().size(), 0);
//
//    assertEquals(hub.getRegistry().getAllProxies().size(), 1);
//
//
//    for (RemoteProxy p : hub.getRegistry().getAllProxies()) {
//      assertEquals(p.getTimeOut(), NEW_TIMEOUT * 1000);
//    }
//
//  }
}
