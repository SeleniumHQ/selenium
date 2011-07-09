package org.openqa.grid.internal;

import static org.openqa.grid.common.RegistrationRequest.APP;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.junit.AfterClass;
import org.junit.Assert;
import org.junit.BeforeClass;
import org.junit.Test;
import org.openqa.grid.internal.mock.MockedRequestHandler;
import org.openqa.grid.web.servlet.handler.RequestType;

/**
 * Check that 1 type of request doesn't block other requests.
 * <p/>
 * For a hub capable of handling 1 FF and 1 IE for instance, if the hub already
 * built a queue of FF requests and a IE request is received it should be
 * processed right away and not blocked by the FF queue.
 */

public class ConcurrencyLock {

  private static Registry registry;

  private static Map<String, Object> ie = new HashMap<String, Object>();
  private static Map<String, Object> ff = new HashMap<String, Object>();

  private static RemoteProxy p1;
  private static RemoteProxy p2;

  /**
   * create a hub with 1 IE and 1 FF
   */
  @BeforeClass
  public static void setup() {
    registry = new Registry();
    ie.put(APP, "IE");
    ff.put(APP, "FF");

    p1 = RemoteProxyFactory.getNewBasicRemoteProxy(ie, "http://machine1:4444", registry);
    p2 = RemoteProxyFactory.getNewBasicRemoteProxy(ff, "http://machine2:4444", registry);
    registry.add(p1);
    registry.add(p2);

  }


  private List<String> results = new ArrayList<String>();

  @Test(timeout = 10000)
  public void runTest() throws InterruptedException {
    List<Map<String, Object>> caps = new ArrayList<Map<String, Object>>();
    caps.add(ff);
    caps.add(ff);
    caps.add(ff);
    caps.add(ie);

    List<Thread> threads = new ArrayList<Thread>();
    for (final Map<String, Object> cap : caps) {
      Thread t = new Thread(new Runnable() {
        public void run() {
          try {
            runTests2(cap);
          } catch (InterruptedException e) {
            e.printStackTrace();
          }
        }
      });
      t.start();
      threads.add(t);
    }

    for (Thread t : threads) {
      t.join();
    }
    Assert.assertEquals(4, results.size());
    Assert.assertEquals("IE", results.get(0));
    Assert.assertEquals("FF", results.get(1));
    Assert.assertEquals("FF", results.get(2));
    Assert.assertEquals("FF", results.get(3));
  }

  private void runTests2(Map<String, Object> cap) throws InterruptedException {

    MockedRequestHandler newSessionRequest = new MockedRequestHandler(registry);
    newSessionRequest.setRequestType(RequestType.START_SESSION);
    newSessionRequest.setDesiredCapabilities(cap);

    if (cap.get(APP).equals("FF")) {
      // start the FF right away
      newSessionRequest.process();
      TestSession s = newSessionRequest.getTestSession();
      Thread.sleep(2000);
      results.add("FF");
      s.terminateSynchronousFOR_TEST_ONLY();
    } else {
      // wait for 1 sec before starting IE to make sure the FF proxy is
      // busy with the 3 FF requests.
      Thread.sleep(1000);
      newSessionRequest.process();
      results.add("IE");
    }
    // at that point, the hub has recieved first 3 FF requests that are
    // queued and 1 IE request 1sec later, after the FF are already blocked
    // in the queue.The blocked FF request shouldn't block IE from starting,
    // so IE should be done first.
  }


  @AfterClass
  public static void teardown() {
    registry.stop();
  }

}
