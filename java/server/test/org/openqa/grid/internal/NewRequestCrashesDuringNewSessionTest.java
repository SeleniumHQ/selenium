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

import org.junit.AfterClass;
import org.junit.BeforeClass;
import org.junit.Test;
import org.openqa.grid.common.SeleniumProtocol;
import org.openqa.grid.internal.mock.GridHelper;
import org.openqa.grid.internal.mock.MockedRequestHandler;
import org.openqa.grid.web.servlet.handler.SeleniumBasedRequest;
import org.openqa.selenium.remote.CapabilityType;

import java.util.HashMap;
import java.util.Map;

import javax.servlet.http.HttpServletResponse;

public class NewRequestCrashesDuringNewSessionTest {

  private static Registry registry;
  private static Map<String, Object> ff = new HashMap<>();
  private static RemoteProxy p1;

  /**
   * create a hub with 1 IE and 1 FF
   */
  @BeforeClass
  public static void setup() throws Exception {
    registry = Registry.newInstance();
    ff.put(CapabilityType.APPLICATION_NAME, "FF");

    p1 = RemoteProxyFactory.getNewBasicRemoteProxy(ff, "http://machine1:4444", registry);
    registry.add(p1);

  }

  /**
   * check the normal scenario works
   */
  @Test(timeout = 1000)
  public void basic() {
    // should work
    MockedRequestHandler newSessionRequest =GridHelper.createNewSessionHandler(registry, ff);
   newSessionRequest.process();
    TestSession s = newSessionRequest.getSession();
    assertNotNull(s);
    registry.terminate(s, SessionTerminationReason.CLIENT_STOPPED_SESSION);
    assertEquals(0, registry.getNewSessionRequestCount());
  }

  /**
   * check that a crashes during the new session request handling doesn't result in a corrupted
   * state
   */
  @Test(timeout = 1000)
  public void requestIsremovedFromTheQeueAfterItcrashes() throws InterruptedException {
    // should work
    try {
      SeleniumBasedRequest newSession = GridHelper.createNewSessionRequest(registry, SeleniumProtocol.WebDriver, ff);
      MockedRequestHandler newSessionRequest =
          new MockedBuggyNewSessionRequestHandler(newSession,null,registry);
      newSessionRequest.process();
    } catch (RuntimeException e) {
      System.out.println(e.getMessage());
    }

    assertEquals(0, registry.getNewSessionRequestCount());
  }

  @AfterClass
  public static void teardown() {
    registry.stop();
  }

  class MockedBuggyNewSessionRequestHandler extends MockedRequestHandler {


    public MockedBuggyNewSessionRequestHandler(SeleniumBasedRequest request,
        HttpServletResponse response, Registry registry) {
      super(request, response, registry);
    }


    @Override
    public void forwardNewSessionRequestAndUpdateRegistry(TestSession session) {
      throw new RuntimeException("something horrible happened.");
    }

  }
}
