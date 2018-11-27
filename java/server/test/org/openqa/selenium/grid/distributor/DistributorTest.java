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
import org.openqa.selenium.SessionNotCreatedException;
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

import java.io.IOException;
import java.net.MalformedURLException;
import java.net.URI;
import java.net.URISyntaxException;
import java.net.URL;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;
import java.util.function.Predicate;

public class DistributorTest {

  private DistributedTracer tracer;
  private Distributor local;
  private Distributor distributor;
  private ImmutableCapabilities caps;

  @Before
  public void setUp() throws MalformedURLException {
    tracer = DistributedTracer.builder().build();
    local = new LocalDistributor(tracer, HttpClient.Factory.createDefault());
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
  public void shouldBeAbleToAddANodeAndCreateASession()
      throws URISyntaxException, MalformedURLException {
    URI nodeUri = new URI("http://example:5678");
    URI routableUri = new URI("http://localhost:1234");

    LocalSessionMap sessions = new LocalSessionMap(tracer);
    LocalNode node = LocalNode.builder(tracer, routableUri, sessions)
        .add(caps, c -> new Session(new SessionId(UUID.randomUUID()), nodeUri, c))
        .build();

    Distributor distributor = new LocalDistributor(
        tracer,
        new PassthroughHttpClient.Factory<>(node));
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
  public void shouldBeAbleToRemoveANode() throws URISyntaxException, MalformedURLException {
    URI nodeUri = new URI("http://example:5678");
    URI routableUri = new URI("http://localhost:1234");

    LocalSessionMap sessions = new LocalSessionMap(tracer);
    LocalNode node = LocalNode.builder(tracer, routableUri, sessions)
        .add(caps, c -> new Session(new SessionId(UUID.randomUUID()), nodeUri, c))
        .build();

    Distributor local = new LocalDistributor(tracer, new PassthroughHttpClient.Factory<>(node));
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

    LocalSessionMap sessions = new LocalSessionMap(tracer);
    LocalNode node = LocalNode.builder(tracer, routableUri, sessions)
        .add(caps, c -> new Session(new SessionId(UUID.randomUUID()), nodeUri, c))
        .build();

    local.add(node);
    local.add(node);

    DistributorStatus status = local.getStatus();

    assertThat(status.getNodes().size()).isEqualTo(1);
  }

  @Test
  public void theMostLightlyLoadedNodeIsSelectedFirst() throws URISyntaxException {
    // Create enough hosts so that we avoid the scheduler returning hosts in:
    // * insertion order
    // * reverse insertion order
    // * sorted with most heavily used first
    SessionMap sessions = new LocalSessionMap(tracer);

    Node lightest = createNode(sessions, caps, 10, 0);
    Node medium = createNode(sessions, caps, 10, 4);
    Node heavy = createNode(sessions, caps, 10, 6);
    Node massive = createNode(sessions, caps, 10, 8);

    CombinedHandler handler = new CombinedHandler();
    handler.addHandler(lightest);
    handler.addHandler(medium);
    handler.addHandler(heavy);
    handler.addHandler(massive);
    Distributor distributor = new LocalDistributor(tracer, new PassthroughHttpClient.Factory<>(handler))
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
    SessionMap sessions = new LocalSessionMap(tracer);
    Node leastRecent = createNode(sessions, caps, 5, 0);

    CombinedHandler handler = new CombinedHandler();
    handler.addHandler(sessions);
    handler.addHandler(leastRecent);

    Distributor distributor = new LocalDistributor(tracer, new PassthroughHttpClient.Factory<>(handler))
        .add(leastRecent);
    try (NewSessionPayload payload = NewSessionPayload.create(caps)) {
      distributor.newSession(payload);

      // Will be "leastRecent" by default
    }

    Node middle = createNode(sessions, caps, 5, 0);
    handler.addHandler(middle);
    distributor.add(middle);
    try (NewSessionPayload payload = NewSessionPayload.create(caps)) {
      Session session = distributor.newSession(payload);

      // Least lightly loaded is middle
      assertThat(session.getUri()).isEqualTo(middle.getStatus().getUri());
    }

    Node mostRecent = createNode(sessions, caps, 5, 0);
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

  @Ignore("TODO: Add health checks to nodes")
  @Test
  public void shouldIncludeHostsThatAreUpInHostList() {
  }

  @Test
  public void shouldNotScheduleAJobIfAllSlotsAreBeingUsed() {
    SessionMap sessions = new LocalSessionMap(tracer);

    CombinedHandler handler = new CombinedHandler();
    Distributor distributor = new LocalDistributor(tracer, new PassthroughHttpClient.Factory<>(handler));
    handler.addHandler(distributor);

    Node node = createNode(sessions, caps, 1, 0);
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

  @Ignore("TODO: allow nodes to indicate that sessions are done")
  @Test
  public void shouldReleaseSlotOnceSessionEnds() {
  }

  @Test
  public void shuldNotStartASessionIfTheCapabilitiesAreNotSupported() {
    CombinedHandler handler = new CombinedHandler();

    LocalSessionMap sessions = new LocalSessionMap(tracer);
    handler.addHandler(handler);

    Distributor distributor = new LocalDistributor(tracer, new PassthroughHttpClient.Factory<>(handler));
    handler.addHandler(distributor);

    Node node = createNode(sessions, caps, 1, 0);
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

    SessionMap sessions = new LocalSessionMap(tracer);
    handler.addHandler(sessions);

    Node node = LocalNode.builder(tracer, createUri(), sessions)
        .add(caps, caps -> {
          throw new SessionNotCreatedException("OMG");
        })
        .build();
    handler.addHandler(node);

    Distributor distributor = new LocalDistributor(tracer, new PassthroughHttpClient.Factory<>(handler));
    handler.addHandler(distributor);
    distributor.add(node);

    try (NewSessionPayload payload = NewSessionPayload.create(caps)) {
      assertThatExceptionOfType(SessionNotCreatedException.class)
          .isThrownBy(() -> distributor.newSession(payload));
    }

    assertThat(distributor.getStatus().hasCapacity()).isTrue();
  }

  @Ignore("TODO: add health checks to nodes")
  @Test
  public void selfHealingRemoteHostsAreRegisteredOnceTheyAreOkay() {
  }

  @Test
  @Ignore
  public void shouldPriotizeHostsWithTheMostSlotsAvailableForASessionType() {
    // Consider the case where you have 1 Windows machine and 5 linux machines. All of these hosts
    // can run Chrome and Firefox sessions, but only one can run Edge sessions. Ideally, the machine
    // able to run Edge would be sorted last.

    fail("Write me");
  }

  private Node createNode(SessionMap sessions, Capabilities stereotype, int count, int currentLoad) {
    URI uri = createUri();
    LocalNode.Builder builder = LocalNode.builder(tracer, uri, sessions);
    for (int i = 0; i < count; i++) {
      builder.add(stereotype, caps -> new Session(new SessionId(UUID.randomUUID()), uri, caps));
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

  private static class CombinedHandler implements Predicate<HttpRequest>, CommandHandler {

    private final Map<Predicate<HttpRequest>, CommandHandler> handlers = new HashMap<>();

    public <X extends Predicate<HttpRequest> & CommandHandler> void addHandler(X handler) {
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
