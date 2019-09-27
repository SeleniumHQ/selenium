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

package org.openqa.selenium.grid.router;

import static org.openqa.selenium.grid.web.Routes.combine;
import static org.openqa.selenium.grid.web.Routes.get;
import static org.openqa.selenium.grid.web.Routes.matching;

import org.openqa.selenium.grid.distributor.Distributor;
import org.openqa.selenium.grid.server.W3CCommandHandler;
import org.openqa.selenium.grid.sessionmap.SessionMap;
import org.openqa.selenium.grid.web.CommandHandler;
import org.openqa.selenium.grid.web.HandlerNotFoundException;
import org.openqa.selenium.grid.web.Routes;
import org.openqa.selenium.json.Json;
import org.openqa.selenium.remote.http.HttpClient;
import org.openqa.selenium.remote.http.HttpRequest;
import org.openqa.selenium.remote.http.HttpResponse;
import org.openqa.selenium.remote.tracing.DistributedTracer;

import java.io.IOException;
import java.util.Optional;
import java.util.function.Predicate;

/**
 * A simple router that is aware of the selenium-protocol.
 */
public class Router implements Predicate<HttpRequest>, CommandHandler {

  private final Routes routes;

  public Router(
      DistributedTracer tracer,
      HttpClient.Factory clientFactory,
      SessionMap sessions,
      Distributor distributor)
  {
    routes = combine(
        get("/status")
            .using(() -> new GridStatusHandler(new Json(), clientFactory, distributor))
            .decorateWith(W3CCommandHandler::new),
        matching(sessions).using(sessions),
        matching(distributor).using(distributor),
        matching(req -> req.getUri().startsWith("/session/"))
            .using(() -> new HandleSession(tracer, clientFactory, sessions)))
        .build();
  }

  @Override
  public boolean test(HttpRequest req) {
    return routes.match(req).isPresent();
  }

  @Override
  public void execute(HttpRequest req, HttpResponse resp) throws IOException {
    Optional<CommandHandler> handler = routes.match(req);
    if (!handler.isPresent()) {
      throw new HandlerNotFoundException(req);
    }
    handler.get().execute(req, resp);
  }
}
