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
import static org.junit.Assert.assertEquals;
import static org.junit.Assert.fail;
import static org.openqa.selenium.remote.http.Contents.asJson;
import static org.openqa.selenium.remote.http.HttpMethod.DELETE;
import static org.openqa.selenium.remote.http.HttpMethod.POST;

import com.google.common.collect.ImmutableMap;

import java.net.MalformedURLException;
import java.net.URI;
import java.net.URISyntaxException;
import java.time.Duration;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Arrays;
import java.util.List;
import java.util.concurrent.Callable;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeoutException;

import org.junit.After;
import org.junit.Before;
import org.junit.Test;
import org.openqa.selenium.Capabilities;
import org.openqa.selenium.ImmutableCapabilities;
import org.openqa.selenium.events.EventBus;
import org.openqa.selenium.events.local.GuavaEventBus;
import org.openqa.selenium.grid.config.MapConfig;
import org.openqa.selenium.grid.data.Session;
import org.openqa.selenium.grid.distributor.Distributor;
import org.openqa.selenium.grid.distributor.local.LocalDistributor;
import org.openqa.selenium.grid.node.local.LocalNode;
import org.openqa.selenium.grid.security.Secret;
import org.openqa.selenium.grid.server.BaseServerOptions;
import org.openqa.selenium.grid.server.Server;
import org.openqa.selenium.grid.sessionmap.SessionMap;
import org.openqa.selenium.grid.sessionmap.local.LocalSessionMap;
import org.openqa.selenium.grid.sessionqueue.NewSessionQueue;
import org.openqa.selenium.grid.sessionqueue.NewSessionQueuer;
import org.openqa.selenium.grid.sessionqueue.local.LocalNewSessionQueue;
import org.openqa.selenium.grid.sessionqueue.local.LocalNewSessionQueuer;
import org.openqa.selenium.grid.testing.TestSessionFactory;
import org.openqa.selenium.grid.web.CombinedHandler;
import org.openqa.selenium.grid.web.RoutableHttpClientFactory;
import org.openqa.selenium.netty.server.NettyServer;
import org.openqa.selenium.remote.http.HttpClient;
import org.openqa.selenium.remote.http.HttpHandler;
import org.openqa.selenium.remote.http.HttpRequest;
import org.openqa.selenium.remote.http.HttpResponse;
import org.openqa.selenium.remote.tracing.DefaultTestTracer;
import org.openqa.selenium.remote.tracing.Tracer;

public class SessionQueueGridTest {
  private static final Capabilities CAPS = new ImmutableCapabilities("browserName", "cheese");
  private HttpClient.Factory clientFactory;
  private Server<?> server;

  @Before
  public void setup() throws URISyntaxException, MalformedURLException {
    Tracer tracer = DefaultTestTracer.createTracer();
    EventBus bus = new GuavaEventBus();
    URI nodeUri = new URI("http://localhost:4444");
    CombinedHandler handler = new CombinedHandler();
    clientFactory = new RoutableHttpClientFactory(
      nodeUri.toURL(), handler,
      HttpClient.Factory.createDefault());

    SessionMap sessions = new LocalSessionMap(tracer, bus);
    handler.addHandler(sessions);
    NewSessionQueue localNewSessionQueue = new LocalNewSessionQueue(
      tracer,
      bus,
      Duration.of(5, ChronoUnit.SECONDS),
      Duration.of(10, ChronoUnit.SECONDS));
    NewSessionQueuer queuer = new LocalNewSessionQueuer(tracer, bus, localNewSessionQueue);
    handler.addHandler(queuer);

    Secret registrationSecret = new Secret("hereford hop");
    Distributor distributor = new LocalDistributor(
      tracer,
      bus,
      clientFactory,
      sessions,
      queuer,
      registrationSecret);
    handler.addHandler(distributor);

    LocalNode localNode = LocalNode.builder(tracer, bus, nodeUri, nodeUri, registrationSecret)
      .add(CAPS, new TestSessionFactory((id, caps) -> new Session(
        id,
        nodeUri,
        new ImmutableCapabilities(),
        caps,
        Instant.now())))
      .add(CAPS, new TestSessionFactory((id, caps) -> new Session(
        id,
        nodeUri,
        new ImmutableCapabilities(),
        caps,
        Instant.now()))).build();
    handler.addHandler(localNode);
    distributor.add(localNode);

    Router router = new Router(tracer, clientFactory, sessions, queuer, distributor);

    server = createServer(router);
    server.start();
  }

  @Test
  public void shouldBeAbleToCreateMultipleSessions() {
    ImmutableMap<String, String> caps = ImmutableMap.of("browserName", "cheese");
    ExecutorService fixedThreadPoolService = Executors.newFixedThreadPool(2);
    ScheduledExecutorService scheduler = Executors.newSingleThreadScheduledExecutor();

    try {
      Callable<HttpResponse> sessionCreationTask = () -> createSession(caps);
      List<Future<HttpResponse>> futureList = fixedThreadPoolService.invokeAll(Arrays.asList(
        sessionCreationTask,
        sessionCreationTask));

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
  public void shouldBeAbleToRejectRequest() {
    // Grid has no slots for the requested capabilities
    HttpResponse httpResponse = createSession(ImmutableMap.of("browserName", "burger"));
    assertThat(httpResponse.getStatus()).isEqualTo(HTTP_INTERNAL_ERROR);
  }

  @Test
  public void shouldBeAbleToClearQueue() {
    ImmutableMap<String, String> caps = ImmutableMap.of("browserName", "cheese");
    ExecutorService fixedThreadPoolService = Executors.newFixedThreadPool(2);
    ScheduledExecutorService scheduler = Executors.newSingleThreadScheduledExecutor();

    // The grid has two slots with same capabilities.
    // Two sessions can be created successfully.
    // Third session request will be retried.
    try {
      Callable<HttpResponse> sessionCreationTask = () -> createSession(caps);

      List<Future<HttpResponse>> futureList = fixedThreadPoolService.invokeAll(Arrays.asList(
        sessionCreationTask,
        sessionCreationTask,
        sessionCreationTask));

      Callable<HttpResponse> clearTask = () -> {
        HttpRequest request = new HttpRequest(DELETE, "/se/grid/newsessionqueuer/queue");
        HttpClient client = clientFactory.createClient(server.getUrl());
        return client.execute(request);
      };

      Future<HttpResponse> clearQueueResponse = scheduler.schedule(clearTask, 3, SECONDS);

      // Clearing the new session request will cancel the third session request in the queue.
      clearQueueResponse.get(10, SECONDS);

      int failureCount = 0;
      int successCount = 0;
      for (Future<HttpResponse> future : futureList) {
        HttpResponse httpResponse = future.get(40, SECONDS);

        if (httpResponse.getStatus() == HTTP_OK) {
          successCount++;
        }
        if (httpResponse.getStatus() == HTTP_INTERNAL_ERROR) {
          failureCount++;
        }
      }

      assertEquals(failureCount, 1);
      assertEquals(successCount, 2);

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

  @After
  public void stopServer() {
    server.stop();
  }

  private static Server<?> createServer(HttpHandler handler) {
    return new NettyServer(
      new BaseServerOptions(
        new MapConfig(ImmutableMap.of("server", ImmutableMap.of("port", 4444)))),
      handler);
  }

  private HttpResponse createSession(ImmutableMap<String, String> caps) {
    HttpRequest request = new HttpRequest(POST, "/session");
    request.setContent(asJson(
      ImmutableMap.of(
        "capabilities", ImmutableMap.of(
          "alwaysMatch", caps))));

    HttpClient client = clientFactory.createClient(server.getUrl());
    return client.execute(request);
  }
}
