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
import static org.junit.Assert.assertNotNull;

import org.junit.After;
import org.junit.Before;
import org.junit.Test;
import org.openqa.grid.internal.listeners.Prioritizer;
import org.openqa.grid.internal.mock.GridHelper;
import org.openqa.grid.internal.mock.MockedRequestHandler;
import org.openqa.selenium.remote.CapabilityType;

import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

// TODO freynaud copy paste from PriorityTestLoad ....
public class DefaultToFIFOPriorityTest {

  private final static int MAX = 50;

  private Registry registry;

  // priority rule : nothing defined = FIFO
  private Prioritizer fifo = null;

  private Map<String, Object> ff = new HashMap<>();
  private List<MockedRequestHandler> requests =
    Collections.synchronizedList(new ArrayList<MockedRequestHandler>());

  /**
   * create a hub with 1 FF
   *
   * @throws InterruptedException
   */
  @Before
  public void setup() throws Exception {
    registry = Registry.newInstance();
    registry.getConfiguration().prioritizer = fifo;
    ff.put(CapabilityType.APPLICATION_NAME, "FF");
    RemoteProxy p1 =
      RemoteProxyFactory.getNewBasicRemoteProxy(ff, "http://machine1:4444", registry);
    registry.add(p1);

    for (int i = 1; i <= MAX; i++) {
      Map<String, Object> cap = new HashMap<>();
      cap.put(CapabilityType.APPLICATION_NAME, "FF");
      cap.put("_priority", i);
      MockedRequestHandler req = GridHelper.createNewSessionHandler(registry, cap);
      requests.add(req);
    }

    // use all the spots ( so 1 ) of the grid so that a queue builds up
    MockedRequestHandler newSessionRequest = GridHelper.createNewSessionHandler(registry, ff);
    newSessionRequest.process();
    TestSession session = newSessionRequest.getSession();

    // fill the queue with MAX requests.
    for (MockedRequestHandler h : requests) {
      final MockedRequestHandler req = h;
      new Thread(new Runnable() {  // Thread safety reviewed
        public void run() {
          req.process();
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


  // 20 second timeout in case we hang
  @Test(timeout = 20000)
  public void validateRequestAreHandledFIFO() throws InterruptedException {
    // using a flag here. The queue contains all the requests.
    // when release is executed, 1 slot is
    // freed.The iteration over the queue to sort + find the match isn't
    // instant.
    int cpt = 0;
    while (cpt < 8) {
      try {
        requests.get(0).getSession();
        break;
      } catch (Throwable e) {
        cpt++;
      }
      Thread.sleep(250);
    }
    assertNotNull(requests.get(0).getSession());
    assertEquals(1, requests.get(0).getRequest().getDesiredCapabilities().get("_priority"));
  }

  @After
  public void teardown() {
    registry.stop();
    requests.clear();  // Because it's static
  }

}
