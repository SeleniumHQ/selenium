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

import static java.util.concurrent.TimeUnit.SECONDS;
import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertNotNull;
import static org.junit.Assert.assertTrue;

import com.google.common.base.Function;

import org.junit.After;
import org.junit.Before;
import org.junit.Test;
import org.openqa.grid.common.GridRole;
import org.openqa.grid.e2e.utils.GridTestHelper;
import org.openqa.grid.e2e.utils.RegistryTestHelper;
import org.openqa.grid.internal.Registry;
import org.openqa.grid.internal.RemoteProxy;
import org.openqa.grid.internal.utils.SelfRegisteringRemote;
import org.openqa.grid.selenium.proxy.DefaultRemoteProxy;
import org.openqa.grid.web.Hub;
import org.openqa.selenium.WebDriverException;
import org.openqa.selenium.firefox.FirefoxDriver;
import org.openqa.selenium.remote.DesiredCapabilities;
import org.openqa.selenium.remote.RemoteWebDriver;
import org.openqa.selenium.remote.server.SeleniumServer;
import org.openqa.selenium.support.ui.FluentWait;
import org.openqa.selenium.support.ui.Wait;

import java.net.MalformedURLException;


public class CrashWhenStartingBrowserTest {

  private Hub hub;
  private SelfRegisteringRemote remote;
  private Registry registry;
  private Wait<Object> wait = new FluentWait<Object>("").withTimeout(30, SECONDS);

  private String proxyId;

  private static final String WRONG_PATH = "stupidPathUnliklyToExist";

  @Before
  public void prepareANodePointingToANonExistingFirefox() throws Exception {
    hub = GridTestHelper.getHub();
    registry = hub.getRegistry();

    remote = GridTestHelper.getRemoteWithoutCapabilities(hub.getUrl(), GridRole.NODE);

    remote.addBrowser(DesiredCapabilities.firefox(), 1);

    remote.setRemoteServer(new SeleniumServer(remote.getConfiguration()));
    remote.startRemoteServer();
    remote.sendRegistrationRequest();
    RegistryTestHelper.waitForNode(registry, 1);

    proxyId = getProxyId();
  }

  @Test
  public void serverCrashesStartingFirefox() throws MalformedURLException {
    // should be up
    DefaultRemoteProxy p;
    assertTrue(registry.getAllProxies().size() == 1);
    p = (DefaultRemoteProxy) registry.getAllProxies().getProxyById(proxyId);
    wait.until(isUp(p));

    // no active sessions
    assertEquals("active session is found on empty grid", 0, registry.getActiveSessions().size());

    WebDriverException exception = null;
    try {
      DesiredCapabilities ff = DesiredCapabilities.firefox();
      ff.setCapability(FirefoxDriver.BINARY, WRONG_PATH);
      new RemoteWebDriver(hub.getWebDriverHubRequestURL(), ff);
    } catch (WebDriverException expected) {
      exception = expected;
    }

    assertNotNull(exception);
    assertTrue(exception.getMessage().contains(WRONG_PATH));

    RegistryTestHelper.waitForActiveTestSessionCount(registry, 0);
  }

  private Function<Object, Boolean> isUp(final DefaultRemoteProxy proxy) {
    return new Function<Object, Boolean>() {
      @Override
      public Boolean apply(Object input) {
        return !proxy.isDown();
      }
    };
  }

  private String getProxyId() throws Exception {
    RemoteProxy p = null;
    for (RemoteProxy remoteProxy : registry.getAllProxies()) {
      p = remoteProxy;
    }
    if (p == null) {
      throw new Exception("Unable to find registered proxy at hub");
    }
    String proxyId = p.getId();
    if (proxyId == null) {
      throw  new Exception("Unable to get id of proxy");
    }
    return proxyId;
  }

  @After
  public void stop() throws Exception {
    remote.stopRemoteServer();
    hub.stop();
  }
}
