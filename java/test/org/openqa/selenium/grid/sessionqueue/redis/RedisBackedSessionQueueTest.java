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

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.net.URI;
import java.time.Duration;
import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.openqa.selenium.ImmutableCapabilities;
import org.openqa.selenium.SessionNotCreatedException;
import org.openqa.selenium.grid.data.CreateSessionResponse;
import org.openqa.selenium.grid.data.RequestId;
import org.openqa.selenium.grid.data.Session;
import org.openqa.selenium.grid.data.SessionId;
import org.openqa.selenium.grid.data.SessionRequest;
import org.openqa.selenium.grid.data.SessionRequestCapability;
import org.openqa.selenium.grid.security.Secret;
import org.openqa.selenium.internal.Either;
import org.openqa.selenium.remote.http.Contents;
import org.openqa.selenium.remote.http.HttpMethod;
import org.openqa.selenium.remote.http.HttpRequest;
import org.openqa.selenium.remote.http.HttpResponse;
import org.openqa.selenium.remote.tracing.DefaultTestTracer;
import org.openqa.selenium.remote.tracing.Tracer;

class RedisBackedSessionQueueTest {

  private static final Tracer tracer = DefaultTestTracer.createTracer();
  private static final Secret secret = new Secret("test-secret");
  private static final URI redisUri = URI.create("redis://localhost:6379");
  private static final Duration REQUEST_TIMEOUT_CHECK = Duration.ofMillis(50);
  private static final Duration REQUEST_TIMEOUT = Duration.ofSeconds(1);
  private static final Duration MAX_RESPONSE_DELAY = Duration.ofSeconds(2);
  private static final int BATCH_SIZE = 3;

  private RedisBackedSessionQueue queue;

  @BeforeEach
  void setUp() {
    queue =
        new RedisBackedSessionQueue(
            tracer,
            secret,
            redisUri,
            REQUEST_TIMEOUT_CHECK,
            REQUEST_TIMEOUT,
            MAX_RESPONSE_DELAY,
            BATCH_SIZE);
  }

  @AfterEach
  void tearDown() {
    queue.clearQueue();
  }

  @Test
  void shouldThrowIllegalArgumentExceptionIfRedisUriIsNull() {
    assertThatThrownBy(
            () ->
                new RedisBackedSessionQueue(
                    tracer,
                    secret,
                    null,
                    REQUEST_TIMEOUT_CHECK,
                    REQUEST_TIMEOUT,
                    MAX_RESPONSE_DELAY,
                    BATCH_SIZE))
        .isInstanceOf(IllegalArgumentException.class);
  }

  @Test
  void shouldThrowIllegalArgumentExceptionIfTracerIsNull() {
    assertThatThrownBy(
            () ->
                new RedisBackedSessionQueue(
                    null,
                    secret,
                    redisUri,
                    REQUEST_TIMEOUT_CHECK,
                    REQUEST_TIMEOUT,
                    MAX_RESPONSE_DELAY,
                    BATCH_SIZE))
        .isInstanceOf(IllegalArgumentException.class);
  }

  @Test
  void shouldThrowIllegalArgumentExceptionIfSecretIsNull() {
    assertThatThrownBy(
            () ->
                new RedisBackedSessionQueue(
                    tracer,
                    null,
                    redisUri,
                    REQUEST_TIMEOUT_CHECK,
                    REQUEST_TIMEOUT,
                    MAX_RESPONSE_DELAY,
                    BATCH_SIZE))
        .isInstanceOf(IllegalArgumentException.class);
  }

  @Test
  void canAddSessionRequestToQueue() {
    RequestId requestId = new RequestId(UUID.randomUUID());
    SessionRequest request = createSessionRequest(requestId);

    HttpResponse response = queue.addToQueue(request);

    assertThat(response.getStatus()).isEqualTo(200);
  }

  @Test
  void canRemoveSessionRequestFromQueue() {
    RequestId requestId = new RequestId(UUID.randomUUID());
    SessionRequest originalRequest = createSessionRequest(requestId);

    queue.addToQueue(originalRequest);

    Optional<SessionRequest> removed = queue.remove(requestId);

    assertThat(removed).isPresent();
    assertThat(removed.get().getRequestId()).isEqualTo(requestId);
  }

  @Test
  void getNextAvailableShouldReturnOldestRequest() {
    RequestId requestId = new RequestId(UUID.randomUUID());
    SessionRequest originalRequest = createSessionRequest(requestId);

    queue.addToQueue(originalRequest);

    List<SessionRequest> next = queue.getNextAvailable(Map.of());

    assertThat(next).hasSize(1);
    assertThat(next.get(0).getRequestId()).isEqualTo(requestId);
  }

  @Test
  void completeShouldReturnTrueAndCleanupRequestData() {
    RequestId requestId = new RequestId(UUID.randomUUID());
    Session dummySession =
        new Session(
            new SessionId("dummy"),
            "dummy-uri",
            new ImmutableCapabilities(),
            new ImmutableCapabilities(),
            Instant.now());
    CreateSessionResponse response = new CreateSessionResponse(dummySession, new byte[0]);
    Either<SessionNotCreatedException, CreateSessionResponse> result = Either.right(response);

    queue.addToQueue(createSessionRequest(requestId));

    boolean completed = queue.complete(requestId, result);

    assertThat(completed).isTrue();
  }

  @Test
  void clearQueueShouldRemoveAllRequests() {
    RequestId requestId1 = new RequestId(UUID.randomUUID());
    RequestId requestId2 = new RequestId(UUID.randomUUID());

    queue.addToQueue(createSessionRequest(requestId1));
    queue.addToQueue(createSessionRequest(requestId2));

    int cleared = queue.clearQueue();

    assertThat(cleared).isEqualTo(2);
  }

  @Test
  void getQueueContentsShouldReturnAllRequests() {
    RequestId requestId1 = new RequestId(UUID.randomUUID());
    RequestId requestId2 = new RequestId(UUID.randomUUID());
    SessionRequest request1 = createSessionRequest(requestId1);
    SessionRequest request2 = createSessionRequest(requestId2);

    queue.addToQueue(request1);
    queue.addToQueue(request2);

    List<SessionRequestCapability> contents = queue.getQueueContents();

    assertThat(contents).hasSize(2);
    assertThat(contents.get(0).getRequestId()).isEqualTo(requestId1);
    assertThat(contents.get(1).getRequestId()).isEqualTo(requestId2);
  }

  private SessionRequest createSessionRequest(RequestId requestId) {
    HttpRequest httpRequest = new HttpRequest(HttpMethod.POST, "/session");
    httpRequest.setContent(Contents.utf8String("{\"capabilities\":{\"browserName\":\"chrome\"}}"));
    return new SessionRequest(requestId, httpRequest, Instant.now());
  }
}
