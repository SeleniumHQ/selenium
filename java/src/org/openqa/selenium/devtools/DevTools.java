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

package org.openqa.selenium.devtools;

import static java.util.concurrent.TimeUnit.MILLISECONDS;

import java.io.Closeable;
import java.time.Duration;
import java.util.List;
import java.util.Optional;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.TimeoutException;
import java.util.function.Consumer;
import java.util.function.Function;
import java.util.logging.Level;
import java.util.logging.Logger;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.devtools.idealized.Domains;
import org.openqa.selenium.devtools.idealized.target.model.SessionID;
import org.openqa.selenium.devtools.idealized.target.model.TargetID;
import org.openqa.selenium.devtools.idealized.target.model.TargetInfo;
import org.openqa.selenium.internal.Require;

public class DevTools implements Closeable {
  private static final Logger LOG = Logger.getLogger(DevTools.class.getName());

  private final Domains protocol;
  private final Duration timeout = Duration.ofSeconds(10);
  private final Connection connection;
  private SessionID cdpSession = null;

  public DevTools(Function<DevTools, Domains> protocol, Connection connection) {
    this.connection = Require.nonNull("WebSocket connection", connection);
    this.protocol = Require.nonNull("CDP protocol", protocol).apply(this);
  }

  public Domains getDomains() {
    return protocol;
  }

  @Override
  public void close() {
    disconnectSession();
    connection.close();
  }

  public void disconnectSession() {
    if (cdpSession != null) {
      SessionID id = cdpSession;
      cdpSession = null;
      try {
        connection.sendAndWait(
            cdpSession,
            getDomains().target().detachFromTarget(Optional.of(id), Optional.empty()),
            timeout);
      } catch (Exception e) {
        // Exceptions should not prevent closing the connection and the web driver
        LOG.warning("Exception while detaching from target: " + e.getMessage());
      }
    }
  }

  public <X> X send(Command<X> command) {
    Require.nonNull("Command to send", command);
    return connection.sendAndWait(cdpSession, command, timeout);
  }

  public <X> void addListener(Event<X> event, Consumer<X> handler) {
    Require.nonNull("Event to listen for", event);
    Require.nonNull("Handler to call", handler);

    connection.addListener(event, handler);
  }

  public void clearListeners() {
    // By removing all the listeners, we should also disable all the domains
    getDomains().disableAll();

    connection.clearListeners();
  }

  public void createSessionIfThereIsNotOne() {
    createSessionIfThereIsNotOne(null);
  }

  public void createSessionIfThereIsNotOne(String windowHandle) {
    if (cdpSession == null) {
      createSession(windowHandle);
    }
  }

  public void createSession() {
    createSession(null);
  }

  /**
   * Create CDP session on given window/tab (aka target). If windowHandle is null, then the first
   * "page" type will be selected. Pass the windowHandle if you have multiple windows/tabs opened to
   * connect to the expected window/tab.
   *
   * @param windowHandle result of {@link WebDriver#getWindowHandle()}, optional.
   */
  public void createSession(String windowHandle) {
    if (connection.isClosed()) {
      connection.reopen();
    }
    TargetID targetId = findTarget(windowHandle);

    // Starts the session
    // CDP creates a parent browser session when websocket connection is made
    // Create session that is child of parent browser session and not child of already existing
    // child page session
    // Passing null for session id helps achieve that
    // Child of already existing child page session throws an error when detaching from the target
    // CDP allows attaching to child of child session but not detaching. Maybe it does not keep
    // track of it.
    cdpSession =
        connection.sendAndWait(null, getDomains().target().attachToTarget(targetId), timeout);

    try {
      // We can do all of these in parallel, and we don't care about the result.
      CompletableFuture.allOf(
              // Set auto-attach to true and run for the hills.
              connection.send(cdpSession, getDomains().target().setAutoAttach()),
              // Clear the existing logs
              connection
                  .send(cdpSession, getDomains().log().clear())
                  .exceptionally(
                      t -> {
                        LOG.log(Level.SEVERE, t.getMessage(), t);
                        return null;
                      }))
          .get(timeout.toMillis(), MILLISECONDS);
    } catch (InterruptedException e) {
      Thread.currentThread().interrupt();
      throw new IllegalStateException("Thread has been interrupted", e);
    } catch (ExecutionException e) {
      throw new DevToolsException(unwrapCause(e));
    } catch (TimeoutException e) {
      throw new org.openqa.selenium.TimeoutException(e);
    }
  }

  private TargetID findTarget(String windowHandle) {
    // Figure out the targets.
    List<TargetInfo> infos =
        connection.sendAndWait(cdpSession, getDomains().target().getTargets(), timeout);

    // Grab the first "page" type, and glom on to that.
    // Find out which one might be the current one
    // (using given window handle like "CDwindow-24426957AC62D8BC83E58C184C38AF2D")
    return infos.stream()
        .filter(info -> "page".equals(info.getType()))
        .map(TargetInfo::getTargetId)
        .filter(id -> windowHandle == null || windowHandle.contains(id.toString()))
        .findAny()
        .orElseThrow(() -> new DevToolsException("Unable to find target id of a page"));
  }

  private Throwable unwrapCause(ExecutionException e) {
    return e.getCause() != null ? e.getCause() : e;
  }

  public SessionID getCdpSession() {
    return cdpSession;
  }
}
