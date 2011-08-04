package org.openqa.grid.internal;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.junit.Assert;
import org.junit.BeforeClass;
import org.junit.Test;
import org.openqa.grid.common.RegistrationRequest;
import org.openqa.grid.internal.mock.MockedNewSessionRequestHandler;
import org.openqa.grid.internal.mock.MockedRequestHandler;

import static org.openqa.grid.common.RegistrationRequest.*;

public class ParallelTest {

  static RegistrationRequest req = null;
  static Map<String, Object> app1 = new HashMap<String, Object>();
  static Map<String, Object> app2 = new HashMap<String, Object>();

  /**
   * a proxy than can host up to 5 tests at the same time. - of type app1 (
   * max 5 tests at the same time ) could be Firefox for instance - of type
   * app2 ( max 1 test ) could be IE
   */
  @BeforeClass
  public static void prepareReqRequest() {

    Map<String, Object> config = new HashMap<String, Object>();
    app1.put(APP, "app1");
    app1.put(MAX_INSTANCES, 5);

    app2.put(APP, "app2");
    app2.put(MAX_INSTANCES, 1);

    config.put(REMOTE_URL, "http://machine1:4444");
    config.put(MAX_SESSION, 5);

    req = new RegistrationRequest();
    req.addDesiredCapabilitiy(app1);
    req.addDesiredCapabilitiy(app2);
    req.setConfiguration(config);
  }

  @Test
  public void canGetApp2() throws InterruptedException {
    Registry registry = new Registry();
    RemoteProxy p1 = new RemoteProxy(req, registry);
    try {
      registry.add(p1);
      MockedRequestHandler newSessionRequest = new MockedNewSessionRequestHandler(registry, app2);
      newSessionRequest.process();
    } finally {
      registry.stop();
    }

  }

  static boolean started = false;
  static boolean processed = false;

  /**
   * cannot reserve 2 app2
   *
   * @throws InterruptedException
   */
  @Test
  public void cannotGet2App2() throws InterruptedException {
    final Registry registry = new Registry();
    RemoteProxy p1 = new RemoteProxy(req, registry);
    try {
      registry.add(p1);
      MockedRequestHandler newSessionRequest = new MockedNewSessionRequestHandler(registry, app2);
      newSessionRequest.process();
      new Thread(new Runnable() {
        public void run() {
          MockedRequestHandler newSessionRequest = new MockedNewSessionRequestHandler(registry, app2);
          started = true;
          newSessionRequest.process();
          processed = true;
        }
      }).start();
      // give it time
      Thread.sleep(250);
      Assert.assertTrue(started);
      Assert.assertFalse(processed);
    } finally {
      registry.stop();
    }
  }

  /**
   * can reserve 5 app1
   */
  @Test(timeout = 2000)
  public void canGet5App1() {
    final Registry registry = new Registry();
    RemoteProxy p1 = new RemoteProxy(req, registry);
    try {
      registry.add(p1);
      for (int i = 0; i < 5; i++) {
        MockedRequestHandler newSessionRequest = new MockedNewSessionRequestHandler(registry, app1);
        newSessionRequest.process();
      }
    } finally {
      registry.stop();
    }
  }

  static int cpt = 0;

  static synchronized void inc() {
    cpt++;
  }

  /**
   * cannot get 6 app1
   *
   * @throws InterruptedException
   */
  @Test(timeout = 1000)
  public void cannotGet6App1() throws InterruptedException {
    final Registry registry = new Registry();
    RemoteProxy p1 = new RemoteProxy(req, registry);
    try {
      registry.add(p1);
      for (int i = 0; i < 6; i++) {
        new Thread(new Runnable() {
          public void run() {
            MockedRequestHandler newSessionRequest = new MockedNewSessionRequestHandler(registry, app1);
            newSessionRequest.process();
            inc();
          }
        }).start();
      }

      Thread.sleep(250);
      Assert.assertEquals(5, cpt);
    } finally {
      registry.stop();
    }
  }


  static int cpt2 = 0;

  static synchronized void inc2() {
    cpt2++;
  }

  static boolean app6Done = false;

  /**
   * cannot get app2 if 5 app1 are reserved.
   *
   * @throws InterruptedException
   */
  @Test(timeout = 1000)
  public void cannotGetApp2() throws InterruptedException {
    final Registry registry = new Registry();
    RemoteProxy p1 = new RemoteProxy(req, registry);
    try {
      registry.add(p1);

      for (int i = 0; i < 5; i++) {
        new Thread(new Runnable() {
          public void run() {
            MockedRequestHandler newSessionRequest = new MockedNewSessionRequestHandler(registry, app1);
            newSessionRequest.process();
            inc2();
          }
        }).start();
      }

      while (cpt2 != 5) {
        Thread.sleep(100);
      }

      new Thread(new Runnable() {
        public void run() {
          MockedRequestHandler newSessionRequest = new MockedNewSessionRequestHandler(registry, app2);
          newSessionRequest.process();
          app6Done = true;
        }
      }).start();

      Thread.sleep(250);
      Assert.assertFalse(app6Done);
    } finally {
      registry.stop();
    }
  }

  @Test(timeout = 10000)
  public void releaseAndReserve() throws InterruptedException {
    Registry registry = new Registry();
    RemoteProxy p1 = null;
    RegistrationRequest req = null;
    Map<String, Object> app1 = new HashMap<String, Object>();
    Map<String, Object> app2 = new HashMap<String, Object>();
    Map<String, Object> config = new HashMap<String, Object>();
    app1.put(APP, "app1");
    app1.put(MAX_INSTANCES, 5);

    app2.put(APP, "app2");
    app2.put(MAX_INSTANCES, 1);

    config.put(REMOTE_URL, "http://machine1:4444");
    config.put(MAX_SESSION, 5);

    req = new RegistrationRequest();
    req.addDesiredCapabilitiy(app1);
    req.addDesiredCapabilitiy(app2);
    req.setConfiguration(config);

    p1 = RemoteProxy.getNewInstance(req, registry);

    try {
      registry.add(p1);

      // reserve 5 app1
      List<TestSession> used = new ArrayList<TestSession>();
      for (int i = 0; i < 5; i++) {
        MockedRequestHandler newSessionRequest = new MockedNewSessionRequestHandler(registry, app1);
        newSessionRequest.process();
        used.add(newSessionRequest.getTestSession());
      }

      Assert.assertEquals(registry.getActiveSessions().size(), 5);

      // release them
      for (TestSession session : used) {
        session.terminateSynchronousFOR_TEST_ONLY();
      }
      Assert.assertEquals(registry.getActiveSessions().size(), 0);
      used.clear();

      // reserve them again
      for (int i = 0; i < 5; i++) {
        int original = registry.getActiveSessions().size();
        Assert.assertEquals(original, i);
        MockedRequestHandler newSessionRequest = new MockedNewSessionRequestHandler(registry, app1);
        newSessionRequest.process();
        TestSession session = newSessionRequest.getTestSession();
        used.add(session);
      }

      Assert.assertEquals(registry.getActiveSessions().size(), 5);

      used.get(0).terminateSynchronousFOR_TEST_ONLY();

      MockedRequestHandler newSessionRequest = new MockedNewSessionRequestHandler(registry, app2);
      newSessionRequest.process();
      newSessionRequest.getTestSession();
      Assert.assertEquals(registry.getActiveSessions().size(), 5);
      System.out.println(registry.getAllProxies());
    } finally {
      registry.stop();
    }

  }

}
