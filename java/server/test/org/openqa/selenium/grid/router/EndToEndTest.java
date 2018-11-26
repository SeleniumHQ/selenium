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

import com.google.common.collect.ImmutableMap;

import org.junit.Test;
import org.openqa.selenium.Capabilities;
import org.openqa.selenium.ImmutableCapabilities;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.grid.config.MapConfig;
import org.openqa.selenium.grid.data.Session;
import org.openqa.selenium.grid.distributor.Distributor;
import org.openqa.selenium.grid.distributor.local.LocalDistributor;
import org.openqa.selenium.grid.distributor.remote.RemoteDistributor;
import org.openqa.selenium.grid.node.local.LocalNode;
import org.openqa.selenium.grid.server.BaseServer;
import org.openqa.selenium.grid.server.BaseServerOptions;
import org.openqa.selenium.grid.server.Server;
import org.openqa.selenium.grid.sessionmap.SessionMap;
import org.openqa.selenium.grid.sessionmap.local.LocalSessionMap;
import org.openqa.selenium.grid.sessionmap.remote.RemoteSessionMap;
import org.openqa.selenium.grid.web.CommandHandler;
import org.openqa.selenium.grid.web.Routes;
import org.openqa.selenium.net.PortProber;
import org.openqa.selenium.remote.RemoteWebDriver;
import org.openqa.selenium.remote.SessionId;
import org.openqa.selenium.remote.http.HttpClient;
import org.openqa.selenium.remote.http.HttpRequest;
import org.openqa.selenium.remote.http.HttpResponse;
import org.openqa.selenium.remote.tracing.DistributedTracer;

import java.net.URI;
import java.net.URISyntaxException;
import java.util.UUID;
import java.util.function.Function;

public class EndToEndTest {

  private final Capabilities driverCaps = new ImmutableCapabilities("browserName", "cheese");
  private final DistributedTracer tracer = DistributedTracer.builder().build();

  @Test
  public void inMemory() throws URISyntaxException {

    SessionMap sessions = new LocalSessionMap(tracer);
    Distributor distributor = new LocalDistributor(tracer);
    URI nodeUri = new URI("http://localhost:4444");
    LocalNode node = LocalNode.builder(tracer, nodeUri, sessions)
        .add(driverCaps, createFactory(nodeUri))
        .build();
    distributor.add(node);

    Router router = new Router(tracer, sessions, distributor);

    Server<?> server = createServer();
    server.addRoute(Routes.matching(router).using(router));
    server.start();

    exerciseDriver(server);
  }

  private void exerciseDriver(Server<?> server) {
    WebDriver driver = new RemoteWebDriver(
        server.getUrl(),
        new ImmutableCapabilities("browserName", "cheese", "type", "cheddar"));
    driver.get("http://www.google.com");
    driver.quit();
  }

  @Test
  public void withServers() throws URISyntaxException {

    LocalSessionMap localSessions = new LocalSessionMap(tracer);
    Server<?> sessionServer = createServer();
    sessionServer.addRoute(Routes.matching(localSessions).using(localSessions));
    sessionServer.start();

    SessionMap sessions = new RemoteSessionMap(getClient(sessionServer));

    LocalDistributor localDistributor = new LocalDistributor(tracer);
    Server<?> distributorServer = createServer();
    distributorServer.addRoute(Routes.matching(localDistributor).using(localDistributor));
    distributorServer.start();

    Distributor distributor = new RemoteDistributor(tracer, getClient(distributorServer));

    int port = PortProber.findFreePort();
    URI nodeUri = new URI("http://localhost:" + port);
    LocalNode localNode = LocalNode.builder(tracer, nodeUri, sessions)
        .add(driverCaps, createFactory(nodeUri))
        .build();
    Server<?> nodeServer = new BaseServer<>(
        new BaseServerOptions(
            new MapConfig(ImmutableMap.of("server", ImmutableMap.of("port", port)))));
    nodeServer.addRoute(Routes.matching(localNode).using(localNode));
    nodeServer.start();

    distributor.add(localNode);

    Router router = new Router(tracer, sessions, distributor);
    Server<?> routerServer = createServer();
    routerServer.addRoute(Routes.matching(router).using(router));
    routerServer.start();

    exerciseDriver(routerServer);
  }

  private HttpClient getClient(Server<?> server) {
    return HttpClient.Factory.createDefault().createClient(server.getUrl());
  }

  private Server<?> createServer() {
    int port = PortProber.findFreePort();
    return new BaseServer<>(new BaseServerOptions(
        new MapConfig(ImmutableMap.of("server", ImmutableMap.of("port", port)))));
  }

  private Function<Capabilities, Session> createFactory(URI serverUri) {
    class SpoofSession extends Session implements CommandHandler {

      private SpoofSession(Capabilities capabilities) {
        super(new SessionId(UUID.randomUUID()), serverUri, capabilities);
      }

      @Override
      public void execute(HttpRequest req, HttpResponse resp) {

      }
    }

    return caps -> new SpoofSession(caps);
  }

}
