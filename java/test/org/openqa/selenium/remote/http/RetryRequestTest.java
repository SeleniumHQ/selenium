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

import static java.net.HttpURLConnection.HTTP_CLIENT_TIMEOUT;
import static java.net.HttpURLConnection.HTTP_INTERNAL_ERROR;
import static java.net.HttpURLConnection.HTTP_OK;
import static java.net.HttpURLConnection.HTTP_UNAVAILABLE;
import static org.assertj.core.api.Assertions.assertThat;
import static org.openqa.selenium.remote.http.Contents.asJson;
import static org.openqa.selenium.remote.http.HttpMethod.GET;

import com.google.common.collect.ImmutableMap;
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

    ExecutorService executorService = Executors.newFixedThreadPool(2);
    List<Callable<HttpResponse>> tasks = new ArrayList<>();

    tasks.add(() -> client.execute(connectionTimeoutRequest));
    tasks.add(() -> handler2.execute(new HttpRequest(GET, "/")));

    List<Future<HttpResponse>> results = executorService.invokeAll(tasks);

    Assertions.assertEquals(HTTP_CLIENT_TIMEOUT, results.get(0).get().getStatus());

    Assertions.assertEquals(HTTP_UNAVAILABLE, results.get(1).get().getStatus());
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

    assertThat(count.get()).isEqualTo(1);
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
    assertThat(count.get()).isEqualTo(3);

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
    assertThat(count.get()).isEqualTo(1);

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
    assertThat(count.get()).isEqualTo(3);

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
    assertThat(count.get()).isEqualTo(3);

    server.stop();
  }

  @Test
  void shouldBeAbleToRetryARequestOnConnectionFailure() {
    AppServer server = new NettyAppServer(req -> new HttpResponse());

    URI uri = URI.create(server.whereIs("/"));
    HttpRequest request =
        new HttpRequest(GET, String.format(REQUEST_PATH, uri.getHost(), uri.getPort()));

    HttpResponse response = client.execute(request);
    assertThat(response).extracting(HttpResponse::getStatus).isEqualTo(HTTP_CLIENT_TIMEOUT);
  }
}
