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

import static org.junit.Assert.assertEquals;

import org.junit.BeforeClass;
import org.junit.Ignore;
import org.junit.Test;
import org.openqa.grid.common.GridRole;
import org.openqa.grid.e2e.utils.GridTestHelper;
import org.openqa.grid.e2e.utils.RegistryTestHelper;
import org.openqa.grid.internal.RemoteProxy;
import org.openqa.grid.internal.utils.GridHubConfiguration;
import org.openqa.grid.internal.utils.SelfRegisteringRemote;
import org.openqa.grid.web.Hub;
import org.openqa.selenium.net.PortProber;
import org.openqa.selenium.remote.DesiredCapabilities;
import org.openqa.selenium.remote.RemoteWebDriver;

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

  private static int originalTimeout = 3000;
  private static int newtimeout = 20000;

  @BeforeClass
  public static void setup() throws Exception {
    GridHubConfiguration config = new GridHubConfiguration();
    config.setHost("localhost");
    config.setPort(PortProber.findFreePort());
    hub = new Hub(config);

    hub.start();

    node = GridTestHelper.getRemoteWithoutCapabilities(hub.getUrl(), GridRole.NODE);
    // register a selenium 1 with a timeout of 3 sec
    
    node.addBrowser(GridTestHelper.getDefaultBrowserCapability(), 1);
    node.setTimeout(originalTimeout, 1000);
    node.startRemoteServer();
    node.sendRegistrationRequest();
    RegistryTestHelper.waitForNode(hub.getRegistry(), 1);
  }

  @Ignore
  @Test
  public void nodeServerCanStopAndRestart() throws Exception {

    assertEquals(hub.getRegistry().getAllProxies().size(), 1);
    for (RemoteProxy p : hub.getRegistry().getAllProxies()) {
      assertEquals(p.getTimeOut(), originalTimeout);
    }

    URL hubURL = new URL("http://" + hub.getHost() + ":" + hub.getPort());

    DesiredCapabilities caps = GridTestHelper.getDefaultBrowserCapability();
    new RemoteWebDriver(new URL(hubURL + "/grid/driver"), caps);

    // kill the node
    node.stopRemoteServer();


    // change its config.
    node.setTimeout(newtimeout, 1000);

    // restart it
    node.startRemoteServer();
    node.sendRegistrationRequest();

    // wait for 5 sec : the timeout of the original node should be reached, and the session freed
    Thread.sleep(5000);

    assertEquals(hub.getRegistry().getActiveSessions().size(), 0);

    assertEquals(hub.getRegistry().getAllProxies().size(), 1);


    for (RemoteProxy p : hub.getRegistry().getAllProxies()) {
      System.out.println(p);
      assertEquals(p.getTimeOut(), newtimeout);
    }

  }
}
