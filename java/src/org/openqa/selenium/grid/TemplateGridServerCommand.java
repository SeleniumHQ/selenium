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

package org.openqa.selenium.grid;

import java.util.Arrays;
import java.util.Collection;
import java.util.List;
import java.util.ServiceLoader;
import java.util.stream.StreamSupport;
import org.openqa.selenium.grid.config.CompoundConfig;
import org.openqa.selenium.grid.config.Config;
import org.openqa.selenium.grid.config.MemoizedConfig;
import org.openqa.selenium.grid.server.BaseServerOptions;
import org.openqa.selenium.grid.server.Server;
import org.openqa.selenium.internal.Require;
import org.openqa.selenium.netty.server.NettyServer;
import org.openqa.selenium.remote.http.HttpHandler;
import org.openqa.selenium.remote.http.Message;

import java.util.Optional;
import java.util.function.BiFunction;
import java.util.function.Consumer;
import org.openqa.selenium.remote.http.Routable;
import org.openqa.selenium.remote.http.Route;
import org.openqa.selenium.remote.tracing.Tracer;

public abstract class TemplateGridServerCommand extends TemplateGridCommand {

  public Server<?> asServer(Config initialConfig) {
    Require.nonNull("Config", initialConfig);

    Config config = new MemoizedConfig(new CompoundConfig(initialConfig, getDefaultConfig()));

    Handlers handler = createHandlers(config);

    return new NettyServer(
      new BaseServerOptions(config),
      handler.httpHandler,
      handler.websocketHandler);
  }

  protected abstract Handlers createHandlers(Config config);

  public static class Handlers {
    public final HttpHandler httpHandler;
    public final BiFunction<String, Consumer<Message>, Optional<Consumer<Message>>> websocketHandler;

    public Handlers(HttpHandler http, BiFunction<String, Consumer<Message>, Optional<Consumer<Message>>> websocketHandler) {
      this.httpHandler = Require.nonNull("HTTP handler", http);
      this.websocketHandler = websocketHandler == null ? (str, sink) -> Optional.empty() : websocketHandler;
    }
  }

  protected final Routable[] considerUserDefinedRoutes(Config config, Tracer tracer) {
    Iterable<UserDefinedRoute> routes = ServiceLoader.load(UserDefinedRoute.class);
    return StreamSupport.stream(routes.spliterator(), false)
      .peek(each -> each.setConfig(config))
      .peek(each -> each.setTracer(() -> Optional.ofNullable(tracer)))
      .map(TemplateGridServerCommand::routes)
      .flatMap(Collection::stream)
      .toArray(Routable[]::new);
  }

  private static List<Routable> routes(UserDefinedRoute route) {
    return Arrays.asList(
        Route.get(url(route)).to(() -> route::get),
        Route.post(url(route)).to(() -> route::post),
        Route.delete(url(route)).to(() -> route::delete),
        Route.options(url(route)).to(() -> route::options)
    );
  }

  private static String url(UserDefinedRoute route) {
    String url = route.url();
    if (url.startsWith("/")) {
      return "/admin" + url;
    }
    return "/admin/" + url;
  }
}
