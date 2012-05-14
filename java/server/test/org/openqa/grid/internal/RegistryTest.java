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

package org.openqa.grid.internal;

import static org.openqa.grid.common.RegistrationRequest.MAX_SESSION;
import static org.openqa.grid.common.RegistrationRequest.REMOTE_HOST;

import java.util.HashMap;
import java.util.Map;
import java.util.Random;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.atomic.AtomicInteger;

import org.junit.Assert;
import org.junit.BeforeClass;
import org.junit.Test;
import org.openqa.grid.common.RegistrationRequest;
import org.openqa.grid.common.exception.CapabilityNotPresentOnTheGridException;
import org.openqa.grid.common.exception.GridException;
import org.openqa.grid.internal.listeners.RegistrationListener;
import org.openqa.grid.internal.mock.GridHelper;
import org.openqa.grid.web.servlet.handler.RequestHandler;
import org.openqa.selenium.remote.CapabilityType;

public class RegistryTest {

  private static final int TOTAL_THREADS = 100;


  @Test
  public void addProxy() {
    Registry registry = Registry.newInstance();
    RemoteProxy p1 =
        RemoteProxyFactory.getNewBasicRemoteProxy("app1", "http://machine1:4444/", registry);
    RemoteProxy p2 =
        RemoteProxyFactory.getNewBasicRemoteProxy("app1", "http://machine2:4444/", registry);
    RemoteProxy p3 =
        RemoteProxyFactory.getNewBasicRemoteProxy("app1", "http://machine3:4444/", registry);
    RemoteProxy p4 =
        RemoteProxyFactory.getNewBasicRemoteProxy("app1", "http://machine4:4444/", registry);
    try {
      registry.add(p1);
      registry.add(p2);
      registry.add(p3);
      registry.add(p4);
      Assert.assertTrue(registry.getAllProxies().size() == 4);
    } finally {
      registry.stop();
    }
  }

  @Test
  public void addDuppedProxy() {
    Registry registry = Registry.newInstance();
    RemoteProxy p1 =
        RemoteProxyFactory.getNewBasicRemoteProxy("app1", "http://machine1:4444/", registry);
    RemoteProxy p2 =
        RemoteProxyFactory.getNewBasicRemoteProxy("app1", "http://machine2:4444/", registry);
    RemoteProxy p3 =
        RemoteProxyFactory.getNewBasicRemoteProxy("app1", "http://machine3:4444/", registry);
    RemoteProxy p4 =
        RemoteProxyFactory.getNewBasicRemoteProxy("app1", "http://machine4:4444/", registry);

    try {
      registry.add(p1);
      registry.add(p2);
      registry.add(p3);
      registry.add(p4);
      registry.add(p4);
      Assert.assertTrue(registry.getAllProxies().size() == 4);
    } finally {
      registry.stop();
    }
  }

  static RegistrationRequest req = null;
  static Map<String, Object> app1 = new HashMap<String, Object>();
  static Map<String, Object> app2 = new HashMap<String, Object>();

  @BeforeClass
  public static void prepareReqRequest() {
    Map<String, Object> config = new HashMap<String, Object>();
    app1.put(CapabilityType.BROWSER_NAME, "app1");
    app2.put(CapabilityType.BROWSER_NAME, "app2");
    config.put(REMOTE_HOST, "http://machine1:4444");
    config.put(MAX_SESSION, 5);
    req = new RegistrationRequest();
    req.addDesiredCapability(app1);
    req.setConfiguration(config);
  }

  @Test
  public void emptyRegistry() throws Throwable {
    Registry registry = Registry.newInstance();
    try {
      RequestHandler newSessionRequest = GridHelper.createNewSessionHandler(registry, app2);
      newSessionRequest.process();
    } catch (Exception e) {
      Assert.assertEquals(GridException.class, e.getCause().getClass());
    } finally {
      registry.stop();
    }
  }

  // @Test(timeout=2000) excepted timeout here.How to specify that in junit ?
  public void emptyRegistryParam() {
    Registry registry = Registry.newInstance();
    registry.setThrowOnCapabilityNotPresent(false);
    try {

      RequestHandler newSessionRequest = GridHelper.createNewSessionHandler(registry, app2);
      newSessionRequest.process();
    } finally {
      registry.stop();
    }

  }

  @Test
  public void CapabilityNotPresentRegistry() throws Throwable {
    Registry registry = Registry.newInstance();
    try {
      registry.add(new BaseRemoteProxy(req, registry));
      RequestHandler newSessionRequest = GridHelper.createNewSessionHandler(registry, app2);
      System.out.println(newSessionRequest.getRequest().getDesiredCapabilities());
      newSessionRequest.process();
      System.out.println("new " + newSessionRequest.getSession());
    } catch (Exception e) {
      Assert.assertEquals(CapabilityNotPresentOnTheGridException.class, e.getCause().getClass());
    } finally {
      registry.stop();
    }
  }

  // @Test(timeout=2000) excepted timeout here.How to specify that in junit ?
  public void CapabilityNotPresentRegistryParam() {
    Registry registry = Registry.newInstance();
    registry.setThrowOnCapabilityNotPresent(false);
    try {
      registry.add(new BaseRemoteProxy(req, registry));

      RequestHandler newSessionRequest = GridHelper.createNewSessionHandler(registry, app2);
      newSessionRequest.process();

    } finally {
      registry.stop();
    }
  }

  @Test(timeout = 1000)
  public void registerAtTheSameTime() throws InterruptedException {
    final Registry registry = Registry.newInstance();
    final CountDownLatch latch = new CountDownLatch(TOTAL_THREADS);

    try {
      for (int i = 0; i < TOTAL_THREADS; i++) {
        new Thread(new Runnable() { // Thread safety reviewed

          public void run() {
            registry.add(new BaseRemoteProxy(req, registry));
            latch.countDown();
          }
        }).start();
      }

      latch.await();
      Assert.assertEquals(registry.getAllProxies().size(), 1);
    } finally {
      registry.stop();
    }
  }

  private Random randomGenerator = new Random();

  /**
   * try to simulate a real proxy. The proxy registration takes up to 1 sec to register, and crashes
   * in 10% of the case.
   *
   * @author Francois Reynaud
   */
  class MyRemoteProxy extends BaseRemoteProxy implements RegistrationListener {

    public MyRemoteProxy(RegistrationRequest request, Registry registry) {
      super(request, registry);

    }

    public void beforeRegistration() {
      int registrationTime = randomGenerator.nextInt(1000);
      if (registrationTime > 900) {
        throw new NullPointerException();
      }
      try {
        Thread.sleep(registrationTime);
      } catch (InterruptedException e) {
      }
    }
  }

  @Test(timeout = 2000)
  public void registerAtTheSameTimeWithListener() throws InterruptedException {
    final Registry registry = Registry.newInstance();
    final AtomicInteger counter = new AtomicInteger();

    try {
      for (int i = 0; i < TOTAL_THREADS; i++) {
        new Thread(new Runnable() { // Thread safety reviewed

          public void run() {
            registry.add(new MyRemoteProxy(req, registry));
            counter.incrementAndGet();
          }
        }).start();
      }
      while (counter.get() != TOTAL_THREADS) {
        Thread.sleep(250);
      }
      Assert.assertEquals(counter.get(), TOTAL_THREADS);
      Assert.assertEquals(registry.getAllProxies().size(), 1);
    } finally {
      registry.stop();
    }
  }

}
