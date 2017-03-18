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
import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertTrue;

import com.google.common.base.Function;
import com.google.common.base.Throwables;

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
import org.openqa.selenium.remote.server.SeleniumServer;
import org.openqa.selenium.support.ui.FluentWait;

import java.util.Iterator;
import java.util.concurrent.Callable;

public class DefaultProxyIsUnregisteredIfDownForTooLongTest {

  private Hub hub;
  private Registry registry;
  private SelfRegisteringRemote remote;

  private String proxyId;

  @Before
  public void prepare() throws Exception {
    hub = GridTestHelper.getHub();
    registry = hub.getRegistry();

    remote = GridTestHelper.getRemoteWithoutCapabilities(hub.getUrl(), GridRole.NODE);

    // check if the node is up every 900 ms
    remote.getConfiguration().nodePolling = 900;
    // unregister the proxy is it's down for more than 10 sec in a row.
    remote.getConfiguration().unregisterIfStillDownAfter = 10000;
    // mark as down after 3 tries
    remote.getConfiguration().downPollingLimit = 3;
    // limit connection and socket timeout for node alive check up to
    remote.getConfiguration().nodeStatusCheckTimeout = 100;
    // add browser
    remote.addBrowser(GridTestHelper.getDefaultBrowserCapability(), 1);

    remote.setRemoteServer(new SeleniumServer(remote.getConfiguration()));
    remote.startRemoteServer();
    remote.sendRegistrationRequest();
    RegistryTestHelper.waitForNode(registry, 1);

    proxyId = getProxyId();
  }

  @Test
  public void proxyIsUnregistered() throws InterruptedException {
    DefaultRemoteProxy p;

    // should be up
    assertTrue(registry.getAllProxies().size() == 1);
    p = (DefaultRemoteProxy) registry.getAllProxies().getProxyById(proxyId);
    waitFor(isUp(p));

    remote.stopRemoteServer();

    // first mark down - proxy is not down, proxy is not unregistered.
    Thread.sleep(1500);
    assertTrue(registry.getAllProxies().size() == 1);
    p = (DefaultRemoteProxy) registry.getAllProxies().getProxyById(proxyId);
    assertFalse(p.isDown());

    // node is considered down - proxy is down, proxy is not unregistered.
    // sleep interval should be bigger than (STATUS_CHECK_TIMEOUT + NODE_POLLING) * DOWN_POLLING_LIMIT
    // but less than UNREGISTER_IF_STILL_DOWN_AFTER (with previous sleeps accounting).
    Thread.sleep(3500);
    assertTrue(registry.getAllProxies().size() == 1);
    p = (DefaultRemoteProxy) registry.getAllProxies().getProxyById(proxyId);
    assertTrue(p.isDown());

    Thread.sleep(10000);

    // and finally removed after time > UNREGISTER_IF_STILL_DOWN_AFTER
    RegistryTestHelper.waitForNode(registry, 0);
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

  private String getProxyId() throws Exception {
    RemoteProxy p = null;
    Iterator<RemoteProxy> it = registry.getAllProxies().iterator();
    while(it.hasNext()) {
      p = it.next();
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
  public void tearDown() throws Exception {
    hub.stop();
  }

  private <V> void waitFor(final Callable<V> thing) {
    new FluentWait<Object>("").withTimeout(30, SECONDS).until(new Function<Object, V>() {

      @Override
      public V apply(Object input) {
        try {
          return thing.call();
        } catch (Exception e) {
          throw Throwables.propagate(e);
        }
      }
    });
  }
}
