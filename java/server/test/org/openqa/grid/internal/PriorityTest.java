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

import static org.junit.Assert.assertNotNull;

import org.junit.After;
import org.junit.Before;
import org.junit.Test;
import org.openqa.grid.internal.listeners.Prioritizer;
import org.openqa.grid.internal.mock.GridHelper;
import org.openqa.grid.web.servlet.handler.RequestHandler;
import org.openqa.selenium.remote.CapabilityType;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;


public class PriorityTest {

  private Registry registry;

  // priority rule : the request with the highest priority goes first.
  private static Prioritizer highestNumberHasPriority = new Prioritizer() {
    public int compareTo(Map<String, Object> a, Map<String, Object> b) {
      int priorityA = Integer.parseInt(a.get("_priority").toString());
      int priorityB = Integer.parseInt(b.get("_priority").toString());
      return priorityB - priorityA;
    }
  };

  private Map<String, Object> ff = new HashMap<>();
  private RemoteProxy p1;

  private RequestHandler newSessionRequest1;
  private RequestHandler newSessionRequest2;
  private RequestHandler newSessionRequest3;
  private RequestHandler newSessionRequest4;
  private RequestHandler newSessionRequest5;

  private List<RequestHandler> requests = new ArrayList<>();

  /**
   * create a hub with 1 FF
   *
   * @throws InterruptedException
   */
  @Before
  public void setup() throws Exception {
    registry = Registry.newInstance();
    registry.getConfiguration().prioritizer = highestNumberHasPriority;
    ff.put(CapabilityType.APPLICATION_NAME, "FF");
    p1 = RemoteProxyFactory.getNewBasicRemoteProxy(ff, "http://machine1:4444", registry);
    registry.add(p1);

    // create 5 sessionRequest, with priority =1 .. 5
    Map<String, Object> ff1 = new HashMap<>();
    ff1.put(CapabilityType.APPLICATION_NAME, "FF");
    ff1.put("_priority", 1);

    Map<String, Object> ff2 = new HashMap<>();
    ff2.put(CapabilityType.APPLICATION_NAME, "FF");
    ff2.put("_priority", 2);

    Map<String, Object> ff3 = new HashMap<>();
    ff3.put(CapabilityType.APPLICATION_NAME, "FF");
    ff3.put("_priority", 3);

    Map<String, Object> ff4 = new HashMap<>();
    ff4.put(CapabilityType.APPLICATION_NAME, "FF");
    ff4.put("_priority", 4);

    Map<String, Object> ff5 = new HashMap<>();
    ff5.put(CapabilityType.APPLICATION_NAME, "FF");
    ff5.put("_priority", 5);

    newSessionRequest1 = GridHelper.createNewSessionHandler(registry, ff1);
    newSessionRequest2 = GridHelper.createNewSessionHandler(registry, ff2);
    newSessionRequest3 = GridHelper.createNewSessionHandler(registry, ff3);
    newSessionRequest4 = GridHelper.createNewSessionHandler(registry, ff4);
    newSessionRequest5 = GridHelper.createNewSessionHandler(registry, ff5);

    requests.add(newSessionRequest1);
    requests.add(newSessionRequest2);
    requests.add(newSessionRequest5);
    requests.add(newSessionRequest3);
    requests.add(newSessionRequest4);

    RequestHandler newSessionRequest = GridHelper.createNewSessionHandler(registry, ff);
    newSessionRequest.process();
    TestSession session = newSessionRequest.getSession();

    // fill the queue with 5 requests.
    for (RequestHandler h : requests) {
      final RequestHandler req = h;
      new Thread(new Runnable() { // Thread safety reviewed
            public void run() {
              req.process();
            }
          }).start();
    }

    while (registry.getNewSessionRequestCount() != 5) {
      Thread.sleep(100);
    }

    // free the grid : the queue is consumed, and the test with the highest
    // priority should be processed.
    registry.terminateSynchronousFOR_TEST_ONLY(session);

  }


  // validate that the one with priority 5 has been assigned a proxy
  @Test
  public void validate() throws InterruptedException {
    Thread.sleep(250);
    assertNotNull(newSessionRequest5.getSession());
  }


  @After
  public void teardown() {
    registry.stop();
  }

}
