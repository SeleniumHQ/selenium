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
import org.openqa.grid.internal.listeners.Prioritizer;
import org.openqa.grid.internal.mock.MockedNewSessionRequestHandler;
import org.openqa.grid.internal.mock.MockedRequestHandler;
import org.openqa.grid.web.servlet.handler.RequestType;


public class PriorityTest {

  private static Registry registry;

  // priority rule : the request with the highest priority goes first.
  private static Prioritizer highestNumberHasPriority = new Prioritizer() {
    public int compareTo(Map<String, Object> a, Map<String, Object> b) {
      int priorityA = Integer.parseInt(a.get("_priority").toString());
      int priorityB = Integer.parseInt(b.get("_priority").toString());
      return priorityB - priorityA;
    }
  };

  static Map<String, Object> ff = new HashMap<String, Object>();
  static RemoteProxy p1;

  static MockedNewSessionRequestHandler newSessionRequest1;
  static MockedNewSessionRequestHandler newSessionRequest2;
  static MockedNewSessionRequestHandler newSessionRequest3;
  static MockedNewSessionRequestHandler newSessionRequest4;
  static MockedNewSessionRequestHandler newSessionRequest5;

  static List<MockedRequestHandler> requests = new ArrayList<MockedRequestHandler>();

  /**
   * create a hub with 1 FF
   *
   * @throws InterruptedException
   */
  @BeforeClass
  public static void setup() throws InterruptedException {
    registry = new Registry();
    registry.setPrioritizer(highestNumberHasPriority);
    ff.put(APP, "FF");
    p1 = RemoteProxyFactory.getNewBasicRemoteProxy(ff, "http://machine1:4444", registry);
    registry.add(p1);

    // create 5 sessionRequest, with priority =1 .. 5
    Map<String, Object> ff1 = new HashMap<String, Object>();
    ff1.put(APP, "FF");
    ff1.put("_priority", 1);

    Map<String, Object> ff2 = new HashMap<String, Object>();
    ff2.put(APP, "FF");
    ff2.put("_priority", 2);

    Map<String, Object> ff3 = new HashMap<String, Object>();
    ff3.put(APP, "FF");
    ff3.put("_priority", 3);

    Map<String, Object> ff4 = new HashMap<String, Object>();
    ff4.put(APP, "FF");
    ff4.put("_priority", 4);

    Map<String, Object> ff5 = new HashMap<String, Object>();
    ff5.put(APP, "FF");
    ff5.put("_priority", 5);

    newSessionRequest1 = new MockedNewSessionRequestHandler(registry, ff1);
    newSessionRequest2 = new MockedNewSessionRequestHandler(registry, ff2);
    newSessionRequest3 = new MockedNewSessionRequestHandler(registry, ff3);
    newSessionRequest4 = new MockedNewSessionRequestHandler(registry, ff4);
    newSessionRequest5 = new MockedNewSessionRequestHandler(registry, ff5);

    requests.add(newSessionRequest1);
    requests.add(newSessionRequest2);
    requests.add(newSessionRequest5);
    requests.add(newSessionRequest3);
    requests.add(newSessionRequest4);

    MockedRequestHandler newSessionRequest = new MockedRequestHandler(registry);
    newSessionRequest.setRequestType(RequestType.START_SESSION);
    newSessionRequest.setDesiredCapabilities(ff);
    newSessionRequest.process();
    TestSession session = newSessionRequest.getTestSession();

    // fill the queue with 5 requests.
    for (MockedRequestHandler h : requests) {
      final MockedRequestHandler req = h;
      new Thread(new Runnable() {
        public void run() {
          req.process();
        }
      }).start();
    }

    while (registry.getNewSessionRequests().size() != 5) {
      Thread.sleep(100);
    }

    // free the grid : the queue is consumed, and the test with the highest
    // priority should be processed.
    session.terminateSynchronousFOR_TEST_ONLY();

  }


  // validate that the one with priority 5 has been assigned a proxy
  @Test
  public void validate() throws InterruptedException {
    Thread.sleep(250);
    Assert.assertNotNull(newSessionRequest5.getTestSession());
  }


  @AfterClass
  public static void teardown() {
    registry.stop();
  }

}
