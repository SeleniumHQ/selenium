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

package org.openqa.selenium.grid.node;

import com.google.common.collect.ImmutableMap;

import org.openqa.selenium.Capabilities;
import org.openqa.selenium.NoSuchSessionException;
import org.openqa.selenium.grid.data.Session;
import org.openqa.selenium.grid.web.CommandHandler;
import org.openqa.selenium.grid.web.CompoundHandler;
import org.openqa.selenium.injector.Injector;
import org.openqa.selenium.json.Json;
import org.openqa.selenium.remote.SessionId;
import org.openqa.selenium.remote.http.HttpRequest;
import org.openqa.selenium.remote.http.HttpResponse;

import java.io.IOException;
import java.util.Objects;
import java.util.Optional;
import java.util.UUID;
import java.util.function.Predicate;

/**
 * A place where individual webdriver sessions are running. Those sessions may be in-memory, or
 * only reachable via localhost and a network. Or they could be something else entirely.
 * <p>
 * This class responds to the following URLs:
 * <table>
 * <tr>
 *   <th>Verb</th>
 *   <th>URL Template</th>
 *   <th>Meaning</th>
 * </tr>
 * <tr>
 *   <td>POST</td>
 *   <td>/se/grid/node/session</td>
 *   <td>Attempts to start a new session for the given node. The posted data should be a
 *     json-serialized {@link Capabilities} instance. Returns a serialized {@link Session}.
 *     Subclasses of {@code Node} are expected to register the session with the
 *     {@link org.openqa.selenium.grid.sessionmap.SessionMap}.</td>
 * </tr>
 * <tr>
 *   <td>GET</td>
 *   <td>/se/grid/node/session/{sessionId}</td>
 *   <td>Finds the {@link Session} identified by {@code sessionId} and returns the JSON-serialized
 *     form.</td>
 * </tr>
 * <tr>
 *   <td>DELETE</td>
 *   <td>/se/grid/node/session/{sessionId}</td>
 *   <td>Stops the {@link Session} identified by {@code sessionId}. It is expected that this will
 *     also cause the session to removed from the
 *     {@link org.openqa.selenium.grid.sessionmap.SessionMap}.</td>
 * </tr>
 * <tr>
 *   <td>GET</td>
 *   <td>/se/grid/node/owner/{sessionId}</td>
 *   <td>Allows the node to be queried about whether or not it owns the {@link Session} identified
 *     by {@code sessionId}. This returns a boolean.</td>
 * </tr>
 * <tr>
 *   <td>*</td>
 *   <td>/session/{sessionId}/*</td>
 *   <td>The request is forwarded to the {@link Session} identified by {@code sessionId}. When the
 *     Quit command is called, the {@link Session} should remove itself from the
 *     {@link org.openqa.selenium.grid.sessionmap.SessionMap}.</td>
 * </tr>
 * </table>
 */
public abstract class Node implements Predicate<HttpRequest>, CommandHandler {

  private final CompoundHandler handler;
  private final UUID id;

  protected Node(UUID id) {
    this.id = Objects.requireNonNull(id);

    Json json = new Json();

    NewNodeSession create = new NewNodeSession(this, json);
    IsSessionOwner owner = new IsSessionOwner(this, json);
    ForwardWebDriverCommand execute = new ForwardWebDriverCommand(this, json);
    GetNodeSession read = new GetNodeSession(this, json);
    StopNodeSession destroy = new StopNodeSession(this);

    handler = new CompoundHandler(
        Injector.builder()
            .register(this)
            .register(new Json())
            .build(),
        ImmutableMap.of(
            create, (inj, req) -> create,
            owner, (inj, req) -> owner,
            execute, (inj, req) -> execute,
            read, (inj, req) -> read,
            destroy, (inj, req) -> destroy));
  }

  public UUID getId() {
    return id;
  }

  public abstract Optional<Session> newSession(Capabilities capabilities);

  public abstract void executeWebDriverCommand(HttpRequest req, HttpResponse resp);

  public abstract Session getSession(SessionId id) throws NoSuchSessionException;

  public abstract void stop(SessionId id) throws NoSuchSessionException;

  protected abstract boolean isSessionOwner(SessionId id);

  public abstract boolean isSupporting(Capabilities capabilities);

  @Override
  public boolean test(HttpRequest req) {
    return handler.test(req);
  }

  @Override
  public void execute(HttpRequest req, HttpResponse resp) throws IOException {
    handler.execute(req, resp);
  }
}
