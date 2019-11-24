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


public class GridShutdownTest {

//  @Test(timeout = 5000)
//  public void shutdown() throws Exception {
//
//    final Map<String, Object> ff = new HashMap<>();
//    ff.put(CapabilityType.APPLICATION_NAME, "FF");
//    ff.put(MAX_INSTANCES, 1);
//
//    final GridRegistry registry =
//        DefaultGridRegistry.newInstance(new Hub(new GridHubConfiguration()));
//
//    RemoteProxy p1 =
//        RemoteProxyFactory.getNewBasicRemoteProxy(ff, "http://machine1:4444", registry);
//    registry.add(p1);
//    registry.setThrowOnCapabilityNotPresent(true);
//
//    MockedRequestHandler newSessionRequest = GridHelper.createNewSessionHandler(registry, ff);
//    newSessionRequest.process();
//
//    final int before = getCurrentThreadCount();
//    final CountDownLatch latch = new CountDownLatch(numRequests());
//    List<Thread> threads = new ArrayList<>();
//    for (int i = 0; i < numRequests(); i++) {
//      final Thread thread = new Thread(new Runnable() { // Thread safety reviewed
//            @Override
//            public void run() {
//              latch.countDown();
//              RequestHandler newSessionRequest = GridHelper.createNewSessionHandler(registry, ff);
//              newSessionRequest.process();
//            }
//          }, "TestThread" + i);
//      threads.add(thread);
//      thread.start();
//    }
//    Thread.sleep(500);
//    latch.await();
//    assertEquals(before + numRequests(), getCurrentThreadCount());
//    registry.stop();
//    for (Thread thread : threads) {
//        thread.join();
//    }
//    assertTrue(getCurrentThreadCount() <= before);
//  }

  private int getCurrentThreadCount() {
    return Thread.currentThread().getThreadGroup().activeCount();
  }

  private int numRequests() {
    return 5;
  }

}
