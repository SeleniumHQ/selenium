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

import static java.net.HttpURLConnection.HTTP_MOVED_TEMP;
import static org.openqa.selenium.remote.http.Route.get;

import java.net.URL;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.function.Function;
import java.util.function.Supplier;
import java.util.logging.Logger;
import org.openqa.selenium.internal.Require;
import org.openqa.selenium.json.Json;
import org.openqa.selenium.remote.http.HttpHandler;
import org.openqa.selenium.remote.http.HttpRequest;
import org.openqa.selenium.remote.http.HttpResponse;
import org.openqa.selenium.remote.http.Routable;
import org.openqa.selenium.remote.http.Route;

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
      HttpResponse uiRedirect =
          new HttpResponse().setStatus(HTTP_MOVED_TEMP).addHeader("Location", prefix.concat("/ui"));

      Supplier<HttpHandler> redirectHandler = () -> req -> uiRedirect;

      Routable appendRoute =
          Route.combine(consoleRoute(prefix, redirectHandler), uiRoute(prefix, () -> uiHandler));
      if (!prefix.isEmpty()) {
        appendRoute = Route.combine(appendRoute, redirectRoute(prefix, redirectHandler));
      }

      routes = Route.combine(get("/").to(redirectHandler), appendRoute);
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

  private static Routable uiRoute(String prefix, Supplier<HttpHandler> handler) {
    return buildRoute(
        "/ui", prefix, path -> Route.prefix(path).to(Route.matching(req -> true).to(handler)));
  }

  private static Routable consoleRoute(String prefix, Supplier<HttpHandler> handler) {
    return buildRoute("/grid/console", prefix, path -> get(path).to(handler));
  }

  private static Routable buildRoute(String url, String prefix, Function<String, Route> mapper) {
    List<String> subPaths =
        prefix.isEmpty() ? Collections.singletonList(url) : Arrays.asList(prefix + url, url);
    return subPaths.stream().map(mapper).reduce(Route::combine).get();
  }

  private static Routable redirectRoute(String prefix, Supplier<HttpHandler> handler) {
    prefix = prefix.endsWith("/") ? prefix.substring(0, prefix.length() - 1) : prefix;
    return get(prefix).to(handler);
  }
}
