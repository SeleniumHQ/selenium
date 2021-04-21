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

package org.openqa.selenium.grid.sessionqueue.local;

import com.google.common.collect.ImmutableMap;
import org.junit.Before;
import org.junit.Test;
import org.openqa.selenium.Capabilities;
import org.openqa.selenium.ImmutableCapabilities;
import org.openqa.selenium.events.EventBus;
import org.openqa.selenium.events.local.GuavaEventBus;
import org.openqa.selenium.grid.data.CreateSessionResponse;
import org.openqa.selenium.grid.data.NewSessionErrorResponse;
import org.openqa.selenium.grid.data.NewSessionRejectedEvent;
import org.openqa.selenium.grid.data.NewSessionRequestEvent;
import org.openqa.selenium.grid.data.NewSessionResponse;
import org.openqa.selenium.grid.data.NewSessionResponseEvent;
import org.openqa.selenium.grid.data.RequestId;
import org.openqa.selenium.grid.data.Session;
import org.openqa.selenium.grid.security.Secret;
import org.openqa.selenium.grid.sessionqueue.SessionRequest;
import org.openqa.selenium.grid.sessionqueue.local.LocalNewSessionQueue;
import org.openqa.selenium.grid.sessionqueue.remote.RemoteNewSessionQueue;
import org.openqa.selenium.grid.testing.PassthroughHttpClient;
import org.openqa.selenium.json.Json;
import org.openqa.selenium.remote.SessionId;
import org.openqa.selenium.remote.http.Contents;
import org.openqa.selenium.remote.http.HttpClient;
import org.openqa.selenium.remote.http.HttpResponse;
import org.openqa.selenium.remote.tracing.DefaultTestTracer;
import org.openqa.selenium.remote.tracing.Tracer;

import java.net.URI;
import java.net.URISyntaxException;
import java.time.Duration;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import java.util.concurrent.Callable;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.TimeoutException;
import java.util.concurrent.atomic.AtomicBoolean;
import java.util.concurrent.atomic.AtomicInteger;

import static java.net.HttpURLConnection.HTTP_INTERNAL_ERROR;
import static java.net.HttpURLConnection.HTTP_OK;
import static java.nio.charset.StandardCharsets.UTF_8;
import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.fail;
import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertNotEquals;
import static org.junit.Assert.assertTrue;
import static org.openqa.selenium.remote.Dialect.W3C;

public class LocalNewSessionQueueTest {

  private static final Json JSON = new Json();
  private static int count = 0;
  private final Secret registrationSecret = new Secret("secret");
  private LocalNewSessionQueue local;
  private RemoteNewSessionQueue remote;
  private EventBus bus;
  private ImmutableCapabilities caps;
  private SessionRequest sessionRequest;


  @Before
  public void setUp() {
    Tracer tracer = DefaultTestTracer.createTracer();
    caps = new ImmutableCapabilities("browserName", "chrome");
    bus = new GuavaEventBus();

    local = new LocalNewSessionQueue(
      tracer,
      bus,
      Duration.ofSeconds(1),
      Duration.ofSeconds(1000),
      registrationSecret);

    HttpClient client = new PassthroughHttpClient(local);
    remote = new RemoteNewSessionQueue(tracer, client, registrationSecret);

    sessionRequest = new SessionRequest(
      new RequestId(UUID.randomUUID()),
      Instant.now(),
      Set.of(W3C),
      Set.of(caps));
  }

  @Test
  public void shouldBeAbleToAddToQueueAndGetValidResponse() {
    AtomicBoolean isPresent = new AtomicBoolean(false);

    bus.addListener(NewSessionRequestEvent.listener(reqId -> {
      Optional<SessionRequest> sessionRequest = this.local.remove(reqId);
      isPresent.set(sessionRequest.isPresent());
      Capabilities capabilities = new ImmutableCapabilities("browserName", "chrome");
      try {
        SessionId sessionId = new SessionId("123");
        Session session =
            new Session(
                sessionId,
                new URI("http://example.com"),
                caps,
                capabilities,
                Instant.now());
        CreateSessionResponse sessionResponse = new CreateSessionResponse(
            session,
            JSON.toJson(
                ImmutableMap.of(
                    "value", ImmutableMap.of(
                        "sessionId", sessionId,
                        "capabilities", capabilities)))
                .getBytes(UTF_8));
        NewSessionResponse newSessionResponse =
            new NewSessionResponse(reqId, sessionResponse.getSession(),
                                   sessionResponse.getDownstreamEncodedResponse());
        bus.fire(new NewSessionResponseEvent(newSessionResponse));
      } catch (URISyntaxException e) {
        bus.fire(
            new NewSessionRejectedEvent(
                new NewSessionErrorResponse(new RequestId(UUID.randomUUID()), "Error")));
      }
    }));

    HttpResponse httpResponse = local.addToQueue(sessionRequest);

    assertThat(isPresent.get()).isTrue();
    assertEquals(httpResponse.getStatus(), HTTP_OK);
  }

  @Test
  public void shouldBeAbleToAddToQueueAndGetErrorResponse() {
    AtomicBoolean isPresent = new AtomicBoolean(false);

    bus.addListener(NewSessionRequestEvent.listener(reqId -> {
      Optional<SessionRequest> sessionRequest = this.local.remove(reqId);
      isPresent.set(sessionRequest.isPresent());
      bus.fire(
          new NewSessionRejectedEvent(
              new NewSessionErrorResponse(reqId, "Error")));

    }));

    HttpResponse httpResponse = local.addToQueue(sessionRequest);

    assertThat(isPresent.get()).isTrue();
    assertEquals(httpResponse.getStatus(), HTTP_INTERNAL_ERROR);
  }

  @Test
  public void shouldBeAbleToAddToQueueRemotelyAndGetErrorResponse() {
    AtomicBoolean isPresent = new AtomicBoolean(false);

    bus.addListener(NewSessionRequestEvent.listener(reqId -> {
      Optional<SessionRequest> sessionRequest = this.remote.remove(reqId);
      isPresent.set(sessionRequest.isPresent());
      bus.fire(
          new NewSessionRejectedEvent(
              new NewSessionErrorResponse(reqId, "Could not poll the queue")));

    }));

    HttpResponse httpResponse = remote.addToQueue(sessionRequest);

    assertThat(isPresent.get()).isTrue();
    assertEquals(httpResponse.getStatus(), HTTP_INTERNAL_ERROR);
  }


  @Test
  public void shouldBeAbleToRemoveFromQueue() {
    Optional<SessionRequest> httpRequest = local.remove(new RequestId(UUID.randomUUID()));

    assertFalse(httpRequest.isPresent());
  }

  @Test
  public void shouldBeClearQueue() {
    RequestId requestId = new RequestId(UUID.randomUUID());
    local.offerLast(sessionRequest);

    int count = local.clearQueue();

    assertEquals(count, 1);
    assertFalse(local.remove(requestId).isPresent());
  }

  @Test
  public void shouldBeClearQueueRemotely() {
    RequestId requestId = new RequestId(UUID.randomUUID());
    remote.offerLast(sessionRequest);

    int count = remote.clearQueue();

    assertEquals(count, 1);
    assertFalse(remote.remove(requestId).isPresent());
  }

  @Test
  public void shouldBeAbleToGetQueueContents() {
    local.offerLast(sessionRequest);

    List<Set<Capabilities>> response = local.getQueueContents();
    assertThat(response).isNotNull();

    assertEquals(1, response.size());

    assertEquals(Set.of(caps), response.get(0));
  }

  @Test
  public void shouldBeAbleToGetQueueContentsRemotely() {
    remote.offerLast(sessionRequest);

    List<Set<Capabilities>> response = remote.getQueueContents();
    assertThat(response).isNotNull();

    assertEquals(1, response.size());

    assertEquals(Set.of(caps), response.iterator().next());
  }

  @Test
  public void shouldBeClearQueueAndFireRejectedEvent() {
    AtomicBoolean result = new AtomicBoolean(false);

    RequestId requestId = sessionRequest.getRequestId();
    bus.addListener(
      NewSessionRejectedEvent.listener(response -> result.set(response.getRequestId().equals(requestId))));

    local.offerLast(sessionRequest);

    int count = remote.clearQueue();

    assertThat(result.get()).isTrue();
    assertEquals(count, 1);
    assertFalse(remote.remove(requestId).isPresent());
  }

  @Test
  public void shouldBeAbleToRemoveFromQueueRemotely() {
    Optional<SessionRequest> httpRequest = remote.remove(new RequestId(UUID.randomUUID()));

    assertFalse(httpRequest.isPresent());
  }

  @Test
  public void shouldBeAbleToAddAgainToQueue() {
    boolean added = local.retryAddToQueue(sessionRequest);
    assertTrue(added);
  }

  @Test
  public void shouldBeAbleToAddAgainToQueueRemotely() {
    boolean added = remote.retryAddToQueue(sessionRequest);

    assertTrue(added);
  }

  @Test
  public void shouldBeAbleToRetryRequest() {
    AtomicBoolean isPresent = new AtomicBoolean(false);
    AtomicBoolean retrySuccess = new AtomicBoolean(false);

    bus.addListener(NewSessionRequestEvent.listener(reqId -> {
      // Keep a count of event fired
      count++;
      Optional<SessionRequest> sessionRequest = this.remote.remove(reqId);
      isPresent.set(sessionRequest.isPresent());

      if (count == 1) {
        retrySuccess.set(remote.retryAddToQueue(sessionRequest.get()));
      }

      // Only if it was retried after an interval, the count is 2
      if (count == 2) {
        ImmutableCapabilities capabilities = new ImmutableCapabilities("browserName", "chrome");
        try {
          SessionId sessionId = new SessionId("123");
          Session session =
              new Session(
                  sessionId,
                  new URI("http://example.com"),
                  caps,
                  capabilities,
                  Instant.now());
          CreateSessionResponse sessionResponse = new CreateSessionResponse(
              session,
              JSON.toJson(
                  ImmutableMap.of(
                      "value", ImmutableMap.of(
                          "sessionId", sessionId,
                          "capabilities", capabilities)))
                  .getBytes(UTF_8));
          NewSessionResponse newSessionResponse =
              new NewSessionResponse(reqId, sessionResponse.getSession(),
                                     sessionResponse.getDownstreamEncodedResponse());
          bus.fire(new NewSessionResponseEvent(newSessionResponse));
        } catch (URISyntaxException e) {
          bus.fire(
              new NewSessionRejectedEvent(
                  new NewSessionErrorResponse(new RequestId(UUID.randomUUID()), "Error")));
        }
      }
    }));

    HttpResponse httpResponse = remote.addToQueue(sessionRequest);

    assertThat(isPresent.get()).isTrue();
    assertThat(retrySuccess.get()).isTrue();
    assertEquals(httpResponse.getStatus(), HTTP_OK);
  }

  @Test(timeout = 15000)
  public void shouldBeAbleToHandleMultipleSessionRequestsAtTheSameTime() {
    bus.addListener(NewSessionRequestEvent.listener(reqId -> {
      Optional<SessionRequest> sessionRequest = this.local.remove(reqId);
      ImmutableCapabilities capabilities = new ImmutableCapabilities("browserName", "chrome");
      try {
        SessionId sessionId = new SessionId(UUID.randomUUID());
        Session session =
            new Session(
                sessionId,
                new URI("http://example.com"),
                caps,
                capabilities,
                Instant.now());
        CreateSessionResponse sessionResponse = new CreateSessionResponse(
            session,
            JSON.toJson(
                ImmutableMap.of(
                    "value", ImmutableMap.of(
                        "sessionId", sessionId,
                        "capabilities", capabilities)))
                .getBytes(UTF_8));
        NewSessionResponse newSessionResponse =
            new NewSessionResponse(reqId, sessionResponse.getSession(),
                                   sessionResponse.getDownstreamEncodedResponse());
        bus.fire(new NewSessionResponseEvent(newSessionResponse));
      } catch (URISyntaxException e) {
        bus.fire(
            new NewSessionRejectedEvent(
                new NewSessionErrorResponse(new RequestId(UUID.randomUUID()), "Error")));
      }
    }));

    ExecutorService executor = Executors.newFixedThreadPool(2);

    Callable<HttpResponse> callable = () -> {
      SessionRequest sessionRequest = new SessionRequest(
        new RequestId(UUID.randomUUID()),
        Instant.now(),
        Set.of(W3C),
        Set.of(caps));

      return remote.addToQueue(sessionRequest);
    };

    Future<HttpResponse> firstRequest = executor.submit(callable);
    Future<HttpResponse> secondRequest = executor.submit(callable);

    try {
      HttpResponse firstResponse = firstRequest.get(30, TimeUnit.SECONDS);
      HttpResponse secondResponse = secondRequest.get(30, TimeUnit.SECONDS);

      String firstResponseContents = Contents.string(firstResponse);
      String secondResponseContents = Contents.string(secondResponse);

      assertEquals(firstResponse.getStatus(), HTTP_OK);
      assertEquals(secondResponse.getStatus(), HTTP_OK);

      assertNotEquals(firstResponseContents, secondResponseContents);
    } catch (InterruptedException | ExecutionException | TimeoutException e) {
      fail("Could not create session");
    }

    executor.shutdown();
  }

  @Test(timeout = 15000)
  public void shouldBeAbleToTimeoutARequestOnRetry() {
    final SessionRequest request = new SessionRequest(
      new RequestId(UUID.randomUUID()),
      Instant.ofEpochMilli(1539091064),
      Set.of(W3C),
      Set.of(caps));

    AtomicInteger count = new AtomicInteger();

    bus.addListener(NewSessionRequestEvent.listener(reqId -> {
      // Add to front of queue, when retry is triggered it will check if request timed out
      count.incrementAndGet();
      remote.retryAddToQueue(request);
    }));

    HttpResponse httpResponse = remote.addToQueue(request);

    assertEquals(count.get(),1);
    assertEquals(httpResponse.getStatus(), HTTP_INTERNAL_ERROR);
  }

  @Test(timeout = 15000)
  public void shouldBeAbleToTimeoutARequestOnRemove() {
    Tracer tracer = DefaultTestTracer.createTracer();
    local = new LocalNewSessionQueue(
      tracer,
      bus,
      Duration.ofSeconds(4),
      Duration.ofSeconds(0),
      registrationSecret);

    HttpClient client = new PassthroughHttpClient(local);
    remote = new RemoteNewSessionQueue(tracer, client, registrationSecret);

    AtomicBoolean isPresent = new AtomicBoolean();
    bus.addListener(NewSessionRequestEvent.listener(reqId -> {
      Optional<SessionRequest> request = remote.remove(reqId);
      isPresent.set(request.isPresent());
      bus.fire(
          new NewSessionRejectedEvent(
              new NewSessionErrorResponse(reqId, "Error")));

    }));

    HttpResponse httpResponse = remote.addToQueue(sessionRequest);
    assertEquals(httpResponse.getStatus(), HTTP_INTERNAL_ERROR);

    assertThat(isPresent.get()).isFalse();
  }

  @Test(timeout = 15000)
  public void shouldBeAbleToClearQueueAndRejectMultipleRequests() {
    ExecutorService executor = Executors.newFixedThreadPool(2);

    Callable<HttpResponse> callable = () -> {
      SessionRequest sessionRequest = new SessionRequest(
        new RequestId(UUID.randomUUID()),
        Instant.now(),
        Set.of(W3C),
        Set.of(caps));
      return remote.addToQueue(sessionRequest);
    };

    Future<HttpResponse> firstRequest = executor.submit(callable);
    Future<HttpResponse> secondRequest = executor.submit(callable);

    int count = 0;

    while (count < 2) {
      count += remote.clearQueue();
    }

    try {
      HttpResponse firstResponse = firstRequest.get(30, TimeUnit.SECONDS);
      HttpResponse secondResponse = secondRequest.get(30, TimeUnit.SECONDS);

      assertEquals(firstResponse.getStatus(), HTTP_INTERNAL_ERROR);
      assertEquals(secondResponse.getStatus(), HTTP_INTERNAL_ERROR);

    } catch (InterruptedException | ExecutionException | TimeoutException e) {
      fail("Could not create session");
    }

    executor.shutdown();
  }
}
