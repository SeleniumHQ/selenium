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

package org.openqa.selenium.remote.http;

import static java.net.HttpURLConnection.HTTP_INTERNAL_ERROR;
import static java.net.HttpURLConnection.HTTP_OK;
import static java.net.HttpURLConnection.HTTP_UNAVAILABLE;
import static org.assertj.core.api.Assertions.assertThat;
import static org.openqa.selenium.remote.http.Contents.asJson;
import static org.openqa.selenium.remote.http.HttpMethod.GET;

import com.google.common.collect.ImmutableMap;
import java.io.IOException;
import java.io.UncheckedIOException;
import java.net.ConnectException;
import java.net.MalformedURLException;
import java.net.URI;
import java.time.Duration;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.Callable;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.concurrent.atomic.AtomicReference;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.openqa.selenium.TimeoutException;
import org.openqa.selenium.environment.webserver.AppServer;
import org.openqa.selenium.environment.webserver.NettyAppServer;

class RetryRequestTest {

  private HttpClient client;
  private static final String REQUEST_PATH = "http://%s:%s/hello";

  @BeforeEach
  public void setUp() throws MalformedURLException {
    ClientConfig config =
        ClientConfig.defaultConfig()
            .baseUrl(URI.create("http://localhost:2345").toURL())
            .withRetries()
            .readTimeout(Duration.ofSeconds(1))
            .connectionTimeout(Duration.ofSeconds(1));
    client = HttpClient.Factory.createDefault().createClient(config);
  }

  @Test
  void canThrowUnexpectedException() {
    HttpHandler handler =
        new RetryRequest()
            .andFinally(
                (HttpRequest request) -> {
                  throw new UnsupportedOperationException("Testing");
                });

    Assertions.assertThrows(
        UnsupportedOperationException.class, () -> handler.execute(new HttpRequest(GET, "/")));
  }

  @Test
  void noUnexpectedRetry() {
    AtomicInteger count = new AtomicInteger();
    HttpHandler handler =
        new RetryRequest()
            .andFinally(
                (HttpRequest request) -> {
                  if (count.getAndIncrement() == 0) {
                    throw new StackOverflowError("Testing");
                  } else {
                    throw new UncheckedIOException("More testing", new IOException());
                  }
                });

    Assertions.assertThrows(
        StackOverflowError.class, () -> handler.execute(new HttpRequest(GET, "/")));
    Assertions.assertEquals(1, count.get());

    Assertions.assertThrows(
        UncheckedIOException.class, () -> handler.execute(new HttpRequest(GET, "/")));
    Assertions.assertEquals(2, count.get());
  }

  @Test
  void canReturnAppropriateFallbackResponse() {
    HttpHandler handler1 =
        new RetryRequest()
            .andFinally(
                (HttpRequest request) -> {
                  throw new TimeoutException();
                });

    Assertions.assertThrows(
        TimeoutException.class, () -> handler1.execute(new HttpRequest(GET, "/")));

    HttpHandler handler2 =
        new RetryRequest()
            .andFinally((HttpRequest request) -> new HttpResponse().setStatus(HTTP_UNAVAILABLE));

    Assertions.assertEquals(
        HTTP_UNAVAILABLE, handler2.execute(new HttpRequest(GET, "/")).getStatus());
  }

  @Test
  void canReturnAppropriateFallbackResponseWithMultipleThreads()
      throws InterruptedException, ExecutionException {
    AppServer server = new NettyAppServer(req -> new HttpResponse());

    URI uri = URI.create(server.whereIs("/"));
    HttpRequest connectionTimeoutRequest =
        new HttpRequest(GET, String.format(REQUEST_PATH, uri.getHost(), uri.getPort()));

    HttpHandler handler2 =
        new RetryRequest()
            .andFinally((HttpRequest request) -> new HttpResponse().setStatus(HTTP_UNAVAILABLE));

    ExecutorService executorService = Executors.newFixedThreadPool(3);
    List<Callable<HttpResponse>> tasks = new ArrayList<>();

    for (int i = 0; i < 1024; i++) {
      tasks.add(() -> client.execute(connectionTimeoutRequest));
      tasks.add(() -> handler2.execute(new HttpRequest(GET, "/")));
    }

    List<Future<HttpResponse>> results = executorService.invokeAll(tasks);

    for (int i = 0; i < 1024; i++) {
      int offset = i * 2;
      Assertions.assertThrows(ExecutionException.class, () -> results.get(offset).get());
      Assertions.assertEquals(HTTP_UNAVAILABLE, results.get(offset + 1).get().getStatus());
    }

    executorService.shutdown();
  }

  @Test
  void shouldBeAbleToHandleARequest() {
    AtomicInteger count = new AtomicInteger(0);
    AppServer server =
        new NettyAppServer(
            req -> {
              count.incrementAndGet();
              return new HttpResponse();
            });
    server.start();

    URI uri = URI.create(server.whereIs("/"));
    HttpRequest request =
        new HttpRequest(GET, String.format(REQUEST_PATH, uri.getHost(), uri.getPort()));
    HttpResponse response = client.execute(request);

    assertThat(response).extracting(HttpResponse::getStatus).isEqualTo(HTTP_OK);

    assertThat(count).hasValue(1);
    server.stop();
  }

  @Test
  void shouldBeAbleToRetryARequestOnInternalServerError() {
    AtomicInteger count = new AtomicInteger(0);
    AppServer server =
        new NettyAppServer(
            req -> {
              count.incrementAndGet();
              if (count.get() <= 2) {
                return new HttpResponse().setStatus(500);
              } else {
                return new HttpResponse();
              }
            });
    server.start();

    URI uri = URI.create(server.whereIs("/"));
    HttpRequest request =
        new HttpRequest(GET, String.format(REQUEST_PATH, uri.getHost(), uri.getPort()));
    HttpResponse response = client.execute(request);

    assertThat(response).extracting(HttpResponse::getStatus).isEqualTo(HTTP_OK);
    assertThat(count).hasValue(3);

    server.stop();
  }

  @Test
  void shouldBeAbleToGetTheErrorResponseOnInternalServerError() {
    AtomicInteger count = new AtomicInteger(0);
    AppServer server =
        new NettyAppServer(
            req -> {
              count.incrementAndGet();
              return new HttpResponse().setStatus(500);
            });
    server.start();

    URI uri = URI.create(server.whereIs("/"));
    HttpRequest request =
        new HttpRequest(GET, String.format(REQUEST_PATH, uri.getHost(), uri.getPort()));
    HttpResponse response = client.execute(request);

    assertThat(response).extracting(HttpResponse::getStatus).isEqualTo(HTTP_INTERNAL_ERROR);
    assertThat(count.get()).isGreaterThanOrEqualTo(3);

    server.stop();
  }

  @Test
  void shouldNotRetryRequestOnInternalServerErrorWithContent() {
    AtomicInteger count = new AtomicInteger(0);
    AppServer server =
        new NettyAppServer(
            req -> {
              count.incrementAndGet();
              return new HttpResponse()
                  .setStatus(500)
                  .setContent(asJson(ImmutableMap.of("error", "non-transient")));
            });
    server.start();

    URI uri = URI.create(server.whereIs("/"));
    HttpRequest request =
        new HttpRequest(GET, String.format(REQUEST_PATH, uri.getHost(), uri.getPort()));
    HttpResponse response = client.execute(request);

    assertThat(response).extracting(HttpResponse::getStatus).isEqualTo(HTTP_INTERNAL_ERROR);
    assertThat(count).hasValue(1);

    server.stop();
  }

  @Test
  void shouldRetryRequestOnServerUnavailableError() {
    AtomicInteger count = new AtomicInteger(0);
    AppServer server =
        new NettyAppServer(
            req -> {
              count.incrementAndGet();
              if (count.get() <= 2) {
                return new HttpResponse()
                    .setStatus(503)
                    .setContent(asJson(ImmutableMap.of("error", "server down")));
              } else {
                return new HttpResponse();
              }
            });
    server.start();

    URI uri = URI.create(server.whereIs("/"));
    HttpRequest request =
        new HttpRequest(GET, String.format(REQUEST_PATH, uri.getHost(), uri.getPort()));
    HttpResponse response = client.execute(request);
    assertThat(response).extracting(HttpResponse::getStatus).isEqualTo(HTTP_OK);
    assertThat(count).hasValue(3);

    server.stop();
  }

  @Test
  void shouldGetTheErrorResponseOnServerUnavailableError() {
    AtomicInteger count = new AtomicInteger(0);
    AppServer server =
        new NettyAppServer(
            req -> {
              count.incrementAndGet();
              return new HttpResponse()
                  .setStatus(503)
                  .setContent(asJson(ImmutableMap.of("error", "server down")));
            });
    server.start();

    URI uri = URI.create(server.whereIs("/"));
    HttpRequest request =
        new HttpRequest(GET, String.format(REQUEST_PATH, uri.getHost(), uri.getPort()));
    HttpResponse response = client.execute(request);

    assertThat(response).extracting(HttpResponse::getStatus).isEqualTo(HTTP_UNAVAILABLE);
    assertThat(count).hasValue(3);

    server.stop();
  }

  @Test
  void shouldBeAbleToRetryARequestOnConnectionFailure() {
    AtomicInteger count = new AtomicInteger(0);
    HttpHandler handler =
        new RetryRequest()
            .andFinally(
                (HttpRequest request) -> {
                  if (count.getAndIncrement() < 2) {
                    throw new UncheckedIOException(new ConnectException());
                  } else {
                    return new HttpResponse();
                  }
                });

    HttpRequest request = new HttpRequest(GET, "/");
    HttpResponse response = handler.execute(request);

    assertThat(response).extracting(HttpResponse::getStatus).isEqualTo(HTTP_OK);
    assertThat(count).hasValue(3);
  }

  @Test
  void shouldRethrowOnConnectFailure() {
    AtomicInteger count = new AtomicInteger(0);
    AtomicReference<UncheckedIOException> lastThrown = new AtomicReference<>();
    HttpHandler handler =
        new RetryRequest()
            .andFinally(
                (HttpRequest request) -> {
                  count.getAndIncrement();
                  lastThrown.set(new UncheckedIOException(new ConnectException()));
                  throw lastThrown.get();
                });

    UncheckedIOException thrown =
        Assertions.assertThrows(
            UncheckedIOException.class, () -> handler.execute(new HttpRequest(GET, "/")));
    assertThat(thrown).isSameAs(lastThrown.get());
    assertThat(count).hasValue(4);
  }

  @Test
  void shouldDeliverUnmodifiedServerErrors() {
    AtomicInteger count = new AtomicInteger(0);
    AtomicReference<HttpResponse> lastResponse = new AtomicReference<>();
    HttpHandler handler =
        new RetryRequest()
            .andFinally(
                (HttpRequest request) -> {
                  count.getAndIncrement();
                  lastResponse.set(new HttpResponse().setStatus(500));
                  return lastResponse.get();
                });

    assertThat(handler.execute(new HttpRequest(GET, "/"))).isSameAs(lastResponse.get());
    assertThat(count).hasValue(3);
  }
}
