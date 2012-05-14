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

package org.openqa.grid.e2e.node;

import org.openqa.grid.common.GridRole;
import org.openqa.grid.common.RegistrationRequest;
import org.openqa.grid.e2e.utils.GridTestHelper;
import org.openqa.grid.e2e.utils.RegistryTestHelper;
import org.openqa.grid.internal.Registry;
import org.openqa.grid.internal.RemoteProxy;
import org.openqa.grid.internal.utils.SelfRegisteringRemote;
import org.openqa.grid.selenium.proxy.DefaultRemoteProxy;
import org.openqa.grid.web.Hub;
import org.testng.Assert;
import org.testng.annotations.AfterClass;
import org.testng.annotations.BeforeClass;
import org.testng.annotations.Test;

@Test(groups = {"slow", "firefox"})
public class NodeGoingDownAndUpTest {

  private Hub hub;
  private Registry registry;
  private SelfRegisteringRemote remote;
  

  @BeforeClass(alwaysRun = false)
  public void prepare() throws Exception {
    hub = GridTestHelper.getHub();
    registry = hub.getRegistry();


    remote = GridTestHelper.getRemoteWithoutCapabilities(hub.getUrl(), GridRole.NODE);
    
    remote.getConfiguration().put(RegistrationRequest.NODE_POLLING, 250);
  
    remote.startRemoteServer();
  
    remote.sendRegistrationRequest();
  
    RegistryTestHelper.waitForNode(registry, 1);
  }

  @Test
  public void markdown() throws Exception {
    // should be up
    Thread.sleep(300);
    for (RemoteProxy proxy : registry.getAllProxies()) {
      Assert.assertFalse(((DefaultRemoteProxy) proxy).isDown());
    }
    // killing the nodes
    remote.stopRemoteServer();
    Thread.sleep(300);
    // should be down
    for (RemoteProxy proxy : registry.getAllProxies()) {
      Assert.assertTrue(((DefaultRemoteProxy) proxy).isDown());
    }
    // and back up
    remote.startRemoteServer();
    Thread.sleep(300);
    // should be down
    for (RemoteProxy proxy : registry.getAllProxies()) {
      Assert.assertFalse(((DefaultRemoteProxy) proxy).isDown());
    }
  }


  @AfterClass(alwaysRun = false)
  public void stop() throws Exception {
    hub.stop();
    remote.stopRemoteServer();
  }
}
