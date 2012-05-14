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

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.junit.AfterClass;
import org.junit.Assert;
import org.junit.BeforeClass;
import org.junit.Test;
import org.openqa.grid.internal.listeners.Prioritizer;
import org.openqa.grid.internal.mock.GridHelper;
import org.openqa.grid.web.servlet.handler.RequestHandler;


public class PriorityTest {

  private static Registry registry;

  // priority rule : the request with the highest priority goes first.
  private static Prioritizer highestNumberHasPriority = new Prioritizer() {
    public int compareTo(Map<String, Object> a, Map<String, Object> b) {
      int priorityA = Integer.parseInt(a.get("_priority").toString());
      int priorityB = Integer.parseInt(b.get("_priority").toString());
      return priorityB - priorityA;
    }
  };

  static Map<String, Object> ff = new HashMap<String, Object>();
  static RemoteProxy p1;

  static RequestHandler newSessionRequest1;
  static RequestHandler newSessionRequest2;
  static RequestHandler newSessionRequest3;
  static RequestHandler newSessionRequest4;
  static RequestHandler newSessionRequest5;

  static List<RequestHandler> requests = new ArrayList<RequestHandler>();

  /**
   * create a hub with 1 FF
   * 
   * @throws InterruptedException
   */
  @BeforeClass
  public static void setup() throws InterruptedException {
    registry = Registry.newInstance();
    registry.setPrioritizer(highestNumberHasPriority);
    ff.put(APP, "FF");
    p1 = RemoteProxyFactory.getNewBasicRemoteProxy(ff, "http://machine1:4444", registry);
    registry.add(p1);

    // create 5 sessionRequest, with priority =1 .. 5
    Map<String, Object> ff1 = new HashMap<String, Object>();
    ff1.put(APP, "FF");
    ff1.put("_priority", 1);

    Map<String, Object> ff2 = new HashMap<String, Object>();
    ff2.put(APP, "FF");
    ff2.put("_priority", 2);

    Map<String, Object> ff3 = new HashMap<String, Object>();
    ff3.put(APP, "FF");
    ff3.put("_priority", 3);

    Map<String, Object> ff4 = new HashMap<String, Object>();
    ff4.put(APP, "FF");
    ff4.put("_priority", 4);

    Map<String, Object> ff5 = new HashMap<String, Object>();
    ff5.put(APP, "FF");
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
    Assert.assertNotNull(newSessionRequest5.getSession());
  }


  @AfterClass
  public static void teardown() {
    registry.stop();
  }

}
