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

import org.junit.After;
import org.junit.Before;
import org.junit.Test;


public class CrashWhenStartingBrowserTest {

//  private Hub hub;
//  private SelfRegisteringRemote remote;
//  private GridRegistry registry;
//  private Wait<Object> wait = new FluentWait<Object>("").withTimeout(Duration.ofSeconds(30));

  private String proxyId;

  private static final String WRONG_PATH = "stupidPathUnlikelyToExist";

  @Before
  public void prepareANodePointingToANonExistingFirefox() throws Exception {
//    hub = GridTestHelper.getHub();
//    registry = hub.getRegistry();
//
//    remote = GridTestHelper.getRemoteWithoutCapabilities(hub.getUrl(), GridRole.NODE);
//
//    remote.addBrowser(new DesiredCapabilities(new FirefoxOptions()), 1);
//
//    remote.setRemoteServer(new SeleniumServer(remote.getConfiguration()));
//    remote.startRemoteServer();
//    remote.sendRegistrationRequest();
//    RegistryTestHelper.waitForNode(registry, 1);
//
//    proxyId = getProxyId();
  }

  @Test
  public void serverCrashesStartingFirefox() {
//    // should be up
//    DefaultRemoteProxy p;
//    assertEquals(1, registry.getAllProxies().size());
//    p = (DefaultRemoteProxy) registry.getAllProxies().getProxyById(proxyId);
//    wait.until(isUp(p));
//
//    // no active sessions
//    assertEquals("active session is found on empty grid", 0, registry.getActiveSessions().size());
//
//    try {
//      Capabilities ff = new FirefoxOptions()
//          .setBinary(WRONG_PATH);
//      new RemoteWebDriver(hub.getWebDriverHubRequestURL(), ff);
//      fail("Expected WebDriverException to be thrown");
//    } catch (SessionNotCreatedException expected) {
//      assertTrue(
//          "We'd like to assert the path is in the message, but the spec does not demand this",
//          true);
//    }
//
//    RegistryTestHelper.waitForActiveTestSessionCount(registry, 0);
  }

//  private Function<Object, Boolean> isUp(final DefaultRemoteProxy proxy) {
//    return input -> !proxy.isDown();
//  }

//  private String getProxyId() throws Exception {
//    RemoteProxy p = null;
//    for (RemoteProxy remoteProxy : registry.getAllProxies()) {
//      p = remoteProxy;
//    }
//    if (p == null) {
//      throw new Exception("Unable to find registered proxy at hub");
//    }
//    String proxyId = p.getId();
//    if (proxyId == null) {
//      throw  new Exception("Unable to get id of proxy");
//    }
//    return proxyId;
//  }

  @After
  public void stop() {
//    remote.stopRemoteServer();
//    hub.stop();
  }
}
