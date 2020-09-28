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

package org.openqa.selenium.grid.sessionqueue;

import com.google.common.collect.ImmutableMap;
import org.junit.Before;
import org.junit.Test;
import org.openqa.selenium.ImmutableCapabilities;
import org.openqa.selenium.events.EventBus;
import org.openqa.selenium.events.local.GuavaEventBus;
import org.openqa.selenium.grid.data.CreateSessionResponse;
import org.openqa.selenium.grid.data.NewSessionErrorResponse;
import org.openqa.selenium.grid.data.NewSessionRejectedEvent;
import org.openqa.selenium.grid.data.NewSessionResponse;
import org.openqa.selenium.grid.data.NewSessionResponseEvent;
import org.openqa.selenium.grid.data.RequestId;
import org.openqa.selenium.grid.data.Session;
import org.openqa.selenium.grid.sessionqueue.local.LocalNewSessionQueue;
import org.openqa.selenium.grid.sessionqueue.local.LocalNewSessionQueuer;
import org.openqa.selenium.grid.sessionqueue.remote.RemoteNewSessionQueuer;
import org.openqa.selenium.grid.testing.PassthroughHttpClient;
import org.openqa.selenium.json.Json;
import org.openqa.selenium.remote.NewSessionPayload;
import org.openqa.selenium.remote.SessionId;
import org.openqa.selenium.remote.http.Contents;
import org.openqa.selenium.remote.http.HttpClient;
import org.openqa.selenium.remote.http.HttpMethod;
import org.openqa.selenium.remote.http.HttpRequest;
import org.openqa.selenium.remote.http.HttpResponse;
import org.openqa.selenium.remote.tracing.DefaultTestTracer;
import org.openqa.selenium.remote.tracing.Tracer;

import java.io.IOException;
import java.io.UncheckedIOException;
import java.net.URI;
import java.net.URISyntaxException;
import java.time.Duration;
import java.time.Instant;
import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.Callable;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.TimeoutException;

import static java.net.HttpURLConnection.HTTP_INTERNAL_ERROR;
import static java.net.HttpURLConnection.HTTP_OK;
import static java.nio.charset.StandardCharsets.UTF_8;
import static org.assertj.core.api.Assertions.fail;
import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertNotEquals;
import static org.junit.Assert.assertTrue;
import static org.openqa.selenium.grid.data.NewSessionRejectedEvent.NEW_SESSION_REJECTED;
import static org.openqa.selenium.grid.data.NewSessionRequestEvent.NEW_SESSION_REQUEST;
import static org.openqa.selenium.remote.http.Contents.utf8String;
import static org.openqa.selenium.remote.http.HttpMethod.POST;

public class NewSessionQueuerTest {

  private LocalNewSessionQueuer local;
  private RemoteNewSessionQueuer remote;
  private EventBus bus;
  private ImmutableCapabilities caps;
  private NewSessionPayload payload;
  private HttpRequest request;
  private static int count = 0;
  private static final Json JSON = new Json();
  private static int sessionTimeout = 5;
  private NewSessionQueue sessionQueue;


  @Before
  public void setUp() {
    Tracer tracer = DefaultTestTracer.createTracer();
    caps = new ImmutableCapabilities("browserName", "chrome");
    bus = new GuavaEventBus();

    sessionQueue = new LocalNewSessionQueue(tracer, bus, Duration.ofSeconds(1));
    local = new LocalNewSessionQueuer(tracer, bus, sessionQueue);

    HttpClient client = new PassthroughHttpClient(local);
    remote = new RemoteNewSessionQueuer(tracer, client);

    payload = NewSessionPayload.create(caps);
    request = createRequest(payload, POST, "/session");
  }

  @Test
  public void shouldBeAbleToAddToQueueAndGetValidResponse() {

    bus.addListener(NEW_SESSION_REQUEST, event -> {
      Optional<HttpRequest> sessionRequest = this.local.remove();
      assertTrue(sessionRequest.isPresent());
      RequestId reqId = event.getData(RequestId.class);
      ImmutableCapabilities capabilities = new ImmutableCapabilities("browserName", "chrome");
      try {
        SessionId sessionId = new SessionId("123");
        Session session = new Session(sessionId, new URI("http://example.com"), capabilities, Instant.now());
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
    });

    HttpResponse httpResponse = local.addToQueue(request);

    assertEquals(httpResponse.getStatus(), HTTP_OK);
  }

  @Test
  public void shouldBeAbleToAddToQueueAndGetErrorResponse() {

    bus.addListener(NEW_SESSION_REQUEST, event -> {
      Optional<HttpRequest> sessionRequest = this.local.remove();
      assertTrue(sessionRequest.isPresent());
      RequestId reqId = event.getData(RequestId.class);
      bus.fire(
          new NewSessionRejectedEvent(
              new NewSessionErrorResponse(reqId, "Error")));

    });

    HttpResponse httpResponse = local.addToQueue(request);

    assertEquals(httpResponse.getStatus(), HTTP_INTERNAL_ERROR);
  }

  @Test
  public void shouldBeAbleToAddToQueueRemotelyAndGetErrorResponse() {

    bus.addListener(NEW_SESSION_REQUEST, event -> {
      Optional<HttpRequest> sessionRequest = this.remote.remove();
      assertTrue(sessionRequest.isPresent());
      RequestId reqId = event.getData(RequestId.class);
      bus.fire(
          new NewSessionRejectedEvent(
              new NewSessionErrorResponse(reqId, "Could not poll the queue")));

    });

    HttpResponse httpResponse = remote.addToQueue(request);

    assertEquals(httpResponse.getStatus(), HTTP_INTERNAL_ERROR);
  }


  @Test
  public void shouldBeAbleToRemoveFromQueue() {
    Optional<HttpRequest> httpRequest = local.remove();

    assertFalse(httpRequest.isPresent());
  }

  @Test
  public void shouldBeClearQueue() {

    RequestId requestId = new RequestId(UUID.randomUUID());
    sessionQueue.offerLast(request, requestId);

    int count = local.clearQueue();

    assertEquals(count, 1);
    assertFalse(local.remove().isPresent());
  }

  @Test
  public void shouldBeClearQueueRemotely() {

    RequestId requestId = new RequestId(UUID.randomUUID());
    sessionQueue.offerLast(request, requestId);

    int count = remote.clearQueue();

    assertEquals(count, 1);
    assertFalse(remote.remove().isPresent());
  }

  @Test
  public void shouldBeClearQueueAndFireRejectedEvent() {

    RequestId requestId = new RequestId(UUID.randomUUID());
    bus.addListener(NEW_SESSION_REJECTED, event -> assertEquals(event.getData(UUID.class), requestId));

    sessionQueue.offerLast(request, requestId);

    int count = remote.clearQueue();

    assertEquals(count, 1);
    assertFalse(remote.remove().isPresent());
  }

  @Test
  public void shouldBeAbleToRemoveFromQueueRemotely() {
    Optional<HttpRequest> httpRequest = remote.remove();

    assertFalse(httpRequest.isPresent());
  }

  @Test
  public void shouldBeAbleToAddAgainToQueue() {
    boolean added = local.retryAddToQueue(request, new RequestId(UUID.randomUUID()));
    assertTrue(added);
  }

  @Test
  public void shouldBeAbleToAddAgainToQueueRemotely() {
    HttpRequest request = createRequest(payload, POST, "/se/grid/newsessionqueuer/session");
    boolean added = remote.retryAddToQueue(request, new RequestId(UUID.randomUUID()));

    assertTrue(added);
  }

  @Test
  public void shouldBeAbleToRetryRequest() {

    bus.addListener(NEW_SESSION_REQUEST, event -> {
      // Keep a count of event fired
      count++;
      Optional<HttpRequest> sessionRequest = this.remote.remove();
      assertTrue(sessionRequest.isPresent());
      RequestId reqId = event.getData(RequestId.class);

      if (count == 1) {
        assertTrue(remote.retryAddToQueue(sessionRequest.get(), reqId));
      }

      // Only if it was retried after an interval, the count is 2
      if (count == 2) {
        ImmutableCapabilities capabilities = new ImmutableCapabilities("browserName", "chrome");
        try {
          SessionId sessionId = new SessionId("123");
          Session session = new Session(sessionId, new URI("http://example.com"), capabilities, Instant.now());
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
    });

    HttpResponse httpResponse = remote.addToQueue(request);

    assertEquals(httpResponse.getStatus(), HTTP_OK);
  }

  @Test
  public void shouldBeAbleToHandleMultipleSessionRequestsAtTheSameTime() {

    bus.addListener(NEW_SESSION_REQUEST, event -> {
      Optional<HttpRequest> sessionRequest = this.local.remove();
      assertTrue(sessionRequest.isPresent());
      RequestId reqId = event.getData(RequestId.class);
      ImmutableCapabilities capabilities = new ImmutableCapabilities("browserName", "chrome");
      try {
        SessionId sessionId = new SessionId(UUID.randomUUID());
        Session session = new Session(sessionId, new URI("http://example.com"), capabilities, Instant.now());
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
    });

    ExecutorService executor = Executors.newFixedThreadPool(2);

    Callable<HttpResponse> callable = () -> remote.addToQueue(request);

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

  @Test
  public void shouldBeAbleToTimeoutARequest() {

    bus.addListener(NEW_SESSION_REQUEST, event -> {
      Optional<HttpRequest> sessionRequest = this.remote.remove();
      assertTrue(sessionRequest.isPresent());
      RequestId reqId = event.getData(RequestId.class);

      // Ensures that timestamp header is present
      if (hasRequestTimedOut(sessionRequest.get())) {
        // Reject the request once timeout occurs.
        bus.fire(
            new NewSessionRejectedEvent(new NewSessionErrorResponse(reqId, "Error")));
      } else {
        // Keep adding to front of queue till the request times out
        assertTrue(remote.retryAddToQueue(sessionRequest.get(), reqId));
      }
    });

    HttpResponse httpResponse = remote.addToQueue(request);

    assertEquals(httpResponse.getStatus(), HTTP_INTERNAL_ERROR);
  }

  @Test
  public void shouldBeAbleToClearQueueAndRejectMultipleRequests() {

    ExecutorService executor = Executors.newFixedThreadPool(2);

    Callable<HttpResponse> callable = () -> remote.addToQueue(request);

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

  private HttpRequest createRequest(NewSessionPayload payload, HttpMethod httpMethod, String uri) {
    StringBuilder builder = new StringBuilder();
    try {
      payload.writeTo(builder);
    } catch (IOException e) {
      throw new UncheckedIOException(e);
    }

    HttpRequest request = new HttpRequest(httpMethod, uri);
    request.setContent(utf8String(builder.toString()));

    return request;
  }

  private boolean hasRequestTimedOut(HttpRequest request) {
    String enqueTimestampStr = request.getHeader(NewSessionQueue.SESSIONREQUEST_TIMESTAMP_HEADER);
    Instant enque = Instant.ofEpochSecond(Long.parseLong(enqueTimestampStr));
    Instant deque = Instant.now();
    Duration duration = Duration.between(enque, deque);

    return duration.getSeconds() > sessionTimeout;
  }
}
