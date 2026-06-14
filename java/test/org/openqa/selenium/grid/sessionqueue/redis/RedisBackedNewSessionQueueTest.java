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

package org.openqa.selenium.grid.sessionqueue.redis;

import static java.net.HttpURLConnection.HTTP_INTERNAL_ERROR;
import static java.net.HttpURLConnection.HTTP_OK;
import static java.nio.charset.StandardCharsets.UTF_8;
import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.openqa.selenium.remote.Dialect.W3C;
import static org.openqa.selenium.testing.Safely.safelyCall;

import java.net.URI;
import java.net.URISyntaxException;
import java.time.Duration;
import java.time.Instant;
import java.util.HashMap;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;
import java.util.concurrent.TimeUnit;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.Timeout;
import org.openqa.selenium.Capabilities;
import org.openqa.selenium.ImmutableCapabilities;
import org.openqa.selenium.SessionNotCreatedException;
import org.openqa.selenium.grid.config.ConfigException;
import org.openqa.selenium.grid.config.MapConfig;
import org.openqa.selenium.grid.data.CreateSessionResponse;
import org.openqa.selenium.grid.data.DefaultSlotMatcher;
import org.openqa.selenium.grid.data.RequestId;
import org.openqa.selenium.grid.data.Session;
import org.openqa.selenium.grid.data.SessionRequest;
import org.openqa.selenium.grid.security.Secret;
import org.openqa.selenium.grid.sessionqueue.NewSessionQueue;
import org.openqa.selenium.internal.Either;
import org.openqa.selenium.json.Json;
import org.openqa.selenium.remote.SessionId;
import org.openqa.selenium.remote.http.Contents;
import org.openqa.selenium.remote.http.HttpResponse;
import org.openqa.selenium.remote.tracing.DefaultTestTracer;
import org.openqa.selenium.remote.tracing.Tracer;
import org.openqa.selenium.support.ui.FluentWait;
import org.testcontainers.containers.GenericContainer;

@Timeout(60)
class RedisBackedNewSessionQueueTest {

  private static final Json JSON = new Json();
  private static final Capabilities CAPS = new ImmutableCapabilities("browserName", "cheese");

  @SuppressWarnings("resource")
  private final GenericContainer<?> redisContainer =
      new GenericContainer<>("redis:8-alpine").withExposedPorts(6379);

  private URI redisUri;
  private Tracer tracer;
  private final Secret secret = new Secret("test-secret");
  private RedisBackedNewSessionQueue queue;

  @BeforeEach
  void setUp() throws URISyntaxException {
    redisContainer.start();
    redisUri =
        new URI("redis://" + redisContainer.getHost() + ":" + redisContainer.getMappedPort(6379));

    tracer = DefaultTestTracer.createTracer();
    queue = newQueue(Duration.ofSeconds(5));
  }

  @AfterEach
  void tearDown() {
    safelyCall(() -> queue.close());
    safelyCall(() -> redisContainer.stop());
  }

  private RedisBackedNewSessionQueue newQueue(Duration requestTimeout) {
    return new RedisBackedNewSessionQueue(
        tracer,
        new DefaultSlotMatcher(),
        Duration.ofSeconds(1),
        requestTimeout,
        Duration.ofSeconds(1),
        secret,
        5,
        redisUri);
  }

  private static Map<Capabilities, Long> stereotypes(Capabilities caps, long count) {
    // Mutable: getNextAvailable decrements the per-stereotype count as it matches.
    Map<Capabilities, Long> stereotypes = new HashMap<>();
    stereotypes.put(caps, count);
    return stereotypes;
  }

  private SessionRequest createRequest() {
    return new SessionRequest(
        new RequestId(UUID.randomUUID()),
        Instant.now(),
        Set.of(W3C),
        Set.of(CAPS),
        Map.of(),
        Map.of());
  }

  private CreateSessionResponse createSessionResponse(SessionRequest request) {
    SessionId sessionId = new SessionId(UUID.randomUUID());
    Session session =
        new Session(sessionId, URI.create("http://example.com"), CAPS, CAPS, Instant.now());
    return new CreateSessionResponse(
        session,
        JSON.toJson(Map.of("value", Map.of("sessionId", sessionId, "capabilities", CAPS)))
            .getBytes(UTF_8));
  }

  private void waitUntilQueued(NewSessionQueue queue, SessionRequest request) {
    new FluentWait<>(request)
        .withTimeout(Duration.ofSeconds(5))
        .pollingEvery(Duration.ofMillis(50))
        .until(
            r ->
                queue.getQueueContents().stream()
                    .anyMatch(src -> src.getRequestId().equals(r.getRequestId())));
  }

  @Test
  void isReadyWhenRedisIsAvailable() {
    assertThat(queue.isReady()).isTrue();
  }

  @Test
  void isNotReadyWhileShuttingDown() {
    RedisBackedNewSessionQueue draining = newQueue(Duration.ofSeconds(5));
    assertThat(draining.isReady()).isTrue();

    // A shutdown must immediately flip readiness so a load balancer routes traffic away.
    draining.close();
    assertThat(draining.isReady()).isFalse();
  }

  @Test
  void queueStartsEmpty() {
    assertThat(queue.peekEmpty()).isTrue();
    assertThat(queue.getQueueContents()).isEmpty();
  }

  @Test
  void addToQueueCompletesWhenSessionIsCreated() throws Exception {
    SessionRequest request = createRequest();

    ExecutorService executor = Executors.newSingleThreadExecutor();
    try {
      Future<HttpResponse> response = executor.submit(() -> queue.addToQueue(request));

      waitUntilQueued(queue, request);
      boolean valid =
          queue.complete(request.getRequestId(), Either.right(createSessionResponse(request)));

      assertThat(valid).isTrue();
      assertThat(response.get(5, TimeUnit.SECONDS).getStatus()).isEqualTo(HTTP_OK);
      assertThat(queue.peekEmpty()).isTrue();
    } finally {
      executor.shutdownNow();
    }
  }

  @Test
  void duplicateCompleteAfterConsumerReturnsIsRejected() throws Exception {
    SessionRequest request = createRequest();

    ExecutorService executor = Executors.newSingleThreadExecutor();
    try {
      Future<HttpResponse> response = executor.submit(() -> queue.addToQueue(request));

      waitUntilQueued(queue, request);
      boolean first =
          queue.complete(request.getRequestId(), Either.right(createSessionResponse(request)));
      assertThat(first).isTrue();

      // addToQueue has returned (and run its cleanup) by the time the future resolves.
      assertThat(response.get(5, TimeUnit.SECONDS).getStatus()).isEqualTo(HTTP_OK);

      // The winner-takes-all completion marker must survive cleanup so a late or duplicate
      // completion from another replica loses and is told to tear its session down.
      boolean second =
          queue.complete(request.getRequestId(), Either.right(createSessionResponse(request)));
      assertThat(second).isFalse();
    } finally {
      executor.shutdownNow();
    }
  }

  @Test
  void secondReplicaCompletesRequestEnqueuedByFirstReplica() throws Exception {
    RedisBackedNewSessionQueue secondReplica = newQueue(Duration.ofSeconds(5));
    SessionRequest request = createRequest();

    ExecutorService executor = Executors.newSingleThreadExecutor();
    try {
      // The blocking addToQueue runs on the first replica...
      Future<HttpResponse> response = executor.submit(() -> queue.addToQueue(request));

      // ...while the completion arrives at the second replica, as it would behind a load balancer.
      waitUntilQueued(secondReplica, request);
      boolean valid =
          secondReplica.complete(
              request.getRequestId(), Either.right(createSessionResponse(request)));

      assertThat(valid).isTrue();
      assertThat(response.get(5, TimeUnit.SECONDS).getStatus()).isEqualTo(HTTP_OK);
      assertThat(secondReplica.peekEmpty()).isTrue();
    } finally {
      executor.shutdownNow();
      safelyCall(secondReplica::close);
    }
  }

  @Test
  void requestTimesOutWhenNeverCompleted() throws Exception {
    RedisBackedNewSessionQueue shortQueue = newQueue(Duration.ofSeconds(1));
    SessionRequest request = createRequest();

    ExecutorService executor = Executors.newSingleThreadExecutor();
    try {
      Future<HttpResponse> response = executor.submit(() -> shortQueue.addToQueue(request));

      HttpResponse httpResponse = response.get(10, TimeUnit.SECONDS);
      assertThat(httpResponse.getStatus()).isEqualTo(HTTP_INTERNAL_ERROR);
      assertThat(shortQueue.peekEmpty()).isTrue();
    } finally {
      executor.shutdownNow();
      safelyCall(shortQueue::close);
    }
  }

  @Test
  void getNextAvailableClaimsMatchingRequest() throws Exception {
    SessionRequest request = createRequest();

    ExecutorService executor = Executors.newSingleThreadExecutor();
    try {
      executor.submit(() -> queue.addToQueue(request));
      waitUntilQueued(queue, request);

      var matched = queue.getNextAvailable(stereotypes(CAPS, 1L));

      assertThat(matched).hasSize(1);
      assertThat(matched.get(0).getRequestId()).isEqualTo(request.getRequestId());
      // Claimed requests leave the queue so another poll cannot grab them again.
      assertThat(queue.getNextAvailable(stereotypes(CAPS, 1L))).isEmpty();
    } finally {
      executor.shutdownNow();
    }
  }

  @Test
  void getNextAvailableSkipsNonMatchingStereotypes() throws Exception {
    SessionRequest request = createRequest();

    ExecutorService executor = Executors.newSingleThreadExecutor();
    try {
      executor.submit(() -> queue.addToQueue(request));
      waitUntilQueued(queue, request);

      var matched =
          queue.getNextAvailable(stereotypes(new ImmutableCapabilities("browserName", "peas"), 1L));

      assertThat(matched).isEmpty();
      assertThat(queue.peekEmpty()).isFalse();
    } finally {
      executor.shutdownNow();
    }
  }

  @Test
  void clearQueueFailsPendingRequests() throws Exception {
    SessionRequest request = createRequest();

    ExecutorService executor = Executors.newSingleThreadExecutor();
    try {
      Future<HttpResponse> response = executor.submit(() -> queue.addToQueue(request));
      waitUntilQueued(queue, request);

      int cleared = queue.clearQueue();

      assertThat(cleared).isEqualTo(1);
      assertThat(response.get(5, TimeUnit.SECONDS).getStatus()).isEqualTo(HTTP_INTERNAL_ERROR);
      assertThat(queue.peekEmpty()).isTrue();
    } finally {
      executor.shutdownNow();
    }
  }

  @Test
  void retryAddToQueueReturnsFalseForUnknownRequest() {
    assertThat(queue.retryAddToQueue(createRequest())).isFalse();
  }

  @Test
  void removeReturnsEmptyForUnknownRequest() {
    assertThat(queue.remove(new RequestId(UUID.randomUUID()))).isEmpty();
  }

  @Test
  void createRequiresBackendUrl() {
    Map<String, Object> rawConfig =
        Map.of(
            "sessionqueue", Map.of("implementation", RedisBackedNewSessionQueue.class.getName()));

    assertThatThrownBy(() -> RedisBackedNewSessionQueue.create(new MapConfig(rawConfig)))
        .isInstanceOf(ConfigException.class)
        .hasMessageContaining("backend-url");
  }

  @Test
  void createRejectsInvalidBackendUrl() {
    Map<String, Object> rawConfig =
        Map.of(
            "sessionqueue",
            Map.of(
                "implementation",
                RedisBackedNewSessionQueue.class.getName(),
                "backend-url",
                "not a uri"));

    assertThatThrownBy(() -> RedisBackedNewSessionQueue.create(new MapConfig(rawConfig)))
        .isInstanceOf(ConfigException.class)
        .hasMessageContaining("backend-url");
  }

  @Test
  void createUsesConfiguredBackendUrl() {
    Map<String, Object> rawConfig =
        Map.of(
            "sessionqueue",
            Map.of(
                "implementation",
                RedisBackedNewSessionQueue.class.getName(),
                "backend-url",
                redisUri.toString(),
                "session-request-timeout",
                2,
                "session-request-timeout-period",
                1));

    NewSessionQueue created = RedisBackedNewSessionQueue.create(new MapConfig(rawConfig));
    try {
      assertThat(created.isReady()).isTrue();
    } finally {
      safelyCall(() -> ((RedisBackedNewSessionQueue) created).close());
    }
  }

  @Test
  void completeReturnsFalseAfterTimeout() throws Exception {
    RedisBackedNewSessionQueue shortQueue = newQueue(Duration.ofSeconds(1));
    SessionRequest request = createRequest();

    ExecutorService executor = Executors.newSingleThreadExecutor();
    try {
      Future<HttpResponse> response = executor.submit(() -> shortQueue.addToQueue(request));
      // Let the request time out first.
      assertThat(response.get(10, TimeUnit.SECONDS).getStatus()).isEqualTo(HTTP_INTERNAL_ERROR);

      // A late, successful completion must lose to the timeout so the session gets torn down.
      boolean valid =
          shortQueue.complete(request.getRequestId(), Either.right(createSessionResponse(request)));
      assertThat(valid).isFalse();
    } finally {
      executor.shutdownNow();
      safelyCall(shortQueue::close);
    }
  }

  @Test
  void completeWithFailureIsReportedToCaller() throws Exception {
    SessionRequest request = createRequest();

    ExecutorService executor = Executors.newSingleThreadExecutor();
    try {
      Future<HttpResponse> response = executor.submit(() -> queue.addToQueue(request));
      waitUntilQueued(queue, request);

      queue.complete(
          request.getRequestId(), Either.left(new SessionNotCreatedException("no slot for you")));

      HttpResponse httpResponse = response.get(5, TimeUnit.SECONDS);
      assertThat(httpResponse.getStatus()).isEqualTo(HTTP_INTERNAL_ERROR);
      assertThat(Contents.string(httpResponse)).contains("no slot for you");
    } finally {
      executor.shutdownNow();
    }
  }
}
