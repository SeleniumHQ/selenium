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

package org.openqa.selenium.grid.router;

import static java.net.HttpURLConnection.HTTP_INTERNAL_ERROR;
import static java.net.HttpURLConnection.HTTP_OK;
import static java.util.concurrent.TimeUnit.SECONDS;
import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.fail;
import static org.openqa.selenium.remote.http.Contents.asJson;
import static org.openqa.selenium.remote.http.HttpMethod.DELETE;
import static org.openqa.selenium.remote.http.HttpMethod.POST;

import com.google.common.collect.ImmutableMap;
import java.net.MalformedURLException;
import java.net.URI;
import java.net.URISyntaxException;
import java.time.Duration;
import java.time.Instant;
import java.util.Arrays;
import java.util.List;
import java.util.concurrent.Callable;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeoutException;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.openqa.selenium.Capabilities;
import org.openqa.selenium.ImmutableCapabilities;
import org.openqa.selenium.events.EventBus;
import org.openqa.selenium.events.local.GuavaEventBus;
import org.openqa.selenium.grid.config.MapConfig;
import org.openqa.selenium.grid.data.DefaultSlotMatcher;
import org.openqa.selenium.grid.data.Session;
import org.openqa.selenium.grid.distributor.Distributor;
import org.openqa.selenium.grid.distributor.local.LocalDistributor;
import org.openqa.selenium.grid.distributor.selector.DefaultSlotSelector;
import org.openqa.selenium.grid.node.local.LocalNode;
import org.openqa.selenium.grid.security.AddSecretFilter;
import org.openqa.selenium.grid.security.Secret;
import org.openqa.selenium.grid.server.BaseServerOptions;
import org.openqa.selenium.grid.server.Server;
import org.openqa.selenium.grid.sessionmap.SessionMap;
import org.openqa.selenium.grid.sessionmap.local.LocalSessionMap;
import org.openqa.selenium.grid.sessionqueue.NewSessionQueue;
import org.openqa.selenium.grid.sessionqueue.local.LocalNewSessionQueue;
import org.openqa.selenium.grid.testing.PassthroughHttpClient;
import org.openqa.selenium.grid.testing.TestSessionFactory;
import org.openqa.selenium.grid.web.CombinedHandler;
import org.openqa.selenium.grid.web.RoutableHttpClientFactory;
import org.openqa.selenium.net.PortProber;
import org.openqa.selenium.netty.server.NettyServer;
import org.openqa.selenium.remote.http.HttpClient;
import org.openqa.selenium.remote.http.HttpHandler;
import org.openqa.selenium.remote.http.HttpRequest;
import org.openqa.selenium.remote.http.HttpResponse;
import org.openqa.selenium.remote.tracing.DefaultTestTracer;
import org.openqa.selenium.remote.tracing.Tracer;

class SessionQueueGridTest {
  private static final Capabilities CAPS = new ImmutableCapabilities("browserName", "cheese");
  private HttpClient.Factory clientFactory;
  private Secret registrationSecret;
  private Server<?> server;
  private EventBus bus;

  private static Server<?> createServer(HttpHandler handler) {
    return new NettyServer(
        new BaseServerOptions(
            new MapConfig(
                ImmutableMap.of("server", ImmutableMap.of("port", PortProber.findFreePort())))),
        handler);
  }

  @BeforeEach
  public void setup() throws URISyntaxException, MalformedURLException {
    Tracer tracer = DefaultTestTracer.createTracer();
    bus = new GuavaEventBus();
    int nodePort = PortProber.findFreePort();
    URI nodeUri = new URI("http://localhost:" + nodePort);
    CombinedHandler handler = new CombinedHandler();
    clientFactory =
        new RoutableHttpClientFactory(nodeUri.toURL(), handler, HttpClient.Factory.createDefault());

    registrationSecret = new Secret("cheese");

    SessionMap sessions = new LocalSessionMap(tracer, bus);
    NewSessionQueue queue =
        new LocalNewSessionQueue(
            tracer,
            new DefaultSlotMatcher(),
            Duration.ofSeconds(5),
            Duration.ofSeconds(60),
            registrationSecret,
            5);
    handler.addHandler(queue);

    LocalNode localNode =
        LocalNode.builder(tracer, bus, nodeUri, nodeUri, registrationSecret)
            .add(
                CAPS,
                new TestSessionFactory(
                    (id, caps) ->
                        new Session(id, nodeUri, new ImmutableCapabilities(), caps, Instant.now())))
            .add(
                CAPS,
                new TestSessionFactory(
                    (id, caps) ->
                        new Session(id, nodeUri, new ImmutableCapabilities(), caps, Instant.now())))
            .maximumConcurrentSessions(5)
            .build();
    handler.addHandler(localNode);

    Distributor distributor =
        new LocalDistributor(
            tracer,
            bus,
            new PassthroughHttpClient.Factory(localNode),
            sessions,
            queue,
            new DefaultSlotSelector(),
            registrationSecret,
            Duration.ofMinutes(5),
            false,
            Duration.ofSeconds(5),
            Runtime.getRuntime().availableProcessors(),
            new DefaultSlotMatcher());
    handler.addHandler(distributor);

    distributor.add(localNode);

    Router router = new Router(tracer, clientFactory, sessions, queue, distributor);

    server = createServer(router);
    server.start();
  }

  @Test
  void shouldBeAbleToCreateMultipleSessions() {
    ImmutableMap<String, String> caps = ImmutableMap.of("browserName", "cheese");
    ExecutorService fixedThreadPoolService = Executors.newFixedThreadPool(2);
    ScheduledExecutorService scheduler = Executors.newSingleThreadScheduledExecutor();

    try {
      Callable<HttpResponse> sessionCreationTask = () -> createSession(caps);
      List<Future<HttpResponse>> futureList =
          fixedThreadPoolService.invokeAll(Arrays.asList(sessionCreationTask, sessionCreationTask));

      for (Future<HttpResponse> future : futureList) {
        HttpResponse httpResponse = future.get(10, SECONDS);
        assertThat(httpResponse.getStatus()).isEqualTo(HTTP_OK);
      }
    } catch (InterruptedException e) {
      fail("Unable to create session. Thread Interrupted");
    } catch (ExecutionException e) {
      fail("Unable to create session due to execution exception.");
    } catch (TimeoutException e) {
      fail("Unable to create session. Timeout occurred.");
    } finally {
      fixedThreadPoolService.shutdownNow();
      scheduler.shutdownNow();
    }
  }

  @Test
  void shouldBeAbleToRejectRequest() {
    // Grid has no slots for the requested capabilities
    HttpResponse httpResponse = createSession(ImmutableMap.of("browserName", "burger"));
    assertThat(httpResponse.getStatus()).isEqualTo(HTTP_INTERNAL_ERROR);
  }

  @Test
  void shouldBeAbleToClearQueue() {
    ImmutableMap<String, String> caps = ImmutableMap.of("browserName", "cheese");
    ExecutorService fixedThreadPoolService = Executors.newFixedThreadPool(1);
    ScheduledExecutorService scheduler = Executors.newSingleThreadScheduledExecutor();

    // The grid has two slots with same capabilities.
    // Two sessions can be created successfully.
    // Third session request will be waiting in the queue since Grid is full.
    try {
      Callable<HttpResponse> sessionCreationTask = () -> createSession(caps);

      HttpResponse firstSessionResponse =
          fixedThreadPoolService.submit(sessionCreationTask).get(20, SECONDS);
      assertThat(firstSessionResponse.getStatus()).isEqualTo(HTTP_OK);

      HttpResponse secondSessionResponse =
          fixedThreadPoolService.submit(sessionCreationTask).get(20, SECONDS);
      assertThat(secondSessionResponse.getStatus()).isEqualTo(HTTP_OK);

      Future<HttpResponse> thirdSessionFuture = fixedThreadPoolService.submit(sessionCreationTask);

      Callable<HttpResponse> clearTask =
          () -> {
            HttpRequest request = new HttpRequest(DELETE, "/se/grid/newsessionqueue/queue");
            HttpClient client = clientFactory.createClient(server.getUrl());
            return client.with(new AddSecretFilter(registrationSecret)).execute(request);
          };

      Future<HttpResponse> clearQueueResponse = scheduler.schedule(clearTask, 3, SECONDS);

      // Clearing the new session request will cancel the third session request in the queue.
      clearQueueResponse.get(10, SECONDS);

      HttpResponse thirdSessionResponse = thirdSessionFuture.get();
      assertThat(thirdSessionResponse.getStatus()).isEqualTo(HTTP_INTERNAL_ERROR);
    } catch (InterruptedException e) {
      fail("Unable to create session. Thread Interrupted");
    } catch (ExecutionException e) {
      fail("Unable to create session due to execution exception.");
    } catch (TimeoutException e) {
      fail("Unable to create session. Timeout occurred.");
    } finally {
      fixedThreadPoolService.shutdownNow();
      scheduler.shutdownNow();
    }
  }

  @AfterEach
  public void stopServer() {
    bus.close();
    server.stop();
  }

  private HttpResponse createSession(ImmutableMap<String, String> caps) {
    HttpRequest request = new HttpRequest(POST, "/session");
    request.setContent(
        asJson(ImmutableMap.of("capabilities", ImmutableMap.of("alwaysMatch", caps))));

    try (HttpClient client = clientFactory.createClient(server.getUrl())) {
      return client.execute(request);
    }
  }
}
