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

import static java.net.HttpURLConnection.HTTP_OK;
import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.fail;
import static org.openqa.selenium.grid.data.Availability.DOWN;
import static org.openqa.selenium.grid.data.Availability.UP;
import static org.openqa.selenium.remote.Dialect.W3C;
import static org.openqa.selenium.remote.http.Contents.asJson;
import static org.openqa.selenium.remote.http.HttpMethod.POST;

import com.google.common.collect.ImmutableMap;
import com.google.common.collect.ImmutableSet;

import org.junit.After;
import org.junit.Before;
import org.junit.Test;
import org.openqa.selenium.Capabilities;
import org.openqa.selenium.ImmutableCapabilities;
import org.openqa.selenium.NoSuchSessionException;
import org.openqa.selenium.SessionNotCreatedException;
import org.openqa.selenium.events.EventBus;
import org.openqa.selenium.events.local.GuavaEventBus;
import org.openqa.selenium.events.zeromq.ZeroMqEventBus;
import org.openqa.selenium.grid.config.CompoundConfig;
import org.openqa.selenium.grid.config.Config;
import org.openqa.selenium.grid.config.MapConfig;
import org.openqa.selenium.grid.config.MemoizedConfig;
import org.openqa.selenium.grid.config.TomlConfig;
import org.openqa.selenium.grid.data.Availability;
import org.openqa.selenium.grid.data.CreateSessionResponse;
import org.openqa.selenium.grid.data.DefaultSlotMatcher;
import org.openqa.selenium.grid.data.NodeStatus;
import org.openqa.selenium.grid.data.RequestId;
import org.openqa.selenium.grid.data.Session;
import org.openqa.selenium.grid.data.SessionRequest;
import org.openqa.selenium.grid.distributor.Distributor;
import org.openqa.selenium.grid.distributor.local.LocalDistributor;
import org.openqa.selenium.grid.distributor.selector.DefaultSlotSelector;
import org.openqa.selenium.grid.node.HealthCheck;
import org.openqa.selenium.grid.node.Node;
import org.openqa.selenium.grid.node.SessionFactory;
import org.openqa.selenium.grid.node.httpd.NodeServer;
import org.openqa.selenium.grid.node.local.LocalNode;
import org.openqa.selenium.grid.security.Secret;
import org.openqa.selenium.grid.server.BaseServerOptions;
import org.openqa.selenium.grid.server.Server;
import org.openqa.selenium.grid.sessionmap.SessionMap;
import org.openqa.selenium.grid.sessionmap.local.LocalSessionMap;
import org.openqa.selenium.grid.sessionqueue.NewSessionQueue;
import org.openqa.selenium.grid.sessionqueue.local.LocalNewSessionQueue;
import org.openqa.selenium.grid.testing.PassthroughHttpClient;
import org.openqa.selenium.grid.testing.TestSessionFactory;
import org.openqa.selenium.grid.web.CombinedHandler;
import org.openqa.selenium.grid.web.Values;
import org.openqa.selenium.internal.Either;
import org.openqa.selenium.json.Json;
import org.openqa.selenium.json.JsonOutput;
import org.openqa.selenium.net.PortProber;
import org.openqa.selenium.netty.server.NettyServer;
import org.openqa.selenium.remote.SessionId;
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
import java.time.Duration;
import java.time.Instant;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicReference;

public class SessionCleanUpTest {

  public static final Json JSON = new Json();
  private Tracer tracer;
  private EventBus events;
  private HttpClient.Factory clientFactory;
  private Secret registrationSecret;
  private Server<?> server;
  int publish;
  int subscribe;

  @Before
  public void setup() {
    tracer = DefaultTestTracer.createTracer();
    registrationSecret = new Secret("hereford hop");
    publish = PortProber.findFreePort();
    subscribe = PortProber.findFreePort();
    events = ZeroMqEventBus.create(
      new ZContext(),
      "tcp://localhost:" + publish,
      "tcp://localhost:" + subscribe,
      true,
      registrationSecret);
    clientFactory = HttpClient.Factory.createDefault();
  }

  @After
  public void stopServer() {
    if (server != null) {
      server.stop();
    }

    if (events != null) {
      events.close();
    }
  }

  @Test
  public void shouldRemoveSessionAfterNodeIsShutDownGracefully() {
    Capabilities capabilities = new ImmutableCapabilities("browserName", "cheese");
    CombinedHandler handler = new CombinedHandler();

    SessionMap sessions = new LocalSessionMap(tracer, events);
    handler.addHandler(sessions);
    NewSessionQueue queue = new LocalNewSessionQueue(
      tracer,
      events,
      new DefaultSlotMatcher(),
      Duration.ofSeconds(2),
      Duration.ofSeconds(10),
      registrationSecret);
    handler.addHandler(queue);

    LocalDistributor distributor = new LocalDistributor(
      tracer,
      events,
      clientFactory,
      sessions,
      queue,
      new DefaultSlotSelector(),
      registrationSecret,
      Duration.ofSeconds(1),
      false);
    handler.addHandler(distributor);

    Router router = new Router(tracer, clientFactory, sessions, queue, distributor);
    handler.addHandler(router);

    server = new NettyServer(
      new BaseServerOptions(
        new MapConfig(ImmutableMap.of())),
      handler);

    server.start();

    StringBuilder rawCaps = new StringBuilder();
    try (JsonOutput out = new Json().newOutput(rawCaps)) {
      out.setPrettyPrint(false).write(capabilities);
    }

    Config additionalConfig =
      new TomlConfig(
        new StringReader(
          "[node]\n" +
          "detect-drivers = false\n" +
          "driver-factories = [\n" +
          String.format("\"%s\",", LocalTestSessionFactory.class.getName()) + "\n" +
          String.format("\"%s\"", rawCaps.toString().replace("\"", "\\\"")) + "\n" +
          "]"));

    String[] rawConfig = new String[]{
      "[events]",
      "publish = \"tcp://localhost:" + publish + "\"",
      "subscribe = \"tcp://localhost:" + subscribe + "\"",
      "",
      "[network]",
      "relax-checks = true",
      "",
      "[server]",
      "registration-secret = \"hereford hop\""};

    Config nodeConfig = new MemoizedConfig(
      new CompoundConfig(
        additionalConfig,
        new TomlConfig(new StringReader(String.join("\n", rawConfig))),
        new MapConfig(
          ImmutableMap.of("server", ImmutableMap.of("port", PortProber.findFreePort())))));

    Server<?> nodeServer = new NodeServer().asServer(nodeConfig).start();

    waitToHaveCapacity(distributor);

    HttpRequest request = new HttpRequest(POST, "/session");
    request.setContent(asJson(
      ImmutableMap.of(
        "capabilities", ImmutableMap.of(
          "alwaysMatch", capabilities))));

    HttpClient client = clientFactory.createClient(server.getUrl());
    HttpResponse httpResponse = client.execute(request);
    assertThat(httpResponse.getStatus()).isEqualTo(HTTP_OK);

    Optional<Map<String, Object>> maybeResponse =
      Optional.ofNullable(Values.get(httpResponse, Map.class));

    String rawResponse = JSON.toJson(maybeResponse.get().get("sessionId"));
    SessionId id = JSON.toType(rawResponse, SessionId.class);

    Session session = sessions.get(id);

    assertThat(session.getCapabilities()).isEqualTo(capabilities);

    nodeServer.stop();

    waitTillNodesAreRemoved(distributor);

    try {
      waitTillSessionIsRemoved(sessions, id);
    } catch (Exception e) {
      fail("Session not removed");
    }
  }

  @Test
  public void shouldRemoveSessionAfterNodeIsDown() throws URISyntaxException {
    CombinedHandler handler = new CombinedHandler();
    Capabilities capabilities = new ImmutableCapabilities("browserName", "cheese");

    AtomicReference<Availability> availability = new AtomicReference<>(UP);

    SessionMap sessions = new LocalSessionMap(tracer, events);
    handler.addHandler(sessions);
    NewSessionQueue queue = new LocalNewSessionQueue(
      tracer,
      events,
      new DefaultSlotMatcher(),
      Duration.ofSeconds(2),
      Duration.ofSeconds(2),
      registrationSecret);

    URI uri = new URI("http://localhost:" + PortProber.findFreePort());
    Node node = LocalNode.builder(tracer, events, uri, uri, registrationSecret)
      .add(
        capabilities,
        new TestSessionFactory(
          (id, caps) -> new Session(id, uri, capabilities, caps, Instant.now())))
      .heartbeatPeriod(Duration.ofSeconds(500000))
      .advanced()
      .healthCheck(() -> new HealthCheck.Result(availability.get(), "TL;DR"))
      .build();
    handler.addHandler(node);

    LocalDistributor distributor = new LocalDistributor(
      tracer,
      events,
      new PassthroughHttpClient.Factory(handler),
      sessions,
      queue,
      new DefaultSlotSelector(),
      registrationSecret,
      Duration.ofSeconds(1),
      false);
    handler.addHandler(distributor);
    distributor.add(node);

    waitToHaveCapacity(distributor);

    Either<SessionNotCreatedException, CreateSessionResponse> result =
      distributor.newSession(new SessionRequest(
        new RequestId(UUID.randomUUID()),
        Instant.now(),
        ImmutableSet.of(W3C),
        ImmutableSet.of(capabilities),
        ImmutableMap.of(),
        ImmutableMap.of()));
    assertThat(result.isRight()).isTrue();

    SessionId id = result.right().getSession().getId();
    Session session = sessions.get(id);

    assertThat(session.getCapabilities()).isEqualTo(capabilities);

    availability.set(DOWN);

    waitTillNodesAreRemoved(distributor);

    try {
      waitTillSessionIsRemoved(sessions, id);
    } catch (Exception e) {
      fail("Session not removed");
    }

    Either<SessionNotCreatedException, CreateSessionResponse> sessionResponse =
      distributor.newSession(new SessionRequest(
        new RequestId(UUID.randomUUID()),
        Instant.now(),
        ImmutableSet.of(W3C),
        ImmutableSet.of(capabilities),
        ImmutableMap.of(),
        ImmutableMap.of()));
    assertThat(sessionResponse.isLeft()).isTrue();
    assertThat(distributor.getStatus().getNodes().isEmpty()).isTrue();

  }

  private void waitToHaveCapacity(Distributor distributor) {
    new FluentWait<>(distributor)
      .withTimeout(Duration.ofSeconds(5))
      .pollingEvery(Duration.ofMillis(100))
      .until(d -> d.getStatus().hasCapacity());
  }

  private void waitTillNodesAreRemoved(Distributor distributor) {
    new FluentWait<>(distributor)
      .withTimeout(Duration.ofSeconds(120))
      .pollingEvery(Duration.ofMillis(100))
      .until(d -> {
        Set<NodeStatus> nodes = d.getStatus().getNodes();
        return nodes.isEmpty();
      });
  }

  private void waitTillSessionIsRemoved(SessionMap sessionMap, SessionId id) {
    new FluentWait<>(sessionMap)
      .withTimeout(Duration.ofSeconds(15))
      .pollingEvery(Duration.ofMillis(100))
      .until(s -> {
        try {
          s.get(id);
        } catch (NoSuchSessionException e) {
          return true;
        }
        return false;
      });
  }

  public static class LocalTestSessionFactory {

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
      super(new SessionId(UUID.randomUUID()), serverUri, new ImmutableCapabilities(), capabilities,
            Instant.now());
    }

    @Override
    public HttpResponse execute(HttpRequest req) throws UncheckedIOException {
      return new HttpResponse();
    }
  }
}
