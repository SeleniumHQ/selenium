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

import org.junit.Assert;
import org.junit.Test;

import java.util.HashMap;

public class ProxySetTest {

  @Test
  public void removeIfPresent() {
    Registry registry = Registry.newInstance();
    try {
      ProxySet set = new ProxySet(true);
      RemoteProxy
          p1 =
          RemoteProxyFactory.getNewBasicRemoteProxy("app1", "http://machine1:4444/", registry);

      set.add(p1);

      p1.getTestSlots().get(0).getNewSession(new HashMap<String, Object>());

      // Make sure the proxy and its test session show up in the registry.
      Assert.assertEquals(1, set.size());
      Assert.assertNotNull(p1.getTestSlots().get(0).getSession());

      registry.removeIfPresent(p1);

      // Make sure both the proxy and the test session assigned to it are removed from the registry.
      Assert.assertEquals(0, set.size());
      Assert.assertNull(p1.getTestSlots().get(0).getSession());
    } finally {
      registry.stop();
    }
  }
}
