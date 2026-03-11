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

package org.openqa.selenium.grid.node;

import static org.assertj.core.api.Assertions.assertThat;

import java.net.URI;
import java.time.Duration;
import java.time.Instant;
import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.function.Consumer;
import org.jspecify.annotations.Nullable;
import org.junit.jupiter.api.Test;
import org.openqa.selenium.Capabilities;
import org.openqa.selenium.ImmutableCapabilities;
import org.openqa.selenium.NoSuchSessionException;
import org.openqa.selenium.WebDriverException;
import org.openqa.selenium.grid.data.CreateSessionRequest;
import org.openqa.selenium.grid.data.CreateSessionResponse;
import org.openqa.selenium.grid.data.NodeId;
import org.openqa.selenium.grid.data.NodeStatus;
import org.openqa.selenium.grid.data.Session;
import org.openqa.selenium.grid.security.Secret;
import org.openqa.selenium.internal.Either;
import org.openqa.selenium.remote.SessionId;
import org.openqa.selenium.remote.http.HttpClient;
import org.openqa.selenium.remote.http.HttpRequest;
import org.openqa.selenium.remote.http.HttpResponse;
import org.openqa.selenium.remote.http.Message;
import org.openqa.selenium.remote.http.WebSocket;
import org.openqa.selenium.remote.tracing.DefaultTestTracer;

class ProxyNodeWebsocketsTest {

  private static final Secret SECRET = new Secret("test");

  /**
   * Regression test for counter leak: if tryAcquireConnection succeeds but no WebSocket endpoint
   * can be established, releaseConnection must be called so the slot is returned to the counter.
   * Without the fix, the counter climbs on every failed attempt until it reaches the configured
   * limit, blocking all future connections regardless of how high the limit is set.
   */
  @Test
  void shouldReleaseConnectionSlotWhenNoEndpointCanBeEstablished() {
    SessionId sessionId = new SessionId(UUID.randomUUID());
    AtomicInteger acquireCount = new AtomicInteger();
    AtomicInteger releaseCount = new AtomicInteger();

    // Capabilities with no CDP endpoint caps (no goog:chromeOptions / ms:edgeOptions) so that
    // findCdpEndpoint iterates over all known caps, finds nothing, and returns Optional.empty().
    Session session =
        new Session(
            sessionId,
            URI.create("http://localhost:4444"),
            new ImmutableCapabilities(),
            new ImmutableCapabilities(),
            Instant.now());

    Node node = new CountingStubNode(sessionId, session, acquireCount, releaseCount);

    // clientFactory is never reached because endpoint discovery fails before createWsEndPoint.
    ProxyNodeWebsockets proxy =
        new ProxyNodeWebsockets(config -> null, node, /* gridSubPath= */ "");

    Optional<Consumer<Message>> result =
        proxy.apply("/session/" + sessionId + "/se/cdp", msg -> {});

    assertThat(result).isEmpty();
    assertThat(acquireCount.get()).isEqualTo(1);
    // The fix: slot must be released so the counter does not leak.
    assertThat(releaseCount.get()).isEqualTo(1);
  }

  @Test
  void shouldNotReleaseConnectionSlotWhenLimitAlreadyReached() {
    SessionId sessionId = new SessionId(UUID.randomUUID());
    AtomicInteger releaseCount = new AtomicInteger();

    // Node reports the connection limit is already reached.
    Node node =
        new CountingStubNode(sessionId, null, new AtomicInteger(), releaseCount) {
          @Override
          public boolean tryAcquireConnection(SessionId id) {
            return false;
          }
        };

    ProxyNodeWebsockets proxy =
        new ProxyNodeWebsockets(config -> null, node, /* gridSubPath= */ "");

    Optional<Consumer<Message>> result =
        proxy.apply("/session/" + sessionId + "/se/cdp", msg -> {});

    assertThat(result).isEmpty();
    // Nothing was acquired, so nothing should be released.
    assertThat(releaseCount.get()).isEqualTo(0);
  }

  @Test
  void shouldReleaseConnectionSlotWhenGetSessionThrows() {
    SessionId sessionId = new SessionId(UUID.randomUUID());
    AtomicInteger acquireCount = new AtomicInteger();
    AtomicInteger releaseCount = new AtomicInteger();

    // getSession throws so no endpoint is ever reached; the slot must still be released.
    Node node =
        new CountingStubNode(sessionId, null, acquireCount, releaseCount) {
          @Override
          public Session getSession(SessionId id) {
            throw new NoSuchSessionException("session gone");
          }
        };

    ProxyNodeWebsockets proxy =
        new ProxyNodeWebsockets(config -> null, node, /* gridSubPath= */ "");

    Optional<Consumer<Message>> result =
        proxy.apply("/session/" + sessionId + "/se/cdp", msg -> {});

    assertThat(result).isEmpty();
    assertThat(acquireCount.get()).isEqualTo(1);
    assertThat(releaseCount.get()).isEqualTo(1);
  }

  @Test
  void shouldReleaseConnectionSlotWhenBiDiUriIsInvalid() {
    SessionId sessionId = new SessionId(UUID.randomUUID());
    AtomicInteger acquireCount = new AtomicInteger();
    AtomicInteger releaseCount = new AtomicInteger();

    // An invalid se:gridWebSocketUrl causes URISyntaxException in findBiDiEndpoint, which
    // returns Optional.empty() — the slot must still be released.
    Session session =
        new Session(
            sessionId,
            URI.create("http://localhost:4444"),
            new ImmutableCapabilities(),
            new ImmutableCapabilities("se:gridWebSocketUrl", "not a valid uri"),
            Instant.now());

    Node node = new CountingStubNode(sessionId, session, acquireCount, releaseCount);

    ProxyNodeWebsockets proxy =
        new ProxyNodeWebsockets(config -> null, node, /* gridSubPath= */ "");

    Optional<Consumer<Message>> result =
        proxy.apply("/session/" + sessionId + "/se/bidi", msg -> {});

    assertThat(result).isEmpty();
    assertThat(acquireCount.get()).isEqualTo(1);
    assertThat(releaseCount.get()).isEqualTo(1);
  }

  /**
   * Fix 3: se:vncLocalAddress capability absent from caps. Before the fix, {@code new URI(null)}
   * threw NullPointerException which was not caught by the URISyntaxException handler, bypassing
   * the endpoint.isEmpty() release guard and leaking the slot.
   */
  @Test
  void shouldReleaseConnectionSlotWhenVncAddressIsNull() {
    SessionId sessionId = new SessionId(UUID.randomUUID());
    AtomicInteger acquireCount = new AtomicInteger();
    AtomicInteger releaseCount = new AtomicInteger();

    // No se:vncLocalAddress in caps → getCapability returns null → was NPE before the fix.
    Session session =
        new Session(
            sessionId,
            URI.create("http://localhost:4444"),
            new ImmutableCapabilities(),
            new ImmutableCapabilities(),
            Instant.now());

    Node node = new CountingStubNode(sessionId, session, acquireCount, releaseCount);

    ProxyNodeWebsockets proxy =
        new ProxyNodeWebsockets(config -> null, node, /* gridSubPath= */ "");

    Optional<Consumer<Message>> result =
        proxy.apply("/session/" + sessionId + "/se/vnc", msg -> {});

    assertThat(result).isEmpty();
    assertThat(acquireCount.get()).isEqualTo(1);
    assertThat(releaseCount.get()).isEqualTo(1);
  }

  @Test
  void shouldReleaseConnectionSlotWhenVncUriIsInvalid() {
    SessionId sessionId = new SessionId(UUID.randomUUID());
    AtomicInteger acquireCount = new AtomicInteger();
    AtomicInteger releaseCount = new AtomicInteger();

    Session session =
        new Session(
            sessionId,
            URI.create("http://localhost:4444"),
            new ImmutableCapabilities(),
            new ImmutableCapabilities("se:vncLocalAddress", "not a valid uri %%"),
            Instant.now());

    Node node = new CountingStubNode(sessionId, session, acquireCount, releaseCount);

    ProxyNodeWebsockets proxy =
        new ProxyNodeWebsockets(config -> null, node, /* gridSubPath= */ "");

    Optional<Consumer<Message>> result =
        proxy.apply("/session/" + sessionId + "/se/vnc", msg -> {});

    assertThat(result).isEmpty();
    assertThat(acquireCount.get()).isEqualTo(1);
    assertThat(releaseCount.get()).isEqualTo(1);
  }

  /**
   * Fix 4: ForwardingListener.onError must release the connection slot in case the WebSocket
   * implementation does not call onClose after an error. Without the fix the slot leaks permanently
   * when only onError fires.
   */
  @Test
  void shouldReleaseConnectionSlotWhenWebSocketOnErrorFires() {
    SessionId sessionId = new SessionId(UUID.randomUUID());
    AtomicInteger acquireCount = new AtomicInteger();
    AtomicInteger releaseCount = new AtomicInteger();

    // se:gridWebSocketUrl present and valid so findBiDiEndpoint reaches createWsEndPoint.
    Session session =
        new Session(
            sessionId,
            URI.create("http://localhost:4444"),
            new ImmutableCapabilities(),
            new ImmutableCapabilities("se:gridWebSocketUrl", "ws://localhost:9222/devtools"),
            Instant.now());

    Node node = new CountingStubNode(sessionId, session, acquireCount, releaseCount);

    // Simulates a WebSocket implementation that fires onError without a subsequent onClose.
    HttpClient.Factory clientFactory =
        config ->
            new HttpClient() {
              @Override
              public HttpResponse execute(HttpRequest req) {
                return new HttpResponse();
              }

              @Override
              public WebSocket openSocket(HttpRequest req, WebSocket.Listener listener) {
                listener.onError(new RuntimeException("network error — no onClose follows"));
                // Return a no-op WebSocket handle; the connection has already errored.
                return new WebSocket() {
                  @Override
                  public WebSocket send(Message message) {
                    return this;
                  }

                  @Override
                  public void close() {}
                };
              }

              @Override
              public <T>
                  java.util.concurrent.CompletableFuture<java.net.http.HttpResponse<T>>
                      sendAsyncNative(
                          java.net.http.HttpRequest request,
                          java.net.http.HttpResponse.BodyHandler<T> handler) {
                throw new UnsupportedOperationException();
              }

              @Override
              public <T> java.net.http.HttpResponse<T> sendNative(
                  java.net.http.HttpRequest request,
                  java.net.http.HttpResponse.BodyHandler<T> handler) {
                throw new UnsupportedOperationException();
              }
            };

    ProxyNodeWebsockets proxy = new ProxyNodeWebsockets(clientFactory, node, /* gridSubPath= */ "");

    proxy.apply("/session/" + sessionId + "/se/bidi", msg -> {});

    assertThat(acquireCount.get()).isEqualTo(1);
    // Slot must be released via onError even though onClose was never called.
    assertThat(releaseCount.get()).isEqualTo(1);
  }

  /** Minimal Node stub that counts tryAcquireConnection / releaseConnection calls. */
  private abstract static class StubNode extends Node {

    StubNode(NodeId nodeId, URI uri) {
      super(DefaultTestTracer.createTracer(), nodeId, uri, SECRET, Duration.ofSeconds(30));
    }

    @Override
    public Either<WebDriverException, CreateSessionResponse> newSession(
        CreateSessionRequest sessionRequest) {
      throw new UnsupportedOperationException();
    }

    @Override
    public HttpResponse executeWebDriverCommand(HttpRequest req) {
      throw new UnsupportedOperationException();
    }

    @Override
    public Session getSession(SessionId id) throws NoSuchSessionException {
      throw new UnsupportedOperationException();
    }

    @Override
    public HttpResponse uploadFile(HttpRequest req, SessionId id) {
      throw new UnsupportedOperationException();
    }

    @Override
    public HttpResponse downloadFile(HttpRequest req, SessionId id) {
      throw new UnsupportedOperationException();
    }

    @Override
    public void stop(SessionId id) throws NoSuchSessionException {
      throw new UnsupportedOperationException();
    }

    @Override
    public boolean isSupporting(Capabilities capabilities) {
      return false;
    }

    @Override
    public NodeStatus getStatus() {
      throw new UnsupportedOperationException();
    }

    @Override
    public HealthCheck getHealthCheck() {
      throw new UnsupportedOperationException();
    }

    @Override
    public void drain() {
      draining.set(true);
    }

    @Override
    public boolean isReady() {
      return true;
    }
  }

  private static class CountingStubNode extends StubNode {

    private final SessionId ownedSession;
    private final @Nullable Session session;
    private final AtomicInteger acquireCount;
    private final AtomicInteger releaseCount;

    CountingStubNode(
        SessionId ownedSession,
        @Nullable Session session,
        AtomicInteger acquireCount,
        AtomicInteger releaseCount) {
      super(new NodeId(UUID.randomUUID()), URI.create("http://localhost:5555"));
      this.ownedSession = ownedSession;
      this.session = session;
      this.acquireCount = acquireCount;
      this.releaseCount = releaseCount;
    }

    @Override
    public boolean isSessionOwner(SessionId id) {
      return ownedSession.equals(id);
    }

    @Override
    public boolean tryAcquireConnection(SessionId id) {
      acquireCount.incrementAndGet();
      return true;
    }

    @Override
    public void releaseConnection(SessionId id) {
      releaseCount.incrementAndGet();
    }

    @Override
    public Session getSession(SessionId id) {
      if (session == null) {
        throw new UnsupportedOperationException();
      }
      return session;
    }
  }
}
