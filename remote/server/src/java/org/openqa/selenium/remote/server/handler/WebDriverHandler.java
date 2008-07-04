package org.openqa.selenium.remote.server.handler;

import org.openqa.selenium.WebDriver;
import org.openqa.selenium.remote.Context;
import org.openqa.selenium.remote.Response;
import org.openqa.selenium.remote.SessionId;
import org.openqa.selenium.remote.server.DriverSessions;
import org.openqa.selenium.remote.server.KnownElements;
import org.openqa.selenium.remote.server.Session;
import org.openqa.selenium.remote.server.rest.Handler;

public abstract class WebDriverHandler implements Handler {

  protected final DriverSessions sessions;
  protected SessionId sessionId;
  private Context context;

  public WebDriverHandler(DriverSessions sessions) {
    this.sessions = sessions;
  }

  public void setSessionId(String sessionId) {
    this.sessionId = new SessionId(sessionId);
  }

  public void setContext(String context) {
    this.context = new Context(context);
  }

  public String getSessionId() {
    return sessionId.toString();
  }

  public String getContext() {
    return context == null ? null : context.toString();
  }

  protected WebDriver getDriver() {
    Session session = sessions.get(sessionId);
    return session.getDriver(context);
  }

  protected KnownElements getKnownElements() {
    return sessions.get(sessionId).getKnownElements();
  }

  protected Response newResponse() {
    return new Response(sessionId, context);
  }

  protected SessionId getRealSessionId() {
    return sessionId;
  }
}
