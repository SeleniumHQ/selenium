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

import org.openqa.selenium.devtools.idealized.Domains;
import org.openqa.selenium.devtools.idealized.target.model.SessionID;
import org.openqa.selenium.devtools.idealized.target.model.TargetID;
import org.openqa.selenium.devtools.idealized.target.model.TargetInfo;
import org.openqa.selenium.internal.Require;

import java.io.Closeable;
import java.time.Duration;
import java.util.List;
import java.util.Optional;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.TimeoutException;
import java.util.function.Consumer;
import java.util.function.Function;

import static java.util.concurrent.TimeUnit.MILLISECONDS;

public class DevTools implements Closeable {

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
    if (cdpSession != null) {
      SessionID id = cdpSession;
      cdpSession = null;
      connection.sendAndWait(
        cdpSession, getDomains().target().detachFromTarget(Optional.of(id), Optional.empty()), timeout);
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
    if (cdpSession == null) {
      createSession();
    }
  }

  public void createSession() {
    // Figure out the targets.
    List<TargetInfo> infos = connection.sendAndWait(cdpSession, getDomains().target().getTargets(), timeout);

    // Grab the first "page" type, and glom on to that.
    // TODO: Find out which one might be the current one
    TargetID targetId = infos.stream()
      .filter(info -> "page".equals(info.getType()))
      .map(TargetInfo::getTargetId)
      .findAny()
      .orElseThrow(() -> new DevToolsException("Unable to find target id of a page"));

    // Start the session.
    cdpSession = connection
      .sendAndWait(cdpSession, getDomains().target().attachToTarget(targetId), timeout);

    try {
      // We can do all of these in parallel, and we don't care about the result.
      CompletableFuture.allOf(
        // Set auto-attach to true and run for the hills.
        connection.send(cdpSession, getDomains().target().setAutoAttach()),
        // Clear the existing logs
        connection.send(cdpSession, getDomains().log().clear())
          .exceptionally(t -> {
            t.printStackTrace();
            return null;
          })
      ).get(timeout.toMillis(), MILLISECONDS);
    } catch (InterruptedException e) {
      Thread.currentThread().interrupt();
      throw new IllegalStateException("Thread has been interrupted", e);
    } catch (ExecutionException e) {
      Throwable cause = e;
      if (e.getCause() != null) {
        cause = e.getCause();
      }
      throw new DevToolsException(cause);
    } catch (TimeoutException e) {
      throw new org.openqa.selenium.TimeoutException(e);
    }
  }

  public SessionID getCdpSession() {
    return cdpSession;
  }
}
