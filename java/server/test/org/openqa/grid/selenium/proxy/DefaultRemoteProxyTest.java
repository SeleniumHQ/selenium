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

package org.openqa.grid.selenium.proxy;

import org.junit.After;
import org.junit.Test;
import org.openqa.selenium.remote.server.jmx.JMXHelper;

import java.util.concurrent.TimeoutException;

import javax.management.MalformedObjectNameException;
import javax.management.ObjectName;


public class DefaultRemoteProxyTest {

  @Test
  public void ensureCleanupHappensWhenProxyTimesoutAndCleanupIsEnabled()
      throws TimeoutException, InterruptedException {
//    BaseRemoteProxy p = createProxyAndSimulateTimeout(1000);
//    assertTrue("Ensure there are NO active sessions",
//               p.getRegistry().getActiveSessions().isEmpty());
//    assertEquals("Ensure that there are NO used slots", 0, p.getTotalUsed());
  }

  @Test
  public void ensureNoCleanupHappensWhenProxyTimesoutAndCleanupIsDisabled()
      throws TimeoutException, InterruptedException {
//    BaseRemoteProxy p = createProxyAndSimulateTimeout(0);
//    assertFalse("Ensure there are active sessions", p.getRegistry().getActiveSessions().isEmpty());
//    assertEquals("Ensure that 1 slot is still marked as in use", 1, p.getTotalUsed());
  }

  @After
  public void unregisterHubFromJMX() throws MalformedObjectNameException {
    ObjectName obj = new ObjectName("org.seleniumhq.grid:type=Hub");
    new JMXHelper().unregister(obj);
  }

  private static Object createProxyAndSimulateTimeout(int cleanupCycle)
      throws TimeoutException, InterruptedException {
//    GridRegistry registry = DefaultGridRegistry.newInstance(new Hub(new GridHubConfiguration()));
//    registry.getHub().getConfiguration().timeout = 1;
//    registry.getHub().getConfiguration().cleanUpCycle = cleanupCycle;
//    String[] args = new String[]{"-role", "webdriver"};
//    GridNodeCliOptions options = new GridNodeCliOptions();
//    JCommander.newBuilder().addObject(options).build().parse(args);
//    GridNodeConfiguration nodeConfiguration = new GridNodeConfiguration(options);
//    nodeConfiguration.port = new Random().nextInt(100);
//    nodeConfiguration.timeout = 1;
//    RegistrationRequest req = RegistrationRequest.build(nodeConfiguration);
//    req.getConfiguration().proxy = DefaultRemoteProxy.class.getName();
//    BaseRemoteProxy p = createMockProxyWithPollingDisabled(req, registry);
//    MockedRequestHandler reqHandler = GridHelper.createNewSessionHandler(registry, new HashMap<>());
//    registry.addNewSessionRequest(reqHandler);
//    reqHandler.waitForSessionBound();
//    assertFalse("Ensure a new session was created", registry.getActiveSessions().isEmpty());
//    simulateTimeout(cleanupCycle);
//    return p;

    return null;
  }

  private static void simulateTimeout(int cleanupCycle) {
    int sleepMoreThanCleanupCycle = cleanupCycle + 1000;
    try {
      Thread.sleep(sleepMoreThanCleanupCycle);
    } catch (InterruptedException e) {
      e.printStackTrace();
    }
  }

//  private static BaseRemoteProxy createMockProxyWithPollingDisabled(RegistrationRequest req,
//                                                                    GridRegistry registry) {
//    BaseRemoteProxy p = BaseRemoteProxy.getNewInstance(req, registry);
//    registry.add(p);
//    ((SelfHealingProxy) p).stopPolling();
//    return p;
//  }

}
