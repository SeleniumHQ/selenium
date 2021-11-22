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

package org.openqa.selenium.remote.service;

import static org.openqa.selenium.concurrent.ExecutorServices.shutdownGracefully;

import com.google.common.annotations.VisibleForTesting;
import com.google.common.base.Throwables;

import org.openqa.selenium.WebDriverException;
import org.openqa.selenium.internal.Require;
import org.openqa.selenium.remote.Command;
import org.openqa.selenium.remote.CommandInfo;
import org.openqa.selenium.remote.DriverCommand;
import org.openqa.selenium.remote.HttpCommandExecutor;
import org.openqa.selenium.remote.Response;

import java.io.Closeable;
import java.io.IOException;
import java.net.ConnectException;
import java.util.Map;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.TimeoutException;

/**
 * A specialized {@link HttpCommandExecutor} that will use a {@link DriverService} that lives
 * and dies with a single WebDriver session. The service will be restarted upon each new session
 * request and shutdown after each quit command.
 */
public class DriverCommandExecutor extends HttpCommandExecutor implements Closeable {

  private static final String NAME = "Driver Command Executor";
  private final DriverService service;
  private final ExecutorService executorService = Executors.newFixedThreadPool(2, r -> {
    Thread thread = new Thread(r);
    thread.setName(NAME);
    thread.setDaemon(true);
    return thread;
  });

  /**
   * Creates a new DriverCommandExecutor which will communicate with the driver as configured
   * by the given {@code service}.
   *
   * @param service The DriverService to send commands to.
   */
  public DriverCommandExecutor(DriverService service) {
    super(Require.nonNull("DriverService", service.getUrl()));
    this.service = service;
  }

  /**
   * Creates an {@link DriverCommandExecutor} that supports non-standard
   * {@code additionalCommands} in addition to the standard.
   *
   * @param service driver server
   * @param additionalCommands additional commands the remote end can process
   */
  protected DriverCommandExecutor(
      DriverService service, Map<String, CommandInfo> additionalCommands) {
    super(additionalCommands, service.getUrl());
    this.service = service;
  }

  /**
   * Sends the {@code command} to the driver server for execution. The server will be started
   * if requesting a new session. Likewise, if terminating a session, the server will be shutdown
   * once a response is received.
   *
   * @param command The command to execute.
   * @return The command response.
   * @throws IOException If an I/O error occurs while sending the command.
   */
  @Override
  public Response execute(Command command) throws IOException {
    boolean newlyStarted = false;
    if (DriverCommand.NEW_SESSION.equals(command.getName())) {
      boolean wasRunningBefore = service.isRunning();
      service.start();
      newlyStarted = !wasRunningBefore && service.isRunning();
    }

    if (DriverCommand.QUIT.equals(command.getName())) {
      CompletableFuture<Response> commandComplete = CompletableFuture.supplyAsync(() -> {
        try {
          return invokeExecute(command);
        } catch (Throwable t) {
          Throwable rootCause = Throwables.getRootCause(t);
          if (rootCause instanceof IllegalStateException
              && "Closed".equals(rootCause.getMessage())) {
            return null;
          }
          if (rootCause instanceof ConnectException
              && "Connection refused".equals(rootCause.getMessage())) {
            throw new WebDriverException("The driver server has unexpectedly died!", t);
          }
          Throwables.throwIfUnchecked(t);
          throw new WebDriverException(t);
        }
      }, executorService);

      CompletableFuture<Response> processFinished = CompletableFuture.supplyAsync(() -> {
        service.process.waitFor(service.getTimeout().toMillis());
        return null;
      }, executorService);

      try {
        Response response = (Response) CompletableFuture.anyOf(commandComplete, processFinished)
          .get(service.getTimeout().toMillis() * 2, TimeUnit.MILLISECONDS);
        service.stop();
        return response;
      } catch (ExecutionException | TimeoutException e) {
        throw new WebDriverException("Timed out waiting for driver server to stop.", e);
      } catch (InterruptedException e) {
        Thread.currentThread().interrupt();
        throw new WebDriverException("Timed out waiting for driver server to stop.", e);
      } finally {
        close();
      }

    } else {
      try {
        return invokeExecute(command);
      } catch (Throwable t) {
        Throwable rootCause = Throwables.getRootCause(t);
        if (rootCause instanceof ConnectException &&
            "Connection refused".equals(rootCause.getMessage()) &&
            !service.isRunning()) {
          throw new WebDriverException("The driver server has unexpectedly died!", t);
        }
        // an attempt to execute a command in the newly started driver server has failed
        // hence need to stop it
        if (newlyStarted && service.isRunning()) {
          try {
            service.stop();
          } catch (Exception ignored) {
            // fall through
          }
        }
        Throwables.throwIfUnchecked(t);
        throw new WebDriverException(t);
      }
    }
  }

  @VisibleForTesting
  Response invokeExecute(Command command) throws IOException {
    return super.execute(command);
  }

  @Override
  public void close() {
    shutdownGracefully(NAME, executorService);
  }
}
