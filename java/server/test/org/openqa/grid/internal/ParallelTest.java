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

import static org.openqa.grid.common.RegistrationRequest.APP;
import static org.openqa.grid.common.RegistrationRequest.MAX_INSTANCES;
import static org.openqa.grid.common.RegistrationRequest.MAX_SESSION;
import static org.openqa.grid.common.RegistrationRequest.REMOTE_HOST;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.atomic.AtomicInteger;

import org.junit.Assert;
import org.junit.BeforeClass;
import org.junit.Test;
import org.openqa.grid.common.RegistrationRequest;
import org.openqa.grid.internal.mock.GridHelper;
import org.openqa.grid.internal.mock.MockedRequestHandler;
import org.openqa.grid.web.servlet.handler.RequestHandler;

public class ParallelTest {

  static RegistrationRequest req = null;
  static Map<String, Object> app1 = new HashMap<String, Object>();
  static Map<String, Object> app2 = new HashMap<String, Object>();

  /**
   * a proxy than can host up to 5 tests at the same time. - of type app1 ( max 5 tests at the same
   * time ) could be Firefox for instance - of type app2 ( max 1 test ) could be IE
   */
  @BeforeClass
  public static void prepareReqRequest() {

    Map<String, Object> config = new HashMap<String, Object>();
    app1.put(APP, "app1");
    app1.put(MAX_INSTANCES, 5);

    app2.put(APP, "app2");
    app2.put(MAX_INSTANCES, 1);

    config.put(REMOTE_HOST, "http://machine1:4444");
    config.put(MAX_SESSION, 5);

    req = new RegistrationRequest();
    req.addDesiredCapability(app1);
    req.addDesiredCapability(app2);
    req.setConfiguration(config);
  }

  @Test
  public void canGetApp2() {
    Registry registry = Registry.newInstance();
    RemoteProxy p1 = new BaseRemoteProxy(req, registry);
    try {
      registry.add(p1);
      RequestHandler newSessionRequest = GridHelper.createNewSessionHandler(registry, app2);
      newSessionRequest.process();
    } finally {
      registry.stop();
    }

  }

  static volatile boolean processed = false;

  /**
   * cannot reserve 2 app2
   *
   * @throws InterruptedException
   */
  @Test
  public void cannotGet2App2() throws InterruptedException {
    final Registry registry = Registry.newInstance();
    RemoteProxy p1 = new BaseRemoteProxy(req, registry);
    try {
      registry.add(p1);
      MockedRequestHandler newSessionRequest = GridHelper.createNewSessionHandler(registry, app2);
      newSessionRequest.process();

      TestThreadCounter testThreadCounter = new TestThreadCounter();
      testThreadCounter.start(new Runnable() {
        public void run() {
          MockedRequestHandler newSessionRequest =
              GridHelper.createNewSessionHandler(registry, app2);
          newSessionRequest.process();
          processed = true;
        }
      });
      testThreadCounter.waitUntilStarted(1);
      Assert.assertFalse(processed); // Can race, but should *never* fail
    } finally {
      registry.stop();
    }
  }

  /**
   * can reserve 5 app1
   */
  @Test(timeout = 2000)
  public void canGet5App1() {
    final Registry registry = Registry.newInstance();
    RemoteProxy p1 = new BaseRemoteProxy(req, registry);
    try {
      registry.add(p1);
      for (int i = 0; i < 5; i++) {
        MockedRequestHandler newSessionRequest = GridHelper.createNewSessionHandler(registry, app1);
        newSessionRequest.process();
      }
    } finally {
      registry.stop();
    }
  }


  /**
   * cannot get 6 app1
   *
   * @throws InterruptedException
   */
  @Test(timeout = 1000)
  public void cannotGet6App1() throws InterruptedException {
    final Registry registry = Registry.newInstance();
    RemoteProxy p1 = new BaseRemoteProxy(req, registry);
    try {
      registry.add(p1);
      final AtomicInteger count = new AtomicInteger();
      TestThreadCounter testThreadCounter = new TestThreadCounter();
      for (int i = 0; i < 6; i++) {
        testThreadCounter.start(new Runnable() {
          public void run() {
            RequestHandler newSessionRequest = GridHelper.createNewSessionHandler(registry, app1);
            newSessionRequest.process();
            count.incrementAndGet();
          }
        });
      }
      testThreadCounter.waitUntilDone(5);
      Assert.assertEquals(5, count.get());
    } finally {
      registry.stop();
    }
  }


  static volatile int cpt2 = 0;

  static synchronized void inc2() {
    cpt2++;
  }

  static boolean app6Done = false;

  /**
   * cannot get app2 if 5 app1 are reserved.
   *
   * @throws InterruptedException
   */
  @Test(timeout = 1000)
  public void cannotGetApp2() throws InterruptedException {
    final Registry registry = Registry.newInstance();
    RemoteProxy p1 = new BaseRemoteProxy(req, registry);
    try {
      registry.add(p1);

      TestThreadCounter testThreadCounter = new TestThreadCounter();
      for (int i = 0; i < 5; i++) {
        testThreadCounter.start(new Runnable() {
          public void run() {
            RequestHandler newSessionRequest = GridHelper.createNewSessionHandler(registry, app1);
            newSessionRequest.process();
          }
        });
      }
      testThreadCounter.waitUntilDone(5);

      testThreadCounter.start(new Runnable() {
        public void run() {
          RequestHandler newSessionRequest = GridHelper.createNewSessionHandler(registry, app2);
          newSessionRequest.process();
          app6Done = true;
        }
      });

      testThreadCounter.waitUntilStarted(6);
      Assert.assertFalse(app6Done); // May race, but will never be true
    } finally {
      registry.stop();
    }
  }

  @Test(timeout = 10000)
  public void releaseAndReserve() {
    Registry registry = Registry.newInstance();
    RemoteProxy p1 = null;
    RegistrationRequest req = null;
    Map<String, Object> app1 = new HashMap<String, Object>();
    Map<String, Object> app2 = new HashMap<String, Object>();
    Map<String, Object> config = new HashMap<String, Object>();
    app1.put(APP, "app1");
    app1.put(MAX_INSTANCES, 5);

    app2.put(APP, "app2");
    app2.put(MAX_INSTANCES, 1);

    config.put(REMOTE_HOST, "http://machine1:4444");
    config.put(MAX_SESSION, 5);

    req = new RegistrationRequest();
    req.addDesiredCapability(app1);
    req.addDesiredCapability(app2);
    req.setConfiguration(config);

    p1 = BaseRemoteProxy.getNewInstance(req, registry);

    try {
      registry.add(p1);

      // reserve 5 app1
      List<TestSession> used = new ArrayList<TestSession>();
      for (int i = 0; i < 5; i++) {
        RequestHandler newSessionRequest = GridHelper.createNewSessionHandler(registry, app1);
        newSessionRequest.process();
        used.add(newSessionRequest.getSession());
      }

      Assert.assertEquals(registry.getActiveSessions().size(), 5);

      // release them
      for (TestSession session : used) {
        registry.terminateSynchronousFOR_TEST_ONLY(session);
      }
      Assert.assertEquals(registry.getActiveSessions().size(), 0);
      used.clear();

      // reserve them again
      for (int i = 0; i < 5; i++) {
        int original = registry.getActiveSessions().size();
        Assert.assertEquals(original, i);
        RequestHandler newSessionRequest = GridHelper.createNewSessionHandler(registry, app1);
        newSessionRequest.process();
        TestSession session = newSessionRequest.getSession();
        used.add(session);
      }

      Assert.assertEquals(registry.getActiveSessions().size(), 5);

      registry.terminateSynchronousFOR_TEST_ONLY(used.get(0));

      RequestHandler newSessionRequest = GridHelper.createNewSessionHandler(registry, app2);
      newSessionRequest.process();
      newSessionRequest.getSession();
      Assert.assertEquals(registry.getActiveSessions().size(), 5);
      System.out.println(registry.getAllProxies());
    } finally {
      registry.stop();
    }

  }

}
