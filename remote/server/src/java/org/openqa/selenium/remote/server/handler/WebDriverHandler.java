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

package org.openqa.selenium.remote.server.handler;

import org.openqa.selenium.WebDriver;
import org.openqa.selenium.internal.WrapsDriver;
import org.openqa.selenium.remote.Response;
import org.openqa.selenium.remote.SessionId;
import org.openqa.selenium.remote.server.DriverSessions;
import org.openqa.selenium.remote.server.KnownElements;
import org.openqa.selenium.remote.server.Session;
import org.openqa.selenium.remote.server.rest.Handler;
import org.openqa.selenium.remote.server.rest.ResultType;

import java.util.concurrent.Callable;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.FutureTask;

public abstract class WebDriverHandler implements Handler, Callable<ResultType> {

  protected final DriverSessions sessions;
  protected SessionId sessionId;

  public WebDriverHandler(DriverSessions sessions) {
    this.sessions = sessions;
  }

  public final ResultType handle() throws Exception {
    FutureTask<ResultType> future = new FutureTask<ResultType>(this);
    try {
      return sessions.get(sessionId).execute(future);
    } catch (ExecutionException e) {
      Throwable cause = e.getCause();
      if (cause instanceof Exception)
        throw (Exception) cause;
      throw e;
    }
  }

  public void setSessionId(String sessionId) {
    this.sessionId = new SessionId(sessionId);
  }

  public String getSessionId() {
    return sessionId.toString();
  }

  public String getScreenshot() {
    Session session = sessions.get(sessionId);
    return session != null ? session.getAndClearScreenshot() : null;
  }

  protected WebDriver getDriver() {
    Session session = sessions.get(sessionId);
    return session.getDriver();
  }

  protected KnownElements getKnownElements() {
    return sessions.get(sessionId).getKnownElements();
  }

  protected Response newResponse() {
    return new Response(sessionId);
  }

  protected SessionId getRealSessionId() {
    return sessionId;
  }

  public void execute(FutureTask<?> task) throws Exception {
    Session session = sessions.get(sessionId);
    if (session != null)
      session.execute(task);
    else
      task.run();
  }
  
  protected WebDriver unwrap(WebDriver driver) {
    WebDriver toReturn = driver;
    while (toReturn instanceof WrapsDriver) {
      toReturn = ((WrapsDriver) toReturn).getWrappedDriver();
    }
    return toReturn;
  }
}
