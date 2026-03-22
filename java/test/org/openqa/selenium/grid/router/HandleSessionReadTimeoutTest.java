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

import static org.assertj.core.api.Assertions.assertThat;
import static org.openqa.selenium.remote.http.HttpMethod.GET;

import java.net.URI;
import java.time.Duration;
import java.time.Instant;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicReference;
import org.junit.jupiter.api.Test;
import org.openqa.selenium.Capabilities;
import org.openqa.selenium.ImmutableCapabilities;
import org.openqa.selenium.events.local.GuavaEventBus;
import org.openqa.selenium.grid.data.Session;
import org.openqa.selenium.grid.sessionmap.local.LocalSessionMap;
import org.openqa.selenium.json.Json;
import org.openqa.selenium.remote.SessionId;
import org.openqa.selenium.remote.http.ClientConfig;
import org.openqa.selenium.remote.http.Contents;
import org.openqa.selenium.remote.http.HttpClient;
import org.openqa.selenium.remote.http.HttpRequest;
import org.openqa.selenium.remote.http.HttpResponse;
import org.openqa.selenium.remote.http.WebSocket;
import org.openqa.selenium.remote.tracing.DefaultTestTracer;
import org.openqa.selenium.remote.tracing.Tracer;

/**
 * Unit and integration tests for {@link HandleSession}'s per-session read-timeout logic.
 *
 * <p>The Router's read timeout must be at least as long as the WebDriver {@code pageLoad} timeout
 * reported in the session capabilities so that the Router never cuts off a legitimate long-running
 * command before the Node has had time to return the timeout error.
 */
class HandleSessionReadTimeoutTest {

  // ---------------------------------------------------------------------------
  // sessionReadTimeout() unit tests — no Grid infrastructure needed
  // ---------------------------------------------------------------------------

  @Test
  void noTimeoutCapability_yieldsDefaultReadTimeout() {
    assertThat(HandleSession.sessionReadTimeout(new ImmutableCapabilities()))
        .isEqualTo(ClientConfig.defaultConfig().readTimeout());
  }

  @Test
  void pageLoadTimeout_usedAsReadTimeout() {
    Capabilities caps = new ImmutableCapabilities("timeouts", Map.of("pageLoad", 600_000L));
    assertThat(HandleSession.sessionReadTimeout(caps)).isEqualTo(Duration.ofMillis(600_000));
  }

  @Test
  void integerValues_acceptedInTimeoutsMap() {
    // Some JSON deserializers produce Integer rather than Long for small numbers.
    Capabilities caps = new ImmutableCapabilities("timeouts", Map.of("pageLoad", 300_000));
    assertThat(HandleSession.sessionReadTimeout(caps)).isEqualTo(Duration.ofMillis(300_000));
  }

  @Test
  void capabilitiesDeserializedFromJson_pageLoadExtracted() {
    // Simulate the wire-protocol path: the Grid reads session capabilities from JSON
    // (e.g. from SessionMap storage or Node response). Verify that whatever numeric
    // type Selenium's Json deserializer produces for the pageLoad value is handled correctly.
    String json = "{\"timeouts\":{\"implicit\":0,\"pageLoad\":300000,\"script\":30000}}";
    Map<String, Object> capsMap = new Json().toType(json, Json.MAP_TYPE);
    Capabilities caps = new ImmutableCapabilities(capsMap);
    assertThat(HandleSession.sessionReadTimeout(caps)).isEqualTo(Duration.ofMillis(300_000));
  }

  // ---------------------------------------------------------------------------
  // Integration tests — verify the effective read timeout applied to HttpClient
  // ---------------------------------------------------------------------------

  /**
   * When the session's {@code pageLoad} timeout (10 min) exceeds the Node's own {@code
   * sessionTimeout} (5 min), the Router must use the longer value so it does not cut off the
   * connection before the browser can time out and return a WebDriver error response.
   */
  @Test
  void longerPageLoadTimeout_overridesNodeSessionTimeout() throws Exception {
    URI nodeUri = new URI("http://localhost:4444");

    // Session was created with pageLoad = 10 min (600 s).
    Capabilities caps = new ImmutableCapabilities("timeouts", Map.of("pageLoad", 600_000L));

    // The Node reports sessionTimeout = 5 min (300 s) via /se/grid/node/status.
    long nodeSessionTimeoutMs = 300_000L;

    AtomicReference<Duration> capturedTimeout = new AtomicReference<>();
    HttpClient.Factory factory =
        config -> {
          Duration rt = config.readTimeout();
          // The session-command client is the one whose timeout differs from the default;
          // capture it so we can assert the correct value below.
          if (!rt.equals(ClientConfig.defaultConfig().readTimeout())) {
            capturedTimeout.set(rt);
          }
          return stubClientFor(nodeSessionTimeoutMs);
        };

    runSingleRequest(factory, nodeUri, caps);

    // effective = max(600 s, 300 s) + 30 s buffer = 630 s
    assertThat(capturedTimeout.get())
        .as("read timeout should be pageLoad + buffer when pageLoad > nodeSessionTimeout")
        .isEqualTo(Duration.ofSeconds(630));
  }

  /**
   * When the Node's {@code sessionTimeout} (10 min) exceeds the session's {@code pageLoad} (5 min),
   * the Router uses the larger Node timeout as the lower-bound floor, because the Grid operator has
   * explicitly configured a longer window.
   */
  @Test
  void longerNodeTimeout_usedAsFloor() throws Exception {
    URI nodeUri = new URI("http://localhost:4445");

    // Session was created with pageLoad = 5 min (300 s).
    Capabilities caps = new ImmutableCapabilities("timeouts", Map.of("pageLoad", 300_000L));

    // Node reports a 10-min (600 s) session timeout — operator has extended it.
    long nodeSessionTimeoutMs = 600_000L;

    AtomicReference<Duration> capturedTimeout = new AtomicReference<>();
    HttpClient.Factory factory =
        config -> {
          Duration rt = config.readTimeout();
          if (!rt.equals(ClientConfig.defaultConfig().readTimeout())) {
            capturedTimeout.set(rt);
          }
          return stubClientFor(nodeSessionTimeoutMs);
        };

    runSingleRequest(factory, nodeUri, caps);

    // effective = max(300 s, 600 s) + 30 s buffer = 630 s
    assertThat(capturedTimeout.get())
        .as("read timeout should be nodeSessionTimeout + buffer when node timeout > pageLoad")
        .isEqualTo(Duration.ofSeconds(630));
  }

  /**
   * When the session has no {@code pageLoad} capability, {@link HandleSession#sessionReadTimeout}
   * returns the {@link ClientConfig} default. The Router must still honour the Node's own {@code
   * sessionTimeout} as a floor, so the effective timeout is {@code nodeTimeout + buffer} rather
   * than just the bare ClientConfig default.
   */
  @Test
  void noPageLoadCapability_nodeTimeoutUsedAsFloor() throws Exception {
    URI nodeUri = new URI("http://localhost:4446");

    // Session has no pageLoad capability — sessionReadTimeout() returns the ClientConfig default.
    Capabilities caps = new ImmutableCapabilities();

    // Node reports a 10-min (600 s) session timeout.
    long nodeSessionTimeoutMs = 600_000L;

    AtomicReference<Duration> capturedTimeout = new AtomicReference<>();
    HttpClient.Factory factory =
        config -> {
          Duration rt = config.readTimeout();
          if (!rt.equals(ClientConfig.defaultConfig().readTimeout())) {
            capturedTimeout.set(rt);
          }
          return stubClientFor(nodeSessionTimeoutMs);
        };

    runSingleRequest(factory, nodeUri, caps);

    // effective = max(clientConfigDefault, 600 s) + 30 s buffer = 630 s
    assertThat(capturedTimeout.get())
        .as("read timeout should be nodeSessionTimeout + buffer when pageLoad is absent")
        .isEqualTo(Duration.ofSeconds(630));
  }

  // ---------------------------------------------------------------------------
  // Helpers
  // ---------------------------------------------------------------------------

  /**
   * Registers a session in a local SessionMap and executes one GET command through HandleSession.
   */
  private void runSingleRequest(HttpClient.Factory factory, URI nodeUri, Capabilities caps)
      throws Exception {
    Tracer tracer = DefaultTestTracer.createTracer();
    LocalSessionMap sessions = new LocalSessionMap(tracer, new GuavaEventBus());

    SessionId id = new SessionId(UUID.randomUUID());
    sessions.add(new Session(id, nodeUri, new ImmutableCapabilities(), caps, Instant.now()));

    try (HandleSession handler = new HandleSession(tracer, factory, sessions)) {
      handler.execute(new HttpRequest(GET, "/session/" + id + "/url"));
    }
  }

  /**
   * Returns a stub {@link HttpClient} that:
   *
   * <ul>
   *   <li>responds to {@code GET /se/grid/node/status} with a fake {@link
   *       org.openqa.selenium.grid.data.NodeStatus} JSON carrying {@code nodeSessionTimeoutMs};
   *   <li>responds to all other requests with {@code 200 OK}.
   * </ul>
   */
  private static HttpClient stubClientFor(long nodeSessionTimeoutMs) {
    return new HttpClient() {
      @Override
      public HttpResponse execute(HttpRequest req) {
        if (req.getUri().contains("/se/grid/node/status")) {
          String json =
              String.format(
                  "{\"sessionTimeout\":%d,\"availability\":\"UP\","
                      + "\"externalUri\":\"http://localhost:4444\","
                      + "\"nodeId\":\"%s\","
                      + "\"slots\":[],\"maxSessions\":1,\"version\":\"test\","
                      + "\"osInfo\":{}}",
                  nodeSessionTimeoutMs, UUID.randomUUID());
          return new HttpResponse().setContent(Contents.utf8String(json));
        }
        return new HttpResponse();
      }

      @Override
      public WebSocket openSocket(HttpRequest request, WebSocket.Listener listener) {
        throw new UnsupportedOperationException("not used in tests");
      }

      @Override
      public <T>
          java.util.concurrent.CompletableFuture<java.net.http.HttpResponse<T>> sendAsyncNative(
              java.net.http.HttpRequest request,
              java.net.http.HttpResponse.BodyHandler<T> handler) {
        throw new UnsupportedOperationException("not used in tests");
      }

      @Override
      public <T> java.net.http.HttpResponse<T> sendNative(
          java.net.http.HttpRequest request, java.net.http.HttpResponse.BodyHandler<T> handler) {
        throw new UnsupportedOperationException("not used in tests");
      }

      @Override
      public void close() {}
    };
  }
}
