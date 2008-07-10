package org.openqa.selenium.remote.server;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.Executor;
import java.util.concurrent.LinkedBlockingQueue;
import java.util.concurrent.ThreadPoolExecutor;
import java.util.concurrent.TimeUnit;

import org.openqa.selenium.remote.SessionId;

public class DriverSessions {
  private static Executor executor = new ThreadPoolExecutor(
		      1, 1, Long.MAX_VALUE, TimeUnit.MILLISECONDS, new LinkedBlockingQueue<Runnable>());
  private static Map<SessionId, Session> sessionIdToDriver =
      new ConcurrentHashMap<SessionId, Session>();

  public SessionId newSession(Session session) throws Exception {
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

  public Executor getExecutor() {
    return executor;
  }
}
