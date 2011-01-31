/*
Copyright 2007-2010 WebDriver committers

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

import org.openqa.selenium.internal.Trace;
import org.openqa.selenium.remote.SessionId;
import org.openqa.selenium.remote.server.handler.DeleteSession;

class SessionCleaner extends Thread {

  private final DriverSessions driverSessions;
  private final int timeoutMs;
  private final Trace trace;
  private volatile boolean running = true;

  SessionCleaner(DriverSessions driverSessions, Trace trace, int sessionTimeOutInMs) {
    super("DriverServlet Session Cleaner");
    this.trace = trace;
    timeoutMs = sessionTimeOutInMs;
    this.driverSessions = driverSessions;
  }


  @SuppressWarnings({"InfiniteLoopStatement"})
  @Override
  public void run() {
    while (running) {
      checkExpiry();
      try {
        Thread.sleep(timeoutMs / 10);
      } catch (InterruptedException e) {
        trace.info("Exiting session cleaner thread");
      }
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
      if (session != null && session.isTimedOut(timeoutMs)) {
        DeleteSession deleteSession = new DeleteSession(driverSessions);
        deleteSession.setSessionId(sessionId.toString());
        try {
          deleteSession.call();
          trace.info("Session " + session + " deleted due to timeout");
        } catch (Exception e) {
          throw new RuntimeException(e);
        }
      }
    }
  }
}
