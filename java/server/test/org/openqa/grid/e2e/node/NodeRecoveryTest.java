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
import org.openqa.grid.e2e.utils.GridTestHelper;
import org.openqa.grid.e2e.utils.RegistryTestHelper;
import org.openqa.grid.internal.RemoteProxy;
import org.openqa.grid.internal.utils.GridHubConfiguration;
import org.openqa.grid.internal.utils.SelfRegisteringRemote;
import org.openqa.grid.web.Hub;
import org.openqa.selenium.net.PortProber;
import org.testng.Assert;
import org.testng.annotations.BeforeClass;
import org.testng.annotations.Test;

import com.thoughtworks.selenium.DefaultSelenium;
import com.thoughtworks.selenium.Selenium;

/**
 * a node should be allowed to stop / crash and restart. When the node restarts, it replaces the old
 * one, updating its configuration is necessary.
 * 
 * @author freynaud
 * 
 */
public class NodeRecoveryTest {

  private Hub hub;
  SelfRegisteringRemote node;

  int originalTimeout = 3000;
  int newtimeout = 20000;

  @BeforeClass(alwaysRun = true)
  public void setup() throws Exception {
    GridHubConfiguration config = new GridHubConfiguration();
    config.setHost("localhost");
    config.setPort(PortProber.findFreePort());
    hub = new Hub(config);

    hub.start();

    node = GridTestHelper.getRemoteWithoutCapabilities(hub.getUrl(), GridRole.NODE);
    // register a selenium 1 with a timeout of 3 sec
    
    node.addBrowser(GridTestHelper.getSelenium1FirefoxCapability(), 1);
    node.setTimeout(originalTimeout, 1000);
    node.startRemoteServer();
    node.sendRegistrationRequest();
    RegistryTestHelper.waitForNode(hub.getRegistry(), 1);
  }

  @Test
  public void nodeServerCanStopAndRestart() throws Exception {

    Assert.assertEquals(hub.getRegistry().getAllProxies().size(), 1);
    for (RemoteProxy p : hub.getRegistry().getAllProxies()) {
      Assert.assertEquals(p.getTimeOut(), originalTimeout);
    }

    String url = "http://" + hub.getHost() + ":" + hub.getPort() + "/grid/console";

    Selenium selenium = new DefaultSelenium(hub.getHost(), hub.getPort(), "*firefox", url);
    selenium.start();

    // kill the node
    node.stopRemoteServer();


    // change its config.
    node.setTimeout(newtimeout, 1000);


    // restart it
    node.startRemoteServer();
    node.sendRegistrationRequest();

    // wait for 5 sec : the timeout of the original node should be reached, and the session freed
    Thread.sleep(5000);

    Assert.assertEquals(hub.getRegistry().getActiveSessions().size(), 0);

    Assert.assertEquals(hub.getRegistry().getAllProxies().size(), 1);


    for (RemoteProxy p : hub.getRegistry().getAllProxies()) {
      System.out.println(p);
      Assert.assertEquals(p.getTimeOut(), newtimeout);
    }

  }
}
