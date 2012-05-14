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


/**
 * Grid with only 1 node. Sending MAX thread in it to load the queue and keep it ordered.
 */
public class PriorityTestLoad {

  private final static int MAX = 100;

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

    for (int i = 1; i <= MAX; i++) {
      Map<String, Object> cap = new HashMap<String, Object>();
      cap.put(APP, "FF");
      cap.put("_priority", i);
      RequestHandler req = GridHelper.createNewSessionHandler(registry, cap);
      requests.add(req);
    }

    // use all the proxies
    RequestHandler newSessionRequest = GridHelper.createNewSessionHandler(registry, ff);
    newSessionRequest.process();
    TestSession session = newSessionRequest.getSession();

    // and keep adding request in the queue.
    for (RequestHandler h : requests) {
      final RequestHandler req = h;
      new Thread(new Runnable() {  // Thread safety reviewed
        public void run() {
          req.process();
          reqDone = true;
        }
      }).start();
    }

    // wait for all the request to reach the queue.
    while (registry.getNewSessionRequestCount() != MAX) {
      Thread.sleep(250);
    }

    // release the initial request.
    registry.terminateSynchronousFOR_TEST_ONLY(session);
  }

  private static volatile boolean reqDone = false;


  // validate that the one with priority MAX has been assigned a proxy
  @Test(timeout = 5000)
  public void validate() throws InterruptedException {
    // using a flag here. The queue contains all the requests.
    // when release is executed, 1 slot is
    // freed.The iteration over the queue to sort + find the match isn't
    // instant.
    while (!reqDone) {
      Thread.sleep(20);
    }
    Assert.assertNotNull(requests.get(requests.size() - 1).getSession());
    Assert.assertEquals(
        requests.get(requests.size() - 1).getRequest().getDesiredCapabilities().get("_priority"), MAX);
  }

  @AfterClass
  public static void teardown() {
    registry.stop();
  }

}
