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

import java.util.HashMap;
import java.util.Map;

import org.junit.AfterClass;
import org.junit.BeforeClass;
import org.junit.Test;
import org.openqa.grid.internal.mock.GridHelper;
import org.openqa.grid.internal.mock.MockedRequestHandler;

public class NewSessionRequestTimeout {

  private static Registry registry;
  private static Map<String, Object> ff = new HashMap<String, Object>();
  private static RemoteProxy p1;

  /**
   * create a hub with 1 IE and 1 FF
   */
  @BeforeClass
  public static void setup() {
    registry = Registry.newInstance();
    ff.put(APP, "FF");

    p1 = RemoteProxyFactory.getNewBasicRemoteProxy(ff, "http://machine1:4444", registry);
    registry.add(p1);
    // after 1 sec in the queue, request are kicked out.
    registry.setNewSessionWaitTimeout(1000);
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

  @AfterClass
  public static void teardown() {
    registry.stop();
  }
}
