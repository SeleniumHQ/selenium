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

import com.google.common.collect.ImmutableMap;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.openqa.selenium.environment.webserver.AppServer;
import org.openqa.selenium.environment.webserver.NettyAppServer;
import org.openqa.selenium.remote.http.netty.NettyClient;

import java.net.MalformedURLException;
import java.net.URI;
import java.time.Duration;
import java.util.concurrent.atomic.AtomicInteger;

import static java.net.HttpURLConnection.HTTP_CLIENT_TIMEOUT;
import static java.net.HttpURLConnection.HTTP_INTERNAL_ERROR;
import static java.net.HttpURLConnection.HTTP_OK;
import static org.assertj.core.api.Assertions.assertThat;
import static org.openqa.selenium.remote.http.Contents.asJson;
import static org.openqa.selenium.remote.http.HttpMethod.GET;

public class RetryRequestTest {

  private HttpClient client;
  private static final String REQUEST_PATH = "http://%s:%s/hello";

  @BeforeEach
  public void setUp() throws MalformedURLException {
    ClientConfig config = ClientConfig.defaultConfig()
      .baseUrl(URI.create("http://localhost:2345").toURL())
      .withRetries()
      .readTimeout(Duration.ofSeconds(1));
    client = new NettyClient.Factory().createClient(config);
  }

  @Test
  public void shouldBeAbleToHandleARequest() {
    AtomicInteger count = new AtomicInteger(0);
    AppServer server = new NettyAppServer(req -> {
      count.incrementAndGet();
      return new HttpResponse();
    });
    server.start();

    URI uri = URI.create(server.whereIs("/"));
    HttpRequest request = new HttpRequest(
      GET,
      String.format(REQUEST_PATH, uri.getHost(), uri.getPort()));
    HttpResponse response = client.execute(request);

    assertThat(response).extracting(HttpResponse::getStatus).isEqualTo(HTTP_OK);

    assertThat(count.get()).isEqualTo(1);
    server.stop();
  }

  @Test
  public void shouldBeAbleToRetryARequestOnInternalServerError() {
    AtomicInteger count = new AtomicInteger(0);
    AppServer server = new NettyAppServer(req -> {
      count.incrementAndGet();
      if (count.get() <= 2) {
        return new HttpResponse().setStatus(500);
      } else {
        return new HttpResponse();
      }
    });
    server.start();

    URI uri = URI.create(server.whereIs("/"));
    HttpRequest request = new HttpRequest(
      GET,
      String.format(REQUEST_PATH, uri.getHost(), uri.getPort()));
    HttpResponse response = client.execute(request);

    assertThat(response).extracting(HttpResponse::getStatus).isEqualTo(HTTP_OK);
    assertThat(count.get()).isEqualTo(3);

    server.stop();
  }

  @Test
  public void shouldNotRetryRequestOnInternalServerErrorWithContent() {
    AtomicInteger count = new AtomicInteger(0);
    AppServer server = new NettyAppServer(req -> {
      count.incrementAndGet();
      return new HttpResponse()
        .setStatus(500)
        .setContent(asJson(ImmutableMap.of("error", "non-transient")));
    });
    server.start();

    URI uri = URI.create(server.whereIs("/"));
    HttpRequest request = new HttpRequest(
      GET,
      String.format(REQUEST_PATH, uri.getHost(), uri.getPort()));
    HttpResponse response = client.execute(request);

    assertThat(response).extracting(HttpResponse::getStatus).isEqualTo(HTTP_INTERNAL_ERROR);
    assertThat(count.get()).isEqualTo(1);

    server.stop();
  }

  @Test
  public void shouldRetryRequestOnServerUnavailableError() {
    AtomicInteger count = new AtomicInteger(0);
    AppServer server = new NettyAppServer(req -> {
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
    HttpRequest request = new HttpRequest(
      GET,
      String.format(REQUEST_PATH, uri.getHost(), uri.getPort()));
    HttpResponse response = client.execute(request);
    assertThat(response).extracting(HttpResponse::getStatus).isEqualTo(HTTP_OK);
    assertThat(count.get()).isEqualTo(3);

    server.stop();
  }

  @Test
  public void shouldBeAbleToRetryARequestOnTimeout() {
    AtomicInteger count = new AtomicInteger(0);
    AppServer server = new NettyAppServer(req -> {
      count.incrementAndGet();
      if (count.get() <= 3) {
        try {
          Thread.sleep(2000);
        } catch (InterruptedException e) {
          e.printStackTrace();
        }
      }
      return new HttpResponse();
    });
    server.start();

    URI uri = URI.create(server.whereIs("/"));
    HttpRequest request = new HttpRequest(
      GET,
      String.format(REQUEST_PATH, uri.getHost(), uri.getPort()));

    HttpResponse response = client.execute(request);
    assertThat(response).extracting(HttpResponse::getStatus).isEqualTo(HTTP_OK);
    assertThat(count.get()).isEqualTo(4);

    server.stop();
  }

  @Test
  public void shouldBeAbleToRetryARequestOnConnectionFailure() {
    AppServer server = new NettyAppServer(req -> new HttpResponse());

    URI uri = URI.create(server.whereIs("/"));
    HttpRequest request = new HttpRequest(
      GET,
      String.format(REQUEST_PATH, uri.getHost(), uri.getPort()));

    HttpResponse response = client.execute(request);
    assertThat(response).extracting(HttpResponse::getStatus).isEqualTo(HTTP_CLIENT_TIMEOUT);
  }
}
