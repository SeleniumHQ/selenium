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

import static java.util.concurrent.TimeUnit.SECONDS;
import static org.assertj.core.api.Assertions.assertThat;
import static org.openqa.selenium.remote.Dialect.W3C;
import static org.openqa.selenium.remote.http.HttpMethod.GET;

import java.net.ServerSocket;
import java.net.URI;
import java.net.URISyntaxException;
import java.net.URL;
import java.time.Duration;
import java.time.Instant;
import java.util.Collections;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.atomic.AtomicReference;
import java.util.function.Function;
import org.jspecify.annotations.NullMarked;
import org.jspecify.annotations.Nullable;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.openqa.selenium.ImmutableCapabilities;
import org.openqa.selenium.MutableCapabilities;
import org.openqa.selenium.NoSuchSessionException;
import org.openqa.selenium.SessionNotCreatedException;
import org.openqa.selenium.events.EventBus;
import org.openqa.selenium.events.local.GuavaEventBus;
import org.openqa.selenium.grid.config.MapConfig;
import org.openqa.selenium.grid.data.CreateSessionResponse;
import org.openqa.selenium.grid.data.DefaultSlotMatcher;
import org.openqa.selenium.grid.data.RequestId;
import org.openqa.selenium.grid.data.Session;
import org.openqa.selenium.grid.data.SessionRequest;
import org.openqa.selenium.grid.distributor.local.LocalDistributor;
import org.openqa.selenium.grid.distributor.selector.DefaultSlotSelector;
import org.openqa.selenium.grid.node.local.LocalNode;
import org.openqa.selenium.grid.security.Secret;
import org.openqa.selenium.grid.server.BaseServerOptions;
import org.openqa.selenium.grid.server.Server;
import org.openqa.selenium.grid.sessionmap.SessionMap;
import org.openqa.selenium.grid.sessionmap.local.LocalSessionMap;
import org.openqa.selenium.grid.sessionqueue.local.LocalNewSessionQueue;
import org.openqa.selenium.grid.testing.PassthroughHttpClient;
import org.openqa.selenium.grid.testing.TestSessionFactory;
import org.openqa.selenium.internal.Either;
import org.openqa.selenium.netty.server.NettyServer;
import org.openqa.selenium.remote.HttpSessionId;
import org.openqa.selenium.remote.SessionId;
import org.openqa.selenium.remote.http.BinaryMessage;
import org.openqa.selenium.remote.http.CloseMessage;
import org.openqa.selenium.remote.http.HttpClient;
import org.openqa.selenium.remote.http.HttpHandler;
import org.openqa.selenium.remote.http.HttpRequest;
import org.openqa.selenium.remote.http.HttpResponse;
import org.openqa.selenium.remote.http.TextMessage;
import org.openqa.selenium.remote.http.WebSocket;
import org.openqa.selenium.remote.tracing.DefaultTestTracer;
import org.openqa.selenium.remote.tracing.Tracer;
import org.openqa.selenium.support.ui.FluentWait;

class TunnelWebsocketTest {

  private final HttpHandler nullHandler = req -> new HttpResponse();
  private final MapConfig emptyConfig = new MapConfig(Collections.emptyMap());

  private Server<?> tunnelServer;
  private Server<?> backendServer;
  private SessionMap sessions;

  @BeforeEach
  void setUp() {
    Tracer tracer = DefaultTestTracer.createTracer();
    EventBus events = new GuavaEventBus();
    sessions = new LocalSessionMap(tracer, events);
  }

  @AfterEach
  void tearDown() {
    if (tunnelServer != null) {
      tunnelServer.stop();
    }
    if (backendServer != null) {
      backendServer.stop();
    }
  }

  private Function<String, Optional<URI>> createResolver() {
    return uri ->
        HttpSessionId.getSessionId(uri)
            .map(SessionId::new)
            .flatMap(
                id -> {
                  try {
                    return Optional.of(sessions.getUri(id));
                  } catch (NoSuchSessionException e) {
                    return Optional.empty();
                  }
                });
  }

  private Server<?> createEchoBackend(
      String response, CountDownLatch receivedLatch, AtomicReference<@Nullable String> received) {
    return new NettyServer(
            new BaseServerOptions(emptyConfig),
            nullHandler,
            (uri, sink) ->
                Optional.of(
                    msg -> {
                      if (msg instanceof TextMessage) {
                        received.set(((TextMessage) msg).text());
                        receivedLatch.countDown();
                        if (!response.isEmpty()) {
                          sink.accept(new TextMessage(response));
                        }
                      }
                    }))
        .start();
  }

  @Test
  void shouldForwardTextMessageToBackend() throws URISyntaxException, InterruptedException {
    AtomicReference<@Nullable String> received = new AtomicReference<>();
    CountDownLatch latch = new CountDownLatch(1);

    backendServer = createEchoBackend("", latch, received);

    SessionId id = new SessionId(UUID.randomUUID());
    sessions.add(
        new Session(
            id,
            backendServer.getUrl().toURI(),
            new ImmutableCapabilities(),
            new ImmutableCapabilities(),
            Instant.now()));

    tunnelServer =
        new NettyServer(
                new BaseServerOptions(emptyConfig),
                nullHandler,
                (uri, sink) -> Optional.empty(),
                createResolver())
            .start();

    HttpClient.Factory factory = HttpClient.Factory.createDefault();
    try (WebSocket socket =
        factory
            .createClient(tunnelServer.getUrl())
            .openSocket(
                new HttpRequest(GET, "/session/" + id + "/bidi"), new WebSocket.Listener() {})) {

      socket.sendText("Hello tunnel");

      assertThat(latch.await(5, SECONDS)).isTrue();
      assertThat(received.get()).isEqualTo("Hello tunnel");
    }
  }

  @Test
  void shouldForwardTextMessageFromBackendToClient()
      throws URISyntaxException, InterruptedException {
    backendServer = createEchoBackend("pong", new CountDownLatch(1), new AtomicReference<>());

    SessionId id = new SessionId(UUID.randomUUID());
    sessions.add(
        new Session(
            id,
            backendServer.getUrl().toURI(),
            new ImmutableCapabilities(),
            new ImmutableCapabilities(),
            Instant.now()));

    tunnelServer =
        new NettyServer(
                new BaseServerOptions(emptyConfig),
                nullHandler,
                (uri, sink) -> Optional.empty(),
                createResolver())
            .start();

    HttpClient.Factory factory = HttpClient.Factory.createDefault();
    CountDownLatch latch = new CountDownLatch(1);
    AtomicReference<@Nullable String> reply = new AtomicReference<>();

    try (WebSocket socket =
        factory
            .createClient(tunnelServer.getUrl())
            .openSocket(
                new HttpRequest(GET, "/session/" + id + "/bidi"),
                new WebSocket.Listener() {
                  @Override
                  public void onText(CharSequence data) {
                    reply.set(data.toString());
                    latch.countDown();
                  }
                })) {

      socket.sendText("ping");

      assertThat(latch.await(5, SECONDS)).isTrue();
      assertThat(reply.get()).isEqualTo("pong");
    }
  }

  @Test
  void shouldForwardBinaryMessages() throws URISyntaxException, InterruptedException {
    byte[] payload = new byte[] {1, 2, 3, 4};

    AtomicReference<byte[]> received = new AtomicReference<>();
    CountDownLatch latch = new CountDownLatch(1);

    backendServer =
        new NettyServer(
                new BaseServerOptions(emptyConfig),
                nullHandler,
                (uri, sink) ->
                    Optional.of(
                        msg -> {
                          if (msg instanceof BinaryMessage) {
                            received.set(((BinaryMessage) msg).data());
                            latch.countDown();
                          }
                        }))
            .start();

    SessionId id = new SessionId(UUID.randomUUID());
    sessions.add(
        new Session(
            id,
            backendServer.getUrl().toURI(),
            new ImmutableCapabilities(),
            new ImmutableCapabilities(),
            Instant.now()));

    tunnelServer =
        new NettyServer(
                new BaseServerOptions(emptyConfig),
                nullHandler,
                (uri, sink) -> Optional.empty(),
                createResolver())
            .start();

    HttpClient.Factory factory = HttpClient.Factory.createDefault();
    try (WebSocket socket =
        factory
            .createClient(tunnelServer.getUrl())
            .openSocket(
                new HttpRequest(GET, "/session/" + id + "/bidi"), new WebSocket.Listener() {})) {

      socket.sendBinary(payload);

      assertThat(latch.await(5, SECONDS)).isTrue();
      assertThat(received.get()).isEqualTo(payload);
    }
  }

  @Test
  void shouldFallBackToWebSocketHandlerWhenSessionNotFound() {
    // No session in the map — tunnel resolver returns empty, falling through to the WS handler
    // which also returns empty. WebSocketUpgradeHandler responds with 400 Bad Request.
    tunnelServer =
        new NettyServer(
                new BaseServerOptions(emptyConfig),
                nullHandler,
                (uri, sink) -> Optional.empty(),
                createResolver())
            .start();

    HttpClient.Factory factory = HttpClient.Factory.createDefault();
    SessionId unknownId = new SessionId(UUID.randomUUID());

    boolean exceptionThrown = false;
    try {
      factory
          .createClient(tunnelServer.getUrl())
          .openSocket(
              new HttpRequest(GET, "/session/" + unknownId + "/bidi"), new WebSocket.Listener() {});
    } catch (Exception e) {
      // Expected: connection is rejected (400) because the session is not in the map.
      exceptionThrown = true;
    }
    assertThat(exceptionThrown).as("Expected openSocket to fail for unknown session").isTrue();
  }

  @Test
  void shouldFallBackToWebSocketHandlerWhenNodeIsUnreachable() throws Exception {
    // Allocate a port then immediately close the socket so nothing is listening on it.
    int closedPort;
    try (ServerSocket ss = new ServerSocket(0)) {
      closedPort = ss.getLocalPort();
    }

    SessionId id = new SessionId(UUID.randomUUID());
    sessions.add(
        new Session(
            id,
            new URI("http://127.0.0.1:" + closedPort),
            new ImmutableCapabilities(),
            new ImmutableCapabilities(),
            Instant.now()));

    tunnelServer =
        new NettyServer(
                new BaseServerOptions(emptyConfig),
                nullHandler,
                (uri, sink) -> Optional.empty(),
                createResolver())
            .start();

    HttpClient.Factory factory = HttpClient.Factory.createDefault();
    boolean exceptionThrown = false;
    try {
      factory
          .createClient(tunnelServer.getUrl())
          .openSocket(
              new HttpRequest(GET, "/session/" + id + "/bidi"), new WebSocket.Listener() {});
    } catch (Exception e) {
      // Expected: TCP connect fails, falls back to the WS handler (which returns empty) → 400.
      // The important thing is a graceful rejection, not an abrupt channel close.
      exceptionThrown = true;
    }
    assertThat(exceptionThrown)
        .as("Expected openSocket to fail gracefully when node is unreachable")
        .isTrue();
  }

  @Test
  void shouldTunnelWebSocketThroughHttpsNode() throws URISyntaxException, InterruptedException {
    // Start the backend with a self-signed certificate so its URL is https://.
    // The tunnel handler detects the https scheme and adds a TLS handler on the node-side channel.
    MapConfig httpsConfig =
        new MapConfig(Map.of("server", Map.of("https-self-signed", true, "hostname", "localhost")));
    AtomicReference<@Nullable String> received = new AtomicReference<>();
    CountDownLatch latch = new CountDownLatch(1);

    backendServer =
        new NettyServer(
                new BaseServerOptions(httpsConfig),
                nullHandler,
                (uri, sink) ->
                    Optional.of(
                        msg -> {
                          if (msg instanceof TextMessage) {
                            received.set(((TextMessage) msg).text());
                            latch.countDown();
                          }
                        }))
            .start();

    // backendServer.getUrl() is now https://localhost:<port>
    SessionId id = new SessionId(UUID.randomUUID());
    sessions.add(
        new Session(
            id,
            backendServer.getUrl().toURI(),
            new ImmutableCapabilities(),
            new ImmutableCapabilities(),
            Instant.now()));

    tunnelServer =
        new NettyServer(
                new BaseServerOptions(emptyConfig),
                nullHandler,
                (uri, sink) -> Optional.empty(),
                createResolver())
            .start();

    HttpClient.Factory factory = HttpClient.Factory.createDefault();
    try (WebSocket socket =
        factory
            .createClient(tunnelServer.getUrl())
            .openSocket(
                new HttpRequest(GET, "/session/" + id + "/bidi"), new WebSocket.Listener() {})) {

      socket.sendText("secure-hello");

      assertThat(latch.await(5, SECONDS)).isTrue();
      assertThat(received.get()).isEqualTo("secure-hello");
    }
  }

  @Test
  void shouldSupportMultipleMessagesOnSameConnection()
      throws URISyntaxException, InterruptedException {
    int messageCount = 5;
    CountDownLatch latch = new CountDownLatch(messageCount);
    AtomicReference<Integer> count = new AtomicReference<>(0);

    backendServer =
        new NettyServer(
                new BaseServerOptions(emptyConfig),
                nullHandler,
                (uri, sink) ->
                    Optional.of(
                        msg -> {
                          if (msg instanceof TextMessage) {
                            count.updateAndGet(c -> c + 1);
                            latch.countDown();
                          }
                        }))
            .start();

    SessionId id = new SessionId(UUID.randomUUID());
    sessions.add(
        new Session(
            id,
            backendServer.getUrl().toURI(),
            new ImmutableCapabilities(),
            new ImmutableCapabilities(),
            Instant.now()));

    tunnelServer =
        new NettyServer(
                new BaseServerOptions(emptyConfig),
                nullHandler,
                (uri, sink) -> Optional.empty(),
                createResolver())
            .start();

    HttpClient.Factory factory = HttpClient.Factory.createDefault();
    try (WebSocket socket =
        factory
            .createClient(tunnelServer.getUrl())
            .openSocket(
                new HttpRequest(GET, "/session/" + id + "/bidi"), new WebSocket.Listener() {})) {

      for (int i = 0; i < messageCount; i++) {
        socket.sendText("msg-" + i);
      }

      assertThat(latch.await(10, SECONDS)).isTrue();
      assertThat(count.get()).isEqualTo(messageCount);
    }
  }

  /**
   * Integration test that exercises the full Grid session lifecycle with BiDi enabled.
   *
   * <p>Flow: client requests {@code webSocketUrl: true} → LocalDistributor → LocalNode
   * (TestSessionFactory returns {@code webSocketUrl} capability pointing to the Router) →
   * LocalSessionMap registration → client reads {@code webSocketUrl} from capabilities → connects
   * to Router BiDi WebSocket → TCP tunnel → stub backend server.
   *
   * <p>This mirrors what a real WebDriver BiDi client does: request {@code webSocketUrl: true},
   * receive a {@code webSocketUrl} in the response capabilities, and connect to it.
   */
  @Test
  void shouldTunnelBiDiThroughFullGridSessionLifecycle()
      throws URISyntaxException, InterruptedException {
    // Stub backend — simulates a Node's BiDi WebSocket endpoint. Echoes a fixed reply.
    AtomicReference<@Nullable String> received = new AtomicReference<>();
    CountDownLatch receivedLatch = new CountDownLatch(1);
    AtomicReference<@Nullable String> reply = new AtomicReference<>();
    CountDownLatch replyLatch = new CountDownLatch(1);

    backendServer =
        new NettyServer(
                new BaseServerOptions(emptyConfig),
                nullHandler,
                (uri, sink) ->
                    Optional.of(
                        msg -> {
                          if (msg instanceof TextMessage) {
                            received.set(((TextMessage) msg).text());
                            receivedLatch.countDown();
                            sink.accept(new TextMessage("bidi-ack"));
                          }
                        }))
            .start();

    URI backendUri = backendServer.getUrl().toURI();

    // Wire up in-process Grid components — mirrors how Standalone sets up the session path.
    Tracer tracer = DefaultTestTracer.createTracer();
    GuavaEventBus bus = new GuavaEventBus();
    Secret secret = new Secret("test");
    ImmutableCapabilities stereotype = new ImmutableCapabilities("browserName", "chrome");

    LocalSessionMap gridSessions = new LocalSessionMap(tracer, bus);
    LocalNewSessionQueue queue =
        new LocalNewSessionQueue(
            tracer,
            new DefaultSlotMatcher(),
            Duration.ofSeconds(2),
            Duration.ofSeconds(5),
            Duration.ofSeconds(1),
            secret,
            5);

    // routerUrl is set after tunnelServer starts so the TestSessionFactory can embed the Router's
    // WebSocket URL in the returned webSocketUrl capability (the real Grid does the same).
    AtomicReference<@Nullable URL> routerUrl = new AtomicReference<>();

    // TestSessionFactory: session URI → backendServer (so the TCP tunnel connects there).
    // The returned capabilities include webSocketUrl pointing to the Router's BiDi endpoint,
    // which is what a real Node would return after the Router rewrites the capability.
    LocalNode node =
        LocalNode.builder(tracer, bus, backendUri, backendUri, secret)
            .add(
                stereotype,
                new TestSessionFactory(
                    stereotype,
                    (id, caps) -> {
                      URL rUrl = routerUrl.get();
                      MutableCapabilities returnedCaps = new MutableCapabilities(caps);
                      returnedCaps.setCapability(
                          "webSocketUrl",
                          "ws://"
                              + rUrl.getHost()
                              + ":"
                              + rUrl.getPort()
                              + "/session/"
                              + id
                              + "/bidi");
                      return new Session(id, backendUri, stereotype, returnedCaps, Instant.now());
                    }))
            .build();

    LocalDistributor distributor =
        new LocalDistributor(
            tracer,
            bus,
            new PassthroughHttpClient.Factory(node),
            gridSessions,
            queue,
            new DefaultSlotSelector(),
            secret,
            Duration.ofMinutes(5),
            false,
            Duration.ofSeconds(5),
            Runtime.getRuntime().availableProcessors(),
            new DefaultSlotMatcher(),
            Duration.ofSeconds(30));
    distributor.add(node);

    // Wait for node capacity, then start the Router so routerUrl is known before newSession().
    new FluentWait<>(distributor)
        .withTimeout(Duration.ofSeconds(5))
        .pollingEvery(Duration.ofMillis(100))
        .until(d -> d.getStatus().hasCapacity());

    HttpClient.Factory clientFactory = HttpClient.Factory.createDefault();
    Function<String, Optional<URI>> tcpTunnelResolver =
        uri ->
            HttpSessionId.getSessionId(uri)
                .map(SessionId::new)
                .flatMap(
                    id -> {
                      try {
                        return Optional.of(gridSessions.getUri(id));
                      } catch (NoSuchSessionException e) {
                        return Optional.empty();
                      }
                    });

    tunnelServer =
        new NettyServer(
                new BaseServerOptions(emptyConfig),
                nullHandler,
                new ProxyWebsocketsIntoGrid(clientFactory, gridSessions),
                tcpTunnelResolver)
            .start();
    routerUrl.set(tunnelServer.getUrl());

    // Create a session with webSocketUrl: true — BiDi explicitly enabled by the client.
    // LocalDistributor registers the session in gridSessions automatically.
    SessionRequest sessionRequest =
        new SessionRequest(
            new RequestId(UUID.randomUUID()),
            Instant.now(),
            Set.of(W3C),
            Set.of(new ImmutableCapabilities("browserName", "chrome", "webSocketUrl", true)),
            Map.of(),
            Map.of());
    Either<SessionNotCreatedException, CreateSessionResponse> result =
        distributor.newSession(sessionRequest);
    assertThat(result.isRight()).as("Session creation should succeed").isTrue();

    // Read webSocketUrl from the returned capabilities — this is how a real client locates the
    // BiDi endpoint, not by constructing the path manually.
    // The capabilities system deserialises URL-like strings as URI objects, so avoid casting.
    Object webSocketUrlCap =
        result.right().getSession().getCapabilities().getCapability("webSocketUrl");
    assertThat(webSocketUrlCap).as("webSocketUrl capability must be present").isNotNull();

    // Connect using the path from webSocketUrl (e.g. /session/<id>/bidi).
    // The host/port points at the Router which uses the TCP tunnel to reach the backend.
    String wsPath = new URI(webSocketUrlCap.toString()).getPath();

    try (WebSocket socket =
        clientFactory
            .createClient(tunnelServer.getUrl())
            .openSocket(
                new HttpRequest(GET, wsPath),
                new WebSocket.Listener() {
                  @Override
                  public void onText(CharSequence data) {
                    reply.set(data.toString());
                    replyLatch.countDown();
                  }
                })) {

      socket.sendText("{\"method\":\"session.new\"}");

      // Verify client → backend direction.
      assertThat(receivedLatch.await(5, SECONDS)).isTrue();
      assertThat(received.get()).isEqualTo("{\"method\":\"session.new\"}");

      // Verify backend → client direction (the echo reply).
      assertThat(replyLatch.await(5, SECONDS)).isTrue();
      assertThat(reply.get()).isEqualTo("bidi-ack");
    }

    distributor.close();
    bus.close();
  }

  // ---------------------------------------------------------------------------
  // ProxyWebsocketsIntoGrid + WebSocketFrameProxy (fallback path) tests
  //
  // These tests deliberately omit the TCP tunnel resolver so TcpUpgradeTunnelHandler
  // is NOT installed. Every WebSocket upgrade goes through ProxyWebsocketsIntoGrid
  // which, after the Netty handshake, rewires the pipeline via WebSocketFrameProxy.
  // ---------------------------------------------------------------------------

  private Server<?> createProxyRouter() {
    // 3-arg constructor: no tcpTunnelResolver → no TcpUpgradeTunnelHandler in the pipeline.
    return new NettyServer(
            new BaseServerOptions(emptyConfig),
            nullHandler,
            new ProxyWebsocketsIntoGrid(HttpClient.Factory.createDefault(), sessions))
        .start();
  }

  @Test
  void proxyPath_shouldForwardTextMessageToBackend()
      throws URISyntaxException, InterruptedException {
    AtomicReference<@Nullable String> received = new AtomicReference<>();
    CountDownLatch latch = new CountDownLatch(1);

    backendServer = createEchoBackend("", latch, received);

    SessionId id = new SessionId(UUID.randomUUID());
    sessions.add(
        new Session(
            id,
            backendServer.getUrl().toURI(),
            new ImmutableCapabilities(),
            new ImmutableCapabilities(),
            Instant.now()));

    tunnelServer = createProxyRouter();

    HttpClient.Factory factory = HttpClient.Factory.createDefault();
    try (WebSocket socket =
        factory
            .createClient(tunnelServer.getUrl())
            .openSocket(
                new HttpRequest(GET, "/session/" + id + "/bidi"), new WebSocket.Listener() {})) {

      socket.sendText("proxy-hello");

      assertThat(latch.await(5, SECONDS)).isTrue();
      assertThat(received.get()).isEqualTo("proxy-hello");
    }
  }

  @Test
  @NullMarked
  void proxyPath_shouldForwardReplyFromBackendToClient()
      throws URISyntaxException, InterruptedException {
    backendServer = createEchoBackend("proxy-pong", new CountDownLatch(1), new AtomicReference<>());

    SessionId id = new SessionId(UUID.randomUUID());
    sessions.add(
        new Session(
            id,
            backendServer.getUrl().toURI(),
            new ImmutableCapabilities(),
            new ImmutableCapabilities(),
            Instant.now()));

    tunnelServer = createProxyRouter();

    HttpClient.Factory factory = HttpClient.Factory.createDefault();
    CountDownLatch latch = new CountDownLatch(1);
    AtomicReference<@Nullable String> reply = new AtomicReference<>();

    try (WebSocket socket =
        factory
            .createClient(tunnelServer.getUrl())
            .openSocket(
                new HttpRequest(GET, "/session/" + id + "/bidi"),
                new WebSocket.Listener() {
                  @Override
                  public void onText(CharSequence data) {
                    reply.set(data.toString());
                    latch.countDown();
                  }
                })) {

      socket.sendText("proxy-ping");

      assertThat(latch.await(5, SECONDS)).isTrue();
      assertThat(reply.get()).isEqualTo("proxy-pong");
    }
  }

  @Test
  void proxyPath_shouldForwardBinaryMessages() throws URISyntaxException, InterruptedException {
    byte[] payload = new byte[] {10, 20, 30, 40};

    AtomicReference<byte[]> received = new AtomicReference<>();
    CountDownLatch latch = new CountDownLatch(1);

    backendServer =
        new NettyServer(
                new BaseServerOptions(emptyConfig),
                nullHandler,
                (uri, sink) ->
                    Optional.of(
                        msg -> {
                          if (msg instanceof BinaryMessage) {
                            received.set(((BinaryMessage) msg).data());
                            latch.countDown();
                          }
                        }))
            .start();

    SessionId id = new SessionId(UUID.randomUUID());
    sessions.add(
        new Session(
            id,
            backendServer.getUrl().toURI(),
            new ImmutableCapabilities(),
            new ImmutableCapabilities(),
            Instant.now()));

    tunnelServer = createProxyRouter();

    HttpClient.Factory factory = HttpClient.Factory.createDefault();
    try (WebSocket socket =
        factory
            .createClient(tunnelServer.getUrl())
            .openSocket(
                new HttpRequest(GET, "/session/" + id + "/bidi"), new WebSocket.Listener() {})) {

      socket.sendBinary(payload);

      assertThat(latch.await(5, SECONDS)).isTrue();
      assertThat(received.get()).isEqualTo(payload);
    }
  }

  @Test
  @NullMarked
  void proxyPath_shouldSupportMultipleMessagesAndBidirectionalFlow()
      throws URISyntaxException, InterruptedException {
    // Backend echoes every text message back with a ">" prefix to distinguish direction.
    int messageCount = 5;
    CountDownLatch backendLatch = new CountDownLatch(messageCount);
    CountDownLatch clientLatch = new CountDownLatch(messageCount);

    backendServer =
        new NettyServer(
                new BaseServerOptions(emptyConfig),
                nullHandler,
                (uri, sink) ->
                    Optional.of(
                        msg -> {
                          if (msg instanceof TextMessage) {
                            backendLatch.countDown();
                            sink.accept(new TextMessage(">" + ((TextMessage) msg).text()));
                          }
                        }))
            .start();

    SessionId id = new SessionId(UUID.randomUUID());
    sessions.add(
        new Session(
            id,
            backendServer.getUrl().toURI(),
            new ImmutableCapabilities(),
            new ImmutableCapabilities(),
            Instant.now()));

    tunnelServer = createProxyRouter();

    HttpClient.Factory factory = HttpClient.Factory.createDefault();
    try (WebSocket socket =
        factory
            .createClient(tunnelServer.getUrl())
            .openSocket(
                new HttpRequest(GET, "/session/" + id + "/bidi"),
                new WebSocket.Listener() {
                  @Override
                  public void onText(CharSequence data) {
                    clientLatch.countDown();
                  }
                })) {

      for (int i = 0; i < messageCount; i++) {
        socket.sendText("msg-" + i);
      }

      assertThat(backendLatch.await(10, SECONDS)).as("backend received all messages").isTrue();
      assertThat(clientLatch.await(10, SECONDS)).as("client received all replies").isTrue();
    }
  }

  /**
   * Regression test for node-initiated close in proxy path.
   *
   * <p>After the Netty pipeline is rewired by {@code WebSocketFrameProxy} (i.e. {@code
   * MessageOutboundConverter} is removed), a close message sent by the backend must still reach the
   * client as a proper WebSocket close frame — not silently dropped.
   */
  @Test
  void proxyPath_shouldRelayNodeInitiatedClose() throws URISyntaxException, InterruptedException {
    CountDownLatch closeLatch = new CountDownLatch(1);
    AtomicReference<@Nullable Integer> closeCode = new AtomicReference<>();

    // Backend sends one text message, then immediately closes the connection.
    backendServer =
        new NettyServer(
                new BaseServerOptions(emptyConfig),
                nullHandler,
                (uri, sink) ->
                    Optional.of(
                        msg -> {
                          if (msg instanceof TextMessage) {
                            sink.accept(new CloseMessage(1000, "done"));
                          }
                        }))
            .start();

    SessionId id = new SessionId(UUID.randomUUID());
    sessions.add(
        new Session(
            id,
            backendServer.getUrl().toURI(),
            new ImmutableCapabilities(),
            new ImmutableCapabilities(),
            Instant.now()));

    tunnelServer = createProxyRouter();

    HttpClient.Factory factory = HttpClient.Factory.createDefault();
    try (WebSocket socket =
        factory
            .createClient(tunnelServer.getUrl())
            .openSocket(
                new HttpRequest(GET, "/session/" + id + "/bidi"),
                new WebSocket.Listener() {
                  @Override
                  public void onClose(int code, String reason) {
                    closeCode.set(code);
                    closeLatch.countDown();
                  }
                })) {

      socket.sendText("trigger-close");

      assertThat(closeLatch.await(5, SECONDS))
          .as("client should receive close frame from node")
          .isTrue();
      assertThat(closeCode.get()).isEqualTo(1000);
    }
  }
}
