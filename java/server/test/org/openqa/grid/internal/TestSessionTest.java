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

import org.junit.Test;
import org.openqa.grid.common.SeleniumProtocol;

import java.util.HashMap;
import java.util.Map;

import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertTrue;
import static org.openqa.grid.common.RegistrationRequest.APP;

public class TestSessionTest {

  @Test
  public void testIsOrphanedSe1() throws Exception {

    Registry registry = Registry.newInstance();
    try {
      Map<String, Object> ff = new HashMap<String, Object>();
      ff.put(APP, "FF");
      RemoteProxy p1 =
          RemoteProxyFactory.getNewBasicRemoteProxy(ff, "http://machine1:4444", registry);
      registry.add(p1);

      final HashMap<String, Object> capabilities = new HashMap<String, Object>();
      TestSlot testSlot = new TestSlot(p1, SeleniumProtocol.Selenium, "", capabilities);
      final TestTimeSource timeSource = new TestTimeSource();
      TestSession testSession = new TestSession(testSlot, capabilities, timeSource);
      testSession.setExternalKey(new ExternalSessionKey("testKey"));
      assertFalse(testSession.isOrphaned());
      timeSource.ensureElapsed(TestSession.MAX_IDLE_TIME_BEFORE_CONSIDERED_ORPHANED);
      assertTrue(testSession.isOrphaned());

    } finally {
      registry.stop();
    }
  }

  @Test
  public void testIsOrphanedWebDriver() throws Exception {

    Registry registry = Registry.newInstance();
    try {
      Map<String, Object> ff = new HashMap<String, Object>();
      ff.put(APP, "FF");
      RemoteProxy p1 =
          RemoteProxyFactory.getNewBasicRemoteProxy(ff, "http://machine1:4444", registry);
      registry.add(p1);

      final HashMap<String, Object> capabilities = new HashMap<String, Object>();
      TestSlot testSlot = new TestSlot(p1, SeleniumProtocol.WebDriver, "", capabilities
      );
      final TestTimeSource timeSource = new TestTimeSource();
      TestSession testSession = new TestSession(testSlot, capabilities, timeSource);
      testSession.setExternalKey(new ExternalSessionKey("testKey"));
      assertFalse(testSession.isOrphaned());
      timeSource.ensureElapsed(TestSession.MAX_IDLE_TIME_BEFORE_CONSIDERED_ORPHANED);
      assertFalse(testSession.isOrphaned());

    } finally {
      registry.stop();
    }
  }


  public static class TestTimeSource implements TimeSource {

    private long time = 17;

    public long currentTimeInMillis() {
      return time;
    }

    public void ensureElapsed(long requiredElapsed) {
      time += (requiredElapsed + 1);
    }
  }
}
