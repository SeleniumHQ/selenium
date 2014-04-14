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

package org.openqa.selenium.remote.server.rest;

import static com.google.common.base.Charsets.UTF_8;
import static com.google.common.base.Strings.nullToEmpty;
import static com.google.common.net.HttpHeaders.CONTENT_LENGTH;
import static com.google.common.net.HttpHeaders.CONTENT_TYPE;
import static com.google.common.net.MediaType.JSON_UTF_8;

import com.google.common.base.Optional;
import com.google.common.collect.Lists;

import org.json.JSONObject;
import org.openqa.selenium.WebDriverException;
import org.openqa.selenium.remote.BeanToJsonConverter;
import org.openqa.selenium.remote.ErrorCodes;
import org.openqa.selenium.remote.HttpSessionId;
import org.openqa.selenium.remote.JsonToBeanConverter;
import org.openqa.selenium.remote.PropertyMunger;
import org.openqa.selenium.remote.Response;
import org.openqa.selenium.remote.SessionId;
import org.openqa.selenium.remote.SessionNotFoundException;
import org.openqa.selenium.remote.UnreachableBrowserException;
import org.openqa.selenium.remote.server.DriverSessions;
import org.openqa.selenium.remote.server.HttpRequest;
import org.openqa.selenium.remote.server.HttpResponse;
import org.openqa.selenium.remote.server.JsonParametersAware;
import org.openqa.selenium.remote.server.Session;
import org.openqa.selenium.remote.server.handler.DeleteSession;
import org.openqa.selenium.remote.server.handler.WebDriverHandler;
import org.openqa.selenium.remote.server.log.LoggingManager;
import org.openqa.selenium.remote.server.log.PerSessionLogHandler;

import java.lang.reflect.Constructor;
import java.lang.reflect.UndeclaredThrowableException;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.logging.Level;
import java.util.logging.Logger;

public class ResultConfig {

  private final String[] sections;
  private final HandlerFactory handlerFactory;
  private final DriverSessions sessions;
  private final String url;
  private final Logger log;

  private final ErrorCodes errorCodes = new ErrorCodes();

  public ResultConfig(
      String url, Class<? extends RestishHandler<?>> handlerClazz,
      DriverSessions sessions, Logger log) {
    if (url == null || handlerClazz == null) {
      throw new IllegalArgumentException("You must specify the handler and the url");
    }

    this.url = url;
    this.log = log;
    this.sections = url.split("/");
    this.sessions = sessions;
    this.handlerFactory = getHandlerFactory(handlerClazz);
  }


  public RestishHandler getHandler(String url, SessionId sessionId) throws Exception {
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
    RestishHandler<?> createHandler(SessionId sessionId) throws Exception;
  }


  protected RestishHandler populate(RestishHandler handler, String pathString) {
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

  public void handle(String pathInfo, final HttpRequest request,
      final HttpResponse response) throws Exception {
    String sessionId = HttpSessionId.getSessionId(request.getUri());
    
    SessionId sessId = sessionId != null ? new SessionId(sessionId) : null;

    Response result = new Response();
    result.setSessionId(nullToEmpty(sessionId));
    throwUpIfSessionTerminated(sessId);
    final RestishHandler handler = getHandler(pathInfo, sessId);

    try {
      if (handler instanceof JsonParametersAware) {
        setJsonParameters(request, handler);
      }

      throwUpIfSessionTerminated(sessId);

      if ("/status".equals(pathInfo)) {
        log.fine(String.format("Executing: %s at URL: %s)", handler.toString(), pathInfo));
      } else {
        log.info(String.format("Executing: %s at URL: %s)", handler.toString(), pathInfo));
      }

      Object value = handler.handle();
      if (value instanceof Response) {
        result = (Response) value;
      } else {
        result.setValue(value);
        result.setState(ErrorCodes.SUCCESS_STRING);
        result.setStatus(ErrorCodes.SUCCESS);
      }

      if ("/status".equals(pathInfo)) {
        log.fine("Done: " + pathInfo);
      } else {
        log.info("Done: " + pathInfo);
      }
    } catch (UnreachableBrowserException e){
      throwUpIfSessionTerminated(sessId);
      prepareErrorResponse(result, e, Optional.<String>absent());
      render(result, response);
      return;

    } catch (SessionNotFoundException e) {
      response.setStatus(404);
      return;

    } catch (Exception e) {
      log.log(Level.WARNING, "Exception thrown", e);

      Throwable toUse = getRootExceptionCause(e);

      log.warning("Exception: " + toUse.getMessage());
      Optional<String> screenshot = Optional.absent();
      if (handler instanceof WebDriverHandler) {
        screenshot = Optional.fromNullable(((WebDriverHandler) handler).getScreenshot());
      }
      prepareErrorResponse(result, toUse, screenshot);
    } catch (Error e) {
      log.info("Error: " + e.getMessage());
      prepareErrorResponse(result, e, Optional.<String>absent());
    }

    render(result, response);

    if (handler instanceof DeleteSession) {
      // Yes, this is funky. See javadoc on cleatThreadTempLogs for details.
      final PerSessionLogHandler logHandler = LoggingManager.perSessionLogHandler();
      logHandler.transferThreadTempLogsToSessionLogs(sessId);
      logHandler.removeSessionLogs(sessId);
      sessions.deleteSession(sessId);
    }
  }

  private void render(Response response, HttpResponse httpResponse) {
    String json = new BeanToJsonConverter().convert(response);
    byte[] data = json.getBytes(UTF_8);

    httpResponse.setStatus(200);
    if (response.getStatus() != ErrorCodes.SUCCESS) {
      httpResponse.setStatus(500);
    }

    httpResponse.setHeader(CONTENT_LENGTH, String.valueOf(data.length));
    httpResponse.setHeader(CONTENT_TYPE, JSON_UTF_8.toString());
    httpResponse.setContent(data);
  }

  private void prepareErrorResponse(
      Response response, Throwable error, Optional<String> base64Screenshot) throws Exception {
    response.setStatus(errorCodes.toStatusCode(error));
    response.setState(errorCodes.toState(response.getStatus()));

    if (error != null) {
      String raw = new BeanToJsonConverter().convert(error);
      JSONObject jsonError = new JSONObject(raw);
      jsonError.put("screen", base64Screenshot.orNull());
      response.setValue(jsonError);
    }
  }

  private void throwUpIfSessionTerminated(SessionId sessId) throws Exception {
    if (sessId == null) return;
    Session session = sessions.get(sessId);
    final boolean isTerminated = session == null;
    if (isTerminated){
      throw new SessionNotFoundException();
    }
  }

  @SuppressWarnings("unchecked")
  private void setJsonParameters(HttpRequest request, RestishHandler handler) throws Exception {
    byte[] data = request.getContent();
    String raw = new String(data, UTF_8);
    if (!raw.isEmpty()) {
      Map<String, Object> parameters = (Map<String, Object>) new JsonToBeanConverter()
          .convert(HashMap.class, raw);

      ((JsonParametersAware) handler).setJsonParameters(parameters);
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

  private HandlerFactory getHandlerFactory(Class<? extends RestishHandler<?>> handlerClazz) {
    final Constructor<? extends RestishHandler<?>> sessionAware = getConstructor(handlerClazz, Session.class);
    if (sessionAware != null) {
      return new HandlerFactory() {
        @Override
        public RestishHandler<?> createHandler(SessionId sessionId) throws Exception {
          return sessionAware.newInstance(sessionId != null ? sessions.get(sessionId) : null);
        }
      };
    }

    final Constructor<? extends RestishHandler> driverSessions =
        getConstructor(handlerClazz, DriverSessions.class);
    if (driverSessions != null) {
      return new HandlerFactory() {
        @Override
        public RestishHandler<?> createHandler(SessionId sessionId) throws Exception {
          return driverSessions.newInstance(sessions);
        }
      };
    }


    final Constructor<? extends RestishHandler> norags = getConstructor(handlerClazz);
    if (norags != null) {
      return new HandlerFactory() {
        @Override
        public RestishHandler<?> createHandler(SessionId sessionId) throws Exception {
          return norags.newInstance();
        }
      };
    }

    throw new IllegalArgumentException("Don't know how to construct " + handlerClazz);
  }

  private static Constructor<? extends RestishHandler<?>> getConstructor(
      Class<? extends RestishHandler<?>> handlerClazz, Class... types) {
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
