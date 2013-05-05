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

import java.util.concurrent.Callable;

import org.openqa.grid.common.GridRole;
import org.openqa.grid.common.RegistrationRequest;
import org.openqa.grid.e2e.utils.GridTestHelper;
import org.openqa.grid.e2e.utils.RegistryTestHelper;
import org.openqa.grid.internal.Registry;
import org.openqa.grid.internal.RemoteProxy;
import org.openqa.grid.internal.utils.SelfRegisteringRemote;
import org.openqa.grid.selenium.proxy.DefaultRemoteProxy;
import org.openqa.grid.web.Hub;
import org.junit.AfterClass;
import org.junit.BeforeClass;
import org.junit.Test;

import static org.openqa.selenium.TestWaiter.waitFor;

//@Test(groups = {"slow", "firefox"})
public class NodeGoingDownAndUpTest {

  private static Hub hub;
  private static Registry registry;
  private static SelfRegisteringRemote remote;
  

  @BeforeClass
  public static void prepare() throws Exception {
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
    for (RemoteProxy proxy : registry.getAllProxies()) {
      waitFor(isUp((DefaultRemoteProxy) proxy));
    }
    // killing the nodes
    remote.stopRemoteServer();
    // should be down
    for (RemoteProxy proxy : registry.getAllProxies()) {
      waitFor(isDown((DefaultRemoteProxy) proxy));
    }
    // and back up
    remote.startRemoteServer();
    // should be down
    for (RemoteProxy proxy : registry.getAllProxies()) {
      waitFor(isUp((DefaultRemoteProxy) proxy));
    }
  }

  private Callable<Boolean> isUp(final DefaultRemoteProxy proxy) {
    return new Callable<Boolean>() {
      public Boolean call() throws Exception {
        return ! proxy.isDown();
      }
    };
  }

  private Callable<Boolean> isDown(final DefaultRemoteProxy proxy) {
    return new Callable<Boolean>() {
      public Boolean call() throws Exception {
        return proxy.isDown();
      }
    };
  }

  @AfterClass
  public static void stop() throws Exception {
    hub.stop();
    remote.stopRemoteServer();
  }
}
