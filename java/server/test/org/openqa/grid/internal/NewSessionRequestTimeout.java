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

import org.junit.After;
import org.junit.Before;
import org.junit.Test;
import org.openqa.grid.internal.mock.GridHelper;
import org.openqa.grid.internal.mock.MockedRequestHandler;
import org.openqa.selenium.remote.CapabilityType;

import java.util.HashMap;
import java.util.Map;

public class NewSessionRequestTimeout {

  private Registry registry;
  private Map<String, Object> ff = new HashMap<>();
  private RemoteProxy p1;

  /**
   * create a hub with 1 IE and 1 FF
   */
  @Before
  public void setup() throws Exception {
    registry = Registry.newInstance();
    ff.put(CapabilityType.APPLICATION_NAME, "FF");

    p1 = RemoteProxyFactory.getNewBasicRemoteProxy(ff, "http://machine1:4444", registry);
    registry.add(p1);
    // after 1 sec in the queue, request are kicked out.
    registry.getConfiguration().newSessionWaitTimeout = 1000;
  }

  @Test(timeout = 5000)
  public void method() {

    // should work
    MockedRequestHandler newSessionRequest = GridHelper.createNewSessionHandler(registry, ff);
    newSessionRequest.process();

    // should throw after 1sec being stuck in the queue
    try {
      MockedRequestHandler newSessionRequest2 = GridHelper.createNewSessionHandler(registry, ff);
      newSessionRequest2.process();
    } catch (RuntimeException ignore) {
    }

  }

  @After
  public void teardown() {
    registry.stop();
  }
}
