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

package org.openqa.grid.internal.listener;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertNotNull;
import static org.junit.Assert.assertTrue;

import org.junit.Before;
import org.junit.Test;
import org.openqa.grid.common.RegistrationRequest;
import org.openqa.grid.internal.DetachedRemoteProxy;
import org.openqa.grid.internal.Registry;
import org.openqa.grid.internal.TestSession;
import org.openqa.grid.internal.listeners.RegistrationListener;
import org.openqa.grid.internal.mock.GridHelper;
import org.openqa.grid.internal.utils.configuration.GridNodeConfiguration;
import org.openqa.grid.web.servlet.handler.RequestHandler;
import org.openqa.selenium.remote.CapabilityType;

import java.util.HashMap;
import java.util.Map;


public class RegistrationListenerTest {

  private boolean serverUp = false;

  private class MyRemoteProxy extends DetachedRemoteProxy implements RegistrationListener {

    public MyRemoteProxy(RegistrationRequest request, Registry registry) {
      super(request, registry);
    }

    public void beforeRegistration() {
      try {
        Thread.sleep(1000);
      } catch (InterruptedException e) {
        e.printStackTrace();
      }
      serverUp = true;
    }
  }

  private RegistrationRequest req;
  private Map<String, Object> app1 = new HashMap<>();

  @Before
  public void prepareReqRequest() {
    GridNodeConfiguration config = new GridNodeConfiguration();
    app1.put(CapabilityType.APPLICATION_NAME, "app1");
    config.host = "machine1";
    config.port = 4444;
    req = new RegistrationRequest();
    req.addDesiredCapability(app1);
    req.setConfiguration(config);
  }

  @Test(timeout = 5000)
  public void testRegistration() {
    Registry registry = Registry.newInstance();
    registry.add(new MyRemoteProxy(req, registry));

    RequestHandler request = GridHelper.createNewSessionHandler(registry, app1);
    request.process();

    assertNotNull(request.getSession());
    assertTrue(serverUp);
  }

  private final Object lock = new Object();
  private Boolean firstRun = true;

  /**
   * this proxy will throw an exception on registration the first time.
   *
   * @author François Reynaud
   */
  private class MyBuggyRemoteProxy extends DetachedRemoteProxy implements RegistrationListener {

    public MyBuggyRemoteProxy(RegistrationRequest request, Registry registry) {
      super(request, registry);
    }

    public void beforeRegistration() {
      synchronized (lock) {
        if (firstRun) {
          firstRun = false;
          throw new NullPointerException();
        }
      }
    }
  }

  /**
   * proxy not registered when throw an exception during registration
   */
  @Test
  public void testBugRegistration() {
    Registry registry = Registry.newInstance();
    registry.add(new MyBuggyRemoteProxy(req, registry));
    registry.add(new MyBuggyRemoteProxy(req, registry));

    assertEquals(registry.getAllProxies().size(), 1);
  }

  private boolean slowRemoteUp = false;

  private class MySlowRemoteProxy extends DetachedRemoteProxy implements RegistrationListener {

    public MySlowRemoteProxy(RegistrationRequest request, Registry registry) {
      super(request, registry);
    }

    public void beforeRegistration() {
      try {
        Thread.sleep(1000);
      } catch (InterruptedException e) {
        e.printStackTrace();
      }
      slowRemoteUp = true;
    }
  }


  /**
   * register a regular proxy for app1 and a slow one. try to reserve 2 * app1 1 should be reserved
   * directly. 1 should wait for the slow proxy to finish the registration properly before
   * returning
   */
  @Test(timeout = 2000)
  public void registerSomeSlow() {
    final Registry registry = Registry.newInstance();
    try {
      registry.add(new DetachedRemoteProxy(req, registry));
      new Thread(new Runnable() { // Thread safety reviewed
        public void run() {
          registry.add(new MySlowRemoteProxy(req, registry));
        }
      }).start();

      // slow proxy hasn't finished to start slow remote, isn't accessible via
      // the registry yet
      assertEquals(registry.getAllProxies().size(), 1);
      // check onRegistration has not run yet.
      assertEquals(slowRemoteUp, false);
      // should return right away, as RemoteProxy is fast.
      RequestHandler req =GridHelper.createNewSessionHandler(registry, app1);
      req.process();
      TestSession s1 = req.getSession();
      assertNotNull(s1);

      // slow proxy hasn't finished to start slow remote, isn't accessible via
      // the registry yet
      assertEquals(registry.getAllProxies().size(), 1);
      // check onRegistration has not run yet.
      assertEquals(false, slowRemoteUp);

      // will block until MySlowRemoteProxy is fully registered.
      RequestHandler req2 = GridHelper.createNewSessionHandler(registry, app1);
      req2.process();
      TestSession s2 = req2.getSession();
      assertNotNull(s2);
      // return when the proxy is visible = fully registered. So registry has
      // 2 proxies at that point.
      assertEquals(2, registry.getAllProxies().size());
      // and slow remote is up
      assertTrue(slowRemoteUp);
    } finally {
      registry.stop();
    }

  }

}
