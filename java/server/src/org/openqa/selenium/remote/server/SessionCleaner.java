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

import org.openqa.selenium.WebDriver;
import org.openqa.selenium.internal.Killable;
import org.openqa.selenium.remote.SessionId;
import org.openqa.selenium.remote.server.handler.DeleteSession;
import org.openqa.selenium.remote.server.log.LoggingManager;
import org.openqa.selenium.remote.server.log.PerSessionLogHandler;
import org.openqa.selenium.support.events.EventFiringWebDriver;

import java.util.logging.Level;
import java.util.logging.Logger;

class SessionCleaner extends Thread {   // Thread safety reviewed

  private final DriverSessions driverSessions;
  private final long clientGoneTimeout;
  private final long insideBrowserTimeout;
  private final long sleepInterval;
  private final Logger log;
  private final Clock clock;
  private volatile boolean running = true;

  SessionCleaner(DriverSessions driverSessions, Logger log, long clientGoneTimeout, long insideBrowserTimeout) {
    this(driverSessions, log, new SystemClock(), clientGoneTimeout, insideBrowserTimeout);
  }

  SessionCleaner(DriverSessions driverSessions, Logger log, Clock clock, long clientGoneTimeout, long insideBrowserTimeout) {
    super("DriverServlet Session Cleaner");
    this.log = log;
    this.clock = clock;
    this.clientGoneTimeout = clientGoneTimeout;
    this.insideBrowserTimeout = insideBrowserTimeout;
    this.driverSessions = driverSessions;
    if (clientGoneTimeout == 0 && insideBrowserTimeout == 0) {
      throw new IllegalStateException("SessionCleaner not supposed to start when no timeouts specified");
    }
    if (insideBrowserTimeout > 0 && insideBrowserTimeout < 60000) {
      log.warning("The specified browser timeout is TOO LOW for safe operations and may have " +
                  "other side-effects\n. Please specify a slightly higher browserTimeout.");
    }
    long lowestNonZero = Math.min((insideBrowserTimeout > 0) ? insideBrowserTimeout : clientGoneTimeout,
                                  clientGoneTimeout > 0 ? clientGoneTimeout : insideBrowserTimeout);
    this.sleepInterval = lowestNonZero / 10;

    log.info(String.format("SessionCleaner initialized with insideBrowserTimeout %d and clientGoneTimeout %d polling every %d", this.insideBrowserTimeout, this.clientGoneTimeout, sleepInterval));
  }


  @SuppressWarnings({"InfiniteLoopStatement"})
  @Override
  public void run() {
    while (running) {
      checkExpiry();
      clock.pass(sleepInterval);
    }
  }

  void stopCleaner() {
    running = false;
    synchronized (this) {
      this.interrupt();
    }

  }

  void checkExpiry() {
    for (SessionId sessionId : driverSessions.getSessions()) {
      Session session = driverSessions.get(sessionId);
      if (session != null) {
        boolean useDeleteSession = false;
        boolean killed = false;

        boolean inUse = session.isInUse();
        if (!inUse && session.isTimedOut(clientGoneTimeout)) {
          useDeleteSession = true;
          log.info("Session " + session.getSessionId() + " deleted due to client timeout");
        }
        if (inUse && session.isTimedOut(insideBrowserTimeout)) {
          WebDriver driver = session.getDriver();
          if (driver instanceof EventFiringWebDriver) {
            driver = ((EventFiringWebDriver)driver).getWrappedDriver();
          }
          if (driver instanceof Killable) {
            //session.interrupt();
            ((Killable) driver).kill();
            killed = true;
            log.warning("Browser killed and session " + session.getSessionId() + " terminated due to in-browser timeout.");
          } else {
            useDeleteSession = true;
            log.warning("Session " + session.getSessionId() + " deleted due to in-browser timeout. " +
                        "Terminating driver with DeleteSession since it does not support Killable, "
                        + "the driver in question does not support selenium-server timeouts fully");
          }
        }

        if (useDeleteSession) {
          DeleteSession deleteSession = new DeleteSession(session);
          try {
            deleteSession.call();
          } catch (Exception e) {
            log.log(Level.WARNING, "Could not delete session " + session.getSessionId(), e);
            continue;
          }
        }

        if (useDeleteSession || killed) {
          driverSessions.deleteSession(sessionId);
          final PerSessionLogHandler logHandler = LoggingManager.perSessionLogHandler();
          logHandler.transferThreadTempLogsToSessionLogs(sessionId);
          logHandler.removeSessionLogs(sessionId);
        }
      }
    }
  }
}
