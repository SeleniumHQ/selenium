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
import static org.openqa.grid.common.RegistrationRequest.MAX_INSTANCES;

import org.junit.AfterClass;
import org.junit.BeforeClass;
import org.junit.Test;
import org.openqa.grid.common.RegistrationRequest;
import org.openqa.grid.internal.mock.GridHelper;
import org.openqa.grid.internal.mock.MockedRequestHandler;
import org.openqa.grid.internal.utils.configuration.GridNodeConfiguration;
import org.openqa.selenium.remote.CapabilityType;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * for N nodes against a hub, the tests are spread as much as possible on the nodes.
 */
public class LoadBalancedTests {

  private static Registry registry;
  private static Registry registry2;

  private static BaseRemoteProxy proxy1;
  private static BaseRemoteProxy proxy2;
  private static BaseRemoteProxy proxy3;

  @BeforeClass
  public static void setup() {
    registry = Registry.newInstance();
    registry2 = Registry.newInstance();

    register5ProxiesOf5Slots();
    register3ProxiesVariableSlotSize();
  }

  // registry :
  // add 5 proxies. Total = 5 proxies * 5 slots each = 25 firefox.
  private static void register5ProxiesOf5Slots() {
    // add 5 proxies. Total = 5 proxies * 5 slots each = 25 firefox.
    for (int i = 0; i < 5; i++) {
      registry.add(new DetachedRemoteProxy(getRequestOfNSlots(5, "name" + i), registry));
    }
  }

  // registry2 :
  // proxy 1 -> 2 slots
  // proxy 2 -> 4 slots
  // proxy 3 -> 6 slots
  private static void register3ProxiesVariableSlotSize() {
    proxy1 = new DetachedRemoteProxy(getRequestOfNSlots(2, "proxy1"), registry2);
    proxy2 = new DetachedRemoteProxy(getRequestOfNSlots(4, "proxy2"), registry2);
    proxy3 = new DetachedRemoteProxy(getRequestOfNSlots(6, "proxy3"), registry2);

    registry2.add(proxy1);
    registry2.add(proxy2);
    registry2.add(proxy3);
  }



  // all nodes have the same amount of test slots.
  @Test(timeout = 5000)
  public void newSessionSpreadOnAllProxies() {

    // request 5 slots : it should spread the load to 1 FF per proxy.
    for (int i = 0; i < 5; i++) {
      MockedRequestHandler req = GridHelper.createNewSessionHandler(registry, firefox());
      req.process();
      TestSession session = req.getSession();

      assertNotNull(session);
      assertEquals(session.getSlot().getProxy().getTotalUsed(), 1);
    }

    // 2 ff per proxy.
    for (int i = 0; i < 5; i++) {
      MockedRequestHandler req = GridHelper.createNewSessionHandler(registry, firefox());
      req.process();
      TestSession session = req.getSession();
      assertNotNull(session);
      assertEquals(2, session.getSlot().getProxy().getTotalUsed());
      // and release
      registry.terminateSynchronousFOR_TEST_ONLY(session);
    }

    // at that point, 1 FF per proxy
    for (int i = 0; i < 5; i++) {
      MockedRequestHandler req = GridHelper.createNewSessionHandler(registry, firefox());
      req.process();
      TestSession session = req.getSession();
      assertNotNull(session);
      assertEquals(session.getSlot().getProxy().getTotalUsed(), 2);

    }
  }

  // tests with different max test per node.
  @Test(timeout = 5000)
  public void newSessionSpreadOnAllProxiesAccordingToTheResource() {

    // request 3 slots : it should spread the load to 1 FF per proxy.
    for (int i = 0; i < 3; i++) {
      MockedRequestHandler req = GridHelper.createNewSessionHandler(registry2, firefox());
      req.process();
      TestSession session = req.getSession();

      assertNotNull(session);
    }

    assertEquals(50, proxy1.getResourceUsageInPercent(), 0f);
    assertEquals(25, proxy2.getResourceUsageInPercent(), 0f);
    assertEquals(16.66, proxy3.getResourceUsageInPercent(), 0.1f);


    List<TestSession> sessions = new ArrayList<>();
    // request 3 slots : it should spread the load to 1 FF per proxy.
    for (int i = 0; i < 3; i++) {
      MockedRequestHandler req = GridHelper.createNewSessionHandler(registry2, firefox());
      req.process();
      TestSession session = req.getSession();

      assertNotNull(session);
      sessions.add(session);
    }
    assertEquals(50, proxy1.getResourceUsageInPercent(), 0f);
    assertEquals(50, proxy2.getResourceUsageInPercent(), 0f);
    assertEquals(49.98, proxy3.getResourceUsageInPercent(), 0.1f);


    //release and check the resource are freed.
    for (TestSession session : sessions) {
      registry.terminateSynchronousFOR_TEST_ONLY(session);
    }
    assertEquals(50, proxy1.getResourceUsageInPercent(), 0f);
    assertEquals(25, proxy2.getResourceUsageInPercent(), 0f);
    assertEquals(16.66, proxy3.getResourceUsageInPercent(), 0.1f);

  }



  private static Map<String, Object> firefox() {
    Map<String, Object> ff = new HashMap<>();
    ff.put(CapabilityType.APPLICATION_NAME, "firefox");
    return ff;
  }

  private static RegistrationRequest getRequestOfNSlots(int n, String name) {
    RegistrationRequest request = new RegistrationRequest();

    GridNodeConfiguration config = new GridNodeConfiguration();
    config.maxSession = n;
    config.host = name;
    config.port = 4444;
    request.setConfiguration(config);

    Map<String, Object> ff = firefox();
    ff.put(MAX_INSTANCES, n);
    request.addDesiredCapability(ff);

    return request;
  }

  @AfterClass
  public static void teardown() {
    registry.stop();
    registry2.stop();
  }
}
