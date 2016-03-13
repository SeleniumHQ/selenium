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

import org.junit.After;
import org.junit.Before;
import org.junit.Test;
import org.openqa.grid.internal.mock.GridHelper;
import org.openqa.grid.web.servlet.handler.RequestHandler;
import org.openqa.selenium.remote.CapabilityType;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.CopyOnWriteArrayList;


public class SmokeTest {
  private Registry registry;

  private Map<String, Object> ie = new HashMap<>();
  private Map<String, Object> ff = new HashMap<>();

  private static final int MAX = 10;

  private volatile int ran = 0;

  /**
   * create a hub with 1 IE and 1 FF
   */
  @Before
  public void setup() throws Exception {
    registry = Registry.newInstance();
    ie.put(CapabilityType.APPLICATION_NAME, "IE");
    ff.put(CapabilityType.APPLICATION_NAME, "FF");

    RemoteProxy p1 =
      RemoteProxyFactory.getNewBasicRemoteProxy(ie, "http://machine1:4444", registry);
    RemoteProxy p2 =
      RemoteProxyFactory.getNewBasicRemoteProxy(ff, "http://machine2:4444", registry);
    registry.add(p1);
    registry.add(p2);
  }

  private synchronized void inc() {
    ran++;
  }


  @Test(timeout = 10000)
  public void method() throws InterruptedException {

    final List<TestSession> sessions = new CopyOnWriteArrayList<>();

    for (int i = 0; i < MAX; i++) {
      new Thread(new Runnable() { // Thread safety reviewed
        public void run() {
          RequestHandler newSessionRequest = GridHelper.createNewSessionHandler(registry, ie);
          newSessionRequest.process();
          TestSession session = newSessionRequest.getSession();
          inc();
          sessions.add(session);
        }
      }).start();
    }

    for (int i = 0; i < MAX; i++) {
      new Thread(new Runnable() {  // Thread safety reviewed
        public void run() {
          RequestHandler newSessionRequest =  GridHelper.createNewSessionHandler(registry, ff);
          newSessionRequest.process();
          TestSession session = newSessionRequest.getSession();
          inc();
          sessions.add(session);
        }
      }).start();
    }

    // 2 run on the hub.
    while (registry.getActiveSessions().size() != 2) {
      Thread.sleep(50);
    }

    // while the rest waits.
    while (registry.getNewSessionRequestCount() != 18) {
      Thread.sleep(50);
    }

    int stopped = 0;
    // all the tests ran via the registry.
    while (stopped < 2 * MAX) {
      for (TestSession session : sessions) {
        RequestHandler stopSessionRequest = GridHelper.createStopSessionHandler(registry, session);
        stopSessionRequest.process();
        stopped++;
        sessions.remove(session);
      }
    }
    // all request got the stop session request
    assertEquals(2 * MAX, stopped);
    // nothing left waiting
    assertEquals(0, registry.getNewSessionRequestCount());

    // nothing active. Waiting in case a stopSessionRequest.process() isn't finish. It's async.
    while (registry.getActiveSessions().size() != 0) {
      Thread.sleep(10);
    }
    assertEquals(0, registry.getActiveSessions().size());

    // everything was started.
    assertEquals(2 * MAX, ran);
  }

  @After
  public void teardown() {
    registry.stop();
  }
}
