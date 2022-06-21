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

package org.openqa.selenium.grid.distributor;

import com.google.common.collect.ImmutableMap;
import com.google.common.collect.ImmutableSet;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.openqa.selenium.Capabilities;
import org.openqa.selenium.ImmutableCapabilities;
import org.openqa.selenium.NoSuchSessionException;
import org.openqa.selenium.SessionNotCreatedException;
import org.openqa.selenium.WebDriverException;
import org.openqa.selenium.events.EventBus;
import org.openqa.selenium.events.local.GuavaEventBus;
import org.openqa.selenium.grid.data.CreateSessionRequest;
import org.openqa.selenium.grid.data.CreateSessionResponse;
import org.openqa.selenium.grid.data.DefaultSlotMatcher;
import org.openqa.selenium.grid.data.NodeId;
import org.openqa.selenium.grid.data.NodeStatus;
import org.openqa.selenium.grid.data.NodeStatusEvent;
import org.openqa.selenium.grid.data.Session;
import org.openqa.selenium.grid.data.SessionClosedEvent;
import org.openqa.selenium.grid.data.Slot;
import org.openqa.selenium.grid.data.SlotId;
import org.openqa.selenium.grid.distributor.local.LocalDistributor;
import org.openqa.selenium.grid.distributor.remote.RemoteDistributor;
import org.openqa.selenium.grid.distributor.selector.DefaultSlotSelector;
import org.openqa.selenium.grid.node.CapabilityResponseEncoder;
import org.openqa.selenium.grid.node.HealthCheck;
import org.openqa.selenium.grid.node.Node;
import org.openqa.selenium.grid.node.local.LocalNode;
import org.openqa.selenium.grid.security.Secret;
import org.openqa.selenium.grid.sessionmap.local.LocalSessionMap;
import org.openqa.selenium.grid.sessionqueue.NewSessionQueue;
import org.openqa.selenium.grid.sessionqueue.local.LocalNewSessionQueue;
import org.openqa.selenium.grid.testing.PassthroughHttpClient;
import org.openqa.selenium.grid.testing.TestSessionFactory;
import org.openqa.selenium.grid.web.CombinedHandler;
import org.openqa.selenium.internal.Either;
import org.openqa.selenium.remote.SessionId;
import org.openqa.selenium.remote.http.HttpRequest;
import org.openqa.selenium.remote.http.HttpResponse;
import org.openqa.selenium.remote.tracing.DefaultTestTracer;
import org.openqa.selenium.remote.tracing.Tracer;
import org.openqa.selenium.support.ui.FluentWait;
import org.openqa.selenium.support.ui.Wait;

import java.net.MalformedURLException;
import java.net.URI;
import java.net.URISyntaxException;
import java.net.URL;
import java.time.Duration;
import java.time.Instant;
import java.util.HashMap;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.UUID;
import java.util.function.Function;

import static com.google.common.collect.Iterables.getOnlyElement;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.openqa.selenium.grid.data.Availability.UP;
import static org.openqa.selenium.remote.Dialect.W3C;

public class AddingNodesTest {

  private static final Capabilities CAPS = new ImmutableCapabilities("cheese", "gouda");
  private static final Secret registrationSecret = new Secret("caerphilly");

  private Distributor distributor;
  private Tracer tracer;
  private EventBus bus;
  private Wait<Object> wait;
  private URL externalUrl;
  private CombinedHandler handler;
  private Capabilities stereotype;
  private LocalSessionMap sessions;
  private NewSessionQueue queue;

  @BeforeEach
  public void setUpDistributor() throws MalformedURLException {
    tracer = DefaultTestTracer.createTracer();
    bus = new GuavaEventBus();

    handler = new CombinedHandler();
    externalUrl = new URL("http://example.com");

    sessions = new LocalSessionMap(tracer, bus);
    queue = new LocalNewSessionQueue(
      tracer,
      new DefaultSlotMatcher(),
      Duration.ofSeconds(2),
      Duration.ofSeconds(2),
      registrationSecret);

    stereotype = new ImmutableCapabilities("browserName", "gouda");

    wait = new FluentWait<>(
      new Object()).ignoring(Throwable.class).withTimeout(Duration.ofSeconds(2));
  }

  @Test
  public void shouldBeAbleToRegisterALocalNode() throws URISyntaxException {
    URI sessionUri = new URI("http://example:1234");
    Node node = LocalNode
      .builder(tracer, bus, externalUrl.toURI(), externalUrl.toURI(), registrationSecret)
        .add(
          CAPS,
          new TestSessionFactory(
            (id, caps) -> new Session(id, sessionUri, stereotype, caps, Instant.now())))
        .build();

    Distributor local = new LocalDistributor(
      tracer,
      bus,
      new PassthroughHttpClient.Factory(node),
      sessions,
      queue,
      new DefaultSlotSelector(),
      registrationSecret,
      Duration.ofMinutes(5),
      false,
      Duration.ofSeconds(5));

    distributor = new RemoteDistributor(tracer, new PassthroughHttpClient.Factory(local), externalUrl, registrationSecret);

    distributor.add(node);

    wait.until(obj -> distributor.getStatus().hasCapacity());

    NodeStatus status = getOnlyElement(distributor.getStatus().getNodes());
    assertEquals(1, getStereotypes(status).get(CAPS).intValue());
  }

  @Test
  public void shouldBeAbleToRegisterACustomNode() throws URISyntaxException {
    URI sessionUri = new URI("http://example:1234");
    Node node = new CustomNode(
        bus,
        new NodeId(UUID.randomUUID()),
        externalUrl.toURI(),
        c -> new Session(
          new SessionId(UUID.randomUUID()), sessionUri, stereotype, c, Instant.now()));

    Distributor local = new LocalDistributor(
      tracer,
      bus,
      new PassthroughHttpClient.Factory(node),
      sessions,
      queue,
      new DefaultSlotSelector(),
      registrationSecret,
      Duration.ofMinutes(5),
      false,
      Duration.ofSeconds(5));

    distributor = new RemoteDistributor(tracer, new PassthroughHttpClient.Factory(local), externalUrl, registrationSecret);

    distributor.add(node);

    wait.until(obj -> distributor.getStatus().hasCapacity());

    NodeStatus status = getOnlyElement(distributor.getStatus().getNodes());
    assertEquals(1, getStereotypes(status).get(CAPS).intValue());
  }

  @Test
  public void shouldBeAbleToRegisterNodesByListeningForEvents() throws URISyntaxException {
    URI sessionUri = new URI("http://example:1234");
    Node node = LocalNode
      .builder(tracer, bus, externalUrl.toURI(), externalUrl.toURI(), registrationSecret)
        .add(
          CAPS,
          new TestSessionFactory(
            (id, caps) -> new Session(id, sessionUri, stereotype, caps, Instant.now())))
        .build();

    Distributor local = new LocalDistributor(
      tracer,
      bus,
      new PassthroughHttpClient.Factory(node),
      sessions,
      queue,
      new DefaultSlotSelector(),
      registrationSecret,
      Duration.ofMinutes(5),
      false,
      Duration.ofSeconds(5));

    distributor = new RemoteDistributor(tracer, new PassthroughHttpClient.Factory(local), externalUrl, registrationSecret);

    bus.fire(new NodeStatusEvent(node.getStatus()));

    wait.until(obj -> distributor.getStatus().hasCapacity());

    NodeStatus status = getOnlyElement(distributor.getStatus().getNodes());
    assertEquals(1, getStereotypes(status).get(CAPS).intValue());
  }

  @Test
  public void shouldKeepOnlyOneNodeWhenTwoRegistrationsHaveTheSameUriByListeningForEvents()
    throws URISyntaxException {
    URI sessionUri = new URI("http://example:1234");
    Node firstNode = LocalNode
      .builder(tracer, bus, externalUrl.toURI(), externalUrl.toURI(), registrationSecret)
      .add(
        CAPS,
        new TestSessionFactory(
          (id, caps) -> new Session(id, sessionUri, stereotype, caps, Instant.now())))
      .build();
    Node secondNode = LocalNode
      .builder(tracer, bus, externalUrl.toURI(), externalUrl.toURI(), registrationSecret)
      .add(
        CAPS,
        new TestSessionFactory(
          (id, caps) -> new Session(id, sessionUri, stereotype, caps, Instant.now())))
      .build();
    handler.addHandler(firstNode);
    handler.addHandler(secondNode);

    Distributor local = new LocalDistributor(
      tracer,
      bus,
      new PassthroughHttpClient.Factory(handler),
      sessions,
      queue,
      new DefaultSlotSelector(),
      registrationSecret,
      Duration.ofMinutes(5),
      false,
      Duration.ofSeconds(5));

    distributor = new RemoteDistributor(tracer, new PassthroughHttpClient.Factory(local), externalUrl, registrationSecret);

    bus.fire(new NodeStatusEvent(firstNode.getStatus()));
    bus.fire(new NodeStatusEvent(secondNode.getStatus()));

    wait.until(obj -> distributor.getStatus());

    Set<NodeStatus> nodes = distributor.getStatus().getNodes();

    assertEquals(1, nodes.size());
  }

  @Test
  public void distributorShouldUpdateStateOfExistingNodeWhenNodePublishesStateChange()
      throws URISyntaxException {
    URI sessionUri = new URI("http://example:1234");
    Node node = LocalNode
      .builder(tracer, bus, externalUrl.toURI(), externalUrl.toURI(), registrationSecret)
        .add(
          CAPS,
          new TestSessionFactory(
            (id, caps) -> new Session(id, sessionUri, stereotype, caps, Instant.now())))
        .build();

    Distributor local = new LocalDistributor(
      tracer,
      bus,
      new PassthroughHttpClient.Factory(node),
      sessions,
      queue,
      new DefaultSlotSelector(),
      registrationSecret,
      Duration.ofMinutes(5),
      false,
      Duration.ofSeconds(5));

    distributor = new RemoteDistributor(tracer, new PassthroughHttpClient.Factory(local), externalUrl, registrationSecret);

    bus.fire(new NodeStatusEvent(node.getStatus()));

    // Start empty
    wait.until(obj -> distributor.getStatus().hasCapacity());

    NodeStatus nodeStatus = getOnlyElement(distributor.getStatus().getNodes());
    assertEquals(1, getStereotypes(nodeStatus).get(CAPS).intValue());

    // Craft a status that makes it look like the node is busy, and post it on the bus.
    NodeStatus status = node.getStatus();
    NodeStatus crafted = new NodeStatus(
      status.getNodeId(),
      status.getExternalUri(),
      status.getMaxSessionCount(),
      ImmutableSet.of(
        new Slot(
          new SlotId(status.getNodeId(), UUID.randomUUID()),
          CAPS,
          Instant.now(),
          new Session(
            new SessionId(UUID.randomUUID()), sessionUri, CAPS, CAPS, Instant.now()))),
      UP,
      Duration.ofSeconds(10),
      status.getVersion(),
      status.getOsInfo());

    bus.fire(new NodeStatusEvent(crafted));

    // We claimed the only slot is filled. Life is good.
    wait.until(obj -> !distributor.getStatus().hasCapacity());
  }

  private Map<Capabilities, Integer> getStereotypes(NodeStatus status) {
    Map<Capabilities, Integer> stereotypes = new HashMap<>();

    for (Slot slot : status.getSlots()) {
      int count = stereotypes.getOrDefault(slot.getStereotype(), 0);
      count++;
      stereotypes.put(slot.getStereotype(), count);
    }

    return ImmutableMap.copyOf(stereotypes);
  }

  static class CustomNode extends Node {

    private final EventBus bus;
    private final Function<Capabilities, Session> factory;
    private Session running;

    protected CustomNode(
        EventBus bus,
        NodeId nodeId,
        URI uri,
        Function<Capabilities, Session> factory) {
      super(DefaultTestTracer.createTracer(), nodeId, uri, registrationSecret);

      this.bus = bus;
      this.factory = Objects.requireNonNull(factory);
    }

    @Override
    public boolean isReady() {
      return true;
    }

    @Override
    public Either<WebDriverException, CreateSessionResponse> newSession(CreateSessionRequest sessionRequest) {
      Objects.requireNonNull(sessionRequest);

      if (running != null) {
        return Either.left(new SessionNotCreatedException("Session already exists"));
      }
      Session session = factory.apply(sessionRequest.getDesiredCapabilities());
      running = session;
      return Either.right(
        new CreateSessionResponse(
          session,
          CapabilityResponseEncoder.getEncoder(W3C).apply(session)));
    }

    @Override
    public HttpResponse executeWebDriverCommand(HttpRequest req) {
      throw new UnsupportedOperationException("executeWebDriverCommand");
    }

    @Override
    public HttpResponse uploadFile(HttpRequest req, SessionId id) {
      throw new UnsupportedOperationException("uploadFile");
    }

    @Override
    public Session getSession(SessionId id) throws NoSuchSessionException {
      if (running == null || !running.getId().equals(id)) {
        throw new NoSuchSessionException();
      }

      return running;
    }

    @Override
    public void stop(SessionId id) throws NoSuchSessionException {
      getSession(id);
      running = null;

      bus.fire(new SessionClosedEvent(id));
    }

    @Override
    public boolean isSessionOwner(SessionId id) {
      return running != null && running.getId().equals(id);
    }

    @Override
    public boolean isSupporting(Capabilities capabilities) {
      return Objects.equals("cake", capabilities.getCapability("cheese"));
    }

    @Override
    public NodeStatus getStatus() {
      Session sess = null;
      if (running != null) {
        try {
          sess = new Session(
            running.getId(),
            new URI("http://localhost:14568"),
            CAPS,
            running.getCapabilities(),
            Instant.now());
        } catch (URISyntaxException e) {
          throw new RuntimeException(e);
        }
      }

      return new NodeStatus(
        getId(),
        getUri(),
        1,
        ImmutableSet.of(
          new Slot(
            new SlotId(getId(), UUID.randomUUID()),
            CAPS,
            Instant.now(),
            sess)),
        UP,
        Duration.ofSeconds(10),
        getNodeVersion(),
        getOsInfo());
    }

    @Override
    public HealthCheck getHealthCheck() {
      return () -> new HealthCheck.Result(UP, "tl;dr");
    }

    @Override
    public void drain() {
    }
  }

}
