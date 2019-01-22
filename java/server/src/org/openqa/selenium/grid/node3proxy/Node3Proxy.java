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

package org.openqa.selenium.grid.node3proxy;

import static org.openqa.selenium.grid.web.Routes.get;
import static org.openqa.selenium.grid.web.Routes.post;

import org.openqa.selenium.MutableCapabilities;
import org.openqa.selenium.SessionNotCreatedException;
import org.openqa.selenium.grid.data.Session;
import org.openqa.selenium.grid.node.NodeStatus;
import org.openqa.selenium.grid.web.CommandHandler;
import org.openqa.selenium.grid.web.HandlerNotFoundException;
import org.openqa.selenium.grid.web.Routes;
import org.openqa.selenium.injector.Injector;
import org.openqa.selenium.json.Json;
import org.openqa.selenium.remote.NewSessionPayload;
import org.openqa.selenium.remote.http.HttpClient;
import org.openqa.selenium.remote.http.HttpRequest;
import org.openqa.selenium.remote.http.HttpResponse;
import org.openqa.selenium.remote.tracing.DistributedTracer;

import java.io.IOException;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import java.util.function.Predicate;

/**
 * Responsible for being a proxy between a {@link org.openqa.selenium.grid.distributor.Distributor}
 * and version 3 nodes to ensure ability to connect such nodes to the version 4 grid.
 * <p>
 * This class responds to the following URLs:
 * <table summary="HTTP commands the Node3Proxy understands">
 * <tr>
 *   <th>Verb</th>
 *   <th>URL Template</th>
 *   <th>Meaning</th>
 * </tr>
 * <tr>
 *   <td>POST</td>
 *   <td>/session</td>
 *   <td>To forward a new session request to a node.</td>
 * </tr>
 * <tr>
 *   <td>POST</td>
 *   <td>/grid/register</td>
 *   <td>To register a node to the distributor.</td>
 * </tr>
 * </table>
 */
public abstract class Node3Proxy implements Predicate<HttpRequest>, CommandHandler {

  private final Routes routes;
  private final Injector injector;

  protected Node3Proxy(DistributedTracer tracer, HttpClient.Factory httpClientFactory) {
    Objects.requireNonNull(tracer);
    Objects.requireNonNull(httpClientFactory);

    injector = Injector.builder()
        .register(this)
        .register(tracer)
        .register(new Json())
        .register(httpClientFactory)
        .build();

    routes = Routes.combine(
        post("/grid/register").using(ForwardAddNode.class),
        post("/se/grid/node/session").using(ForwardCreateSession.class),
        get("/status").using(NodeStatusHandler.class),
        get("/grid/api/hub").using(HubConfigurationHandler.class),
        get("/grid/api/proxy").using(HubRegistrationCheckHandler.class)
    ).build();
  }

  public abstract Session newSession(NewSessionPayload payload) throws SessionNotCreatedException;

  public abstract Node3Proxy addNode(List<MutableCapabilities> capabilities, Integer maxSession);

  public abstract NodeStatus getNodeStatus();

  @Override
  public boolean test(HttpRequest req) {
    return routes.match(injector, req).isPresent();
  }

  @Override
  public void execute(HttpRequest req, HttpResponse resp) throws IOException {
    Optional<CommandHandler> handler = routes.match(injector, req);
    if (!handler.isPresent()) {
      throw new HandlerNotFoundException(req);
    }
    handler.get().execute(req, resp);
  }

}
