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
import org.openqa.selenium.grid.commands.Standalone;
import org.openqa.selenium.grid.config.Config;
import org.openqa.selenium.grid.config.MapConfig;
import org.openqa.selenium.grid.config.MemoizedConfig;
import org.openqa.selenium.grid.config.TomlConfig;
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
import org.openqa.selenium.grid.testing.TestSessionFactory;
import org.openqa.selenium.grid.web.Values;
import org.openqa.selenium.json.Json;
import org.openqa.selenium.json.JsonOutput;
import org.openqa.selenium.net.PortProber;
import org.openqa.selenium.netty.server.NettyServer;
import org.openqa.selenium.remote.RemoteWebDriver;
import org.openqa.selenium.remote.SessionId;
import org.openqa.selenium.remote.http.Contents;
import org.openqa.selenium.remote.http.HttpClient;
import org.openqa.selenium.remote.http.HttpHandler;
import org.openqa.selenium.remote.http.HttpRequest;
import org.openqa.selenium.remote.http.HttpResponse;
import org.openqa.selenium.remote.tracing.DefaultTestTracer;
import org.openqa.selenium.remote.tracing.Tracer;
import org.openqa.selenium.support.ui.FluentWait;
import org.zeromq.ZContext;

import java.io.StringReader;
import java.io.UncheckedIOException;
import java.net.URI;
import java.net.URISyntaxException;
import java.time.Instant;
import java.util.Collection;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.Callable;
import java.util.function.Supplier;

import static java.time.Duration.ofSeconds;
import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertTrue;
import static org.junit.Assert.fail;
import static org.openqa.selenium.json.Json.MAP_TYPE;
import static org.openqa.selenium.remote.http.Contents.asJson;
import static org.openqa.selenium.remote.http.Contents.string;
import static org.openqa.selenium.remote.http.HttpMethod.GET;
import static org.openqa.selenium.remote.http.HttpMethod.POST;

@RunWith(Parameterized.class)
public class EndToEndTest {

  private static final Capabilities CAPS = new ImmutableCapabilities("browserName", "cheese");
  private final Json json = new Json();

  @Parameterized.Parameters(name = "End to End {0}")
  public static Collection<Supplier<Object[]>> buildGrids() {
    return ImmutableSet.of(
      safely(EndToEndTest::createRemotes),
      safely(EndToEndTest::createStandalone));
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

  private static Object[] createStandalone() {
    StringBuilder rawCaps = new StringBuilder();
    try (JsonOutput out = new Json().newOutput(rawCaps)) {
      out.setPrettyPrint(false).write(CAPS);
    }

    String[] rawConfig = new String[] {
      "[network]",
      "relax-checks = true",
      "",
      "[node]",
      "detect-drivers = false",
      "driver-factories = [",
      String.format("\"%s\",", TestSessionFactoryFactory.class.getName()),
      String.format("\"%s\"", rawCaps.toString().replace("\"", "\\\"")),
      "]",
      "",
      "[server]",
      "port = " + PortProber.findFreePort()
    };
    Config config = new MemoizedConfig(
        new TomlConfig(new StringReader(String.join("\n", rawConfig))));

    Server<?> server = new Standalone().asServer(config).start();

    return new Object[] {server, HttpClient.Factory.createDefault()};
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

    LocalDistributor localDistributor = new LocalDistributor(
        tracer,
        bus,
        clientFactory,
        sessions,
        null);
    Server<?> distributorServer = createServer(localDistributor);
    distributorServer.start();

    Distributor distributor = new RemoteDistributor(
      tracer,
      HttpClient.Factory.createDefault(),
      distributorServer.getUrl(),
      null);

    int port = PortProber.findFreePort();
    URI nodeUri = new URI("http://localhost:" + port);
    LocalNode localNode = LocalNode.builder(tracer, bus, nodeUri, nodeUri, null)
        .add(CAPS, createFactory(nodeUri))
        .build();

    Server<?> nodeServer = new NettyServer(
        new BaseServerOptions(
            new MapConfig(ImmutableMap.of("server", ImmutableMap.of("port", port)))),
        localNode);
    nodeServer.start();

    distributor.add(localNode);

    Router router = new Router(tracer, clientFactory, sessions, distributor);
    Server<?> routerServer = createServer(router);
    routerServer.start();

    return new Object[] { routerServer, clientFactory };
  }

  private static Server<?> createServer(HttpHandler handler) {
    int port = PortProber.findFreePort();
    return new NettyServer(
        new BaseServerOptions(
            new MapConfig(ImmutableMap.of("server", ImmutableMap.of("port", port)))),
        handler);
  }

  private static SessionFactory createFactory(URI serverUri) {
    return new TestSessionFactory((id, caps) -> new SpoofSession(serverUri, caps));
  }

  // Hahahaha. Java naming.
  public static class TestSessionFactoryFactory {
    public static SessionFactory create(Config config, Capabilities stereotype) {
      BaseServerOptions serverOptions = new BaseServerOptions(config);
      String hostname = serverOptions.getHostname().orElse("localhost");
      int port = serverOptions.getPort();
      URI serverUri;
      try {
         serverUri = new URI("http", null, hostname, port, null, null, null);
      } catch (URISyntaxException e) {
        throw new RuntimeException(e);
      }

      return new TestSessionFactory(stereotype, (id, caps) -> new SpoofSession(serverUri, caps));
    }
  }

  private static class SpoofSession extends Session implements HttpHandler {

    private SpoofSession(URI serverUri, Capabilities capabilities) {
      super(new SessionId(UUID.randomUUID()), serverUri, new ImmutableCapabilities(), capabilities, Instant.now());
    }

    @Override
    public HttpResponse execute(HttpRequest req) throws UncheckedIOException {
      return new HttpResponse();
    }
  }

  @Test
  public void success() {
    // The node added only has a single node. Make sure we can start and stop sessions.
    Capabilities caps = new ImmutableCapabilities("browserName", "cheese", "type", "cheddar");
    WebDriver driver = new RemoteWebDriver(server.getUrl(), caps);
    driver.get("http://www.google.com");

    // Kill the session, and wait until the grid says it's ready
    driver.quit();
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
    new FluentWait<>("").withTimeout(ofSeconds(200)).until(obj -> {
      try {
        HttpResponse response = client.execute(new HttpRequest(GET, "/status"));
        System.out.println(Contents.string(response));
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
  public void shouldAllowPassthroughForW3CMode() {
    HttpRequest request = new HttpRequest(POST, "/session");
    request.setContent(asJson(
        ImmutableMap.of(
            "capabilities", ImmutableMap.of(
                "alwaysMatch", ImmutableMap.of("browserName", "cheese")))));

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
  public void shouldAllowPassthroughForJWPMode() {
    HttpRequest request = new HttpRequest(POST, "/session");
    request.setContent(asJson(
        ImmutableMap.of(
            "desiredCapabilities", ImmutableMap.of(
                "browserName", "cheese"))));

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

  private static <X> Supplier<X> safely(Callable<X> callable) {
    return () -> {
      try {
        return callable.call();
      } catch (RuntimeException e) {
        throw e;
      } catch (Exception e) {
        throw new RuntimeException(e);
      }
    };
  }
}
