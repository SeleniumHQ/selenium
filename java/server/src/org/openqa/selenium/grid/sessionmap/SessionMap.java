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

package org.openqa.selenium.grid.sessionmap;

import com.google.common.collect.ImmutableMap;

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
import java.net.URI;
import java.util.function.Predicate;

/**
 * Provides a stable API for looking up where on the Grid a particular webdriver instance is
 * running.
 * <p>
 * This class responds to the following URLs:
 * <table summary="HTTP commands the SessionMap understands">
 * <tr>
 *   <th>Verb</th>
 *   <th>URL Template</th>
 *   <th>Meaning</th>
 * </tr>
 * <tr>
 *   <td>DELETE</td>
 *   <td>/se/grid/session/{sessionId}</td>
 *   <td>Removes a {@link URI} from the session map. Calling this method more than once for the same
 *     {@link SessionId} will not throw an error.</td>
 * </tr>
 * <tr>
 *   <td>GET</td>
 *   <td>/se/grid/session/{sessionId}</td>
 *   <td>Retrieves the {@link URI} associated the {@link SessionId}, or throws a
 *     {@link org.openqa.selenium.NoSuchSessionException} should the session not be present.</td>
 * </tr>
 * <tr>
 *   <td>POST</td>
 *   <td>/se/grid/session/{sessionId}</td>
 *   <td>Registers the session with session map. In theory, the session map never expires a session
 *     from its mappings, but realistically, sessions may end up being removed for many reasons.
 *     </td>
 * </tr>
 * </table>
 */
public abstract class SessionMap implements Predicate<HttpRequest>, CommandHandler {

  private final CompoundHandler handler;

  public abstract boolean add(Session session);

  public abstract Session get(SessionId id) throws NoSuchSessionException;

  public abstract void remove(SessionId id);

  public SessionMap() {
    Json json = new Json();

    AddToSessionMap add = new AddToSessionMap(json, this);
    GetFromSessionMap get = new GetFromSessionMap(json, this);
    RemoveFromSession remove = new RemoveFromSession(json, this);

    handler = new CompoundHandler(
        Injector.builder().build(),
        ImmutableMap.of(
            get, (inj, req) -> get,   // List "get" first because it's most commonly called
            add, (inj, req) -> add,
            remove, (inj, req) -> remove));
  }

  @Override
  public boolean test(HttpRequest req) {
    return handler.test(req);
  }

  @Override
  public void execute(HttpRequest req, HttpResponse resp) throws IOException {
    handler.execute(req, resp);
  }
}
