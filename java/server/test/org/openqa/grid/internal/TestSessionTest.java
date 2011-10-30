package org.openqa.grid.internal;

import org.junit.Test;
import org.openqa.grid.common.SeleniumProtocol;

import java.util.HashMap;
import java.util.Map;

import static junit.framework.Assert.assertFalse;
import static junit.framework.Assert.assertTrue;
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


  class TestTimeSource implements TimeSource {
    private long time = 17;
    public long currentTimeInMillis() {
      return time;
    }

    public void ensureElapsed(long requiredElapsed){
      time += (requiredElapsed + 1);
    }
  }
}
