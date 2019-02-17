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

import static java.time.Duration.ofSeconds;
import static org.junit.Assert.fail;
import static org.openqa.selenium.json.Json.MAP_TYPE;
import static org.openqa.selenium.remote.http.HttpMethod.GET;

import com.google.common.collect.ImmutableMap;

import org.junit.Test;
import org.openqa.selenium.Capabilities;
import org.openqa.selenium.ImmutableCapabilities;
import org.openqa.selenium.SessionNotCreatedException;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.events.EventBus;
import org.openqa.selenium.events.zeromq.ZeroMqEventBus;
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
import org.openqa.selenium.grid.web.CombinedHandler;
import org.openqa.selenium.grid.web.CommandHandler;
import org.openqa.selenium.grid.web.RoutableHttpClientFactory;
import org.openqa.selenium.grid.web.Routes;
import org.openqa.selenium.grid.web.Values;
import org.openqa.selenium.net.PortProber;
import org.openqa.selenium.remote.RemoteWebDriver;
import org.openqa.selenium.remote.SessionId;
import org.openqa.selenium.remote.http.HttpClient;
import org.openqa.selenium.remote.http.HttpRequest;
import org.openqa.selenium.remote.http.HttpResponse;
import org.openqa.selenium.remote.tracing.DistributedTracer;
import org.openqa.selenium.support.ui.FluentWait;
import org.zeromq.ZContext;

import java.io.IOException;
import java.net.MalformedURLException;
import java.net.URI;
import java.net.URISyntaxException;
import java.util.Map;
import java.util.UUID;
import java.util.function.Function;

public class EndToEndTest {

  private final Capabilities driverCaps = new ImmutableCapabilities("browserName", "cheese");
  private final DistributedTracer tracer = DistributedTracer.builder().build();
  private HttpClient.Factory clientFactory;

  @Test
  public void inMemory() throws URISyntaxException, MalformedURLException {
    EventBus bus = ZeroMqEventBus.create(
        new ZContext(),
        "inproc://end-to-end-pub",
        "inproc://end-to-end-sub",
        true);

    URI nodeUri = new URI("http://localhost:4444");
    CombinedHandler handler = new CombinedHandler();
    clientFactory = new RoutableHttpClientFactory(
        nodeUri.toURL(),
        handler,
        HttpClient.Factory.createDefault());

    SessionMap sessions = new LocalSessionMap(tracer, bus);
    handler.addHandler(sessions);

    Distributor distributor = new LocalDistributor(tracer, bus, clientFactory, sessions);
    handler.addHandler(distributor);

    LocalNode node = LocalNode.builder(tracer, bus, clientFactory, nodeUri)
        .add(driverCaps, createFactory(nodeUri))
        .build();
    handler.addHandler(node);
    distributor.add(node);

    Router router = new Router(tracer, clientFactory, sessions, distributor);

    Server<?> server = createServer();
    server.addRoute(Routes.matching(router).using(router));
    server.start();

    exerciseDriver(distributor, router, server);
  }

  @Test
  public void withServers() throws URISyntaxException {
    EventBus bus = ZeroMqEventBus.create(
        new ZContext(),
        "tcp://localhost:" + PortProber.findFreePort(),
        "tcp://localhost:" + PortProber.findFreePort(),
        true);

    LocalSessionMap localSessions = new LocalSessionMap(tracer, bus);

    clientFactory = HttpClient.Factory.createDefault();

    Server<?> sessionServer = createServer();
    sessionServer.addRoute(Routes.matching(localSessions).using(localSessions));
    sessionServer.start();

    SessionMap sessions = new RemoteSessionMap(getClient(sessionServer));

    LocalDistributor localDistributor = new LocalDistributor(
        tracer,
        bus,
        clientFactory,
        sessions);
    Server<?> distributorServer = createServer();
    distributorServer.addRoute(Routes.matching(localDistributor).using(localDistributor));
    distributorServer.start();

    Distributor distributor = new RemoteDistributor(
        tracer,
        HttpClient.Factory.createDefault(),
        distributorServer.getUrl());

    int port = PortProber.findFreePort();
    URI nodeUri = new URI("http://localhost:" + port);
    LocalNode localNode = LocalNode.builder(tracer, bus, clientFactory, nodeUri)
        .add(driverCaps, createFactory(nodeUri))
        .build();
    Server<?> nodeServer = new BaseServer<>(
        new BaseServerOptions(
            new MapConfig(ImmutableMap.of("server", ImmutableMap.of("port", port)))));
    nodeServer.addRoute(Routes.matching(localNode).using(localNode));
    nodeServer.start();

    distributor.add(localNode);

    Router router = new Router(tracer, clientFactory, sessions, distributor);
    Server<?> routerServer = createServer();
    routerServer.addRoute(Routes.matching(router).using(router));
    routerServer.start();

    exerciseDriver(distributor, router, routerServer);
  }

  private void exerciseDriver(Distributor distributor, Router router, Server<?> server) {
    System.out.println(router);
    // The node added only has a single node. Make sure we can start and stop sessions.
    Capabilities caps = new ImmutableCapabilities("browserName", "cheese", "type", "cheddar");
    WebDriver driver = new RemoteWebDriver(server.getUrl(), caps);
    driver.get("http://www.google.com");

    // The node is still open. Now create a second session. This should fail
    try {
      WebDriver disposable = new RemoteWebDriver(server.getUrl(), caps);
      disposable.quit();
      fail("Should not have been able to create driver");
    } catch (SessionNotCreatedException expected) {
      // Fall through
    }

    // Kill the session, and wait until the grid says it's ready
    driver.quit();

    HttpClient client = clientFactory.createClient(server.getUrl());
    new FluentWait<>("").withTimeout(ofSeconds(2)).until(obj -> {
      try {
        HttpResponse response = client.execute(new HttpRequest(GET, "/status"));
        System.out.println(response.getContentString());
        Map<String, Object> status = Values.get(response, MAP_TYPE);
        return Boolean.TRUE.equals(status.get("ready"));
      } catch (IOException e) {
        e.printStackTrace();
        return false;
      }
    });

    distributor.getStatus();

    // And now we're good to go.
    driver = new RemoteWebDriver(server.getUrl(), caps);
    driver.get("http://www.google.com");
    driver.quit();
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
