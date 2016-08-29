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
import org.openqa.grid.internal.Registry;
import org.openqa.grid.internal.utils.SelfRegisteringRemote;
import org.openqa.grid.internal.utils.configuration.GridHubConfiguration;
import org.openqa.grid.web.Hub;
import org.openqa.selenium.net.PortProber;
import org.openqa.selenium.remote.server.SeleniumServer;

/**
 * A node will try to contact the hub it's registered to every RegistrationRequest.REGISTER_CYCLE
 * millisec. If the hub crash, and is restarted, the node will register themselves again.
 *
 * @author freynaud
 *
 */
public class HubRestart {

  private static Hub hub;
  private static Registry registry;
  private static SelfRegisteringRemote remote;
  private static GridHubConfiguration config = new GridHubConfiguration();

  @BeforeClass
  public static void prepare() throws Exception {
    config.host = "localhost";
    config.port = PortProber.findFreePort();
    hub = GridTestHelper.getHub(config);
    registry = hub.getRegistry();

    remote = GridTestHelper.getRemoteWithoutCapabilities(hub.getUrl(), GridRole.NODE);

    remote.getConfiguration().registerCycle = 250;

    remote.setRemoteServer(new SeleniumServer(remote.getConfiguration()));
    remote.startRemoteServer();

  }

  @Test(timeout = 5000)
  public void nodeRegisterAgain() throws Exception {

    // every 5 sec, the node register themselves again.
    assertEquals(remote.getConfiguration().registerCycle.longValue(), 250);
    remote.startRegistrationProcess();

    // should be up
    RegistryTestHelper.waitForNode(hub.getRegistry(), 1);

    // crashing the hub.
    hub.stop();

    // check that the remote do not crash if there is no hub to reply.
    Thread.sleep(1000);

    // and starting a new hub
    hub = new Hub(config);
    registry = hub.getRegistry();
    // should be empty
    assertEquals(registry.getAllProxies().size(), 0);
    hub.start();

    // the node will appear again after 250 ms.
    RegistryTestHelper.waitForNode(hub.getRegistry(), 1);

  }

  @AfterClass
  public static void stop() throws Exception {
    hub.stop();
    remote.stopRemoteServer();

  }
}
