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

import com.google.common.collect.Lists;

import org.openqa.selenium.NoSuchSessionException;
import org.openqa.selenium.remote.Command;
import org.openqa.selenium.remote.DriverCommand;
import org.openqa.selenium.remote.ErrorCodes;
import org.openqa.selenium.remote.Response;
import org.openqa.selenium.remote.SessionId;
import org.openqa.selenium.remote.UnreachableBrowserException;
import org.openqa.selenium.remote.server.DriverSessions;
import org.openqa.selenium.remote.server.RequiresAllSessions;
import org.openqa.selenium.remote.server.RequiresSession;
import org.openqa.selenium.remote.server.Session;
import org.openqa.selenium.remote.server.handler.DeleteSession;
import org.openqa.selenium.remote.server.handler.WebDriverHandler;
import org.openqa.selenium.remote.server.log.LoggingManager;
import org.openqa.selenium.remote.server.log.PerSessionLogHandler;

import java.lang.reflect.UndeclaredThrowableException;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.function.Consumer;
import java.util.function.Supplier;
import java.util.logging.Level;
import java.util.logging.Logger;

public class ResultConfig {

  interface HandlerFactory {
    RestishHandler<?> createHandler(SessionId sessionId);
  }

  private final String commandName;
  private final HandlerFactory handlerFactory;
  private final DriverSessions sessions;
  private final Logger log;

  public ResultConfig(
      String commandName, Supplier<RestishHandler<?>> factory,
      DriverSessions sessions,
      Logger log) {
    if (commandName == null || factory == null) {
      throw new IllegalArgumentException("You must specify the handler and the command name");
    }

    this.commandName = commandName;
    this.log = log;
    this.sessions = sessions;
    this.handlerFactory = (sessionId) -> factory.get();
  }

  public ResultConfig(
      String commandName, RequiresAllSessions factory,
      DriverSessions sessions,
      Logger log) {
    if (commandName == null || factory == null) {
      throw new IllegalArgumentException("You must specify the handler and the command name");
    }

    this.commandName = commandName;
    this.log = log;
    this.sessions = sessions;
    this.handlerFactory = (sessionId) -> factory.apply(sessions);
  }

  public ResultConfig(
      String commandName, RequiresSession factory,
      DriverSessions sessions,
      Logger log) {
    if (commandName == null || factory == null) {
      throw new IllegalArgumentException("You must specify the handler and the command name");
    }

    this.commandName = commandName;
    this.log = log;
    this.sessions = sessions;
    this.handlerFactory = (sessionId) -> factory.apply(sessions.get(sessionId));
  }

  public Response handle(Command command) {
    Response response = new Response();
    SessionId sessionId = command.getSessionId();
    if (sessionId != null) {
      response.setSessionId(sessionId.toString());
    }

    throwUpIfSessionTerminated(sessionId);
    final RestishHandler<?> handler = handlerFactory.createHandler(sessionId);

    try {
      @SuppressWarnings("unchecked")
      Map<String, Object> parameters = (Map<String, Object>) command.getParameters();
      if (parameters != null && !parameters.isEmpty()) {
        handler.setJsonParameters(parameters);
      }

      throwUpIfSessionTerminated(sessionId);

      Consumer<String> logger = DriverCommand.STATUS.equals(command.getName()) ? log::fine : log::info;

      logger.accept(String.format("Executing: %s)", handler));

      Object value = handler.handle();
      if (value instanceof Response) {
        response = (Response) value;
      } else {
        response.setValue(value);
        response.setState(ErrorCodes.SUCCESS_STRING);
        response.setStatus(ErrorCodes.SUCCESS);
      }

      logger.accept("Done: " + handler);

    } catch (UnreachableBrowserException e) {
      throwUpIfSessionTerminated(sessionId);
      return Responses.failure(sessionId, e);

    } catch (Exception e) {
      log.log(Level.WARNING, "Exception thrown", e);

      Throwable toUse = getRootExceptionCause(e);

      log.warning("Exception: " + toUse.getMessage());
      Optional<String> screenshot = Optional.empty();
      if (handler instanceof WebDriverHandler) {
        screenshot = Optional.ofNullable(((WebDriverHandler<?>) handler).getScreenshot());
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
    List<Throwable> chain = new ArrayList<>(10);
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
