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
import static org.junit.Assert.assertNull;

import org.junit.Test;
import org.openqa.grid.common.RegistrationRequest;
import org.openqa.grid.internal.utils.configuration.GridNodeConfiguration;
import org.openqa.selenium.remote.BrowserType;
import org.openqa.selenium.remote.DesiredCapabilities;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class ProxySetTest {

  @Test
  public void removeIfPresent() throws Exception {
    Registry registry = Registry.newInstance();
    try {
      ProxySet set = registry.getAllProxies();
      RemoteProxy
          p1 =
          RemoteProxyFactory.getNewBasicRemoteProxy("app1", "http://machine1:4444/", registry);

      set.add(p1);

      p1.getTestSlots().get(0).getNewSession(new HashMap<String, Object>());

      // Make sure the proxy and its test session show up in the registry.
      assertEquals(1, set.size());
      assertNotNull(p1.getTestSlots().get(0).getSession());

      registry.removeIfPresent(p1);

      // Make sure both the proxy and the test session assigned to it are removed from the registry.
      assertEquals(0, set.size());
      assertNull(p1.getTestSlots().get(0).getSession());
    } finally {
      registry.stop();
    }
  }

  @Test
  public void testProxySortingByIdle() throws Exception {
    Registry registry = Registry.newInstance();
    try {
      ProxySet set = registry.getAllProxies();

      set.add(buildStubbedRemoteProxy(registry, 10));
      set.add(buildStubbedRemoteProxy(registry, 2));
      set.add(buildStubbedRemoteProxy(registry, 0));
      set.add(buildStubbedRemoteProxy(registry, 1));

      List<RemoteProxy> sortedList = set.getSorted();

      //Check that there are indeed 4 proxies registered
      assertEquals(4, sortedList.size());

      //Check the order of proxies, to make sure the totalUsed is ascending
      assertEquals(0, sortedList.get(0).getTotalUsed());
      assertEquals(1, sortedList.get(1).getTotalUsed());
      assertEquals(2, sortedList.get(2).getTotalUsed());
      assertEquals(10, sortedList.get(3).getTotalUsed());

      //Check the ordered proxies to make sure proxyId's are in correct order
      assertEquals("http://remote_host:0", sortedList.get(0).getId());
      assertEquals("http://remote_host:1", sortedList.get(1).getId());
      assertEquals("http://remote_host:2", sortedList.get(2).getId());
      assertEquals("http://remote_host:10", sortedList.get(3).getId());

    } finally {
      registry.stop();
    }

  }

  public StubbedRemoteProxy buildStubbedRemoteProxy(Registry registry, int totalUsed) {
    GridNodeConfiguration config = new GridNodeConfiguration();
    config.host = "remote_host";
    config.port = totalUsed;
    config.role = "webdriver";
    RegistrationRequest req = RegistrationRequest.build(config);
    req.getCapabilities().clear();

    DesiredCapabilities capability = new DesiredCapabilities();
    capability.setBrowserName(BrowserType.CHROME);
    req.addDesiredCapability(capability);

    StubbedRemoteProxy tempProxy = new StubbedRemoteProxy(req, registry);
    tempProxy.setTotalUsed(totalUsed);

     return tempProxy;
  }

  public class StubbedRemoteProxy extends BaseRemoteProxy {

    private int testsRunning;

    public StubbedRemoteProxy(RegistrationRequest request,
                              Registry registry) {

      super(request, registry);
    }


    public void setTotalUsed(int count) {
      this.testsRunning = count;
    }

    @Override
    public int getTotalUsed() {
      return this.testsRunning;
    }
  }
}
