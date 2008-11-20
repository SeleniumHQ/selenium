package org.openqa.selenium.remote.server;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.Executor;
import java.util.concurrent.LinkedBlockingQueue;
import java.util.concurrent.ThreadPoolExecutor;
import java.util.concurrent.TimeUnit;

import org.openqa.selenium.remote.SessionId;
import org.openqa.selenium.remote.Capabilities;

public class DriverSessions {

  private static Map<SessionId, Session> sessionIdToDriver =
      new ConcurrentHashMap<SessionId, Session>();

  public SessionId newSession(Capabilities desiredCapabilities) throws Exception {
    Session session = new Session(desiredCapabilities);
    
    SessionId sessionId = new SessionId(String.valueOf(System.currentTimeMillis()));
    sessionIdToDriver.put(sessionId, session);
    return sessionId;
  }
  
  public Session get(SessionId sessionId) {
    return sessionIdToDriver.get(sessionId);
  }

  public void deleteSession(SessionId sessionId) {
    sessionIdToDriver.remove(sessionId);
  }
}
