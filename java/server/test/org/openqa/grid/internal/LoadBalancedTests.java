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
 * for N nodes against a hub, the tests are spread as much as possible on the nodes.
 */
public class LoadBalancedTests {
//
//  private GridRegistry registry;
//  private GridRegistry registry2;
//
//  private BaseRemoteProxy proxy1;
//  private BaseRemoteProxy proxy2;
//  private BaseRemoteProxy proxy3;
//
//  @Before
//  public void setup() {
//    registry = DefaultGridRegistry.newInstance(new Hub(new GridHubConfiguration()));
//    registry2 = DefaultGridRegistry.newInstance(new Hub(new GridHubConfiguration()));
//
//    register5ProxiesOf5Slots();
//    register3ProxiesVariableSlotSize();
//  }
//
//  // registry :
//  // add 5 proxies. Total = 5 proxies * 5 slots each = 25 firefox.
//  private void register5ProxiesOf5Slots() {
//    // add 5 proxies. Total = 5 proxies * 5 slots each = 25 firefox.
//    for (int i = 0; i < 5; i++) {
//      registry.add(new BaseRemoteProxy(getRequestOfNSlots(5, "name" + i), registry));
//    }
//  }
//
//  // registry2 :
//  // proxy 1 -> 2 slots
//  // proxy 2 -> 4 slots
//  // proxy 3 -> 6 slots
//  private void register3ProxiesVariableSlotSize() {
//    proxy1 = new BaseRemoteProxy(getRequestOfNSlots(2, "proxy1"), registry2);
//    proxy2 = new BaseRemoteProxy(getRequestOfNSlots(4, "proxy2"), registry2);
//    proxy3 = new BaseRemoteProxy(getRequestOfNSlots(6, "proxy3"), registry2);
//
//    registry2.add(proxy1);
//    registry2.add(proxy2);
//    registry2.add(proxy3);
//  }
//
//
//
//  // all nodes have the same amount of test slots.
//  @Test(timeout = 5000)
//  public void newSessionSpreadOnAllProxies() {
//
//    // request 5 slots : it should spread the load to 1 FF per proxy.
//    for (int i = 0; i < 5; i++) {
//      MockedRequestHandler req = GridHelper.createNewSessionHandler(registry, firefox());
//      req.process();
//      TestSession session = req.getSession();
//
//      assertNotNull(session);
//      assertEquals(session.getSlot().getProxy().getTotalUsed(), 1);
//    }
//
//    // 2 ff per proxy.
//    for (int i = 0; i < 5; i++) {
//      MockedRequestHandler req = GridHelper.createNewSessionHandler(registry, firefox());
//      req.process();
//      TestSession session = req.getSession();
//      assertNotNull(session);
//      assertEquals(2, session.getSlot().getProxy().getTotalUsed());
//      // and release
//      ((DefaultGridRegistry) registry).terminateSynchronousFOR_TEST_ONLY(session);
//    }
//
//    // at that point, 1 FF per proxy
//    for (int i = 0; i < 5; i++) {
//      MockedRequestHandler req = GridHelper.createNewSessionHandler(registry, firefox());
//      req.process();
//      TestSession session = req.getSession();
//      assertNotNull(session);
//      assertEquals(session.getSlot().getProxy().getTotalUsed(), 2);
//
//    }
//  }
//
//  // tests with different max test per node.
//  @Test(timeout = 5000)
//  public void newSessionSpreadOnAllProxiesAccordingToTheResource() {
//
//    // request 3 slots : it should spread the load to 1 FF per proxy.
//    for (int i = 0; i < 3; i++) {
//      MockedRequestHandler req = GridHelper.createNewSessionHandler(registry2, firefox());
//      req.process();
//      TestSession session = req.getSession();
//
//      assertNotNull(session);
//    }
//
//    assertEquals(50, proxy1.getResourceUsageInPercent(), 0f);
//    assertEquals(25, proxy2.getResourceUsageInPercent(), 0f);
//    assertEquals(16.66, proxy3.getResourceUsageInPercent(), 0.1f);
//
//
//    List<TestSession> sessions = new ArrayList<>();
//    // request 3 slots : it should spread the load to 1 FF per proxy.
//    for (int i = 0; i < 3; i++) {
//      MockedRequestHandler req = GridHelper.createNewSessionHandler(registry2, firefox());
//      req.process();
//      TestSession session = req.getSession();
//
//      assertNotNull(session);
//      sessions.add(session);
//    }
//    assertEquals(50, proxy1.getResourceUsageInPercent(), 0f);
//    assertEquals(50, proxy2.getResourceUsageInPercent(), 0f);
//    assertEquals(49.98, proxy3.getResourceUsageInPercent(), 0.1f);
//
//
//    //release and check the resource are freed.
//    for (TestSession session : sessions) {
//      ((DefaultGridRegistry) registry).terminateSynchronousFOR_TEST_ONLY(session);
//    }
//    assertEquals(50, proxy1.getResourceUsageInPercent(), 0f);
//    assertEquals(25, proxy2.getResourceUsageInPercent(), 0f);
//    assertEquals(16.66, proxy3.getResourceUsageInPercent(), 0.1f);
//
//  }
//
//
//
//  private Map<String, Object> firefox() {
//    Map<String, Object> ff = new HashMap<>();
//    ff.put(CapabilityType.APPLICATION_NAME, "firefox");
//    return ff;
//  }
//
//  private RegistrationRequest getRequestOfNSlots(int n, String name) {
//
//    Map<String, Object> ff = firefox();
//    ff.put(MAX_INSTANCES, n);
//
//    GridNodeConfiguration config = new GridNodeConfiguration();
//    config.maxSession = n;
//    config.host = name;
//    config.port = 4444;
//    config.capabilities.add(new DesiredCapabilities(ff));
//
//    return new RegistrationRequest(config);
//  }
//
//  @After
//  public void teardown() {
//    registry.stop();
//    registry2.stop();
//  }
}
