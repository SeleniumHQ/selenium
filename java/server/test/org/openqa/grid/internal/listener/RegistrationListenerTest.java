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

package org.openqa.grid.internal.listener;

import static org.openqa.grid.common.RegistrationRequest.APP;
import static org.openqa.grid.common.RegistrationRequest.REMOTE_HOST;

import java.util.HashMap;
import java.util.Map;

import org.junit.Assert;
import org.junit.BeforeClass;
import org.junit.Test;
import org.openqa.grid.common.RegistrationRequest;
import org.openqa.grid.internal.BaseRemoteProxy;
import org.openqa.grid.internal.Registry;
import org.openqa.grid.internal.TestSession;
import org.openqa.grid.internal.listeners.RegistrationListener;
import org.openqa.grid.internal.mock.GridHelper;
import org.openqa.grid.web.servlet.handler.RequestHandler;


public class RegistrationListenerTest {

  private static boolean serverUp = false;

  static class MyRemoteProxy extends BaseRemoteProxy implements RegistrationListener {

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

  static RegistrationRequest req = null;
  static Map<String, Object> app1 = new HashMap<String, Object>();

  @BeforeClass
  public static void prepareReqRequest() {
    Map<String, Object> config = new HashMap<String, Object>();
    app1.put(APP, "app1");
    config.put(REMOTE_HOST, "http://machine1:4444");
    config.put("host","localhost");
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

    Assert.assertNotNull(request.getSession());
    Assert.assertTrue(serverUp);
  }

  private static Boolean firstRun = true;

  /**
   * this proxy will throw an exception on registration the first time.
   *
   * @author François Reynaud
   */
  static class MyBuggyRemoteProxy extends BaseRemoteProxy implements RegistrationListener {

    public MyBuggyRemoteProxy(RegistrationRequest request, Registry registry) {
      super(request, registry);
    }

    public void beforeRegistration() {
      synchronized (firstRun) {
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

    Assert.assertEquals(registry.getAllProxies().size(), 1);
  }

  static boolean slowRemoteUp = false;

  static class MySlowRemoteProxy extends BaseRemoteProxy implements RegistrationListener {

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
      registry.add(new BaseRemoteProxy(req, registry));
      new Thread(new Runnable() { // Thread safety reviewed
        public void run() {
          registry.add(new MySlowRemoteProxy(req, registry));
        }
      }).start();

      // slow proxy hasn't finished to start slow remote, isn't accessible via
      // the registry yet
      Assert.assertEquals(registry.getAllProxies().size(), 1);
      // check onRegistration has not run yet.
      Assert.assertEquals(slowRemoteUp, false);
      // should return right away, as RemoteProxy is fast.
      RequestHandler req =GridHelper.createNewSessionHandler(registry, app1);
      req.process();
      TestSession s1 = req.getSession();
      Assert.assertNotNull(s1);

      // slow proxy hasn't finished to start slow remote, isn't accessible via
      // the registry yet
      Assert.assertEquals(registry.getAllProxies().size(), 1);
      // check onRegistration has not run yet.
      Assert.assertEquals(false, slowRemoteUp);

      // will block until MySlowRemoteProxy is fully registered.
      RequestHandler req2 = GridHelper.createNewSessionHandler(registry, app1);
      req2.process();
      TestSession s2 = req2.getSession();
      Assert.assertNotNull(s2);
      // return when the proxy is visible = fully registered. So registry has
      // 2 proxies at that point.
      Assert.assertEquals(2, registry.getAllProxies().size());
      // and slow remote is up
      Assert.assertTrue(slowRemoteUp);
    } finally {
      registry.stop();
    }

  }

}
