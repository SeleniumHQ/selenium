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

/**
 * Check that 1 type of request doesn't block other requests.
 * <p/>
 * For a hub capable of handling 1 FF and 1 IE for instance, if the hub already built a queue of FF
 * requests and a IE request is received it should be processed right away and not blocked by the FF
 * queue.
 */

public class ConcurrencyLockTest {

//  private GridRegistry registry;
//
//  private Map<String, Object> ie = new HashMap<>();
//  private Map<String, Object> ff = new HashMap<>();
//
//  /**
//   * create a hub with 1 IE and 1 FF
//   */
//  @Before
//  public void setup() throws Exception {
//    registry = DefaultGridRegistry.newInstance(new Hub(new GridHubConfiguration()));
//    ie.put(CapabilityType.APPLICATION_NAME, "IE");
//    ff.put(CapabilityType.APPLICATION_NAME, "FF");
//
//    RemoteProxy p1 = RemoteProxyFactory.getNewBasicRemoteProxy(ie, "http://machine1:4444", registry);
//    RemoteProxy p2 = RemoteProxyFactory.getNewBasicRemoteProxy(ff, "http://machine2:4444", registry);
//    registry.add(p1);
//    registry.add(p2);
//
//  }
//
//  private List<String> results = Collections.synchronizedList(new ArrayList<>());
//
//  @Test(timeout = 10000)
//  public void runTest() throws InterruptedException {
//    List<Map<String, Object>> caps = new ArrayList<>();
//    caps.add(ff);
//    caps.add(ff);
//    caps.add(ff);
//    caps.add(ie);
//
//    List<Thread> threads = new ArrayList<>();
//    for (final Map<String, Object> cap : caps) {
//      Thread t = new Thread(new Runnable() { // Thread safety reviewed
//        @Override
//        public void run() {
//          try {
//            runTests2(cap);
//          } catch (InterruptedException e) {
//            e.printStackTrace();
//          }
//        }
//      });
//      t.start();
//      threads.add(t);
//    }
//
//    for (Thread t : threads) {
//      t.join();
//    }
//    assertEquals(4, results.size());
//    assertEquals("IE", results.get(0));
//    assertEquals("FF", results.get(1));
//    assertEquals("FF", results.get(2));
//    assertEquals("FF", results.get(3));
//  }
//
//  private void runTests2(Map<String, Object> cap) throws InterruptedException {
//
//    MockedRequestHandler newSessionHandler = GridHelper.createNewSessionHandler(registry, cap);
//
//    if (cap.get(CapabilityType.APPLICATION_NAME).equals("FF")) {
//      // start the FF right away
//      newSessionHandler.process();
//      TestSession s = newSessionHandler.getSession();
//      Thread.sleep(2000);
//      results.add("FF");
//      ((DefaultGridRegistry) registry).terminateSynchronousFOR_TEST_ONLY(s);
//    } else {
//      // wait for 1 sec before starting IE to make sure the FF proxy is
//      // busy with the 3 FF requests.
//      Thread.sleep(1000);
//      newSessionHandler.process();
//      results.add("IE");
//    }
//    // at that point, the hub has recieved first 3 FF requests that are
//    // queued and 1 IE request 1sec later, after the FF are already blocked
//    // in the queue.The blocked FF request shouldn't block IE from starting,
//    // so IE should be done first.
//  }
//
//
//  @After
//  public void teardown() {
//    registry.stop();
//  }
//
}
