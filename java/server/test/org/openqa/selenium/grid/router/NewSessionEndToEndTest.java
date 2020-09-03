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
import com.google.common.collect.ImmutableSet;

import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.junit.runners.Parameterized;
import org.junit.runners.Parameterized.Parameter;
import org.openqa.selenium.Capabilities;
import org.openqa.selenium.ImmutableCapabilities;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.events.EventBus;
import org.openqa.selenium.events.zeromq.ZeroMqEventBus;
import org.openqa.selenium.grid.config.MapConfig;
import org.openqa.selenium.grid.data.Session;
import org.openqa.selenium.grid.distributor.Distributor;
import org.openqa.selenium.grid.distributor.local.LocalDistributor;
import org.openqa.selenium.grid.distributor.remote.RemoteDistributor;
import org.openqa.selenium.grid.node.SessionFactory;
import org.openqa.selenium.grid.node.local.LocalNode;
import org.openqa.selenium.grid.server.BaseServerOptions;
import org.openqa.selenium.grid.server.Server;
import org.openqa.selenium.grid.sessionmap.SessionMap;
import org.openqa.selenium.grid.sessionmap.local.LocalSessionMap;
import org.openqa.selenium.grid.sessionmap.remote.RemoteSessionMap;
import org.openqa.selenium.grid.sessionqueue.NewSessionQueue;
import org.openqa.selenium.grid.sessionqueue.NewSessionQueuer;
import org.openqa.selenium.grid.sessionqueue.local.LocalNewSessionQueue;
import org.openqa.selenium.grid.sessionqueue.local.LocalNewSessionQueuer;
import org.openqa.selenium.grid.sessionqueue.remote.RemoteNewSessionQueuer;
import org.openqa.selenium.grid.testing.TestSessionFactory;
import org.openqa.selenium.grid.web.CombinedHandler;
import org.openqa.selenium.grid.web.RoutableHttpClientFactory;
import org.openqa.selenium.json.Json;
import org.openqa.selenium.net.PortProber;
import org.openqa.selenium.netty.server.NettyServer;
import org.openqa.selenium.remote.RemoteWebDriver;
import org.openqa.selenium.remote.SessionId;
import org.openqa.selenium.remote.http.HttpClient;
import org.openqa.selenium.remote.http.HttpHandler;
import org.openqa.selenium.remote.http.HttpRequest;
import org.openqa.selenium.remote.http.HttpResponse;
import org.openqa.selenium.remote.tracing.DefaultTestTracer;
import org.openqa.selenium.remote.tracing.Tracer;
import org.zeromq.ZContext;

import java.io.UncheckedIOException;
import java.net.MalformedURLException;
import java.net.URI;
import java.net.URISyntaxException;
import java.util.Collection;
import java.util.UUID;
import java.util.function.Supplier;
import java.util.logging.Logger;

@RunWith(Parameterized.class)
public class NewSessionEndToEndTest {

  private static final Logger LOG = Logger.getLogger(NewSessionEndToEndTest.class.getName());
  private static final Capabilities CAPS = new ImmutableCapabilities("browserName", "cheese");
  private Json json = new Json();

  @Parameterized.Parameters(name = "End to End {0}")
  public static Collection<Supplier<Object[]>> buildGrids() {
    return ImmutableSet.of(
        () -> {
          try {
            return createRemotes();
          } catch (URISyntaxException e) {
            throw new RuntimeException(e);
          }
        },
        () -> {
          try {
            return createInMemory();
          } catch (Exception e) {
            throw new RuntimeException(e);
          }
        });
  }

  @Parameter
  public Supplier<Object[]> values;

  private Server<?> server;

  private HttpClient.Factory clientFactory;

  @Before
  public void setFields() {
    Object[] raw = values.get();
    this.server = (Server<?>) raw[0];
    this.clientFactory = (HttpClient.Factory) raw[1];
  }

  private static Object[] createInMemory() throws MalformedURLException, URISyntaxException {
    Tracer tracer = DefaultTestTracer.createTracer();
    EventBus bus = ZeroMqEventBus.create(
        new ZContext(),
        "inproc://end-to-end-pub",
        "inproc://end-to-end-sub",
        true);

    URI nodeUri = new URI("http://localhost:4444");
    CombinedHandler handler = new CombinedHandler();
    HttpClient.Factory clientFactory = new RoutableHttpClientFactory(
        nodeUri.toURL(),
        handler,
        HttpClient.Factory.createDefault());

    SessionMap sessions = new LocalSessionMap(tracer, bus);
    handler.addHandler(sessions);

    NewSessionQueue localNewSessionQueue = new LocalNewSessionQueue(tracer, bus, 1);
    NewSessionQueuer queuer = new LocalNewSessionQueuer(tracer, bus, localNewSessionQueue);
    handler.addHandler(queuer);

    Distributor
        distributor =
        new LocalDistributor(tracer, bus, clientFactory, sessions, queuer, null);
    handler.addHandler(distributor);

    LocalNode firstNode = LocalNode.builder(tracer, bus, nodeUri, nodeUri, null)
        .add(CAPS, createFactory(nodeUri))
        .build();
    handler.addHandler(firstNode);
    distributor.add(firstNode);

    LocalNode secondNode = LocalNode.builder(tracer, bus, nodeUri, nodeUri, null)
        .add(CAPS, createFactory(nodeUri))
        .build();
    handler.addHandler(secondNode);
    distributor.add(secondNode);

    Router router = new Router(tracer, clientFactory, sessions, queuer, distributor);

    Server<?> server = createServer(router);
    server.start();

    return new Object[]{server, clientFactory};
  }

  private static Object[] createRemotes() throws URISyntaxException {
    Tracer tracer = DefaultTestTracer.createTracer();
    EventBus bus = ZeroMqEventBus.create(
        new ZContext(),
        "tcp://localhost:" + PortProber.findFreePort(),
        "tcp://localhost:" + PortProber.findFreePort(),
        true);

    LocalSessionMap localSessions = new LocalSessionMap(tracer, bus);

    HttpClient.Factory clientFactory = HttpClient.Factory.createDefault();

    Server<?> sessionServer = createServer(localSessions);
    sessionServer.start();

    HttpClient client = HttpClient.Factory.createDefault().createClient(sessionServer.getUrl());
    SessionMap sessions = new RemoteSessionMap(tracer, client);

    LocalNewSessionQueue localNewSessionQueue = new LocalNewSessionQueue(tracer, bus, 1);
    LocalNewSessionQueuer
        localNewSessionQueuer =
        new LocalNewSessionQueuer(tracer, bus, localNewSessionQueue);

    Server<?> newSessionServer = createServer(localNewSessionQueuer);
    newSessionServer.start();

    HttpClient
        remoteSessionQueuerclient =
        HttpClient.Factory.createDefault().createClient(newSessionServer.getUrl());
    RemoteNewSessionQueuer
        newSessionQueuer =
        new RemoteNewSessionQueuer(tracer, remoteSessionQueuerclient);

    LocalDistributor localDistributor = new LocalDistributor(
        tracer,
        bus,
        clientFactory,
        sessions,
        newSessionQueuer,
        null);
    Server<?> distributorServer = createServer(localDistributor);
    distributorServer.start();

    Distributor distributor = new RemoteDistributor(
        tracer,
        HttpClient.Factory.createDefault(),
        distributorServer.getUrl());

    int firstNodePort = PortProber.findFreePort();
    URI firstNodeUri = new URI("http://localhost:" + firstNodePort);
    LocalNode firstNode = LocalNode.builder(tracer, bus, firstNodeUri, firstNodeUri, null)
        .add(CAPS, createFactory(firstNodeUri))
        .build();

    Server<?> firstNodeServer = new NettyServer(
        new BaseServerOptions(
            new MapConfig(ImmutableMap.of("server", ImmutableMap.of("port", firstNodePort)))),
        firstNode);
    firstNodeServer.start();

    distributor.add(firstNode);

    int secondNodePort = PortProber.findFreePort();
    URI secondNodeUri = new URI("http://localhost:" + secondNodePort);
    LocalNode secondNode = LocalNode.builder(tracer, bus, secondNodeUri, secondNodeUri, null)
        .add(CAPS, createFactory(secondNodeUri))
        .build();

    Server<?> secondNodeServer = new NettyServer(
        new BaseServerOptions(
            new MapConfig(ImmutableMap.of("server", ImmutableMap.of("port", secondNodePort)))),
        secondNode);
    secondNodeServer.start();

    distributor.add(secondNode);

    Router router = new Router(tracer, clientFactory, sessions, newSessionQueuer, distributor);
    Server<?> routerServer = createServer(router);
    routerServer.start();

    return new Object[]{routerServer, clientFactory};
  }

  private static Server<?> createServer(HttpHandler handler) {
    int port = PortProber.findFreePort();
    return new NettyServer(
        new BaseServerOptions(
            new MapConfig(ImmutableMap.of("server", ImmutableMap.of("port", port)))),
        handler);
  }

  private static SessionFactory createFactory(URI serverUri) {
    class SpoofSession extends Session implements HttpHandler {

      private SpoofSession(Capabilities capabilities) {
        super(new SessionId(UUID.randomUUID()), serverUri, capabilities);
      }

      @Override
      public HttpResponse execute(HttpRequest req) throws UncheckedIOException {
        return new HttpResponse();
      }
    }

    return new TestSessionFactory((id, caps) -> new SpoofSession(caps));
  }

  @Test
  public void shouldBeAbleToCreateSessionOnTwoNodes() {

    Capabilities caps = new ImmutableCapabilities("browserName", "cheese");
    WebDriver driver = new RemoteWebDriver(server.getUrl(), caps);
    driver.get("http://www.google.com");

    // First node is busy with the first session. Now create a second session.
    // This should be able to add to new session queue and create a session on the second node.
    WebDriver
        disposable =
        new RemoteWebDriver(server.getUrl(), new ImmutableCapabilities("browserName", "cheese"));
    disposable.get("http://www.yahoo.com");

    driver.quit();

  }
}
