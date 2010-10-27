/*
Copyright 2007-2009 WebDriver committers
Copyright 2007-2009 Google Inc.

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

import junit.framework.TestCase;
import org.openqa.selenium.Capabilities;
import org.openqa.selenium.Platform;
import org.openqa.selenium.StubDriver;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.internal.Trace;
import org.openqa.selenium.remote.DesiredCapabilities;
import org.openqa.selenium.remote.SessionId;

/**
 * @author Kristian Rosenvold
 */
public class SessionCleanerTest extends TestCase {

  public void testCleanup() throws Exception {
    DriverSessions defaultDriverSessions = getDriverSessions();
    defaultDriverSessions.newSession(DesiredCapabilities.firefox());
    defaultDriverSessions.newSession(DesiredCapabilities.firefox());
    assertEquals(2, defaultDriverSessions.getSessions().size());
    SessionCleaner sessionCleaner = new SessionCleaner(defaultDriverSessions, new NullLogTo(), 10);
    waitForAllSessionsToExpire();
    sessionCleaner.checkExpiry();
    assertEquals(0, defaultDriverSessions.getSessions().size());
  }

  public void testCleanupWithThread() throws Exception {
    DriverSessions defaultDriverSessions = getDriverSessions();
    defaultDriverSessions.newSession(DesiredCapabilities.firefox());
    defaultDriverSessions.newSession(DesiredCapabilities.firefox());
    assertEquals(2, defaultDriverSessions.getSessions().size());
    SessionCleaner sessionCleaner = new TestSessionCleaner(defaultDriverSessions, new NullLogTo(), 10);
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
    TestSessionCleaner(DriverSessions driverSessions, Trace trace, int sessionTimeOutInMs) {
      super(driverSessions, trace, sessionTimeOutInMs);
    }

    @Override
    void checkExpiry() {
      super.checkExpiry();
      synchronized (this) {
        this.notifyAll();
      }
    }
  }

  public void testCleanupWithSessionExtension() throws Exception {
    DriverSessions defaultDriverSessions = getDriverSessions();
    SessionId firstSession = defaultDriverSessions.newSession(DesiredCapabilities.firefox());
    defaultDriverSessions.newSession(DesiredCapabilities.firefox());
    SessionCleaner sessionCleaner = new SessionCleaner(defaultDriverSessions, new NullLogTo(), 10);
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

}
