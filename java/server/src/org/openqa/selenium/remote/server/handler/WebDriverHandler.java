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

package org.openqa.selenium.remote.server.handler;

import org.openqa.selenium.WebDriver;
import org.openqa.selenium.internal.WrapsDriver;
import org.openqa.selenium.remote.Response;
import org.openqa.selenium.remote.SessionId;
import org.openqa.selenium.remote.server.KnownElements;
import org.openqa.selenium.remote.server.Session;
import org.openqa.selenium.remote.server.rest.RestishHandler;
import org.openqa.selenium.remote.server.rest.ResultType;

import java.util.concurrent.Callable;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.FutureTask;

public abstract class WebDriverHandler implements RestishHandler, Callable<ResultType> {

  private final Session session;

  protected WebDriverHandler(Session session) {
    this.session = session;
  }

  public final ResultType handle() throws Exception {
    FutureTask<ResultType> future = new FutureTask<ResultType>(this);
    try {
      return getSession().execute(future);
    } catch (ExecutionException e) {
      Throwable cause = e.getCause();
      if (cause instanceof Exception)
        throw (Exception) cause;
      throw e;
    }
  }

  public SessionId getSessionId() {
    return session.getSessionId();
  }

  public String getScreenshot() {
    Session session = getSession();
    return session != null ? session.getAndClearScreenshot() : null;
  }

  protected WebDriver getDriver() {
    Session session = getSession();
    return session.getDriver();
  }

  protected Session getSession() {
    return session;
  }

  protected KnownElements getKnownElements() {
    return getSession().getKnownElements();
  }

  protected Response newResponse() {
    return new Response(session.getSessionId());
  }

  protected SessionId getRealSessionId() {
    return session == null ? new SessionId("unknown") : session.getSessionId();
  }

  protected BySelector newBySelector() {
    return new BySelector();
  }

  public void execute(FutureTask<?> task) throws Exception {
    Session session = getSession();
    if (session != null)
      session.execute(task);
    else
      task.run();
  }

  protected WebDriver getUnwrappedDriver() {
    WebDriver toReturn = getDriver();
    while (toReturn instanceof WrapsDriver) {
      toReturn = ((WrapsDriver) toReturn).getWrappedDriver();
    }
    return toReturn;
  }
}
