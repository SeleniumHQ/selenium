package org.openqa.grid.internal;

import static org.openqa.grid.common.RegistrationRequest.APP;

import java.util.HashMap;
import java.util.Map;

import org.junit.AfterClass;
import org.junit.Assert;
import org.junit.BeforeClass;
import org.junit.Test;
import org.openqa.grid.internal.mock.MockedNewSessionRequestHandler;
import org.openqa.grid.internal.mock.MockedRequestHandler;
import org.openqa.grid.web.servlet.handler.RequestType;

/**
 * registering an already existing node assumes the node has been restarted, and
 * all the resources are free again
 *
 * @author freynaud
 */
public class AddingProxyAgainFreesResources {

  private static Registry registry;

  private static Map<String, Object> ff = new HashMap<String, Object>();
  private static RemoteProxy p1;
  private static MockedRequestHandler request;
  private static TestSession session = null;

  /**
   * create a hub with 1 node accepting 1 FF
   *
   * @throws InterruptedException
   */
  @BeforeClass
  public static void setup() throws InterruptedException {
    registry = new Registry();
    ff.put(APP, "FF");
    p1 = RemoteProxyFactory.getNewBasicRemoteProxy(ff, "http://machine1:4444", registry);
    registry.add(p1);

    Map<String, Object> cap = new HashMap<String, Object>();
    cap.put(APP, "FF");
    request = new MockedNewSessionRequestHandler(registry, cap);

    // use all the spots ( so 1 ) of the grid so that a queue builds up
    MockedRequestHandler newSessionRequest = new MockedRequestHandler(registry);
    newSessionRequest.setRequestType(RequestType.START_SESSION);
    newSessionRequest.setDesiredCapabilities(ff);
    newSessionRequest.process();
    session = newSessionRequest.getTestSession();
    // the test has been assigned.
    Assert.assertNotNull(session);

    // add the request to the queue
    final MockedRequestHandler req = request;
    new Thread(new Runnable() {
      public void run() {
        req.process();
      }
    }).start();
    // the 1 slot of the node is used.
    Assert.assertEquals(1, p1.getTotalUsed());

    // registering the node again should discard the existing test. The node
    // will be fresh as far as the grid is concerned so the 2nd test that
    // was waiting in the queue should be processed.
    registry.add(p1);

  }

  @Test(timeout = 1000)
  public void validateRequest2isNowRunningOnTheNode() throws InterruptedException {
    Thread.sleep(250);
    Assert.assertNotNull(request.getTestSession());
  }

  @AfterClass
  public static void teardown() {
    registry.stop();
  }
}
