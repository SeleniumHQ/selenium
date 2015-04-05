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

import java.util.HashMap;

public class ProxySetTest {

  @Test
  public void removeIfPresent() {
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
}
