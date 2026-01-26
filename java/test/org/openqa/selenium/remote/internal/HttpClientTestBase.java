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

package org.openqa.selenium.remote.internal;

import static java.util.stream.Collectors.toList;
import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatExceptionOfType;
import static org.openqa.selenium.json.Json.MAP_TYPE;
import static org.openqa.selenium.net.Urls.fromUri;
import static org.openqa.selenium.remote.http.HttpMethod.GET;

import java.net.URI;
import java.net.URL;
import java.net.http.HttpTimeoutException;
import java.time.Duration;
import java.util.List;
import java.util.Map;
import java.util.TreeMap;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.Future;
import java.util.concurrent.TimeUnit;
import java.util.logging.Logger;
import java.util.stream.StreamSupport;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;
import org.openqa.selenium.BuildInfo;
import org.openqa.selenium.Platform;
import org.openqa.selenium.TimeoutException;
import org.openqa.selenium.WebDriverException;
import org.openqa.selenium.environment.webserver.AppServer;
import org.openqa.selenium.environment.webserver.NettyAppServer;
import org.openqa.selenium.internal.Multimap;
import org.openqa.selenium.json.Json;
import org.openqa.selenium.remote.http.ClientConfig;
import org.openqa.selenium.remote.http.Contents;
import org.openqa.selenium.remote.http.HttpClient;
import org.openqa.selenium.remote.http.HttpHandler;
import org.openqa.selenium.remote.http.HttpRequest;
import org.openqa.selenium.remote.http.HttpResponse;

public abstract class HttpClientTestBase {

  protected abstract HttpClient.Factory createFactory();

  static volatile HttpHandler delegate;
  static AppServer server;

  private static final Logger LOG = Logger.getLogger(HttpClientTestBase.class.getName());

  @BeforeAll
  public static void setUp() {
    server = new NettyAppServer(req -> delegate.execute(req));
    server.start();
  }

  @AfterAll
  public static void tearDown() {
    server.stop();
  }

  @Test
  void responseShouldCaptureASingleHeader() {
    Multimap<String, String> headers = new Multimap<>();
    headers.put("Cake", "Delicious");

    HttpResponse response = getResponseWithHeaders(headers);

    String value = response.getHeader("Cake");
    assertThat(value).isEqualTo("Delicious");
  }

  /**
   * The HTTP Spec that it should be <a
   * href="https://www.w3.org/Protocols/rfc2616/rfc2616-sec4.html#sec4.2">safe to combine them </a>,
   * but things like the <a href="https://www.ietf.org/rfc/rfc2109.txt">cookie spec</a> make this
   * hard (notably when a legal value may contain a comma).
   */
  @Test
  void responseShouldKeepMultipleHeadersSeparate() {
    Multimap<String, String> headers = new Multimap<>();
    headers.put("Cheese", "Cheddar");
    headers.put("Cheese", "Brie, Gouda");

    HttpResponse response = getResponseWithHeaders(headers);

    List<String> values =
        StreamSupport.stream(response.getHeaders("Cheese").spliterator(), false).collect(toList());

    assertThat(values).contains("Cheddar");
    assertThat(values).contains("Brie, Gouda");
  }

  @Test
  void shouldAddUrlParameters() {
    HttpRequest request = new HttpRequest(GET, "/query");
    String value = request.getQueryParameter("cheese");
    assertThat(value).isNull();

    request.addQueryParameter("cheese", "brie");
    value = request.getQueryParameter("cheese");
    assertThat(value).isEqualTo("brie");
  }

  @Test
  void shouldSendSimpleQueryParameters() {
    HttpRequest request = new HttpRequest(GET, "/query");
    request.addQueryParameter("cheese", "cheddar");

    HttpResponse response = getQueryParameterResponse(request);
    Map<String, Object> values = new Json().toType(response.contentAsString(), MAP_TYPE);

    assertThat(values).containsEntry("cheese", List.of("cheddar"));
  }

  @Test
  void shouldEncodeParameterNamesAndValues() {
    HttpRequest request = new HttpRequest(GET, "/query");
    request.addQueryParameter("cheese type", "tasty cheese");

    HttpResponse response = getQueryParameterResponse(request);
    Map<String, Object> values = new Json().toType(response.contentAsString(), MAP_TYPE);

    assertThat(values).containsEntry("cheese type", List.of("tasty cheese"));
  }

  @Test
  void canAddMoreThanOneQueryParameter() {
    HttpRequest request = new HttpRequest(GET, "/query");
    request.addQueryParameter("cheese", "cheddar");
    request.addQueryParameter("cheese", "gouda");
    request.addQueryParameter("vegetable", "peas");

    HttpResponse response = getQueryParameterResponse(request);
    Map<String, Object> values = new Json().toType(response.contentAsString(), MAP_TYPE);

    assertThat(values).containsEntry("cheese", List.of("cheddar", "gouda"));
    assertThat(values).containsEntry("vegetable", List.of("peas"));
  }

  @Test
  void shouldAllowUrlsWithSchemesToBeUsed() throws Exception {
    delegate = req -> new HttpResponse().setContent(Contents.utf8String("Hello, World!"));

    // This is a terrible choice of URL
    try (HttpClient client = createFactory().createClient(new URL("http://example.com"))) {

      URI uri = URI.create(server.whereIs("/"));
      HttpRequest request =
          new HttpRequest(GET, String.format("http://%s:%s/hello", uri.getHost(), uri.getPort()));

      HttpResponse response = client.execute(request);

      assertThat(response.contentAsString()).isEqualTo("Hello, World!");
    }
  }

  @Test
  void shouldIncludeAUserAgentHeader() {
    HttpResponse response =
        executeWithinServer(
            new HttpRequest(GET, "/foo"),
            req -> new HttpResponse().setContent(Contents.utf8String(req.getHeader("user-agent"))));

    String label = new BuildInfo().getReleaseLabel();
    Platform platform = Platform.getCurrent();
    Platform family = platform.family() == null ? platform : platform.family();

    assertThat(response.contentAsString())
        .isEqualTo(String.format("selenium/%s (java %s)", label, family.toString().toLowerCase()));
  }

  @Test
  void shouldAllowConfigurationOfRequestTimeout() {
    assertThatExceptionOfType(TimeoutException.class)
        .isThrownBy(
            () ->
                executeWithinServer(
                    new HttpRequest(GET, "/foo"),
                    req -> {
                      try {
                        Thread.sleep(1000);
                      } catch (InterruptedException e) {
                        LOG.severe("Error during execution: " + e.getMessage());
                      }
                      return new HttpResponse()
                          .setContent(Contents.utf8String(req.getHeader("user-agent")));
                    },
                    ClientConfig.defaultConfig().readTimeout(Duration.ofMillis(500))));
  }

  @Test
  public void shouldAllowConfigurationFromSystemProperties() {
    delegate =
        req -> {
          try {
            Thread.sleep(3000);
          } catch (InterruptedException e) {
            throw new RuntimeException(e);
          }
          return new HttpResponse().setContent(Contents.utf8String("Connection timed out"));
        };
    try {
      System.setProperty("webdriver.httpclient.connectionTimeout", "1");
      System.setProperty("webdriver.httpclient.readTimeout", "2");
      System.setProperty("webdriver.httpclient.version", "HTTP_1_1");
      ClientConfig clientConfig = ClientConfig.defaultConfig();
      assertThat(clientConfig.connectionTimeout()).isEqualTo(Duration.ofSeconds(1));
      assertThat(clientConfig.readTimeout()).isEqualTo(Duration.ofSeconds(2));
      assertThat(clientConfig.version()).isEqualTo("HTTP_1_1");
      HttpClient client =
          createFactory().createClient(clientConfig.baseUri(URI.create(server.whereIs("/"))));
      HttpRequest request = new HttpRequest(GET, "/delayed");
      assertThatExceptionOfType(TimeoutException.class).isThrownBy(() -> client.execute(request));
    } finally {
      System.clearProperty("webdriver.httpclient.connectionTimeout");
      System.clearProperty("webdriver.httpclient.readTimeout");
      System.clearProperty("webdriver.httpclient.version");
    }
  }

  private ClientConfig prepareShouldStopTest(
      CountDownLatch executing, CountDownLatch interrupted, int timeout) {
    CountDownLatch unlock = new CountDownLatch(1);

    delegate =
        req -> {
          try {
            unlock.await(20, TimeUnit.SECONDS);
          } catch (InterruptedException ex) {
            Thread.currentThread().interrupt();
            throw new RuntimeException(ex);
          }

          return new HttpResponse();
        };

    return ClientConfig.defaultConfig()
        .withFilter(
            (handler) ->
                (request) -> {
                  try {
                    executing.countDown();
                    return handler.execute(request);
                  } catch (WebDriverException ex) {
                    if (ex.getCause() instanceof InterruptedException
                        || ex.getCause() instanceof HttpTimeoutException) {
                      interrupted.countDown();
                    }

                    throw ex;
                  } finally {
                    unlock.countDown();
                  }
                })
        .readTimeout(Duration.ofMillis(timeout));
  }

  @Test
  public void shouldStopRequestAfterTimeout() throws InterruptedException {
    CountDownLatch executing = new CountDownLatch(1);
    CountDownLatch interrupted = new CountDownLatch(1);
    ClientConfig clientConfig = prepareShouldStopTest(executing, interrupted, 400);

    try (HttpClient client =
        createFactory().createClient(clientConfig.baseUri(URI.create(server.whereIs("/"))))) {
      HttpRequest request = new HttpRequest(GET, "/delayed");

      assertThatExceptionOfType(TimeoutException.class).isThrownBy(() -> client.execute(request));
      assertThat(interrupted.await(800, TimeUnit.MILLISECONDS)).isTrue();
    }
  }

  @Test
  public void shouldStopAsyncRequestAfterTimeout() throws InterruptedException {
    CountDownLatch executing = new CountDownLatch(1);
    CountDownLatch interrupted = new CountDownLatch(1);
    ClientConfig clientConfig = prepareShouldStopTest(executing, interrupted, 400);

    try (HttpClient client =
        createFactory().createClient(clientConfig.baseUri(URI.create(server.whereIs("/"))))) {
      HttpRequest request = new HttpRequest(GET, "/delayed");
      // does intentionally not read the future
      client.executeAsync(request);
      assertThat(interrupted.await(800, TimeUnit.MILLISECONDS)).isTrue();
    }
  }

  @Test
  public void shouldStopRequestOnCancel() throws InterruptedException {
    CountDownLatch executing = new CountDownLatch(1);
    CountDownLatch interrupted = new CountDownLatch(1);
    CountDownLatch unlock = new CountDownLatch(1);
    ClientConfig clientConfig = prepareShouldStopTest(executing, interrupted, 4000);

    try (HttpClient client =
        createFactory().createClient(clientConfig.baseUri(URI.create(server.whereIs("/"))))) {
      HttpRequest request = new HttpRequest(GET, "/delayed");

      Future<?> future = client.executeAsync(request);

      assertThat(executing.await(800, TimeUnit.MILLISECONDS)).isTrue();
      assertThat(future.cancel(true)).isTrue();
      assertThat(interrupted.await(800, TimeUnit.MILLISECONDS)).isTrue();
      unlock.countDown();
    }
  }

  private HttpResponse getResponseWithHeaders(final Multimap<String, String> headers) {
    return executeWithinServer(
        new HttpRequest(GET, "/foo"),
        req -> {
          HttpResponse resp = new HttpResponse();
          headers.forEach(resp::addHeader);
          return resp;
        });
  }

  private HttpResponse getQueryParameterResponse(HttpRequest request) {
    return executeWithinServer(
        request,
        req -> {
          Map<String, Iterable<String>> params = new TreeMap<>();
          req.getQueryParameterNames()
              .forEach(name -> params.put(name, req.getQueryParameters(name)));

          return new HttpResponse().setContent(Contents.asJson(params));
        });
  }

  private HttpResponse executeWithinServer(HttpRequest request, HttpHandler handler) {
    delegate = handler;
    try (HttpClient client =
        createFactory().createClient(fromUri(URI.create(server.whereIs("/"))))) {
      return client.execute(request);
    }
  }

  private HttpResponse executeWithinServer(
      HttpRequest request, HttpHandler handler, ClientConfig config) {
    delegate = handler;
    HttpClient client =
        createFactory().createClient(config.baseUri(URI.create(server.whereIs("/"))));
    return client.execute(request);
  }
}
