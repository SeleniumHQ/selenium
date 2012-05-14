/*
Copyright 2007-2009 Selenium committers

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
package org.openqa.selenium.remote.server;

import org.junit.Test;
import org.openqa.selenium.Capabilities;
import org.openqa.selenium.Platform;
import org.openqa.selenium.StubDriver;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.internal.Killable;
import org.openqa.selenium.remote.DesiredCapabilities;
import org.openqa.selenium.remote.RemoteWebDriver;
import org.openqa.selenium.remote.SessionId;
import org.openqa.selenium.remote.server.testing.StaticTestSessions;

import java.util.concurrent.Callable;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.FutureTask;
import java.util.logging.Logger;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertTrue;

/**
 * @author Kristian Rosenvold
 */
public class SessionCleanerTest {
  private final static Logger log = Logger.getLogger(SessionCleanerTest.class.getName());

  @Test
  public void testCleanup() throws Exception {
    DriverSessions defaultDriverSessions = getDriverSessions();
    defaultDriverSessions.newSession(DesiredCapabilities.firefox());
    defaultDriverSessions.newSession(DesiredCapabilities.firefox());
    assertEquals(2, defaultDriverSessions.getSessions().size());
    SessionCleaner sessionCleaner = new SessionCleaner(defaultDriverSessions, log, 10, 10);
    waitForAllSessionsToExpire();
    sessionCleaner.checkExpiry();
    assertEquals(0, defaultDriverSessions.getSessions().size());
  }

  @Test
  public void testCleanupWithTimedOutKillableDriver() throws Exception {
    Capabilities capabilities = new DesiredCapabilities("foo", "1", Platform.ANY);
    DriverSessions testSessions = new StaticTestSessions(capabilities, new KillableDriver());

    final Session session = testSessions.get(testSessions.newSession(capabilities));
    final CountDownLatch started = new CountDownLatch(1);
    final CountDownLatch testDone = new CountDownLatch(1);
    Runnable runnable = getRunnableThatMakesSessionBusy(session, started, testDone);
    new Thread( runnable).start();
    started.await();

    KillableDriver killableDriver = (KillableDriver) session.getDriver();
    assertTrue(session.isInUse());
    SessionCleaner sessionCleaner = new SessionCleaner(testSessions, log, 10, 10);
    waitForAllSessionsToExpire();
    sessionCleaner.checkExpiry();
    assertEquals(0, testSessions.getSessions().size());
    assertTrue(killableDriver.killed);
    testDone.countDown();
  }

  private Runnable getRunnableThatMakesSessionBusy(final Session session,
                                                   final CountDownLatch started,
                                                   final CountDownLatch testDone) {
    return new Runnable(){
      public void run(){
        try {
          session.execute(new FutureTask<Object>(new Callable<Object>()
         {
          public Object call() {
            try {
              started.countDown();
              testDone.await();
            } catch (InterruptedException e) {
              throw new RuntimeException(e);
            }
            return "yo";
          }
        }));
        } catch (Exception e) {
          throw new RuntimeException(e);
        }
      }
    };
  }

  @Test
  public void testCleanupWithThread() throws Exception {
    DriverSessions defaultDriverSessions = getDriverSessions();
    defaultDriverSessions.newSession(DesiredCapabilities.firefox());
    defaultDriverSessions.newSession(DesiredCapabilities.firefox());
    assertEquals(2, defaultDriverSessions.getSessions().size());
    SessionCleaner sessionCleaner = new TestSessionCleaner(defaultDriverSessions, log, 10);
    sessionCleaner.start();
    waitForAllSessionsToExpire();
    synchronized (sessionCleaner) {
      sessionCleaner.wait();
    }
    assertEquals(0, defaultDriverSessions.getSessions().size());
    sessionCleaner.stopCleaner();
  }

  private void waitForAllSessionsToExpire() throws InterruptedException {
    Thread.sleep(11);
  }

  class TestSessionCleaner extends SessionCleaner {
    TestSessionCleaner(DriverSessions driverSessions, Logger log, int sessionTimeOutInMs) {
      super(driverSessions, log, sessionTimeOutInMs, sessionTimeOutInMs);
    }

    @Override
    void checkExpiry() {
      super.checkExpiry();
      synchronized (this) {
        this.notifyAll();
      }
    }
  }

  @Test
  public void testCleanupWithSessionExtension() throws Exception {
    DriverSessions defaultDriverSessions = getDriverSessions();
    SessionId firstSession = defaultDriverSessions.newSession(DesiredCapabilities.firefox());
    defaultDriverSessions.newSession(DesiredCapabilities.firefox());
    SessionCleaner sessionCleaner = new SessionCleaner(defaultDriverSessions, log, 10, 10);
    waitForAllSessionsToExpire();
    defaultDriverSessions.get(firstSession).updateLastAccessTime();
    sessionCleaner.checkExpiry();
    assertEquals(1, defaultDriverSessions.getSessions().size());
    waitForAllSessionsToExpire();
    sessionCleaner.checkExpiry();
    assertEquals(0, defaultDriverSessions.getSessions().size());
  }

  private DriverSessions getDriverSessions() {
    DriverFactory factory = new MyDriverFactory();
    return new DefaultDriverSessions(Platform.LINUX, factory);
  }

  class MyDriverFactory implements DriverFactory {
    public void registerDriver(Capabilities capabilities, Class<? extends WebDriver> implementation) {


    }

    public WebDriver newInstance(Capabilities capabilities) {
      return new StubDriver() {
        @Override
        public void quit() {
        }
      };
    }

    public boolean hasMappingFor(Capabilities capabilities) {
      return true;
    }
  }

  static class KillableDriver extends RemoteWebDriver implements Killable {
    boolean killed;

    public void kill() {
      killed = true;
    }
  }

}
