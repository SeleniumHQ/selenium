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

package org.openqa.selenium.remote.server.rest;

import com.google.common.annotations.VisibleForTesting;
import com.google.common.collect.LinkedHashMultimap;
import com.google.common.collect.Lists;
import com.google.common.collect.Multimap;

import org.openqa.selenium.WebDriverException;
import org.openqa.selenium.remote.ErrorCodes;
import org.openqa.selenium.remote.HttpCommandExecutor;
import org.openqa.selenium.remote.JsonToBeanConverter;
import org.openqa.selenium.remote.PropertyMunger;
import org.openqa.selenium.remote.SessionId;
import org.openqa.selenium.remote.SimplePropertyDescriptor;
import org.openqa.selenium.remote.UnreachableBrowserException;
import org.openqa.selenium.remote.server.DriverSessions;
import org.openqa.selenium.remote.server.JsonParametersAware;
import org.openqa.selenium.remote.server.Session;
import org.openqa.selenium.remote.server.handler.DeleteSession;
import org.openqa.selenium.remote.server.handler.SessionNotFoundException;
import org.openqa.selenium.remote.server.handler.WebDriverHandler;
import org.openqa.selenium.server.log.LoggingManager;
import org.openqa.selenium.server.log.PerSessionLogHandler;

import java.io.BufferedReader;
import java.lang.reflect.Constructor;
import java.lang.reflect.Method;
import java.lang.reflect.UndeclaredThrowableException;
import java.util.Collection;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.concurrent.Callable;
import java.util.concurrent.FutureTask;
import java.util.concurrent.RejectedExecutionException;
import java.util.logging.Level;
import java.util.logging.Logger;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import static com.google.common.base.Preconditions.checkNotNull;

public class ResultConfig {

  private final String[] sections;
  private final HandlerFactory handlerFactory;
  private final DriverSessions sessions;
  private final Multimap<ResultType, Result> resultToRender = LinkedHashMultimap.create();
  private final String url;
  private final Logger log;

  public ResultConfig(String url, Class<? extends Handler> handlerClazz, DriverSessions sessions,
      Logger log) {
    this.url = url;
    this.log = log;
    if (url == null || handlerClazz == null) {
      throw new IllegalArgumentException("You must specify the handler and the url");
    }

    sections = url.split("/");
    this.sessions = sessions;
    this.handlerFactory = getHandlerFactory(handlerClazz);
  }


  public Handler getHandler(String url, SessionId sessionId) throws Exception {
    if (!isFor(url)) {
      return null;
    }
    return populate(handlerFactory.createHandler(sessionId), url);
  }

  public boolean isFor(String urlToMatch) {
    if (urlToMatch == null) {
      return sections.length == 0;
    }

    String[] allParts = urlToMatch.split("/");

    if (sections.length != allParts.length) {
      return false;
    }

    for (int i = 0; i < sections.length; i++) {
      if (!(sections[i].startsWith(":") || sections[i].equals(allParts[i]))) {
        return false;
      }
    }

    return true;
  }

  interface HandlerFactory {
    Handler createHandler(SessionId sessionId) throws Exception;
  }


  protected Handler populate(Handler handler, String pathString) {
    if (pathString == null) {
      return handler;
    }

    String[] strings = pathString.split("/");

    for (int i = 0; i < sections.length; i++) {
      if (!sections[i].startsWith(":")) {
        continue;
      }
      try {
        PropertyMunger.set(sections[i].substring(1), handler, strings[i]);
      } catch (Exception e) {
        throw new WebDriverException(e);
      }
    }

    return handler;
  }

  /**
   * Configures this instance to handle a particular type of result with the given renderer. This
   * result handler will be registered with an empty mime-type.  Accordingly, it will only be used
   * if there are no other handlers registered with an exact mime-type match.
   *
   * @param resultType The type of result to configure.
   * @param renderer The renderer to use.
   * @return A self reference for fluency.
   * @see #on(ResultType, Result)
   */
  public ResultConfig on(ResultType resultType, Renderer renderer) {
    return on(resultType, renderer, "");
  }

  /*
   * Configure this ResultConfig to handle results of type ResultType with a specific renderer. The
   * mimeType is used to distinguish between JSON calls and "ordinary" browser pointed at the remote
   * WD Server, which is not implemented at all yet.
   * @see #on(ResultType, Result)
   */
  public ResultConfig on(ResultType success, Renderer renderer, String mimeType) {
    return on(success, new Result(mimeType, renderer));
  }

  /**
   * Configures how this instance will handle specific types of results. Each ResultType may be
   * handled by multiple Results. Upon rendering a response, this instance will select the first
   * Result that is an exact mime-type match for the original HTTP request (results are checked in
   * the order registered). There may only be one Result registered for each mime-type.
   *
   * @param type The type of result to configure for.
   * @param result The handler for the given result type.
   * @return A self reference for fluency.
   */
  public ResultConfig on(ResultType type, Result result) {
    // There should not be more than one renderer for each result and
    // mime type.
    for (Result existingResult : resultToRender.get(type)) {
      assert(!existingResult.isExactMimeTypeMatch(result.getMimeType()));
    }
    resultToRender.put(type, result);
    return this;
  }

  public void handle(String pathInfo, final HttpServletRequest request,
      final HttpServletResponse response) throws Exception {
    String sessionId = HttpCommandExecutor.getSessionId(request.getRequestURI());
    SessionId sessId = sessionId != null ? new SessionId(sessionId) : null;

    ResultType result;
    if (isSessionTerminated(sessId, request, response)) {
      return;
    }
    final Handler handler = getHandler(pathInfo, sessId);

    if (handler instanceof JsonParametersAware) {
      setJsonParameters(request, handler);
    }

    request.setAttribute("handler", handler);


    if (isSessionTerminated(sessId, request, response)) {
      return;
    }

    try {
      log.info(String.format("Executing: %s at URL: %s)", handler.toString(), pathInfo));
      result = handler.handle();
      addHandlerAttributesToRequest(request, handler);
      log.info("Done: " + pathInfo);
    } catch (UnreachableBrowserException e){
      replyError(request, response, e);
      return;
    } catch (Exception e) {
      result = ResultType.EXCEPTION;
      log.log(Level.WARNING, "Exception thrown", e);

      Throwable toUse = getRootExceptionCause(e);

      log.warning("Exception: " + toUse.getMessage());
      request.setAttribute("exception", toUse);
      if (handler instanceof WebDriverHandler) {
        request.setAttribute("screen", ((WebDriverHandler) handler).getScreenshot());
      }
    } catch (Error e) {
      log.info("Error: " + e.getMessage());
      result = ResultType.EXCEPTION;
      request.setAttribute("exception", e);
    }

    final Renderer renderer = getRenderer(result, request);

    if (handler instanceof WebDriverHandler) {
      FutureTask<ResultType> task = new FutureTask<ResultType>(new Callable<ResultType>() {
        public ResultType call() throws Exception {
          renderer.render(request, response, handler);
          response.flushBuffer();
          return null;
        }
      });

      try {
      ((WebDriverHandler) handler).execute(task);
      task.get();
      } catch (RejectedExecutionException e){  // The session is gone
        respondSessionError(sessId, request, response);
      }

      if (handler instanceof DeleteSession) {
        // Yes, this is funky. See javadoc on cleatThreadTempLogs for details.
        final PerSessionLogHandler logHandler = LoggingManager.perSessionLogHandler();
        logHandler.transferThreadTempLogsToSessionLogs(sessionId);
        logHandler.removeSessionLogs(sessionId);
        sessions.deleteSession(sessId);
      }


    } else {
      renderer.render(request, response, handler);
      response.flushBuffer();
    }
  }

  private void replyError(HttpServletRequest request, final HttpServletResponse response, Exception e)
      throws Exception {
    response.reset();
    Renderer renderer2 = getRenderer( ResultType.EXCEPTION, request);
    request.setAttribute("exception",  e);
    renderer2.render(request, response, null);

  }

  private boolean isSessionTerminated(SessionId sessId, HttpServletRequest request,
                                      HttpServletResponse response) throws Exception {
    if (sessId == null) return false;
    Session session = sessions.get(sessId);
    final boolean isTerminated = session == null;
    if (isTerminated){
      respondSessionError(sessId, request, response);
    }
    return isTerminated;
  }

  private void respondSessionError(SessionId sessId, HttpServletRequest request,
                                   HttpServletResponse response) throws Exception {
    SessionNotFoundException sessionNotFoundException =
        new SessionNotFoundException("404 session " + sessId + " not found");
    request.setAttribute("exception", sessionNotFoundException);
    replyError(request, response, sessionNotFoundException);
  }

  @VisibleForTesting
  Renderer getRenderer(ResultType resultType, HttpServletRequest request) {
    Collection<Result> results = checkNotNull(resultToRender.get(resultType));
    Result tempToUse = null;
    for (Result res : results) {
      if (tempToUse == null && !res.isOnlyForExactMatch()
          || res.isExactMimeTypeMatch(request.getHeader("Accept"))) {
        tempToUse = res;
      }
    }
    return checkNotNull(tempToUse).getRenderer();
  }

  @SuppressWarnings("unchecked")
  private void setJsonParameters(HttpServletRequest request, Handler handler) throws Exception {
    BufferedReader reader = request.getReader();
    StringBuilder builder = new StringBuilder();
    for (String line = reader.readLine(); line != null; line = reader.readLine())
      builder.append(line);

    String raw = builder.toString();
    if (raw.length() > 0) {
      Map<String, Object> parameters = (Map<String, Object>) new JsonToBeanConverter()
          .convert(HashMap.class, builder.toString());

      ((JsonParametersAware) handler).setJsonParameters(parameters);
    }
  }

  protected void addHandlerAttributesToRequest(HttpServletRequest request, Handler handler)
      throws Exception {
    SimplePropertyDescriptor[] properties =
        SimplePropertyDescriptor.getPropertyDescriptors(handler.getClass());
    for (SimplePropertyDescriptor property : properties) {
      Method readMethod = property.getReadMethod();
      if (readMethod == null) {
        continue;
      }

      Object result = readMethod.invoke(handler);
      request.setAttribute(property.getName(), result);
    }
  }

  public Throwable getRootExceptionCause(Throwable originalException) {
    Throwable toReturn = originalException;
    if (originalException instanceof UndeclaredThrowableException) {
      // An exception was thrown within an invocation handler. Not smart.
      // Extract the original exception
      toReturn = originalException.getCause().getCause();
    }

    // When catching an exception here, it is most likely wrapped by
    // several other exceptions. Peel the layers and use the original
    // exception as the one to return to the client. That is the most
    // likely to contain informative data about the error.
    // This is a safety measure to make sure this loop is never endless
    List<Throwable> chain = Lists.newArrayListWithExpectedSize(10);
    for (Throwable current = toReturn; current != null && chain.size() < 10; current =
        current.getCause()) {
      chain.add(current);
    }

    if (chain.isEmpty()) {
      return null;
    }

    // If the root cause came from another server implementing the wire protocol, there might
    // not have been enough information to fully reconstitute its error, in which case we'll
    // want to return the last 2 causes - with the outer error providing context to the
    // true root cause. These case are identified by the root cause not being mappable to a
    // standard WebDriver error code, but its wrapper is mappable.
    //
    // Of course, if we only have one item in our chain, go ahead and return.
    ErrorCodes ec = new ErrorCodes();
    Iterator<Throwable> reversedChain = Lists.reverse(chain).iterator();
    Throwable rootCause = reversedChain.next();
    if (!reversedChain.hasNext() || ec.isMappableError(rootCause)) {
      return rootCause;
    }
    Throwable nextCause = reversedChain.next();
    return ec.isMappableError(nextCause) ? nextCause : rootCause;
  }

  private HandlerFactory getHandlerFactory(Class<? extends Handler> handlerClazz) {
    final Constructor<? extends Handler> sessionAware = getConstructor(handlerClazz, Session.class);
    if (sessionAware != null) return new HandlerFactory() {
      public Handler createHandler(SessionId sessionId) throws Exception {
        return sessionAware.newInstance(sessionId != null ? sessions.get(sessionId) : null);
      }
    };

    final Constructor<? extends Handler> driverSessions =
        getConstructor(handlerClazz, DriverSessions.class);
    if (driverSessions != null) return new HandlerFactory() {
      public Handler createHandler(SessionId sessionId) throws Exception {
        return driverSessions.newInstance(sessions);
      }
    };


    final Constructor<? extends Handler> norags = getConstructor(handlerClazz);
    if (norags != null) return new HandlerFactory() {
      public Handler createHandler(SessionId sessionId) throws Exception {
        return norags.newInstance();
      }
    };

    throw new IllegalArgumentException("Don't know how to construct " + handlerClazz);
  }

  private static Constructor<? extends Handler> getConstructor(
      Class<? extends Handler> handlerClazz, Class... types) {
    try {
      return handlerClazz.getConstructor(types);
    } catch (NoSuchMethodException e) {
      return null;
    }
  }

  @Override
  public boolean equals(Object o) {
    if (this == o) {
      return true;
    }
    if (!(o instanceof ResultConfig)) {
      return false;
    }

    ResultConfig that = (ResultConfig) o;

    return url.equals(that.url);

  }

  @Override
  public int hashCode() {
    return url.hashCode();
  }
}
