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
import io.opentelemetry.OpenTelemetry;
import io.opentelemetry.trace.Tracer;
import org.junit.Before;
import org.junit.Ignore;
import org.junit.Test;
import org.openqa.selenium.Capabilities;
import org.openqa.selenium.ImmutableCapabilities;
import org.openqa.selenium.MutableCapabilities;
import org.openqa.selenium.NoSuchSessionException;
import org.openqa.selenium.SessionNotCreatedException;
import org.openqa.selenium.events.EventBus;
import org.openqa.selenium.events.Type;
import org.openqa.selenium.events.local.GuavaEventBus;
import org.openqa.selenium.grid.component.HealthCheck;
import org.openqa.selenium.grid.data.*;
import org.openqa.selenium.grid.distributor.local.LocalDistributor;
import org.openqa.selenium.grid.distributor.remote.RemoteDistributor;
import org.openqa.selenium.grid.node.Node;
import org.openqa.selenium.grid.node.local.LocalNode;
import org.openqa.selenium.grid.sessionmap.SessionMap;
import org.openqa.selenium.grid.sessionmap.local.LocalSessionMap;
import org.openqa.selenium.grid.testing.PassthroughHttpClient;
import org.openqa.selenium.grid.testing.TestSessionFactory;
import org.openqa.selenium.grid.web.CombinedHandler;
import org.openqa.selenium.net.PortProber;
import org.openqa.selenium.remote.Dialect;
import org.openqa.selenium.remote.NewSessionPayload;
import org.openqa.selenium.remote.SessionId;
import org.openqa.selenium.remote.http.HttpClient;
import org.openqa.selenium.remote.http.HttpHandler;
import org.openqa.selenium.remote.http.HttpRequest;
import org.openqa.selenium.remote.http.HttpResponse;
import org.openqa.selenium.support.ui.FluentWait;
import org.openqa.selenium.support.ui.Wait;

import java.io.IOException;
import java.io.UncheckedIOException;
import java.net.MalformedURLException;
import java.net.URI;
import java.net.URISyntaxException;
import java.net.URL;
import java.time.Duration;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.atomic.AtomicBoolean;
import java.util.logging.Logger;
import java.util.stream.Collectors;

import static java.util.concurrent.TimeUnit.SECONDS;
import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatExceptionOfType;
import static org.assertj.core.api.Assertions.fail;
import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertTrue;
import static org.openqa.selenium.remote.http.Contents.utf8String;
import static org.openqa.selenium.remote.http.HttpMethod.POST;

public class DistributorTest {

  private Tracer tracer;
  private EventBus bus;
  private HttpClient.Factory clientFactory;
  private Distributor local;
  private ImmutableCapabilities caps;
  private static final Logger LOG = Logger.getLogger("Distributor Test");

  @Before
  public void setUp() {
    tracer = OpenTelemetry.getTracerProvider().get("default");
    bus = new GuavaEventBus();
    clientFactory = HttpClient.Factory.createDefault();
    LocalSessionMap sessions = new LocalSessionMap(tracer, bus);
    local = new LocalDistributor(tracer, bus, HttpClient.Factory.createDefault(), sessions, null);

    caps = new ImmutableCapabilities("browserName", "cheese");
  }

  @Test
  public void creatingANewSessionWithoutANodeEndsInFailure() throws MalformedURLException {
    Distributor distributor = new RemoteDistributor(
        tracer,
        new PassthroughHttpClient.Factory(local),
        new URL("http://does.not.exist/"));

    try (NewSessionPayload payload = NewSessionPayload.create(caps)) {
      assertThatExceptionOfType(SessionNotCreatedException.class)
          .isThrownBy(() -> distributor.newSession(createRequest(payload)));
    }
  }

  @Test
  public void shouldBeAbleToAddANodeAndCreateASession() throws URISyntaxException {
    URI nodeUri = new URI("http://example:5678");
    URI routableUri = new URI("http://localhost:1234");

    LocalSessionMap sessions = new LocalSessionMap(tracer, bus);
    LocalNode node = LocalNode.builder(tracer, bus, clientFactory, routableUri, null)
        .add(caps, new TestSessionFactory((id, c) -> new Session(id, nodeUri, c)))
        .build();

    Distributor distributor = new LocalDistributor(
        tracer,
        bus,
        new PassthroughHttpClient.Factory(node),
        sessions,
        null);
    distributor.add(node);

    MutableCapabilities sessionCaps = new MutableCapabilities(caps);
    sessionCaps.setCapability("sausages", "gravy");
    try (NewSessionPayload payload = NewSessionPayload.create(sessionCaps)) {
      Session session = distributor.newSession(createRequest(payload)).getSession();

      assertThat(session.getCapabilities()).isEqualTo(sessionCaps);
      assertThat(session.getUri()).isEqualTo(routableUri);
    }
  }

  @Test
  public void creatingASessionAddsItToTheSessionMap() throws URISyntaxException {
    URI nodeUri = new URI("http://example:5678");
    URI routableUri = new URI("http://localhost:1234");

    LocalSessionMap sessions = new LocalSessionMap(tracer, bus);
    LocalNode node = LocalNode.builder(tracer, bus, clientFactory, routableUri, null)
        .add(caps, new TestSessionFactory((id, c) -> new Session(id, nodeUri, c)))
        .build();

    Distributor distributor = new LocalDistributor(
        tracer,
        bus,
        new PassthroughHttpClient.Factory(node),
        sessions,
        null);
    distributor.add(node);

    MutableCapabilities sessionCaps = new MutableCapabilities(caps);
    sessionCaps.setCapability("sausages", "gravy");
    try (NewSessionPayload payload = NewSessionPayload.create(sessionCaps)) {
      Session returned = distributor.newSession(createRequest(payload)).getSession();

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
    LocalNode node = LocalNode.builder(tracer, bus, clientFactory, routableUri, null)
        .add(caps, new TestSessionFactory((id, c) -> new Session(id, nodeUri, c)))
        .build();

    Distributor local = new LocalDistributor(
        tracer,
        bus,
        new PassthroughHttpClient.Factory(node),
        sessions,
        null);
    Distributor distributor = new RemoteDistributor(
        tracer,
        new PassthroughHttpClient.Factory(local),
        new URL("http://does.not.exist"));
    distributor.add(node);
    distributor.remove(node.getId());

    try (NewSessionPayload payload = NewSessionPayload.create(caps)) {
      assertThatExceptionOfType(SessionNotCreatedException.class)
          .isThrownBy(() -> distributor.newSession(createRequest(payload)));
    }
  }

  @Test
  public void registeringTheSameNodeMultipleTimesOnlyCountsTheFirstTime()
      throws URISyntaxException {
    URI nodeUri = new URI("http://example:5678");
    URI routableUri = new URI("http://localhost:1234");

    LocalNode node = LocalNode.builder(tracer, bus, clientFactory, routableUri, null)
        .add(caps, new TestSessionFactory((id, c) -> new Session(id, nodeUri, c)))
        .build();

    local.add(node);
    local.add(node);

    DistributorStatus status = local.getStatus();

    assertThat(status.getNodes().size()).isEqualTo(1);
  }

  @Test
  public void registeringTheWrongRegistrationSecretDoesNotWork()
    throws URISyntaxException, InterruptedException {
    URI nodeUri = new URI("http://example:5678");
    URI routableUri = new URI("http://localhost:1234");

    Type rejected = new Type("node-rejected");
    CountDownLatch latch = new CountDownLatch(1);
    bus.addListener(rejected, e -> latch.countDown());

    LocalNode node = LocalNode.builder(tracer, bus, clientFactory, routableUri, "pickles")
      .add(caps, new TestSessionFactory((id, c) -> new Session(id, nodeUri, c)))
      .build();

    local.add(node);

    latch.await(1, SECONDS);

    assertThat(latch.getCount()).isEqualTo(1);
  }

  @Test
  public void registeringTheCorrectRegistrationSecretWorks()
    throws URISyntaxException, InterruptedException {
    URI nodeUri = new URI("http://example:5678");
    URI routableUri = new URI("http://localhost:1234");

    Type rejected = new Type("node-added");
    CountDownLatch latch = new CountDownLatch(1);
    bus.addListener(rejected, e -> latch.countDown());

    LocalNode node = LocalNode.builder(tracer, bus, clientFactory, routableUri, null)
      .add(caps, new TestSessionFactory((id, c) -> new Session(id, nodeUri, c)))
      .build();

    local.add(node);

    latch.await(1, SECONDS);

    assertThat(latch.getCount()).isEqualTo(0);
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
        new PassthroughHttpClient.Factory(handler),
        sessions,
        null)
        .add(heavy)
        .add(medium)
        .add(lightest)
        .add(massive);

    try (NewSessionPayload payload = NewSessionPayload.create(caps)) {
      Session session = distributor.newSession(createRequest(payload)).getSession();

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
        new PassthroughHttpClient.Factory(handler),
        sessions,
        null)
        .add(leastRecent);
    try (NewSessionPayload payload = NewSessionPayload.create(caps)) {
      distributor.newSession(createRequest(payload));

      // Will be "leastRecent" by default
    }

    Node middle = createNode(caps, 5, 0);
    handler.addHandler(middle);
    distributor.add(middle);
    try (NewSessionPayload payload = NewSessionPayload.create(caps)) {
      Session session = distributor.newSession(createRequest(payload)).getSession();

      // Least lightly loaded is middle
      assertThat(session.getUri()).isEqualTo(middle.getStatus().getUri());
    }

    Node mostRecent = createNode(caps, 5, 0);
    handler.addHandler(mostRecent);
    distributor.add(mostRecent);
    try (NewSessionPayload payload = NewSessionPayload.create(caps)) {
      Session session = distributor.newSession(createRequest(payload)).getSession();

      // Least lightly loaded is most recent
      assertThat(session.getUri()).isEqualTo(mostRecent.getStatus().getUri());
    }

    // All the nodes should be equally loaded.
    Map<Capabilities, Integer> expected = mostRecent.getStatus().getStereotypes();
    assertThat(leastRecent.getStatus().getStereotypes()).isEqualTo(expected);
    assertThat(middle.getStatus().getStereotypes()).isEqualTo(expected);

    // All nodes are now equally loaded. We should be going in time order now
    try (NewSessionPayload payload = NewSessionPayload.create(caps)) {
      Session session = distributor.newSession(createRequest(payload)).getSession();

      assertThat(session.getUri()).isEqualTo(leastRecent.getStatus().getUri());
    }
  }

  @Test
  public void shouldIncludeHostsThatAreUpInHostList() {
    CombinedHandler handler = new CombinedHandler();

    SessionMap sessions = new LocalSessionMap(tracer, bus);
    handler.addHandler(sessions);

    URI uri = createUri();
    Node alwaysDown = LocalNode.builder(tracer, bus, clientFactory, uri, null)
        .add(caps, new TestSessionFactory((id, c) -> new Session(id, uri, c)))
        .advanced()
        .healthCheck(() -> new HealthCheck.Result(false, "Boo!"))
        .build();
    handler.addHandler(alwaysDown);

    Node alwaysUp = LocalNode.builder(tracer, bus, clientFactory, uri, null)
        .add(caps, new TestSessionFactory((id, c) -> new Session(id, uri, c)))
        .advanced()
        .healthCheck(() -> new HealthCheck.Result(true, "Yay!"))
        .build();
    handler.addHandler(alwaysUp);

    LocalDistributor distributor = new LocalDistributor(
        tracer,
        bus,
        new PassthroughHttpClient.Factory(handler),
        sessions,
        null);
    handler.addHandler(distributor);
    distributor.add(alwaysDown);

    // Should be unable to create a session because the node is down.
    try (NewSessionPayload payload = NewSessionPayload.create(caps)) {
      assertThatExceptionOfType(SessionNotCreatedException.class)
          .isThrownBy(() -> distributor.newSession(createRequest(payload)));
    }

    distributor.add(alwaysUp);
    try (NewSessionPayload payload = NewSessionPayload.create(caps)) {
      distributor.newSession(createRequest(payload));
    }
  }

  @Test
  public void shouldNotScheduleAJobIfAllSlotsAreBeingUsed() {
    SessionMap sessions = new LocalSessionMap(tracer, bus);

    CombinedHandler handler = new CombinedHandler();
    Distributor distributor = new LocalDistributor(
        tracer,
        bus,
        new PassthroughHttpClient.Factory(handler),
        sessions,
        null);
    handler.addHandler(distributor);

    Node node = createNode(caps, 1, 0);
    handler.addHandler(node);
    distributor.add(node);

    // Use up the one slot available
    try (NewSessionPayload payload = NewSessionPayload.create(caps)) {
      distributor.newSession(createRequest(payload));
    }

    // Now try and create a session.
    try (NewSessionPayload payload = NewSessionPayload.create(caps)) {
      assertThatExceptionOfType(SessionNotCreatedException.class)
          .isThrownBy(() -> distributor.newSession(createRequest(payload)));
    }
  }

  @Test
  public void shouldReleaseSlotOnceSessionEnds() {
    SessionMap sessions = new LocalSessionMap(tracer, bus);

    CombinedHandler handler = new CombinedHandler();
    Distributor distributor = new LocalDistributor(
        tracer,
        bus,
        new PassthroughHttpClient.Factory(handler),
        sessions,
        null);
    handler.addHandler(distributor);

    Node node = createNode(caps, 1, 0);
    handler.addHandler(node);
    distributor.add(node);

    // Use up the one slot available
    Session session;
    try (NewSessionPayload payload = NewSessionPayload.create(caps)) {
       session = distributor.newSession(createRequest(payload)).getSession();
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

    wait.until(obj -> distributor.getStatus().hasCapacity());

    // And we should now be able to create another session.
    try (NewSessionPayload payload = NewSessionPayload.create(caps)) {
      distributor.newSession(createRequest(payload));
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
        new PassthroughHttpClient.Factory(handler),
        sessions,
        null);
    handler.addHandler(distributor);

    Node node = createNode(caps, 1, 0);
    handler.addHandler(node);
    distributor.add(node);

    ImmutableCapabilities unmatched = new ImmutableCapabilities("browserName", "transit of venus");
    try (NewSessionPayload payload = NewSessionPayload.create(unmatched)) {
      assertThatExceptionOfType(SessionNotCreatedException.class)
          .isThrownBy(() -> distributor.newSession(createRequest(payload)));
    }
  }

  @Test
  public void attemptingToStartASessionWhichFailsMarksAsTheSlotAsAvailable() {
    CombinedHandler handler = new CombinedHandler();

    SessionMap sessions = new LocalSessionMap(tracer, bus);
    handler.addHandler(sessions);

    URI uri = createUri();
    Node node = LocalNode.builder(tracer, bus, clientFactory, uri, null)
        .add(caps, new TestSessionFactory((id, caps) -> {
          throw new SessionNotCreatedException("OMG");
        }))
        .build();
    handler.addHandler(node);

    Distributor distributor = new LocalDistributor(
        tracer,
        bus,
        new PassthroughHttpClient.Factory(handler),
        sessions,
        null);
    handler.addHandler(distributor);
    distributor.add(node);

    try (NewSessionPayload payload = NewSessionPayload.create(caps)) {
      assertThatExceptionOfType(SessionNotCreatedException.class)
          .isThrownBy(() -> distributor.newSession(createRequest(payload)));
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
    Node node = LocalNode.builder(tracer, bus, clientFactory, uri, null)
        .add(caps, new TestSessionFactory((id, caps) -> new Session(id, uri, caps)))
        .advanced()
        .healthCheck(() -> new HealthCheck.Result(isUp.get(), "TL;DR"))
        .build();
    handler.addHandler(node);

    LocalDistributor distributor = new LocalDistributor(
        tracer,
        bus,
        new PassthroughHttpClient.Factory(handler),
        sessions,
        null);
    handler.addHandler(distributor);
    distributor.add(node);

    // Should be unable to create a session because the node is down.
    try (NewSessionPayload payload = NewSessionPayload.create(caps)) {
      assertThatExceptionOfType(SessionNotCreatedException.class)
          .isThrownBy(() -> distributor.newSession(createRequest(payload)));
    }

    // Mark the node as being up
    isUp.set(true);
    // Kick the machinery to ensure that everything is fine.
    distributor.refresh();

    // Because the node is now up and running, we should now be able to create a session
    try (NewSessionPayload payload = NewSessionPayload.create(caps)) {
      distributor.newSession(createRequest(payload));
    }
  }

  private Set<Node> createNodeSet(Distributor distributor, int count, Capabilities...capabilities) {
    Set<Node> nodeSet = new HashSet<>();
    for (int i=0; i<count; i++) {
      URI uri = createUri();
      LocalNode.Builder builder = LocalNode.builder(tracer, bus, clientFactory, uri, null);
      for (Capabilities caps: capabilities) {
        builder.add(caps, new TestSessionFactory((id, hostCaps) -> new HandledSession(uri, hostCaps)));
      }
      Node node = builder.build();
      distributor.add(node);
      nodeSet.add(node);
    }
    return nodeSet;
  }

  @Test
  public void shouldPrioritizeHostsWithTheMostSlotsAvailableForASessionType() {
    //SS: Consider the case where you have 1 Windows machine and 5 linux machines. All of these hosts
    // can run Chrome and Firefox sessions, but only one can run Edge sessions. Ideally, the machine
    // able to run Edge would be sorted last.

    //Create the Distributor
    CombinedHandler handler = new CombinedHandler();
    SessionMap sessions = new LocalSessionMap(tracer, bus);
    handler.addHandler(sessions);

    LocalDistributor distributor = new LocalDistributor(
        tracer,
        bus,
        new PassthroughHttpClient.Factory(handler),
        sessions,
        null);
    handler.addHandler(distributor);

    //Create all three Capability types
    Capabilities edgeCapabilities = new ImmutableCapabilities("browserName", "edge");
    Capabilities firefoxCapabilities = new ImmutableCapabilities("browserName", "firefox");
    Capabilities chromeCapabilities = new ImmutableCapabilities("browserName", "chrome");

    //TODO This should probably be a map of browser -> all nodes that support <browser>
    //Store our "expected results" sets for the various browser-specific nodes
    Set<Node> edgeNodes = createNodeSet(distributor, 3, edgeCapabilities, chromeCapabilities, firefoxCapabilities);

    //chromeNodes is all these new nodes PLUS all the Edge nodes from before
    Set<Node> chromeNodes = createNodeSet(distributor,5, chromeCapabilities, firefoxCapabilities);
    chromeNodes.addAll(edgeNodes);

    //all nodes support firefox, so add them to the firefoxNodes set
    Set<Node> firefoxNodes = createNodeSet(distributor,3, firefoxCapabilities);
    firefoxNodes.addAll(edgeNodes);
    firefoxNodes.addAll(chromeNodes);

    //Assign 5 Chrome and 5 Firefox sessions to the distributor, make sure they don't go to the Edge node
    for (int i=0; i<5; i++) {
      try (NewSessionPayload chromePayload = NewSessionPayload.create(chromeCapabilities);
           NewSessionPayload firefoxPayload = NewSessionPayload.create(firefoxCapabilities)) {

        Session chromeSession = distributor.newSession(createRequest(chromePayload)).getSession();

        assertThat( //Ensure the Uri of the Session matches one of the Chrome Nodes, not the Edge Node
                chromeSession.getUri()).isIn(
                chromeNodes
                    .stream().map(Node::getStatus).collect(Collectors.toList())     //List of getStatus() from the Set
                    .stream().map(NodeStatus::getUri).collect(Collectors.toList())  //List of getUri() from the Set
        );

        Session firefoxSession = distributor.newSession(createRequest(firefoxPayload)).getSession();
        LOG.info(String.format("Firefox Session %d assigned to %s", i, chromeSession.getUri()));

        boolean inFirefoxNodes = firefoxNodes.stream().anyMatch(node -> node.getUri().equals(firefoxSession.getUri()));
        boolean inChromeNodes = chromeNodes.stream().anyMatch(node -> node.getUri().equals(chromeSession.getUri()));
        //This could be either, or, or both
        assertTrue(inFirefoxNodes || inChromeNodes);
      }
    }

    //The Chrome Nodes should be full at this point, but Firefox isn't... so send an Edge session and make sure it routes to an Edge node
    try (NewSessionPayload edgePayload = NewSessionPayload.create(edgeCapabilities)) {
      Session edgeSession = distributor.newSession(createRequest(edgePayload)).getSession();

      assertTrue(edgeNodes.stream().anyMatch(node -> node.getUri().equals(edgeSession.getUri())));
    }
  }

  private Node createNode(Capabilities stereotype, int count, int currentLoad) {
    URI uri = createUri();
    LocalNode.Builder builder = LocalNode.builder(tracer, bus, clientFactory, uri, null);
    for (int i = 0; i < count; i++) {
      builder.add(stereotype, new TestSessionFactory((id, caps) -> new HandledSession(uri, caps)));
    }

    LocalNode node = builder.build();
    for (int i = 0; i < currentLoad; i++) {
      // Ignore the session. We're just creating load.
      node.newSession(new CreateSessionRequest(
          ImmutableSet.copyOf(Dialect.values()),
          stereotype,
          ImmutableMap.of()));
    }

    return node;
  }

  @Test
  @Ignore
  public void shouldCorrectlySetSessionCountsWhenStartedAfterNodeWithSession() {
    fail("write me!");
  }

  @Test
  public void statusShouldIndicateThatDistributorIsNotAvailableIfNodesAreDown()
      throws URISyntaxException {
    Capabilities capabilities = new ImmutableCapabilities("cheese", "peas");
    URI uri = new URI("http://example.com");

    Node node = LocalNode.builder(tracer, bus, clientFactory, uri, null)
        .add(capabilities, new TestSessionFactory((id, caps) -> new Session(id, uri, caps)))
        .advanced()
        .healthCheck(() -> new HealthCheck.Result(false, "TL;DR"))
        .build();

    local.add(node);

    DistributorStatus status = local.getStatus();
    assertFalse(status.hasCapacity());
  }

  private HttpRequest createRequest(NewSessionPayload payload) {
    StringBuilder builder = new StringBuilder();
    try {
      payload.writeTo(builder);
    } catch (IOException e) {
      throw new UncheckedIOException(e);
    }

    HttpRequest request = new HttpRequest(POST, "/se/grid/distributor/session");
    request.setContent(utf8String(builder.toString()));

    return request;
  }

  private URI createUri() {
    try {
      return new URI("http://localhost:" + PortProber.findFreePort());
    } catch (URISyntaxException e) {
      throw new RuntimeException(e);
    }
  }

  class HandledSession extends Session implements HttpHandler {

    HandledSession(URI uri, Capabilities caps) {
      super(new SessionId(UUID.randomUUID()), uri, caps);
    }

    @Override
    public HttpResponse execute(HttpRequest req) throws UncheckedIOException {
      // no-op
      return new HttpResponse();
    }
  }

}
