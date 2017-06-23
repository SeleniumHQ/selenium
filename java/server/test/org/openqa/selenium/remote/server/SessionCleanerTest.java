// Licensed to the Software Freedom Conservancy (SFC) under one
// or more contributor license agreements.  See the NOTICE file
// distributed with this work for additional information
// regarding copyright ownership.  The SFC licenses this file
// to you under the Apache License, Version 2.0 (the
// "License"); you may not use this file except in compliance
// with the License.  You may obtain a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing,
// software distributed under the License is distributed on an
// "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
// KIND, either express or implied.  See the License for the
// specific language governing permissions and limitations
// under the License.

package org.openqa.selenium.remote.server;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertTrue;
import static org.mockito.Matchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.mockito.Mockito.withSettings;

import org.junit.Test;
import org.junit.runner.RunWith;
import org.junit.runners.JUnit4;
import org.openqa.selenium.Capabilities;
import org.openqa.selenium.Platform;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.internal.Killable;
import org.openqa.selenium.remote.DesiredCapabilities;
import org.openqa.selenium.remote.SessionId;
import org.openqa.testing.StaticTestSessions;

import java.util.concurrent.Callable;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.FutureTask;
import java.util.logging.Logger;

/**
 * @author Kristian Rosenvold
 */
@RunWith(JUnit4.class)
public class SessionCleanerTest {
  private final static Logger log = Logger.getLogger(SessionCleanerTest.class.getName());

  @Test
  public void testCleanup() throws Exception {
    DriverSessions defaultDriverSessions = getDriverSessions(new SystemClock());
    defaultDriverSessions.newSession(DesiredCapabilities.firefox());
    defaultDriverSessions.newSession(DesiredCapabilities.firefox());
    assertEquals(2, defaultDriverSessions.getSessions().size());
    SessionCleaner sessionCleaner = new SessionCleaner(
        defaultDriverSessions,
        log,
        new SystemClock(),
        10,
        10);
    waitForAllSessionsToExpire(11);
    sessionCleaner.checkExpiry();
    assertEquals(0, defaultDriverSessions.getSessions().size());
  }


  @Test
  public void testCleanupWithThread() throws Exception {
    DriverSessions defaultDriverSessions = getDriverSessions(new SystemClock());
    defaultDriverSessions.newSession(DesiredCapabilities.firefox());
    defaultDriverSessions.newSession(DesiredCapabilities.firefox());
    assertEquals(2, defaultDriverSessions.getSessions().size());
    SessionCleaner sessionCleaner = new TestSessionCleaner(defaultDriverSessions, log, 10);
    sessionCleaner.start();
    waitForAllSessionsToExpire(20);
    synchronized (sessionCleaner) {
      sessionCleaner.wait();
    }
    assertEquals(0, defaultDriverSessions.getSessions().size());
    sessionCleaner.stopCleaner();
  }

  private void waitForAllSessionsToExpire(long time) throws InterruptedException {
    Thread.sleep(time);
  }

  class TestSessionCleaner extends SessionCleaner {
    TestSessionCleaner(DriverSessions driverSessions, Logger log, int sessionTimeOutInMs) {
      super(driverSessions, log, new SystemClock(), sessionTimeOutInMs, sessionTimeOutInMs);
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
    Clock clock = new FakeClock();
    DriverSessions defaultDriverSessions = getDriverSessions(clock);
    SessionId firstSession = defaultDriverSessions.newSession(DesiredCapabilities.firefox());
    defaultDriverSessions.newSession(DesiredCapabilities.firefox());
    SessionCleaner sessionCleaner = new SessionCleaner(defaultDriverSessions, log, clock, 100, 100);
    defaultDriverSessions.get(firstSession).updateLastAccessTime();
    clock.pass(120);
    defaultDriverSessions.get(firstSession).updateLastAccessTime();
    sessionCleaner.checkExpiry();
    assertEquals(1, defaultDriverSessions.getSessions().size());
    clock.pass(120);
    sessionCleaner.checkExpiry();
    assertEquals(0, defaultDriverSessions.getSessions().size());
  }

  private DriverSessions getDriverSessions(Clock clock) {
    DriverFactory factory = mock(DriverFactory.class);
    when(factory.newInstance(any(Capabilities.class))).thenReturn(mock(WebDriver.class));
    return new DefaultDriverSessions(factory, clock);
  }
}
