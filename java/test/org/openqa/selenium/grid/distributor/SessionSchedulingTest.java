package org.openqa.selenium.grid.distributor;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.openqa.selenium.grid.data.Availability.UP;

import java.net.URI;
import java.time.Duration;
import java.time.Instant;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;
import org.junit.jupiter.api.Test;
import org.openqa.selenium.Capabilities;
import org.openqa.selenium.ImmutableCapabilities;
import org.openqa.selenium.SessionNotCreatedException;
import org.openqa.selenium.grid.data.CreateSessionResponse;
import org.openqa.selenium.grid.data.DefaultSlotMatcher;
import org.openqa.selenium.grid.data.NodeStatus;
import org.openqa.selenium.grid.data.Session;
import org.openqa.selenium.grid.data.Slot;
import org.openqa.selenium.grid.distributor.local.LocalDistributor;
import org.openqa.selenium.grid.distributor.selector.DefaultSlotSelector;
import org.openqa.selenium.grid.node.Node;
import org.openqa.selenium.grid.node.local.LocalNode;
import org.openqa.selenium.grid.sessionmap.SessionMap;
import org.openqa.selenium.grid.sessionmap.local.LocalSessionMap;
import org.openqa.selenium.grid.sessionqueue.NewSessionQueue;
import org.openqa.selenium.grid.sessionqueue.local.LocalNewSessionQueue;
import org.openqa.selenium.grid.testing.PassthroughHttpClient;
import org.openqa.selenium.grid.testing.TestSessionFactory;
import org.openqa.selenium.grid.web.CombinedHandler;
import org.openqa.selenium.internal.Either;

public class SessionSchedulingTest extends DistributorTestBase {

  @Test
  void theMostLightlyLoadedNodeIsSelectedFirst() {
    // Create enough hosts so that we avoid the scheduler returning hosts in:
    // * insertion order
    // * reverse insertion order
    // * sorted with most heavily used first
    SessionMap sessions = new LocalSessionMap(tracer, bus);
    NewSessionQueue queue =
        new LocalNewSessionQueue(
            tracer,
            new DefaultSlotMatcher(),
            Duration.ofSeconds(2),
            Duration.ofSeconds(2),
            registrationSecret,
            5);

    Node lightest = createNode(caps, 10, 0);
    Node medium = createNode(caps, 10, 4);
    Node heavy = createNode(caps, 10, 6);
    Node massive = createNode(caps, 10, 8);

    CombinedHandler handler = new CombinedHandler();
    handler.addHandler(lightest);
    handler.addHandler(medium);
    handler.addHandler(heavy);
    handler.addHandler(massive);
    local =
        new LocalDistributor(
                tracer,
                bus,
                new PassthroughHttpClient.Factory(handler),
                sessions,
                queue,
                new DefaultSlotSelector(),
                registrationSecret,
                Duration.ofMinutes(5),
                false,
                Duration.ofSeconds(5),
                newSessionThreadPoolSize,
                new DefaultSlotMatcher())
            .add(heavy)
            .add(medium)
            .add(lightest)
            .add(massive);

    wait.until(obj -> local.getStatus().getNodes().size() == 4);
    wait.until(
        ignored ->
            local.getStatus().getNodes().stream()
                .allMatch(node -> node.getAvailability() == UP && node.hasCapacity()));
    wait.until(obj -> local.getStatus().hasCapacity());

    Either<SessionNotCreatedException, CreateSessionResponse> result =
        local.newSession(createRequest(caps));
    assertThatEither(result).isRight();
    Session session = result.right().getSession();
    assertThat(session.getUri()).isEqualTo(lightest.getStatus().getExternalUri());
  }

  @Test
  void shouldUseLastSessionCreatedTimeAsTieBreaker() {
    SessionMap sessions = new LocalSessionMap(tracer, bus);
    NewSessionQueue queue =
        new LocalNewSessionQueue(
            tracer,
            new DefaultSlotMatcher(),
            Duration.ofSeconds(2),
            Duration.ofSeconds(2),
            registrationSecret,
            5);
    Node leastRecent = createNode(caps, 5, 0);

    CombinedHandler handler = new CombinedHandler();
    handler.addHandler(sessions);
    handler.addHandler(leastRecent);

    local =
        new LocalDistributor(
                tracer,
                bus,
                new PassthroughHttpClient.Factory(handler),
                sessions,
                queue,
                new DefaultSlotSelector(),
                registrationSecret,
                Duration.ofMinutes(5),
                false,
                Duration.ofSeconds(5),
                newSessionThreadPoolSize,
                new DefaultSlotMatcher())
            .add(leastRecent);
    waitToHaveCapacity(local);

    local.newSession(createRequest(caps));

    Node middle = createNode(caps, 5, 0);
    handler.addHandler(middle);
    local.add(middle);
    waitForAllNodesToHaveCapacity(local, 2);

    Either<SessionNotCreatedException, CreateSessionResponse> result =
        local.newSession(createRequest(caps));
    assertThatEither(result).isRight();
    Session session = result.right().getSession();
    // Least lightly loaded is middle
    assertThat(session.getUri()).isEqualTo(middle.getStatus().getExternalUri());

    Node mostRecent = createNode(caps, 5, 0);
    handler.addHandler(mostRecent);
    local.add(mostRecent);
    waitForAllNodesToHaveCapacity(local, 3);

    result = local.newSession(createRequest(caps));
    assertThatEither(result).isRight();
    session = result.right().getSession();
    // Least lightly loaded is most recent
    assertThat(session.getUri()).isEqualTo(mostRecent.getStatus().getExternalUri());

    // All the nodes should be equally loaded.
    Map<Capabilities, Integer> expected = getFreeStereotypeCounts(mostRecent.getStatus());
    assertThat(getFreeStereotypeCounts(leastRecent.getStatus())).isEqualTo(expected);
    assertThat(getFreeStereotypeCounts(middle.getStatus())).isEqualTo(expected);

    // All nodes are now equally loaded. We should be going in time order now
    result = local.newSession(createRequest(caps));
    assertThatEither(result).isRight();
    session = result.right().getSession();
    assertThat(session.getUri()).isEqualTo(leastRecent.getStatus().getExternalUri());
  }

  @Test
  void shouldNotScheduleAJobIfAllSlotsAreBeingUsed() {
    SessionMap sessions = new LocalSessionMap(tracer, bus);
    NewSessionQueue queue =
        new LocalNewSessionQueue(
            tracer,
            new DefaultSlotMatcher(),
            Duration.ofSeconds(2),
            Duration.ofSeconds(2),
            registrationSecret,
            5);

    LocalNode node =
        LocalNode.builder(tracer, bus, routableUri, routableUri, registrationSecret)
            .add(
                caps,
                new TestSessionFactory(
                    (id, c) -> new Session(id, nodeUri, stereotype, c, Instant.now())))
            .build();
    local =
        new LocalDistributor(
            tracer,
            bus,
            new PassthroughHttpClient.Factory(node),
            sessions,
            queue,
            new DefaultSlotSelector(),
            registrationSecret,
            Duration.ofMinutes(5),
            false,
            Duration.ofSeconds(5),
            newSessionThreadPoolSize,
            new DefaultSlotMatcher());

    local.add(node);
    waitToHaveCapacity(local);

    // Use up the one slot available
    Either<SessionNotCreatedException, CreateSessionResponse> result =
        local.newSession(createRequest(caps));
    assertThatEither(result).isRight();

    // Now try and create a session.
    result = local.newSession(createRequest(caps));
    assertThatEither(result).isLeft();
  }

  @Test
  void shouldPrioritizeHostsWithTheMostSlotsAvailableForASessionType() {
    // Consider the case where you have 1 Windows machine and 5 linux machines. All of these hosts
    // can run Chrome and Firefox sessions, but only one can run Edge sessions. Ideally, the machine
    // able to run Edge would be sorted last.

    // Create the Distributor
    CombinedHandler handler = new CombinedHandler();
    SessionMap sessions = new LocalSessionMap(tracer, bus);
    handler.addHandler(sessions);

    NewSessionQueue queue =
        new LocalNewSessionQueue(
            tracer,
            new DefaultSlotMatcher(),
            Duration.ofSeconds(2),
            Duration.ofSeconds(2),
            registrationSecret,
            5);

    local =
        new LocalDistributor(
            tracer,
            bus,
            new PassthroughHttpClient.Factory(handler),
            sessions,
            queue,
            new DefaultSlotSelector(),
            registrationSecret,
            Duration.ofMinutes(5),
            false,
            Duration.ofSeconds(5),
            newSessionThreadPoolSize,
            new DefaultSlotMatcher());

    // Create all three Capability types
    Capabilities edge = new ImmutableCapabilities("browserName", "edge");
    Capabilities firefox = new ImmutableCapabilities("browserName", "firefox");
    Capabilities chrome = new ImmutableCapabilities("browserName", "chrome");

    // Store our "expected results" sets for the various browser-specific nodes
    Set<Node> edgeNodes = createNodeSet(handler, local, 3, edge, chrome, firefox);

    // chromeNodes is all these new nodes PLUS all the Edge nodes from before
    Set<Node> chromeNodes = createNodeSet(handler, local, 5, chrome, firefox);
    chromeNodes.addAll(edgeNodes);

    // all nodes support firefox, so add them to the firefoxNodes set
    Set<Node> firefoxNodes = createNodeSet(handler, local, 3, firefox);
    firefoxNodes.addAll(edgeNodes);
    firefoxNodes.addAll(chromeNodes);

    waitForAllNodesToHaveCapacity(local, 11);

    // Assign 5 Chrome and 5 Firefox sessions to the distributor, make sure they don't go to the
    // Edge node
    for (int i = 0; i < 5; i++) {
      Either<SessionNotCreatedException, CreateSessionResponse> chromeResult =
          local.newSession(createRequest(chrome));
      assertThatEither(chromeResult).isRight();
      Session chromeSession = chromeResult.right().getSession();

      // Ensure the Uri of the Session matches one of the Chrome Nodes, not the Edge Node
      assertThat(chromeSession.getUri())
          .isIn(
              chromeNodes.stream()
                  .map(Node::getStatus)
                  .collect(Collectors.toList()) // List of getStatus() from the Set
                  .stream()
                  .map(NodeStatus::getExternalUri)
                  .collect(Collectors.toList()) // List of getUri() from the Set
              );

      Either<SessionNotCreatedException, CreateSessionResponse> firefoxResult =
          local.newSession(createRequest(firefox));
      assertThatEither(firefoxResult).isRight();
      Session firefoxSession = firefoxResult.right().getSession();
      LOG.info(String.format("Firefox Session %d assigned to %s", i, chromeSession.getUri()));

      boolean inFirefoxNodes =
          firefoxNodes.stream().anyMatch(node -> node.getUri().equals(firefoxSession.getUri()));
      boolean inChromeNodes =
          chromeNodes.stream().anyMatch(node -> node.getUri().equals(chromeSession.getUri()));
      // This could be either, or, or both
      assertTrue(inFirefoxNodes || inChromeNodes);
    }

    // The Chrome Nodes should be full at this point, but Firefox isn't... so send an Edge session
    // and make sure it routes to an Edge node
    Either<SessionNotCreatedException, CreateSessionResponse> edgeResult =
        local.newSession(createRequest(edge));
    assertThatEither(edgeResult).isRight();
    Session edgeSession = edgeResult.right().getSession();
    assertTrue(edgeNodes.stream().anyMatch(node -> node.getUri().equals(edgeSession.getUri())));
  }

  private Set<Node> createNodeSet(
      CombinedHandler handler, Distributor distributor, int count, Capabilities... capabilities) {
    Set<Node> nodeSet = new HashSet<>();
    for (int i = 0; i < count; i++) {
      URI uri = createUri();
      LocalNode.Builder builder = LocalNode.builder(tracer, bus, uri, uri, registrationSecret);
      for (Capabilities caps : capabilities) {
        builder.add(
            caps, new TestSessionFactory((id, hostCaps) -> new HandledSession(uri, hostCaps)));
      }
      Node node = builder.build();
      handler.addHandler(node);
      distributor.add(node);
      nodeSet.add(node);
    }
    return nodeSet;
  }

  private Map<Capabilities, Integer> getFreeStereotypeCounts(NodeStatus status) {
    Map<Capabilities, Integer> toReturn = new HashMap<>();
    for (Slot slot : status.getSlots()) {
      int count = toReturn.getOrDefault(slot.getStereotype(), 0);
      count++;
      toReturn.put(slot.getStereotype(), count);
    }
    return toReturn;
  }
}
