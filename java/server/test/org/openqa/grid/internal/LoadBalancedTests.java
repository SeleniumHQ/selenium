/*
Copyright 2011 WebDriver committers
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
import static org.openqa.grid.common.RegistrationRequest.MAX_INSTANCES;
import static org.openqa.grid.common.RegistrationRequest.MAX_SESSION;
import static org.openqa.grid.common.RegistrationRequest.REMOTE_HOST;

import java.util.HashMap;
import java.util.Map;

import org.junit.AfterClass;
import org.junit.Assert;
import org.junit.BeforeClass;
import org.junit.Test;
import org.openqa.grid.common.RegistrationRequest;
import org.openqa.grid.internal.mock.GridHelper;
import org.openqa.grid.internal.mock.MockedRequestHandler;


public class LoadBalancedTests {

  private static Registry registry;
  private static RegistrationRequest request = new RegistrationRequest();
  private static Map<String, Object> ff = new HashMap<String, Object>();

  @BeforeClass
  public static void setup() {
    registry = Registry.newInstance();
    // A request that will create a proxy with 5 slots. Each slot can host a
    // firefox.
    Map<String, Object> config = new HashMap<String, Object>();
    ff.put(APP, "firefox");
    ff.put(MAX_INSTANCES, 5);
    request.addDesiredCapability(ff);

    config.put(MAX_SESSION, 5);

    // add 5 proxies. Total = 5 proxies * 5 slots each = 25 firefox.
    for (int i = 0; i < 5; i++) {
      config.put(REMOTE_HOST, "http://machine" + i + ":4444");
      request.setConfiguration(config);
      registry.add(new BaseRemoteProxy(request, registry));
    }
  }

  @Test(timeout = 5000)
  public void newSessionSpreadOnAllProxies() {

    // request 5 slots : it should spread the load to 1 FF per proxy.
    for (int i = 0; i < 5; i++) {
      MockedRequestHandler req =GridHelper.createNewSessionHandler(registry, ff);
     req.process();
      TestSession session = req.getSession();

      Assert.assertNotNull(session);
      Assert.assertEquals(session.getSlot().getProxy().getTotalUsed(), 1);
    }

    // 2 ff per proxy.
    for (int i = 0; i < 5; i++) {
      MockedRequestHandler req =GridHelper.createNewSessionHandler(registry, ff);
      req.process();
      TestSession session = req.getSession();
      Assert.assertNotNull(session);
      Assert.assertEquals(2, session.getSlot().getProxy().getTotalUsed());
      // and release
      registry.terminateSynchronousFOR_TEST_ONLY(session);
    }

    // at that point, 1 FF per proxy
    for (int i = 0; i < 5; i++) {
      MockedRequestHandler req =GridHelper.createNewSessionHandler(registry, ff);req.process();
      TestSession session = req.getSession();
      Assert.assertNotNull(session);
      Assert.assertEquals(session.getSlot().getProxy().getTotalUsed(), 2);

    }
  }

  @AfterClass
  public static void teardown() {
    registry.stop();
  }
}
