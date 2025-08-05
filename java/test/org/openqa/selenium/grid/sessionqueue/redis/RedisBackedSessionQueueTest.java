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

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.openqa.selenium.remote.http.HttpMethod.POST;

import io.lettuce.core.KeyValue;
import io.lettuce.core.RedisCommandExecutionException;
import io.lettuce.core.api.StatefulRedisConnection;
import io.lettuce.core.api.sync.RedisCommands;
import java.net.URI;
import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.openqa.selenium.Capabilities;
import org.openqa.selenium.SessionNotCreatedException;
import org.openqa.selenium.grid.data.CreateSessionResponse;
import org.openqa.selenium.grid.data.RequestId;
import org.openqa.selenium.grid.data.SessionRequest;
import org.openqa.selenium.grid.data.SessionRequestCapability;
import org.openqa.selenium.grid.jmx.ManagedService;
import org.openqa.selenium.grid.security.Secret;
import org.openqa.selenium.internal.Either;
import org.openqa.selenium.json.Json;
import org.openqa.selenium.redis.GridRedisClient;
import org.openqa.selenium.remote.http.Contents;
import org.openqa.selenium.remote.http.HttpRequest;
import org.openqa.selenium.remote.http.HttpResponse;
import org.openqa.selenium.remote.tracing.DefaultTestTracer;
import org.openqa.selenium.remote.tracing.Tracer;

class RedisBackedSessionQueueTest {

  private static final Tracer tracer = DefaultTestTracer.createTracer();
  private static final Secret secret = new Secret("test-secret");
  private static final URI redisUri = URI.create("redis://localhost:6379");
  private static final Json JSON = new Json();

  @Mock private GridRedisClient mockRedisClient;
  @Mock private StatefulRedisConnection<String, String> mockConnection;
  @Mock private RedisCommands<String, String> mockCommands;

  private TestableRedisBackedSessionQueue queue;

  @BeforeEach
  void setUp() {
    MockitoAnnotations.openMocks(this);
    when(mockRedisClient.getConnection()).thenReturn(mockConnection);
    when(mockConnection.sync()).thenReturn(mockCommands);
    when(mockRedisClient.isOpen()).thenReturn(true);

    // Create queue with mocked Redis client and skip JMX registration
    queue = new TestableRedisBackedSessionQueue(tracer, secret, redisUri, mockRedisClient, true);
  }

  // Test-specific subclass that accepts a mock Redis client
  @ManagedService
  private static class TestableRedisBackedSessionQueue extends RedisBackedSessionQueue {
    public TestableRedisBackedSessionQueue(
        Tracer tracer, Secret registrationSecret, URI redisUri, GridRedisClient redisClient) {
      super(tracer, registrationSecret, redisUri, redisClient);
    }

    public TestableRedisBackedSessionQueue(
        Tracer tracer,
        Secret registrationSecret,
        URI redisUri,
        GridRedisClient redisClient,
        boolean skipJmxRegistration) {
      super(tracer, registrationSecret, redisUri, redisClient, skipJmxRegistration);
    }
  }

  @Test
  void shouldThrowIllegalArgumentExceptionIfRedisUriIsNull() {
    assertThatThrownBy(() -> new RedisBackedSessionQueue(tracer, secret, null))
        .isInstanceOf(IllegalArgumentException.class);
  }

  @Test
  void shouldThrowIllegalArgumentExceptionIfTracerIsNull() {
    assertThatThrownBy(() -> new RedisBackedSessionQueue(null, secret, redisUri))
        .isInstanceOf(IllegalArgumentException.class);
  }

  @Test
  void shouldThrowIllegalArgumentExceptionIfSecretIsNull() {
    assertThatThrownBy(() -> new RedisBackedSessionQueue(tracer, null, redisUri))
        .isInstanceOf(IllegalArgumentException.class);
  }

  @Test
  void isReadyShouldReturnTrueWhenRedisConnectionIsOpen() {
    when(mockRedisClient.isOpen()).thenReturn(true);
    assertThat(queue.isReady()).isTrue();
  }

  @Test
  void isReadyShouldReturnFalseWhenRedisConnectionIsClosed() {
    when(mockRedisClient.isOpen()).thenReturn(false);
    assertThat(queue.isReady()).isFalse();
  }

  @Test
  void peekEmptyShouldReturnTrueWhenQueueIsEmpty() {
    when(mockCommands.llen("session:queue")).thenReturn(0L);
    assertThat(queue.peekEmpty()).isTrue();
  }

  @Test
  void peekEmptyShouldReturnFalseWhenQueueHasRequests() {
    when(mockCommands.llen("session:queue")).thenReturn(2L);
    assertThat(queue.peekEmpty()).isFalse();
  }

  @Test
  void peekEmptyShouldReturnFalseOnRedisException() {
    when(mockCommands.llen("session:queue"))
        .thenThrow(new RedisCommandExecutionException("Redis error"));
    assertThat(queue.peekEmpty()).isFalse();
  }

  @Test
  void canAddSessionRequestToQueue() {
    RequestId requestId = new RequestId(UUID.randomUUID());
    SessionRequest request = createSessionRequest(requestId);

    when(mockCommands.lpush("session:queue", requestId.toString())).thenReturn(1L);

    HttpResponse response = queue.addToQueue(request);

    assertThat(response.getStatus()).isEqualTo(200);

    // Verify Redis operations
    verify(mockRedisClient)
        .mset(
            argThat(
                map ->
                    map.containsKey("session:request:" + requestId.toString())
                        && map.containsKey("session:enqueue_time:" + requestId.toString())));
    verify(mockCommands).lpush("session:queue", requestId.toString());
  }

  @Test
  void addToQueueShouldReturn500OnRedisException() {
    RequestId requestId = new RequestId(UUID.randomUUID());
    SessionRequest request = createSessionRequest(requestId);

    doThrow(new RedisCommandExecutionException("Redis error")).when(mockRedisClient).mset(any());

    HttpResponse response = queue.addToQueue(request);

    assertThat(response.getStatus()).isEqualTo(500);
  }

  @Test
  void retryAddToQueueShouldReturnTrueOnSuccess() {
    RequestId requestId = new RequestId(UUID.randomUUID());
    SessionRequest request = createSessionRequest(requestId);

    when(mockCommands.lpush("session:queue", requestId.toString())).thenReturn(1L);

    boolean result = queue.retryAddToQueue(request);

    assertThat(result).isTrue();
  }

  @Test
  void retryAddToQueueShouldReturnFalseOnFailure() {
    RequestId requestId = new RequestId(UUID.randomUUID());
    SessionRequest request = createSessionRequest(requestId);

    doThrow(new RedisCommandExecutionException("Redis error")).when(mockRedisClient).mset(any());

    boolean result = queue.retryAddToQueue(request);

    assertThat(result).isFalse();
  }

  @Test
  void canRemoveSessionRequestFromQueue() {
    RequestId requestId = new RequestId(UUID.randomUUID());
    SessionRequest originalRequest = createSessionRequest(requestId);
    String requestJson = JSON.toJson(originalRequest);

    when(mockRedisClient.get("session:request:" + requestId.toString())).thenReturn(requestJson);
    when(mockCommands.lrem("session:queue", 1, requestId.toString())).thenReturn(1L);

    Optional<SessionRequest> removed = queue.remove(requestId);

    assertThat(removed).isPresent();
    assertThat(removed.get().getRequestId()).isEqualTo(requestId);

    // Verify Redis operations
    verify(mockRedisClient).get("session:request:" + requestId.toString());
    verify(mockCommands).lrem("session:queue", 1, requestId.toString());
    verify(mockRedisClient)
        .del(
            "session:request:" + requestId.toString(),
            "session:enqueue_time:" + requestId.toString());
  }

  @Test
  void removeShouldReturnEmptyWhenRequestNotFound() {
    RequestId requestId = new RequestId(UUID.randomUUID());

    when(mockRedisClient.get("session:request:" + requestId.toString())).thenReturn(null);

    Optional<SessionRequest> removed = queue.remove(requestId);

    assertThat(removed).isEmpty();
  }

  @Test
  void removeShouldReturnEmptyOnRedisException() {
    RequestId requestId = new RequestId(UUID.randomUUID());

    when(mockRedisClient.get("session:request:" + requestId.toString()))
        .thenThrow(new RedisCommandExecutionException("Redis error"));

    Optional<SessionRequest> removed = queue.remove(requestId);

    assertThat(removed).isEmpty();
  }

  @Test
  void getNextAvailableShouldReturnOldestRequest() {
    RequestId requestId = new RequestId(UUID.randomUUID());
    SessionRequest originalRequest = createSessionRequest(requestId);
    String requestJson = JSON.toJson(originalRequest);

    when(mockCommands.rpop("session:queue")).thenReturn(requestId.toString());
    when(mockRedisClient.get("session:request:" + requestId.toString())).thenReturn(requestJson);

    List<SessionRequest> next = queue.getNextAvailable(Map.of());

    assertThat(next).hasSize(1);
    assertThat(next.get(0).getRequestId()).isEqualTo(requestId);

    // Verify Redis operations
    verify(mockCommands).rpop("session:queue");
    verify(mockRedisClient).get("session:request:" + requestId.toString());
  }

  @Test
  void getNextAvailableShouldReturnEmptyWhenQueueIsEmpty() {
    when(mockCommands.rpop("session:queue")).thenReturn(null);

    List<SessionRequest> next = queue.getNextAvailable(Map.of());

    assertThat(next).isEmpty();
  }

  @Test
  void getNextAvailableShouldReturnEmptyWhenRequestDataIsMissing() {
    RequestId requestId = new RequestId(UUID.randomUUID());

    when(mockCommands.rpop("session:queue")).thenReturn(requestId.toString());
    when(mockRedisClient.get("session:request:" + requestId.toString())).thenReturn(null);

    List<SessionRequest> next = queue.getNextAvailable(Map.of());

    assertThat(next).isEmpty();
  }

  @Test
  void getNextAvailableShouldReturnEmptyOnRedisException() {
    when(mockCommands.rpop("session:queue"))
        .thenThrow(new RedisCommandExecutionException("Redis error"));

    List<SessionRequest> next = queue.getNextAvailable(Map.of());

    assertThat(next).isEmpty();
  }

  @Test
  void completeShouldReturnTrueAndCleanupRequestData() {
    RequestId requestId = new RequestId(UUID.randomUUID());
    CreateSessionResponse response = mock(CreateSessionResponse.class);
    Either<SessionNotCreatedException, CreateSessionResponse> result = Either.right(response);

    boolean completed = queue.complete(requestId, result);

    assertThat(completed).isTrue();

    // Verify cleanup operations
    verify(mockRedisClient)
        .del(
            "session:request:" + requestId.toString(),
            "session:enqueue_time:" + requestId.toString());
  }

  @Test
  void completeShouldReturnFalseOnRedisException() {
    RequestId requestId = new RequestId(UUID.randomUUID());
    CreateSessionResponse response = mock(CreateSessionResponse.class);
    Either<SessionNotCreatedException, CreateSessionResponse> result = Either.right(response);

    doThrow(new RedisCommandExecutionException("Redis error"))
        .when(mockRedisClient)
        .del(anyString(), anyString());

    boolean completed = queue.complete(requestId, result);

    assertThat(completed).isFalse();
  }

  @Test
  void clearQueueShouldRemoveAllRequests() {
    RequestId requestId1 = new RequestId(UUID.randomUUID());
    RequestId requestId2 = new RequestId(UUID.randomUUID());

    when(mockCommands.lrange("session:queue", 0, -1))
        .thenReturn(List.of(requestId1.toString(), requestId2.toString()));

    int cleared = queue.clearQueue();

    assertThat(cleared).isEqualTo(2);

    // Verify Redis operations
    verify(mockCommands).lrange("session:queue", 0, -1);
    verify(mockRedisClient)
        .del(
            "session:request:" + requestId1.toString(),
            "session:enqueue_time:" + requestId1.toString(),
            "session:request:" + requestId2.toString(),
            "session:enqueue_time:" + requestId2.toString(),
            "session:queue");
  }

  @Test
  void clearQueueShouldReturn0WhenQueueIsEmpty() {
    when(mockCommands.lrange("session:queue", 0, -1)).thenReturn(List.of());

    int cleared = queue.clearQueue();

    assertThat(cleared).isEqualTo(0);
  }

  @Test
  void clearQueueShouldReturn0OnRedisException() {
    when(mockCommands.lrange("session:queue", 0, -1))
        .thenThrow(new RedisCommandExecutionException("Redis error"));

    int cleared = queue.clearQueue();

    assertThat(cleared).isEqualTo(0);
  }

  @Test
  void getQueueContentsShouldReturnAllRequests() {
    RequestId requestId1 = new RequestId(UUID.randomUUID());
    RequestId requestId2 = new RequestId(UUID.randomUUID());
    SessionRequest request1 = createSessionRequest(requestId1);
    SessionRequest request2 = createSessionRequest(requestId2);

    when(mockCommands.lrange("session:queue", 0, -1))
        .thenReturn(List.of(requestId1.toString(), requestId2.toString()));

    when(mockRedisClient.mget(
            "session:request:" + requestId1.toString(), "session:request:" + requestId2.toString()))
        .thenReturn(
            List.of(
                KeyValue.just("session:request:" + requestId1.toString(), JSON.toJson(request1)),
                KeyValue.just("session:request:" + requestId2.toString(), JSON.toJson(request2))));

    List<SessionRequestCapability> contents = queue.getQueueContents();

    assertThat(contents).hasSize(2);
    assertThat(contents.get(0).getRequestId()).isEqualTo(requestId1);
    assertThat(contents.get(1).getRequestId()).isEqualTo(requestId2);
  }

  @Test
  void getQueueContentsShouldReturnEmptyWhenQueueIsEmpty() {
    when(mockCommands.lrange("session:queue", 0, -1)).thenReturn(List.of());

    List<SessionRequestCapability> contents = queue.getQueueContents();

    assertThat(contents).isEmpty();
  }

  @Test
  void getQueueContentsShouldReturnEmptyOnRedisException() {
    when(mockCommands.lrange("session:queue", 0, -1))
        .thenThrow(new RedisCommandExecutionException("Redis error"));

    List<SessionRequestCapability> contents = queue.getQueueContents();

    assertThat(contents).isEmpty();
  }

  @Test
  void getQueueContentsShouldHandleMissingRequestData() {
    RequestId requestId1 = new RequestId(UUID.randomUUID());
    RequestId requestId2 = new RequestId(UUID.randomUUID());
    SessionRequest request1 = createSessionRequest(requestId1);

    when(mockCommands.lrange("session:queue", 0, -1))
        .thenReturn(List.of(requestId1.toString(), requestId2.toString()));

    when(mockRedisClient.mget(
            "session:request:" + requestId1.toString(), "session:request:" + requestId2.toString()))
        .thenReturn(
            List.of(
                KeyValue.just("session:request:" + requestId1.toString(), JSON.toJson(request1)),
                KeyValue.empty("session:request:" + requestId2.toString()) // Missing data
                ));

    List<SessionRequestCapability> contents = queue.getQueueContents();

    assertThat(contents).hasSize(1);
    assertThat(contents.get(0).getRequestId()).isEqualTo(requestId1);
  }

  @Test
  void closeShouldCloseRedisConnection() {
    queue.close();

    verify(mockRedisClient).close();
  }

  @Test
  void closeShouldHandleRedisException() {
    doThrow(new RuntimeException("Close error")).when(mockRedisClient).close();

    // Should not throw exception
    assertThatCode(() -> queue.close()).doesNotThrowAnyException();
  }

  @Test
  void getQueueSizeShouldReturnCorrectSize() {
    when(mockCommands.llen("session:queue")).thenReturn(5L);

    long size = queue.getQueueSize();

    assertThat(size).isEqualTo(5L);
  }

  @Test
  void getQueueSizeShouldReturnNegativeOneOnException() {
    when(mockCommands.llen("session:queue"))
        .thenThrow(new RedisCommandExecutionException("Redis error"));

    long size = queue.getQueueSize();

    assertThat(size).isEqualTo(-1L);
  }

  @Test
  void getRedisUriShouldReturnConfiguredUri() {
    String uri = queue.getRedisUri();

    assertThat(uri).isEqualTo(redisUri.toString());
  }

  private SessionRequest createSessionRequest(RequestId requestId) {
    HttpRequest httpRequest = new HttpRequest(POST, "/session");
    httpRequest.setContent(Contents.utf8String("{\"capabilities\":{\"browserName\":\"chrome\"}}"));
    return new SessionRequest(requestId, httpRequest, Instant.now());
  }

  private SessionRequest createSessionRequestWithCapabilities(
      RequestId requestId, Capabilities capabilities) {
    HttpRequest httpRequest = new HttpRequest(POST, "/session");
    httpRequest.setContent(
        Contents.utf8String("{\"capabilities\":" + JSON.toJson(capabilities) + "}"));
    return new SessionRequest(requestId, httpRequest, Instant.now());
  }
}
