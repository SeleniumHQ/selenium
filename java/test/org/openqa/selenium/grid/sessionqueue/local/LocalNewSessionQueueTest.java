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

import org.junit.After;
import org.junit.ClassRule;
import org.junit.Test;
import org.junit.rules.Timeout;
import org.junit.runner.RunWith;
import org.junit.runners.Parameterized;
import org.openqa.selenium.Capabilities;
import org.openqa.selenium.ImmutableCapabilities;
import org.openqa.selenium.SessionNotCreatedException;
import org.openqa.selenium.grid.data.CreateSessionResponse;
import org.openqa.selenium.grid.data.DefaultSlotMatcher;
import org.openqa.selenium.grid.data.RequestId;
import org.openqa.selenium.grid.data.Session;
import org.openqa.selenium.grid.data.SessionRequest;
import org.openqa.selenium.grid.data.SessionRequestCapability;
import org.openqa.selenium.grid.security.Secret;
import org.openqa.selenium.grid.sessionqueue.NewSessionQueue;
import org.openqa.selenium.grid.sessionqueue.remote.RemoteNewSessionQueue;
import org.openqa.selenium.grid.testing.PassthroughHttpClient;
import org.openqa.selenium.internal.Debug;
import org.openqa.selenium.internal.Either;
import org.openqa.selenium.json.Json;
import org.openqa.selenium.remote.SessionId;
import org.openqa.selenium.remote.http.Contents;
import org.openqa.selenium.remote.http.HttpClient;
import org.openqa.selenium.remote.http.HttpResponse;
import org.openqa.selenium.remote.tracing.DefaultTestTracer;
import org.openqa.selenium.remote.tracing.Tracer;
import org.openqa.selenium.support.ui.FluentWait;

import java.net.URI;
import java.net.URISyntaxException;
import java.time.Duration;
import java.time.Instant;
import java.util.Collection;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import java.util.concurrent.Callable;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;
import java.util.concurrent.TimeoutException;
import java.util.concurrent.atomic.AtomicBoolean;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.function.Supplier;
import java.util.stream.Collectors;

import static java.net.HttpURLConnection.HTTP_INTERNAL_ERROR;
import static java.net.HttpURLConnection.HTTP_OK;
import static java.nio.charset.StandardCharsets.UTF_8;
import static java.util.concurrent.TimeUnit.SECONDS;
import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.fail;
import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertNotEquals;
import static org.junit.Assert.assertTrue;
import static org.openqa.selenium.remote.Dialect.W3C;
import static org.openqa.selenium.testing.Safely.safelyCall;

@RunWith(Parameterized.class)
public class LocalNewSessionQueueTest {

  private static final Json JSON = new Json();
  private static final Capabilities CAPS = new ImmutableCapabilities("browserName", "cheese");
  private static final Secret REGISTRATION_SECRET = new Secret("secret");
  private static final Instant
    LONG_AGO =
    Instant.parse("2007-01-03T21:49:10.00Z");
  // Go check the git log
  @ClassRule
  public static Timeout classTimeout = new Timeout(60, SECONDS);
  private final NewSessionQueue queue;
  private final LocalNewSessionQueue localQueue;
  private final SessionRequest sessionRequest;

  public LocalNewSessionQueueTest(Supplier<TestData> supplier) {
    TestData testData = supplier.get();
    this.queue = testData.queue;
    this.localQueue = testData.localQueue;

    this.sessionRequest = new SessionRequest(
      new RequestId(UUID.randomUUID()),
      Instant.now(),
      Set.of(W3C),
      Set.of(CAPS),
      Map.of(),
      Map.of());
  }

  @Parameterized.Parameters
  public static Collection<Supplier<TestData>> createQueues() {
    Tracer tracer = DefaultTestTracer.createTracer();

    Set<Supplier<TestData>> toReturn = new LinkedHashSet<>();

    // Note: this method is called only once, so if we want each test to
    // be isolated, everything that they use has to be created via the
    // supplier. In particular, a shared event bus will cause weird
    // failures to happen.

    toReturn.add(() -> {
      LocalNewSessionQueue local = new LocalNewSessionQueue(
        tracer,
        new DefaultSlotMatcher(),
        Duration.ofSeconds(1),
        Duration.ofSeconds(Debug.isDebugging() ? 9999 : 5),
        REGISTRATION_SECRET);
      return new TestData(local, local);
    });

    toReturn.add(() -> {
      LocalNewSessionQueue local = new LocalNewSessionQueue(
        tracer,
        new DefaultSlotMatcher(),
        Duration.ofSeconds(1),
        Duration.ofSeconds(Debug.isDebugging() ? 9999 : 5),
        REGISTRATION_SECRET);

      HttpClient client = new PassthroughHttpClient(local);
      return new TestData(local, new RemoteNewSessionQueue(tracer, client, REGISTRATION_SECRET));
    });

    return toReturn;
  }

  @After
  public void shutdownQueue() {
    safelyCall(localQueue::close);
  }

  private void waitUntilAddedToQueue(SessionRequest request) {
    new FluentWait<>(request)
      .withTimeout(Duration.ofSeconds(5))
      .until(
        r -> queue.getQueueContents().stream()
          .anyMatch(sessionRequestCapability ->
                      sessionRequestCapability.getRequestId().equals(r.getRequestId())));

  }

  @Test
  public void shouldBeAbleToAddToQueueAndGetValidResponse() {
    AtomicBoolean isPresent = new AtomicBoolean(false);

    new Thread(() -> {
      waitUntilAddedToQueue(sessionRequest);
      isPresent.set(true);

      Capabilities capabilities = new ImmutableCapabilities("browserName", "chrome");
      SessionId sessionId = new SessionId("123");
      Session session =
        new Session(
          sessionId,
          URI.create("https://example.com"),
          CAPS,
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

      queue.complete(sessionRequest.getRequestId(), Either.right(sessionResponse));
    }).start();

    HttpResponse httpResponse = queue.addToQueue(sessionRequest);

    assertThat(isPresent.get()).isTrue();
    assertEquals(httpResponse.getStatus(), HTTP_OK);
  }

  @Test
  public void shouldBeAbleToAddToQueueAndGetErrorResponse() {
    new Thread(() -> {
      waitUntilAddedToQueue(sessionRequest);
      queue.complete(sessionRequest.getRequestId(),
                     Either.left(new SessionNotCreatedException("Error")));
    }).start();

    HttpResponse httpResponse = queue.addToQueue(sessionRequest);

    assertEquals(httpResponse.getStatus(), HTTP_INTERNAL_ERROR);
  }

  @Test
  public void shouldBeAbleToRemoveFromQueue() {
    Optional<SessionRequest> httpRequest = queue.remove(new RequestId(UUID.randomUUID()));

    assertFalse(httpRequest.isPresent());
  }

  @Test
  public void shouldBeClearQueue() {
    RequestId requestId = new RequestId(UUID.randomUUID());
    localQueue.injectIntoQueue(sessionRequest);

    int count = queue.clearQueue();

    assertEquals(count, 1);
    assertFalse(queue.remove(requestId).isPresent());
  }

  @Test
  public void shouldBeAbleToGetQueueContents() {
    localQueue.injectIntoQueue(sessionRequest);

    List<Set<Capabilities>> response = queue.getQueueContents()
      .stream()
      .map(SessionRequestCapability::getDesiredCapabilities)
      .collect(Collectors.toList());

    assertThat(response).hasSize(1);

    assertEquals(Set.of(CAPS), response.get(0));
  }

  @Test
  public void queueCountShouldBeReturnedWhenQueueIsCleared() {
    RequestId requestId = sessionRequest.getRequestId();
    localQueue.injectIntoQueue(sessionRequest);
    queue.remove(requestId);

    queue.retryAddToQueue(sessionRequest);

    int count = queue.clearQueue();

    assertEquals(count, 1);
    assertFalse(queue.remove(requestId).isPresent());
  }

  @Test
  public void removingARequestIdThatDoesNotExistInTheQueueShouldNotBeAnError() {
    localQueue.injectIntoQueue(sessionRequest);
    Optional<SessionRequest> httpRequest = queue.remove(new RequestId(UUID.randomUUID()));

    assertFalse(httpRequest.isPresent());
  }

  @Test
  public void shouldBeAbleToAddAgainToQueue() {
    localQueue.injectIntoQueue(sessionRequest);

    Optional<SessionRequest> removed = queue.remove(sessionRequest.getRequestId());
    assertThat(removed).isPresent();

    boolean added = queue.retryAddToQueue(sessionRequest);
    assertTrue(added);
  }

  @Test
  public void shouldBeAbleToRetryRequest() {
    AtomicBoolean isPresent = new AtomicBoolean(false);
    AtomicBoolean retrySuccess = new AtomicBoolean(false);

    AtomicInteger count = new AtomicInteger(0);

    new Thread(() -> {
      while (count.get() <= 2) {
        waitUntilAddedToQueue(sessionRequest);

        count.incrementAndGet();
        Optional<SessionRequest> requestOptional = this.queue.remove(sessionRequest.getRequestId());
        isPresent.set(requestOptional.isPresent());

        if (count.get() == 1 && requestOptional.isPresent()) {
          retrySuccess.set(queue.retryAddToQueue(requestOptional.get()));
          continue;
        }

        // Only if it was retried after an interval, the count is 2
        if (count.get() == 2) {
          ImmutableCapabilities capabilities =
            new ImmutableCapabilities("browserName", "edam");
          try {
            SessionId sessionId = new SessionId("123");
            Session session =
              new Session(
                sessionId,
                new URI("http://example.com"),
                CAPS,
                capabilities,
                Instant.now());
            CreateSessionResponse sessionResponse =
              new CreateSessionResponse(
                session,
                JSON.toJson(
                    ImmutableMap.of(
                      "value",
                      ImmutableMap.of(
                        "sessionId", sessionId,
                        "capabilities", capabilities)))
                  .getBytes(UTF_8));
            queue.complete(sessionRequest.getRequestId(), Either.right(sessionResponse));
          } catch (URISyntaxException e) {
            throw new RuntimeException(e);
          }
        }

      }

    }).start();

    HttpResponse httpResponse = queue.addToQueue(sessionRequest);

    assertThat(isPresent.get()).isTrue();
    assertThat(retrySuccess.get()).isTrue();
    assertEquals(httpResponse.getStatus(), HTTP_OK);
  }

  @Test(timeout = 5000)
  public void shouldBeAbleToHandleMultipleSessionRequestsAtTheSameTime() {
    AtomicBoolean processQueue = new AtomicBoolean(true);
    // Processing the queue in a thread
    new Thread(() -> {
      while (processQueue.get()) {
        Optional<SessionRequestCapability> first = queue.getQueueContents().stream().findFirst();
        if (first.isPresent()) {
          RequestId reqId = first.get().getRequestId();
          queue.remove(reqId);
          ImmutableCapabilities capabilities = new ImmutableCapabilities("browserName", "chrome");
          try {
            SessionId sessionId = new SessionId(UUID.randomUUID());
            Session session =
              new Session(
                sessionId,
                new URI("https://example.com"),
                CAPS,
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
            queue.complete(reqId, Either.right(sessionResponse));
          } catch (URISyntaxException e) {
            queue.complete(reqId, Either.left(new SessionNotCreatedException(e.getMessage())));
          }
        }
      }
    }).start();

    ExecutorService executor = Executors.newFixedThreadPool(2);

    Callable<HttpResponse> callable = () -> {
      SessionRequest sessionRequest = new SessionRequest(
        new RequestId(UUID.randomUUID()),
        Instant.now(),
        Set.of(W3C),
        Set.of(CAPS),
        Map.of(),
        Map.of());

      return queue.addToQueue(sessionRequest);
    };

    Future<HttpResponse> firstRequest = executor.submit(callable);
    Future<HttpResponse> secondRequest = executor.submit(callable);

    try {
      HttpResponse firstResponse = firstRequest.get(30, SECONDS);
      HttpResponse secondResponse = secondRequest.get(30, SECONDS);

      String firstResponseContents = Contents.string(firstResponse);
      String secondResponseContents = Contents.string(secondResponse);

      assertEquals(firstResponse.getStatus(), HTTP_OK);
      assertEquals(secondResponse.getStatus(), HTTP_OK);

      assertNotEquals(firstResponseContents, secondResponseContents);
    } catch (InterruptedException | ExecutionException | TimeoutException e) {
      fail("Could not create session");
    }

    executor.shutdown();
    processQueue.set(false);
  }

  @Test(timeout = 5000)
  public void shouldBeAbleToTimeoutARequestOnRetry() {
    final SessionRequest request = new SessionRequest(
      new RequestId(UUID.randomUUID()),
      LONG_AGO,
      Set.of(W3C),
      Set.of(CAPS),
      Map.of(),
      Map.of());

    HttpResponse httpResponse = queue.addToQueue(request);

    assertEquals(HTTP_INTERNAL_ERROR, httpResponse.getStatus());
  }

  @Test(timeout = 5000)
  public void shouldBeAbleToClearQueueAndRejectMultipleRequests() {
    ExecutorService executor = Executors.newFixedThreadPool(2);

    Callable<HttpResponse> callable = () -> {
      SessionRequest sessionRequest = new SessionRequest(
        new RequestId(UUID.randomUUID()),
        Instant.now(),
        Set.of(W3C),
        Set.of(CAPS),
        Map.of(),
        Map.of());
      return queue.addToQueue(sessionRequest);
    };

    Future<HttpResponse> firstRequest = executor.submit(callable);
    Future<HttpResponse> secondRequest = executor.submit(callable);

    int count = 0;

    while (count < 2) {
      count += queue.clearQueue();
    }

    try {
      HttpResponse firstResponse = firstRequest.get(30, SECONDS);
      HttpResponse secondResponse = secondRequest.get(30, SECONDS);

      assertEquals(firstResponse.getStatus(), HTTP_INTERNAL_ERROR);
      assertEquals(secondResponse.getStatus(), HTTP_INTERNAL_ERROR);

    } catch (InterruptedException | ExecutionException | TimeoutException e) {
      fail("Could not create session");
    }

    executor.shutdownNow();
  }

  @Test
  public void shouldBeAbleToReturnTheNextAvailableEntryThatMatchesAStereotype() {
    SessionRequest expected = new SessionRequest(
      new RequestId(UUID.randomUUID()),
      Instant.now(),
      Set.of(W3C),
      Set.of(new ImmutableCapabilities("browserName", "cheese", "se:kind", "smoked")),
      Map.of(),
      Map.of());
    localQueue.injectIntoQueue(expected);

    localQueue.injectIntoQueue(new SessionRequest(
      new RequestId(UUID.randomUUID()),
      Instant.now(),
      Set.of(W3C),
      Set.of(new ImmutableCapabilities("browserName", "peas", "se:kind", "mushy")),
      Map.of(),
      Map.of()));

    Optional<SessionRequest> returned = queue.getNextAvailable(
      Set.of(new ImmutableCapabilities("browserName", "cheese")));

    assertThat(returned).isEqualTo(Optional.of(expected));
  }

  @Test
  public void shouldNotReturnANextAvailableEntryThatDoesNotMatchTheStereotypes() {
    // Note that this is basically the same test as getting the entry
    // from queue, but we've cleverly reversed the entries, so the one
    // that doesn't match should be first in the queue.
    localQueue.injectIntoQueue(new SessionRequest(
      new RequestId(UUID.randomUUID()),
      Instant.now(),
      Set.of(W3C),
      Set.of(new ImmutableCapabilities("browserName", "peas", "se:kind", "mushy")),
      Map.of(),
      Map.of()));

    SessionRequest expected = new SessionRequest(
      new RequestId(UUID.randomUUID()),
      Instant.now(),
      Set.of(W3C),
      Set.of(new ImmutableCapabilities("browserName", "cheese", "se:kind", "smoked")),
      Map.of(),
      Map.of());
    localQueue.injectIntoQueue(expected);

    Optional<SessionRequest> returned = queue.getNextAvailable(
      Set.of(new ImmutableCapabilities("browserName", "cheese")));

    assertThat(returned).isEqualTo(Optional.of(expected));
  }

  static class TestData {

    public final LocalNewSessionQueue localQueue;
    public final NewSessionQueue queue;

    public TestData(LocalNewSessionQueue localQueue, NewSessionQueue queue) {
      this.localQueue = localQueue;
      this.queue = queue;
    }
  }
}
