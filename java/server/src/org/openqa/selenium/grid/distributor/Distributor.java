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

package org.openqa.selenium.grid.distributor;

import org.openqa.selenium.SessionNotCreatedException;
import org.openqa.selenium.grid.data.CreateSessionResponse;
import org.openqa.selenium.grid.data.DistributorStatus;
import org.openqa.selenium.grid.data.Session;
import org.openqa.selenium.grid.node.Node;
import org.openqa.selenium.json.Json;
import org.openqa.selenium.remote.http.HttpClient;
import org.openqa.selenium.remote.http.HttpHandler;
import org.openqa.selenium.remote.http.HttpRequest;
import org.openqa.selenium.remote.http.HttpResponse;
import org.openqa.selenium.remote.http.Routable;
import org.openqa.selenium.remote.http.Route;
import org.openqa.selenium.remote.tracing.DistributedTracer;

import java.io.UncheckedIOException;
import java.util.Map;
import java.util.Objects;
import java.util.UUID;
import java.util.function.Predicate;

import static org.openqa.selenium.remote.http.Contents.bytes;
import static org.openqa.selenium.remote.http.Route.delete;
import static org.openqa.selenium.remote.http.Route.get;
import static org.openqa.selenium.remote.http.Route.post;

/**
 * Responsible for being the central place where the {@link Node}s on which {@link Session}s run
 * are determined.
 * <p>
 * This class responds to the following URLs:
 * <table summary="HTTP commands the Distributor understands">
 * <tr>
 *   <th>Verb</th>
 *   <th>URL Template</th>
 *   <th>Meaning</th>
 * </tr>
 * <tr>
 *   <td>POST</td>
 *   <td>/session</td>
 *   <td>This is exactly the same as the New Session command from the WebDriver spec.</td>
 * </tr>
 * <tr>
 *   <td>POST</td>
 *   <td>/se/grid/distributor/node</td>
 *   <td>Adds a new {@link Node} to this distributor. Please read the javadocs for {@link Node} for
 *     how the Node should be serialized.</td>
 * </tr>
 * <tr>
 *   <td>DELETE</td>
 *   <td>/se/grid/distributor/node/{nodeId}</td>
 *   <td>Remove the {@link Node} identified by {@code nodeId} from this distributor. It is expected
 *     that any sessions running on the Node are allowed to complete: this simply means that no new
 *     sessions will be scheduled on this Node.</td>
 * </tr>
 * </table>
 */
public abstract class Distributor implements Predicate<HttpRequest>, Routable, HttpHandler {

  private final Route routes;

  protected Distributor(DistributedTracer tracer, HttpClient.Factory httpClientFactory) {
    Objects.requireNonNull(tracer);
    Objects.requireNonNull(httpClientFactory);

    Json json = new Json();
    routes = Route.combine(
        post("/session").to(() -> req -> {
            CreateSessionResponse sessionResponse = newSession(req);
            return new HttpResponse().setContent(bytes(sessionResponse.getDownstreamEncodedResponse()));
        }),
        post("/se/grid/distributor/session")
            .to(() -> new CreateSession(json, this)),
        post("/se/grid/distributor/node")
            .to(() -> new AddNode(tracer, this, json, httpClientFactory)),
        delete("/se/grid/distributor/node/{nodeId}")
            .to((Map<String,String> params) -> new RemoveNode(this, UUID.fromString(params.get("nodeId")))),
        get("/se/grid/distributor/status")
            .to(() -> new GetDistributorStatus(json, this)));
  }

  public abstract CreateSessionResponse newSession(HttpRequest request)
      throws SessionNotCreatedException;

  public abstract Distributor add(Node node);

  public abstract void remove(UUID nodeId);

  public abstract DistributorStatus getStatus();

  @Override
  public boolean test(HttpRequest httpRequest) {
    return matches(httpRequest);
  }

  @Override
  public boolean matches(HttpRequest req) {
    return routes.matches(req);
  }

  @Override
  public HttpResponse execute(HttpRequest req) throws UncheckedIOException {
    return routes.execute(req);
  }
}
