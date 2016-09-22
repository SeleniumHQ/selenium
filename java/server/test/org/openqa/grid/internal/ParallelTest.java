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

package org.openqa.grid.internal;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertFalse;
import static org.openqa.grid.common.RegistrationRequest.MAX_INSTANCES;

import org.junit.Before;
import org.junit.Test;
import org.openqa.grid.common.RegistrationRequest;
import org.openqa.grid.internal.mock.GridHelper;
import org.openqa.grid.internal.mock.MockedRequestHandler;
import org.openqa.grid.internal.utils.configuration.GridNodeConfiguration;
import org.openqa.grid.web.servlet.handler.RequestHandler;
import org.openqa.selenium.remote.CapabilityType;
import org.openqa.selenium.remote.DesiredCapabilities;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.atomic.AtomicInteger;

public class ParallelTest {

  private RegistrationRequest req = null;
  private Map<String, Object> app1 = new HashMap<>();
  private Map<String, Object> app2 = new HashMap<>();

  /**
   * a proxy than can host up to 5 tests at the same time. - of type app1 ( max 5 tests at the same
   * time ) could be Firefox for instance - of type app2 ( max 1 test ) could be IE
   */
  @Before
  public void prepareReqRequest() {

    app1.put(CapabilityType.APPLICATION_NAME, "app1");
    app1.put(MAX_INSTANCES, 5);

    app2.put(CapabilityType.APPLICATION_NAME, "app2");
    app2.put(MAX_INSTANCES, 1);

    req = new RegistrationRequest();
    req.getConfiguration().host = "machine1";
    req.getConfiguration().port = 4444;
    req.getConfiguration().maxSession = 5;
    req.getConfiguration().capabilities.add(new DesiredCapabilities(app1));
    req.getConfiguration().capabilities.add(new DesiredCapabilities(app2));
  }

  @Test
  public void canGetApp2() {
    Registry registry = Registry.newInstance();
    RemoteProxy p1 = new DetachedRemoteProxy(req, registry);
    try {
      registry.add(p1);
      RequestHandler newSessionRequest = GridHelper.createNewSessionHandler(registry, app2);
      newSessionRequest.process();
    } finally {
      registry.stop();
    }

  }

  private volatile boolean processed = false;

  /**
   * cannot reserve 2 app2
   *
   * @throws InterruptedException
   */
  @Test
  public void cannotGet2App2() throws InterruptedException {
    final Registry registry = Registry.newInstance();
    RemoteProxy p1 = new DetachedRemoteProxy(req, registry);
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
      assertFalse(processed); // Can race, but should *never* fail
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
    RemoteProxy p1 = new DetachedRemoteProxy(req, registry);
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
    RemoteProxy p1 = new DetachedRemoteProxy(req, registry);
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
      assertEquals(5, count.get());
    } finally {
      registry.stop();
    }
  }


//  private volatile int cpt2 = 0;
//
//  private synchronized void inc2() {
//    cpt2++;
//  }

  private boolean app6Done = false;

  /**
   * cannot get app2 if 5 app1 are reserved.
   *
   * @throws InterruptedException
   */
  @Test(timeout = 1000)
  public void cannotGetApp2() throws InterruptedException {
    final Registry registry = Registry.newInstance();
    RemoteProxy p1 = new DetachedRemoteProxy(req, registry);
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
      assertFalse(app6Done); // May race, but will never be true
    } finally {
      registry.stop();
    }
  }

  @Test(timeout = 10000)
  public void releaseAndReserve() {
    Registry registry = Registry.newInstance();
    RemoteProxy p1;
    RegistrationRequest req;
    Map<String, Object> app1 = new HashMap<>();
    Map<String, Object> app2 = new HashMap<>();
    GridNodeConfiguration config = new GridNodeConfiguration();
    app1.put(CapabilityType.APPLICATION_NAME, "app1");
    app1.put(MAX_INSTANCES, 5);

    app2.put(CapabilityType.APPLICATION_NAME, "app2");
    app2.put(MAX_INSTANCES, 1);

    req = new RegistrationRequest();
    req.getConfiguration().host = "machine1";
    req.getConfiguration().port = 4444;
    req.getConfiguration().maxSession = 5;
    req.getConfiguration().capabilities.add(new DesiredCapabilities(app1));
    req.getConfiguration().capabilities.add(new DesiredCapabilities(app2));
    req.getConfiguration().proxy = DetachedRemoteProxy.class.getCanonicalName();

    p1 = BaseRemoteProxy.getNewInstance(req, registry);

    try {
      registry.add(p1);

      // reserve 5 app1
      List<TestSession> used = new ArrayList<>();
      for (int i = 0; i < 5; i++) {
        RequestHandler newSessionRequest = GridHelper.createNewSessionHandler(registry, app1);
        newSessionRequest.process();
        used.add(newSessionRequest.getSession());
      }

      assertEquals(registry.getActiveSessions().size(), 5);

      // release them
      for (TestSession session : used) {
        registry.terminateSynchronousFOR_TEST_ONLY(session);
      }
      assertEquals(registry.getActiveSessions().size(), 0);
      used.clear();

      // reserve them again
      for (int i = 0; i < 5; i++) {
        int original = registry.getActiveSessions().size();
        assertEquals(original, i);
        RequestHandler newSessionRequest = GridHelper.createNewSessionHandler(registry, app1);
        newSessionRequest.process();
        TestSession session = newSessionRequest.getSession();
        used.add(session);
      }

      assertEquals(registry.getActiveSessions().size(), 5);

      registry.terminateSynchronousFOR_TEST_ONLY(used.get(0));

      RequestHandler newSessionRequest = GridHelper.createNewSessionHandler(registry, app2);
      newSessionRequest.process();
      newSessionRequest.getSession();
      assertEquals(registry.getActiveSessions().size(), 5);
      System.out.println(registry.getAllProxies());
    } finally {
      registry.stop();
    }

  }

}
