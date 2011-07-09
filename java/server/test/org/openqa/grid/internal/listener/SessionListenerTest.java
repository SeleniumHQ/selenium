package org.openqa.grid.internal.listener;

import static org.openqa.grid.common.RegistrationRequest.APP;
import static org.openqa.grid.common.RegistrationRequest.CLEAN_UP_CYCLE;
import static org.openqa.grid.common.RegistrationRequest.MAX_SESSION;
import static org.openqa.grid.common.RegistrationRequest.TIME_OUT;

import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.locks.Lock;
import java.util.concurrent.locks.ReentrantLock;

import org.junit.Assert;
import org.junit.BeforeClass;
import org.junit.Test;
import org.openqa.grid.common.RegistrationRequest;
import org.openqa.grid.internal.Registry;
import org.openqa.grid.internal.RemoteProxy;
import org.openqa.grid.internal.TestSession;
import org.openqa.grid.internal.listeners.TestSessionListener;
import org.openqa.grid.internal.listeners.TimeoutListener;
import org.openqa.grid.internal.mock.MockedNewSessionRequestHandler;

public class SessionListenerTest {

  class MyRemoteProxy extends RemoteProxy implements TestSessionListener {

    public MyRemoteProxy(RegistrationRequest request, Registry registry) {
      super(request, registry);
    }

    public void afterSession(TestSession session) {
      session.put("FLAG", false);

    }

    public void beforeSession(TestSession session) {
      session.put("FLAG", true);
    }
  }

  static RegistrationRequest req = null;
  static Map<String, Object> app1 = new HashMap<String, Object>();
  static Map<String, Object> app2 = new HashMap<String, Object>();

  @BeforeClass
  public static void prepare() {
    app1.put(APP, "app1");
    Map<String, Object> config = new HashMap<String, Object>();
    req = new RegistrationRequest();
    req.addDesiredCapabilitiy(app1);
    req.setConfiguration(config);

  }

  @Test
  public void beforeAfterRan() {
    Registry registry = new Registry();
    registry.add(new MyRemoteProxy(req, registry));

    MockedNewSessionRequestHandler req = new MockedNewSessionRequestHandler(registry, app1);
    req.process();
    TestSession session = req.getTestSession();
    Assert.assertEquals(true, session.get("FLAG"));
    session.terminate();
    try {
      Thread.sleep(250);
    } catch (InterruptedException e) {
      e.printStackTrace();
    }
    Assert.assertEquals(false, session.get("FLAG"));
  }

  /**
   * buggy proxy that will throw an exception the first time beforeSession is
   * called.
   *
   * @author Fran�ois Reynaud
   */
  class MyBuggyBeforeRemoteProxy extends RemoteProxy implements TestSessionListener {

    private boolean firstCall = true;

    public MyBuggyBeforeRemoteProxy(RegistrationRequest request, Registry registry) {
      super(request, registry);
    }

    public void afterSession(TestSession session) {
    }

    public void beforeSession(TestSession session) {
      if (firstCall) {
        firstCall = false;
        throw new NullPointerException();
      }
    }
  }

  /**
   * if before throws an exception, the resources are released for other tests
   * to use.
   *
   * @throws InterruptedException
   */
  @Test(timeout = 5000)
  public void buggyBefore() throws InterruptedException {
    Registry registry = new Registry();
    registry.add(new MyBuggyBeforeRemoteProxy(req, registry));

    MockedNewSessionRequestHandler req = new MockedNewSessionRequestHandler(registry, app1);
    req.process();
    // reserve throws an exception, that calls session.terminate, which is
    // in a separate thread. Gives some time for this thread to finish
    // before doing the validations
    while (registry.getActiveSessions().size() != 0) {
      Thread.sleep(250);
    }

    Assert.assertEquals(registry.getActiveSessions().size(), 0);

    req.process();

    TestSession session = req.getTestSession();
    Assert.assertNotNull(session);
    Assert.assertEquals(registry.getActiveSessions().size(), 1);

  }

  /**
   * buggy proxy that will throw an exception the first time beforeSession is
   * called.
   *
   * @author Fran�ois Reynaud
   */
  class MyBuggyAfterRemoteProxy extends RemoteProxy implements TestSessionListener {

    public MyBuggyAfterRemoteProxy(RegistrationRequest request, Registry registry) {
      super(request, registry);
    }

    public void afterSession(TestSession session) {
      throw new NullPointerException();
    }

    public void beforeSession(TestSession session) {
    }
  }

  static boolean processed = false;

  /**
   * if after throws an exception, the resources are NOT released got other
   * tests to use.
   *
   * @throws InterruptedException
   */
  @Test(timeout = 1000)
  public void buggyAfter() throws InterruptedException {
    Registry registry = new Registry();
    registry.add(new MyBuggyAfterRemoteProxy(req, registry));

    MockedNewSessionRequestHandler req = new MockedNewSessionRequestHandler(registry, app1);
    req.process();
    TestSession session = req.getTestSession();
    Assert.assertEquals(registry.getActiveSessions().size(), 1);
    Assert.assertNotNull(session);
    session.terminate();
    try {
      Thread.sleep(250);
    } catch (InterruptedException e) {
      e.printStackTrace();
    }

    final MockedNewSessionRequestHandler req2 = new MockedNewSessionRequestHandler(registry, app1);

    new Thread(new Runnable() {

      public void run() {
        req2.process();
        processed = true;
      }
    }).start();

    Thread.sleep(100);
    Assert.assertFalse(processed);
  }

  class SlowAfterSession extends RemoteProxy implements TestSessionListener, TimeoutListener {

    private Lock lock = new ReentrantLock();
    private boolean firstTime = true;

    public SlowAfterSession(RegistrationRequest request, Registry registry) {
      super(request, registry);
    }

    public void afterSession(TestSession session) {
      session.put("after", true);
      try {
        lock.lock();
        if (firstTime) {
          firstTime = false;
        } else {
          session.put("ERROR", "called twice ..");
        }

      } finally {
        lock.unlock();
      }

      try {
        Thread.sleep(1000);
      } catch (InterruptedException e) {
        e.printStackTrace();
      }
    }

    public void beforeSession(TestSession session) {
    }

    public void beforeRelease(TestSession session) {
      session.terminate();
    }
  }

  /**
   * using a proxy that times out instantly and spends a long time in the
   * after method. check aftermethod cannot be excecuted twice for a session.
   *
   * @throws InterruptedException
   */
  @Test
  public void doubleRelease() throws InterruptedException {
    RegistrationRequest req = new RegistrationRequest();
    Map<String, Object> cap = new HashMap<String, Object>();
    cap.put(APP, "app1");

    Map<String, Object> config = new HashMap<String, Object>();
    config.put(TIME_OUT, 1);
    config.put(CLEAN_UP_CYCLE, 1);
    config.put(MAX_SESSION, 2);

    req.addDesiredCapabilitiy(cap);
    req.setConfiguration(config);

    Registry registry = new Registry();
    registry.add(new SlowAfterSession(req, registry));

    MockedNewSessionRequestHandler r = new MockedNewSessionRequestHandler(registry, app1);
    r.process();
    TestSession session = r.getTestSession();

    Thread.sleep(150);
    // the session has timed out -> doing the long after method.
    Assert.assertEquals(session.get("after"), true);

    // manually closing the session, starting a 2nd release process.
    session.terminate();

    // the 2nd release process shouldn't be executed as one is already
    // processed.
    Assert.assertNull(session.get("ERROR"));

  }

}
