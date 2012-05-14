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

import org.openqa.selenium.net.PortProber;

import org.openqa.grid.common.GridRole;
import org.openqa.grid.common.RegistrationRequest;
import org.openqa.grid.e2e.utils.GridTestHelper;
import org.openqa.grid.e2e.utils.RegistryTestHelper;
import org.openqa.grid.internal.Registry;
import org.openqa.grid.internal.utils.GridHubConfiguration;
import org.openqa.grid.internal.utils.SelfRegisteringRemote;
import org.openqa.grid.web.Hub;
import org.testng.Assert;
import org.testng.annotations.AfterClass;
import org.testng.annotations.BeforeClass;
import org.testng.annotations.Test;

/**
 * by specifing a RegistrationRequest.REGISTER_CYCLE= -1 , the node to not try to register against
 * the hub all the time. For such a node, if the hub crash, the node won't reconnect after the hub
 * is restarted.
 * 
 * @author freynaud
 * 
 */
public class HubRestartNeg {
  private Hub hub;
  private Registry registry;
  private SelfRegisteringRemote remote;
  private GridHubConfiguration config = new GridHubConfiguration();

  @BeforeClass(alwaysRun = false)
  public void prepare() throws Exception {
    config.setHost("localhost");
    config.setPort(PortProber.findFreePort());
    hub = new Hub(config);
    registry = hub.getRegistry();
    hub.start();

    remote = GridTestHelper.getRemoteWithoutCapabilities(hub.getUrl(), GridRole.NODE);

    remote.getConfiguration().put(RegistrationRequest.REGISTER_CYCLE, -1);

    remote.startRemoteServer();

  }

  @Test(timeOut = 5000)
  public void nodeRegisterAgain() throws Exception {

    // every 5 sec, the node register themselves again.
    Assert.assertEquals(remote.getConfiguration().get(RegistrationRequest.REGISTER_CYCLE), -1);
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
    Assert.assertEquals(registry.getAllProxies().size(), 0);
    hub.start();

    // the node will appear again after 250 ms.
    RegistryTestHelper.waitForNode(hub.getRegistry(), 0);

  }

  @AfterClass(alwaysRun = false)
  public void stop() throws Exception {
    hub.stop();
    remote.stopRemoteServer();

  }
}
