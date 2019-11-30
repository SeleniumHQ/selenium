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

/**
 * A node will try to contact the hub it's registered to every RegistrationRequest.REGISTER_CYCLE
 * millisec. If the hub crash, and is restarted, the node will register themselves again.
 *
 * @author freynaud
 *
 */
public class HubRestart {
//
//  private Hub hub;
//  private GridRegistry registry;
//  private SelfRegisteringRemote remote;
//  private GridHubConfiguration config = new GridHubConfiguration();
//
//  @Before
//  public void prepare() {
//    config.host = "localhost";
//    config.port = PortProber.findFreePort();
//    config.timeout = 10;
//    config.browserTimeout = 10;
//    hub = GridTestHelper.getHub(config);
//    registry = hub.getRegistry();
//
//    remote = GridTestHelper.getRemoteWithoutCapabilities(hub.getUrl(), GridRole.NODE);
//
//    remote.getConfiguration().registerCycle = 250;
//
//    remote.setRemoteServer(new SeleniumServer(remote.getConfiguration()));
//    remote.startRemoteServer();
//  }
//
//  @Test(timeout = 5000)
//  public void nodeRegisterAgain() throws Exception {
//
//    // every 5 sec, the node register themselves again.
//    assertEquals(remote.getConfiguration().registerCycle.longValue(), 250);
//    remote.startRegistrationProcess();
//
//    // should be up
//    RegistryTestHelper.waitForNode(hub.getRegistry(), 1);
//
//    assertEquals(remote.getConfiguration().timeout.intValue(), 10);
//    assertEquals(remote.getConfiguration().browserTimeout.intValue(), 10);
//
//    // crashing the hub.
//    hub.stop();
//
//    // check that the remote do not crash if there is no hub to reply.
//    Thread.sleep(1000);
//
//    // and starting a new hub
//    config.timeout = 20;
//    config.browserTimeout = 20;
//    hub = new Hub(config);
//    registry = hub.getRegistry();
//    // should be empty
//    assertEquals(registry.getAllProxies().size(), 0);
//    hub.start();
//
//    // the node will appear again after 250 ms.
//    RegistryTestHelper.waitForNode(hub.getRegistry(), 1);
//
//    assertEquals(remote.getConfiguration().timeout.intValue(), 20);
//    assertEquals(remote.getConfiguration().browserTimeout.intValue(), 20);
//  }
//
//  @After
//  public void stop() {
//    hub.stop();
//    remote.stopRemoteServer();
//  }
}
