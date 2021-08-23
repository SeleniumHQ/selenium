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

package org.openqa.selenium.grid.distributor.local;

import static java.util.Collections.newSetFromMap;
import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.fail;
import static org.openqa.selenium.grid.data.Availability.DRAINING;
import static org.openqa.selenium.grid.data.Availability.UP;
import static org.openqa.selenium.remote.Dialect.W3C;
import static org.openqa.selenium.remote.http.HttpMethod.GET;

import org.junit.Before;
import org.junit.Test;
import org.openqa.selenium.Capabilities;
import org.openqa.selenium.ImmutableCapabilities;
import org.openqa.selenium.SessionNotCreatedException;
import org.openqa.selenium.events.EventBus;
import org.openqa.selenium.events.local.GuavaEventBus;
import org.openqa.selenium.grid.data.CreateSessionResponse;
import org.openqa.selenium.grid.data.DefaultSlotMatcher;
import org.openqa.selenium.grid.data.DistributorStatus;
import org.openqa.selenium.grid.data.NodeStatus;
import org.openqa.selenium.grid.data.RequestId;
import org.openqa.selenium.grid.data.Session;
import org.openqa.selenium.grid.data.SessionRequest;
import org.openqa.selenium.grid.distributor.Distributor;
import org.openqa.selenium.grid.distributor.selector.DefaultSlotSelector;
import org.openqa.selenium.grid.node.HealthCheck;
import org.openqa.selenium.grid.node.Node;
import org.openqa.selenium.grid.node.local.LocalNode;
import org.openqa.selenium.grid.security.Secret;
import org.openqa.selenium.grid.sessionmap.local.LocalSessionMap;
import org.openqa.selenium.grid.sessionqueue.NewSessionQueue;
import org.openqa.selenium.grid.sessionqueue.local.LocalNewSessionQueue;
import org.openqa.selenium.grid.testing.PassthroughHttpClient;
import org.openqa.selenium.grid.testing.TestSessionFactory;
import org.openqa.selenium.internal.Either;
import org.openqa.selenium.remote.HttpSessionId;
import org.openqa.selenium.remote.SessionId;
import org.openqa.selenium.remote.http.HttpHandler;
import org.openqa.selenium.remote.http.HttpRequest;
import org.openqa.selenium.remote.http.HttpResponse;
import org.openqa.selenium.remote.tracing.DefaultTestTracer;
import org.openqa.selenium.remote.tracing.Tracer;
import org.openqa.selenium.support.ui.FluentWait;
import org.openqa.selenium.support.ui.Wait;

import java.io.UncheckedIOException;
import java.net.URI;
import java.net.URISyntaxException;
import java.time.Duration;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import java.util.concurrent.Callable;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;
import java.util.concurrent.TimeUnit;

public class LocalDistributorTest {

  private final Secret registrationSecret = new Secret("bavarian smoked");
  private Tracer tracer;
  private EventBus bus;
  private URI uri;
  private Node localNode;
  private Wait<Object> wait;

  @Before
  public void setUp() throws URISyntaxException {
    tracer = DefaultTestTracer.createTracer();
    bus = new GuavaEventBus();

    Capabilities caps = new ImmutableCapabilities("browserName", "cheese");
    uri = new URI("http://localhost:1234");
    localNode = LocalNode.builder(tracer, bus, uri, uri, registrationSecret)
      .add(caps, new TestSessionFactory((id, c) -> new Handler(c)))
      .maximumConcurrentSessions(2)
      .build();

    wait = new FluentWait<>(
      new Object()).ignoring(Throwable.class).withTimeout(Duration.ofSeconds(5));
  }

  @Test
  public void testAddNodeToDistributor() {
    NewSessionQueue queue  = new LocalNewSessionQueue(
      tracer,
      bus,
      new DefaultSlotMatcher(),
      Duration.ofSeconds(2),
      Duration.ofSeconds(2),
      registrationSecret);
    Distributor distributor = new LocalDistributor(
      tracer,
      bus,
      new PassthroughHttpClient.Factory(localNode),
      new LocalSessionMap(tracer, bus),
      queue,
      new DefaultSlotSelector(),
      registrationSecret,
      Duration.ofMinutes(5),
      false);
    distributor.add(localNode);
    DistributorStatus status = distributor.getStatus();

    //Check the size
    final Set<NodeStatus> nodes = status.getNodes();
    assertThat(nodes.size()).isEqualTo(1);

    //Check a couple attributes
    NodeStatus distributorNode = nodes.iterator().next();
    assertThat(distributorNode.getNodeId()).isEqualByComparingTo(localNode.getId());
    assertThat(distributorNode.getExternalUri()).isEqualTo(uri);
  }

  @Test
  public void testRemoveNodeFromDistributor() {
    NewSessionQueue queue  = new LocalNewSessionQueue(
      tracer,
      bus,
      new DefaultSlotMatcher(),
      Duration.ofSeconds(2),
      Duration.ofSeconds(2),
      registrationSecret);
    Distributor distributor = new LocalDistributor(
      tracer,
      bus,
      new PassthroughHttpClient.Factory(localNode),
      new LocalSessionMap(tracer, bus),
      queue,
      new DefaultSlotSelector(),
      registrationSecret,
      Duration.ofMinutes(5),
      false);
    distributor.add(localNode);

    //Check the size
    DistributorStatus statusBefore = distributor.getStatus();
    final Set<NodeStatus> nodesBefore = statusBefore.getNodes();
    assertThat(nodesBefore.size()).isEqualTo(1);

    //Recheck the status--should be zero
    distributor.remove(localNode.getId());
    DistributorStatus statusAfter = distributor.getStatus();
    final Set<NodeStatus> nodesAfter = statusAfter.getNodes();
    assertThat(nodesAfter.size()).isEqualTo(0);
  }

  @Test
  public void testAddSameNodeTwice() {
    NewSessionQueue queue  = new LocalNewSessionQueue(
      tracer,
      bus,
      new DefaultSlotMatcher(),
      Duration.ofSeconds(2),
      Duration.ofSeconds(2),
      registrationSecret);
    Distributor distributor = new LocalDistributor(
      tracer,
      bus,
      new PassthroughHttpClient.Factory(localNode),
      new LocalSessionMap(tracer, bus),
      queue,
      new DefaultSlotSelector(),
      registrationSecret,
      Duration.ofMinutes(5),
      false);
    distributor.add(localNode);
    distributor.add(localNode);
    DistributorStatus status = distributor.getStatus();

    //Should only be one node after dupe check
    final Set<NodeStatus> nodes = status.getNodes();
    assertThat(nodes.size()).isEqualTo(1);
  }

  @Test
  public void shouldBeAbleToAddMultipleSessionsConcurrently() throws Exception {
    NewSessionQueue queue  = new LocalNewSessionQueue(
      tracer,
      bus,
      new DefaultSlotMatcher(),
      Duration.ofSeconds(2),
      Duration.ofSeconds(2),
      registrationSecret);


    // Add one node to ensure that everything is created in that.
    Capabilities caps = new ImmutableCapabilities("browserName", "cheese");

    class VerifyingHandler extends Session implements HttpHandler {
      private VerifyingHandler(SessionId id, Capabilities capabilities) {
        super(id, uri, new ImmutableCapabilities(), capabilities, Instant.now());
      }

      @Override
      public HttpResponse execute(HttpRequest req) {
        Optional<SessionId> id = HttpSessionId.getSessionId(req.getUri()).map(SessionId::new);
        assertThat(id).isEqualTo(Optional.of(getId()));
        return new HttpResponse();
      }
    }

    // Only use one node.
    Node node = LocalNode.builder(tracer, bus, uri, uri, registrationSecret)
      .add(caps, new TestSessionFactory(VerifyingHandler::new))
      .add(caps, new TestSessionFactory(VerifyingHandler::new))
      .add(caps, new TestSessionFactory(VerifyingHandler::new))
      .maximumConcurrentSessions(3)
      .advanced()
      .healthCheck(() -> new HealthCheck.Result(UP, "UP!"))
      .build();

    LocalDistributor distributor = new LocalDistributor(
      tracer,
      bus,
      new PassthroughHttpClient.Factory(node),
      new LocalSessionMap(tracer, bus),
      queue,
      new DefaultSlotSelector(),
      registrationSecret,
      Duration.ofMinutes(5),
      false);

    distributor.add(node);
    wait.until(obj -> distributor.getStatus().hasCapacity());

    SessionRequest sessionRequest =
        new SessionRequest(
            new RequestId(UUID.randomUUID()),
            Instant.now(),
            Set.of(W3C),
            Set.of(new ImmutableCapabilities("browserName", "cheese")),
            Map.of(),
            Map.of());

    List<Callable<SessionId>> callables = new ArrayList<>();
    for (int i = 0; i < 3; i++) {
      callables.add(() -> {
        Either<SessionNotCreatedException, CreateSessionResponse> result =
          distributor.newSession(sessionRequest);
        if (result.isRight()) {
          CreateSessionResponse res = result.right();
          assertThat(res.getSession().getCapabilities().getBrowserName()).isEqualTo("cheese");
          return res.getSession().getId();
        } else {
          fail("Session creation failed", result.left());
        }
        return null;
      });
    }

    List<Future<SessionId>> futures = Executors.newFixedThreadPool(3).invokeAll(callables);

    for (Future<SessionId> future : futures) {
      SessionId id = future.get(2, TimeUnit.SECONDS);

      // Now send a random command.
      HttpResponse res = node.execute(new HttpRequest(GET, String.format("/session/%s/url", id)));
      assertThat(res.isSuccessful()).isTrue();
    }
  }


  @Test
  public void testDrainNodeFromDistributor() {
    NewSessionQueue queue  = new LocalNewSessionQueue(
      tracer,
      bus,
      new DefaultSlotMatcher(),
      Duration.ofSeconds(2),
      Duration.ofSeconds(2),
      registrationSecret);
    Distributor distributor = new LocalDistributor(
      tracer,
      bus,
      new PassthroughHttpClient.Factory(localNode),
      new LocalSessionMap(tracer, bus),
      queue,
      new DefaultSlotSelector(),
      registrationSecret,
      Duration.ofMinutes(5),
      false);
    distributor.add(localNode);
    assertThat(localNode.isDraining()).isFalse();

    //Check the size - there should be one node
    DistributorStatus statusBefore = distributor.getStatus();
    Set<NodeStatus> nodesBefore = statusBefore.getNodes();
    assertThat(nodesBefore.size()).isEqualTo(1);
    NodeStatus nodeBefore = nodesBefore.iterator().next();
    assertThat(nodeBefore.getAvailability()).isNotEqualTo(DRAINING);

    distributor.drain(localNode.getId());
    assertThat(localNode.isDraining()).isTrue();

    //Recheck the status - there should still be no node, it is removed
    DistributorStatus statusAfter = distributor.getStatus();
    Set<NodeStatus> nodesAfter = statusAfter.getNodes();
    assertThat(nodesAfter.size()).isEqualTo(0);
  }

  @Test
  public void testDrainNodeFromNode() {
    assertThat(localNode.isDraining()).isFalse();

    NewSessionQueue queue  = new LocalNewSessionQueue(
      tracer,
      bus,
      new DefaultSlotMatcher(),
      Duration.ofSeconds(2),
      Duration.ofSeconds(2),
      registrationSecret);
    Distributor distributor = new LocalDistributor(
      tracer,
      bus,
      new PassthroughHttpClient.Factory(localNode),
      new LocalSessionMap(tracer, bus),
      queue,
      new DefaultSlotSelector(),
      registrationSecret,
      Duration.ofMinutes(5),
      false);
    distributor.add(localNode);

    localNode.drain();
    assertThat(localNode.isDraining()).isTrue();
  }

  @Test
  public void slowStartingNodesShouldNotCauseReservationsToBeSerialized() {
    NewSessionQueue queue  = new LocalNewSessionQueue(
      tracer,
      bus,
      new DefaultSlotMatcher(),
      Duration.ofSeconds(2),
      Duration.ofSeconds(2),
      registrationSecret);

    LocalDistributor distributor = new LocalDistributor(
      tracer,
      bus,
      new PassthroughHttpClient.Factory(localNode),
      new LocalSessionMap(tracer, bus),
      queue,
      new DefaultSlotSelector(),
      registrationSecret,
      Duration.ofMinutes(5),
      false);

    Capabilities caps = new ImmutableCapabilities("browserName", "cheese");

    long delay = 4000;
    LocalNode node = LocalNode.builder(tracer, bus, uri, uri, registrationSecret)
      .add(caps, new TestSessionFactory(caps, (id, c) -> {
        try {
          Thread.sleep(delay);
        } catch (InterruptedException e) {
          e.printStackTrace();
        }
        return new Handler(c);
      }))
      .build();

    distributor.add(node);

    Set<Future<Either<SessionNotCreatedException, CreateSessionResponse>>> futures =
      newSetFromMap(new ConcurrentHashMap<>());
    ExecutorService service = Executors.newFixedThreadPool(2);

    long start = System.currentTimeMillis();
    futures.add(
      service.submit(() -> distributor.newSession(new SessionRequest(
        new RequestId(UUID.randomUUID()),
        Instant.now(),
        Set.of(W3C),
        Set.of(caps),
        Map.of(),
        Map.of()))));
    futures.add(
      service.submit(() -> distributor.newSession(new SessionRequest(
        new RequestId(UUID.randomUUID()),
        Instant.now(),
        Set.of(W3C),
        Set.of(caps),
        Map.of(),
        Map.of()))));

    futures.forEach(f -> {
      try {
        f.get();
      } catch (InterruptedException e) {
        fail("Interrupted");
      } catch (ExecutionException e) {
        throw new RuntimeException(e);
      }
    });

    // If the sessions are created serially, then we expect the first
    // session to take up to `delay` ms to complete, followed by the
    // second session.
    assertThat(System.currentTimeMillis() - start).isLessThan(delay * 2);
  }

  private class Handler extends Session implements HttpHandler {

    private Handler(Capabilities capabilities) {
      super(new SessionId(UUID.randomUUID()), uri, new ImmutableCapabilities(), capabilities, Instant.now());
    }

    @Override
    public HttpResponse execute(HttpRequest req) throws UncheckedIOException {
      return new HttpResponse();
    }
  }
}
