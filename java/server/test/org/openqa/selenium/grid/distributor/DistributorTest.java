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

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatExceptionOfType;
import static org.assertj.core.api.Assertions.fail;

import org.junit.Before;
import org.junit.Ignore;
import org.junit.Test;
import org.openqa.selenium.Capabilities;
import org.openqa.selenium.ImmutableCapabilities;
import org.openqa.selenium.MutableCapabilities;
import org.openqa.selenium.NoSuchSessionException;
import org.openqa.selenium.SessionNotCreatedException;
import org.openqa.selenium.events.EventBus;
import org.openqa.selenium.events.zeromq.ZeroMqEventBus;
import org.openqa.selenium.grid.component.HealthCheck;
import org.openqa.selenium.grid.data.Session;
import org.openqa.selenium.grid.distributor.local.LocalDistributor;
import org.openqa.selenium.grid.distributor.remote.RemoteDistributor;
import org.openqa.selenium.grid.node.Node;
import org.openqa.selenium.grid.node.local.LocalNode;
import org.openqa.selenium.grid.sessionmap.SessionMap;
import org.openqa.selenium.grid.sessionmap.local.LocalSessionMap;
import org.openqa.selenium.grid.web.CommandHandler;
import org.openqa.selenium.grid.web.NoHandler;
import org.openqa.selenium.grid.web.PassthroughHttpClient;
import org.openqa.selenium.json.Json;
import org.openqa.selenium.net.PortProber;
import org.openqa.selenium.remote.NewSessionPayload;
import org.openqa.selenium.remote.SessionId;
import org.openqa.selenium.remote.http.HttpClient;
import org.openqa.selenium.remote.http.HttpRequest;
import org.openqa.selenium.remote.http.HttpResponse;
import org.openqa.selenium.remote.tracing.DistributedTracer;
import org.openqa.selenium.support.ui.FluentWait;
import org.openqa.selenium.support.ui.Wait;
import org.zeromq.ZContext;

import java.io.IOException;
import java.net.MalformedURLException;
import java.net.URI;
import java.net.URISyntaxException;
import java.net.URL;
import java.time.Duration;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicBoolean;
import java.util.function.Predicate;

public class DistributorTest {

  private DistributedTracer tracer;
  private EventBus bus;
  private HttpClient.Factory clientFactory;
  private Distributor local;
  private Distributor distributor;
  private ImmutableCapabilities caps;

  @Before
  public void setUp() throws MalformedURLException {
    tracer = DistributedTracer.builder().build();
    bus = ZeroMqEventBus.create(
        new ZContext(),
        "inproc://distributor-test-pub",
        "inproc://distributor-test-sub",
        true);
    clientFactory = HttpClient.Factory.createDefault();
    LocalSessionMap sessions = new LocalSessionMap(tracer, bus);
    local = new LocalDistributor(tracer, bus, HttpClient.Factory.createDefault(), sessions);
    distributor = new RemoteDistributor(
        tracer,
        new PassthroughHttpClient.Factory<>(local),
        new URL("http://does.not.exist/"));

    caps = new ImmutableCapabilities("browserName", "cheese");
  }

  @Test
  public void creatingANewSessionWithoutANodeEndsInFailure() {
    try (NewSessionPayload payload = NewSessionPayload.create(caps)) {
      assertThatExceptionOfType(SessionNotCreatedException.class)
          .isThrownBy(() -> distributor.newSession(payload));
    }
  }

  @Test
  public void shouldBeAbleToAddANodeAndCreateASession() throws URISyntaxException {
    URI nodeUri = new URI("http://example:5678");
    URI routableUri = new URI("http://localhost:1234");

    LocalSessionMap sessions = new LocalSessionMap(tracer, bus);
    LocalNode node = LocalNode.builder(tracer, bus, clientFactory, routableUri)
        .add(caps, c -> new Session(new SessionId(UUID.randomUUID()), nodeUri, c))
        .build();

    Distributor distributor = new LocalDistributor(
        tracer,
        bus,
        new PassthroughHttpClient.Factory<>(node),
        sessions);
    distributor.add(node);

    MutableCapabilities sessionCaps = new MutableCapabilities(caps);
    sessionCaps.setCapability("sausages", "gravy");
    try (NewSessionPayload payload = NewSessionPayload.create(sessionCaps)) {
      Session session = distributor.newSession(payload);

      assertThat(session.getCapabilities()).isEqualTo(sessionCaps);
      assertThat(session.getUri()).isEqualTo(routableUri);
    }
  }

  @Test
  public void creatingASessionAddsItToTheSessionMap() throws URISyntaxException {
    URI nodeUri = new URI("http://example:5678");
    URI routableUri = new URI("http://localhost:1234");

    LocalSessionMap sessions = new LocalSessionMap(tracer, bus);
    LocalNode node = LocalNode.builder(tracer, bus, clientFactory, routableUri)
        .add(caps, c -> new Session(new SessionId(UUID.randomUUID()), nodeUri, c))
        .build();

    Distributor distributor = new LocalDistributor(
        tracer,
        bus,
        new PassthroughHttpClient.Factory<>(node),
        sessions);
    distributor.add(node);

    MutableCapabilities sessionCaps = new MutableCapabilities(caps);
    sessionCaps.setCapability("sausages", "gravy");
    try (NewSessionPayload payload = NewSessionPayload.create(sessionCaps)) {
      Session returned = distributor.newSession(payload);

      Session session = sessions.get(returned.getId());
      assertThat(session.getCapabilities()).isEqualTo(sessionCaps);
      assertThat(session.getUri()).isEqualTo(routableUri);
    }
  }

  @Test
  public void shouldBeAbleToRemoveANode() throws URISyntaxException, MalformedURLException {
    URI nodeUri = new URI("http://example:5678");
    URI routableUri = new URI("http://localhost:1234");

    LocalSessionMap sessions = new LocalSessionMap(tracer, bus);
    LocalNode node = LocalNode.builder(tracer, bus, clientFactory, routableUri)
        .add(caps, c -> new Session(new SessionId(UUID.randomUUID()), nodeUri, c))
        .build();

    Distributor local = new LocalDistributor(
        tracer,
        bus,
        new PassthroughHttpClient.Factory<>(node),
        sessions);
    distributor = new RemoteDistributor(
        tracer,
        new PassthroughHttpClient.Factory<>(local),
        new URL("http://does.not.exist"));
    distributor.add(node);
    distributor.remove(node.getId());

    try (NewSessionPayload payload = NewSessionPayload.create(caps)) {
      assertThatExceptionOfType(SessionNotCreatedException.class)
          .isThrownBy(() -> distributor.newSession(payload));
    }
  }

  @Test
  public void registeringTheSameNodeMultipleTimesOnlyCountsTheFirstTime()
      throws URISyntaxException {
    URI nodeUri = new URI("http://example:5678");
    URI routableUri = new URI("http://localhost:1234");

    LocalNode node = LocalNode.builder(tracer, bus, clientFactory, routableUri)
        .add(caps, c -> new Session(new SessionId(UUID.randomUUID()), nodeUri, c))
        .build();

    local.add(node);
    local.add(node);

    DistributorStatus status = local.getStatus();

    assertThat(status.getNodes().size()).isEqualTo(1);
  }

  @Test
  public void theMostLightlyLoadedNodeIsSelectedFirst() {
    // Create enough hosts so that we avoid the scheduler returning hosts in:
    // * insertion order
    // * reverse insertion order
    // * sorted with most heavily used first
    SessionMap sessions = new LocalSessionMap(tracer, bus);

    Node lightest = createNode(caps, 10, 0);
    Node medium = createNode(caps, 10, 4);
    Node heavy = createNode(caps, 10, 6);
    Node massive = createNode(caps, 10, 8);

    CombinedHandler handler = new CombinedHandler();
    handler.addHandler(lightest);
    handler.addHandler(medium);
    handler.addHandler(heavy);
    handler.addHandler(massive);
    Distributor distributor = new LocalDistributor(
        tracer,
        bus,
        new PassthroughHttpClient.Factory<>(handler),
        sessions)
        .add(heavy)
        .add(medium)
        .add(lightest)
        .add(massive);

    try (NewSessionPayload payload = NewSessionPayload.create(caps)) {
      Session session = distributor.newSession(payload);

      assertThat(session.getUri()).isEqualTo(lightest.getStatus().getUri());
    }
  }

  @Test
  public void shouldUseLastSessionCreatedTimeAsTieBreaker() {
    SessionMap sessions = new LocalSessionMap(tracer, bus);
    Node leastRecent = createNode(caps, 5, 0);

    CombinedHandler handler = new CombinedHandler();
    handler.addHandler(sessions);
    handler.addHandler(leastRecent);

    Distributor distributor = new LocalDistributor(
        tracer,
        bus,
        new PassthroughHttpClient.Factory<>(handler),
        sessions)
        .add(leastRecent);
    try (NewSessionPayload payload = NewSessionPayload.create(caps)) {
      distributor.newSession(payload);

      // Will be "leastRecent" by default
    }

    Node middle = createNode(caps, 5, 0);
    handler.addHandler(middle);
    distributor.add(middle);
    try (NewSessionPayload payload = NewSessionPayload.create(caps)) {
      Session session = distributor.newSession(payload);

      // Least lightly loaded is middle
      assertThat(session.getUri()).isEqualTo(middle.getStatus().getUri());
    }

    Node mostRecent = createNode(caps, 5, 0);
    handler.addHandler(mostRecent);
    distributor.add(mostRecent);
    try (NewSessionPayload payload = NewSessionPayload.create(caps)) {
      Session session = distributor.newSession(payload);

      // Least lightly loaded is most recent
      assertThat(session.getUri()).isEqualTo(mostRecent.getStatus().getUri());
    }

    // All the nodes should be equally loaded.
    Map<Capabilities, Integer> expected = mostRecent.getStatus().getAvailable();
    assertThat(leastRecent.getStatus().getAvailable()).isEqualTo(expected);
    assertThat(middle.getStatus().getAvailable()).isEqualTo(expected);

    // All nodes are now equally loaded. We should be going in time order now
    try (NewSessionPayload payload = NewSessionPayload.create(caps)) {
      Session session = distributor.newSession(payload);

      assertThat(session.getUri()).isEqualTo(leastRecent.getStatus().getUri());
    }
  }

  @Test
  public void shouldIncludeHostsThatAreUpInHostList() {
    CombinedHandler handler = new CombinedHandler();

    SessionMap sessions = new LocalSessionMap(tracer, bus);
    handler.addHandler(sessions);

    URI uri = createUri();
    Node alwaysDown = LocalNode.builder(tracer, bus, clientFactory, uri)
        .add(caps, caps -> new Session(new SessionId(UUID.randomUUID()), uri, caps))
        .advanced()
        .healthCheck(() -> new HealthCheck.Result(false, "Boo!"))
        .build();
    handler.addHandler(alwaysDown);

    UUID expected = UUID.randomUUID();
    Node alwaysUp = LocalNode.builder(tracer, bus, clientFactory, uri)
        .add(caps, caps -> new Session(new SessionId(expected), uri, caps))
        .advanced()
        .healthCheck(() -> new HealthCheck.Result(true, "Yay!"))
        .build();
    handler.addHandler(alwaysUp);

    LocalDistributor distributor = new LocalDistributor(
        tracer,
        bus,
        new PassthroughHttpClient.Factory<>(handler),
        sessions);
    handler.addHandler(distributor);
    distributor.add(alwaysDown);

    // Should be unable to create a session because the node is down.
    try (NewSessionPayload payload = NewSessionPayload.create(caps)) {
      assertThatExceptionOfType(SessionNotCreatedException.class)
          .isThrownBy(() -> distributor.newSession(payload));
    }

    distributor.add(alwaysUp);
    try (NewSessionPayload payload = NewSessionPayload.create(caps)) {
      distributor.newSession(payload);
    }
  }

  @Test
  public void shouldNotScheduleAJobIfAllSlotsAreBeingUsed() {
    SessionMap sessions = new LocalSessionMap(tracer, bus);

    CombinedHandler handler = new CombinedHandler();
    Distributor distributor = new LocalDistributor(
        tracer,
        bus,
        new PassthroughHttpClient.Factory<>(handler),
        sessions);
    handler.addHandler(distributor);

    Node node = createNode(caps, 1, 0);
    handler.addHandler(node);
    distributor.add(node);

    // Use up the one slot available
    try (NewSessionPayload payload = NewSessionPayload.create(caps)) {
      distributor.newSession(payload);
    }

    // Now try and create a session.
    try (NewSessionPayload payload = NewSessionPayload.create(caps)) {
      assertThatExceptionOfType(SessionNotCreatedException.class)
          .isThrownBy(() -> distributor.newSession(payload));
    }
  }

  @Test
  @Ignore("Slot is not returned at the moment")
  public void shouldReleaseSlotOnceSessionEnds() {
    SessionMap sessions = new LocalSessionMap(tracer, bus);

    CombinedHandler handler = new CombinedHandler();
    Distributor distributor = new LocalDistributor(
        tracer,
        bus,
        new PassthroughHttpClient.Factory<>(handler),
        sessions);
    handler.addHandler(distributor);

    Node node = createNode(caps, 1, 0);
    handler.addHandler(node);
    distributor.add(node);

    // Use up the one slot available
    Session session;
    try (NewSessionPayload payload = NewSessionPayload.create(caps)) {
       session = distributor.newSession(payload);
    }

    // Make sure the session map has the session
    sessions.get(session.getId());

    node.stop(session.getId());

    // Now wait for the session map to say the session is gone.
    Wait<Object> wait = new FluentWait<>(new Object()).withTimeout(Duration.ofSeconds(2));
    wait.until(obj -> {
      try {
        sessions.get(session.getId());
        return false;
      } catch (NoSuchSessionException e) {
        return true;
      }
    });

    // And we should now be able to create another session.
    try (NewSessionPayload payload = NewSessionPayload.create(caps)) {
      distributor.newSession(payload);
    }
  }

  @Test
  public void shouldNotStartASessionIfTheCapabilitiesAreNotSupported() {
    CombinedHandler handler = new CombinedHandler();

    LocalSessionMap sessions = new LocalSessionMap(tracer, bus);
    handler.addHandler(handler);

    Distributor distributor = new LocalDistributor(
        tracer,
        bus,
        new PassthroughHttpClient.Factory<>(handler),
        sessions);
    handler.addHandler(distributor);

    Node node = createNode(caps, 1, 0);
    handler.addHandler(node);
    distributor.add(node);

    ImmutableCapabilities unmatched = new ImmutableCapabilities("browserName", "transit of venus");
    try (NewSessionPayload payload = NewSessionPayload.create(unmatched)) {
      assertThatExceptionOfType(SessionNotCreatedException.class)
          .isThrownBy(() -> distributor.newSession(payload));
    }
  }

  @Test
  public void attemptingToStartASessionWhichFailsMarksAsTheSlotAsAvailable() {
    CombinedHandler handler = new CombinedHandler();

    SessionMap sessions = new LocalSessionMap(tracer, bus);
    handler.addHandler(sessions);

    Node node = LocalNode.builder(tracer, bus, clientFactory, createUri())
        .add(caps, caps -> {
          throw new SessionNotCreatedException("OMG");
        })
        .build();
    handler.addHandler(node);

    Distributor distributor = new LocalDistributor(
        tracer,
        bus,
        new PassthroughHttpClient.Factory<>(handler),
        sessions);
    handler.addHandler(distributor);
    distributor.add(node);

    try (NewSessionPayload payload = NewSessionPayload.create(caps)) {
      assertThatExceptionOfType(SessionNotCreatedException.class)
          .isThrownBy(() -> distributor.newSession(payload));
    }

    assertThat(distributor.getStatus().hasCapacity()).isTrue();
  }

  @Test
  public void shouldReturnNodesThatWereDownToPoolOfNodesOnceTheyMarkTheirHealthCheckPasses() {
    CombinedHandler handler = new CombinedHandler();

    SessionMap sessions = new LocalSessionMap(tracer, bus);
    handler.addHandler(sessions);

    AtomicBoolean isUp = new AtomicBoolean(false);

    URI uri = createUri();
    Node node = LocalNode.builder(tracer, bus, clientFactory, uri)
        .add(caps, caps -> new Session(new SessionId(UUID.randomUUID()), uri, caps))
        .advanced()
        .healthCheck(() -> new HealthCheck.Result(isUp.get(), "TL;DR"))
        .build();
    handler.addHandler(node);

    LocalDistributor distributor = new LocalDistributor(
        tracer,
        bus,
        new PassthroughHttpClient.Factory<>(handler),
        sessions);
    handler.addHandler(distributor);
    distributor.add(node);

    // Should be unable to create a session because the node is down.
    try (NewSessionPayload payload = NewSessionPayload.create(caps)) {
      assertThatExceptionOfType(SessionNotCreatedException.class)
          .isThrownBy(() -> distributor.newSession(payload));
    }

    // Mark the node as being up
    isUp.set(true);
    // Kick the machinery to ensure that everything is fine.
    distributor.refresh();

    // Because the node is now up and running, we should now be able to create a session
    try (NewSessionPayload payload = NewSessionPayload.create(caps)) {
      distributor.newSession(payload);
    }
  }

  @Test
  @Ignore
  public void shouldPriotizeHostsWithTheMostSlotsAvailableForASessionType() {
    // Consider the case where you have 1 Windows machine and 5 linux machines. All of these hosts
    // can run Chrome and Firefox sessions, but only one can run Edge sessions. Ideally, the machine
    // able to run Edge would be sorted last.

    fail("Write me");
  }

  private Node createNode(Capabilities stereotype, int count, int currentLoad) {
    URI uri = createUri();
    LocalNode.Builder builder = LocalNode.builder(tracer, bus, clientFactory, uri);
    for (int i = 0; i < count; i++) {
      builder.add(stereotype, caps -> new HandledSession(uri, caps));
    }

    LocalNode node = builder.build();
    for (int i = 0; i < currentLoad; i++) {
      // Ignore the session. We're just creating load.
      node.newSession(stereotype);
    }

    return node;
  }

  private URI createUri() {
    try {
      return new URI("http://localhost:" + PortProber.findFreePort());
    } catch (URISyntaxException e) {
      throw new RuntimeException(e);
    }
  }

  class HandledSession extends Session implements CommandHandler {

    HandledSession(URI uri, Capabilities caps) {
      super(new SessionId(UUID.randomUUID()), uri, caps);
    }

    @Override
    public void execute(HttpRequest req, HttpResponse resp) {
      // no-op
    }
  }

  private static class CombinedHandler implements Predicate<HttpRequest>, CommandHandler {

    private final Map<Predicate<HttpRequest>, CommandHandler> handlers = new HashMap<>();

    <X extends Predicate<HttpRequest> & CommandHandler> void addHandler(X handler) {
      handlers.put(handler, handler);
    }

    @Override
    public boolean test(HttpRequest request) {
      return handlers.keySet().stream()
          .map(p -> p.test(request))
          .reduce(Boolean::logicalAnd)
          .orElse(false);
    }

    @Override
    public void execute(HttpRequest req, HttpResponse resp) throws IOException {
      handlers.entrySet().stream()
          .filter(entry -> entry.getKey().test(req))
          .findFirst()
          .map(Map.Entry::getValue)
          .orElse(new NoHandler(new Json()))
          .execute(req, resp);
    }
  }
}
