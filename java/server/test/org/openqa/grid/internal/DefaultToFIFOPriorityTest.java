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

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertNotNull;
import static org.openqa.grid.common.RegistrationRequest.APP;

import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.junit.AfterClass;
import org.junit.BeforeClass;
import org.junit.Test;
import org.openqa.grid.internal.listeners.Prioritizer;
import org.openqa.grid.internal.mock.GridHelper;
import org.openqa.grid.internal.mock.MockedRequestHandler;

// TODO freynaud copy paste from PriorityTestLoad ....

public class DefaultToFIFOPriorityTest {

  private final static int MAX = 50;

  private static Registry registry;

  // priority rule : nothing defined = FIFO
  private static Prioritizer fifo = null;

  private static Map<String, Object> ff = new HashMap<String, Object>();
  private static RemoteProxy p1;
  private static List<MockedRequestHandler> requests = Collections
      .synchronizedList(new ArrayList<MockedRequestHandler>());
  private static TestSession session = null;

  /**
   * create a hub with 1 FF
   * 
   * @throws InterruptedException
   */
  @BeforeClass
  public static void setup() throws InterruptedException {
    registry = Registry.newInstance();
    registry.setPrioritizer(fifo);
    ff.put(APP, "FF");
    p1 = RemoteProxyFactory.getNewBasicRemoteProxy(ff, "http://machine1:4444", registry);
    registry.add(p1);

    for (int i = 1; i <= MAX; i++) {
      Map<String, Object> cap = new HashMap<String, Object>();
      cap.put(APP, "FF");
      cap.put("_priority", i);
      MockedRequestHandler req =GridHelper.createNewSessionHandler(registry, cap);
      requests.add(req);
    }


    // use all the spots ( so 1 ) of the grid so that a queue buils up
    MockedRequestHandler newSessionRequest =GridHelper.createNewSessionHandler(registry, ff);
    newSessionRequest.process();
    session = newSessionRequest.getSession();

    // fill the queue with MAX requests.
    for (MockedRequestHandler h : requests) {
      final MockedRequestHandler req = h;
      new Thread(new Runnable() {  // Thread safety reviewed
        public void run() {
          req.process();
        }
      }).start();
    }


    // free the grid : the queue is consumed, and the test with the highest
    // priority should be processed.
    while (requests.size() != MAX) {
      Thread.sleep(250);
    }
    registry.terminateSynchronousFOR_TEST_ONLY(session);
  }


  @Test
  public void validateRequestAreHandledFIFO() throws InterruptedException {
    int cpt = 0;
    while (cpt < 8) {
      try {
        requests.get(0).getSession();
        break;
      } catch (Throwable e) {
        // ignore.
      }
      Thread.sleep(250);
    }
    assertNotNull(requests.get(0).getSession());
    assertEquals(1, requests.get(0).getRequest().getDesiredCapabilities().get("_priority"));
  }

  @AfterClass
  public static void teardown() {
    registry.stop();
  }

}
