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
import org.openqa.selenium.SessionNotCreatedException;
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
import org.openqa.selenium.grid.server.BaseServer;
import org.openqa.selenium.grid.server.BaseServerOptions;
import org.openqa.selenium.grid.server.Server;
import org.openqa.selenium.grid.sessionmap.SessionMap;
import org.openqa.selenium.grid.sessionmap.local.LocalSessionMap;
import org.openqa.selenium.grid.sessionmap.remote.RemoteSessionMap;
import org.openqa.selenium.grid.testing.TestSessionFactory;
import org.openqa.selenium.grid.web.CombinedHandler;
import org.openqa.selenium.grid.web.RoutableHttpClientFactory;
import org.openqa.selenium.grid.web.Values;
import org.openqa.selenium.json.Json;
import org.openqa.selenium.net.PortProber;
import org.openqa.selenium.remote.RemoteWebDriver;
import org.openqa.selenium.remote.SessionId;
import org.openqa.selenium.remote.http.HttpClient;
import org.openqa.selenium.remote.http.HttpHandler;
import org.openqa.selenium.remote.http.HttpRequest;
import org.openqa.selenium.remote.http.HttpResponse;
import org.openqa.selenium.remote.tracing.DistributedTracer;
import org.openqa.selenium.support.ui.FluentWait;
import org.zeromq.ZContext;

import java.io.IOException;
import java.io.UncheckedIOException;
import java.net.MalformedURLException;
import java.net.URI;
import java.net.URISyntaxException;
import java.util.Collection;
import java.util.Map;
import java.util.UUID;
import java.util.function.Supplier;

import static java.time.Duration.ofSeconds;
import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertTrue;
import static org.junit.Assert.fail;
import static org.openqa.selenium.json.Json.MAP_TYPE;
import static org.openqa.selenium.remote.http.Contents.string;
import static org.openqa.selenium.remote.http.Contents.utf8String;
import static org.openqa.selenium.remote.http.HttpMethod.GET;
import static org.openqa.selenium.remote.http.HttpMethod.POST;

@RunWith(Parameterized.class)
public class EndToEndTest {

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

  private static Object[] createInMemory() throws URISyntaxException, MalformedURLException {
    EventBus bus = ZeroMqEventBus.create(
        new ZContext(),
        "inproc://end-to-end-pub",
        "inproc://end-to-end-sub",
        true);

    DistributedTracer tracer = DistributedTracer.builder().build();
    URI nodeUri = new URI("http://localhost:4444");
    CombinedHandler handler = new CombinedHandler();
    HttpClient.Factory clientFactory = new RoutableHttpClientFactory(
        nodeUri.toURL(),
        handler,
        HttpClient.Factory.createDefault());

    SessionMap sessions = new LocalSessionMap(tracer, bus);
    handler.addHandler(sessions);

    Distributor distributor = new LocalDistributor(tracer, bus, clientFactory, sessions);
    handler.addHandler(distributor);

    LocalNode node = LocalNode.builder(tracer, bus, clientFactory, nodeUri)
        .add(CAPS, createFactory(nodeUri))
        .build();
    handler.addHandler(node);
    distributor.add(node);

    Router router = new Router(tracer, clientFactory, sessions, distributor);

    Server<?> server = createServer();
    server.setHandler(router);
    server.start();

    return new Object[] { server, clientFactory };
  }

  private static Object[] createRemotes() throws URISyntaxException {
    EventBus bus = ZeroMqEventBus.create(
        new ZContext(),
        "tcp://localhost:" + PortProber.findFreePort(),
        "tcp://localhost:" + PortProber.findFreePort(),
        true);

    DistributedTracer tracer = DistributedTracer.builder().build();
    LocalSessionMap localSessions = new LocalSessionMap(tracer, bus);

    HttpClient.Factory clientFactory = HttpClient.Factory.createDefault();

    Server<?> sessionServer = createServer();
    sessionServer.setHandler(localSessions);
    sessionServer.start();

    HttpClient client = HttpClient.Factory.createDefault().createClient(sessionServer.getUrl());
    SessionMap sessions = new RemoteSessionMap(client);

    LocalDistributor localDistributor = new LocalDistributor(
        tracer,
        bus,
        clientFactory,
        sessions);
    Server<?> distributorServer = createServer();
    distributorServer.setHandler(localDistributor);
    distributorServer.start();

    Distributor distributor = new RemoteDistributor(
        tracer,
        HttpClient.Factory.createDefault(),
        distributorServer.getUrl());

    int port = PortProber.findFreePort();
    URI nodeUri = new URI("http://localhost:" + port);
    LocalNode localNode = LocalNode.builder(tracer, bus, clientFactory, nodeUri)
        .add(CAPS, createFactory(nodeUri))
        .build();
    Server<?> nodeServer = new BaseServer<>(
        new BaseServerOptions(
            new MapConfig(ImmutableMap.of("server", ImmutableMap.of("port", port)))));
    nodeServer.setHandler(localNode);
    nodeServer.start();

    distributor.add(localNode);

    Router router = new Router(tracer, clientFactory, sessions, distributor);
    Server<?> routerServer = createServer();
    routerServer.setHandler(router);
    routerServer.start();

    return new Object[] { routerServer, clientFactory };
  }

  private static Server<?> createServer() {
    int port = PortProber.findFreePort();
    return new BaseServer<>(new BaseServerOptions(
        new MapConfig(ImmutableMap.of("server", ImmutableMap.of("port", port)))));
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
  public void exerciseDriver() {
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
        Map<String, Object> status = Values.get(response, MAP_TYPE);
        return Boolean.TRUE.equals(status.get("ready"));
      } catch (UncheckedIOException e) {
        e.printStackTrace();
        return false;
      }
    });

    // And now we're good to go.
    driver = new RemoteWebDriver(server.getUrl(), caps);
    driver.get("http://www.google.com");
    driver.quit();
  }

  @Test
  public void shouldAllowPassthroughForW3CMode() throws IOException {
    HttpRequest request = new HttpRequest(POST, "/session");
    request.setContent(utf8String(json.toJson(
        ImmutableMap.of(
            "capabilities", ImmutableMap.of(
                "alwaysMatch", ImmutableMap.of("browserName", "cheese"))))));

    HttpClient client = clientFactory.createClient(server.getUrl());
    HttpResponse response = client.execute(request);

    assertEquals(200, response.getStatus());

    Map<String, Object> topLevel = json.toType(string(response), MAP_TYPE);

    // There should not be a numeric status field
    assertFalse(string(request), topLevel.containsKey("status"));

    // And the value should have all the good stuff in it: the session id and the capabilities
    Map<?, ?> value = (Map<?, ?>) topLevel.get("value");
    assertThat(value.get("sessionId")).isInstanceOf(String.class);

    Map<?, ?> caps = (Map<?, ?>) value.get("capabilities");
    assertEquals("cheese", caps.get("browserName"));
  }

  @Test
  public void shouldAllowPassthroughForJWPMode() throws IOException {
    HttpRequest request = new HttpRequest(POST, "/session");
    request.setContent(utf8String(json.toJson(
        ImmutableMap.of(
            "desiredCapabilities", ImmutableMap.of(
                "browserName", "cheese")))));

    HttpClient client = clientFactory.createClient(server.getUrl());
    HttpResponse response = client.execute(request);

    assertEquals(200, response.getStatus());

    Map<String, Object> topLevel = json.toType(string(response), MAP_TYPE);

    // There should be a numeric status field
    assertEquals(topLevel.toString(), 0L, topLevel.get("status"));
    // The session id
    assertTrue(string(request), topLevel.containsKey("sessionId"));

    // And the value should be the capabilities.
    Map<?, ?> value = (Map<?, ?>) topLevel.get("value");
    assertEquals(string(request), "cheese", value.get("browserName"));
  }

  @Test
  public void shouldDoProtocolTranslationFromW3CLocalEndToJWPRemoteEnd() {

  }

  @Test
  public void shouldDoProtocolTranslationFromJWPLocalEndToW3CRemoteEnd() {

  }
}
