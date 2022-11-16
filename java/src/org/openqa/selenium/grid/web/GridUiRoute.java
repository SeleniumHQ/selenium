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

package org.openqa.selenium.grid.web;

import java.util.function.Supplier;
import java.util.stream.Stream;
import org.openqa.selenium.internal.Require;
import org.openqa.selenium.json.Json;
import org.openqa.selenium.remote.http.HttpHandler;
import org.openqa.selenium.remote.http.HttpRequest;
import org.openqa.selenium.remote.http.HttpResponse;
import org.openqa.selenium.remote.http.Routable;
import org.openqa.selenium.remote.http.Route;

import java.net.URL;
import java.util.logging.Logger;

import static java.net.HttpURLConnection.HTTP_MOVED_TEMP;
import static org.openqa.selenium.remote.http.Route.get;

public class GridUiRoute implements Routable {

  private static final Logger LOG = Logger.getLogger("selenium");

  private static final String GRID_RESOURCE = "javascript/grid-ui/build";
  private static final String GRID_RESOURCE_WITH_PREFIX = String.format("/%s", GRID_RESOURCE);

  private final Route routes;

  public GridUiRoute(String prefix) {
    Require.nonNull(prefix, "Prefix cannot be null");
    URL uiRoot = GridUiRoute.class.getResource(GRID_RESOURCE_WITH_PREFIX);
    if (uiRoot != null) {
      ResourceHandler uiHandler = new ResourceHandler(new ClassPathResource(uiRoot, GRID_RESOURCE));
      HttpResponse uiRedirect = new HttpResponse()
        .setStatus(HTTP_MOVED_TEMP)
        .addHeader("Location", prefix.concat("/ui"));

      Supplier<HttpHandler> redirectHandler = () -> req -> uiRedirect;

      Routable[] appendRoutes = Stream.of(
          redirectRoutes(prefix, redirectHandler),
          consoleRoutes(prefix, redirectHandler),
          uiRoutes(prefix, () -> uiHandler)
        )
        .flatMap(Stream::of)
        .toArray(Routable[]::new);
      routes = Route.combine(get("/").to(redirectHandler), appendRoutes);
    } else {
      LOG.warning("It was not possible to load the Grid UI.");
      Json json = new Json();
      routes = Route.matching(req -> false).to(() -> new NoHandler(json));
    }
  }

  @Override
  public boolean matches(HttpRequest req) {
    return routes.matches(req);
  }

  @Override
  public HttpResponse execute(HttpRequest req) {
    return routes.execute(req);
  }

  private static Routable[] uiRoutes(String prefix, Supplier<HttpHandler> handler) {
    Routable alwaysAdd = Route.prefix("/ui").to(Route.matching(req -> true).to(handler));
    if (prefix.isEmpty()) {
      return new Routable[]{alwaysAdd};
    }
    return new Routable[]{
      alwaysAdd,
      Route.prefix(prefix + "/ui").to(Route.matching(req -> true).to(handler))
    };
  }

  private static Routable[] consoleRoutes(String prefix, Supplier<HttpHandler> handler) {
    Routable alwaysAdd = get("/grid/console").to(handler);
    if (prefix.isEmpty()) {
      return new Routable[]{alwaysAdd};
    }
    return new Routable[]{
      alwaysAdd,
      get(prefix + "/grid/console").to(handler)
    };
  }

  private static Routable[] redirectRoutes(String prefix, Supplier<HttpHandler> handler ) {
    if (prefix.isEmpty()) {
      return new Routable[]{};
    }
    prefix = prefix.endsWith("/") ? prefix.substring(0, prefix.length() -1) : prefix;
    return new Routable[]{get(prefix).to(handler)};
  }
}
