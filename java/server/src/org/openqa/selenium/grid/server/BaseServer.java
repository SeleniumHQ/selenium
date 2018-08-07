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

package org.openqa.selenium.grid.server;

import static java.net.HttpURLConnection.HTTP_OK;
import static java.nio.charset.StandardCharsets.UTF_8;
import static java.util.concurrent.TimeUnit.SECONDS;
import static org.openqa.selenium.grid.server.Server.get;

import com.google.common.collect.ImmutableMap;
import com.google.common.net.MediaType;

import org.openqa.selenium.WebDriverException;
import org.openqa.selenium.grid.web.CommandHandler;
import org.openqa.selenium.injector.Injector;
import org.openqa.selenium.json.Json;
import org.openqa.selenium.net.NetworkUtils;
import org.openqa.selenium.net.PortProber;
import org.openqa.selenium.remote.http.HttpRequest;
import org.seleniumhq.jetty9.security.ConstraintMapping;
import org.seleniumhq.jetty9.security.ConstraintSecurityHandler;
import org.seleniumhq.jetty9.server.HttpConfiguration;
import org.seleniumhq.jetty9.server.HttpConnectionFactory;
import org.seleniumhq.jetty9.server.ServerConnector;
import org.seleniumhq.jetty9.servlet.ServletContextHandler;
import org.seleniumhq.jetty9.servlet.ServletHolder;
import org.seleniumhq.jetty9.util.security.Constraint;
import org.seleniumhq.jetty9.util.thread.QueuedThreadPool;

import java.io.UncheckedIOException;
import java.net.MalformedURLException;
import java.net.URL;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Objects;
import java.util.function.BiFunction;
import java.util.function.Predicate;

import javax.servlet.Servlet;

public class BaseServer implements Server<BaseServer> {

  private final org.seleniumhq.jetty9.server.Server server;
  private final Map<Predicate<HttpRequest>, BiFunction<Injector, HttpRequest, CommandHandler>> handlers;
  private final ServletContextHandler servletContextHandler;
  private final Injector injector;
  private final URL url;

  public BaseServer(BaseServerOptions options) {
    int port = options.getPort() == 0 ? PortProber.findFreePort() : options.getPort();

    String host;
    try {
      host = new NetworkUtils().getNonLoopbackAddressOfThisMachine();
    } catch (WebDriverException ignored) {
      host = "localhost";
    }
    try {
      this.url = new URL("http", host, port, "");
    } catch (MalformedURLException e) {
      throw new UncheckedIOException(e);
    }

    this.server = new org.seleniumhq.jetty9.server.Server(
        new QueuedThreadPool(options.getMaxServerThreads()));

    // Insertion order may matter
    this.handlers = new LinkedHashMap<>();

    Json json = new Json();
    this.injector = Injector.builder()
        .register(json)
        .build();

    addHandler(get("/status"), (injector, req) ->
        (in, out) -> {
          String value = json.toJson(ImmutableMap.of(
              "value", ImmutableMap.of(
                  "ready", false,
                  "message", "Stub server without handlers")));

          out.setHeader("Content-Type", MediaType.JSON_UTF_8.toString());
          out.setHeader("Cache-Control", "none");
          out.setStatus(HTTP_OK);

          out.setContent(value.getBytes(UTF_8));
        });

    this.servletContextHandler = new ServletContextHandler(ServletContextHandler.SECURITY);
    ConstraintSecurityHandler securityHandler = (ConstraintSecurityHandler) servletContextHandler.getSecurityHandler();

    Constraint disableTrace = new Constraint();
    disableTrace.setName("Disable TRACE");
    disableTrace.setAuthenticate(true);
    ConstraintMapping disableTraceMapping = new ConstraintMapping();
    disableTraceMapping.setConstraint(disableTrace);
    disableTraceMapping.setMethod("TRACE");
    disableTraceMapping.setPathSpec("/");
    securityHandler.addConstraintMapping(disableTraceMapping);

    Constraint enableOther = new Constraint();
    enableOther.setName("Enable everything but TRACE");
    ConstraintMapping enableOtherMapping = new ConstraintMapping();
    enableOtherMapping.setConstraint(enableOther);
    enableOtherMapping.setMethodOmissions(new String[] {"TRACE"});
    enableOtherMapping.setPathSpec("/");
    securityHandler.addConstraintMapping(enableOtherMapping);

    server.setHandler(servletContextHandler);

    HttpConfiguration httpConfig = new HttpConfiguration();
    ServerConnector http = new ServerConnector(server, new HttpConnectionFactory(httpConfig));
    http.setPort(getUrl().getPort());
    server.addConnector(http);

    addServlet(new CommandHandlerServlet(injector, handlers), "/*");
  }

  @Override
  public void addServlet(Class<? extends Servlet> servlet, String pathSpec) {
    servletContextHandler.addServlet(
        Objects.requireNonNull(servlet),
        Objects.requireNonNull(pathSpec));
  }

  @Override
  public void addServlet(Servlet servlet, String pathSpec) {
    servletContextHandler.addServlet(
        new ServletHolder(Objects.requireNonNull(servlet)),
        Objects.requireNonNull(pathSpec));
  }

  @Override
  public void addHandler(
      Predicate<HttpRequest> selector,
      BiFunction<Injector, HttpRequest, CommandHandler> handler) {
    if (server.isRunning()) {
      throw new RuntimeException("You may not add a handler to a running server");
    }
    handlers.put(Objects.requireNonNull(selector), Objects.requireNonNull(handler));
  }

  @Override
  public BaseServer start() {
    try {
      server.start();

      PortProber.waitForPortUp(getUrl().getPort(), 10, SECONDS);

      return this;
    } catch (RuntimeException e) {
      throw e;
    } catch (Exception e) {
      throw new RuntimeException(e);
    }
  }

  @Override
  public BaseServer stop() {
    try {
      server.stop();
      return this;
    } catch (RuntimeException e) {
      throw e;
    } catch (Exception e) {
      throw new RuntimeException(e);
    }
  }

  @Override
  public URL getUrl() {
    return url;
  }
}
