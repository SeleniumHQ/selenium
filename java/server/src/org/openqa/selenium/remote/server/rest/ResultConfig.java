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

package org.openqa.selenium.remote.server.rest;

import com.google.common.base.Optional;
import com.google.common.collect.Lists;

import org.openqa.selenium.NoSuchSessionException;
import org.openqa.selenium.WebDriverException;
import org.openqa.selenium.remote.Command;
import org.openqa.selenium.remote.DriverCommand;
import org.openqa.selenium.remote.ErrorCodes;
import org.openqa.selenium.remote.Response;
import org.openqa.selenium.remote.SessionId;
import org.openqa.selenium.remote.UnreachableBrowserException;
import org.openqa.selenium.remote.server.DriverSessions;
import org.openqa.selenium.remote.server.JsonParametersAware;
import org.openqa.selenium.remote.server.Session;
import org.openqa.selenium.remote.server.handler.DeleteSession;
import org.openqa.selenium.remote.server.handler.WebDriverHandler;
import org.openqa.selenium.remote.server.log.LoggingManager;
import org.openqa.selenium.remote.server.log.PerSessionLogHandler;

import java.lang.reflect.Constructor;
import java.lang.reflect.UndeclaredThrowableException;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.logging.Level;
import java.util.logging.Logger;

public class ResultConfig {

  private final String commandName;
  private final HandlerFactory handlerFactory;
  private final DriverSessions sessions;
  private final Logger log;

  public ResultConfig(
      String commandName, Class<? extends RestishHandler<?>> handlerClazz,
      DriverSessions sessions, Logger log) {
    if (commandName == null || handlerClazz == null) {
      throw new IllegalArgumentException("You must specify the handler and the command name");
    }

    this.commandName = commandName;
    this.log = log;
    this.sessions = sessions;
    this.handlerFactory = getHandlerFactory(handlerClazz);
  }


  interface HandlerFactory {
    RestishHandler<?> createHandler(SessionId sessionId) throws Exception;
  }

  protected RestishHandler populate(RestishHandler handler, Command command) {
    for (Map.Entry<String, ?> entry : command.getParameters().entrySet()) {
      try {
        PropertyMunger.set(entry.getKey(), handler, entry.getValue());
      } catch (Exception e) {
        throw new WebDriverException(e);
      }
    }
    return handler;
  }

  public Response handle(Command command) throws Exception {
    Response response = new Response();
    SessionId sessionId = command.getSessionId();
    if (sessionId != null) {
      response.setSessionId(sessionId.toString());
    }

    throwUpIfSessionTerminated(sessionId);
    final RestishHandler<?> handler = handlerFactory.createHandler(sessionId);
    populate(handler, command);

    try {
      if (handler instanceof JsonParametersAware) {
        @SuppressWarnings("unchecked")
        Map<String, Object> parameters = (Map<String, Object>) command.getParameters();
        if (!parameters.isEmpty()) {
          ((JsonParametersAware) handler).setJsonParameters(parameters);
        }
      }

      throwUpIfSessionTerminated(sessionId);

      if (DriverCommand.STATUS.equals(command.getName())) {
        log.fine(String.format("Executing: %s)", handler));
      } else {
        log.info(String.format("Executing: %s)", handler));
      }

      Object value = handler.handle();
      if (value instanceof Response) {
        response = (Response) value;
      } else {
        response.setValue(value);
        response.setState(ErrorCodes.SUCCESS_STRING);
        response.setStatus(ErrorCodes.SUCCESS);
      }

      if (DriverCommand.STATUS.equals(command.getName())) {
        log.fine("Done: " + handler);
      } else {
        log.info("Done: " + handler);
      }
    } catch (UnreachableBrowserException e) {
      throwUpIfSessionTerminated(sessionId);
      return Responses.failure(sessionId, e);

    } catch (Exception e) {
      log.log(Level.WARNING, "Exception thrown", e);

      Throwable toUse = getRootExceptionCause(e);

      log.warning("Exception: " + toUse.getMessage());
      Optional<String> screenshot = Optional.absent();
      if (handler instanceof WebDriverHandler) {
        screenshot = Optional.fromNullable(((WebDriverHandler) handler).getScreenshot());
      }
      response = Responses.failure(sessionId, toUse, screenshot);
    } catch (Error e) {
      log.info("Error: " + e.getMessage());
      response = Responses.failure(sessionId, e);
    }

    if (handler instanceof DeleteSession) {
      // Yes, this is funky. See javadoc on cleatThreadTempLogs for details.
      final PerSessionLogHandler logHandler = LoggingManager.perSessionLogHandler();
      logHandler.transferThreadTempLogsToSessionLogs(sessionId);
      logHandler.removeSessionLogs(sessionId);
      sessions.deleteSession(sessionId);
    }
    return response;
  }

  private void throwUpIfSessionTerminated(SessionId sessId) throws NoSuchSessionException {
    if (sessId == null) return;
    Session session = sessions.get(sessId);
    final boolean isTerminated = session == null;
    if (isTerminated) {
      throw new NoSuchSessionException();
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

    return commandName.equals(that.commandName);
  }

  @Override
  public int hashCode() {
    return commandName.hashCode();
  }
}
